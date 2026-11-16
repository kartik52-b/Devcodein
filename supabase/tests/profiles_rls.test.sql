-- ============================================================================
-- Local RLS test for the DevVerse profiles schema.
--
-- This harness is NOT for Supabase. It recreates the small slice of the auth
-- schema that the migration depends on (auth.users + auth.uid()), then runs the
-- real migration and asserts the security rules with real PostgreSQL.
--
-- Usage (from the repository root):
--   createdb devverse_rls
--   psql -v ON_ERROR_STOP=1 -d devverse_rls -f supabase/tests/profiles_rls.test.sql
--
-- Every assertion raises an exception on failure, so a zero exit status means
-- all checks passed.
-- ============================================================================

\set ON_ERROR_STOP on
begin;

-- ----------------------------------------------------------- auth stubs
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  email_confirmed_at timestamptz,
  created_at timestamptz default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;

-- PostgREST roles.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- ------------------------------------------------------- the real migration
\i supabase/migrations/20261116000000_profiles.sql

-- ============================================================================
-- Seed: inserting into auth.users must create exactly one profile per user.
-- ============================================================================
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at)
values
  ('11111111-1111-4111-8111-111111111111', 'ada@example.com',
   '{"full_name": "Ada Lovelace", "avatar_url": "https://example.com/ada.png"}'::jsonb, now()),
  ('22222222-2222-4222-8222-222222222222', 'grace@example.com',
   '{"full_name": "Grace Hopper"}'::jsonb, now());

do $$
declare
  total int;
  ada public.profiles%rowtype;
begin
  select count(*) into total from public.profiles;
  if total <> 2 then
    raise exception 'FAIL trigger: expected 2 profiles, found %', total;
  end if;

  select * into ada from public.profiles where id = '11111111-1111-4111-8111-111111111111';
  if ada.full_name <> 'Ada Lovelace' then
    raise exception 'FAIL trigger: full_name not copied (%)', ada.full_name;
  end if;
  if ada.email <> 'ada@example.com' then
    raise exception 'FAIL trigger: email not copied (%)', ada.email;
  end if;
  if ada.avatar_url is null then
    raise exception 'FAIL trigger: avatar_url not copied';
  end if;
  if ada.created_at is null then
    raise exception 'FAIL trigger: created_at missing';
  end if;
end
$$;

-- Re-inserting the same auth user must not duplicate the profile.
do $$
begin
  update auth.users set email = 'ada@example.com'
   where id = '11111111-1111-4111-8111-111111111111';
  if (select count(*) from public.profiles where id = '11111111-1111-4111-8111-111111111111') <> 1 then
    raise exception 'FAIL duplicate prevention';
  end if;
end
$$;

-- ============================================================================
-- RLS: Ada may only see and touch her own row.
-- ============================================================================
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}',
  true
);

do $$
declare
  visible int;
  changed int;
begin
  select count(*) into visible from public.profiles;
  if visible <> 1 then
    raise exception 'FAIL select: expected 1 visible row, saw %', visible;
  end if;

  select count(*) into visible from public.profiles
   where id = '22222222-2222-4222-8222-222222222222';
  if visible <> 0 then
    raise exception 'FAIL select: another user''s profile is visible';
  end if;

  update public.profiles set full_name = 'Ada L.'
   where id = '11111111-1111-4111-8111-111111111111';
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'FAIL update: own profile was not updated (% rows)', changed;
  end if;

  update public.profiles set full_name = 'Hacked'
   where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'FAIL update: modified another user''s profile';
  end if;
end
$$;

-- Email is immutable from the client.
do $$
begin
  begin
    update public.profiles set email = 'attacker@example.com'
     where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'FAIL: client was allowed to change profile email';
  exception
    when insufficient_privilege then null; -- expected
  end;
end
$$;

-- created_at is immutable from the client.
do $$
begin
  begin
    update public.profiles set created_at = now() - interval '10 years'
     where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'FAIL: client was allowed to change created_at';
  exception
    when insufficient_privilege then null; -- expected
  end;
end
$$;

-- A client cannot insert a profile for somebody else.
do $$
begin
  begin
    insert into public.profiles (id, full_name, email)
    values ('33333333-3333-4333-8333-333333333333', 'Mallory', 'mallory@example.com');
    raise exception 'FAIL: client inserted a profile for another user id';
  exception
    when insufficient_privilege then null; -- expected
  end;
end
$$;

-- A client cannot delete a profile.
do $$
begin
  begin
    delete from public.profiles where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'FAIL: client deleted a profile';
  exception
    when insufficient_privilege then null; -- expected
  end;
end
$$;

-- ============================================================================
-- Anonymous visitors have no access at all.
-- ============================================================================
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

do $$
begin
  begin
    perform count(*) from public.profiles;
    raise exception 'FAIL: anon could read profiles';
  exception
    when insufficient_privilege then null; -- expected
  end;
end
$$;

-- ============================================================================
-- Signed-out (no JWT) authenticated role sees nothing.
-- ============================================================================
set local role authenticated;
select set_config('request.jwt.claims', '', true);

do $$
declare
  visible int;
begin
  select count(*) into visible from public.profiles;
  if visible <> 0 then
    raise exception 'FAIL: a session without auth.uid() saw % rows', visible;
  end if;
end
$$;

-- ============================================================================
-- Service role (server-side only) keeps full access.
-- ============================================================================
set local role service_role;

do $$
declare
  visible int;
begin
  select count(*) into visible from public.profiles;
  if visible <> 2 then
    raise exception 'FAIL: service_role expected 2 rows, saw %', visible;
  end if;
end
$$;

rollback;
\echo 'All profiles RLS checks passed.'
