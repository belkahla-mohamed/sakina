"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="block text-[13.5px] font-bold mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue="admin@sakina.ma"
          className="field w-full px-4 py-3 outline-none focus:border-ink"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[13.5px] font-bold mb-1.5">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field w-full px-4 py-3 outline-none focus:border-ink"
        />
      </div>

      {state.error && (
        <div
          className="rounded-[12px] border-2 border-primary bg-primary/10 px-3.5 py-3"
          role="alert"
        >
          <p className="text-[13.5px] font-bold text-primary">{state.error}</p>
          {state.solution && (
            <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
              {state.solution}
            </p>
          )}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
