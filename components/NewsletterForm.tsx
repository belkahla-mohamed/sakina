"use client";

import { useState } from "react";
import { useLang } from "@/components/providers";

export function NewsletterForm() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div>
      <form
        className="flex flex-col sm:flex-row gap-2 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setDone(true);
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.newsPh")}
          aria-label={t("form.email")}
          autoComplete="email"
          className="flex-1 min-w-0 px-4 py-3 rounded-[14px] text-[16px] text-ink outline-none border-2 border-white/25 focus:border-white/70 bg-white"
        />
        <button
          type="submit"
          className="rounded-full border-2 border-ink bg-highlight text-ink font-display font-bold text-[15px] px-5 py-3 shadow-pop-sm"
        >
          {t("footer.newsCta")}
        </button>
      </form>
      <p
        className={`text-[12px] mt-2 text-white/55 ${done ? "anim-pop" : ""}`}
      >
        {done ? `✓ ${t("footer.newsThanks")}` : t("footer.newsNote")}
      </p>
    </div>
  );
}
