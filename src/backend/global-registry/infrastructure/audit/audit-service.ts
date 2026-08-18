export interface AuditRecord {
  id: string;
  action: string;
  actorId: string;
  entityId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const SENSITIVE_KEYS = ['password', 'secret', 'token', 'accessToken', 'authorization'];

export class AuditService {
  private readonly records: AuditRecord[] = [];

  record(input: Omit<AuditRecord, 'id' | 'createdAt'>): AuditRecord {
    const sanitizedMetadata = this.sanitizeMetadata(input.metadata ?? {});
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      action: input.action,
      actorId: input.actorId,
      entityId: input.entityId,
      metadata: sanitizedMetadata,
      createdAt: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  list(): AuditRecord[] {
    return this.records.slice();
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))),
    );
  }
}
