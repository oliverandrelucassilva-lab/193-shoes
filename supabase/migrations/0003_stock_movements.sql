-- Histórico de entradas e saídas de estoque, para controle administrativo
-- (quanto chegou/saiu por mês) e para registrar vendas por tamanho.

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size numeric(4, 1) not null,
  type text not null check (type in ('entrada', 'saida')),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_id_idx
  on public.stock_movements (product_id);
create index if not exists stock_movements_created_at_idx
  on public.stock_movements (created_at);

alter table public.stock_movements enable row level security;

create policy "stock_movements_select_auth" on public.stock_movements
  for select to authenticated using (true);
create policy "stock_movements_write_auth" on public.stock_movements
  for all to authenticated using (true) with check (true);
