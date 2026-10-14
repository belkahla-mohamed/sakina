"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Package,
  ShoppingCartSimple,
  Tag,
  Star,
  Gear,
  HardDrives,
  SignOut,
} from "@phosphor-icons/react";
import { logout } from "@/app/admin/actions";
import { useLang } from "@/components/providers";
import type { AdminUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", key: "admin.nav.dashboard", icon: SquaresFour, exact: true },
  { href: "/admin/produits", key: "admin.nav.products", icon: Package, exact: false },
  { href: "/admin/commandes", key: "admin.nav.orders", icon: ShoppingCartSimple, exact: false },
  { href: "/admin/categories", key: "admin.nav.categories", icon: Tag, exact: false },
  { href: "/admin/avis", key: "admin.nav.reviews", icon: Star, exact: false },
  { href: "/admin/backups", key: "admin.nav.backups", icon: HardDrives, exact: false },
  { href: "/admin/reglages", key: "admin.nav.settings", icon: Gear, exact: false },
] as const;

function LangToggle({ lang, setLang }: { lang: "fr" | "ar"; setLang: (l: "fr" | "ar") => void }) {
  const router = useRouter();
  return (
    <div
      className="flex rounded-full border-2 border-line overflow-hidden text-[12px] font-bold"
      role="group"
      aria-label="Langue / اللغة"
    >
      {(["fr", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            setLang(l);
            router.refresh();
          }}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 ${lang === l ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
        >
          {l === "fr" ? "FR" : "ع"}
        </button>
      ))}
    </div>
  );
}

export function AdminSidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLang();

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[14.5px] font-bold transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-ink hover:bg-highlight/25"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} weight={active ? "fill" : "regular"} />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-e border-line bg-white sticky top-0 h-screen">
        <div className="px-4 pt-5 pb-4 border-b border-line">
          <Link href="/" className="font-display text-[19px] font-bold">
            Sakina <span className="text-primary">{t("admin.nav.brandAdmin")}</span>
          </Link>
          <p className="text-[12px] text-ink-soft truncate mt-0.5">
            {admin.name || admin.email}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">{navList}</div>

        <div className="p-3 border-t border-line space-y-2">
          <div className="flex justify-center">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[14px] font-bold text-ink-soft hover:bg-highlight/25"
          >
            {t("admin.nav.viewShop")}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-[14px] font-bold text-primary hover:bg-primary/10"
            >
              <SignOut size={19} />
              {t("admin.nav.logout")}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="font-display text-[17px] font-bold">
            Sakina <span className="text-primary">{t("admin.nav.brandAdmin")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[13.5px] font-bold text-primary"
              >
                <SignOut size={17} />
                {t("admin.nav.exit")}
              </button>
            </form>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full text-[13px] font-bold ${
                  active ? "bg-primary text-white" : "text-ink-soft bg-milk"
                }`}
              >
                <Icon size={16} />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
