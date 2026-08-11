create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index idx_admin_audit_logs_created_at on admin_audit_logs(created_at desc);
create index idx_admin_audit_logs_admin_id on admin_audit_logs(admin_id);

alter table admin_audit_logs enable row level security;

create policy "Audit logs viewable by admins"
  on admin_audit_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );

-- No insert/update/delete policies for client API.
-- Modifications will only be done via supabaseAdmin on the backend.
