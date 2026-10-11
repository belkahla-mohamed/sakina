"use client";

import { useActionState } from "react";
import { EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import {
  updateProfileEmail,
  updateProfilePassword,
  type ActionState,
} from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";

export function ProfileForm({ email }: { email: string }) {
  const [emailState, emailAction, emailPending] = useActionState<ActionState, FormData>(
    updateProfileEmail,
    {}
  );
  const [passState, passAction, passPending] = useActionState<ActionState, FormData>(
    updateProfilePassword,
    {}
  );
  useActionToast(emailState);
  useActionToast(passState);
  const { t } = useLang();

  const label = "block text-[13.5px] font-bold mb-1.5";
  const field = "field w-full px-3.5 py-2.5";

  return (
    <div className="space-y-5">
      {/* Email */}
      <form action={emailAction} className="card p-5 space-y-4" noValidate>
        <h2 className="font-display text-[17px] font-bold flex items-center gap-2">
          <EnvelopeSimple size={18} weight="fill" className="text-primary" />
          {t("admin.profile.emailTitle")}
        </h2>
        <div>
          <label htmlFor="profile-email" className={label}>
            {t("admin.profile.emailLabel")}
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            defaultValue={email}
            className={field}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={emailPending}>
          {emailPending ? t("admin.form.pending") : t("admin.profile.emailSave")}
        </button>
      </form>

      {/* Password */}
      <form action={passAction} className="card p-5 space-y-4" noValidate>
        <h2 className="font-display text-[17px] font-bold flex items-center gap-2">
          <LockKey size={18} weight="fill" className="text-primary" />
          {t("admin.profile.passTitle")}
        </h2>
        <div>
          <label htmlFor="current_password" className={label}>
            {t("admin.profile.passCurrent")}
          </label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            className={field}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new_password" className={label}>
              {t("admin.profile.passNew")}
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="new_password_confirm" className={label}>
              {t("admin.profile.passConfirm")}
            </label>
            <input
              id="new_password_confirm"
              name="new_password_confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className={field}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={passPending}>
          {passPending ? t("admin.form.pending") : t("admin.profile.passSave")}
        </button>
      </form>
    </div>
  );
}
