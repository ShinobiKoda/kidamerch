
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);


insert into categories (name)
select distinct category from products
where category is not null
on conflict (name) do nothing;


alter table products
  add constraint products_category_fkey
  foreign key (category) references categories(name)
  on update cascade
  on delete restrict;

alter table categories enable row level security;

create policy "categories are viewable by everyone"
  on categories for select
  using (true);

create policy "categories are manageable by admins"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );