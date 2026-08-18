create table if not exists public.registry_identities (
  id uuid primary key,
  registry_definition_id uuid not null,
  public_registry_id text not null unique,
  registry_status text not null,
  verification_level text not null,
  visibility_level text not null,
  canonical_state text not null,
  registration_context jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_registry_identities_status on public.registry_identities (registry_status);
create index if not exists idx_registry_identities_verification on public.registry_identities (verification_level);
create index if not exists idx_registry_identities_visibility on public.registry_identities (visibility_level);
