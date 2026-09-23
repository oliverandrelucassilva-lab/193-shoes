import Image from "next/image";

export default function SetupPendentePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <Image
        src="/logo.png"
        alt="193 Shoes"
        width={72}
        height={72}
        className="rounded-full"
        priority
      />
      <h1 className="text-xl font-semibold text-[var(--text)]">
        193 Shoes — quase lá!
      </h1>
      <p className="text-sm text-[var(--text-muted)]">
        O site já está publicado, mas ainda falta conectar o banco de dados
        (Supabase) para o estoque funcionar.
      </p>
      <div className="rounded-lg bg-[var(--warning-bg)] px-4 py-3 text-left text-sm text-[var(--warning)]">
        <p className="font-medium">Falta configurar:</p>
        <ol className="mt-1 list-decimal pl-5">
          <li>Criar o projeto no Supabase</li>
          <li>Rodar as migrations do banco</li>
          <li>Criar o usuário de login da loja</li>
          <li>
            Adicionar <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nas variáveis de
            ambiente da Vercel
          </li>
        </ol>
      </div>
      <p className="text-xs text-[var(--text-faint)]">
        O passo a passo completo está no README do repositório.
      </p>
    </main>
  );
}
