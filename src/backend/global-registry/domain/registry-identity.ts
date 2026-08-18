export type VerificationLevel =
  | 'unverified'
  | 'self_declared'
  | 'document_verified'
  | 'authority_verified'
  | 'externally_verified'
  | 'federation_verified';

export type VisibilityLevel = 'private' | 'restricted' | 'public' | 'hidden' | 'suspended';
export type RegistryStatus =
  | 'draft'
  | 'submitted'
  | 'pending_screening'
  | 'pending_verification'
  | 'under_review'
  | 'verified'
  | 'active'
  | 'restricted'
  | 'suspended'
  | 'rejected'
  | 'merged'
  | 'superseded'
  | 'archived'
  | 'retired';

export type CanonicalState = 'canonical' | 'superseded' | 'retired' | 'merged';

export interface RegistryIdentity {
  id: string;
  registryDefinitionId: string;
  publicRegistryId: string;
  registryStatus: RegistryStatus;
  verificationLevel: VerificationLevel;
  visibilityLevel: VisibilityLevel;
  canonicalState: CanonicalState;
  registrationContext?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistryIdentityInput {
  registryDefinitionId: string;
  publicRegistryId: string;
  verificationLevel: VerificationLevel;
  visibilityLevel: VisibilityLevel;
  registrationContext?: Record<string, unknown>;
}

export interface UpdateRegistryIdentityInput {
  verificationLevel?: VerificationLevel;
  visibilityLevel?: VisibilityLevel;
  registryStatus?: RegistryStatus;
}

export function createRegistryIdentity(input: CreateRegistryIdentityInput): RegistryIdentity {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    registryDefinitionId: input.registryDefinitionId,
    publicRegistryId: input.publicRegistryId,
    registryStatus: 'draft',
    verificationLevel: input.verificationLevel,
    visibilityLevel: input.visibilityLevel,
    canonicalState: 'canonical',
    registrationContext: input.registrationContext,
    createdAt: now,
    updatedAt: now,
  };
}
