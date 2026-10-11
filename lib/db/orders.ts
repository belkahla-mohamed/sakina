import "server-only";
import { randomBytes } from "node:crypto";
import { q, q1, withTx } from "./pool";
import type { PoolClient } from "pg";

export type OrderStatus = "nouvelle" | "en_cours" | "livree" | "annulee";

export const ORDER_STATUSES: OrderStatus[] = [
  "nouvelle",
  "en_cours",
  "livree",
  "annulee",
];

export interface OrderItemRow {
  id: number;
  order_id: number;
  slug: string;
  name_fr: string;
  name_ar: string;
  price: number;
  qty: number;
}

export interface OrderRow {
  id: number;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  items?: OrderItemRow[];
}

export interface CreateOrderInput {
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
  };
  items: { slug: string; name_fr: string; name_ar: string; price: number; qty: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}

function makeReference(): string {
  return `SK-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function dbCreateOrder(input: CreateOrderInput): Promise<string> {
  return withTx(async (client: PoolClient) => {
    let reference = makeReference();
    // avoid collision (extremely unlikely, but cheap to guard)
    for (let i = 0; i < 5; i++) {
      const dup = await client.query(
        "select 1 from public.orders where reference = $1",
        [reference]
      );
      if (dup.rowCount === 0) break;
      reference = makeReference();
    }

    const inserted = await client.query(
      `insert into public.orders
        (reference, customer_name, customer_phone, customer_city, customer_address,
         subtotal, shipping, total)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning id`,
      [
        reference,
        input.customer.name,
        input.customer.phone,
        input.customer.city,
        input.customer.address,
        input.subtotal,
        input.shipping,
        input.total,
      ]
    );
    const orderId = inserted.rows[0].id as number;

    for (const item of input.items) {
      await client.query(
        `insert into public.order_items (order_id, slug, name_fr, name_ar, price, qty)
         values ($1,$2,$3,$4,$5,$6)`,
        [orderId, item.slug, item.name_fr, item.name_ar, item.price, item.qty]
      );
      // Decrement stock in the same transaction; never go below zero.
      await client.query(
        `update public.products set stock = greatest(stock - $1, 0) where slug = $2`,
        [item.qty, item.slug]
      );
    }

    return reference;
  });
}

/* ---------------- Admin reads ---------------- */

export async function dbAdminOrders(): Promise<OrderRow[]> {
  const orders = await q<OrderRow>(
    `select * from public.orders order by created_at desc limit 500`
  );
  if (orders.length === 0) return orders;
  const ids = orders.map((o) => o.id);
  const items = await q<OrderItemRow>(
    `select * from public.order_items where order_id = any($1::bigint[]) order by id`,
    [ids]
  );
  const byOrder = new Map<number, OrderItemRow[]>();
  for (const it of items) {
    const arr = byOrder.get(it.order_id) ?? [];
    arr.push(it);
    byOrder.set(it.order_id, arr);
  }
  return orders.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  revenue: number;
  today: number;
}

export async function dbOrderStats(): Promise<OrderStats> {
  const row = await q1<{
    total_orders: string;
    pending: string;
    revenue: string;
    today: string;
  }>(
    `select
       count(*) as total_orders,
       count(*) filter (where status = 'nouvelle') as pending,
       coalesce(sum(total) filter (where status <> 'annulee'), 0) as revenue,
       count(*) filter (where created_at::date = now()::date) as today
     from public.orders`
  );
  return {
    totalOrders: Number(row?.total_orders ?? 0),
    pending: Number(row?.pending ?? 0),
    revenue: Number(row?.revenue ?? 0),
    today: Number(row?.today ?? 0),
  };
}

export async function dbUpdateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<void> {
  await q("update public.orders set status = $1 where id = $2", [status, id]);
}

export async function dbUpdateOrderNote(
  id: number,
  note: string | null
): Promise<void> {
  await q("update public.orders set note = $1 where id = $2", [note, id]);
}
