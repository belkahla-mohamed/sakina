"use client";

import { useState } from "react";
import { BookOpen, Minus, Plus, Question } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

const STEPS = [
  { icon: "＋", labelKey: "admin.backup.helpCreate", bodyKey: "admin.backup.helpCreateBody" },
  { icon: "⟳", labelKey: "admin.backup.helpAuto", bodyKey: "admin.backup.helpAutoBody" },
  { icon: "⬇", labelKey: "admin.backup.helpDownload", bodyKey: "admin.backup.helpDownloadBody" },
  { icon: "↶", labelKey: "admin.backup.helpRestore", bodyKey: "admin.backup.helpRestoreBody" },
] as const;

const FAQS = [
  { id: "faq1", qKey: "admin.backup.faq1q", aKey: "admin.backup.faq1a" },
  { id: "faq2", qKey: "admin.backup.faq2q", aKey: "admin.backup.faq2a" },
  { id: "faq3", qKey: "admin.backup.faq3q", aKey: "admin.backup.faq3a" },
  { id: "faq4", qKey: "admin.backup.faq4q", aKey: "admin.backup.faq4a" },
  { id: "faq5", qKey: "admin.backup.faq5q", aKey: "admin.backup.faq5a" },
] as const;

export function BackupsHelp() {
  const { t, lang } = useLang();
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS[0].id);

  return (
    <section className="mt-8 space-y-6">
      {/* How-to */}
      <div className="card p-5">
        <h2 className="font-display text-[18px] font-bold flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          {t("admin.backup.helpTitle")}
        </h2>
        <ul className="mt-4 space-y-3">
          {STEPS.map((s) => (
            <li key={s.labelKey} className="flex items-start gap-3 text-[14px]">
              <span className="mt-0.5 shrink-0 grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-[13px] font-bold">
                {s.icon}
              </span>
              <p className="leading-relaxed">
                <span className="font-bold">{t(s.labelKey)}</span>{" "}
                <span className={lang === "ar" ? "ar" : ""}>{t(s.bodyKey)}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="card p-5">
        <h2 className="font-display text-[18px] font-bold flex items-center gap-2">
          <Question size={18} className="text-primary" />
          {t("admin.backup.faqTitle")}
        </h2>
        <div className="mt-3">
          {FAQS.map((f) => {
            const isOpen = openFaq === f.id;
            return (
              <div key={f.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : f.id)}
                  className="group w-full flex justify-between items-center gap-4 py-3.5 text-start"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[14.5px] leading-tight">
                    {t(f.qKey)}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-110 ${
                      isOpen ? "bg-primary text-white border-ink" : "border-line text-ink"
                    }`}
                  >
                    {isOpen ? <Minus size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`pb-3.5 -mt-0.5 text-[13.5px] text-ink-soft leading-relaxed transition-opacity duration-200 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      } ${lang === "ar" ? "ar" : ""}`}
                    >
                      {t(f.aKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
