import type { Metadata } from "next";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminSettings } from "@/lib/db/settings";
import { dbAdminCategories, dbAdminProducts } from "@/lib/db/store";
import { parseOffers } from "@/lib/offers";
import { OffersEditor } from "@/components/admin/OffersEditor";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.offers") };
}

export default function AdminOffersPage() {
  return (
    <AdminSection>
      <OffersContent />
    </AdminSection>
  );
}

async function OffersContent() {
  await connection();
  const t = await adminT();
  const settings = await dbAdminSettings();
  const offers = parseOffers(settings.offers);
  const [categories, products] = await Promise.all([
    dbAdminCategories(),
    dbAdminProducts(),
  ]);
  const visible = offers.filter(
    (o) => o.active && (!o.ends_at || o.ends_at >= new Date().toISOString().slice(0, 10))
  ).length;

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.nav.offers")}</h1>
        <p className="text-[14px] text-ink-soft">
          {t("admin.offers.count").replace("{n}", String(offers.length)).replace("{m}", String(visible))}
        </p>
        <p className="text-[13.5px] text-ink-soft mt-1">{t("admin.offers.sub")}</p>
      </header>

      <OffersEditor initial={offers} categories={categories} products={products} />
    </div>
  );
}
