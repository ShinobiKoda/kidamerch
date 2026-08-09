create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('Convention', 'Meetup', 'Signing', 'Pop-up')),
  date date not null,
  location text not null,
  description text,
  cover text,
  gallery text[] not null default '{}',
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Past', 'Cancelled')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- defense-in-depth: never allow more than 3 featured rows
create or replace function public.enforce_featured_cap()
returns trigger as $$
begin
  if new.featured then
    if (select count(*) from public.events where featured = true and id <> new.id) >= 3 then
      raise exception 'Only three events can be featured at once';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger events_featured_cap
  before insert or update on public.events
  for each row execute function public.enforce_featured_cap();

  alter table public.events enable row level security;

create policy "Public can read events"
  on public.events
  for select
  to anon, authenticated
  using (true);

