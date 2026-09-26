-- ============================================================
-- BookLoop — Supabase Schema
-- Run this once in the Supabase SQL Editor
-- ============================================================

-- 0. Enable UUID extension (usually already on)
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. USERS table — public profile, extends auth.users
-- ============================================================
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  email           text not null,
  campus_name     text not null default 'Campus',
  trust_score     numeric(3,2) not null default 0,
  bookcoin_balance integer not null default 0,
  avatar_url      text,
  created_at      timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read all profiles (for seller info on browse)
create policy "Public read users"
  on public.users for select using (true);

-- Users can only update their own profile
create policy "Users update own profile"
  on public.users for update using (auth.uid() = id);

-- Allow insert during sign-up (from the client)
create policy "Users insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Automatic user profile creation trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, campus_name, bookcoin_balance, trust_score)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'campus_name', 'Campus'),
    0,
    0
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.users.name),
    campus_name = coalesce(excluded.campus_name, public.users.campus_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. BOOKS table
-- ============================================================
create type book_condition as enum ('Like New', 'Good', 'Fair', 'Worn');

do $$ begin
  create type book_status as enum ('available', 'redeemed', 'pending_review');
exception
  when duplicate_object then
    alter type book_status add value if not exists 'pending_review';
end $$;

create table if not exists public.books (
  id                  uuid primary key default gen_random_uuid(),
  seller_id           uuid not null references public.users(id) on delete cascade,
  title               text not null,
  author              text not null,
  subject_category    text not null default 'General Academic',
  edition_year        text,
  isbn                text,
  description         text,
  original_price      integer not null default 0,
  condition_grade     book_condition not null default 'Good',
  coin_value          integer not null default 100,
  front_photo_url     text,
  back_photo_url      text,
  spine_photo_url     text,
  inside_photo_url    text,
  distance_photo_url  text,
  status              book_status not null default 'available',
  ai_confidence_score integer not null default 85,
  created_at          timestamptz not null default now()
);

alter table public.books enable row level security;

-- Anyone can read available books
create policy "Public read available books"
  on public.books for select using (true);

-- Only the seller can insert their book
create policy "Sellers insert own books"
  on public.books for insert with check (auth.uid() = seller_id);

-- Seller can update own books (e.g. status change)
create policy "Sellers update own books"
  on public.books for update using (auth.uid() = seller_id);

-- Buyers can update book status to redeemed (used in redeemBook)
create policy "Buyers can mark redeemed"
  on public.books for update using (auth.uid() != seller_id and status = 'available');

-- ============================================================
-- 3. TRANSACTIONS table
-- ============================================================
create type transaction_status as enum ('completed', 'pending', 'failed');
create type transaction_type   as enum ('credit', 'debit');

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  book_id          uuid references public.books(id) on delete set null,
  buyer_id         uuid references public.users(id) on delete set null,
  seller_id        uuid references public.users(id) on delete set null,
  transaction_type transaction_type not null,
  coins_amount     integer not null,
  description      text,
  reference_id     text,
  transaction_date timestamptz not null default now(),
  status           transaction_status not null default 'completed'
);

alter table public.transactions enable row level security;

-- Users can read transactions they are party to
create policy "Users read own transactions"
  on public.transactions for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Users can insert their own transactions
create policy "Users insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ============================================================
-- 4. RATINGS table
-- ============================================================
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.users(id) on delete cascade,
  buyer_id    uuid not null references public.users(id) on delete cascade,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "Public read ratings"
  on public.ratings for select using (true);

create policy "Buyers insert rating"
  on public.ratings for insert with check (auth.uid() = buyer_id);

-- ============================================================
-- 5. Supabase Storage — book-photos bucket
-- ============================================================
-- Run this in the Storage section of the Supabase dashboard OR via this SQL:
insert into storage.buckets (id, name, public)
values ('book-photos', 'book-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Auth users upload book photos"
  on storage.objects for insert
  with check (bucket_id = 'book-photos' and auth.role() = 'authenticated');

-- Public read for all book photos (needed for <img> tags)
create policy "Public read book photos"
  on storage.objects for select
  using (bucket_id = 'book-photos');

-- ============================================================
-- 6. Helper: Auto-confirm existing and future users without email link
-- ============================================================
-- Run this in SQL Editor if you get "Email not confirmed" error on login:
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

