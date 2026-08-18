# Global Registry Foundation Backend

This backend module provides a clean-architecture foundation for the Global Registry Foundation.

## Structure

- domain: entities and repository contracts
- application/services: use cases and orchestration
- infrastructure: persistence, audit, logging, and Supabase adapters
- docs: module documentation

## Key Capabilities

- registry identity creation and update
- validation with Zod
- audit recording and sanitization
- repository abstraction ready for Supabase or in-memory persistence
- CQRS-ready service boundaries

## Notes

- This module intentionally excludes frontend implementation.
- The Supabase repository is infrastructure-level and expects the following table shape for the initial implementation:
  - registry_identities(id, registry_definition_id, public_registry_id, registry_status, verification_level, visibility_level, canonical_state, registration_context, created_at, updated_at)
