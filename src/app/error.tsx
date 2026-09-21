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
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Tentar novamente
      </button>
      <Link href="/" className="text-sm text-zinc-500 underline">
        Voltar para o estoque
      </Link>
    </main>
  );
}
