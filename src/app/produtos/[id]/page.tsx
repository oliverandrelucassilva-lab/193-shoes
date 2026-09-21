import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { productImageUrl } from "@/lib/image";
import { formatSize } from "@/lib/sizes";
import {
  updateProduct,
  deleteProduct,
  deleteImage,
  adjustStock,
} from "@/app/produtos/actions";
import type { ProductWithRelations } from "@/types/database";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: productRaw }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select(
        "*, category:categories(*), product_images(*), product_sizes(*)"
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!productRaw) notFound();

  const product = productRaw as unknown as ProductWithRelations;
  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDelete = deleteProduct.bind(null, product.id);

  const sizesSorted = [...product.product_sizes].sort(
    (a, b) => a.size - b.size
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.reference_code}</h1>
          <p className="text-sm text-zinc-500">
            {product.category?.name ?? "Sem modelo"}
          </p>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir produto
          </button>
        </form>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-800">Fotos</h2>
        {product.product_images.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma foto cadastrada.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {product.product_images.map((img) => (
              <div key={img.id} className="relative aspect-square">
                <Image
                  src={productImageUrl(img.storage_path)}
                  alt={product.reference_code}
                  fill
                  sizes="120px"
                  className="rounded-md object-cover"
                />
                <form
                  action={deleteImage.bind(null, img.id, product.id)}
                  className="absolute right-1 top-1"
                >
                  <button
                    type="submit"
                    className="rounded-full bg-black/70 px-2 py-0.5 text-xs text-white hover:bg-black"
                  >
                    x
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-zinc-800">
          Ajuste rápido de estoque
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          Use os botões para dar entrada/saída rápida sem precisar editar o
          formulário inteiro.
        </p>
        <div className="flex flex-wrap gap-2">
          {sizesSorted
            .filter((s) => s.quantity > 0)
            .map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 text-sm"
              >
                <span className="font-medium">{formatSize(s.size)}</span>
                <form action={adjustStock.bind(null, product.id, s.size, -1)}>
                  <button
                    type="submit"
                    className="h-6 w-6 rounded bg-zinc-100 hover:bg-zinc-200"
                  >
                    -
                  </button>
                </form>
                <span className="w-5 text-center">{s.quantity}</span>
                <form action={adjustStock.bind(null, product.id, s.size, 1)}>
                  <button
                    type="submit"
                    className="h-6 w-6 rounded bg-zinc-100 hover:bg-zinc-200"
                  >
                    +
                  </button>
                </form>
              </div>
            ))}
          {sizesSorted.every((s) => s.quantity === 0) && (
            <p className="text-sm text-zinc-400">
              Nenhum tamanho com estoque no momento.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">
          Editar produto
        </h2>
        <ProductForm
          categories={categories ?? []}
          product={product}
          action={boundUpdate}
          submitLabel="Salvar alterações"
        />
      </section>
    </main>
  );
}
