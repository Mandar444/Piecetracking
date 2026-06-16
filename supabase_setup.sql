-- =====================================================================
-- SUPABASE DATABASE SETUP FOR VRX (EYEWEAR PRESCRIPTION TRACKER)
-- =====================================================================
-- Copy and paste this script directly into your Supabase SQL Editor.
-- This script creates the prescriptions table and configures Row Level Security (RLS)
-- to allow public read and write access for the client-side application.

-- 1. Create Prescriptions Table
create table if not exists public.prescriptions (
  order_id text primary key,
  customer_name text not null,
  order_number text not null,
  maker text not null,
  lens_type text not null,
  product text,
  product_add_on text,
  tint text,
  right_sphere text,
  left_sphere text,
  right_cylinder text,
  left_cylinder text,
  right_axis text,
  left_axis text,
  right_add text,
  left_add text,
  pupillary_distance text,
  pupillary_distance_near text,
  status text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.prescriptions enable row level security;

-- 3. Create RLS policies for public read/write access
drop policy if exists "Allow public read-write for prescriptions" on public.prescriptions;
create policy "Allow public read-write for prescriptions" on public.prescriptions for all using (true) with check (true);

-- Migration steps for existing databases:
alter table public.prescriptions add column if not exists right_axis text;
alter table public.prescriptions add column if not exists left_axis text;

