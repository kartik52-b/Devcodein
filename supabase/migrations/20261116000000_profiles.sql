-- ============================================================================
-- DevVerse — Supabase authentication schema
--
-- Run this once in the Supabase SQL editor (or `supabase db push`). It is
-- idempotent: re-running it updates the function definitions and recreates the
-- policies without touching existing profile rows.
--
-- Identity lives in Supabase's built-in auth.users table (password hashes,
-- OAuth identities, email verification state). This migration only adds the
-- public profile that the app reads and writes. No password or token is ever
-- copied into public.profiles.
-- ============================================================================

-- No extensions are required: ids come from auth.users and timestamps from
-- now(), so the script runs on any PostgreSQL 13+ database.

-- ----------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile for each Supabase Auth user. One row per auth.users.id, created by trigger.';

create index if not exists profiles_email_idx on public.profiles (lower(email));

-- ---------------------------------------------------- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --------------------------------------------- create a profile per new user
-- Runs as the table owner (security definer) because the client has no access
-- to auth.users. `search_path = ''` prevents search-path hijacking.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text;
  avatar text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'preferred_username'), ''),
    split_part(coalesce(new.email, 'learner@devverse.local'), '@', 1)
  );

  avatar := nullif(
    trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')),
    ''
  );

  -- on conflict: the trigger may be added after a user already signed up, or
  -- the client may have created the row first. Either way the row stays unique.
  insert into public.profiles (id, full_name, email, avatar_url, created_at)
  values (new.id, left(display_name, 80), lower(new.email), avatar, coalesce(new.created_at, now()))
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------- keep the email copy in sync
-- Supabase updates auth.users.email after the user confirms a new address. The
-- guard trigger below blocks clients from editing the email themselves, so the
-- sync marks its own transaction as trusted.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('devverse.profile_sync', 'on', true);
  update public.profiles
     set email = lower(new.email)
   where id = new.id;
  perform set_config('devverse.profile_sync', 'off', true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email and new.email_confirmed_at is not null)
  execute function public.sync_profile_email();

-- ------------------------------------------ immutable identity columns
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id then
    raise exception 'profiles.id is immutable' using errcode = '42501';
  end if;

  if new.created_at <> old.created_at then
    raise exception 'profiles.created_at is immutable' using errcode = '42501';
  end if;

  if new.email <> old.email
     and coalesce(current_setting('devverse.profile_sync', true), 'off') <> 'on' then
    raise exception 'profiles.email can only be changed by confirming a new address'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_columns on public.profiles;
create trigger profiles_guard_columns
  before update on public.profiles
  for each row execute function public.guard_profile_columns();

-- --------------------------------------------------------------- Row Level Security
alter table public.profiles enable row level security;
-- Also applies to the table owner, so the API cannot bypass the policies by
-- accident. `security definer` functions above still see auth.users directly.
alter table public.profiles force row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No DELETE policy: only account deletion (which cascades from auth.users) or
-- the service role may remove a profile.

-- ------------------------------------------------------------- privileges
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
