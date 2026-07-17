-- GE Trade Logger sync: per-user trade history + a revocable sync token the
-- RuneLite plugin uses instead of the account password.
--
-- Run this once in the Supabase SQL Editor (or via `supabase db push`) after
-- creating the project. Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.

create extension if not exists pgcrypto;

-- One row per auth.users account. sync_token is what the plugin authenticates
-- with (via the sync-trade edge function) — separate from the login password
-- so it can be shown/copied/regenerated from the website without touching auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  sync_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profiles row (with a fresh sync token) whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- One row per logged GE fill. Gross (pre-tax) values only, matching
-- TradeRecord.java in the ge-trade-logger plugin — tax is computed at
-- display/analysis time, never stored, so historical rows stay reproducible
-- if the tax model is ever corrected.
create table if not exists public.trades (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ts bigint not null,            -- epoch millis, matches TradeRecord.timestamp
  item_id integer not null,
  item_name text not null,
  buy boolean not null,
  quantity integer not null,
  unit_price bigint not null,
  created_at timestamptz not null default now(),
  unique (user_id, ts, item_id, buy, quantity, unit_price)
);

create index if not exists trades_user_id_ts_idx on public.trades (user_id, ts);

alter table public.trades enable row level security;

drop policy if exists "trades: select own" on public.trades;
create policy "trades: select own" on public.trades
  for select using (auth.uid() = user_id);

drop policy if exists "trades: delete own" on public.trades;
create policy "trades: delete own" on public.trades
  for delete using (auth.uid() = user_id);

-- No insert/update policy for regular users: rows are written exclusively by
-- the sync-trade edge function (service role, which bypasses RLS) after it
-- validates the plugin's sync token itself. The website only ever reads.
