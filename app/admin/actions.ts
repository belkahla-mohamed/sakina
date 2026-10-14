"use server";

import { redirect } from "next/navigation";
import { updateTag, revalidatePath } from "next/cache";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { adminT } from "@/lib/admin-lang";
import { destroySession } from "@/lib/auth/session";
import { ADMIN_LOGIN_PATH } from "@/lib/auth";
import { actionState } from "@/lib/admin-errors";
import { setFlash } from "@/lib/admin-flash";
import {
  dbInsertProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbDeleteProducts,
  dbUpsertCategory,
  dbDeleteCategory,
  dbDeleteCategories,
  type ProductInput,
} from "@/lib/db/store";
import { dbUpdateOrderStatus, dbUpdateOrderNote, dbDeleteOrders, type OrderStatus } from "@/lib/db/orders";
import { dbSetReviewStatus, dbDeleteReview, dbDeleteReviews, type ReviewStatus } from "@/lib/db/reviews";
import { dbUpsertSetting } from "@/lib/db/settings";
import {
  dbCreateBackup,
  dbDeleteBackup,
  dbRestoreBackup,
} from "@/lib/db/backups";
import { q, q1 } from "@/lib/db/pool";

/**
 * Result handed back to `useActionState`.
 *
 * `error`/`ok` are always plain French written for a shop manager, never a
 * driver message — see `lib/admin-errors.ts`. `solution` is the next step.
 */
export interface ActionState {
  error?: string;
  solution?: string;
  ok?: string;
  okSolution?: string;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(str(v));
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Re-tag public reads after a catalog/settings write so admin sees it now. */
function revalidateStore() {
  updateTag("products");
  updateTag("categories");
  updateTag("settings");
  revalidatePath("/", "layout");
}

/* ---------------- Profile ---------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateProfileEmail(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  const t = await adminT();
  const email = str(fd.get("email")).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return {
      error: t("admin.msg.emailInvalid"),
      solution: t("admin.msg.emailInvalidSol"),
    };
  }
  if (email === admin.email.toLowerCase()) {
    return {
      ok: t("admin.msg.emailSame"),
      okSolution: t("admin.msg.emailSameSol"),
    };
  }
  try {
    await q("update public.admin_users set email = $1 where id = $2", [
      email,
      admin.id,
    ]);
  } catch (e) {
    if ((e as { code?: string })?.code === "23505") {
      return {
        error: t("admin.msg.emailTaken"),
        solution: t("admin.msg.emailTakenSol"),
      };
    }
    return actionState(e, t.lang);
  }
  revalidatePath("/admin", "layout");
  return {
    ok: t("admin.msg.emailUpdated"),
    okSolution: t("admin.msg.emailUpdatedSol"),
  };
}

export async function updateProfilePassword(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  const t = await adminT();
  const current = str(fd.get("current_password"));
  const next = str(fd.get("new_password"));
  const confirm = str(fd.get("new_password_confirm"));
  if (!current || !next || !confirm) {
    return {
      error: t("admin.msg.passFill"),
      solution: t("admin.msg.passFillSol"),
    };
  }
  if (next.length < 8) {
    return {
      error: t("admin.msg.passShort"),
      solution: t("admin.msg.passShortSol"),
    };
  }
  if (next !== confirm) {
    return {
      error: t("admin.msg.passMismatch"),
      solution: t("admin.msg.passMismatchSol"),
    };
  }
  try {
    const row = await q1<{ password_hash: string }>(
      "select password_hash from public.admin_users where id = $1",
      [admin.id]
    );
    if (!row || !(await verifyPassword(current, row.password_hash))) {
      return {
        error: t("admin.msg.passWrong"),
        solution: t("admin.msg.passWrongSol"),
      };
    }
    await q("update public.admin_users set password_hash = $1 where id = $2", [
      await hashPassword(next),
      admin.id,
    ]);
  } catch (e) {
    return actionState(e, t.lang);
  }
  return {
    ok: t("admin.msg.passUpdated"),
    okSolution: t("admin.msg.passUpdatedSol"),
  };
}

/* ---------------- Session ---------------- */

export async function logout(): Promise<void> {
  await requireAdmin();
  await destroySession();
  redirect(ADMIN_LOGIN_PATH);
}

/* ---------------- Products ---------------- */

function parseProductForm(fd: FormData): { input: ProductInput; isNew: boolean } {
  const existing = str(fd.get("existing_slug"));
  const nameFr = str(fd.get("name_fr"));
  // Prefer the hidden `existing_slug` marker: browsers omit `disabled` inputs
  // from FormData, so the visible slug field is empty on every edit. Falling
  // back to slugify(name_fr) would regenerate a different slug for12 of the
  // seeded products and the UPDATE would silently match zero rows.
  const slug = existing || str(fd.get("slug")) || slugify(nameFr);
  const badge = str(fd.get("badge"));
  const oldPriceRaw = str(fd.get("old_price"));

  const input: ProductInput = {
    slug,
    name_fr: nameFr,
    name_ar: str(fd.get("name_ar")),
    category: str(fd.get("category")),
    price: num(fd.get("price")),
    old_price: oldPriceRaw === "" ? null : Number(oldPriceRaw),
    badge: badge === "" ? null : badge,
    rating: num(fd.get("rating"), 5),
    reviews: num(fd.get("reviews"), 0),
    stock: num(fd.get("stock"), 0),
    is_new: bool(fd.get("is_new")),
    is_bestseller: bool(fd.get("is_bestseller")),
    desc_fr: str(fd.get("desc_fr")),
    desc_ar: str(fd.get("desc_ar")),
    image: str(fd.get("image")) || null,
  };
  return { input, isNew: !existing };
}

export async function saveProduct(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();

  const { input, isNew } = parseProductForm(fd);

  if (!input.name_fr || !input.name_ar || !input.category) {
    return {
      error: t("admin.msg.productMissing"),
      solution: t("admin.msg.productMissingSol"),
    };
  }
  if (!input.slug) {
    return {
      error: t("admin.msg.slugEmpty"),
      solution: t("admin.msg.slugEmptySol"),
    };
  }
  if (input.price < 0) {
    return {
      error: t("admin.msg.priceNeg"),
      solution: t("admin.msg.priceNegSol"),
    };
  }
  if (input.badge && !["nouveau", "promo", "epuise"].includes(input.badge)) {
    return {
      error: t("admin.msg.badgeBad"),
      solution: t("admin.msg.badgeBadSol"),
    };
  }

  try {
    if (isNew) {
      const dup = await import("@/lib/db/pool").then((m) =>
        m.q1("select 1 from public.products where slug = $1", [input.slug])
      );
      if (dup) {
        return {
          error: t("admin.msg.dupSlug").replace("{n}", input.slug),
          solution: t("admin.msg.dupSlugSol"),
        };
      }
      await dbInsertProduct(input);
    } else {
      const updated = await dbUpdateProduct(input.slug, input);
      if (!updated) {
        return {
          error: t("admin.msg.productGone"),
          solution: t("admin.msg.productGoneSol"),
        };
      }
    }
  } catch (e) {
    return actionState(e, t.lang);
  }

  revalidateStore();
  await setFlash({
    kind: "success",
    title: t("admin.msg.productSaved"),
    solution: t("admin.msg.savedInShop").replace("{n}", input.name_fr),
  });
  redirect("/admin/produits");
}

export async function deleteProduct(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const slug = str(fd.get("slug"));
  if (!slug) {
    return { error: t("admin.msg.notFoundProduct"), solution: t("admin.msg.refresh") };
  }
  try {
    await dbDeleteProduct(slug);
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidateStore();
  return { ok: t("admin.msg.productDeleted"), okSolution: t("admin.msg.productDeletedSol") };
}

export async function deleteProducts(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const slugs = fd
    .getAll("slugs")
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (slugs.length === 0) {
    return { error: t("admin.msg.bulkEmpty"), solution: t("admin.msg.bulkEmptySol") };
  }
  try {
    const n = await dbDeleteProducts(slugs);
    revalidateStore();
    return { ok: t("admin.msg.productsDeleted").replace("{n}", String(n)) };
  } catch (e) {
    return actionState(e, t.lang);
  }
}

/* ---------------- Categories ---------------- */

function parseCategoryForm(fd: FormData) {
  const existing = str(fd.get("existing_slug"));
  const nameFr = str(fd.get("name_fr"));
  // Same rule as products: `disabled` inputs never reach FormData, so trust
  // the hidden marker first. Otherwise the upsert would INSERT a brand new
  // category instead of updating the one being edited.
  const slug = existing || str(fd.get("slug")) || slugify(nameFr);
  return {
    slug,
    name_fr: nameFr,
    name_ar: str(fd.get("name_ar")),
    tagline_fr: str(fd.get("tagline_fr")),
    tagline_ar: str(fd.get("tagline_ar")),
    color: str(fd.get("color")) || "#f4f0e6",
    text: str(fd.get("text")) || "light",
    icon: str(fd.get("icon")) || "gift",
    image: str(fd.get("image")) || null,
    featured: bool(fd.get("featured")),
  };
}

export async function saveCategory(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const input = parseCategoryForm(fd);
  if (!input.name_fr || !input.name_ar || !input.slug) {
    return {
      error: t("admin.msg.categoryMissing"),
      solution: t("admin.msg.categoryMissingSol"),
    };
  }
  if (!["light", "dark"].includes(input.text)) {
    return {
      error: t("admin.msg.textColorBad"),
      solution: t("admin.msg.textColorBadSol"),
    };
  }
  try {
    await dbUpsertCategory(input);
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidateStore();
  await setFlash({
    kind: "success",
    title: t("admin.msg.categorySaved"),
    solution: t("admin.msg.savedInShop").replace("{n}", input.name_fr),
  });
  redirect("/admin/categories");
}

export async function deleteCategory(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const slug = str(fd.get("slug"));
  if (!slug) {
    return { error: t("admin.msg.notFoundCategory"), solution: t("admin.msg.refresh") };
  }
  try {
    await dbDeleteCategory(slug);
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidateStore();
  return { ok: t("admin.msg.categoryDeleted") };
}

export async function deleteCategories(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const slugs = fd
    .getAll("slugs")
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (slugs.length === 0) {
    return { error: t("admin.msg.bulkEmpty"), solution: t("admin.msg.bulkEmptySol") };
  }
  try {
    const n = await dbDeleteCategories(slugs);
    revalidateStore();
    return { ok: t("admin.msg.categoriesDeleted").replace("{n}", String(n)) };
  } catch (e) {
    return actionState(e, t.lang);
  }
}

/* ---------------- Orders ---------------- */

export async function setOrderStatus(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  const status = str(fd.get("status")) as OrderStatus;
  if (!id || !["nouvelle", "en_cours", "livree", "annulee"].includes(status)) {
    return {
      error: t("admin.msg.statusFail"),
      solution: t("admin.msg.orderStatusSol"),
    };
  }
  try {
    await dbUpdateOrderStatus(id, status);
  } catch (e) {
    return actionState(e, t.lang);
  }
  updateTag("orders");
  revalidatePath("/admin/commandes");
  return { ok: t("admin.msg.statusUpdated") };
}

export async function saveOrderNote(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  const note = str(fd.get("note"));
  if (!id) {
    return { error: t("admin.msg.notFoundOrder"), solution: t("admin.msg.refresh") };
  }
  try {
    await dbUpdateOrderNote(id, note || null);
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidatePath("/admin/commandes");
  return { ok: note ? t("admin.msg.noteSaved") : t("admin.msg.noteCleared") };
}

export async function deleteOrders(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const ids = fd
    .getAll("ids")
    .map((v) => Math.floor(Number(v)))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 100);
  if (ids.length === 0) {
    return { error: t("admin.msg.bulkEmpty"), solution: t("admin.msg.bulkEmptySol") };
  }
  try {
    const n = await dbDeleteOrders(ids);
    updateTag("orders");
    revalidatePath("/admin/commandes");
    return { ok: t("admin.msg.ordersDeleted").replace("{n}", String(n)) };
  } catch (e) {
    return actionState(e, t.lang);
  }
}

/* ---------------- Reviews ---------------- */

export async function setReviewStatus(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  const status = str(fd.get("status")) as ReviewStatus;
  if (!id || !["pending", "approved", "rejected"].includes(status)) {
    return {
      error: t("admin.msg.statusFail"),
      solution: t("admin.msg.reviewStatusSol"),
    };
  }
  try {
    await dbSetReviewStatus(id, status);
  } catch (e) {
    return actionState(e, t.lang);
  }
  updateTag("reviews");
  revalidatePath("/admin/avis");
  const label =
    status === "approved" ? t("admin.msg.reviewApproved") : status === "rejected" ? t("admin.msg.reviewRejected") : t("admin.msg.reviewPending");
  return { ok: label };
}

export async function deleteReview(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  if (!id) {
    return { error: t("admin.msg.notFoundReview"), solution: t("admin.msg.refresh") };
  }
  try {
    await dbDeleteReview(id);
  } catch (e) {
    return actionState(e, t.lang);
  }
  updateTag("reviews");
  revalidatePath("/admin/avis");
  return { ok: t("admin.msg.reviewDeleted") };
}

export async function deleteReviews(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const ids = fd
    .getAll("ids")
    .map((v) => Math.floor(Number(v)))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 100);
  if (ids.length === 0) {
    return { error: t("admin.msg.bulkEmpty"), solution: t("admin.msg.bulkEmptySol") };
  }
  try {
    const n = await dbDeleteReviews(ids);
    updateTag("reviews");
    revalidatePath("/admin/avis");
    return { ok: t("admin.msg.reviewsDeleted").replace("{n}", String(n)) };
  } catch (e) {
    return actionState(e, t.lang);
  }
}

/* ---------------- Settings ---------------- */

const SETTING_KEYS = [
  "whatsapp",
  "free_shipping_from",
  "announce_fr",
  "announce_ar",
  "site_name",
  "site_name_ar",
  "social_instagram",
  "social_tiktok",
  "social_facebook",
] as const;

export async function saveSettings(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  try {
    for (const key of SETTING_KEYS) {
      // Always write, even when blank: the public merge layer falls back to
      // the hardcoded defaults, so clearing a field restores the default.
      await dbUpsertSetting(key, str(fd.get(key)));
    }
  } catch (e) {
    return actionState(e, t.lang);
  }
  updateTag("settings");
  revalidatePath("/", "layout");
  return { ok: t("admin.msg.settingsSaved"), okSolution: t("admin.msg.settingsSavedSol") };
}

/* ---------------- Backups ---------------- */

export async function createBackup(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const note = str(fd.get("note")) || undefined;
  try {
    const b = await dbCreateBackup("manual", note);
    if (!b) {
      return { error: t("admin.msg.backupFail"), solution: t("admin.msg.backupFailSol") };
    }
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidatePath("/admin/backups");
  return {
    ok: t("admin.msg.backupCreated"),
    okSolution: t("admin.msg.backupCreatedSol"),
  };
}

export async function restoreBackup(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  if (!id) {
    return { error: t("admin.msg.backupNotFound"), solution: t("admin.msg.refresh") };
  }
  try {
    // Safety snapshot of the current state, so a wrong restore is reversible.
    await dbCreateBackup("prerestore", `Avant restauration n°${id}`);
    const ok = await dbRestoreBackup(id);
    if (!ok) {
      return { error: t("admin.msg.backupNotFound"), solution: t("admin.msg.refresh") };
    }
  } catch (e) {
    return actionState(e, t.lang);
  }
  // Everything public may have changed: catalog, orders, reviews, settings.
  updateTag("products");
  updateTag("categories");
  updateTag("settings");
  updateTag("orders");
  updateTag("reviews");
  revalidatePath("/", "layout");
  return {
    ok: t("admin.msg.backupRestored"),
    okSolution: t("admin.msg.backupRestoredSol"),
  };
}

export async function deleteBackup(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const t = await adminT();
  const id = num(fd.get("id"));
  if (!id) {
    return { error: t("admin.msg.backupNotFound"), solution: t("admin.msg.refresh") };
  }
  try {
    const ok = await dbDeleteBackup(id);
    if (!ok) {
      return { error: t("admin.msg.backupNotFound"), solution: t("admin.msg.refresh") };
    }
  } catch (e) {
    return actionState(e, t.lang);
  }
  revalidatePath("/admin/backups");
  return { ok: t("admin.msg.backupDeleted") };
}
