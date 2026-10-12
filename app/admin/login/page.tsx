import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/config";
import { adminT } from "@/lib/admin-lang";
import { getSessionAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return {
    title: t("admin.login.title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const t = await adminT();
  // The page itself never awaits `searchParams` — it hands the promise to a
  // child behind Suspense. Awaiting it here would block the shell and defeat
  // the instant-shell / partial-prerender path Next 16 expects.
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] anim-fade-up">
        <div className="text-center mb-6">
          <p className="font-display text-[26px] font-bold text-ink">
            {SITE.name} <span className="text-primary">{t("admin.nav.brandAdmin")}</span>
          </p>
          <p className="text-[14px] text-ink-soft mt-1">
            {t("admin.login.sub")}
          </p>
        </div>

        <div className="card p-6">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginFormFromUrl searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="text-center text-[12.5px] text-ink-soft mt-5">
          <Link href="/" className="underline hover:text-ink">
            {t("admin.nav.backShop")}
          </Link>
        </p>
      </div>
    </div>
  );
}

async function LoginFormFromUrl({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Belt-and-braces: the proxy already bounces signed-in sessions off this
  // page, but re-verify here so a misconfigured matcher can never serve the
  // form to someone who is already authenticated.
  if (await getSessionAdmin()) redirect("/admin");
  // Only same-origin relative paths — `//evil.com` and absolute URLs are
  // rejected so a crafted ?next= can never bounce the admin off-site.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  return <LoginForm next={safeNext} />;
}

/** Sized like the real form so the swap doesn't shift the layout. */
function LoginFormSkeleton() {
  const bar = "rounded-[9px] bg-line/40 anim-pulse";
  return (
    <div className="space-y-4" aria-hidden="true">
      <div>
        <div className={`h-3 w-14 mb-1.5 ${bar}`} />
        <div className={`h-11 w-full ${bar}`} />
      </div>
      <div>
        <div className={`h-3 w-24 mb-1.5 ${bar}`} />
        <div className={`h-11 w-full ${bar}`} />
      </div>
      <div className={`h-11 w-full ${bar}`} />
    </div>
  );
}
