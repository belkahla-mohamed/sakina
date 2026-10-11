/**
 * Turn a raw server/DB failure into something the shop admin can act on.
 *
 * The dashboard is operated by non-developers. Driver strings such as
 * "Connection terminated due to connection timeout" or "duplicate key value
 * violates unique constraint products_slug_key" mean nothing to them, so
 * `e.message` must never reach the UI. Every rule below states the problem in
 * plain language (FR + AR) *and* the concrete next step.
 *
 * `actionState()` adapts the result to the shape `useActionState` expects.
 */

import type { Lang } from "@/lib/i18n";

export interface AdminProblem {
  title: string;
  solution: string;
}

interface Rule {
  test: RegExp;
  fr: AdminProblem;
  ar: AdminProblem;
}

const GENERIC: Record<Lang, AdminProblem> = {
  fr: {
    title: "L'enregistrement a échoué.",
    solution:
      "Réessayez dans quelques secondes. Si le problème revient, prévenez la personne qui gère le site.",
  },
  ar: {
    title: "فشل الحفظ.",
    solution:
      "أعد المحاولة بعد ثوانٍ. إذا تكررت المشكلة، أخبر من يدير الموقع.",
  },
};

const RULES: Rule[] = [
  {
    // The deployment has no database wired at all. This is the first thing
    // to check when every admin write fails with the generic message.
    test: /DATABASE_URL is not set|DATABASE_URL/i,
    fr: {
      title: "Le site n'est pas relié à sa base de données.",
      solution:
        "Variable DATABASE_URL manquante côté hébergeur : prévenez la personne qui gère le site.",
    },
    ar: {
      title: "الموقع غير مربوط بقاعدة البيانات.",
      solution:
        "متغير DATABASE_URL مفقود عند المستضيف: أخبر من يدير الموقع.",
    },
  },
  {
    // pg: "Connection terminated due to connection timeout", ECONNRESET,
    // ENOTFOUND, socket hang up, fetch failed…
    test:
      /connection terminated|connection timeout|etimedout|econnreset|econnrefused|ehostunreach|enetunreach|socket hang up|getaddrinfo|enotfound|epipe|fetch failed|network error|could not connect|timeout exceeded|too many connections|53300/i,
    fr: {
      title: "La connexion au site a été interrompue.",
      solution:
        "Votre modification n'a PAS été enregistrée. Attendez quelques secondes, puis réessayez.",
    },
    ar: {
      title: "انقطع الاتصال بالموقع.",
      solution:
        "لم يتم حفظ تعديلك. انتظر قليلاً ثم أعد المحاولة.",
    },
  },
  {
    // pg: unique_violation (23505) — "duplicate key value violates unique
    // constraint ..."
    test: /23505|duplicate key value|unique constraint/i,
    fr: {
      title: "Ce nom ou cet identifiant est déjà utilisé.",
      solution:
        "Changez le nom ou le slug pour un libellé unique, puis réessayez.",
    },
    ar: {
      title: "هذا الاسم أو المعرف مستخدم.",
      solution: "غير الاسم أو المعرف ثم أعد المحاولة.",
    },
  },
  {
    // pg: foreign_key_violation (23503)
    test: /23503|foreign key constraint|violates foreign key/i,
    fr: {
      title: "Cet élément est encore lié à d'autres données.",
      solution:
        "Retirez d'abord les produits ou commandes qui l'utilisent, puis réessayez.",
    },
    ar: {
      title: "هذا العنصر مرتبط ببيانات أخرى.",
      solution: "أزل المنتجات أو الطلبات المرتبطة به أولاً ثم أعد المحاولة.",
    },
  },
  {
    // pg: not_null_violation (23502)
    test: /23502|null value in column|not-null constraint/i,
    fr: {
      title: "Un champ obligatoire est vide.",
      solution: "Remplissez tous les champs marqués d'une étoile (*), puis réessayez.",
    },
    ar: {
      title: "حقل مطلوب فارغ.",
      solution: "املأ كل الحقول المعلمة بنجمة (*) ثم أعد المحاولة.",
    },
  },
  {
    // pg: check_violation (23514)
    test: /23514|check constraint/i,
    fr: {
      title: "Une valeur saisie n'est pas autorisée.",
      solution: "Vérifiez les nombres et les options proposés, corrigez, puis réessayez.",
    },
    ar: {
      title: "قيمة مدخلة غير مسموحة.",
      solution: "تحقق من الأرقام والخيارات وصحح ثم أعد المحاولة.",
    },
  },
  {
    // pg: invalid_password (28P01) / invalid_authorization_specification (28000)
    test: /28P01|28000|password authentication failed|no password supplied|role .* does not exist/i,
    fr: {
      title: "Le site n'arrive pas à joindre sa base de données.",
      solution:
        "C'est un réglage technique : prévenez la personne qui gère le site, rien à faire de votre côté.",
    },
    ar: {
      title: "تعذر الوصول لقاعدة البيانات.",
      solution:
        "إعداد تقني: أخبر من يدير الموقع، لا شيء عليك فعله.",
    },
  },
  {
    // pg: undefined_table (42P01) / invalid_catalog_name (3D000) — migration manquante
    test: /42P01|3D000|relation .* does not exist|does not exist/i,
    fr: {
      title: "La base de données n'est pas encore à jour.",
      solution:
        "Un script d'installation n'a pas été exécuté : prévenez la personne qui gère le site.",
    },
    ar: {
      title: "قاعدة البيانات غير محدثة.",
      solution:
        "لم يتم تشغيل سكريبت التثبيت: أخبر من يدير الموقع.",
    },
  },
  {
    // pg: serialization_failure (40001) / deadlock_detected (40P01)
    test: /40001|40P01|deadlock detected|could not serialize access/i,
    fr: {
      title: "Deux modifications se sont croisées en même temps.",
      solution: "Réessayez : cette fois, une seule modification partira à la fois.",
    },
    ar: {
      title: "تعديلان تزامنا في نفس الوقت.",
      solution: "أعد المحاولة: هذه المرة سيرسل تعديل واحد فقط.",
    },
  },
  {
    // pg: insufficient_privilege (42501)
    test: /42501|permission denied|insufficient privilege/i,
    fr: {
      title: "Cette action n'est pas autorisée pour le moment.",
      solution: "Vérifiez d'être bien connecté, puis réessayez. Sinon, prévenez le gestionnaire du site.",
    },
    ar: {
      title: "هذا الإجراء غير مسموح حالياً.",
      solution: "تأكد من تسجيل الدخول ثم أعد المحاولة، وإلا أخبر مدير الموقع.",
    },
  },
  {
    // TLS / pooler misconfiguration
    test: /ssl|self.signed certificate|certificate|tls/i,
    fr: {
      title: "La connexion sécurisée au site a échoué.",
      solution:
        "Votre modification n'a PAS été enregistrée. Réessayez dans quelques secondes.",
    },
    ar: {
      title: "فشل الاتصال الآمن بالموقع.",
      solution: "لم يتم حفظ تعديلك. أعد المحاولة بعد ثوانٍ.",
    },
  },
  {
    // prepared statement vanished — transaction pooler race
    test: /prepared statement .* does not exist|protocol violation/i,
    fr: {
      title: "La connexion a été coupée au milieu de l'opération.",
      solution: "Votre modification n'a PAS été enregistrée. Réessayez simplement.",
    },
    ar: {
      title: "انقطع الاتصال أثناء العملية.",
      solution: "لم يتم حفظ تعديلك. أعد المحاولة فقط.",
    },
  },
  {
    // Cloudinary / image upload
    test: /cloudinary|upload|image.*invalid|file.*too.*large|unsupported image/i,
    fr: {
      title: "L'image n'a pas pu être envoyée.",
      solution:
        "Vérifiez qu'il s'agit bien d'une image (JPEG, PNG, WebP, AVIF, GIF ou SVG) de moins de 8 Mo, puis réessayez.",
    },
    ar: {
      title: "تعذر إرسال الصورة.",
      solution:
        "تأكد أنها صورة (JPEG، PNG، WebP، AVIF، GIF أو SVG) أقل من 8 م.ب ثم أعد المحاولة.",
    },
  },
];

/** Map any thrown value to a plain-language problem + solution. */
export function explainError(err: unknown, lang: Lang = "fr"): AdminProblem {
  console.error("[admin]", err);
  const raw =
    err instanceof Error
      ? `${err.name} ${err.message} ${err.stack ?? ""}`
      : typeof err === "string"
        ? err
        : "";

  for (const rule of RULES) {
    if (rule.test.test(raw)) return rule[lang];
  }
  return GENERIC[lang];
}

/** Adapt an error to the `ActionState` consumed by `useActionState`. */
export function actionState(
  err: unknown,
  lang: Lang = "fr"
): {
  error: string;
  solution: string;
} {
  const { title, solution } = explainError(err, lang);
  return { error: title, solution };
}
