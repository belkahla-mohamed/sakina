import type { Metadata } from "next";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminSettings } from "@/lib/db/settings";
import { parseSlides, HERO_SLIDES_KEY } from "@/lib/hero-slides";
import { SlidesEditor } from "@/components/admin/SlidesEditor";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.slides") };
}

export default function AdminSlidesPage() {
  return (
    <AdminSection>
      <SlidesContent />
    </AdminSection>
  );
}

async function SlidesContent() {
  await connection();
  const t = await adminT();
  const settings = await dbAdminSettings();
  const slides = parseSlides(settings[HERO_SLIDES_KEY]);
  const visible = slides.filter((s) => s.active).length;

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.nav.slides")}</h1>
        <p className="text-[14px] text-ink-soft">
          {t("admin.slides.count")
            .replace("{n}", String(slides.length))
            .replace("{m}", String(visible))}
        </p>
        <p className="text-[13.5px] text-ink-soft mt-1">{t("admin.slides.sub")}</p>
      </header>

      <SlidesEditor initial={slides} />
    </div>
  );
}
