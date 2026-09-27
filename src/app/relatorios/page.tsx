import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatSize } from "@/lib/sizes";
import type { StockMovementWithProduct } from "@/types/database";

export const dynamic = "force-dynamic";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function monthKey(dateIso: string) {
  return dateIso.slice(0, 7); // "YYYY-MM"
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} de ${year}`;
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: movementsRaw, error } = await supabase
    .from("stock_movements")
    .select(
      "*, product:products(reference_code, color, category:categories(name))"
    )
    .order("created_at", { ascending: false });

  const movements = (movementsRaw ??
    []) as unknown as StockMovementWithProduct[];

  const summaryByMonth = new Map<
    string,
    { entradas: number; saidas: number }
  >();
  for (const m of movements) {
    const key = monthKey(m.created_at);
    const entry = summaryByMonth.get(key) ?? { entradas: 0, saidas: 0 };
    if (m.type === "entrada") entry.entradas += m.quantity;
    else entry.saidas += m.quantity;
    summaryByMonth.set(key, entry);
  }

  const months = [...summaryByMonth.keys()].sort((a, b) => (a < b ? 1 : -1));
  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonth = params.mes ?? months[0] ?? currentMonth;
  const isAll = selectedMonth === "todos";

  const filteredMovements = isAll
    ? movements
    : movements.filter((m) => monthKey(m.created_at) === selectedMonth);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">
        Relatórios de estoque
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Quanto entrou e quanto saiu de estoque, mês a mês.
      </p>

      {error && (
        <p className="mb-6 rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">
          Erro ao carregar movimentações: {error.message}
        </p>
      )}

      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-base font-semibold text-[var(--text)]">
          Resumo por mês
        </h2>
        {months.length === 0 ? (
          <p className="text-sm text-[var(--text-faint)]">
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
                  <th className="pb-2 pr-4 font-medium">Mês</th>
                  <th className="pb-2 pr-4 font-medium">Entradas</th>
                  <th className="pb-2 pr-4 font-medium">Saídas</th>
                  <th className="pb-2 pr-4 font-medium">Saldo</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {months.map((key) => {
                  const { entradas, saidas } = summaryByMonth.get(key)!;
                  return (
                    <tr key={key}>
                      <td className="py-2 pr-4 text-[var(--text)]">
                        {monthLabel(key)}
                      </td>
                      <td className="py-2 pr-4 text-[var(--success)]">
                        +{entradas}
                      </td>
                      <td className="py-2 pr-4 text-[var(--danger)]">
                        -{saidas}
                      </td>
                      <td className="py-2 pr-4 font-medium text-[var(--text)]">
                        {entradas - saidas}
                      </td>
                      <td className="py-2">
                        <Link
                          href={`/relatorios?mes=${key}`}
                          className={
                            "rounded-md border px-2 py-1 text-xs font-medium " +
                            (selectedMonth === key
                              ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                              : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)]")
                          }
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Movimentações
            {!isAll && ` — ${monthLabel(selectedMonth)}`}
          </h2>
          <Link
            href="/relatorios?mes=todos"
            className={
              "rounded-md border px-3 py-1.5 text-xs font-medium " +
              (isAll
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)]")
            }
          >
            Ver todos os meses
          </Link>
        </div>

        {filteredMovements.length === 0 ? (
          <p className="text-sm text-[var(--text-faint)]">
            Nenhuma movimentação neste período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
                  <th className="pb-2 pr-4 font-medium">Data</th>
                  <th className="pb-2 pr-4 font-medium">Produto</th>
                  <th className="pb-2 pr-4 font-medium">Modelo</th>
                  <th className="pb-2 pr-4 font-medium">Tamanho</th>
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredMovements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-4 text-[var(--text-muted)]">
                      {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 pr-4 text-[var(--text)]">
                      {m.product?.reference_code ?? "—"}
                      {m.product?.color ? ` · ${m.product.color}` : ""}
                    </td>
                    <td className="py-2 pr-4 text-[var(--text-muted)]">
                      {m.product?.category?.name ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-[var(--text)]">
                      {formatSize(m.size)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs font-medium " +
                          (m.type === "entrada"
                            ? "bg-[var(--success-bg)] text-[var(--success)]"
                            : "bg-[var(--danger-bg)] text-[var(--danger)]")
                        }
                      >
                        {m.type === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="py-2 text-[var(--text)]">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
