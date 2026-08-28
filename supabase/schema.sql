-- Run this file once in Supabase Dashboard > SQL Editor.

create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('buy', 'sell')),
  customer_name text,
  phone text,
  direction text not null check (direction in ('MMK_TO_THB', 'THB_TO_MMK')),
  thb numeric not null check (thb > 0),
  mmk numeric not null check (mmk > 0),
  rate numeric not null check (rate > 0),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_created_idx
  on public.transactions (user_id, created_at desc);

create table if not exists public.exchange_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  buy_rate numeric not null default 0 check (buy_rate >= 0),
  sell_rate numeric not null default 0 check (sell_rate >= 0),
  capital_thb numeric not null default 0 check (capital_thb >= 0),
  capital_mmk numeric not null default 0 check (capital_mmk >= 0),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
alter table public.exchange_settings enable row level security;

revoke all on public.transactions from anon;
revoke all on public.exchange_settings from anon;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.exchange_settings to authenticated;

drop policy if exists "Users manage their own transactions" on public.transactions;
create policy "Users manage their own transactions"
  on public.transactions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own settings" on public.exchange_settings;
create policy "Users manage their own settings"
  on public.exchange_settings
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
