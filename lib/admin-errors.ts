/**
 * Turn a raw server/DB failure into something the shop admin can act on.
 *
 * The dashboard is operated by non-developers. Driver strings such as
 * "Connection terminated due to connection timeout" or "duplicate key value
 * violates unique constraint products_slug_key" mean nothing to them, so
 * `e.message` must never reach the UI. Every rule below states the problem in
 * plain French *and* the concrete next step.
 *
 * `actionState()` adapts the result to the shape `useActionState` expects.
 */

export interface AdminProblem {
  title: string;
  solution: string;
}

const GENERIC: AdminProblem = {
  title: "L'enregistrement a échoué.",
  solution:
    "Réessayez dans quelques secondes. Si le problème revient, prévenez la personne qui gère le site.",
};

const RULES: { test: RegExp; problem: AdminProblem }[] = [
  {
    // pg: "Connection terminated due to connection timeout", ECONNRESET,
    // ENOTFOUND, socket hang up, fetch failed…
    test:
      /connection terminated|connection timeout|etimedout|econnreset|econnrefused|ehostunreach|enetunreach|socket hang up|getaddrinfo|enotfound|epipe|fetch failed|network error|could not connect|timeout exceeded|too many connections|53300/i,
    problem: {
      title: "La connexion au site a été interrompue.",
      solution:
        "Votre modification n'a PAS été enregistrée. Attendez quelques secondes, puis réessayez.",
    },
  },
  {
    // pg: unique_violation (23505) — "duplicate key value violates unique
    // constraint ..."
    test: /23505|duplicate key value|unique constraint/i,
    problem: {
      title: "Ce nom ou cet identifiant est déjà utilisé.",
      solution:
        "Changez le nom ou le slug pour un libellé unique, puis réessayez.",
    },
  },
  {
    // pg: foreign_key_violation (23503)
    test: /23503|foreign key constraint|violates foreign key/i,
    problem: {
      title: "Cet élément est encore lié à d'autres données.",
      solution:
        "Retirez d'abord les produits ou commandes qui l'utilisent, puis réessayez.",
    },
  },
  {
    // pg: not_null_violation (23502)
    test: /23502|null value in column|not-null constraint/i,
    problem: {
      title: "Un champ obligatoire est vide.",
      solution: "Remplissez tous les champs marqués d'une étoile (*), puis réessayez.",
    },
  },
  {
    // pg: check_violation (23514)
    test: /23514|check constraint/i,
    problem: {
      title: "Une valeur saisie n'est pas autorisée.",
      solution: "Vérifiez les nombres et les options proposés, corrigez, puis réessayez.",
    },
  },
  {
    // pg: invalid_password (28P01) / invalid_authorization_specification (28000)
    test: /28P01|28000|password authentication failed|no password supplied|role .* does not exist/i,
    problem: {
      title: "Le site n'arrive pas à joindre sa base de données.",
      solution:
        "C'est un réglage technique : prévenez la personne qui gère le site, rien à faire de votre côté.",
    },
  },
  {
    // pg: undefined_table (42P01) / invalid_catalog_name (3D000) — migration manquante
    test: /42P01|3D000|relation .* does not exist|does not exist/i,
    problem: {
      title: "La base de données n'est pas encore à jour.",
      solution:
        "Un script d'installation n'a pas été exécuté : prévenez la personne qui gère le site.",
    },
  },
  {
    // pg: serialization_failure (40001) / deadlock_detected (40P01)
    test: /40001|40P01|deadlock detected|could not serialize access/i,
    problem: {
      title: "Deux modifications se sont croisées en même temps.",
      solution: "Réessayez : cette fois, une seule modification partira à la fois.",
    },
  },
  {
    // pg: insufficient_privilege (42501)
    test: /42501|permission denied|insufficient privilege/i,
    problem: {
      title: "Cette action n'est pas autorisée pour le moment.",
      solution: "Vérifiez d'être bien connecté, puis réessayez. Sinon, prévenez le gestionnaire du site.",
    },
  },
  {
    // TLS / pooler misconfiguration
    test: /ssl|self.signed certificate|certificate|tls/i,
    problem: {
      title: "La connexion sécurisée au site a échoué.",
      solution:
        "Votre modification n'a PAS été enregistrée. Réessayez dans quelques secondes.",
    },
  },
  {
    // prepared statement vanished — transaction pooler race
    test: /prepared statement .* does not exist|protocol violation/i,
    problem: {
      title: "La connexion a été coupée au milieu de l'opération.",
      solution: "Votre modification n'a PAS été enregistrée. Réessayez simplement.",
    },
  },
  {
    // Cloudinary / image upload
    test: /cloudinary|upload|image.*invalid|file.*too.*large|unsupported image/i,
    problem: {
      title: "L'image n'a pas pu être envoyée.",
      solution:
        "Vérifiez qu'il s'agit bien d'une image (JPEG, PNG, WebP, AVIF, GIF ou SVG) de moins de 8 Mo, puis réessayez.",
    },
  },
];

/** Map any thrown value to a plain-language problem + solution. */
export function explainError(err: unknown): AdminProblem {
  const raw =
    err instanceof Error
      ? `${err.name} ${err.message} ${err.stack ?? ""}`
      : typeof err === "string"
        ? err
        : "";

  for (const rule of RULES) {
    if (rule.test.test(raw)) return rule.problem;
  }
  return GENERIC;
}

/** Adapt an error to the `ActionState` consumed by `useActionState`. */
export function actionState(err: unknown): {
  error: string;
  solution: string;
} {
  const { title, solution } = explainError(err);
  return { error: title, solution };
}
