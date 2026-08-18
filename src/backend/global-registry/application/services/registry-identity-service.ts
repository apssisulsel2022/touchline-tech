import { createRegistryIdentity, type CreateRegistryIdentityInput, type RegistryIdentity, type UpdateRegistryIdentityInput } from '../../domain/registry-identity';
import type { RegistryIdentityRepository } from '../../domain/repository-contracts';
import type { AuditService } from '../../infrastructure/audit/audit-service';
import type { LoggerPort } from '../../infrastructure/logging/logger-port';
import { z } from 'zod';

export interface RegistryIdentityQuery {
  publicRegistryId?: string;
}

const createSchema = z.object({
  registryDefinitionId: z.string().uuid(),
  publicRegistryId: z.string().min(3).max(128),
  verificationLevel: z.enum([
    'unverified',
    'self_declared',
    'document_verified',
    'authority_verified',
    'externally_verified',
    'federation_verified',
  ]),
  visibilityLevel: z.enum(['private', 'restricted', 'public', 'hidden', 'suspended']),
  registrationContext: z.record(z.unknown()).optional(),
});

const updateSchema = z.object({
  verificationLevel: z.enum([
    'unverified',
    'self_declared',
    'document_verified',
    'authority_verified',
    'externally_verified',
    'federation_verified',
  ]).optional(),
  visibilityLevel: z.enum(['private', 'restricted', 'public', 'hidden', 'suspended']).optional(),
  registryStatus: z.string().optional(),
});

export class RegistryIdentityService {
  constructor(
    private readonly repository: RegistryIdentityRepository,
    private readonly auditService: AuditService,
    private readonly logger: LoggerPort,
  ) {}

  async create(input: CreateRegistryIdentityInput): Promise<RegistryIdentity> {
    const parsed = createSchema.parse(input);
    const identity = createRegistryIdentity(parsed);

    const saved = await this.repository.create(identity);

    this.auditService.record({
      action: 'registry.identity.created',
      actorId: 'system',
      entityId: saved.id,
      metadata: { publicRegistryId: saved.publicRegistryId },
    });

    this.logger.info('registry identity created', { identityId: saved.id });
    return saved;
  }

  async update(id: string, input: UpdateRegistryIdentityInput): Promise<RegistryIdentity | null> {
    const parsed = updateSchema.parse(input);
    const updated = await this.repository.update(id, parsed);
    if (updated) {
      this.auditService.record({
        action: 'registry.identity.updated',
        actorId: 'system',
        entityId: updated.id,
        metadata: { verificationLevel: updated.verificationLevel, visibilityLevel: updated.visibilityLevel },
      });
    }
    return updated;
  }

  async query(query: RegistryIdentityQuery): Promise<RegistryIdentity | null> {
    if (query.publicRegistryId) {
      return this.repository.findByPublicRegistryId(query.publicRegistryId);
    }
    return null;
  }
}
