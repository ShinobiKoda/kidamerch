create type public.admin_role as enum ('admin', 'superadmin');

alter table public.profiles
  add column role public.admin_role null,
  add column is_active boolean not null default true,
  add column invited_by uuid null references public.profiles(id),
  add column invited_at timestamptz null;

comment on column public.profiles.role is
  'null = regular customer, admin = operational access, superadmin = admin + user management';
comment on column public.profiles.is_active is
  'false = access revoked without deleting the account or losing audit history';


alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Index for the requireRole() lookup that runs on every admin request
create index idx_profiles_role on public.profiles(role) where role is not null;