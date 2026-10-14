"use client";

import { useLang, useSettings } from "@/components/providers";

export function AnnouncementBar() {
  const { lang } = useLang();
  const settings = useSettings();
  const text = lang === "ar" ? settings.announce_ar : settings.announce_fr;
  if (!text) return null;
  return (
    <div className="bg-cream text-brick text-center text-[12px] md:text-[12.5px] font-bold uppercase tracking-[0.14em] py-2.5 px-4 border-b border-line">
      {text}
    </div>
  );
}
