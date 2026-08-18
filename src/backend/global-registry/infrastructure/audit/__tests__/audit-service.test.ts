import { describe, expect, it } from 'vitest';
import { AuditService } from '../audit-service';

describe('AuditService', () => {
  it('sanitizes sensitive metadata before storing it', () => {
    const auditService = new AuditService();

    const event = auditService.record({
      action: 'registry.identity.created',
      actorId: 'actor-001',
      metadata: {
        password: 'secret',
        accessToken: 'abc123',
        safeValue: 'ok',
      },
    });

    expect(event.metadata).toEqual({ safeValue: 'ok' });
    expect(event.metadata).not.toHaveProperty('password');
    expect(event.metadata).not.toHaveProperty('accessToken');
  });
});
