import type { Metadata } from "next";
import { connection } from "next/server";
import { dbAdminSettings } from "@/lib/db/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Réglages" };

export default function AdminSettingsPage() {
  return (
    <AdminSection>
      <SettingsContent />
    </AdminSection>
  );
}

async function SettingsContent() {
  await connection();
  const settings = await dbAdminSettings();

  return (
    <div className="space-y-6 anim-fade-up max-w-3xl">
      <header>
        <h1 className="text-[28px] font-bold">Réglages</h1>
        <p className="text-[14px] text-ink-soft">
          WhatsApp, livraison, bandeau et identité — appliqués à toute la boutique.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
