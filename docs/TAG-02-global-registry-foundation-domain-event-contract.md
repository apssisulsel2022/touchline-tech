# TOUCHLINE ENTERPRISE ARCHITECTURE
## TAG-02 — Global Registry Foundation
### Artefact 06 — Domain Event Contract

> This document defines the enterprise event architecture for the Global Registry Foundation. It describes domain events, integration events, payload contracts, metadata, lifecycle, ordering, idempotency, retry behavior, producer and consumer mapping, and broker-agnostic compatibility guidance.

---

## 1. Event Architecture Objectives

The event model is designed to support:

- loose coupling between registry, workflow, and governance modules
- traceable lifecycle changes across identity, verification, merge, and public visibility operations
- reliable downstream integration with external systems and services
- auditability and compliance visibility
- future compatibility with message brokers such as Kafka, NATS, RabbitMQ, or cloud-native event buses

This design remains enterprise-focused and does not include implementation code.

---

## 2. Event Model Principles

### 2.1 Core Principles

- events represent facts that already happened
- events are immutable once published
- events must carry enough context for independent consumption
- events should be versioned and schema-evolvable
- consumers must tolerate unknown fields and future versions
- every business-significant action should produce an auditable event

### 2.2 Event Types

| Type | Purpose |
| --- | --- |
| Domain Event | Internal business fact emitted from the domain model |
| Integration Event | Externalized event intended for downstream systems |
| Command Event | Optional event representation of an intent, if explicitly required |
| Audit Event | Governance or compliance-oriented event emitted for traceability |

---

## 3. Naming Convention

### 3.1 Event Naming Pattern

Use the following pattern:

- <Aggregate>.<Action>
- <Aggregate>.<Action>.v<version>

Examples:

- RegistryIdentity.Created
- VerificationCase.DecisionRecorded
- PublicProfile.VisibilityChanged
- MergeCase.Executed

### 3.2 Preferred Conventions

- use PascalCase for event names
- use past-tense or completed-action naming for domain events
- use explicit nouns and business actions
- avoid implementation-level names such as table-updated or row-inserted

### 3.3 Event Type Suffixes

| Event Category | Naming Style |
| --- | --- |
| Domain Event | RegistryIdentity.Created |
| Integration Event | RegistryIdentity.Created.Integration |
| Audit Event | RegistryIdentity.StatusChanged.Audit |

---

## 4. Event Versioning

### 4.1 Versioning Strategy

All events must be versioned using a semantic event versioning approach.

Recommended format:

- eventName.v1
- eventName.v2

### 4.2 Compatibility Rules

- major version changes indicate breaking contract changes
- minor version changes may add optional fields without breaking consumers
- consumers must ignore unknown fields
- producers must not remove fields in a backward-compatible version

### 4.3 Versioning Guidance

| Change Type | Version Impact |
| --- | --- |
| Adding optional field | minor |
| Renaming field | major |
| Changing field type | major |
| Changing semantics of existing field | major |

---

## 5. Event Metadata

Every event must include common metadata for routing, correlation, and compliance.

### 5.1 Required Metadata Fields

| Field | Type | Purpose |
| --- | --- | --- |
| eventId | UUID | Unique identifier of the event |
| eventType | string | Full event type name |
| eventVersion | string | Event schema version |
| occurredAt | datetime | When the business event occurred |
| correlationId | string | Correlates distributed workflow steps |
| causationId | string | Identifies the cause or initiating event |
| producer | string | Producing service or bounded context |
| producerVersion | string | Producer software version |
| tenantId | string | Tenant or organization scope |
| registryDefinitionId | UUID | Registry definition scope |
| registryIdentityId | UUID | Canonical identity scope |
| schemaVersion | string | Schema version of the payload |
| traceId | string | Distributed tracing identifier |
| source | string | Source system or subsystem |

### 5.2 Optional Metadata Fields

- actorId
- authorityId
- jurisdictionCode
- publicVisibilityLevel
- importBatchId
- duplicateCaseId
- mergeCaseId
- isReplayable

---

## 6. Domain Events

### 6.1 Registry Identity Events

#### RegistryIdentity.Created
Purpose: emitted when a canonical registry identity is created.

Payload schema:

- registryIdentityId
- publicRegistryId
- registryDefinitionId
- registryStatus
- verificationLevel
- visibilityLevel
- createdAt
- sourceOrigin

#### RegistryIdentity.StatusChanged
Purpose: emitted when the lifecycle status changes.

Payload schema:

- registryIdentityId
- previousStatus
- newStatus
- reasonCode
- changedAt
- changedByActorId

#### RegistryIdentity.VerificationLevelUpdated
Purpose: emitted when the verification level changes.

Payload schema:

- registryIdentityId
- previousVerificationLevel
- newVerificationLevel
- reasonCode
- effectiveAt

#### RegistryIdentity.VisibilityChanged
Purpose: emitted when the public visibility state changes.

Payload schema:

- registryIdentityId
- previousVisibilityLevel
- newVisibilityLevel
- reasonCode
- effectiveAt

#### RegistryIdentity.Merged
Purpose: emitted when a merge operation completes.

Payload schema:

- registryIdentityId
- canonicalIdentityId
- sourceIdentityIds
- mergeCaseId
- mergeReasonCode
- executedAt

---

### 6.2 Verification Workflow Events

#### VerificationCase.Opened
Purpose: emitted when a verification case is created.

Payload schema:

- verificationCaseId
- registryIdentityId
- requiredVerificationLevel
- dueAt
- openedAt

#### VerificationCase.DecisionRecorded
Purpose: emitted when a verification decision is recorded.

Payload schema:

- verificationCaseId
- registryIdentityId
- decisionCode
- decisionReasonCode
- effectiveVerificationLevel
- decidedAt

#### VerificationCase.EvidenceAdded
Purpose: emitted when evidence is attached to a verification case.

Payload schema:

- verificationCaseId
- evidenceId
- evidenceTypeCode
- sensitivityCode
- addedAt

#### VerificationCase.ReviewRequested
Purpose: emitted when a review activity is requested or reassigned.

Payload schema:

- verificationCaseId
- registryIdentityId
- assignedAuthorityScope
- requestedAt

---

### 6.3 Duplicate and Merge Events

#### DuplicateCase.Detected
Purpose: emitted when a potential duplicate is identified.

Payload schema:

- duplicateCaseId
- registryIdentityId
- candidateIdentityId
- matchReasonCode
- matchScore
- detectedAt

#### DuplicateCase.Resolved
Purpose: emitted when a duplicate case is resolved.

Payload schema:

- duplicateCaseId
- resolutionCode
- resolvedAt
- reviewedByActorId

#### MergeCase.Requested
Purpose: emitted when a merge workflow is requested.

Payload schema:

- mergeCaseId
- canonicalIdentityId
- sourceIdentityIds
- requestedAt

#### MergeCase.Executed
Purpose: emitted when a merge workflow is completed.

Payload schema:

- mergeCaseId
- canonicalIdentityId
- sourceIdentityIds
- aliasIds
- executedAt

---

### 6.4 Public Profile Events

#### PublicProfile.Published
Purpose: emitted when a public profile becomes visible.

Payload schema:

- publicProfileId
- registryIdentityId
- visibilityLevel
- publishedAt

#### PublicProfile.Hidden
Purpose: emitted when a public profile is hidden or retired.

Payload schema:

- publicProfileId
- registryIdentityId
- previousVisibilityLevel
- newVisibilityLevel
- reasonCode
- changedAt

---

### 6.5 Import and Integration Events

#### ImportBatch.Received
Purpose: emitted when an import batch is accepted.

Payload schema:

- importBatchId
- sourceSystemCode
- importStatus
- receivedAt

#### ImportRecord.Processed
Purpose: emitted when an import record is processed.

Payload schema:

- importRecordId
- importBatchId
- registryIdentityId
- validationOutcome
- processedAt

#### ExternalRegistryReference.Linked
Purpose: emitted when an external registry reference is linked.

Payload schema:

- externalRegistryReferenceId
- registryIdentityId
- externalSourceCode
- linkageStatus
- linkedAt

---

## 7. Integration Events

Integration events are outward-facing events intended for downstream services.

### 7.1 Recommended Integration Events

| Event | Purpose |
| --- | --- |
| RegistryIdentity.Created.Integration | Notifies downstream registries or identity consumers |
| VerificationCase.DecisionRecorded.Integration | Notifies external verification consumers |
| MergeCase.Executed.Integration | Notifies downstream lineage or analytics systems |
| PublicProfile.Published.Integration | Notifies public lookup or external index systems |
| ImportBatch.Received.Integration | Notifies integration orchestration systems |

### 7.2 Integration Event Contract Principles

- integration events should be shaped for downstream consumption, not for internal storage semantics
- they must include the minimum business context required by consumers
- they should avoid exposing internal-only identifiers where public-safe identifiers are sufficient

---

## 8. Payload Schemas

### 8.1 Common Event Envelope

Every event should use a standard envelope:

- eventId
- eventType
- eventVersion
- occurredAt
- correlationId
- causationId
- producer
- producerVersion
- tenantId
- registryDefinitionId
- registryIdentityId
- schemaVersion
- traceId
- source
- payload

### 8.2 Payload Schema Pattern

Each event payload should be a dedicated object with business-specific fields.

Example:

- payload.registryIdentityId
- payload.publicRegistryId
- payload.registryStatus
- payload.verificationLevel
- payload.visibilityLevel

### 8.3 Schema Validation Rules

- required fields must be enforced by contract validation
- consumers must accept additional unknown fields
- field names should remain stable across versions
- payload content should be serializable and schema-defined

---

## 9. Event Metadata

### 9.1 Required Event Metadata

| Metadata Field | Required | Notes |
| --- | --- | --- |
| eventId | Yes | unique and immutable |
| eventType | Yes | event identifier |
| eventVersion | Yes | version of the event contract |
| occurredAt | Yes | timestamp in UTC |
| correlationId | Yes | ties workflow steps together |
| causationId | Yes | ties to triggering event |
| producer | Yes | source domain or service |
| tenantId | Yes | tenant or organization scope |
| registryIdentityId | Yes for identity-bound events |
| traceId | Yes for distributed tracing |

### 9.2 Metadata Handling Rules

- metadata should be generated by the producer and preserved by consumers
- correlation and trace IDs should not be lost between hops
- metadata fields should be validated before publication

---

## 10. Event Ordering

### 10.1 Ordering Requirements

- ordering is required for causally linked events within the same aggregate stream
- ordering should be preserved per entity or per aggregate key
- out-of-order delivery should be tolerated where business semantics allow

### 10.2 Recommended Ordering Strategy

| Scenario | Ordering Requirement |
| --- | --- |
| Same identity lifecycle changes | strict per identity ordering |
| Verification workflow steps | strict per verification case |
| Merge workflow actions | strict per merge case |
| Public profile visibility updates | strict per identity |
| Cross-domain integrations | best effort unless explicitly ordered |

### 10.3 Ordering Mechanism

- use partition keys based on registryIdentityId or aggregate ID
- maintain sequence numbers when strict order is required
- include occurredAt and sequenceNumber in the metadata when supported

---

## 11. Idempotency Strategy

### 11.1 Idempotency Goals

Events and event delivery must be safe under duplicate publishes or replay scenarios.

### 11.2 Idempotency Mechanism

- each event should carry a unique eventId
- consumers should store processed event IDs in a durable deduplication store
- producer retries should use the same eventId for the same logical operation

### 11.3 Idempotency Rules

- duplicate delivery of the same event must not create duplicate side effects
- replaying a previously processed event must be safely ignored
- event processing logic must be idempotent by design

---

## 12. Retry Strategy

### 12.1 Retry Principles

- transient failures should be retried with exponential backoff
- retries must not create duplicate business effects due to idempotency handling
- dead-letter handling is required for unrecoverable messages

### 12.2 Recommended Retry Policy

| Failure Type | Retry Strategy |
| --- | --- |
| Temporary network or broker issue | exponential backoff with bounded retry |
| Dependency outage | retry with circuit breaker and delay |
| Validation failure | no retry; send to dead-letter queue |
| Consumer logic bug | quarantine and manual remediation |

### 12.3 Retry Metadata

- retryCount
- maxRetries
- nextRetryAt
- failureReason

---

## 13. Event Lifecycle

### 13.1 Lifecycle Stages

| Stage | Description |
| --- | --- |
| Drafted | Event is created in memory or in a pending state |
| Published | Event is emitted to a broker or transport |
| Delivered | Event has been accepted by the transport |
| Consumed | Consumer has processed the event |
| Acknowledged | Consumer confirms handling complete |
| Dead-Lettered | Event cannot be processed and is quarantined |

### 13.2 Lifecycle Rules

- events must not be considered complete unless acknowledged by the intended consumer
- dead-letter handling must preserve event context for analysis
- replay should be possible from the original event store or broker retention window

---

## 14. Consumer Mapping

### 14.1 Consumer Categories

| Consumer | Events Consumed |
| --- | --- |
| Identity Search Service | RegistryIdentity.Created, RegistryIdentity.StatusChanged, PublicProfile.Published |
| Verification Workflow Service | VerificationCase.Opened, VerificationCase.DecisionRecorded |
| Duplicate Resolution Service | DuplicateCase.Detected, DuplicateCase.Resolved |
| Merge Governance Service | MergeCase.Requested, MergeCase.Executed |
| Audit and Compliance Service | all domain and integration events |
| Public Directory Service | PublicProfile.Published, PublicProfile.Hidden |
| Analytics Platform | selected integration events and lifecycle events |

### 14.2 Consumer Contract Rules

- consumers should subscribe to a stable event contract and ignore unknown fields
- consumer side effects must be idempotent
- consumers should log processing outcomes, including eventId and correlationId

---

## 15. Producer Mapping

### 15.1 Producing Bounded Contexts

| Producer | Events Produced |
| --- | --- |
| Registry Core | RegistryIdentity.Created, RegistryIdentity.StatusChanged, RegistryIdentity.VisibilityChanged |
| Verification Workflow | VerificationCase.Opened, VerificationCase.DecisionRecorded, VerificationCase.EvidenceAdded |
| Duplicate Workflow | DuplicateCase.Detected, DuplicateCase.Resolved |
| Merge Workflow | MergeCase.Requested, MergeCase.Executed |
| Public Profile Service | PublicProfile.Published, PublicProfile.Hidden |
| Import Service | ImportBatch.Received, ImportRecord.Processed |

### 15.2 Producer Rules

- producers should publish only after the business transaction has committed or is durably recorded
- producers should not emit events for speculative or incomplete actions
- event publication should be part of the transaction or coordinated through a reliable outbox pattern

---

## 16. Future Message Broker Compatibility

### 16.1 Broker-Agnostic Design

The contract is intentionally broker-neutral and can be adapted to:

- Apache Kafka
- RabbitMQ
- NATS
- Azure Service Bus
- AWS EventBridge
- cloud-native event hubs

### 16.2 Compatibility Mapping

| Capability | Broker-Agnostic Requirement |
| --- | --- |
| Message routing | topic or channel naming with shared contract |
| Ordering | partition key or message key support |
| Delivery guarantees | at-least-once or exactly-once semantics where supported |
| Replay | retained event history or offset-based replay |
| Dead-letter handling | retry and quarantine support |
| Schema evolution | versioned event payloads and compatibility rules |

### 16.3 Recommended Transport Characteristics

- use JSON or JSON Schema-compatible envelopes
- preserve event type and version in the message headers or envelope
- keep payloads compact and business-focused
- support schema registry or contract registry practices where available

---

## 17. Event Contract Examples

### 17.1 Example: RegistryIdentity.Created

```json
{
  "eventId": "11111111-2222-4333-8444-555555555555",
  "eventType": "RegistryIdentity.Created",
  "eventVersion": "v1",
  "occurredAt": "2026-07-31T12:00:00Z",
  "correlationId": "corr-001",
  "causationId": "caus-001",
  "producer": "registry-core",
  "producerVersion": "1.0.0",
  "tenantId": "tenant-001",
  "registryDefinitionId": "33333333-4444-4555-8666-777777777777",
  "registryIdentityId": "44444444-5555-4666-8777-888888888888",
  "schemaVersion": "1.0",
  "traceId": "trace-001",
  "source": "registry-core",
  "payload": {
    "registryIdentityId": "44444444-5555-4666-8777-888888888888",
    "publicRegistryId": "REG-1001",
    "registryStatus": "active",
    "verificationLevel": "authority_verified",
    "visibilityLevel": "public"
  }
}
```

### 17.2 Example: VerificationCase.DecisionRecorded

```json
{
  "eventId": "22222222-3333-4444-9555-666666666666",
  "eventType": "VerificationCase.DecisionRecorded",
  "eventVersion": "v1",
  "occurredAt": "2026-07-31T12:05:00Z",
  "correlationId": "corr-002",
  "causationId": "caus-002",
  "producer": "verification-workflow",
  "producerVersion": "1.0.0",
  "tenantId": "tenant-001",
  "registryDefinitionId": "33333333-4444-4555-8666-777777777777",
  "registryIdentityId": "44444444-5555-4666-8777-888888888888",
  "schemaVersion": "1.0",
  "traceId": "trace-002",
  "source": "verification-workflow",
  "payload": {
    "verificationCaseId": "55555555-6666-4777-9888-999999999999",
    "decisionCode": "approved",
    "decisionReasonCode": "identity_confirmed",
    "effectiveVerificationLevel": "authority_verified",
    "decidedAt": "2026-07-31T12:05:00Z"
  }
}
```

---

## 18. Summary

This event contract establishes a robust, broker-agnostic architecture for the Global Registry Foundation. It ensures that business events are:

- explicit and domain-driven
- versioned and evolvable
- traceable and auditable
- safe for retries and replay
- suitable for future integration and message bus adoption

The design supports both internal orchestration and downstream integration without hard-coding a specific broker implementation.
