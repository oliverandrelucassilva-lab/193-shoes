"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { SHOE_SIZES } from "@/lib/sizes";

function parseProductFields(formData: FormData) {
  const referenceCode = String(formData.get("reference_code") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const color = String(formData.get("color") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const costPriceRaw = String(formData.get("cost_price") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!referenceCode) throw new Error("Código de referência é obrigatório.");
  if (!categoryId) throw new Error("Selecione um modelo.");

  return {
    reference_code: referenceCode,
    category_id: categoryId,
    color: color || null,
    description: description || null,
    price: priceRaw ? Number(priceRaw) : null,
    cost_price: costPriceRaw ? Number(costPriceRaw) : null,
    active,
  };
}

async function saveSizes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  formData: FormData
) {
  const rows = SHOE_SIZES.map((size) => ({
    product_id: productId,
    size,
    quantity: Math.max(0, Number(formData.get(`size_${size}`) ?? 0) || 0),
  }));

  const { error } = await supabase
    .from("product_sizes")
    .upsert(rows, { onConflict: "product_id,size" });

  if (error) throw new Error(error.message);
}

async function uploadImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  formData: FormData
) {
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const [index, file] of files.entries()) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${productId}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, storage_path: path, position: index });

    if (insertError) throw new Error(insertError.message);
  }

  // Fotos específicas de cada tamanho (para compartilhar direto com o
  // cliente quando ele pede o tamanho X), vindas dos campos size_photo_<n>.
  for (const size of SHOE_SIZES) {
    const file = formData.get(`size_photo_${size}`);
    if (!(file instanceof File) || file.size === 0) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${productId}/tamanho-${size}-${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, storage_path: path, size, position: 0 });

    if (insertError) throw new Error(insertError.message);
  }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const fields = parseProductFields(formData);

  const { data: product, error } = await supabase
    .from("products")
    .insert(fields)
    .select()
    .single();

  if (error || !product) {
    throw new Error(error?.message ?? "Não foi possível criar o produto.");
  }

  await saveSizes(supabase, product.id, formData);
  await uploadImages(supabase, product.id, formData);

  revalidatePath("/");
  redirect(`/produtos/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const fields = parseProductFields(formData);

  const { error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", productId);

  if (error) throw new Error(error.message);

  await saveSizes(supabase, productId, formData);
  await uploadImages(supabase, productId, formData);

  revalidatePath("/");
  revalidatePath(`/produtos/${productId}`);
  redirect(`/produtos/${productId}`);
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (images && images.length > 0) {
    await supabase.storage
      .from("product-images")
      .remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function deleteImage(imageId: string, productId: string) {
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (image) {
    await supabase.storage.from("product-images").remove([image.storage_path]);
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(error.message);

  revalidatePath(`/produtos/${productId}`);
}

export async function uploadSizePhoto(
  productId: string,
  size: number,
  formData: FormData
) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione uma foto.");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/tamanho-${size}-${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase
    .from("product_images")
    .insert({ product_id: productId, storage_path: path, size, position: 0 });

  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/produtos/${productId}`);
}

async function applyStockDelta(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  size: number,
  delta: number
) {
  const { data: existing } = await supabase
    .from("product_sizes")
    .select("id, quantity")
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  const current = existing?.quantity ?? 0;
  const nextQuantity = Math.max(0, current + delta);
  const applied = nextQuantity - current;

  const { error } = await supabase
    .from("product_sizes")
    .upsert(
      { product_id: productId, size, quantity: nextQuantity },
      { onConflict: "product_id,size" }
    );

  if (error) throw new Error(error.message);

  if (applied !== 0) {
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: productId,
        size,
        type: applied > 0 ? "entrada" : "saida",
        quantity: Math.abs(applied),
      });

    if (movementError) throw new Error(movementError.message);
  }
}

export async function adjustStock(
  productId: string,
  size: number,
  delta: number
) {
  const supabase = await createClient();
  await applyStockDelta(supabase, productId, size, delta);

  revalidatePath("/");
  revalidatePath(`/produtos/${productId}`);
}

export async function registerMovement(
  productId: string,
  size: number,
  type: "entrada" | "saida",
  formData: FormData
) {
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const supabase = await createClient();
  await applyStockDelta(
    supabase,
    productId,
    size,
    type === "entrada" ? quantity : -quantity
  );

  revalidatePath("/");
  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/relatorios");
}
