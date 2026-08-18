import type { RegistryIdentity, UpdateRegistryIdentityInput } from '../../domain/registry-identity';
import type { RegistryIdentityRepository } from '../../domain/repository-contracts';

export class InMemoryRegistryIdentityRepository implements RegistryIdentityRepository {
  private readonly items = new Map<string, RegistryIdentity>();

  async create(identity: RegistryIdentity): Promise<RegistryIdentity> {
    this.items.set(identity.id, identity);
    return identity;
  }

  async update(id: string, input: UpdateRegistryIdentityInput): Promise<RegistryIdentity | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated: RegistryIdentity = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async findById(id: string): Promise<RegistryIdentity | null> {
    return this.items.get(id) ?? null;
  }

  async findByPublicRegistryId(publicRegistryId: string): Promise<RegistryIdentity | null> {
    for (const identity of this.items.values()) {
      if (identity.publicRegistryId === publicRegistryId) return identity;
    }
    return null;
  }

  async list(): Promise<RegistryIdentity[]> {
    return Array.from(this.items.values());
  }
}
