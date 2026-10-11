import { Suspense } from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/Toast";

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-milk">
        {/* Session read must sit behind a boundary (Cache Components rule). */}
        <Suspense
          fallback={
            <div className="flex min-h-screen">
              <div className="w-[240px] border-r border-line bg-white" />
              <div className="flex-1 p-8 anim-fade-in">
                <div className="h-8 w-56 rounded-lg bg-line/40 anim-pulse" />
                <div className="mt-6 h-40 rounded-[14px] bg-line/30 anim-pulse" />
              </div>
            </div>
          }
        >
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </div>
    </ToastProvider>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar admin={admin} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-7">{children}</div>
      </main>
    </div>
  );
}
