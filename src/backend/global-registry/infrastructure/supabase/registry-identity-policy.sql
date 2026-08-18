alter table public.registry_identities enable row level security;

create policy if not exists registry_identities_select_authenticated
on public.registry_identities
for select
to authenticated
using (true);

create policy if not exists registry_identities_insert_authenticated
on public.registry_identities
for insert
to authenticated
with check (true);

create policy if not exists registry_identities_update_authenticated
on public.registry_identities
for update
to authenticated
using (true)
with check (true);
