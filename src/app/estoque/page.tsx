import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { SHOE_SIZES, formatSize } from "@/lib/sizes";
import type { ProductWithRelations } from "@/types/database";

export const dynamic = "force-dynamic";

type SearchParams = {
  categoria?: string;
  tamanho?: string;
  busca?: string;
  status?: string;
};

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select(
      "*, category:categories(*), product_images(*), product_sizes(*)"
    )
    .order("created_at", { ascending: false });

  if (params.categoria) {
    query = query.eq("category_id", params.categoria);
  }
  if (params.busca) {
    const term = params.busca.trim();
    query = query.or(
      `reference_code.ilike.%${term}%,color.ilike.%${term}%,description.ilike.%${term}%`
    );
  }
  if (params.status === "inativos") {
    query = query.eq("active", false);
  } else if (params.status !== "todos") {
    query = query.eq("active", true);
  }

  const { data: productsRaw, error } = await query;
  let products = (productsRaw ?? []) as unknown as ProductWithRelations[];

  if (params.tamanho) {
    const size = Number(params.tamanho);
    products = products.filter((p) =>
      p.product_sizes.some((s) => s.size === size && s.quantity > 0)
    );
  }

  const totalPairs = products.reduce(
    (sum, p) =>
      sum + p.product_sizes.reduce((s, size) => s + size.quantity, 0),
    0
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Estoque
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {products.length} produto(s) · {totalPairs} par(es) em estoque
          </p>
        </div>
      </div>

      <form
        method="get"
        className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Buscar (código, cor...)
          <input
            type="text"
            name="busca"
            defaultValue={params.busca}
            placeholder="Ex: REF-1023"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--text)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Modelo
          <select
            name="categoria"
            defaultValue={params.categoria ?? ""}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--text)]"
          >
            <option value="">Todos</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Tamanho
          <select
            name="tamanho"
            defaultValue={params.tamanho ?? ""}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--text)]"
          >
            <option value="">Todos</option>
            {SHOE_SIZES.map((s) => (
              <option key={s} value={s}>
                {formatSize(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Status
          <select
            name="status"
            defaultValue={params.status ?? "ativos"}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--text)]"
          >
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </select>
        </label>

        <div className="col-span-2 flex items-end gap-2 sm:col-span-4">
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
          >
            Filtrar
          </button>
          <Link
            href="/estoque"
            className="rounded-lg border border-[var(--border)] px-4 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
          >
            Limpar
          </Link>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
          Erro ao carregar produtos: {error.message}
        </p>
      )}

      {!error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
          Nenhum produto encontrado com esses filtros.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
