-- Run this SQL in Supabase SQL Editor (Cloud tab -> Database -> SQL Editor)
-- This creates the database tables for the admin portal

-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create childminder_applications table
create table public.childminder_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Section 1: Personal Details
    title text,
    first_name text,
    middle_names text,
    last_name text,
    previous_names jsonb,
    date_of_birth date,
    place_of_birth text,
    gender text,
    national_insurance_number text,
    phone_home text,
    phone_mobile text,
    email text,
    
    -- Section 2: Address History
    current_address jsonb,
    address_history jsonb,
    
    -- Section 3: Premises
    premises_address jsonb,
    premises_ownership text,
    premises_landlord_details jsonb,
    premises_other_residents jsonb,
    premises_animals text,
    premises_animal_details text,
    
    -- Section 4: Service
    service_type text,
    service_age_range jsonb,
    service_capacity jsonb,
    service_hours jsonb,
    service_ofsted_registered text,
    service_ofsted_number text,
    service_local_authority text,
    
    -- Section 5: Qualifications
    qualifications jsonb,
    training_courses jsonb,
    
    -- Section 6: Employment
    current_employment text,
    employment_history jsonb,
    
    -- Section 7: People
    people_in_household jsonb,
    people_regular_contact jsonb,
    
    -- Section 8: Suitability
    criminal_convictions text,
    convictions_details text,
    safeguarding_concerns text,
    safeguarding_details text,
    health_conditions text,
    health_details text,
    previous_registration text,
    registration_details jsonb,
    
    -- Section 9: Declaration
    declaration_confirmed boolean,
    declaration_date date,
    declaration_signature text
);

alter table public.childminder_applications enable row level security;

-- RLS Policies for applications
create policy "Users can insert their own applications"
on public.childminder_applications
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own applications"
on public.childminder_applications
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can update their own applications"
on public.childminder_applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can view all applications"
on public.childminder_applications
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all applications"
on public.childminder_applications
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_childminder_applications_updated_at
before update on public.childminder_applications
for each row
execute function public.handle_updated_at();

-- IMPORTANT: After running this SQL, you need to manually add an admin user
-- Run this query with your admin email:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'your-admin-email@example.com';
