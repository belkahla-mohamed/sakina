"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Backpack, BookOpen, Gift, PuzzlePiece, TShirt } from "@phosphor-icons/react";
import { saveCategory, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import type { Category } from "@/lib/types";

const ICONS: Record<string, typeof Gift> = {
  gift: Gift,
  puzzle: PuzzlePiece,
  book: BookOpen,
  backpack: Backpack,
  tshirt: TShirt,
};

const ICON_OPTIONS = [
  { value: "gift", label: "Cadeau" },
  { value: "puzzle", label: "Puzzle" },
  { value: "book", label: "Livre" },
  { value: "backpack", label: "Sac à dos" },
  { value: "tshirt", label: "T-shirt" },
];

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveCategory,
    {}
  );
  useActionToast(state);
  const isEdit = Boolean(category);
  const [color, setColor] = useState(category?.color ?? "#FF6B9D");
  const [icon, setIcon] = useState(category?.icon ?? "gift");
  const [textChoice, setTextChoice] = useState(category?.text ?? "light");

  const label = "block text-[13.5px] font-bold mb-1.5";
  const field = "field w-full px-3.5 py-2.5";

  const PreviewIcon = ICONS[icon] ?? Gift;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {isEdit && <input type="hidden" name="existing_slug" value={category!.slug} />}

      {/* Identity */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Identité</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name_fr" className={label}>
              Nom (FR) <span className="text-primary">*</span>
            </label>
            <input id="name_fr" name="name_fr" defaultValue={category?.name_fr} required className={field} />
          </div>
          <div>
            <label htmlFor="name_ar" className={label}>
              Nom (AR) <span className="text-primary">*</span>
            </label>
            <input id="name_ar" name="name_ar" dir="rtl" defaultValue={category?.name_ar} required className={`${field} ar`} />
          </div>
        </div>
        <div>
          <label htmlFor="slug" className={label}>
            Slug {isEdit ? "(inchangé)" : "(vide = généré)"}
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            // `readOnly` (not `disabled`): a disabled control is dropped from
            // FormData, so the upsert would create a duplicate category.
            readOnly={isEdit}
            placeholder="jeux-en-bois"
            aria-readonly={isEdit}
            className={`${field} read-only:opacity-60 read-only:cursor-default`}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tagline_fr" className={label}>
              Accroche (FR)
            </label>
            <input id="tagline_fr" name="tagline_fr" defaultValue={category?.tagline_fr ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="tagline_ar" className={label}>
              Accroche (AR)
            </label>
            <input id="tagline_ar" name="tagline_ar" dir="rtl" defaultValue={category?.tagline_ar ?? ""} className={`${field} ar`} />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Apparence</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="color" className={label}>
              Couleur
            </label>
            <div className="flex items-center gap-2.5">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Choisir la couleur"
                className="w-12 h-11 rounded-[10px] border-2 border-line bg-white p-1 cursor-pointer"
              />
              <input
                type="text"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                aria-label="Code couleur hexadécimal"
                className={`${field} flex-1 font-mono`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="text" className={label}>
              Couleur du texte
            </label>
            <select
              id="text"
              name="text"
              value={textChoice}
              onChange={(e) => setTextChoice(e.target.value as "light" | "dark")}
              className={field}
            >
              <option value="light">Blanc</option>
              <option value="dark">Encre</option>
            </select>
          </div>
        </div>

        <div>
          <span className={label}>Icône</span>
          <input type="hidden" name="icon" value={icon} />
          <div className="flex flex-wrap gap-2.5">
            {ICON_OPTIONS.map((opt) => {
              const Icon = ICONS[opt.value] ?? Gift;
              const active = icon === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 w-[76px] py-3 rounded-[12px] border-2 transition-colors ${
                    active ? "border-ink bg-highlight/25" : "border-line hover:border-ink/40"
                  }`}
                >
                  <Icon size={22} weight={active ? "fill" : "regular"} />
                  <span className="text-[11px] font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <span className={label}>Aperçu</span>
          <div
            className={`card flex items-center justify-between p-4 border-ink ${
              textChoice === "dark" ? "text-ink" : "text-white"
            }`}
            style={{ background: color }}
          >
            <div>
              <p className="font-display text-[16.5px] font-bold leading-tight">Nom de la catégorie</p>
              <p className={`text-[11.5px] mt-1 ${textChoice === "dark" ? "text-ink-soft" : "opacity-85"}`}>
                0 produits
              </p>
            </div>
            <PreviewIcon size={28} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[14.5px] font-bold pt-1">
          <input type="checkbox" name="featured" defaultChecked={category?.featured} className="w-4.5 h-4.5 accent-primary" />
          Mettre en avant sur l&apos;accueil
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la catégorie"}
        </button>
        <Link href="/admin/categories" className="btn btn-outline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
