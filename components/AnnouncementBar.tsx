"use client";

import { useLang } from "@/components/providers";

export function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="bg-teal-deep text-white text-center text-[12.5px] md:text-[13px] font-bold py-2 px-4">
      {t("announce")}
    </div>
  );
}
