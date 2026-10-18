"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, UploadSimple, X } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import type { UploadKind } from "@/lib/cloudinary";

const MAX_MB = 8;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml";

/**
 * Image input for admin forms.
 *
 * Posts the file to /api/admin/upload (Cloudinary, server-side) and stores the
 * returned https URL in the hidden `image` field, so `saveProduct` keeps
 * receiving a plain string. A manual URL still works for anything already on
 * an external host.
 */
export function ImageField({
  name = "image",
  value = "",
  label,
  kind = "product",
  onUrlChange,
}: {
  name?: string;
  value?: string;
  label?: string;
  kind?: UploadKind;
  onUrlChange?: (url: string) => void;
}) {
  const { t } = useLang();
  const labelText = label ?? t("admin.form.image");
  const [url, setUrl] = useState(value);
  const [preview, setPreview] = useState(value);
  const [busy, setBusy] = useState(false);
  // Problem + next step, mirroring the ActionState shape used everywhere else.
  const [error, setError] = useState<{ title: string; solution?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError({ title: t("admin.form.badFormat"), solution: t("admin.msg.uploadRejectedSol") });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError({
        title: t("admin.form.tooHeavy").replace("{n}", (file.size / 1024 / 1024).toFixed(1)),
        solution: t("admin.msg.uploadRejectedSol"),
      });
      return;
    }

    // Local preview while the upload runs, so the box never flashes empty.
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data: { url?: string; error?: string; solution?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || !data.url) {
        setError({
          title:
            data.error ||
            t("admin.form.httpFail").replace("{n}", String(res.status)),
          solution: data.solution ?? t("admin.msg.uploadRejectedSol"),
        });
        return;
      }

      URL.revokeObjectURL(local);
      setUrl(data.url);
      setPreview(data.url);
      onUrlChange?.(data.url);
    } catch {
      // Network-level interruption: the file never reached the server.
      URL.revokeObjectURL(local);
      setPreview(url);
      setError({
        title: t("admin.msg.uploadNetwork"),
        solution: t("admin.msg.uploadNetworkSol"),
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setUrl("");
    setPreview("");
    setError(null);
    onUrlChange?.("");
  }

  return (
    <div className="space-y-2.5">
      {/* The form submits this string — same shape saveProduct already expects. */}
      <input type="hidden" name={name} value={url} />

      <span className="block text-[13.5px] font-bold mb-1.5">{labelText}</span>

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative w-24 h-24 shrink-0 rounded-[12px] overflow-hidden border-2 border-dashed border-line bg-highlight/20 flex items-center justify-center">
          {preview ? (
            <>
              <Image
                src={preview}
                alt={t("admin.form.previewAlt")}
                fill
                sizes="96px"
                className="object-contain"
              />
              {busy && (
                <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">…</span>
                </div>
              )}
            </>
          ) : (
            <ImageIcon size={26} className="text-ink-soft/50" />
          )}
        </div>

        <div className="flex-1 min-w-[220px] space-y-2">
          <input
            type="file"
            accept={ACCEPT}
            ref={inputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            className="block w-full text-[13px] file:mr-3 file:rounded-[9px] file:border-0 file:bg-ink file:px-3.5 file:py-2 file:text-[12.5px] file:font-bold file:text-white hover:file:bg-primary"
          />

          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreview(e.target.value);
              onUrlChange?.(e.target.value);
            }}
            placeholder="https://res.cloudinary.com/… ou /img/products/…"
            aria-label={t("admin.form.imageUrl")}
            className="field w-full px-3.5 py-2.5 text-[13px]"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn btn-outline !px-3 !py-2 text-[12.5px] disabled:opacity-60"
            >
              <UploadSimple size={14} weight="bold" />
              {busy ? t("admin.form.uploading") : t("admin.form.upload")}
            </button>
            {url && (
              <button
                type="button"
                onClick={clear}
                disabled={busy}
                aria-label={t("admin.form.removeImage")}
                className="btn !px-2.5 !py-2 text-[12.5px] border-2 border-line text-ink-soft hover:border-primary hover:text-primary"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="text-[13px] leading-snug">
          <p className="font-bold text-primary">{error.title}</p>
          {error.solution && (
            <p className="mt-0.5 text-ink-soft">{error.solution}</p>
          )}
        </div>
      )}
    </div>
  );
}
