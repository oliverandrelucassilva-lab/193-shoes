"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-[var(--text)]">
        Algo deu errado
      </h1>
      <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
      >
        Tentar novamente
      </button>
      <Link
        href="/estoque"
        className="text-sm text-[var(--text-muted)] underline"
      >
        Voltar para o estoque
      </Link>
    </main>
  );
}
