import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/app/produtos/actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <h1 className="mb-1 text-2xl font-semibold">Novo produto</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Cadastre um calçado novo, defina o modelo, as fotos e o estoque por
        tamanho.
      </p>

      <ProductForm
        categories={categories ?? []}
        action={createProduct}
        submitLabel="Salvar produto"
      />
    </main>
  );
}
