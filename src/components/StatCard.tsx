export default function StatCard({
  label,
  value,
  tone = "neutral",
  delta,
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  /** Variação percentual frente ao período anterior, ex: 20 ou -12. */
  delta?: number | null;
}) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    danger: "text-[var(--danger)]",
    accent: "text-[var(--accent)]",
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {delta !== undefined && (
        <p className="mt-1 text-xs font-medium text-[var(--text-faint)]">
          {delta === null ? (
            "Sem dados do mês anterior"
          ) : (
            <span
              className={
                delta > 0
                  ? "text-[var(--success)]"
                  : delta < 0
                    ? "text-[var(--danger)]"
                    : "text-[var(--text-faint)]"
              }
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)}%
            </span>
          )}
          {delta !== null && " vs. mês passado"}
        </p>
      )}
    </div>
  );
}
