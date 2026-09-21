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
      <h1 className="mb-1 text-2xl font-semibold">Modelos de calçado</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Como os calçados geralmente não têm um nome próprio, organize o
        estoque pelos modelos da loja (sapatilha, slingback, sapato social,
        sandália...).
      </p>

      <form
        action={createCategory}
        className="mb-6 flex gap-2 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <input
          name="name"
          required
          placeholder="Novo modelo, ex: Slingback"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Adicionar
        </button>
      </form>

      <ul className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
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
                className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5"
              />
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-50"
              >
                Salvar
              </button>
            </form>
            <form action={deleteCategory.bind(null, category.id)}>
              <button
                type="submit"
                className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </form>
          </li>
        ))}
        {(categories ?? []).length === 0 && (
          <li className="p-4 text-sm text-zinc-400">
            Nenhum modelo cadastrado ainda.
          </li>
        )}
      </ul>
    </main>
  );
}
