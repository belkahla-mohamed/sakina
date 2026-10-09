"use client";

import Link from "next/link";
import { useLang } from "@/components/providers";

export default function NotFound() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center anim-fade-up">
      <p className="font-display text-[92px] font-extrabold leading-none text-primary">404</p>
      <h1 className="text-[28px] md:text-[34px] font-bold mt-2">{t("notFoundTitle")}</h1>
      <p className="text-ink-soft mt-3">{t("notFoundText")}</p>
      <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
        {t("notFoundCta")}
      </Link>
    </div>
  );
}
