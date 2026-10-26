import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { adminT } from "@/lib/admin-lang";
import type { TKey } from "@/lib/i18n";
import { dbOrderStats, dbAdminOrders } from "@/lib/db/orders";
import { dbAdminProducts } from "@/lib/db/store";
import { dbAdminReviews } from "@/lib/db/reviews";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.dashboard") };
}

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

const STATUS_KEY: Record<string, TKey> = {
  nouvelle: "admin.order.statusNew",
  en_cours: "admin.order.statusProgress",
  livree: "admin.order.statusDone",
  annulee: "admin.order.statusCancelled",
};

const STATUS_CLS: Record<string, string> = {
  nouvelle: "bg-primary text-white",
  en_cours: "bg-teal text-white",
  livree: "bg-teal-deep text-white",
  annulee: "border border-line text-ink-soft",
};

export default function AdminDashboardPage() {
  return (
    <AdminSection>
      <DashboardContent />
    </AdminSection>
  );
}

async function DashboardContent() {
  await connection();
  const t = await adminT();
  const [stats, products, reviews, recentOrders] = await Promise.all([
    dbOrderStats(),
    dbAdminProducts(),
    dbAdminReviews(),
    dbAdminOrders(),
  ]);

  const lowStock = products.filter((p) => p.stock <= 5);
  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const recent = recentOrders.slice(0, 6);
  const totalProducts = products.length;

  const cards = [
    { label: t("admin.nav.orders"), value: String(stats.totalOrders), sub: `${stats.today} ${t("admin.dash.today")}`, icon: "shopping-cart" as const, tone: "text-teal-deep" },
    { label: t("admin.dash.pending"), value: String(stats.pending), sub: t("admin.dash.toProcess"), icon: "clock" as const, tone: "text-primary" },
    { label: t("admin.dash.revenue"), value: formatPrice(stats.revenue), sub: t("admin.dash.exclCancelled"), icon: "trend" as const, tone: "text-teal-deep" },
    { label: t("admin.nav.products"), value: String(totalProducts), sub: `${lowStock.length} ${t("admin.dash.lowStock")}`, icon: "package" as const, tone: "text-ink" },
  ];

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold truncate">
            {t("admin.nav.dashboard")}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-ink-soft mt-0.5">
            {t("admin.dash.sub")}
          </p>
        </div>
        <Link
          href="/admin/produits/new"
          className="btn btn-primary self-start sm:self-auto text-xs py-2.5 px-4 sm:py-3 sm:px-5 shrink-0"
        >
          {t("admin.dash.newProduct")}
        </Link>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => {
          return (
            <div key={c.label} className="card p-3.5 sm:p-5 min-w-0 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] sm:text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-soft truncate">
                  {c.label}
                </span>
                <span className="grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-[8px] sm:rounded-[10px] bg-primary/8">
                  <Icon name={c.icon} size={16} className={c.tone} />
                </span>
              </div>
              <p className="font-display text-[20px] sm:text-[26px] xl:text-[28px] font-bold mt-2 sm:mt-2.5 leading-tight tabular-nums truncate">
                {c.value}
              </p>
              <p className="text-[11px] sm:text-[12.5px] text-ink-soft mt-1 sm:mt-1.5 truncate">
                {c.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recent orders */}
        <section className="card p-4 sm:p-5 lg:col-span-7 xl:col-span-7 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[16px] sm:text-[18px] font-bold">{t("admin.dash.recentOrders")}</h2>
            <Link href="/admin/commandes" className="text-[12.5px] sm:text-[13.5px] font-bold text-primary underline">
              {t("admin.dash.seeAll")}
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-[14px] text-ink-soft py-6 text-center">
              {t("admin.dash.noOrders")}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] sm:text-[14.5px] font-bold truncate">{o.customer_name}</p>
                    <p className="text-[11.5px] sm:text-[12.5px] text-ink-soft truncate">
                      {o.reference} · {o.customer_city}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="price text-[13.5px] sm:text-[14.5px]">{formatPrice(Number(o.total))}</p>
                    <span
                      className={`inline-block mt-0.5 sm:mt-1 text-[11px] sm:text-[11.5px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_CLS[o.status] ?? "border border-line text-ink-soft"
                      }`}
                    >
                      {STATUS_KEY[o.status] ? t(STATUS_KEY[o.status]) : o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Alerts & Reviews */}
        <div className="lg:col-span-5 xl:col-span-5 min-w-0 space-y-5">
          {/* Alerts */}
          <div className="card p-4 sm:p-5 min-w-0">
            <h2 className="font-display text-[16px] sm:text-[18px] font-bold flex items-center gap-2">
              <Icon name="warning" size={18} className="text-highlight shrink-0" />
              <span>{t("admin.dash.todo")}</span>
            </h2>
            <ul className="mt-3 divide-y divide-line/40 text-[13.5px] sm:text-[14px]">
              <li className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1 min-w-0">
                <span className="text-ink truncate">{t("admin.dash.pendingReviews")}</span>
                <Link
                  href="/admin/avis"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:opacity-80 shrink-0 text-[13px]"
                >
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary/10 text-primary text-[12px] tabular-nums">
                    {pendingReviews.length}
                  </span>
                  <span className="inline-block rtl:rotate-180">→</span>
                </Link>
              </li>
              <li className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1 min-w-0">
                <span className="text-ink truncate">{t("admin.dash.lowStockLabel")}</span>
                <Link
                  href="/admin/produits"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:opacity-80 shrink-0 text-[13px]"
                >
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary/10 text-primary text-[12px] tabular-nums">
                    {lowStock.length}
                  </span>
                  <span className="inline-block rtl:rotate-180">→</span>
                </Link>
              </li>
              <li className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1 min-w-0">
                <span className="text-ink truncate">{t("admin.dash.ordersToProcess")}</span>
                <Link
                  href="/admin/commandes"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:opacity-80 shrink-0 text-[13px]"
                >
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary/10 text-primary text-[12px] tabular-nums">
                    {stats.pending}
                  </span>
                  <span className="inline-block rtl:rotate-180">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Recent reviews */}
          <div className="card p-4 sm:p-5 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-display text-[16px] sm:text-[18px] font-bold flex items-center gap-2">
                <Icon name="star" size={18} className="text-primary shrink-0" />
                <span>{t("admin.dash.recentReviews")}</span>
              </h2>
              <Link
                href="/admin/avis"
                className="text-[12.5px] sm:text-[13.5px] font-bold text-primary hover:underline shrink-0"
              >
                {t("admin.dash.seeAll")}
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="text-[13.5px] text-ink-soft py-4 text-center">{t("admin.dash.noReviews")}</p>
            ) : (
              <ul className="divide-y divide-line/40">
                {reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="py-2.5 first:pt-0 last:pb-0 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[13.5px] truncate">{r.name}</span>
                      <span className="text-amber-700 text-xs tracking-wider shrink-0 font-sans">
                        {"★".repeat(Math.max(1, Math.min(5, r.rating)))}
                      </span>
                    </div>
                    <p className="text-ink-soft text-[12.5px] sm:text-[13px] line-clamp-2 mt-1 break-words leading-relaxed">
                      {r.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
