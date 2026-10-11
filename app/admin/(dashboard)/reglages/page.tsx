import type { Metadata } from "next";
import { connection } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminT } from "@/lib/admin-lang";
import { dbAdminSettings } from "@/lib/db/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.settings") };
}

export default function AdminSettingsPage() {
  return (
    <AdminSection>
      <SettingsContent />
    </AdminSection>
  );
}

async function SettingsContent() {
  await connection();
  const t = await adminT();
  const [settings, admin] = await Promise.all([dbAdminSettings(), getCurrentAdmin()]);

  return (
    <div className="space-y-6 anim-fade-up max-w-3xl">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.nav.settings")}</h1>
        <p className="text-[14px] text-ink-soft">
          {t("admin.settings.sub")}
        </p>
      </header>

      <ProfileForm email={admin.email} />
      <SettingsForm settings={settings} />
    </div>
  );
}
