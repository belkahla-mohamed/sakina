import type { Metadata } from "next";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminOrders, dbOrderStats } from "@/lib/db/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.orders") };
}

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

export default function AdminOrdersPage() {
  return (
    <AdminSection>
      <OrdersContent />
    </AdminSection>
  );
}

async function OrdersContent() {
  await connection();
  const t = await adminT();
  const [orders, stats] = await Promise.all([dbAdminOrders(), dbOrderStats()]);

  const chips = [
    { label: t("cart.total"), value: String(stats.totalOrders) },
    { label: t("admin.order.toProcess"), value: String(stats.pending), tone: "text-primary" },
    { label: t("admin.order.today"), value: String(stats.today) },
    { label: t("admin.dash.revenue"), value: formatPrice(stats.revenue), tone: "text-teal-deep" },
  ];

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.nav.orders")}</h1>
        <p className="text-[14px] text-ink-soft">
          {t("admin.order.sub")}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {chips.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-[13px] font-bold text-ink-soft">{c.label}</p>
            <p className={`font-display text-[24px] font-bold mt-1.5 leading-none ${c.tone ?? ""}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
