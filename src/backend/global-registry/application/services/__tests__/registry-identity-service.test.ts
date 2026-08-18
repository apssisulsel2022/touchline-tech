import { describe, expect, it } from 'vitest';
import { RegistryIdentityService } from '../registry-identity-service';
import { InMemoryRegistryIdentityRepository } from '../../../infrastructure/persistence/in-memory-registry-identity-repository';
import { AuditService } from '../../../infrastructure/audit/audit-service';
import { ConsoleLogger } from '../../../infrastructure/logging/console-logger';

describe('RegistryIdentityService', () => {
  it('creates a valid registry identity and persists it', async () => {
    const repository = new InMemoryRegistryIdentityRepository();
    const auditService = new AuditService();
    const logger = new ConsoleLogger();
    const service = new RegistryIdentityService(repository, auditService, logger);

    const identity = await service.create({
      registryDefinitionId: '11111111-2222-4333-8444-555555555555',
      publicRegistryId: 'REG-1001',
      verificationLevel: 'authority_verified',
      visibilityLevel: 'public',
      registrationContext: { source: 'manual' },
    });

    expect(identity.publicRegistryId).toBe('REG-1001');
    expect(identity.registryStatus).toBe('draft');
    expect(repository.findByPublicRegistryId('REG-1001')).toBeDefined();
  });

  it('rejects a public registry id that is too short', async () => {
    const repository = new InMemoryRegistryIdentityRepository();
    const service = new RegistryIdentityService(
      repository,
      new AuditService(),
      new ConsoleLogger(),
    );

    await expect(
      service.create({
        registryDefinitionId: '11111111-2222-4333-8444-555555555555',
        publicRegistryId: 'AB',
        verificationLevel: 'authority_verified',
        visibilityLevel: 'public',
      }),
    ).rejects.toThrow(/publicRegistryId/i);
  });
});
