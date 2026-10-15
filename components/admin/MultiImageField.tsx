"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Plus, UploadSimple, X } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

const MAX_MB = 8;
const MAX_IMAGES = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml";

function dedupe(list: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const u of list) {
    const v = (u ?? "").trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out.slice(0, MAX_IMAGES);
}

/**
 * Multi-image product field. The first entry is the cover (submitted as
 * `image`), the whole list also travels as `images[]`. Every tile shows a
 * live preview with an X to remove and arrows to reorder. Files upload to
 * /api/admin/upload (Cloudinary) one by one; multiple files can be picked
 * at once. A manual URL still works.
 */
export function MultiImageField({
  image,
  images,
}: {
  image?: string | null;
  images?: string[];
}) {
  const { t } = useLang();
  const [items, setItems] = useState<string[]>(() => dedupe([image, ...(images ?? [])]));
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ title: string; solution?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (items.length >= MAX_IMAGES) break;

        if (!ACCEPT.split(",").includes(file.type)) {
          setError({ title: t("admin.form.badFormat"), solution: t("admin.msg.uploadRejectedSol") });
          continue;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          setError({
            title: t("admin.form.tooHeavy").replace("{n}", (file.size / 1024 / 1024).toFixed(1)),
            solution: t("admin.msg.uploadRejectedSol"),
          });
          continue;
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", "product");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data: { url?: string; error?: string; solution?: string } = await res
          .json()
          .catch(() => ({}));
        if (!res.ok || !data.url) {
          setError({
            title: data.error || t("admin.form.httpFail").replace("{n}", String(res.status)),
            solution: data.solution ?? t("admin.msg.uploadRejectedSol"),
          });
          continue;
        }
        // Re-read via functional update so sequential uploads all land.
        setItems((prev) =>
          prev.includes(data.url!) || prev.length >= MAX_IMAGES ? prev : [...prev, data.url!]
        );
      }
    } catch {
      setError({ title: t("admin.msg.uploadNetwork"), solution: t("admin.msg.uploadNetworkSol") });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    setItems((prev) => prev.filter((u) => u !== url));
  }

  function move(url: string, dir: -1 | 1) {
    setItems((prev) => {
      const i = prev.indexOf(url);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* The form reads these: first entry = cover, whole list = gallery. */}
      <input type="hidden" name="image" value={items[0] ?? ""} />
      {items.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      <span className="block text-[13.5px] font-bold">{t("admin.form.imagesLabel")}</span>
      <p className="text-[12px] text-ink-soft -mt-2">{t("admin.form.galleryHint")}</p>

      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {items.map((url, i) => (
            <li
              key={url}
              className="relative w-24 h-24 rounded-[12px] overflow-hidden border-2 border-line bg-highlight/20 group"
            >
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              {busy && (
                <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">…</span>
                </div>
              )}
              {i === 0 && (
                <span className="absolute top-1 start-1 rounded bg-primary text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5">
                  {t("admin.form.coverLabel")}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-ink/65 py-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  aria-label={t("admin.slides.moveUp")}
                  onClick={() => move(url, -1)}
                  disabled={i === 0}
                  className="w-6 h-6 flex items-center justify-center text-white hover:text-highlight disabled:opacity-30"
                >
                  <ArrowLeft size={12} weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label={t("admin.form.removeImage")}
                  onClick={() => remove(url)}
                  className="w-6 h-6 flex items-center justify-center text-white hover:text-primary"
                >
                  <X size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label={t("admin.slides.moveDown")}
                  onClick={() => move(url, 1)}
                  disabled={i === items.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-white hover:text-highlight disabled:opacity-30"
                >
                  <ArrowRight size={12} weight="bold" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
          <ImageIcon size={15} /> {t("admin.form.galleryEmpty")}
        </p>
      )}

      {items.length < MAX_IMAGES && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn btn-outline !px-3.5 !py-2 text-[13px] disabled:opacity-60"
          >
            <UploadSimple size={15} weight="bold" />
            {busy ? t("admin.form.uploading") : t("admin.form.chooseFiles")}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
              aria-label={t("admin.form.imageUrl")}
              className="field flex-1 px-3.5 py-2 text-[13px]"
            />
            <button
              type="button"
              onClick={() => {
                const u = urlDraft.trim();
                if (u) setItems((prev) => (prev.includes(u) || prev.length >= MAX_IMAGES ? prev : [...prev, u]));
                setUrlDraft("");
              }}
              disabled={!urlDraft.trim()}
              aria-label={t("admin.form.addPhoto")}
              className="btn !px-3 !py-2 text-[13px] border-2 border-line hover:border-ink disabled:opacity-50"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>
          <input
            type="file"
            accept={ACCEPT}
            multiple
            ref={inputRef}
            onChange={(e) => void handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div role="alert" className="text-[13px] leading-snug">
          <p className="font-bold text-primary">{error.title}</p>
          {error.solution && <p className="mt-0.5 text-ink-soft">{error.solution}</p>}
        </div>
      )}
    </div>
  );
}
