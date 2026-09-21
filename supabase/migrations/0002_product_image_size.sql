-- Permite associar uma foto a um tamanho específico do produto.
-- Assim a loja consegue abrir/compartilhar direto a foto do tamanho que o
-- cliente pediu, sem procurar na galeria do celular.

alter table public.product_images
  add column if not exists size numeric(4, 1);

create index if not exists product_images_product_size_idx
  on public.product_images (product_id, size);
