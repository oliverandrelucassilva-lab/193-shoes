-- Sistema de gerenciamento de estoque - loja de calçados femininos
-- Schema inicial: categorias (modelos), produtos, imagens e estoque por tamanho

create extension if not exists "pgcrypto";

-- Modelos de calçado (sapatilha, slingback, sapato social, sandália, etc.)
-- A loja cadastra livremente os modelos que usa, sem depender de "nomes" de produto.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Produtos: como calçados geralmente não têm nome próprio, o produto é identificado
-- por um código de referência interno + modelo + cor + descrição.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  color text,
  description text,
  price numeric(10, 2),
  cost_price numeric(10, 2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create unique index if not exists products_reference_code_idx on public.products (reference_code);

-- Fotos do produto (guardadas no Supabase Storage, bucket "product-images")
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);

-- Estoque por tamanho (numeração brasileira, ex: 33 a 43, com meios números)
create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size numeric(4, 1) not null,
  quantity integer not null default 0 check (quantity >= 0),
  unique (product_id, size)
);

create index if not exists product_sizes_product_id_idx on public.product_sizes (product_id);
create index if not exists product_sizes_size_idx on public.product_sizes (size);

-- updated_at automático em products
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- Categorias iniciais mais comuns em calçados femininos
insert into public.categories (name)
values
  ('Sapatilha'),
  ('Slingback'),
  ('Sapato Social'),
  ('Sandália'),
  ('Rasteirinha'),
  ('Mule'),
  ('Bota'),
  ('Tênis'),
  ('Plataforma'),
  ('Salto Alto')
on conflict (name) do nothing;

-- Row Level Security: sistema de uso interno, exige login (Supabase Auth)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;

create policy "categories_select_auth" on public.categories
  for select to authenticated using (true);
create policy "categories_write_auth" on public.categories
  for all to authenticated using (true) with check (true);

create policy "products_select_auth" on public.products
  for select to authenticated using (true);
create policy "products_write_auth" on public.products
  for all to authenticated using (true) with check (true);

create policy "product_images_select_auth" on public.product_images
  for select to authenticated using (true);
create policy "product_images_write_auth" on public.product_images
  for all to authenticated using (true) with check (true);

create policy "product_sizes_select_auth" on public.product_sizes
  for select to authenticated using (true);
create policy "product_sizes_write_auth" on public.product_sizes
  for all to authenticated using (true) with check (true);

-- Storage: bucket para fotos dos produtos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_bucket_select" on storage.objects
  for select to authenticated using (bucket_id = 'product-images');
create policy "product_images_bucket_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "product_images_bucket_update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
create policy "product_images_bucket_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
