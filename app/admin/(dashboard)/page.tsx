import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { dbOrderStats, dbAdminOrders } from "@/lib/db/orders";
import { dbAdminProducts } from "@/lib/db/store";
import { dbAdminReviews } from "@/lib/db/reviews";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Tableau de bord" };

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

const STATUS_LABEL: Record<string, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  livree: "Livrée",
  annulee: "Annulée",
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
    { label: "Commandes", value: String(stats.totalOrders), sub: `${stats.today} aujourd'hui`, icon: "shopping-cart" as const, tone: "text-teal-deep" },
    { label: "En attente", value: String(stats.pending), sub: "à traiter", icon: "clock" as const, tone: "text-primary" },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), sub: "hors annulées", icon: "trend" as const, tone: "text-teal-deep" },
    { label: "Produits", value: String(totalProducts), sub: `${lowStock.length} en stock bas`, icon: "package" as const, tone: "text-ink" },
  ];

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">Tableau de bord</h1>
          <p className="text-[14px] text-ink-soft">
            Vue d&apos;ensemble de votre boutique Sakina.
          </p>
        </div>
        <Link href="/admin/produits/new" className="btn btn-primary">
          + Nouveau produit
        </Link>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          return (
            <div key={c.label} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink-soft">{c.label}</span>
                <Icon name={c.icon} size={20} className={c.tone} />
              </div>
              <p className="font-display text-[26px] font-bold mt-2 leading-none">{c.value}</p>
              <p className="text-[12.5px] text-ink-soft mt-1.5">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
        {/* Recent orders */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[18px] font-bold">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-[13.5px] font-bold text-primary underline">
              Tout voir
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-[14px] text-ink-soft py-6 text-center">
              Aucune commande pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-bold truncate">{o.customer_name}</p>
                    <p className="text-[12.5px] text-ink-soft truncate">
                      {o.reference} · {o.customer_city}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="price text-[14.5px]">{formatPrice(Number(o.total))}</p>
                    <span className="inline-block mt-1 text-[11.5px] font-bold px-2 py-0.5 rounded-full bg-milk border border-line">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Alerts */}
        <section className="space-y-5">
          <div className="card p-5">
            <h2 className="font-display text-[18px] font-bold flex items-center gap-2">
              <Icon name="warning" size={18} className="text-highlight" /> À faire
            </h2>
            <ul className="mt-3 space-y-2.5 text-[14px]">
              <li className="flex items-center justify-between">
                <span>Avis en attente</span>
                <Link href="/admin/avis" className="font-bold text-primary">
                  {pendingReviews.length} →
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Produits en stock bas (≤5)</span>
                <Link href="/admin/produits" className="font-bold text-primary">
                  {lowStock.length} →
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Commandes à traiter</span>
                <Link href="/admin/commandes" className="font-bold text-primary">
                  {stats.pending} →
                </Link>
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-[18px] font-bold flex items-center gap-2">
              <Icon name="star" size={18} className="text-primary" /> Avis récents
            </h2>
            {reviews.length === 0 ? (
              <p className="text-[14px] text-ink-soft mt-2">Aucun avis pour l&apos;instant.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="text-[13.5px]">
                    <span className="font-bold">{r.name}</span>
                    <span className="text-ink-soft"> · {"★".repeat(r.rating)}</span>
                    <p className="text-ink-soft truncate">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
