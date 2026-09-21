import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import ShareImageButton from "@/components/ShareImageButton";
import { productImageUrl } from "@/lib/image";
import { formatSize } from "@/lib/sizes";
import {
  updateProduct,
  deleteProduct,
  deleteImage,
  adjustStock,
  uploadSizePhoto,
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

  const generalImages = product.product_images
    .filter((img) => img.size == null)
    .sort((a, b) => a.position - b.position);

  const imagesBySize = new Map<number, typeof product.product_images>();
  for (const img of product.product_images) {
    if (img.size == null) continue;
    const list = imagesBySize.get(img.size) ?? [];
    list.push(img);
    imagesBySize.set(img.size, list);
  }

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
        <h2 className="mb-2 text-sm font-semibold text-zinc-800">
          Fotos gerais
        </h2>
        {generalImages.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma foto cadastrada.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {generalImages.map((img) => (
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
          Estoque e fotos por tamanho
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          Ajuste a quantidade e guarde a foto de cada tamanho aqui: quando a
          cliente perguntar por um número, é só abrir e tocar em
          &quot;Compartilhar&quot; para enviar direto no WhatsApp.
        </p>
        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {sizesSorted.map((s) => {
            const photos = imagesBySize.get(s.size) ?? [];
            return (
              <div key={s.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
                <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
                  <span className="font-semibold">{formatSize(s.size)}</span>
                  <form action={adjustStock.bind(null, product.id, s.size, -1)}>
                    <button
                      type="submit"
                      className="h-6 w-6 rounded bg-zinc-100 text-sm hover:bg-zinc-200"
                    >
                      -
                    </button>
                  </form>
                  <span className="w-5 text-center text-sm">{s.quantity}</span>
                  <form action={adjustStock.bind(null, product.id, s.size, 1)}>
                    <button
                      type="submit"
                      className="h-6 w-6 rounded bg-zinc-100 text-sm hover:bg-zinc-200"
                    >
                      +
                    </button>
                  </form>
                </div>

                <div className="flex flex-1 flex-wrap items-center gap-3">
                  {photos.map((img) => (
                    <div key={img.id} className="flex items-center gap-2">
                      <div className="relative h-16 w-16 shrink-0">
                        <Image
                          src={productImageUrl(img.storage_path)}
                          alt={`Tamanho ${formatSize(s.size)}`}
                          fill
                          sizes="64px"
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <ShareImageButton
                          imageUrl={productImageUrl(img.storage_path)}
                          fileName={`${product.reference_code}-${formatSize(s.size)}.jpg`}
                          label="Compartilhar"
                        />
                        <form
                          action={deleteImage.bind(null, img.id, product.id)}
                        >
                          <button
                            type="submit"
                            className="text-xs text-red-600 underline"
                          >
                            Remover
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                  <form
                    action={uploadSizePhoto.bind(null, product.id, s.size)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      required
                      className="text-xs file:mr-1 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50"
                    >
                      {photos.length > 0 ? "Adicionar outra" : "Adicionar foto"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
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
