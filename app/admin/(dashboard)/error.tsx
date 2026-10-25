"use client";

import { useEffect } from "react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] dashboard error:", error);
  }, [error]);

  const isDbError =
    error.message.includes("authentication") ||
    error.message.includes("ECIRCUITBREAKER") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("connect");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-5xl">⚠️</div>
      {isDbError ? (
        <>
          <h2 className="text-[20px] font-bold">Connexion base de données échouée</h2>
          <p className="text-[14px] text-ink-soft max-w-md">
            Impossible de se connecter à la base de données. Vérifiez{" "}
            <code className="font-mono text-primary">.env.local</code> →{" "}
            <code className="font-mono text-primary">DATABASE_URL</code> et
            redémarrez le serveur.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-[20px] font-bold">Une erreur est survenue</h2>
          <p className="text-[14px] text-ink-soft max-w-md">{error.message}</p>
        </>
      )}
      <button onClick={reset} className="btn btn-outline mt-2">
        Réessayer
      </button>
    </div>
  );
}
