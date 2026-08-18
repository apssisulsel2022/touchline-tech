export interface RegistryIdentityRow {
  id: string;
  registry_definition_id: string;
  public_registry_id: string;
  registry_status: string;
  verification_level: string;
  visibility_level: string;
  canonical_state: string;
  registration_context?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
