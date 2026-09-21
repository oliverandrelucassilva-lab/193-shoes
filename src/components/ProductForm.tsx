import Link from "next/link";
import { SHOE_SIZES, formatSize } from "@/lib/sizes";
import type { Category, ProductWithRelations } from "@/types/database";

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Código de referência *
          <input
            name="reference_code"
            required
            defaultValue={product?.reference_code}
            placeholder="Ex: REF-1023"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Modelo *
          <select
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
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

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Cor
          <input
            name="color"
            defaultValue={product?.color ?? ""}
            placeholder="Ex: Nude"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Preço de venda (R$)
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            defaultValue={product?.price ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Preço de custo (R$)
          <input
            type="number"
            step="0.01"
            min="0"
            name="cost_price"
            defaultValue={product?.cost_price ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 pt-6 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="h-4 w-4"
          />
          Produto ativo (aparece no estoque)
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Observações
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          placeholder="Detalhes do calçado, fornecedor, etc."
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-800">
          Estoque por tamanho
        </h3>
        <p className="mb-2 text-xs text-zinc-500">
          Quantidade em estoque e, se quiser, a foto daquele tamanho
          específico (para compartilhar rápido com a cliente).
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
          {SHOE_SIZES.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center gap-1 rounded-md border border-zinc-200 p-2 text-xs"
            >
              <span className="font-semibold text-zinc-600">
                {formatSize(size)}
              </span>
              <input
                type="number"
                min="0"
                name={`size_${size}`}
                defaultValue={sizeQuantities.get(size) ?? 0}
                className="w-full rounded border border-zinc-300 px-1 py-1 text-center"
              />
              <input
                type="file"
                name={`size_photo_${size}`}
                accept="image/*"
                className="w-full text-[10px] file:mr-1 file:rounded file:border-0 file:bg-zinc-100 file:px-1 file:py-0.5"
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Outras fotos (gerais do produto)
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-sm"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {submitLabel}
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
