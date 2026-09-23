import { createClient } from "@/lib/supabase/server";
import { createCategory, renameCategory, deleteCategory } from "./actions";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">
        Modelos de calçado
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Como os calçados geralmente não têm um nome próprio, organize o
        estoque pelos modelos da loja (sapatilha, slingback, sapato social,
        sandália...).
      </p>

      <form
        action={createCategory}
        className="mb-6 flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <input
          name="name"
          required
          placeholder="Novo modelo, ex: Slingback"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          Adicionar
        </button>
      </form>

      <ul className="flex flex-col divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {(categories ?? []).map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-3 p-3 text-sm"
          >
            <form
              action={renameCategory.bind(null, category.id)}
              className="flex flex-1 items-center gap-2"
            >
              <input
                name="name"
                defaultValue={category.name}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text)]"
              />
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
              >
                Salvar
              </button>
            </form>
            <form action={deleteCategory.bind(null, category.id)}>
              <button
                type="submit"
                className="rounded-lg border border-[var(--danger-border)] px-2 py-1.5 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-bg)]"
              >
                Excluir
              </button>
            </form>
          </li>
        ))}
        {(categories ?? []).length === 0 && (
          <li className="p-4 text-sm text-[var(--text-faint)]">
            Nenhum modelo cadastrado ainda.
          </li>
        )}
      </ul>
    </main>
  );
}
