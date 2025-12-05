-- Create custom types
create type user_role as enum ('requester', 'hod', 'admin', 'driver');
create type vehicle_type as enum ('4-wheeler', 'bus');
create type req_status as enum ('pending_hod', 'pending_admin', 'approved', 'rejected', 'completed', 'cancelled');
create type purpose_type as enum ('in_house_event', 'meeting', 'session', 'workshop', 'visit', 'participation', 'other');

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  department text,
  role user_role default 'requester',
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create vehicles table
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g., 'Kia 1', 'Bolero 1'
  type vehicle_type not null,
  registration_number text,
  capacity int,
  status text default 'active', -- active, maintenance
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.vehicles enable row level security;

-- Create requisitions table
create table public.requisitions (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) not null,
  
  -- Request Details
  pickup_date date not null,
  pickup_time time not null,
  drop_time time not null,
  destination text not null,
  purpose purpose_type not null,
  purpose_description text,
  category text, -- VIP, Guest, Official, etc.
  
  -- Status & Approvals
  status req_status default 'pending_hod',
  hod_id uuid references public.profiles(id),
  hod_action_date timestamp with time zone,
  hod_remarks text,
  
  admin_id uuid references public.profiles(id),
  admin_action_date timestamp with time zone,
  admin_remarks text,
  
  -- Assignment
  assigned_vehicle_id uuid references public.vehicles(id),
  assigned_driver_id uuid references public.profiles(id),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.requisitions enable row level security;

-- POLICIES (Basic examples, refine as needed)

-- Profiles: Users can read their own profile. Admins can read all.
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Vehicles: Readable by all, Writable by Admin only
create policy "Vehicles are viewable by everyone" on vehicles for select using (true);
-- (Add admin write policy later)

-- Requisitions:
-- Requesters can see their own.
-- HODs can see requests from their department (needs logic) or all for now.
-- Admins can see all.
create policy "Users can see own requisitions" on requisitions for select using (auth.uid() = requester_id);
create policy "Users can create requisitions" on requisitions for insert with check (auth.uid() = requester_id);

-- Seed Data for Vehicles
insert into public.vehicles (name, type) values
('Kia 1', '4-wheeler'),
('Kia 2', '4-wheeler'),
('Bolero 1', '4-wheeler'),
('Bolero 2', '4-wheeler'),
('Bolero 3', '4-wheeler'),
('Curve', '4-wheeler'),
('Nexon', '4-wheeler'),
('Tiago', '4-wheeler'),
('Bus', 'bus');
