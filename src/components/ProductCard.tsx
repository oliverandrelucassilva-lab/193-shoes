import Link from "next/link";
import Image from "next/image";
import { productImageUrl } from "@/lib/image";
import { formatSize } from "@/lib/sizes";
import type { ProductWithRelations } from "@/types/database";

export default function ProductCard({
  product,
}: {
  product: ProductWithRelations;
}) {
  const totalStock = product.product_sizes.reduce(
    (sum, s) => sum + s.quantity,
    0
  );
  const cover = product.product_images[0];
  const availableSizes = product.product_sizes
    .filter((s) => s.quantity > 0)
    .sort((a, b) => a.size - b.size);

  return (
    <Link
      href={`/produtos/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-[var(--surface-hover)]">
        {cover ? (
          <Image
            src={productImageUrl(cover.storage_path)}
            alt={product.reference_code}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-faint)]">
            Sem foto
          </div>
        )}
        {totalStock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            Esgotado
          </span>
        )}
        {totalStock > 0 && totalStock <= 3 && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
            Estoque baixo
          </span>
        )}
        {!product.active && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--text)] px-2 py-0.5 text-xs font-medium text-[var(--surface)]">
            Inativo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">
            {product.reference_code}
          </span>
          {product.price != null && (
            <span className="text-sm font-medium text-[var(--text)]">
              R$ {Number(product.price).toFixed(2)}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {product.category?.name ?? "Sem modelo"}
          {product.color ? ` · ${product.color}` : ""}
        </span>

        <div className="mt-2 flex flex-wrap gap-1">
          {availableSizes.length === 0 && (
            <span className="text-xs text-[var(--text-faint)]">
              Nenhum tamanho disponível
            </span>
          )}
          {availableSizes.map((s) => (
            <span
              key={s.id}
              className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)]"
            >
              {formatSize(s.size)} ({s.quantity})
            </span>
          ))}
        </div>

        <span className="mt-auto pt-2 text-xs font-medium text-[var(--text-muted)]">
          Total em estoque: {totalStock}
        </span>
      </div>
    </Link>
  );
}
