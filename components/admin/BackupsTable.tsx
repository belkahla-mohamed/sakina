"use client";

import { useActionState, useState } from "react";
import {
  ArrowClockwise,
  DownloadSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import {
  createBackup,
  restoreBackup,
  deleteBackup,
  type ActionState,
} from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import { confirmSubmit, useConfirm } from "@/components/admin/Toast";
import { useLang } from "@/components/providers";
import type { BackupRow } from "@/lib/db/backups";

const KIND_KEY = {
  manual: "admin.backup.manual",
  auto: "admin.backup.auto",
  prerestore: "admin.backup.prerestore",
} as const;

const KIND_CLS: Record<string, string> = {
  manual: "bg-primary text-white",
  auto: "bg-sand text-ink border border-line",
  prerestore: "bg-teal-deep text-white",
};

function formatDate(iso: string, lang: "fr" | "ar"): string {
  return new Date(iso).toLocaleString(lang === "ar" ? "ar-MA" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function BackupsTable({ backups }: { backups: BackupRow[] }) {
  const { t, lang } = useLang();
  const [note, setNote] = useState("");
  const askConfirm = useConfirm();

  const [createState, createAction, createPending] = useActionState<
    ActionState,
    FormData
  >(createBackup, {});
  const [restoreState, restoreAction] = useActionState<ActionState, FormData>(
    restoreBackup,
    {}
  );
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteBackup,
    {}
  );
  useActionToast(createState);
  useActionToast(restoreState);
  useActionToast(deleteState);

  return (
    <div className="space-y-4">
      {/* Manual create */}
      <form
        action={createAction}
        className="card p-4 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label
            htmlFor="backup-note"
            className="block text-[12.5px] font-bold"
          >
            {t("admin.backup.noteLabel")}
          </label>
          <input
            id="backup-note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("admin.backup.notePh")}
            className="field w-full px-3 py-2 text-[13.5px]"
            maxLength={120}
          />
        </div>
        <button
          type="submit"
          disabled={createPending}
          className="btn btn-primary !px-4 !py-2.5 text-[13.5px] disabled:opacity-60"
        >
          <Plus size={15} weight="bold" />
          {createPending ? t("admin.backup.creating") : t("admin.backup.create")}
        </button>
      </form>

      {backups.length === 0 ? (
        <div className="card p-12 text-center text-[14.5px] text-ink-soft">
          {t("admin.backup.none")}
          <p className="mt-2 text-[13px]">{t("admin.backup.noneSub")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {backups.map((b) => (
            <li key={b.id} className="card p-4 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${KIND_CLS[b.kind] ?? KIND_CLS.manual}`}
              >
                {t(KIND_KEY[b.kind] ?? "admin.backup.manual")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold">
                  {formatDate(b.created_at, lang)}
                </p>
                <p className="text-[12.5px] text-ink-soft mt-0.5">
                  {t("admin.backup.items")
                    .replace("{p}", String(b.products_count))
                    .replace("{o}", String(b.orders_count))
                    .replace("{r}", String(b.reviews_count))}
                  {" · "}
                  {formatSize(b.size_bytes)}
                  {b.note ? ` · ${b.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/backups/${b.id}/download`}
                  className="btn btn-outline !px-3 !py-2 text-[13px]"
                  download
                >
                  <DownloadSimple size={15} weight="bold" />
                  {t("admin.backup.download")}
                </a>
                <form
                  action={restoreAction}
                  onSubmit={(e) =>
                    confirmSubmit(e, askConfirm, {
                      title: t("admin.backup.restoreTitle"),
                      message: t("admin.backup.restoreMsg").replace(
                        "{date}",
                        formatDate(b.created_at, lang)
                      ),
                      confirmLabel: t("admin.backup.restore"),
                      tone: "danger",
                    })
                  }
                >
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="btn !px-3 !py-2 text-[13px] border-2 border-line text-primary hover:border-primary disabled:opacity-60"
                  >
                    <ArrowClockwise size={15} weight="bold" />
                    {t("admin.backup.restore")}
                  </button>
                </form>
                <form
                  action={deleteAction}
                  onSubmit={(e) =>
                    confirmSubmit(e, askConfirm, {
                      title: t("admin.backup.delTitle"),
                      message: t("admin.backup.delMsg"),
                      confirmLabel: t("admin.backup.delete"),
                      tone: "danger",
                    })
                  }
                >
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    aria-label={`${t("admin.backup.delete")} ${b.id}`}
                    className="btn btn-outline !px-2.5 !py-2 text-[13px] text-primary border-line hover:border-primary"
                  >
                    <Trash size={15} weight="bold" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
