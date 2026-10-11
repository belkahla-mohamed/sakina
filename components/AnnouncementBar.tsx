"use client";

import { useLang, useSettings } from "@/components/providers";

export function AnnouncementBar() {
  const { lang } = useLang();
  const settings = useSettings();
  const text = lang === "ar" ? settings.announce_ar : settings.announce_fr;
  if (!text) return null;
  return (
    <div className="bg-teal-deep text-white text-center text-[12.5px] md:text-[13px] font-bold py-2 px-4">
      {text}
    </div>
  );
}
