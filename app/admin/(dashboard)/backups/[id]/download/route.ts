import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { dbGetBackupData } from "@/lib/db/backups";
import { explainError } from "@/lib/admin-errors";

/**
 * Stream a backup snapshot as a JSON attachment. Admin-session protected;
 * the file contains full catalog + orders, so it must never be public.
 *
 * This route is opened by a plain `<a download>` link, so a failure lands the
 * admin on whatever HTML we return — never a bare 404/500. Every error path
 * below states the problem AND the next step, in the admin's language.
 */

async function lang(): Promise<"fr" | "ar"> {
  return (await cookies()).get("sakina_lang")?.value === "ar" ? "ar" : "fr";
}

function errorPage(
  code: number,
  title: string,
  solution: string,
  l: "fr" | "ar"
): Response {
  const rtl = l === "ar" ? ' dir="rtl" lang="ar"' : ' lang="fr"';
  const backLabel = l === "ar" ? "العودة إلى النسخ الاحتياطية" : "Retour aux sauvegardes";
  const html = `<!doctype html>
<html${rtl}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #fcfbf6; color: #2a1d16;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
  .card { background: #fff; border: 1px solid rgba(42,29,22,.16); border-radius: 10px;
          max-width: 440px; padding: 2rem; }
  .code { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .1em;
          background: #76220a; color: #fcfbf6; border-radius: 999px; padding: .25rem .75rem; margin-bottom: 1rem; }
  h1 { font-size: 20px; line-height: 1.3; margin: 0 0 .5rem; }
  p { font-size: 14.5px; line-height: 1.6; color: #6b5a50; margin: 0 0 1.5rem; }
  a { display: inline-block; background: #76220a; color: #fcfbf6; font-weight: 700; font-size: 13px;
      letter-spacing: .08em; text-transform: uppercase; text-decoration: none; padding: .85rem 1.75rem; border-radius: 2px; }
  a:hover { background: #5c1a07; }
</style>
</head>
<body>
  <div class="card">
    <span class="code">${code}</span>
    <h1>${title}</h1>
    <p>${solution}</p>
    <a href="/admin/backups">← ${backLabel}</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: code,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const l = await lang();
  const { id: raw } = await params;
  const id = Math.floor(Number(raw));
  if (!Number.isFinite(id) || id <= 0) {
    return errorPage(
      404,
      l === "ar"
        ? "رقم النسخة الاحتياطية غير صالح."
        : "Le numéro de cette sauvegarde est invalide.",
      l === "ar"
        ? "ربما تغيّر الرابط. عد إلى القائمة واختر نسخة من هناك."
        : "Le lien a peut-être changé. Retournez à la liste et choisissez une sauvegarde depuis celle-ci.",
      l
    );
  }

  let row: Awaited<ReturnType<typeof dbGetBackupData>>;
  try {
    row = await dbGetBackupData(id);
  } catch (e) {
    const { title, solution } = explainError(e, l);
    return errorPage(500, title, solution, l);
  }
  if (!row) {
    return errorPage(
      404,
      l === "ar"
        ? "هذه النسخة لم تعد موجودة أو تم حذفها."
        : "Cette sauvegarde n'existe plus ou a été supprimée.",
      l === "ar"
        ? "أعد تحميل الصفحة لعرض القائمة المحدّثة ثم جرّب نسخة أخرى."
        : "Rechargez la page pour voir la liste à jour, puis essayez une autre sauvegarde.",
      l
    );
  }

  const date = new Date(row.created_at).toISOString().slice(0, 10);
  const body = JSON.stringify(row.data, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sakina-backup-${date}-${id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
