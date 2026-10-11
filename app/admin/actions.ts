"use server";

import { redirect } from "next/navigation";
import { updateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { destroySession } from "@/lib/auth/session";
import { ADMIN_LOGIN_PATH } from "@/lib/auth";
import { actionState } from "@/lib/admin-errors";
import { setFlash } from "@/lib/admin-flash";
import {
  dbInsertProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbUpsertCategory,
  dbDeleteCategory,
  type ProductInput,
} from "@/lib/db/store";
import { dbUpdateOrderStatus, dbUpdateOrderNote, type OrderStatus } from "@/lib/db/orders";
import { dbSetReviewStatus, dbDeleteReview, type ReviewStatus } from "@/lib/db/reviews";
import { dbUpsertSetting } from "@/lib/db/settings";

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

  const { input, isNew } = parseProductForm(fd);

  if (!input.name_fr || !input.name_ar || !input.category) {
    return {
      error: "Le produit n'a pas pu être enregistré : il manque des informations.",
      solution: "Remplissez le nom français, le nom arabe et la catégorie, puis réessayez.",
    };
  }
  if (!input.slug) {
    return {
      error: "L'identifiant (slug) du produit est vide.",
      solution: "Saisissez un nom : l'identifiant sera généré automatiquement.",
    };
  }
  if (input.price < 0) {
    return {
      error: "Le prix ne peut pas être négatif.",
      solution: "Saisissez un prix supérieur ou égal à 0.",
    };
  }
  if (input.badge && !["nouveau", "promo", "epuise"].includes(input.badge)) {
    return {
      error: "Le badge choisi n'existe pas.",
      solution: "Reprenez le menu « Badge » et choisissez une valeur dans la liste.",
    };
  }

  try {
    if (isNew) {
      const dup = await import("@/lib/db/pool").then((m) =>
        m.q1("select 1 from public.products where slug = $1", [input.slug])
      );
      if (dup) {
        return {
          error: `Un produit utilise déjà l'identifiant « ${input.slug} ».`,
          solution: "Laissez le champ vide pour en générer un autre, ou saisissez un identifiant différent.",
        };
      }
      await dbInsertProduct(input);
    } else {
      const updated = await dbUpdateProduct(input.slug, input);
      if (!updated) {
        return {
          error: "Ce produit n'existe plus.",
          solution:
            "Il a peut-être été supprimé entre-temps. Rechargez la page pour voir la liste à jour, puis réessayez.",
        };
      }
    }
  } catch (e) {
    return actionState(e);
  }

  revalidateStore();
  await setFlash({
    kind: "success",
    title: "Produit enregistré.",
    solution: `« ${input.name_fr} » est à jour dans la boutique.`,
  });
  redirect("/admin/produits");
}

export async function deleteProduct(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const slug = str(fd.get("slug"));
  if (!slug) {
    return { error: "Produit introuvable.", solution: "Actualisez la page et réessayez." };
  }
  try {
    await dbDeleteProduct(slug);
  } catch (e) {
    return actionState(e);
  }
  revalidateStore();
  return { ok: "Produit supprimé.", okSolution: "Il n'apparaît plus dans la boutique." };
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
    color: str(fd.get("color")) || "#FF6B9D",
    text: str(fd.get("text")) || "light",
    icon: str(fd.get("icon")) || "gift",
    featured: bool(fd.get("featured")),
  };
}

export async function saveCategory(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const input = parseCategoryForm(fd);
  if (!input.name_fr || !input.name_ar || !input.slug) {
    return {
      error: "La catégorie n'a pas pu être enregistrée : il manque des informations.",
      solution: "Remplissez le nom français et le nom arabe, puis réessayez.",
    };
  }
  if (!["light", "dark"].includes(input.text)) {
    return {
      error: "La couleur du texte choisie n'existe pas.",
      solution: "Reprenez le menu « Couleur du texte » et choisissez Blanc ou Encre.",
    };
  }
  try {
    await dbUpsertCategory(input);
  } catch (e) {
    return actionState(e);
  }
  revalidateStore();
  await setFlash({
    kind: "success",
    title: "Catégorie enregistrée.",
    solution: `« ${input.name_fr} » est à jour dans la boutique.`,
  });
  redirect("/admin/categories");
}

export async function deleteCategory(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const slug = str(fd.get("slug"));
  if (!slug) {
    return { error: "Catégorie introuvable.", solution: "Actualisez la page et réessayez." };
  }
  try {
    await dbDeleteCategory(slug);
  } catch (e) {
    return actionState(e);
  }
  revalidateStore();
  return { ok: "Catégorie supprimée." };
}

/* ---------------- Orders ---------------- */

export async function setOrderStatus(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  const status = str(fd.get("status")) as OrderStatus;
  if (!id || !["nouvelle", "en_cours", "livree", "annulee"].includes(status)) {
    return {
      error: "Le nouveau statut n'a pas pu être appliqué.",
      solution: "Choisissez un statut dans la liste, puis cliquez sur OK.",
    };
  }
  try {
    await dbUpdateOrderStatus(id, status);
  } catch (e) {
    return actionState(e);
  }
  updateTag("orders");
  revalidatePath("/admin/commandes");
  return { ok: "Statut mis à jour." };
}

export async function saveOrderNote(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  const note = str(fd.get("note"));
  if (!id) {
    return { error: "Commande introuvable.", solution: "Actualisez la page et réessayez." };
  }
  try {
    await dbUpdateOrderNote(id, note || null);
  } catch (e) {
    return actionState(e);
  }
  revalidatePath("/admin/commandes");
  return { ok: note ? "Note enregistrée." : "Note effacée." };
}

/* ---------------- Reviews ---------------- */

export async function setReviewStatus(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  const status = str(fd.get("status")) as ReviewStatus;
  if (!id || !["pending", "approved", "rejected"].includes(status)) {
    return {
      error: "Le nouveau statut n'a pas pu être appliqué.",
      solution: "Réessayez. Si ça persiste, rechargez la page.",
    };
  }
  try {
    await dbSetReviewStatus(id, status);
  } catch (e) {
    return actionState(e);
  }
  updateTag("reviews");
  revalidatePath("/admin/avis");
  const label =
    status === "approved" ? "Avis approuvé." : status === "rejected" ? "Avis rejeté." : "Avis remis en attente.";
  return { ok: label };
}

export async function deleteReview(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  if (!id) {
    return { error: "Avis introuvable.", solution: "Actualisez la page et réessayez." };
  }
  try {
    await dbDeleteReview(id);
  } catch (e) {
    return actionState(e);
  }
  updateTag("reviews");
  revalidatePath("/admin/avis");
  return { ok: "Avis supprimé." };
}

/* ---------------- Settings ---------------- */

const SETTING_KEYS = [
  "whatsapp",
  "free_shipping_from",
  "announce_fr",
  "announce_ar",
  "site_name",
  "site_name_ar",
] as const;

export async function saveSettings(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin();
  try {
    for (const key of SETTING_KEYS) {
      // Always write, even when blank: the public merge layer falls back to
      // the hardcoded defaults, so clearing a field restores the default.
      await dbUpsertSetting(key, str(fd.get(key)));
    }
  } catch (e) {
    return actionState(e);
  }
  updateTag("settings");
  revalidatePath("/", "layout");
  return { ok: "Réglages enregistrés.", okSolution: "Les changements sont déjà visibles dans la boutique." };
}
