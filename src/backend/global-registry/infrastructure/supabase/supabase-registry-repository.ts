import type { RegistryIdentity, UpdateRegistryIdentityInput } from '../../domain/registry-identity';
import type { RegistryIdentityRepository } from '../../domain/repository-contracts';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export class SupabaseRegistryIdentityRepository implements RegistryIdentityRepository {
  async create(identity: RegistryIdentity): Promise<RegistryIdentity> {
    const { data, error } = await supabaseAdmin.from('registry_identities').insert({
      id: identity.id,
      registry_definition_id: identity.registryDefinitionId,
      public_registry_id: identity.publicRegistryId,
      registry_status: identity.registryStatus,
      verification_level: identity.verificationLevel,
      visibility_level: identity.visibilityLevel,
      canonical_state: identity.canonicalState,
      registration_context: identity.registrationContext ?? {},
      created_at: identity.createdAt,
      updated_at: identity.updatedAt,
    }).select().single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create registry identity');
    }

    return this.mapRow(data);
  }

  async update(id: string, input: UpdateRegistryIdentityInput): Promise<RegistryIdentity | null> {
    const payload: Record<string, unknown> = {};
    if (input.verificationLevel) payload.verification_level = input.verificationLevel;
    if (input.visibilityLevel) payload.visibility_level = input.visibilityLevel;
    if (input.registryStatus) payload.registry_status = input.registryStatus;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from('registry_identities').update(payload).eq('id', id).select().single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? this.mapRow(data) : null;
  }

  async findById(id: string): Promise<RegistryIdentity | null> {
    const { data, error } = await supabaseAdmin.from('registry_identities').select('*').eq('id', id).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data ? this.mapRow(data) : null;
  }

  async findByPublicRegistryId(publicRegistryId: string): Promise<RegistryIdentity | null> {
    const { data, error } = await supabaseAdmin.from('registry_identities').select('*').eq('public_registry_id', publicRegistryId).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data ? this.mapRow(data) : null;
  }

  async list(): Promise<RegistryIdentity[]> {
    const { data, error } = await supabaseAdmin.from('registry_identities').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => this.mapRow(row));
  }

  private mapRow(row: Record<string, unknown>): RegistryIdentity {
    return {
      id: String(row.id),
      registryDefinitionId: String(row.registry_definition_id),
      publicRegistryId: String(row.public_registry_id),
      registryStatus: String(row.registry_status) as RegistryIdentity['registryStatus'],
      verificationLevel: String(row.verification_level) as RegistryIdentity['verificationLevel'],
      visibilityLevel: String(row.visibility_level) as RegistryIdentity['visibilityLevel'],
      canonicalState: String(row.canonical_state) as RegistryIdentity['canonicalState'],
      registrationContext: (row.registration_context as Record<string, unknown> | undefined) ?? undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }
}
