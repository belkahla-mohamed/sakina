import type { Badge, Category, Product } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import local from "@/data/catalog.json";

const localCategories = local.categories as Category[];

type LocalProduct = Omit<Product, "badge" | "image"> & {
  badge?: string | null;
  image?: string | null;
};

const localProducts: Product[] = (local.products as unknown as LocalProduct[]).map((p) => ({
  ...p,
  badge: (p.badge as Badge) ?? null,
  image: p.image || `/img/products/${p.slug}.svg`,
}));

export async function getCategories(): Promise<Category[]> {
  "use cache";
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("featured", { ascending: false });
      if (!error && data && data.length > 0) return data as Category[];
      if (error) console.warn("[catalog] categories query failed, using local data:", error.message);
    } catch (e) {
      console.warn("[catalog] categories fetch failed, using local data:", e);
    }
  }
  return localCategories;
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("is_bestseller", { ascending: false });
      if (!error && data && data.length > 0) return data as Product[];
      if (error) console.warn("[catalog] products query failed, using local data:", error.message);
    } catch (e) {
      console.warn("[catalog] products fetch failed, using local data:", e);
    }
  }
  return localProducts;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_new).concat(products.filter((p) => !p.is_new)).slice(0, 8);
}

export async function getBestsellers(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_bestseller).concat(products.filter((p) => !p.is_bestseller)).slice(0, 8);
}
