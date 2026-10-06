import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { productImageUrl } from "@/lib/image";
import { formatSize } from "@/lib/sizes";
import type {
  ProductWithRelations,
  StockMovementWithProduct,
} from "@/types/database";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 3;

export default async function HomePage() {
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ data: productsRaw, error: productsError }, { data: movementsRaw }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "*, category:categories(*), product_images(*), product_sizes(*)"
        )
        .eq("active", true)
        .order("reference_code"),
      supabase
        .from("stock_movements")
        .select(
          "*, product:products(reference_code, color, category:categories(name))"
        )
        .gte("created_at", monthStart.toISOString())
        .order("created_at", { ascending: false }),
    ]);

  const products = (productsRaw ?? []) as unknown as ProductWithRelations[];
  const movements = (movementsRaw ??
    []) as unknown as StockMovementWithProduct[];

  const withTotals = products.map((p) => ({
    product: p,
    total: p.product_sizes.reduce((sum, s) => sum + s.quantity, 0),
  }));

  const totalPairs = withTotals.reduce((sum, p) => sum + p.total, 0);
  const lowStock = withTotals
    .filter((p) => p.total > 0 && p.total <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.total - b.total);
  const outOfStock = withTotals.filter((p) => p.total === 0);

  const entradasMes = movements
    .filter((m) => m.type === "entrada")
    .reduce((sum, m) => sum + m.quantity, 0);
  const saidasMes = movements
    .filter((m) => m.type === "saida")
    .reduce((sum, m) => sum + m.quantity, 0);

  const vendidosPorProduto = new Map<
    string,
    { label: string; quantity: number }
  >();
  for (const m of movements) {
    if (m.type !== "saida") continue;
    const label = m.product
      ? `${m.product.reference_code}${m.product.color ? ` · ${m.product.color}` : ""}`
      : "Produto removido";
    const entry = vendidosPorProduto.get(m.product_id) ?? {
      label,
      quantity: 0,
    };
    entry.quantity += m.quantity;
    vendidosPorProduto.set(m.product_id, entry);
  }
  const maisVendidos = [...vendidosPorProduto.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Início</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Visão geral do estoque da 193 Shoes.
        </p>
      </div>

      {productsError && (
        <p className="mb-6 rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
          Erro ao carregar dados: {productsError.message}
        </p>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Produtos ativos" value={products.length} />
        <StatCard label="Pares em estoque" value={totalPairs} />
        <StatCard
          label="Estoque baixo"
          value={lowStock.length}
          tone={lowStock.length > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Esgotados"
          value={outOfStock.length}
          tone={outOfStock.length > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <StatCard
          label="Entradas este mês"
          value={`+${entradasMes}`}
          tone="success"
        />
        <StatCard
          label="Saídas este mês"
          value={`-${saidasMes}`}
          tone="danger"
        />
      </div>

      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Estoque baixo
          </h2>
          <Link
            href="/estoque"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Ver estoque completo
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-[var(--text-faint)]">
            Nenhum produto com estoque baixo no momento.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {lowStock.map(({ product, total }) => {
              const cover = product.product_images[0];
              const lowSizes = product.product_sizes
                .filter((s) => s.quantity > 0)
                .sort((a, b) => a.size - b.size);
              return (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-hover)]">
                    {cover && (
                      <Image
                        src={productImageUrl(cover.storage_path)}
                        alt={product.reference_code}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produtos/${product.id}`}
                      className="text-sm font-medium text-[var(--text)] hover:underline"
                    >
                      {product.reference_code}
                    </Link>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {product.category?.name ?? "Sem modelo"}
                      {product.color ? ` · ${product.color}` : ""} ·{" "}
                      {lowSizes
                        .map((s) => `${formatSize(s.size)} (${s.quantity})`)
                        .join(", ")}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                    {total} par(es)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Esgotados
          </h2>
          <Link
            href="/estoque?status=ativos"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Ver estoque completo
          </Link>
        </div>
        {outOfStock.length === 0 ? (
          <p className="text-sm text-[var(--text-faint)]">
            Nenhum produto esgotado no momento.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {outOfStock.map(({ product }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/produtos/${product.id}`}
                    className="text-sm font-medium text-[var(--text)] hover:underline"
                  >
                    {product.reference_code}
                  </Link>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {product.category?.name ?? "Sem modelo"}
                    {product.color ? ` · ${product.color}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--danger-bg)] px-2 py-0.5 text-xs font-medium text-[var(--danger)]">
                  Esgotado
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Mais vendidos este mês
          </h2>
          <Link
            href="/relatorios"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Ver relatórios
          </Link>
        </div>
        {maisVendidos.length === 0 ? (
          <p className="text-sm text-[var(--text-faint)]">
            Nenhuma venda registrada este mês ainda.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {maisVendidos.map((item, index) => (
              <li
                key={item.label + index}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-[var(--text)]">
                  {index + 1}. {item.label}
                </span>
                <span className="font-medium text-[var(--text)]">
                  {item.quantity} vendido(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
