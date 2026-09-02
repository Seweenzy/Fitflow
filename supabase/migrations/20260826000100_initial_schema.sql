create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  goals jsonb not null default '[]'::jsonb,
  experience text check (experience in ('Beginner', 'Intermediate', 'Advanced')),
  preference text check (preference in ('Home', 'Gym', 'Outdoor', 'Anywhere')),
  frequency text,
  age text,
  height text,
  weight text,
  gender text,
  preferences jsonb not null default '{"theme":"light","units":"metric","notifications":false,"reminderTime":"07:00","workoutDays":[1,3,5]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration integer not null check (duration > 0),
  calories integer not null check (calories >= 0),
  completed_exercises integer not null check (completed_exercises >= 0),
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_completed_idx
  on public.workout_sessions (user_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

drop policy if exists "Users can read their own sessions" on public.workout_sessions;
create policy "Users can read their own sessions"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sessions" on public.workout_sessions;
create policy "Users can insert their own sessions"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sessions" on public.workout_sessions;
create policy "Users can update their own sessions"
  on public.workout_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.workout_sessions;
create policy "Users can delete their own sessions"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    name,
    goals,
    experience,
    preference,
    frequency,
    age,
    height,
    weight,
    gender
  ) values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'FitFlow Member'),
    coalesce(new.raw_user_meta_data -> 'goals', '[]'::jsonb),
    nullif(new.raw_user_meta_data ->> 'experience', ''),
    nullif(new.raw_user_meta_data ->> 'preference', ''),
    nullif(new.raw_user_meta_data ->> 'frequency', ''),
    nullif(new.raw_user_meta_data ->> 'age', ''),
    nullif(new.raw_user_meta_data ->> 'height', ''),
    nullif(new.raw_user_meta_data ->> 'weight', ''),
    nullif(new.raw_user_meta_data ->> 'gender', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
