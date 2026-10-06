import Link from "next/link";
import { SHOE_SIZES, formatSize } from "@/lib/sizes";
import type { Category, ProductWithRelations } from "@/types/database";

const inputClass =
  "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none";
const labelClass =
  "flex flex-col gap-1 text-sm font-medium text-[var(--text)]";

export default function ProductForm({
  categories,
  product,
  action,
  submitLabel,
}: {
  categories: Category[];
  product?: ProductWithRelations;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  const sizeQuantities = new Map(
    (product?.product_sizes ?? []).map((s) => [s.size, s.quantity])
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-base font-semibold text-[var(--text)]">
          Informações básicas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Código de referência *
            <input
              name="reference_code"
              required
              defaultValue={product?.reference_code}
              placeholder="Ex: REF-1023"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Modelo *
            <select
              name="category_id"
              required
              defaultValue={product?.category_id ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Cor
            <input
              name="color"
              defaultValue={product?.color ?? ""}
              placeholder="Ex: Nude"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Preço de venda (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              defaultValue={product?.price ?? ""}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Preço de custo (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              name="cost_price"
              defaultValue={product?.cost_price ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2 pt-6 text-sm font-medium text-[var(--text)]">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Produto ativo (aparece no estoque)
          </label>
        </div>

        <label className={`${labelClass} mt-4`}>
          Observações
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            placeholder="Detalhes do calçado, fornecedor, etc."
            className={inputClass}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-base font-semibold text-[var(--text)]">
          Estoque por tamanho
        </h2>
        <p className="mb-4 mt-1 text-xs text-[var(--text-muted)]">
          Quantidade em estoque e, se quiser, a foto daquele tamanho
          específico (para compartilhar rápido com a cliente).
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
          {SHOE_SIZES.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] p-2 text-xs"
            >
              <span className="font-semibold text-[var(--text-muted)]">
                {formatSize(size)}
              </span>
              <input
                type="number"
                min="0"
                name={`size_${size}`}
                defaultValue={sizeQuantities.get(size) ?? 0}
                className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-1 text-center text-[var(--text)]"
              />
              <input
                type="file"
                name={`size_photo_${size}`}
                accept="image/*"
                className="w-full text-[10px] text-[var(--text-muted)] file:mr-1 file:rounded file:border-0 file:bg-[var(--surface-hover)] file:px-1 file:py-0.5 file:text-[var(--text)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <label className={labelClass}>
          Outras fotos (gerais do produto)
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--text-muted)] file:mr-2 file:rounded file:border-0 file:bg-[var(--surface-hover)] file:px-2 file:py-1 file:text-[var(--text)]"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          {submitLabel}
        </button>
        <Link
          href="/estoque"
          className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
