"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, UploadSimple, X } from "@phosphor-icons/react";

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
  label = "Image",
}: {
  name?: string;
  value?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(value);
  const [preview, setPreview] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Format non supporté. JPEG, PNG, WebP, AVIF, GIF ou SVG.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum ${MAX_MB} Mo.`);
      return;
    }

    // Local preview while the upload runs, so the box never flashes empty.
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "product");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        throw new Error(data.error || `Échec de l'envoi (HTTP ${res.status}).`);
      }

      URL.revokeObjectURL(local);
      setUrl(data.url);
      setPreview(data.url);
    } catch (e) {
      URL.revokeObjectURL(local);
      setPreview(url);
      setError(e instanceof Error ? e.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setUrl("");
    setPreview("");
    setError(null);
  }

  return (
    <div className="space-y-2.5">
      {/* The form submits this string — same shape saveProduct already expects. */}
      <input type="hidden" name={name} value={url} />

      <span className="block text-[13.5px] font-bold mb-1.5">{label}</span>

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative w-24 h-24 shrink-0 rounded-[12px] overflow-hidden border-2 border-dashed border-line bg-highlight/20 flex items-center justify-center">
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Aperçu du produit"
                fill
                sizes="96px"
                className="object-cover"
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
            }}
            placeholder="https://res.cloudinary.com/… ou /img/products/…"
            aria-label="URL de l'image"
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
              {busy ? "Envoi vers Cloudinary…" : "Envoyer vers Cloudinary"}
            </button>
            {url && (
              <button
                type="button"
                onClick={clear}
                disabled={busy}
                aria-label="Retirer l'image"
                className="btn !px-2.5 !py-2 text-[12.5px] border-2 border-line text-ink-soft hover:border-primary hover:text-primary"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-[13px] font-bold text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
