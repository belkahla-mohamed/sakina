import type { Metadata } from "next";
import { connection } from "next/server";
import { dbAdminOrders, dbOrderStats } from "@/lib/db/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Commandes" };

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
  const [orders, stats] = await Promise.all([dbAdminOrders(), dbOrderStats()]);

  const chips = [
    { label: "Total", value: String(stats.totalOrders) },
    { label: "À traiter", value: String(stats.pending), tone: "text-primary" },
    { label: "Aujourd'hui", value: String(stats.today) },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), tone: "text-teal-deep" },
  ];

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">Commandes</h1>
        <p className="text-[14px] text-ink-soft">
          Commandes passées via WhatsApp, encaissement à la livraison.
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
