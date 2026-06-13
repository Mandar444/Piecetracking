-- =====================================================================
-- SUPABASE PRESCRIPTIONS TABLE SETUP SCRIPT
-- =====================================================================
-- Copy and paste this script directly into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hlasknkxnosdkvbykybf/sql/new

-- Create Prescriptions Table
create table if not exists public.prescriptions (
  order_id text primary key,
  customer_name text not null,
  frame_name text,
  order_number text not null,
  maker text not null,
  lens_type text not null,
  product text,
  lens_index text,
  product_add_on text,
  tint text,
  right_sphere text,
  left_sphere text,
  right_cylinder text,
  left_cylinder text,
  right_add text,
  left_add text,
  pupillary_distance text,
  pupillary_distance_near text,
  status text not null,
  notes text,
  wpl integer,
  crp integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) policies
alter table public.prescriptions enable row level security;

-- Create policy to allow public read/write access (select, insert, update, delete)
drop policy if exists "Allow public read-write for prescriptions" on public.prescriptions;
create policy "Allow public read-write for prescriptions" on public.prescriptions for all using (true) with check (true);

-- Migration steps for existing databases:
alter table public.prescriptions add column if not exists frame_name text;
alter table public.prescriptions add column if not exists lens_index text;

