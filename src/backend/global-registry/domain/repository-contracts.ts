import type { RegistryIdentity, UpdateRegistryIdentityInput } from './registry-identity';

export interface RegistryIdentityRepository {
  create(identity: RegistryIdentity): Promise<RegistryIdentity>;
  update(id: string, input: UpdateRegistryIdentityInput): Promise<RegistryIdentity | null>;
  findById(id: string): Promise<RegistryIdentity | null>;
  findByPublicRegistryId(publicRegistryId: string): Promise<RegistryIdentity | null>;
  list(): Promise<RegistryIdentity[]>;
}
