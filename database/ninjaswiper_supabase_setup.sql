-- NinjaSwiper Supabase setup
-- Run this once in Supabase SQL Editor before launching.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  api_key text unique not null default ('ns_' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  plan text not null default 'trial',
  subscription_status text not null default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  free_swipe_limit integer not null default 200,
  swipes_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text unique;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists api_key text unique not null default ('ns_' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));
alter table public.profiles add column if not exists plan text not null default 'trial';
alter table public.profiles add column if not exists subscription_status text not null default 'trial';
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists free_swipe_limit integer not null default 200;
alter table public.profiles add column if not exists swipes_used integer not null default 0;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_api_key_idx on public.profiles(api_key);
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
create index if not exists profiles_stripe_subscription_id_idx on public.profiles(stripe_subscription_id);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional RPC functions for older extension builds that call Supabase RPC directly.
create or replace function public.ns_validate_key(p_api_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_is_paid boolean;
  v_remaining integer;
begin
  select * into v_profile from public.profiles where api_key = trim(coalesce(p_api_key, '')) limit 1;
  if not found then
    return jsonb_build_object('valid', false, 'allowed', false, 'message', 'Invalid API key.');
  end if;

  v_is_paid := v_profile.plan = 'premium' or v_profile.subscription_status in ('active', 'trialing');
  v_remaining := greatest(0, v_profile.free_swipe_limit - v_profile.swipes_used);

  return jsonb_build_object(
    'valid', true,
    'allowed', v_is_paid or v_remaining > 0,
    'is_paid', v_is_paid,
    'plan', v_profile.plan,
    'subscription_status', v_profile.subscription_status,
    'swipes_used', v_profile.swipes_used,
    'swipe_limit', v_profile.free_swipe_limit,
    'swipes_remaining', case when v_is_paid then null else v_remaining end,
    'message', case when v_is_paid or v_remaining > 0 then '' else 'Free trial limit reached.' end
  );
end;
$$;

create or replace function public.ns_report_swipe(p_api_key text, p_direction text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_is_paid boolean;
begin
  select * into v_profile from public.profiles where api_key = trim(coalesce(p_api_key, '')) limit 1;
  if not found then
    return jsonb_build_object('valid', false, 'allowed', false, 'message', 'Invalid API key.');
  end if;

  v_is_paid := v_profile.plan = 'premium' or v_profile.subscription_status in ('active', 'trialing');

  if v_is_paid or v_profile.swipes_used < v_profile.free_swipe_limit then
    update public.profiles
    set swipes_used = swipes_used + 1,
        updated_at = now()
    where id = v_profile.id
    returning * into v_profile;
  end if;

  return public.ns_validate_key(v_profile.api_key);
end;
$$;

grant execute on function public.ns_validate_key(text) to anon, authenticated;
grant execute on function public.ns_report_swipe(text, text) to anon, authenticated;
