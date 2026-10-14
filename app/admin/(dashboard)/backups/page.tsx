import type { Metadata } from "next";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminBackups, dbEnsureFreshBackup } from "@/lib/db/backups";
import { BackupsTable } from "@/components/admin/BackupsTable";
import { BackupsHelp } from "@/components/admin/BackupsHelp";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.backup.title") };
}

export default function AdminBackupsPage() {
  return (
    <AdminSection>
      <BackupsContent />
    </AdminSection>
  );
}

async function BackupsContent() {
  await connection();
  const t = await adminT();
  // Lazy 24h auto-backup — never blocks the page if it fails.
  await dbEnsureFreshBackup();
  const backups = await dbAdminBackups();

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.backup.title")}</h1>
        <p className="text-[14px] text-ink-soft">{t("admin.backup.sub")}</p>
      </header>

      <BackupsTable backups={backups} />
      <BackupsHelp />
    </div>
  );
}
