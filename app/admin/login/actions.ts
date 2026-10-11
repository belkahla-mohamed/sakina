"use server";

import { redirect } from "next/navigation";
import { q1, q } from "@/lib/db/pool";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { adminT } from "@/lib/admin-lang";
import { actionState } from "@/lib/admin-errors";

export interface LoginState {
  error?: string;
  solution?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  const t = await adminT();

  if (!email || !password) {
    return {
      error: t("admin.login.missingError"),
      solution: t("admin.login.missingSolution"),
    };
  }

  let admin: {
    id: number;
    email: string;
    name: string | null;
    password_hash: string;
  } | null = null;

  try {
    admin = await q1<{
      id: number;
      email: string;
      name: string | null;
      password_hash: string;
    }>("select id, email, name, password_hash from public.admin_users where email = $1", [
      email,
    ]);
  } catch (e) {
    return actionState(e, t.lang);
  }

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return {
      error: t("admin.login.invalidError"),
      solution: t("admin.login.invalidSolution"),
    };
  }

  try {
    await q("update public.admin_users set last_login_at = now() where id = $1", [
      admin.id,
    ]);
    await createSession({ id: admin.id, email: admin.email, name: admin.name });
  } catch (e) {
    return actionState(e, t.lang);
  }

  // Only allow same-origin relative redirects to avoid open redirects.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(target);
}
