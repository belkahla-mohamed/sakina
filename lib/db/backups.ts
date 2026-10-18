import "server-only";
import { q, q1, withTx } from "./pool";
import type { PoolClient } from "pg";

export type BackupKind = "manual" | "auto" | "prerestore";

/** List row — metadata only, never the (potentially huge) `data` payload. */
export interface BackupRow {
  id: number;
  kind: BackupKind;
  note: string | null;
  products_count: number;
  categories_count: number;
  orders_count: number;
  reviews_count: number;
  settings_count: number;
  size_bytes: number;
  created_at: string;
}

export interface BackupSnapshot {
  version: 1;
  created_at: string;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  orders: (Record<string, unknown> & { items: Record<string, unknown>[] })[];
  reviews: Record<string, unknown>[];
  settings: { key: string; value: string }[];
}

const KEEP = 30;
const AUTO_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const META_COLS =
  "id, kind, note, products_count, categories_count, orders_count, reviews_count, settings_count, size_bytes, created_at";

/* ---------------- Reads ---------------- */

export async function dbAdminBackups(): Promise<BackupRow[]> {
  return q<BackupRow>(
    `select ${META_COLS} from public.backups order by created_at desc limit ${KEEP}`
  );
}

export async function dbGetBackupData(id: number): Promise<{
  data: BackupSnapshot;
  created_at: string;
} | null> {
  return q1<{ data: BackupSnapshot; created_at: string }>(
    "select data, created_at from public.backups where id = $1",
    [id]
  );
}

/* ---------------- Snapshot capture ---------------- */

async function captureSnapshot(client: PoolClient): Promise<BackupSnapshot> {
  // pg clients execute one query at a time; issuing concurrent queries on a
  // single client is deprecated (warning in pg ≥8.x, removed in 9.0). Keep
  // the reads sequential — we're inside a transaction and want a consistent
  // snapshot anyway.
  const products = await client.query("select * from public.products");
  const categories = await client.query("select * from public.categories");
  const orders = await client.query("select * from public.orders");
  const orderItems = await client.query("select * from public.order_items");
  const reviews = await client.query("select * from public.reviews");
  const settings = await client.query("select key, value from public.settings");

  const itemsByOrder = new Map<number, Record<string, unknown>[]>();
  for (const it of orderItems.rows) {
    const oid = Number((it as { order_id: number }).order_id);
    const arr = itemsByOrder.get(oid) ?? [];
    arr.push(it);
    itemsByOrder.set(oid, arr);
  }

  return {
    version: 1,
    created_at: new Date().toISOString(),
    products: products.rows,
    categories: categories.rows,
    orders: orders.rows.map((o) => ({
      ...o,
      items: itemsByOrder.get(Number((o as { id: number }).id)) ?? [],
    })),
    reviews: reviews.rows,
    settings: settings.rows as { key: string; value: string }[],
  };
}

/* ---------------- Create ---------------- */

/**
 * Snapshot products, categories, orders (+items), reviews and settings.
 * admin_users / admin_sessions are deliberately excluded: a downloadable
 * backup must never contain password hashes or session tokens.
 */
export async function dbCreateBackup(
  kind: BackupKind,
  note?: string
): Promise<BackupRow | null> {
  return withTx(async (client) => {
    const snap = await captureSnapshot(client);
    const size = Buffer.byteLength(JSON.stringify(snap), "utf8");
    const res = await client.query(
      `insert into public.backups
         (kind, note, products_count, categories_count, orders_count,
          reviews_count, settings_count, size_bytes, data)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       returning ${META_COLS}`,
      [
        kind,
        note ?? null,
        snap.products.length,
        snap.categories.length,
        snap.orders.length,
        snap.reviews.length,
        snap.settings.length,
        size,
        JSON.stringify(snap),
      ]
    );
    // Keep only the newest KEEP rows.
    await client.query(
      `delete from public.backups where id in (
         select id from public.backups order by created_at desc offset $1
       )`,
      [KEEP]
    );
    return res.rows[0] as BackupRow;
  });
}

/**
 * Lazy auto-backup: called on the backups page load. Creates one if none
 * exists yet, or if the newest is older than 24h. Failures are swallowed —
 * a broken auto-backup must never block the admin panel.
 */
export async function dbEnsureFreshBackup(): Promise<void> {
  try {
    const latest = await q1<{ created_at: string }>(
      "select created_at from public.backups order by created_at desc limit 1"
    );
    if (latest) {
      const age = Date.now() - new Date(latest.created_at).getTime();
      if (age < AUTO_MAX_AGE_MS) return;
    }
    await dbCreateBackup("auto");
  } catch (e) {
    console.error("[backups] auto-backup skipped:", e);
  }
}

/* ---------------- Restore ---------------- */

/**
 * Replace catalog + orders + reviews + settings with a snapshot, inside one
 * transaction. Ids are preserved (OVERRIDING SYSTEM VALUE) so order_items
 * keep pointing at the right orders; sequences are realigned afterwards.
 */
export async function dbRestoreBackup(id: number): Promise<boolean> {
  const row = await q1<{ data: BackupSnapshot }>(
    "select data from public.backups where id = $1",
    [id]
  );
  if (!row) return false;
  const snap = row.data;
  if (!snap || snap.version !== 1 || !Array.isArray(snap.products)) {
    throw new Error("backup snapshot is malformed");
  }

  await withTx(async (client) => {
    await client.query("delete from public.order_items");
    await client.query("delete from public.orders");
    await client.query("delete from public.reviews");
    await client.query("delete from public.products");
    await client.query("delete from public.categories");
    await client.query("delete from public.settings");

    for (const c of snap.categories ?? []) {
      await client.query(
        `insert into public.categories
           (slug, name_fr, name_ar, tagline_fr, tagline_ar, color, text, icon, image, featured)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          c.slug,
          c.name_fr,
          c.name_ar,
          c.tagline_fr ?? null,
          c.tagline_ar ?? null,
          c.color ?? "#FF6B9D",
          c.text ?? "light",
          c.icon ?? "gift",
          c.image ?? null,
          c.featured ?? false,
        ]
      );
    }

    for (const p of snap.products ?? []) {
      await client.query(
        `insert into public.products
           (slug, name_fr, name_ar, category, price, old_price, badge, rating,
            reviews, stock, is_new, is_bestseller, desc_fr, desc_ar, image, images, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          p.slug,
          p.name_fr,
          p.name_ar,
          p.category,
          p.price,
          p.old_price ?? null,
          p.badge ?? null,
          p.rating ?? 5,
          p.reviews ?? 0,
          p.stock ?? 0,
          p.is_new ?? false,
          p.is_bestseller ?? false,
          p.desc_fr ?? null,
          p.desc_ar ?? null,
          p.image ?? null,
          Array.isArray(p.images) && p.images.length > 0 ? p.images : null,
          p.created_at ?? new Date(),
        ]
      );
    }

    for (const o of snap.orders ?? []) {
      await client.query(
        `insert into public.orders
           (id, reference, customer_name, customer_phone, customer_city,
            customer_address, subtotal, shipping, total, status, note, created_at)
         OVERRIDING SYSTEM VALUE
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          o.id,
          o.reference,
          o.customer_name,
          o.customer_phone,
          o.customer_city,
          o.customer_address,
          o.subtotal,
          o.shipping,
          o.total,
          o.status ?? "nouvelle",
          o.note ?? null,
          o.created_at ?? new Date(),
        ]
      );
      for (const it of o.items ?? []) {
        await client.query(
          `insert into public.order_items
             (order_id, slug, name_fr, name_ar, price, qty)
           values ($1,$2,$3,$4,$5,$6)`,
          [o.id, it.slug, it.name_fr, it.name_ar, it.price, it.qty]
        );
      }
    }

    for (const r of snap.reviews ?? []) {
      await client.query(
        `insert into public.reviews
           (id, name, city, rating, text, status, created_at)
         OVERRIDING SYSTEM VALUE
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          r.id,
          r.name,
          r.city ?? null,
          r.rating,
          r.text,
          r.status ?? "pending",
          r.created_at ?? new Date(),
        ]
      );
    }

    for (const s of snap.settings ?? []) {
      await client.query(
        `insert into public.settings (key, value, updated_at) values ($1,$2,now())`,
        [s.key, s.value]
      );
    }

    // Realign identity sequences past the restored ids.
    await client.query(
      `select setval(pg_get_serial_sequence('public.orders', 'id'),
                      coalesce((select max(id) from public.orders), 0) + 1, false)`
    );
    await client.query(
      `select setval(pg_get_serial_sequence('public.order_items', 'id'),
                      coalesce((select max(id) from public.order_items), 0) + 1, false)`
    );
    await client.query(
      `select setval(pg_get_serial_sequence('public.reviews', 'id'),
                      coalesce((select max(id) from public.reviews), 0) + 1, false)`
    );
  });
  return true;
}

/* ---------------- Delete ---------------- */

export async function dbDeleteBackup(id: number): Promise<boolean> {
  const rows = await q<{ one: number }>(
    "delete from public.backups where id = $1 returning 1",
    [id]
  );
  return rows.length > 0;
}
