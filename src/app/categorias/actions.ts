"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Informe o nome do modelo.");

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/categorias");
  revalidatePath("/");
  revalidatePath("/estoque");
}

export async function renameCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Informe o nome do modelo.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/categorias");
  revalidatePath("/");
  revalidatePath("/estoque");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    throw new Error(
      "Este modelo está sendo usado por produtos e não pode ser excluído."
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/categorias");
  revalidatePath("/");
  revalidatePath("/estoque");
}
