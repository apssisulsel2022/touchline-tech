# TOUCHLINE ENTERPRISE ARCHITECTURE
## TAG-02 — Global Registry Foundation
### Artefact 02 — Conceptual Domain Model (DDD)

> This document defines the complete conceptual domain model for the Global
> Registry Foundation within Touchline. It is intentionally technology-neutral,
> architecture-focused, and limited to the shared foundation for permanent
> identity, verification, governance, public resolution, and provenance. It does
> not implement any individual registry, database schema, API contract, or
> application code.

---

## 1. Executive Domain Summary

### Purpose

The Global Registry Foundation exists to provide a shared, enterprise-grade
platform capability for creating and governing permanent, traceable, verifiable
identities across the Touchline ecosystem. It standardizes how identities are
represented, verified, governed, searched, published, and audited for all future
registries.

### Business Value

- Establishes a durable identity backbone for the broader football ecosystem.
- Reduces duplicate, conflicting, and fragmented identity records.
- Enables federation-grade governance and cross-organization trust.
- Supports future integration with external verification services, authorities,
  and public-facing resolution tools.
- Creates a reusable foundation for player, coach, referee, organization,
  academy, venue, medical, and other registries without duplicating logic.

### Strategic Role in Touchline

The foundation sits in the business capability layer and depends on shared
platform capabilities such as Identity, Authorization, Organization, Workflow,
Document Service, Audit, Search, Notification, and Integration Gateway. It is
the canonical domain for permanent identity policy and registry governance.

### Problems It Solves

- Fragmented identity records across clubs, academies, federations, and
  associations.
- Weak lineage between a person or organization and their historical records.
- Inconsistent verification, duplicate handling, and public visibility controls.
- Failure to preserve provenance when data is imported, merged, or corrected.

### Registry Capabilities Standardized

- Identity creation and claim management
- Permanent public identifier issuance
- Evidence submission and verification
- Authority assignment and workflow
- Duplicate detection and resolution
- Merge, split, and reversal controls
- Public visibility and QR resolution
- Audit, provenance, and reporting

### Distinctions

- A registry identity is not the same as an organization membership. Membership
  is a relationship; registry identity is a permanent identity record.
- A registry identity is not the same as a user account. A user account enables
  authentication; a registry identity represents a durable domain entity.
- A registry identity is not the same as a public profile. A public profile is a
  presentation layer over an identity with visibility controls.
- An internal UUID is a system primary key. A public registry ID is an
  externally meaningful, permanent, human-readable identifier.

### Key Governance Clarifications

- One user account may be linked to multiple registry identities only when
  legitimately required.
- A registry identity may exist without any login account.
- Memberships and employment relationships do not redefine the permanent
  registry identity.
- Registry history remains intact when a person or organization changes
  affiliation.

---

## 2. Domain Scope

### In Scope

- Registry identity creation
- Registry identity claim
- Permanent public identifiers
- Identity verification
- Evidence submission
- Authority review
- Duplicate detection
- Identity matching
- Conflict resolution
- Record merge
- Record separation when incorrectly merged
- Identity suspension
- Identity reactivation
- Identity retirement where legally or operationally required
- Public visibility
- QR resolution
- Registry history
- Registry data provenance
- Registry authority assignment
- Registry status lifecycle
- Registry search
- Registry-level audit
- Registry-level reporting
- External registry references
- Import and migration traceability

### Out of Scope

- Player statistics
- Coach assignments
- Referee match assignments
- Competition fixtures
- Training attendance
- Payment processing
- Match events
- Organization membership management
- Authentication implementation
- File-storage implementation
- Notification transport implementation
- AI model implementation
- Individual registry-specific business data

### Future Scope

- Government identity integration
- Federation registry synchronization
- Biometric verification
- Cross-country federation exchange
- Trusted external verification providers
- Digital credentials and verifiable credentials
- Offline QR validation
- Advanced fraud detection

---

## 3. Ubiquitous Language

| Term                        | Formal Definition                                                                                   | Domain Usage                                                                                | Must Not Be Used Interchangeably With                 |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Registry                    | A reusable governance framework for a class of identities within Touchline.                         | Defines rules, policy, lifecycle, and identifier behaviors for a registry family.           | A single record or a registry identity                |
| Registry Type               | A category of registry such as player, referee, organization, academy, venue, or medical staff.     | Selects the applicable policy and extension model.                                          | Registry instance                                     |
| Registry Identity           | The canonical permanent identity record for a subject within a registry.                            | Represents the durable business identity of a person or organization within the foundation. | User account, organization membership, public profile |
| Registry Record             | A concrete record stored within a registry instance.                                                | A versioned representation of a subject’s data and lifecycle state.                         | Registry identity                                     |
| Registry Subject            | The real-world person or organization represented by the registry identity.                         | Used in business rules and evidence workflows.                                              | Registry record                                       |
| Public Registry ID          | A permanent, human-readable, non-sensitive identifier assigned to a registry identity.              | Used for public-facing references and QR resolution.                                        | Internal UUID                                         |
| Internal Identity ID        | The internal system primary identifier for the registry identity.                                   | Used for system persistence and internal linking.                                           | Public registry ID                                    |
| Registry Authority          | An organization or role empowered to govern a registry domain.                                      | Approves registrations, verifies evidence, and enforces policy.                             | Any generic admin role                                |
| Registering Authority       | The authority that accepts or registers a subject into a registry.                                  | Creates or submits new identities.                                                          | Verifying authority                                   |
| Verifying Authority         | The authority that evaluates submitted evidence and decides verification outcomes.                  | Approves or rejects evidence-based claims.                                                  | Registering authority                                 |
| Registry Owner              | The business owner of the registry model and policy.                                                | Defines the lifecycle and policy defaults.                                                  | Tenant owner                                          |
| Identity Claim              | A statement made about a registry subject, such as name, date of birth, legal name, or affiliation. | Submitted for review and verification.                                                      | Evidence                                              |
| Identity Evidence           | A supporting artifact that substantiates an identity claim.                                         | Uploaded, assessed, and attached to verification cases.                                     | Claim                                                 |
| Verification Case           | A workflow unit for evaluating a set of evidence and claims.                                        | Encapsulates review state and decisions.                                                    | Evidence                                              |
| Verification Decision       | The outcome of a verification case.                                                                 | Approved, rejected, more information required, escalated, etc.                              | Verification status                                   |
| Verification Level          | The trust level achieved by a registry identity.                                                    | Unverified, self-declared, document-verified, authority-verified, federation-verified.      | Verification decision                                 |
| Verification Status         | The current state of a verification process.                                                        | Pending, approved, expired, withdrawn.                                                      | Verification level                                    |
| Registry Status             | The lifecycle state of the registry identity.                                                       | Draft, active, suspended, merged, retired.                                                  | Verification status                                   |
| Identity Match              | A relationship between two or more identities found by screening or review.                         | Used to identify duplicates or potential conflicts.                                         | Duplicate                                             |
| Duplicate Candidate         | A possible duplicate identity surfaced by screening.                                                | Input to a duplicate case.                                                                  | Confirmed duplicate                                   |
| Duplicate Case              | A review workflow that evaluates duplicate candidates.                                              | Responsible for review decisions.                                                           | Match                                                 |
| Merge Case                  | A controlled workflow for combining identities.                                                     | Requires authority approval and provenance preservation.                                    | Duplicate case                                        |
| Canonical Record            | The surviving identity record after a merge.                                                        | Receives the authoritative state and public references.                                     | Source record                                         |
| Source Record               | An identity that participates in a merge but does not survive as the canonical record.              | Preserved as historical lineage.                                                            | Canonical record                                      |
| Data Provenance             | The lineage and trust metadata of every significant registry attribute.                             | Explains origin, source, actor, and transformation.                                         | Audit log                                             |
| Identity Conflict           | A contradiction or dispute between claims or records.                                               | Requires resolution workflow.                                                               | Duplicate                                             |
| Identity Resolution         | A process of resolving a conflict, duplicate, or merge case.                                        | Broad umbrella term.                                                                        | Merge                                                 |
| Registry Suspension         | A controlled temporary restriction of a registry identity.                                          | Used for fraud, legal, or governance reasons.                                               | Retirement                                            |
| Registry Reactivation       | Reinstatement of a suspended identity.                                                              | Requires authority review and policy compliance.                                            | Activation                                            |
| Public Profile              | A visibility-controlled presentation of selected attributes.                                        | Used for public lookups and QR resolution.                                                  | Registry identity                                     |
| Public Visibility           | The policy governing exposure of a profile or identity data.                                        | Controlled by registry policy and status.                                                   | Public profile                                        |
| QR Resolution               | The process of resolving a public-facing QR or short-link into an approved destination.             | Must preserve privacy and current status.                                                   | Database key exposure                                 |
| External Registry Reference | A reference to a related identity in an external source system.                                     | Supports import, federation, and cross-system linking.                                      | Internal identity                                     |
| Registry Event              | A domain event describing a meaningful lifecycle change.                                            | Used for workflow, audit, and integration.                                                  | Log entry                                             |
| Registry Timeline           | A chronologically ordered history of identity lifecycle events.                                     | Used in investigation and reporting.                                                        | Audit log                                             |
| Identity Alias              | An alternate identifier associated with a registry identity.                                        | Preserves legacy or imported values.                                                        | Secondary record                                      |
| Legacy Identifier           | An identifier used by prior systems or historical processes.                                        | Preserved as alias and provenance metadata.                                                 | Current registry ID                                   |
| Registry Number Reservation | A temporary claim over a future public identifier.                                                  | Prevents race conditions and duplicate issuance.                                            | Identifier assignment                                 |
| Manual Review               | A human-driven review of disputed or high-risk cases.                                               | Required for high-risk duplicates or conflicts.                                             | Automated screening                                   |
| Automated Screening         | Rule-based or model-assisted pre-review of candidate matches.                                       | Used to surface potential issues.                                                           | Manual review                                         |
| Trusted Source              | A recognized authority or system considered authoritative for a claim.                              | Influences verification trust.                                                              | Any source                                            |
| Evidence Validity           | Whether evidence is current, intact, and still accepted.                                            | Dictates whether evidence can support verification.                                         | Evidence presence                                     |
| Evidence Expiration         | The time after which evidence should be rechecked or re-submitted.                                  | Drives re-verification workflows.                                                           | Evidence deletion                                     |
| Registry Jurisdiction       | The legal or administrative region within which an authority acts.                                  | Governs authority scope and visibility.                                                     | Organization scope                                    |

---

## 4. Bounded Context Definition

### Bounded Context Name

Global Registry Foundation

### Purpose

To own the shared domain rules for permanent registry identity, verification,
public resolution, authority governance, duplication control, merge policy, and
historical continuity across all future registry domains.

### Responsibilities

- Define reusable registry policies and lifecycle rules.
- Govern permanent internal and public identifier issuance.
- Manage identity verification and evidence workflows.
- Coordinate duplicate screening, resolution, and merge controls.
- Maintain registry history, provenance, and auditability.
- Provide public-profile and QR resolution policy.

### Data Ownership

The foundation owns core registry identity concepts, registry policy
definitions, verification cases, merge and duplicate workflows, public
visibility rules, and identity provenance records.

### Authority Boundaries

It does not own authentication, direct file storage, transport notifications, or
individual registry-specific business logic. It governs the shared rules, not
the specialized business data of each child registry.

### Upstream Dependencies

- IAM for user and service identity
- Organization Engine for tenant and relationship context
- Workflow for approval and case orchestration
- Document Service for evidence storage and retrieval
- Audit for immutable event logging
- Search for indexed discovery
- Notification for user communication
- Integration Gateway for external reference sources

### Downstream Consumers

- Player Registry
- Coach Registry
- Referee Registry
- Organization Registry
- Academy Registry
- Competition Registry
- Federation Services
- Public Portal
- Intelligence Services

### Public Interfaces

- Registry definition management
- Identity submission and verification APIs
- Duplicate screening and merge workflows
- Public profile resolution and QR lookup
- External reference and import integration contracts

### Internal-only Concepts

- Canonical identity lifecycle rules
- Merge and split invariants
- Verification policy model
- Authority scope and delegation rules
- Public visibility policy

### Integration Boundaries

- The foundation should expose stable domain contracts and avoid leaking
  internal entity structures to consumers.
- Consumers must use an anti-corruption layer when integrating with
  registry-specific or external systems.

### Anti-Corruption Layer Requirements

- Translate external identifiers and claims to canonical registry concepts.
- Preserve provenance when importing from older systems.
- Avoid allowing downstream registries to bypass foundation invariants.

---

## 5. Context Map

| Relationship                                             | Context            | Relationship Type                                                                                                     | Rationale |
| -------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- | --------- |
| Global Registry Foundation → IAM                         | Customer–Supplier  | The registry foundation depends on IAM for subject authentication and service identity.                               |           |
| Global Registry Foundation ← Organization                | Customer–Supplier  | The foundation uses organization and relationship context to define jurisdiction, authority, and tenant-aware access. |           |
| Global Registry Foundation ↔ Workflow                    | Customer–Supplier  | Verification, merge, and authority review workflows are orchestrated through the workflow context.                    |           |
| Global Registry Foundation ↔ Document Service            | Customer–Supplier  | Evidence files are stored and managed externally; the foundation retains metadata and references.                     |           |
| Global Registry Foundation ↔ Audit                       | Customer–Supplier  | The foundation emits events to audit services for immutable recording.                                                |           |
| Global Registry Foundation ↔ Search                      | Customer–Supplier  | Search and discovery are implemented by a shared search capability.                                                   |           |
| Global Registry Foundation ↔ Notification                | Customer–Supplier  | Notifications about verification, merge, and public profile changes are sent through shared channels.                 |           |
| Global Registry Foundation ↔ Integration Gateway         | Customer–Supplier  | The foundation integrates with external registries and trusted sources through the gateway.                           |           |
| Global Registry Foundation ↔ Individual Registry Domains | Customer–Supplier  | Child registries consume foundation concepts and policies while contributing registry-specific data.                  |           |
| Global Registry Foundation ↔ Federation Services         | Customer–Supplier  | Federation services may supervise, approve, or consume registry decisions from the foundation.                        |           |
| Global Registry Foundation ↔ Public Experience           | Published Language | Public-facing resolution and profile visibility should use a stable contract.                                         |           |
| Global Registry Foundation ↔ Intelligence Layer          | Customer–Supplier  | Intelligence services may consume registry data for fraud screening or analytics, but must not own identity state.    |           |

### Integration Notes

- Shared Kernel is avoided unless a domain truly requires direct coupling; the
  foundation should remain intentionally decoupled from individual registry
  business logic.
- Published Language is preferred for public-facing lookup and QR resolution
  contracts.
- Anti-corruption layers are required where external authorities or imported
  data do not conform to canonical registry rules.

---

## 6. Registry Archetype

The Global Registry Foundation provides a reusable archetype that future
registries adopt. It defines shared concepts and ownership rules but not
implementation tables.

### Registry Definition

- Registry type
- Registry code
- Identifier prefix
- Identifier generation policy
- Registration jurisdiction
- Allowed authorities
- Verification requirements
- Public visibility defaults
- Status lifecycle
- Retention policy
- Duplicate-screening configuration

### Registry Identity

- Permanent internal UUID
- Permanent public registry ID
- Registry type
- Canonical identity status
- Registration authority
- Registration timestamp
- Current lifecycle status
- Verification state
- Public visibility state
- Provenance summary

### Identity Attributes

- Core identifying attributes
- Registry-specific attributes
- Sensitive attributes
- Public attributes
- Searchable attributes
- Matchable attributes
- Historical attributes

### Identity Evidence

- Evidence type
- Issuer
- Reference number
- Issue date
- Expiration date
- Evidence file reference
- Verification state
- Validation source
- Sensitivity classification

### Registry History

- Status history
- Attribute-change history
- Verification history
- Authority history
- Merge history
- Split history
- Identifier history
- Public visibility history

### Ownership Rules

- The foundation owns the common lifecycle and governance semantics.
- Child registries own their specific attribute extensions and policy
  variations.
- No child registry may weaken the foundation’s invariants or bypass provenance
  requirements.

---

## 7. Aggregates

### 1. Registry Definition Aggregate

- Aggregate Root: RegistryDefinition
- Entities: RegistryPolicy, AuthorityRule, VisibilityRule, IdentifierRule
- Value Objects: RegistryType, RegistryCode, IdentifierPrefix, RegistryStatus,
  VisibilityLevel, Jurisdiction
- Commands: CreateRegistryDefinition, UpdateRegistryDefinition
- Invariants:
  - A registry definition must have one canonical lifecycle policy.
  - Identifier policy must be compatible with the configured registry type.
  - Authority policy must remain within supported jurisdictions.
- Domain Events: RegistryDefinitionCreated, RegistryDefinitionUpdated
- Repository Boundary: RegistryDefinitionRepository
- Consistency Boundary: Registry policy configuration
- Transaction Boundary: Single registry definition change

### 2. Registry Identity Aggregate

- Aggregate Root: RegistryIdentity
- Entities: RegistryAttribute, RegistryIdentifier, RegistryStatusHistory,
  RegistryChangeRecord
- Value Objects: PublicRegistryId, RegistryStatus, VerificationStatus,
  VisibilityLevel, RegistryVersion
- Commands: CreateRegistryIdentity, SubmitRegistryIdentity,
  SuspendRegistryIdentity, ReactivateRegistryIdentity, CorrectRegistryData
- Invariants:
  - Exactly one internal UUID per identity.
  - Public registry IDs are unique and permanent.
  - The canonical state must remain traceable across merges and suspensions.
- Domain Events: RegistryIdentityCreated, RegistryIdentitySubmitted,
  RegistryIdentityActivated, RegistryIdentitySuspended,
  RegistryIdentityReactivated, RegistryDataCorrected
- Repository Boundary: RegistryIdentityRepository
- Consistency Boundary: One identity lifecycle and one canonical state
- Transaction Boundary: Identity write and history append

### 3. Verification Case Aggregate

- Aggregate Root: VerificationCase
- Entities: VerificationReview, VerificationDecision, IdentityEvidence
- Value Objects: VerificationLevel, VerificationDecision, EvidenceType,
  EvidenceValidity, RejectionReason
- Commands: StartVerification, AddIdentityEvidence, RequestAdditionalEvidence,
  ApproveVerification, RejectVerification
- Invariants:
  - Verification cases must tie to a single identity.
  - Decisions must be attributable to an authorized actor.
  - Evidence must not be silently replaced without provenance.
- Domain Events: VerificationCaseOpened, VerificationEvidenceAdded,
  VerificationMoreInformationRequested, RegistryIdentityVerified,
  RegistryIdentityRejected
- Repository Boundary: VerificationCaseRepository
- Consistency Boundary: Verification workflow state and evidence linkage
- Transaction Boundary: Verification case transition

### 4. Duplicate Case Aggregate

- Aggregate Root: DuplicateCase
- Entities: DuplicateCandidate, IdentityMatch
- Value Objects: MatchScore, MatchReason, DuplicateDecision
- Commands: ScreenForDuplicates, OpenDuplicateCase, ResolveDuplicateCase
- Invariants:
  - No irreversible merge may occur from screening alone.
  - High-risk matches require review.
  - Match reasoning must be explainable and auditable.
- Domain Events: DuplicateCandidateDetected, DuplicateCaseOpened,
  DuplicateCaseResolved
- Repository Boundary: DuplicateCaseRepository
- Consistency Boundary: Candidate evaluation and case decision
- Transaction Boundary: Duplicate screening or review result

### 5. Merge Case Aggregate

- Aggregate Root: MergeCase
- Entities: MergeSource, MergeDecision, IdentityAlias
- Value Objects: MergeDecision, EffectivePeriod, IdentityAlias
- Commands: RequestMerge, ApproveMerge, ExecuteMerge, RequestMergeReversal
- Invariants:
  - Public identifiers are never reused.
  - Source records remain historically traceable.
  - Provenance and audit records remain immutable.
- Domain Events: RegistryIdentityMerged, RegistryMergeReversed
- Repository Boundary: MergeCaseRepository
- Consistency Boundary: Canonical identity and alias lineage
- Transaction Boundary: Merge execution with immutable audit append

### 6. Registry Authority Assignment Aggregate

- Aggregate Root: RegistryAuthorityAssignment
- Entities: AuthorityScope, DelegationRule
- Value Objects: AuthorityType, AuthorityScope, Jurisdiction, EffectivePeriod
- Commands: AssignRegistryAuthority, RevokeRegistryAuthority,
  SuspendAuthorityAssignment
- Invariants:
  - Authorities remain within jurisdiction and scope.
  - Conflict-of-interest and self-verification restrictions apply.
- Domain Events: RegistryAuthorityAssigned, RegistryAuthorityRevoked
- Repository Boundary: AuthorityRepository
- Consistency Boundary: Assignment validity and delegation span
- Transaction Boundary: Assignment mutation

### 7. Public Registry Profile Aggregate

- Aggregate Root: PublicRegistryProfile
- Entities: PublicFieldPolicy, QRResolutionRecord
- Value Objects: VisibilityLevel, PublicRegistryId, ExternalReference
- Commands: PublishPublicProfile, HidePublicProfile
- Invariants:
  - Only approved fields may be public.
  - QR resolution must not expose internal keys or restricted data.
- Domain Events: PublicRegistryProfilePublished, PublicRegistryProfileHidden,
  RegistryQRResolved
- Repository Boundary: PublicProfileRepository
- Consistency Boundary: Visibility and resolution state
- Transaction Boundary: Profile update and QR resolution event

---

## 8. Entities

| Entity                        | Purpose                                                                  | Identity                          | Lifecycle                                             | Ownership  | Sensitive Considerations | Relationship to Aggregates                  |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------- | ---------- | ------------------------ | ------------------------------------------- |
| Registry Definition           | Defines registry policy and configuration.                               | Registry definition ID            | Created, updated, retired                             | Foundation | Low                      | Root of Registry Definition Aggregate       |
| Registry Identity             | Canonical identity for a subject.                                        | Internal UUID + public ID         | Created, verified, active, suspended, merged, retired | Foundation | High                     | Root of Registry Identity Aggregate         |
| Registry Attribute            | Represents a named attribute value attached to an identity.              | Attribute ID and identity binding | Added, updated, superseded                            | Foundation | High                     | Child entity of Registry Identity Aggregate |
| Registry Identifier           | Represents an identifier issued or assigned to an identity.              | Identifier ID                     | Issued, reserved, superseded, retired                 | Foundation | Medium                   | Child entity of Registry Identity Aggregate |
| Registry Authority            | Represents an authority or organization empowered for a registry domain. | Authority ID                      | Active, suspended, revoked                            | Foundation | Medium                   | Used by Authority Assignment Aggregate      |
| Registry Authority Assignment | Connects authorities to a registry identity domain and scope.            | Assignment ID                     | Active, expired, revoked                              | Foundation | Medium                   | Root of Authority Assignment Aggregate      |
| Identity Claim                | A factual assertion about a subject.                                     | Claim ID                          | Submitted, reviewed, accepted, rejected               | Foundation | Medium                   | Child of Verification Case Aggregate        |
| Verification Case             | Coordinates evidence and review.                                         | Verification case ID              | Open, pending, approved, rejected, escalated          | Foundation | High                     | Root of Verification Case Aggregate         |
| Verification Review           | A review activity or note.                                               | Review ID                         | Draft, submitted, resolved                            | Foundation | Medium                   | Child of Verification Case Aggregate        |
| Verification Decision         | The formal outcome of a review.                                          | Decision ID                       | Approved, rejected, more info, escalated              | Foundation | Medium                   | Child of Verification Case Aggregate        |
| Identity Evidence             | Supporting material for an identity claim.                               | Evidence ID                       | Submitted, approved, expired, withdrawn               | Foundation | High                     | Entity inside Verification Case Aggregate   |
| Duplicate Case                | Workflow for assessing duplicate candidates.                             | Duplicate case ID                 | Open, under review, resolved                          | Foundation | High                     | Root of Duplicate Case Aggregate            |
| Duplicate Candidate           | A potential duplicate match.                                             | Candidate ID                      | Created, reviewed, dismissed, accepted                | Foundation | Medium                   | Child of Duplicate Case Aggregate           |
| Identity Match                | A set of evidence-based similarity data.                                 | Match ID                          | Created, reviewed, invalidated                        | Foundation | Medium                   | Child of Duplicate Case Aggregate           |
| Merge Case                    | Workflow for combining identities.                                       | Merge case ID                     | Open, approved, executed, reversed                    | Foundation | High                     | Root of Merge Case Aggregate                |
| Merge Source                  | A source identity participating in a merge.                              | Source ID                         | Active, merged, retained                              | Foundation | High                     | Child of Merge Case Aggregate               |
| Merge Decision                | Formal approval or rejection of a merge.                                 | Decision ID                       | Pending, approved, rejected                           | Foundation | High                     | Child of Merge Case Aggregate               |
| Identity Alias                | Alternative identifier retained after merge or import.                   | Alias ID                          | Created, active, retired                              | Foundation | Medium                   | Child of Merge Case Aggregate               |
| External Registry Reference   | External relationship to another registry or authority system.           | Reference ID                      | Linked, revoked, stale                                | Foundation | Medium                   | Used by identity and import workflows       |
| Public Registry Profile       | Public-safe view of an identity.                                         | Profile ID                        | Published, hidden, suspended                          | Foundation | High                     | Root of Public Registry Profile Aggregate   |
| QR Resolution Record          | An access record for QR resolution.                                      | Record ID                         | Created, expired, revoked                             | Foundation | Low                      | Child of Public Registry Profile Aggregate  |
| Registry Status History       | The chronological history of status changes.                             | History ID                        | Created                                               | Foundation | Low                      | Child of Registry Identity Aggregate        |
| Registry Change Record        | A record of a significant change event.                                  | Change ID                         | Created                                               | Foundation | Medium                   | Child of Registry Identity Aggregate        |
| Registry Provenance Record    | The lineage and source of an attribute or event.                         | Provenance ID                     | Created                                               | Foundation | Medium                   | Child of Registry Identity Aggregate        |
| Registry Import Batch         | A batch imported into the registry foundation.                           | Batch ID                          | Pending, accepted, partially accepted, failed         | Foundation | Medium                   | Shared import workflow entity               |
| Registry Import Record        | A single imported identity or record.                                    | Import record ID                  | Imported, rejected, reconciled                        | Foundation | High                     | Shared import workflow entity               |

---

## 9. Value Objects

| Value Object         | Meaning                                                     | Validation Rules                                                           | Equality Rules | Immutability | Serialization                  |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- | ------------ | ------------------------------ |
| RegistryType         | Category of registry.                                       | Must be known and configurable.                                            | By value.      | Immutable.   | String/enum-like token.        |
| RegistryCode         | Short code used for registry identification.                | Must be unique within policy scope and normalized.                         | By value.      | Immutable.   | String.                        |
| PublicRegistryId     | Permanent public identifier.                                | Must be non-sensitive, unique, non-reused, and format-compliant.           | By value.      | Immutable.   | String.                        |
| IdentifierPrefix     | Prefix allocated to a registry family.                      | Allowed characters, length, and configurability.                           | By value.      | Immutable.   | String.                        |
| RegistryStatus       | Lifecycle state.                                            | Must be from approved domain status set.                                   | By value.      | Immutable.   | String token.                  |
| VerificationStatus   | Status of verification workflow.                            | Must be from approved verification states.                                 | By value.      | Immutable.   | String token.                  |
| VerificationLevel    | Trust level.                                                | Must be from approved trust levels.                                        | By value.      | Immutable.   | String token.                  |
| VerificationDecision | Formal decision outcome.                                    | Must be from permitted outcomes.                                           | By value.      | Immutable.   | String token.                  |
| AuthorityType        | Kind of authority.                                          | Must be one of registered authority types.                                 | By value.      | Immutable.   | String token.                  |
| AuthorityScope       | Jurisdictional or organizational scope.                     | Must be explicit and bounded.                                              | By value.      | Immutable.   | Structured object/string.      |
| Jurisdiction         | Legal or administrative scope.                              | Must be valid per supported geography.                                     | By value.      | Immutable.   | String or object.              |
| EvidenceType         | Category of evidence.                                       | Must be recognized.                                                        | By value.      | Immutable.   | String token.                  |
| EvidenceValidity     | Validity classification of evidence.                        | Must capture current, expired, revoked, or pending.                        | By value.      | Immutable.   | Structured value.              |
| VisibilityLevel      | Public access level.                                        | Must be from an approved visibility policy.                                | By value.      | Immutable.   | String token.                  |
| ProvenanceSource     | Source of a value or event.                                 | Must describe manual, import, external, federation, or AI-assisted origin. | By value.      | Immutable.   | String token.                  |
| MatchScore           | Confidence score for duplicate or similarity detection.     | Must be bounded and explainable.                                           | By value.      | Immutable.   | Numeric or structured payload. |
| MatchReason          | Reason why a match was identified.                          | Must be from approved reason codes.                                        | By value.      | Immutable.   | String token.                  |
| DuplicateDecision    | Decision on a duplicate case.                               | Must be one of accepted, rejected, false positive, etc.                    | By value.      | Immutable.   | String token.                  |
| MergeDecision        | Official decision on a merge request.                       | Must be approved, rejected, or deferred.                                   | By value.      | Immutable.   | String token.                  |
| IdentityAlias        | Alternate identifier preserved for continuity.              | Must be unique per identity context.                                       | By value.      | Immutable.   | String.                        |
| ExternalReference    | External identifier reference.                              | Must include source and reference.                                         | By value.      | Immutable.   | Structured object.             |
| SuspensionReason     | Reason for restriction.                                     | Must be from controlled reasons.                                           | By value.      | Immutable.   | String token.                  |
| ReactivationReason   | Reason for reactivation.                                    | Must be policy-compliant.                                                  | By value.      | Immutable.   | String token.                  |
| RejectionReason      | Why a claim or evidence was rejected.                       | Must be explainable.                                                       | By value.      | Immutable.   | String token.                  |
| ReviewNote           | Text associated with review work.                           | Must carry attribution and timestamp metadata.                             | By value.      | Immutable.   | String with metadata.          |
| RegistryVersion      | Version of a registry definition or identity attribute set. | Must increment on changes.                                                 | By value.      | Immutable.   | Numeric/string.                |
| EffectivePeriod      | The period during which a policy or assignment is active.   | Must include start and end dates where applicable.                         | By value.      | Immutable.   | Structured object.             |

---

## 10. Status Lifecycle

### Core Lifecycle Statuses

- Draft
- Submitted
- Pending Screening
- Pending Verification
- Under Review
- Verified
- Active
- Restricted
- Suspended
- Rejected
- Merged
- Superseded
- Archived
- Retired

### Status Catalog

| Status               | Meaning                                                    | Entry Conditions                             | Allowed Actions                                        | Prohibited Actions                     | Exit Conditions            | Required Actor          | Evidence              | Audit                 | Notification              |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ | -------------------------------------- | -------------------------- | ----------------------- | --------------------- | --------------------- | ------------------------- |
| Draft                | Record created but not yet submitted.                      | New identity initiated.                      | Edit, attach evidence, save.                           | Public visibility, final verification. | Submit.                    | Subject or registrar.   | Optional.             | Basic change history. | None/minimal.             |
| Submitted            | Identity submitted for screening and review.               | Submit command invoked.                      | Screening, evidence review.                            | Direct activation.                     | Screening complete.        | Submitter or registrar. | Required for review.  | Yes.                  | Inform relevant reviewer. |
| Pending Screening    | Screening is underway.                                     | Duplicate screening started.                 | Review candidates, request info.                       | Public publication.                    | Screening completed.       | System + reviewer.      | Minimum completeness. | Yes.                  | Review alert.             |
| Pending Verification | Identity passed initial checks and awaits verification.    | Screening complete.                          | Add evidence, assign authority.                        | Full activation.                       | Verification started.      | Authority or verifier.  | Required.             | Yes.                  | Review alert.             |
| Under Review         | Manual review is active.                                   | Case escalated or high-risk.                 | Request more evidence, approve/reject.                 | Direct activation.                     | Decision rendered.         | Reviewer.               | Required.             | Yes.                  | Escalation notice.        |
| Verified             | Evidence and claims accepted.                              | Verification approved.                       | Activate, publish profile, attach additional evidence. | Merge without authority.               | Activate or restrict.      | Verifying authority.    | Full evidence set.    | Yes.                  | Approval notice.          |
| Active               | Identity is in normal operational state.                   | Verified and approved.                       | Search, profile visibility, updates with policy.       | Merge without case.                    | Restrict, suspend, retire. | Authority.              | Current evidence.     | Yes.                  | None/minimal.             |
| Restricted           | Identity has limited capabilities due to policy or review. | Review or risk event.                        | Limited updates, view-only access.                     | Full public publishing.                | Reactivate or suspend.     | Authority.              | Required.             | Yes.                  | Alert.                    |
| Suspended            | Identity is temporarily blocked.                           | Fraud, legal hold, policy breach, or review. | Limited historical view, reactivation request.         | Normal operations.                     | Reactivate.                | Authority/admin.        | Required.             | Yes.                  | Alert.                    |
| Rejected             | Identity was not accepted.                                 | Verification rejected or policy violation.   | Resubmit under policy.                                 | Activation.                            | Resubmission or archival.  | Authority.              | Required.             | Yes.                  | Rejection notice.         |
| Merged               | Identity is absorbed into a canonical record.              | Merge approved.                              | Historical lookup, alias use.                          | New independent use.                   | Reverse or supersede.      | Authority/admin.        | Required.             | Yes.                  | Merge notice.             |
| Superseded           | Identity replaced by a newer or canonical record.          | Alternate record preferred.                  | Historical lookup.                                     | New independent operations.            | Retire or archive.         | Authority.              | Required.             | Yes.                  | Notice.                   |
| Archived             | Identity preserved for history but inactive.               | Retired or legacy conversion.                | Read-only historical view.                             | Normal use.                            | Restore only under policy. | Authority/admin.        | Required.             | Yes.                  | None/minimal.             |
| Retired              | Identity ended for legal or operational reasons.           | Retirement command.                          | Historical lookup, no operational use.                 | Reuse.                                 | Archive, preserve.         | Authority/admin.        | Required.             | Yes.                  | Notice.                   |

### State-Transition Matrix

| From                 | To                   | Requires                                       | Notes                                              |
| -------------------- | -------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Draft                | Submitted            | Automated validation + submitter authorization | Minimum data completeness required.                |
| Submitted            | Pending Screening    | Automated screening                            | Duplicate assessment begins.                       |
| Pending Screening    | Pending Verification | Screening passed                               | Manual review may be required for ambiguous cases. |
| Pending Screening    | Under Review         | High-risk or conflict case                     | Human reviewer required.                           |
| Pending Verification | Under Review         | High-risk or exceptional case                  | Manual review.                                     |
| Pending Verification | Verified             | Verification approval                          | Required evidence present.                         |
| Pending Verification | Rejected             | Verification rejection                         | Clear rejection reasons required.                  |
| Under Review         | Verified             | Dual approval for high-risk domains            | Required for sensitive registries.                 |
| Under Review         | Rejected             | Review outcome                                 | Must document reasons.                             |
| Verified             | Active               | Activation command                             | Public visibility may be gated.                    |
| Active               | Restricted           | Authority decision                             | Risk, legal, or policy-based.                      |
| Active               | Suspended            | Authority/admin action                         | Security or governance concern.                    |
| Restricted           | Active               | Authority reactivation                         | Must clear conditions.                             |
| Suspended            | Active               | Reactivation under policy                      | Must document reason and approval.                 |
| Active               | Merged               | Merge approval                                 | Canonical identity selected.                       |
| Merged               | Superseded           | Post-merge lineage update                      | Historical compatibility.                          |
| Active               | Archived             | Retirement or archival policy                  | Read-only.                                         |
| Archived             | Retired              | Formal retirement                              | Rare and controlled.                               |

### Illegal Transitions

- Direct Active → Merged without a merge case.
- Draft → Active without verification.
- Verified → Rejected without a review case.
- Suspended → Active without reactivation approval.
- Rejected → Active without resubmission and re-verification.

### Special Transition Requirements

- Automated validation: Draft → Submitted, Submitted → Pending Screening,
  Pending Verification → Verified for low-risk cases.
- Manual review: Under Review transitions, high-risk duplicate cases, conflict
  cases.
- Dual approval: Sensitive registries, high-risk merges, federation-level
  changes.
- Federation authority: national or cross-jurisdiction changes.
- Registry authority: jurisdiction-scoped approvals and public visibility
  changes.
- System administrator intervention: fraud, legal hold, emergency suspension.

---

## 11. Permanent Identifier Policy

### Principles

- The internal UUID remains the primary system identity.
- The public registry ID is human-readable and permanent.
- The public registry ID must not expose sensitive personal information.
- A public registry ID must never be reused.
- A public registry ID must remain resolvable after merge or retirement.
- Legacy identifiers must be preserved as aliases.
- Identifier issuance must be concurrency-safe.
- Identifier generation must support multiple registry types.
- The format must be configurable.
- Issuance must be auditable.

### Recommended Canonical Format

A safe canonical format is:

- Prefix: registry type code
- Jurisdiction code: optional and stable, not personal-data-based
- Year of registration: reserved for administrative context
- Sequence number: allocated by a concurrency-safe generator
- Optional check digit: for integrity and validation

Example format:

- `REG-TR-2026-0012345`

### Why Personal Data Must Not Be Encoded

- Prevents accidental exposure in QR codes and public URLs.
- Avoids permanent linkage to sensitive personal data.
- Simplifies cross-jurisdiction operation and data minimization.

### Jurisdiction Decision

Jurisdiction should remain part of the identifier only if the public policy
explicitly requires it. A permanent ID should generally remain stable even when
an organization relocates or legal jurisdiction changes; the authority scope
should be tracked separately rather than embedded in the permanent identity.

### Handling Legacy Identities

- Preserve legacy identifiers as aliases and provenance records.
- Do not rewrite them into the canonical public ID.
- Retain import batch and original source reference.

### Handling Merged Identities

- The public registry ID of the canonical record remains active.
- Source records receive aliases and redirect rules.
- Previous public identifiers are not reused.

### Handling Reserved but Unused Identifiers

- Reserved identifiers should be held in a reservation ledger and released only
  under approved policy.
- They must never be silently repurposed.

### QR Resolution Principle

QR codes should resolve through a public URL or opaque token that does not
expose the internal UUID, tenant ID, document numbers, or secrets. Resolution is
policy-based and visibility-controlled.

---

## 12. Registry Authority Model

### Authority Types

- Registry authority
- Registering authority
- Verifying authority
- Supervising authority
- Federation authority
- Delegated authority
- Temporary authority
- External trusted authority

### Authority Scopes

- National
- Provincial
- District or city
- Organization
- Competition
- Registry-specific
- Time-limited

### Business Rules

- Authority assignment must be explicit and auditable.
- Delegation must be scoped and time-bounded.
- Revocation must preserve the audit trail.
- Self-verification is restricted by policy.
- Cross-jurisdiction registration requires approval by the appropriate
  authority.
- High-risk actions require dual approval.
- Emergency override must be time-limited and reviewed.

### Authority Responsibility Matrix

| Role                        | Can Register       | Can Verify | Can Approve Merge | Can Suspend | Can Publish Profile    | Can Manage Authority         |
| --------------------------- | ------------------ | ---------- | ----------------- | ----------- | ---------------------- | ---------------------------- |
| Platform Owner              | Yes, platform-wide | Yes        | Yes               | Yes         | Yes                    | Yes                          |
| Registry Administrator      | Yes                | Yes        | Yes               | Yes         | Yes                    | Yes                          |
| Federation Registry Officer | Yes                | Yes        | Yes               | Yes         | Yes                    | Yes, within federation scope |
| Provincial Registry Officer | Yes                | Yes        | Yes               | Yes         | Yes                    | Limited                      |
| District Registry Officer   | Yes                | Yes        | Limited           | Limited     | Limited                | No                           |
| Organization Administrator  | Limited            | Limited    | No                | No          | Limited                | No                           |
| Verifier                    | No                 | Yes        | No                | No          | No                     | No                           |
| Reviewer                    | No                 | Limited    | No                | No          | No                     | No                           |
| Auditor                     | No                 | No         | No                | No          | No                     | No                           |
| Support Agent               | Limited            | No         | No                | Limited     | No                     | No                           |
| Registered Subject          | Own identity only  | No         | No                | No          | Own profile only       | No                           |
| Public Visitor              | No                 | No         | No                | No          | Limited public profile | No                           |
| Integration Service Account | Limited            | No         | No                | No          | No                     | No                           |

---

## 13. Verification Workflow

### Workflow Stages

1. Identity creation
2. Evidence submission
3. Automated completeness checks
4. Duplicate screening
5. Authority assignment
6. Manual review
7. Additional-information request
8. Approval
9. Rejection
10. Activation
11. Reverification
12. Verification expiration
13. Verification withdrawal
14. Appeal

### Verification Levels

| Level               | Required Evidence                    | Allowed Operations                        | Trust Implications | Public Visibility | Reverification |
| ------------------- | ------------------------------------ | ----------------------------------------- | ------------------ | ----------------- | -------------- |
| Unverified          | Minimal or none                      | Draft and submission only                 | No trust guarantee | Restricted        | Immediate      |
| Self-declared       | User-submitted claims                | Draft, submission, basic profile          | Low trust          | Restricted        | Frequent       |
| Document-verified   | Evidence documents                   | Submission, review, limited activation    | Moderate trust     | Conditional       | Periodic       |
| Authority-verified  | Authority-reviewed evidence          | Full activation and governance operations | High trust         | Expanded          | Periodic       |
| Externally verified | Third-party or federation validation | High-trust operations                     | Very high trust    | Expanded          | Policy-driven  |
| Federation-verified | Federation-authorized evaluation     | Full trust and cross-jurisdiction use     | Highest trust      | Broader           | Policy-driven  |

### Verification Outcomes

- Approved
- Rejected
- More information required
- Escalated
- Duplicate suspected
- Fraud suspected
- Expired
- Withdrawn

### Workflow Rules

- Verification cannot be skipped for high-risk or regulated registries.
- Evidence must be linked to a verified source where possible.
- High-risk or sensitive claims require dual approval.
- Reverification is triggered by evidence expiration, status changes, or
  reclassification.

---

## 14. Identity Evidence Model

### Evidence Categories

- Identity document
- Birth record
- Organization document
- Federation license
- Certification
- Address evidence
- Parent or guardian consent
- Medical evidence
- Competition evidence
- External registry evidence
- Historical evidence
- Manual attestation

### Evidence Governance Rules

- Evidence ownership is tied to the identity case and the submitting party.
- Evidence sensitivity is classified and access-controlled.
- Evidence validity and expiration are tracked.
- Evidence may be revoked, replaced, or withdrawn.
- Evidence is versioned and tamper-detectable by metadata and hash reference.
- The Registry Foundation stores evidence metadata and references; the shared
  Document Service owns file-storage mechanics.

### Evidence Security Controls

- Access limited to authorized roles and cases.
- Redaction applied where appropriate.
- Retention and legal hold policies apply where required.
- Audit events record access and changes.

---

## 15. Duplicate Detection

### Detection Methods

- Exact matching
- Fuzzy matching
- Document-number matching
- Name matching
- Date-of-birth matching
- Organization matching
- External-reference matching
- Historical-alias matching
- Probabilistic matching
- Manual review

### Distinctions

- Duplicate candidate: a potential duplicate surfaced by screening.
- Possible match: a candidate that requires more evidence.
- Probable duplicate: a strong but not yet confirmed match.
- Confirmed duplicate: a match approved by review.
- False positive: a candidate that was incorrectly flagged.
- Related but distinct: entities that share some data but must remain separate.

### Rules

- Never merge automatically based only on similarity.
- High-risk cases require manual review.
- Sensitive registries may require dual approval.
- Match scores must be explainable.
- Inputs and decisions must be audited.
- A rejected duplicate case must not permanently suppress future screening.
- Duplicate rules must be registry-specific and configurable.

### AI-Assisted Boundary

AI-based duplicate detection may recommend candidates, but it must not make
irreversible decisions without human review and policy approval.

---

## 16. Merge and Conflict Resolution

### Merge Process

1. Create a merge case.
2. Select candidate identities.
3. Select a canonical identity.
4. Compare and reconcile attributes.
5. Compare and reconcile evidence.
6. Identify and resolve conflicts.
7. Obtain authority review.
8. Approve or reject.
9. Execute merge.
10. Create aliases and redirect rules.
11. Preserve history and provenance.
12. Notify affected parties and record audit events.

### Merge Invariants

- Public identifiers are never reused.
- Source records remain historically traceable.
- Relationships and historical events are preserved.
- Audit records remain immutable.
- Evidence provenance is preserved.
- Merge is idempotent.
- Merge supports safe recovery.
- Only authorized actors may approve.
- Self-service users may not merge identities.

### Split or Reversal Policy

- Incorrect merges may be reversed only through a controlled reversal workflow.
- Reversal is limited to what can be safely undone while preserving history and
  audit records.
- Some downstream effects may remain permanently recorded as lineage or
  compensating events.

---

## 17. Data Provenance

Every significant registry attribute and lifecycle event must carry provenance
metadata.

### Provenance Fields

- Source system
- Source organization
- Source actor
- Source timestamp
- Source reference
- Import batch
- Verification status
- Confidence level
- Effective date
- Superseded date
- Transformation history
- Migration history

### Provenance Rules

- Manual entry is marked as manual and attributed.
- Imported data must retain source and batch provenance.
- External API data must be traced to the source system and trust level.
- Federation data must preserve authority and jurisdiction context.
- Organization-submitted data must be attributable to the submitting
  organization.
- User-submitted data must be attributable to the user and not treated as fully
  verified by default.
- AI-derived suggestions are advisory and must not silently replace verified
  data.
- Corrected data and merged data retain the previous value as historical
  lineage.

---

## 18. Public Profile and QR Resolution

### Public Profile Policy

- Public profile eligibility is governed by status, verification level, and
  policy.
- Visibility levels define which fields are public, restricted, or hidden.
- Minors and sensitive subjects require stronger policy guardrails.
- Consent requirements are applied where required.
- Federation override may apply where legally permitted.
- Public profiles can be suspended or expired.

### QR Resolution Principles

- QR must resolve through a public URL or opaque token.
- QR must not expose UUIDs, tenant IDs, document numbers, or secrets.
- Resolution must respect current visibility and status.
- The response must indicate authenticity without exposing restricted data.
- Access should be auditable at a privacy-safe level.

### Response Behavior

- Active public profile: resolves to a safe public page.
- Restricted or suspended identity: resolves to a privacy-safe status response.
- Merged identity: redirects to the canonical record.
- Retired identity: returns a retired or historical status response.

---

## 19. Multi-Tenant and Ownership Model

### Ownership Model

- A registry identity is globally unique within the Touchline platform.
- A tenant does not own the permanent registry identity.
- A tenant may own or manage a relationship, registration, assignment, claim, or
  workflow state.
- Jurisdictional authorities may have scoped access.

### Access Rules

- Tenant isolation prevents unauthorized cross-tenant access.
- Cross-tenant lookup exposes only permitted fields.
- Sensitive evidence remains restricted.
- Public registry lookup obeys authorization rules.
- Platform administrators do not receive unrestricted business access without
  governed privilege.

### Access Categories

- Global identity ownership
- Tenant relationship ownership
- Authority access
- Federation access
- Public access
- Platform operations access
- Emergency access
- Support access
- Impersonation restrictions

---

## 20. RBAC and Permission Model

### Conceptual Permissions

- Registry definition view
- Registry definition manage
- Registry identity create
- Registry identity view
- Registry identity update
- Registry identity submit
- Registry identity verify
- Registry identity reject
- Registry identity suspend
- Registry identity reactivate
- Registry identity merge request
- Registry identity merge approve
- Registry identity split request
- Registry identity public-profile manage
- Registry evidence upload
- Registry evidence view
- Registry evidence verify
- Duplicate case review
- Duplicate case resolve
- Registry authority manage
- Registry report view
- Registry audit view
- Registry export
- Registry import

### Permission Scope

- Own identity
- Own organization
- Assigned organization
- Jurisdiction
- Registry type
- Competition
- National
- Platform operations

### Role-Permission Responsibility Matrix

| Role                        | Core Capability                                                 |
| --------------------------- | --------------------------------------------------------------- |
| Platform Owner              | Full governance and platform-wide policy control                |
| Registry Administrator      | Full registry administration within policy bounds               |
| Federation Registry Officer | Federation-level governance and approvals                       |
| Provincial Registry Officer | Regional operational authority                                  |
| District Registry Officer   | Local operational authority                                     |
| Organization Administrator  | Relationship and claim administration within their organization |
| Verifier                    | Evidence review and verification execution                      |
| Reviewer                    | Manual review and escalation support                            |
| Auditor                     | Read-only compliance and history review                         |
| Support Agent               | Limited operational support with strict guardrails              |
| Registered Subject          | Own identity operations and visibility controls                 |
| Public Visitor              | Public profile resolution only                                  |
| Integration Service Account | Technical integration access without business override          |

---

## 21. Domain Services

| Service                               | Purpose                                           | Inputs                                        | Outputs                   | Business Rules                                                  | Dependencies                         | Failure Conditions                     | Domain Events                          |
| ------------------------------------- | ------------------------------------------------- | --------------------------------------------- | ------------------------- | --------------------------------------------------------------- | ------------------------------------ | -------------------------------------- | -------------------------------------- |
| Registry Identifier Generator         | Issues permanent public IDs safely.               | Registry type, jurisdiction, policy           | Public registry ID        | Must be unique, non-reused, concurrency-safe                    | Registry policy, reservation ledger  | Collision, policy violation            | RegistryIdentifierIssued               |
| Registry Eligibility Policy Service   | Evaluates whether a subject may enter a registry. | Identity data, registry type, authority scope | Eligibility result        | Must enforce policy and jurisdiction                            | Authority rules, verification policy | Missing evidence, disallowed scope     | None or policy violation event         |
| Duplicate Screening Service           | Surfaces likely duplicates.                       | Identity data, existing identities            | Candidate list            | Never auto-merge                                                | Matching rules, scoring policy       | Rule failure, insufficient data        | DuplicateCandidateDetected             |
| Identity Matching Service             | Compares identities based on structured signals.  | Candidate identities                          | Match result              | Must be explainable                                             | Matching rules, data quality         | Inconsistent data                      | IdentityMatchCreated                   |
| Verification Policy Service           | Determines required evidence and trust level.     | Identity data, registry type                  | Verification requirements | Must align with registry policy                                 | Registry definition, evidence policy | Missing policy or conflicting evidence | VerificationCaseOpened                 |
| Registry Authority Resolution Service | Determines authorized actors for a case.          | Identity context, registry type, jurisdiction | Effective authority list  | Must respect scope and delegation                               | Authority assignments, jurisdiction  | No authority available                 | RegistryAuthorityAssigned              |
| Merge Resolution Service              | Resolves canonical identity and source lineage.   | Merge case data                               | Approved merge plan       | Must preserve lineage and provenance                            | Merge case, audit log                | Conflict unresolved                    | RegistryIdentityMerged                 |
| Public Visibility Policy Service      | Evaluates public profile eligibility.             | Identity state, verification status           | Visibility decision       | Must not expose restricted data                                 | Visibility policy, status            | Policy conflict                        | PublicRegistryProfilePublished         |
| QR Resolution Policy Service          | Resolves QR payloads safely.                      | QR token or reference                         | Safe destination          | Must not expose internal IDs                                    | Public profile rules, status         | Revoked or hidden profile              | RegistryQRResolved                     |
| Data Provenance Service               | Captures and validates provenance metadata.       | Attribute or event                            | Provenance record         | AI-suggested data cannot replace verified source without policy | Source metadata, audit               | Missing source context                 | RegistryDataCorrected                  |
| Registry Status Transition Service    | Validates lifecycle transitions.                  | Current state and requested transition        | Transition result         | Must follow approved lifecycle                                  | State policy                         | Illegal transition                     | RegistryIdentityActivated or Suspended |
| Registry Search Policy Service        | Enforces search visibility and result scope.      | Search request                                | Filtered result set       | Must prevent enumeration and respect authorization              | Search config, role policy           | Overbroad result set                   | SearchAuditLogged                      |
| External Reference Resolution Service | Resolves and validates external references.       | External reference metadata                   | Resolved reference result | Must be attributable and trusted                                | Integration gateway, trusted sources | Unresolved or untrusted reference      | ExternalRegistryReferenceLinked        |

---

## 22. Domain Events

| Event                                | Trigger                       | Producer                          | Consumers                                | Required Payload                    | Sensitive Fields        | Idempotency | Audit    |
| ------------------------------------ | ----------------------------- | --------------------------------- | ---------------------------------------- | ----------------------------------- | ----------------------- | ----------- | -------- |
| RegistryDefinitionCreated            | Definition created            | Registry Definition Aggregate     | Policy consumers                         | Definition ID, type, policy summary | None                    | Yes         | Required |
| RegistryDefinitionUpdated            | Policy changed                | Registry Definition Aggregate     | Consumers and workflows                  | Definition ID, changes              | None                    | Yes         | Required |
| RegistryAuthorityAssigned            | Authority assignment created  | Authority Assignment Aggregate    | Workflows, audit                         | Authority ID, scope, jurisdiction   | None                    | Yes         | Required |
| RegistryAuthorityRevoked             | Assignment revoked            | Authority Assignment Aggregate    | Workflows                                | Assignment ID, reason               | None                    | Yes         | Required |
| RegistryIdentityCreated              | Identity created              | Registry Identity Aggregate       | Verification, search                     | Identity ID, type, creator          | PII if relevant         | Yes         | Required |
| RegistryIdentifierIssued             | Public ID issued              | Registry Identity Aggregate       | Search, public profile                   | Identity ID, public ID              | None                    | Yes         | Required |
| RegistryIdentitySubmitted            | Identity submitted            | Registry Identity Aggregate       | Screening and review                     | Identity ID, submission context     | Overview only           | Yes         | Required |
| RegistryScreeningStarted             | Screening begins              | Duplicate Screening Service       | Review workflows                         | Identity ID, screening rules        | None                    | Yes         | Required |
| DuplicateCandidateDetected           | Candidate surfaced            | Duplicate Screening Service       | Duplicate case workflow                  | Identity ID, candidates             | None                    | Yes         | Required |
| DuplicateCaseOpened                  | Duplicate case created        | Duplicate Case Aggregate          | Reviewers                                | Case ID, candidate IDs              | Sensitive match data    | Yes         | Required |
| DuplicateCaseResolved                | Duplicate decision recorded   | Duplicate Case Aggregate          | Registry and audit                       | Case ID, decision                   | Sensitive evidence      | Yes         | Required |
| VerificationCaseOpened               | Verification workflow created | Verification Case Aggregate       | Reviewers                                | Case ID, identity ID                | Evidence metadata       | Yes         | Required |
| VerificationEvidenceAdded            | Evidence attached             | Verification Case Aggregate       | Reviewers                                | Case ID, evidence ID                | File metadata only      | Yes         | Required |
| VerificationMoreInformationRequested | Additional evidence requested | Verification Case Aggregate       | Submitter, reviewer                      | Case ID, reasons                    | None                    | Yes         | Required |
| RegistryIdentityVerified             | Verification approved         | Verification Case Aggregate       | Registry lifecycle                       | Identity ID, level                  | None beyond trust level | Yes         | Required |
| RegistryIdentityRejected             | Verification rejected         | Verification Case Aggregate       | Registry lifecycle                       | Identity ID, reason                 | Reason summary          | Yes         | Required |
| RegistryIdentityActivated            | Identity activated            | Registry Identity Aggregate       | Search, visibility, downstream consumers | Identity ID, status                 | None                    | Yes         | Required |
| RegistryIdentityRestricted           | Identity restricted           | Registry Identity Aggregate       | Search and workflows                     | Identity ID, reason                 | None                    | Yes         | Required |
| RegistryIdentitySuspended            | Identity suspended            | Registry Identity Aggregate       | Search and workflows                     | Identity ID, reason                 | Reason summary          | Yes         | Required |
| RegistryIdentityReactivated          | Identity reactivated          | Registry Identity Aggregate       | Search and workflows                     | Identity ID                         | None                    | Yes         | Required |
| RegistryIdentityMerged               | Merge executed                | Merge Case Aggregate              | Canonical record consumers               | Canonical ID, source IDs            | None                    | Yes         | Required |
| RegistryMergeReversed                | Merge reversed                | Merge Case Aggregate              | Audit and downstream systems             | Merge case ID                       | None                    | Yes         | Required |
| RegistryIdentityArchived             | Identity archived             | Registry Identity Aggregate       | Search and reporting                     | Identity ID                         | None                    | Yes         | Required |
| PublicRegistryProfilePublished       | Public profile published      | Public Registry Profile Aggregate | Public experience                        | Identity ID, visibility             | None                    | Yes         | Required |
| PublicRegistryProfileHidden          | Public profile hidden         | Public Registry Profile Aggregate | Public experience                        | Identity ID                         | None                    | Yes         | Required |
| RegistryQRResolved                   | QR resolved                   | Public Registry Profile Aggregate | Public resolution analytics              | Identity ID, resolver metadata      | None                    | Yes         | Required |
| RegistryEvidenceExpired              | Evidence expired              | Verification Policy Service       | Reviewers                                | Evidence ID                         | None                    | Yes         | Required |
| ExternalRegistryReferenceLinked      | Reference linked              | External Reference Service        | Downstream registries                    | Identity ID, source                 | Reference ID only       | Yes         | Required |
| RegistryDataCorrected                | Attribute corrected           | Registry Identity Aggregate       | Analytics and provenance                 | Identity ID, field                  | Sensitive field summary | Yes         | Required |
| RegistryRecordImported               | Import completed              | Import workflow                   | Review and search                        | Batch ID, import count              | Source context          | Yes         | Required |

---

## 23. Commands and Use Cases

| Command                       | Actor                         | Preconditions                           | Input                        | Validation                           | Authorization                           | Main Flow                           | Failure Conditions    | State Changes                | Domain Events                        | Audit    |
| ----------------------------- | ----------------------------- | --------------------------------------- | ---------------------------- | ------------------------------------ | --------------------------------------- | ----------------------------------- | --------------------- | ---------------------------- | ------------------------------------ | -------- |
| CreateRegistryDefinition      | Registry administrator        | Policy is valid                         | Definition payload           | Policy validation                    | Registry definition manage              | Create definition and default rules | Invalid policy        | Draft definition             | RegistryDefinitionCreated            | Required |
| UpdateRegistryDefinition      | Registry administrator        | Existing definition                     | Updated policy               | Policy compatibility                 | Registry definition manage              | Update policy rules                 | Incompatible policy   | Updated definition           | RegistryDefinitionUpdated            | Required |
| AssignRegistryAuthority       | Registry administrator        | Authority exists                        | Authority assignment payload | Scope/jurisdiction validation        | Registry authority manage               | Assign authority                    | Invalid scope         | Assignment active            | RegistryAuthorityAssigned            | Required |
| CreateRegistryIdentity        | Registrar or authorized user  | Policy allows creation                  | Identity payload             | Completeness and policy checks       | Registry identity create                | Create identity and initial state   | Missing required data | Draft or submitted           | RegistryIdentityCreated              | Required |
| SubmitRegistryIdentity        | Submitter or registrar        | Identity exists and passes basic checks | Submission payload           | Minimum completeness                 | Registry identity submit                | Submit for screening                | Incomplete data       | Submitted                    | RegistryIdentitySubmitted            | Required |
| AddIdentityEvidence           | Submitter or verifier         | Identity exists                         | Evidence payload             | Policy and sensitivity checks        | Registry evidence upload                | Attach evidence                     | Invalid evidence      | Evidence linked              | VerificationEvidenceAdded            | Required |
| StartVerification             | Verifier                      | Identity is submitted                   | Verification case payload    | Policy compliance                    | Registry identity verify                | Start verification case             | No authority          | Pending verification         | VerificationCaseOpened               | Required |
| RequestAdditionalEvidence     | Reviewer or verifier          | Verification case open                  | Request payload              | Reason and policy                    | Registry identity verify                | Ask for more evidence               | Inadequate reason     | Under review                 | VerificationMoreInformationRequested | Required |
| ApproveVerification           | Verifier or reviewer          | Evidence accepted                       | Decision payload             | Policy and dual-approval if required | Registry identity verify                | Approve verification                | Missing evidence      | Verified                     | RegistryIdentityVerified             | Required |
| RejectVerification            | Verifier or reviewer          | Evidence insufficient                   | Rejection payload            | Reason required                      | Registry identity reject                | Reject identity                     | No reason             | Rejected                     | RegistryIdentityRejected             | Required |
| ScreenForDuplicates           | System or reviewer            | Identity submitted                      | Identity data                | Rule compatibility                   | Registry identity view                  | Evaluate duplicates                 | Rule failure          | Candidate list               | DuplicateCandidateDetected           | Required |
| OpenDuplicateCase             | Reviewer                      | Candidate exists                        | Case payload                 | Review eligibility                   | Duplicate case review                   | Open case                           | No review authority   | Duplicate case open          | DuplicateCaseOpened                  | Required |
| ResolveDuplicateCase          | Reviewer/admin                | Duplicate case open                     | Decision payload             | Reasoned decision                    | Duplicate case resolve                  | Resolve duplicate case              | Invalid decision      | Resolved/dismissed           | DuplicateCaseResolved                | Required |
| RequestMerge                  | Authorized actor              | Canonical identity chosen               | Merge request payload        | Policy and consent rules             | Registry identity merge request         | Request merge                       | No canonical record   | Merge case open              | None or MergeCaseCreated             | Required |
| ApproveMerge                  | Authority                     | Merge request exists                    | Approval payload             | Policy compliance                    | Registry identity merge approve         | Approve merge                       | Unauthorized          | Merge case approved          | RegistryIdentityMerged               | Required |
| ExecuteMerge                  | System or authorized actor    | Merge approved                          | Merge execution payload      | Idempotency controls                 | Registry identity merge approve         | Execute merge                       | Reversal requirement  | Canonical lineage updated    | RegistryIdentityMerged               | Required |
| RequestMergeReversal          | Authority                     | Merge exists                            | Reversal payload             | Safe recovery checks                 | Registry identity merge approve         | Initiate reversal                   | Cannot be reversed    | Reversal case                | RegistryMergeReversed                | Required |
| SuspendRegistryIdentity       | Authority                     | Identity exists                         | Suspension payload           | Reasoned action                      | Registry identity suspend               | Suspend                             | No reason             | Suspended                    | RegistryIdentitySuspended            | Required |
| ReactivateRegistryIdentity    | Authority                     | Identity suspended or restricted        | Reactivation payload         | Policy compliance                    | Registry identity reactivate            | Reactivate                          | Invalid state         | Active/restricted            | RegistryIdentityReactivated          | Required |
| PublishPublicProfile          | Authority                     | Identity active or verified             | Visibility payload           | Field policy compliance              | Registry identity public-profile manage | Publish profile                     | Restricted identity   | Published                    | PublicRegistryProfilePublished       | Required |
| HidePublicProfile             | Authority                     | Profile published                       | Visibility payload           | Policy compliance                    | Registry identity public-profile manage | Hide profile                        | None                  | Hidden                       | PublicRegistryProfileHidden          | Required |
| LinkExternalRegistryReference | Integrator/authority          | Identity exists                         | Reference payload            | Trusted source and reference format  | Registry identity update                | Link external reference             | Untrusted source      | Linked reference             | ExternalRegistryReferenceLinked      | Required |
| ImportRegistryRecords         | Importer                      | Valid batch definition                  | Import batch                 | Validation, dry run, provenance      | Registry import                         | Import and reconcile records        | Validation failures   | Imported or rejected records | RegistryRecordImported               | Required |
| CorrectRegistryData           | Authority or authorized actor | Identity exists                         | Correction payload           | Provenance and policy                | Registry identity update                | Correct attribute safely            | Unverified overwrite  | Corrected data               | RegistryDataCorrected                | Required |

---

## 24. Business Rules and Invariants

### Mandatory Invariants

1. Every registry identity has exactly one internal UUID.
2. Every issued public registry ID is unique and permanent.
3. Public registry IDs are never reused.
4. Registry identities are not owned by tenant organizations.
5. Organization relationships do not overwrite identity history.
6. Verified attributes cannot be silently overwritten by lower-trust sources.
7. Sensitive evidence requires explicit authorization.
8. Registry status transitions must follow the approved lifecycle.
9. Suspended identities remain historically resolvable.
10. Merged identifiers resolve to the canonical identity.
11. Audit history cannot be altered by normal domain operations.
12. Merge operations preserve provenance.
13. Duplicate detection never performs an irreversible automatic merge.
14. Public profiles expose only approved fields.
15. QR resolution does not expose internal keys.
16. Imported records retain source and batch provenance.
17. Authority actions remain within jurisdiction and scope.
18. A verifier cannot approve where conflict-of-interest rules apply.
19. Rejected identities may be resubmitted only under defined policy.
20. Identity deletion is prohibited unless required by exceptional legal policy.
21. Registry-specific domains may extend the foundation but may not weaken its
    invariants.
22. AI output is advisory unless an approved policy explicitly permits automated
    action.

### Additional Enterprise Invariants

- A registry identity cannot be simultaneously active and suspended.
- A canonical identity cannot be superseded without a merge or replacement case.
- Public profile changes must preserve the previous visibility state in history.
- External references must remain attributable even after merge or retirement.
- Evidence withdrawal must preserve the original evidence chain and reason.

---

## 25. Search and Discovery Policy

### Search Types

- Internal registry search
- Authority search
- Organization-scoped search
- Federation search
- Public search
- Exact identifier lookup
- QR lookup
- Fuzzy identity lookup

### Policy Rules

- Search must respect authorization and visibility.
- Sensitive fields may be searchable but not displayed to unauthorized actors.
- Result ranking should prioritize verified and active identities.
- Result limits must prevent enumeration abuse.
- Search activity should be auditable.
- Rate limiting and abuse prevention apply to public search and QR lookups.
- Cross-tenant visibility is filtered by authorization and policy.

### Masking Rules

- Search results may include masked values such as partially redacted names or
  date of birth year only.
- Full sensitive fields are not returned to unauthorized actors.

---

## 26. Import and Migration

### Import Capabilities

- Import batch
- Source system
- Mapping profile
- Validation
- Dry run
- Duplicate screening
- Error handling
- Partial acceptance
- Reconciliation
- Rollback strategy
- Provenance
- Legacy identifier aliases
- Import reports
- Authority approval

### Import Rules

- Imported data must not bypass verification or duplicate controls.
- Every imported record must retain source and batch provenance.
- Legacy identifiers are preserved as aliases.
- Failed imports must be reviewable and recoverable.
- Partial acceptance must be explicit and auditable.
- Dry-run is required before large-scale migrations.

---

## 27. Security and Privacy

### Threats and Protections

- Identity fraud: require evidence, authority verification, and risk scoring.
- Enumeration: apply rate limits, authorization, and safe search behavior.
- Unauthorized lookup: enforce role and tenant boundaries.
- Tenant boundary violations: use scoped authorization and explicit cross-tenant
  guards.
- Evidence exposure: restrict evidence access and use redaction.
- QR abuse: enforce visibility checks and rate limiting.
- Account takeover effects: require strong identity and audit controls.
- Malicious merge attempts: require dual approval for high-risk merges.
- Insider misuse: use separation of duties and auditable review.
- Privilege escalation: enforce least privilege and approval workflow.
- Mass export: apply export controls and monitoring.
- Scraping: limit search and public access.
- Document tampering: require versioning, metadata, and tamper-evidence.
- External integration compromise: require trusted sources and allow-listing.
- AI-assisted false matching: keep AI advisory and human-reviewed.
- Support-account abuse: require scoped support access and explicit audit.

### Controls

- Least privilege
- Separation of duties
- Dual control
- Sensitive-field encryption
- Redaction
- Masking
- Audit
- Alerting
- Retention
- Legal hold
- Consent
- Minor protection
- Data subject request workflows
- Breach response considerations

### Compliance Areas Requiring Jurisdiction-Specific Review

- Data protection law
- Identity verification law
- Child-data protection law
- Cross-border evidence handling
- Public registry publication rules
- Federation-specific mandates

---

## 28. Non-Functional Requirements

| Requirement                    | Target                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| Availability                   | 99.9% for core registry services                                    |
| Scalability                    | Support large-scale registry growth and import bursts               |
| Performance                    | Public lookups and QR resolution within acceptable latency targets  |
| Consistency                    | Strong consistency for canonical identity state and merge execution |
| Durability                     | Immutable audit and provenance records                              |
| Auditability                   | Full event trace for all material changes                           |
| Security                       | Authorization, tamper detection, and restricted evidence access     |
| Privacy                        | Data minimization, masking, and policy-based visibility             |
| Accessibility                  | Public and admin interfaces must remain accessible                  |
| Localization                   | Locale-aware interfaces for public and authority workflows          |
| Observability                  | Metrics, traces, and audit queryability                             |
| Maintainability                | Clear boundaries, decoupled policies, and stable contracts          |
| Disaster recovery              | Restore of registry state and provenance history                    |
| Import throughput              | Support bulk import without bypassing verification                  |
| Search performance             | Fast internal and public discovery                                  |
| QR resolution latency          | Low-latency public resolution                                       |
| Duplicate-screening throughput | Handle high-volume candidate generation                             |
| Verification processing        | Manage review queues and escalations                                |
| Data retention                 | Retain historical and legal records per policy                      |

### Consistency Classification

- Strong consistency: canonical identity state, merge execution, public
  identifier issuance, authority assignment mutation.
- Transactional consistency: verification case lifecycle and evidence
  attachment.
- Eventual consistency: public profile propagation and search indexing.

---

## 29. Reporting and Metrics

### Operational and Governance Metrics

- Registry identities created
- Active identities
- Pending verification
- Verification turnaround time
- Verification rejection rate
- Duplicate-candidate rate
- Confirmed duplicate rate
- False-positive rate
- Merge rate
- Suspension rate
- Reactivation rate
- Evidence expiration rate
- Authority workload
- Import success rate
- Public-profile usage
- QR resolution volume
- Registry growth
- Data-quality score
- Provenance completeness
- Unresolved conflict count

### Access Restrictions

Sensitive metrics should be limited to registry administrators, auditors, and
approved oversight roles. Public metrics should be aggregated and privacy-safe.

---

## 30. Risks and Mitigations

| Risk                        | Likelihood | Impact | Mitigation                                       | Residual Risk | Owner                 |
| --------------------------- | ---------- | ------ | ------------------------------------------------ | ------------- | --------------------- |
| Fragmented identity data    | High       | High   | Foundation-driven canonical identity model       | Medium        | Registry Architecture |
| Identity fraud              | Medium     | High   | Evidence verification, authority workflow, audit | Medium        | Governance            |
| Duplicate overmatching      | Medium     | High   | Explainable scoring and manual review            | Medium        | Registry Operations   |
| Merge error                 | Medium     | High   | Dual approval and reversal workflow              | Medium        | Governance            |
| Privacy leakage             | Medium     | High   | Public visibility policy and masking             | Medium        | Security/Privacy      |
| Import quality issues       | High       | Medium | Validation, dry runs, provenance                 | Medium        | Data Governance       |
| Authority abuse             | Medium     | High   | Delegation controls and audit                    | Medium        | Governance            |
| Cross-jurisdiction conflict | Medium     | Medium | Jurisdiction rules and federation approval       | Medium        | Federation Services   |
| AI false positive           | Medium     | Medium | Advisory-only AI and human review                | Medium        | Platform Governance   |
| Scalability bottlenecks     | Medium     | Medium | Partitioned workflows and indexed search         | Medium        | Platform Engineering  |

---

## 31. Extension Model for Individual Registries

Future registries must extend the foundation rather than replace it.

### Mandatory Foundation Concepts

- Permanent identity
- Public registry ID
- Evidence and verification policy
- Authority scope
- Registry status lifecycle
- Provenance
- Duplicate screening
- Merge and split controls
- Public profile and QR policy

### Extensible Concepts

- Registry-specific attributes
- Registry-specific verification rules
- Registry-specific evidence categories
- Registry-specific public profile fields
- Registry-specific lifecycle extensions
- Registry-specific duplicate-screening policies

### Prohibited Overrides

- Child registries may not weaken permanent identifier policy.
- Child registries may not bypass provenance requirements.
- Child registries may not bypass verification or merge invariants.
- Child registries may not store all registry types in a single unstructured
  entity-attribute-value structure.

### Examples

- Player Registry adds birth, guardianship, eligibility, and player-specific
  evidence.
- Coach Registry adds licenses, qualifications, and coaching status.
- Referee Registry adds officiating grade, fitness checks, and eligibility.
- Organization Registry adds legal identity, hierarchy, accreditation, and
  governance relationships.
- Competition Registry adds sanctioning, organizer, level, category, and season
  context.

---

## 32. Recommended Domain Module Structure

A conceptual modular-monolith structure for the foundation:

```text
domains/
  global-registry/
    domain/
    application/
    infrastructure/
    presentation/
    contracts/
    policies/
    events/
    tests/
```

### Layer Responsibilities

- Domain: entities, value objects, aggregates, domain services, invariants,
  policies.
- Application: commands, use cases, orchestration, validators, DTOs.
- Infrastructure: repositories, external adapters, import connectors, document
  references, search adapters.
- Presentation: workflow orchestration, forms, stateful controllers,
  public-resolver interfaces.
- Contracts: public contracts for downstream registry domains and public
  experience.
- Policies: lifecycle, visibility, verification, merge, and authority policies.
- Events: domain event definitions and event contracts.
- Tests: unit, integration, and policy tests.

### Allowed Dependencies

- Domain may depend on shared platform concepts only through defined contracts.
- Application may depend on domain and shared contracts.
- Infrastructure may depend on application and domain contracts.
- Presentation may depend on application contracts and shared UI contracts only.

### Prohibited Dependencies

- Presentation must not depend directly on infrastructure.
- Domain must not depend on UI or transport implementations.
- Child registries must not bypass foundation contracts.

---

## 33. Acceptance Criteria

The blueprint is accepted when:

- Registry identity is clearly separated from user accounts.
- Registry identity is clearly separated from organization membership.
- Global identity ownership is defined.
- Tenant access rules are defined.
- Registry authority is modeled.
- Permanent identifier policy is complete.
- Verification lifecycle is complete.
- Evidence model is complete.
- Duplicate detection is complete.
- Merge and reversal rules are complete.
- Status lifecycle and transition matrix are complete.
- Data provenance is complete.
- Public-profile and QR policies are complete.
- Commands, events, aggregates, entities, and value objects are identified.
- Security, privacy, and audit requirements are explicit.
- Individual registry extension rules are defined.
- No implementation code is generated.
- No database tables are generated.
- No UI screens are generated.
- No API endpoints are generated.

---

## 34. Conceptual Domain Model (DDD)

### 34.1 Domain Purpose

The Global Registry Foundation exists to preserve the integrity of identity as a
first-class enterprise domain. Its role is not to manage sports operations, but to
own the canonical rules for identity creation, resolution, verification,
authority, lineage, visibility, and historical continuity across all registry
families.

### 34.2 Bounded Context Definition

- Bounded Context Name: Global Registry Foundation
- Primary Responsibility: govern the canonical lifecycle of registry identities
  and their trusted relationships to authorities, evidence, visibility, and
  history.
- Primary Intent: ensure that every identity within Touchline can be resolved,
  verified, audited, and governed without ambiguity.
- Architectural Principle: the foundation must remain policy-centric and
  technology-agnostic while remaining reusable by child registries.

### 34.3 Shared Kernel Dependencies

The foundation depends on shared services and concepts from adjacent domains, but
it should not share implementation internals with them. The relationship is one
of contract-based dependency rather than a shared implementation kernel.

| Shared Concern | Dependency Role | Required Contract |
| --- | --- | --- |
| Identity and Access | Dependency | Subject identity, actor identity, authentication context |
| Tenancy and Organization | Dependency | Jurisdiction, organization context, ownership boundaries |
| RBAC and Authorization | Dependency | Permission evaluation, authority scope, role context |
| Workflow | Dependency | Review orchestration, approvals, escalation |
| Document Service | Dependency | Evidence references, file lifecycle, retention |
| Audit | Dependency | Immutable event recording and traceability |
| Search | Dependency | Discoverability, indexing, filtered lookup |
| Integration Gateway | Dependency | Trusted external references and federation inputs |

### 34.4 Aggregate Boundaries and Consistency Boundaries

| Aggregate | Root | Consistency Boundary | Key Invariants |
| --- | --- | --- | --- |
| RegistryDefinition | RegistryDefinition | Registry policy configuration | One canonical policy per registry type |
| RegistryIdentity | RegistryIdentity | Canonical identity lifecycle | One internal identity, one active canonical state |
| VerificationCase | VerificationCase | Evidence and review lifecycle | Evidence must remain attributable and non-opaque |
| DuplicateCase | DuplicateCase | Candidate evaluation and resolution | No irreversible merge from screening alone |
| MergeCase | MergeCase | Canonical lineage and alias preservation | Canonical record survives, source history remains |
| AuthorityAssignment | RegistryAuthorityAssignment | Governance scope and delegation | Authority remains within explicit scope |
| PublicProfile | PublicRegistryProfile | Public visibility and resolution | Public exposure respects policy and status |

### 34.5 Repository Interfaces

Repository interfaces define the persistence contract for the domain without
committing to a storage mechanism.

- IRegistryDefinitionRepository
  - load, save, version, listByType
- IRegistryIdentityRepository
  - loadById, loadByPublicId, save, markSuspended, markMerged, appendHistory
- IVerificationCaseRepository
  - loadForIdentity, save, attachEvidence, closeCase
- IDuplicateCaseRepository
  - findCandidates, saveCase, resolveCase
- IMergeCaseRepository
  - loadByIdentity, save, executeMerge, reverseMerge
- IAuthorityAssignmentRepository
  - loadEffectiveAssignments, saveAssignment, revokeAssignment
- IPublicProfileRepository
  - loadProfile, saveVisibility, saveResolutionState
- IProvenanceRepository
  - appendProvenance, loadHistory, resolveLineage

### 34.6 Factories

Factories encapsulate the creation of complex aggregates and enforce invariants
at construction time.

- RegistryDefinitionFactory
  - creates a definition with policy defaults and lifecycle rules
- RegistryIdentityFactory
  - creates a new identity with an internal identifier and initial state
- VerificationCaseFactory
  - creates a case linked to an identity and a prescribed policy
- DuplicateCaseFactory
  - creates a review case from candidate findings
- MergeCaseFactory
  - creates a merge workflow with canonical and source identities
- PublicProfileFactory
  - creates a visibility-safe profile representation

### 34.7 Specifications

Specifications express reusable domain predicates for selection and validation.

- ActiveIdentitySpecification
  - true when the identity is in a non-retired, operational state
- VerifiedIdentitySpecification
  - true when the identity has reached the required trust level
- EligibleForPublicationSpecification
  - true when the identity is not restricted and visibility policy permits
- HighRiskMergeSpecification
  - true when the merge affects sensitive or contested identities
- DuplicateCandidateSpecification
  - true when similarity evidence reaches the threshold for review
- AuthorityScopedActionSpecification
  - true when an actor is permitted within the relevant jurisdiction and scope
- EvidenceSufficientSpecification
  - true when required evidence exists and remains valid

### 34.8 Domain Policies

The foundation is governed by explicit, reusable policies rather than ad hoc
rules.

- Identifier Policy
  - issues permanent public identifiers, preserves uniqueness, and prevents reuse
- Verification Policy
  - defines the evidence threshold, required trust level, and re-verification conditions
- Lifecycle Policy
  - regulates status transitions, legal restrictions, and recovery paths
- Visibility Policy
  - determines which identity data may be exposed to which audience
- Merge Policy
  - defines when merge is allowed, how canonical records are selected, and how reversal is handled
- Authority Policy
  - defines who may register, verify, approve, suspend, or publish a profile
- Provenance Policy
  - requires every significant change to retain source, actor, intent, and lineage information

### 34.9 Registry Type Model

Registry Type is a first-class conceptual model that determines how a registry
behaves without coupling the foundation to specific business domains.

| Aspect | Meaning |
| --- | --- |
| Code | Stable registry family code |
| Family | Category such as person, organization, competition, or facility |
| Risk Profile | Low, medium, high, or restricted |
| Required Verification Level | Minimum trust level needed for activation |
| Visibility Default | Default public visibility policy |
| Authority Profile | Default authority roles and delegation rules |
| Lifecycle Profile | Default lifecycle configuration and transition rules |
| Extension Model | Allowed registry-specific attributes and extensions |

### 34.10 Registry Snapshot Model

A Registry Snapshot is an immutable, point-in-time projection of an identity and
its governance state. It provides a stable representation for audit,
comparison, and dispute resolution.

A snapshot contains:
- identity identity and status
- effective attribute values
- verification state and evidence summary
- authority context
- visibility state
- key provenance references
- effective lifecycle state

Snapshots are not a replacement for the canonical identity; they are evidence of
its state at a particular time.

### 34.11 Identity Resolution Model

Identity resolution is the process by which the domain determines whether two or
more claims, records, or evidence sets represent the same underlying subject.

Resolution follows a disciplined sequence:
1. Candidate generation from identifiers, attributes, and evidence
2. Match evaluation using allowed matching rules
3. Conflict analysis for contradictory information
4. Authority review for high-risk or ambiguous cases
5. Canonical selection or retention of the existing identity
6. Merge, aliasing, or separation outcome
7. Publication of the resolved state and lineage

The model preserves the distinction between:
- a claimed identity
- a verified identity
- a canonical identity
- a public profile

### 34.12 Visibility Model

Visibility is an explicit domain concept and not merely a UI concern.

| Visibility State | Meaning |
| --- | --- |
| Private | Only authorized actors can view the identity attributes |
| Restricted | Limited visibility to selected audiences or roles |
| Public | Approved attributes may be exposed publicly |
| Hidden | Public exposure is disabled while the identity remains known internally |
| Suspended | Visibility is reduced due to governance or compliance concerns |

A visibility decision must consider:
- registry type
- verification level
- current lifecycle state
- jurisdictional policy
- consent requirements
- public safety or legal constraints

### 34.13 Verification Model

Verification is a trust-building process that converts raw claims into a
governed, auditable trust position.

The domain model treats verification as a combination of:
- evidence submission
- evidence validation
- authority review
- trust-level assignment
- re-verification scheduling
- claim revision or withdrawal

Verification outcomes are progressive and may be revoked if evidence becomes
invalid, stale, contradictory, or superseded.

### 34.14 Duplicate Resolution Model

Duplicate resolution is a domain workflow that separates candidate matching from
final identity resolution.

The model includes:
- duplicate candidate generation
- match scoring and rationale
- case creation for review
- resolution decision outcomes such as confirm duplicate, reject duplicate, or
  require more evidence
- preservation of the original evidence trail

The domain never permits an irreversible merge to be executed solely on the
basis of machine-generated similarity.

### 34.15 Merge Strategy

Merge strategy defines how identity continuity is preserved when two identities
are determined to represent the same subject.

Core strategy principles:
- choose one canonical identity
- preserve lineage of the source identity
- retain aliases and historical references
- prevent identifier reuse
- preserve provenance and evidence chain
- allow reversal through a governed workflow
- treat merge as a controlled business event, not a data overwrite

The merge strategy is intentionally conservative and auditable.

### 34.16 Provenance Model

Provenance is a first-class domain concept that records why and how a value or
state came to exist.

Every significant event or attribute change must carry:
- source system or source actor
- source organization or authority
- timestamp and validity interval
- trust classification
- transformation context
- prior value references where applicable
- import or federation lineage where applicable

The provenance model ensures that the domain can answer:
- where the data came from
- who introduced it
- how trustworthy it is
- whether it has been corrected or superseded

### 34.17 Ownership Rules

Ownership is intentionally separated from mere access.

- The Global Registry Foundation owns the canonical identity model and its
  governing policies.
- Child registries own registry-specific extensions, not the core identity
  lifecycle.
- Tenants and organizations may own relationships, memberships, claims, or
  operational contexts, but not the permanent registry identity itself.
- Authorities own approval actions, not the underlying identity record.

### 34.18 Lifecycle State Machine

The conceptual lifecycle is a governed state machine, not a simple status flag.

Main states:
- Draft
- Submitted
- Pending Screening
- Pending Verification
- Under Review
- Verified
- Active
- Restricted
- Suspended
- Rejected
- Merged
- Superseded
- Archived
- Retired

Representative transitions:
- Draft → Submitted when minimum completeness and policy checks are met
- Submitted → Pending Screening when screening begins
- Pending Screening → Pending Verification when no blocking conflict remains
- Pending Verification → Under Review when a case requires human judgment
- Pending Verification → Verified when evidence is accepted
- Verified → Active when activation is authorized
- Active → Restricted or Suspended when governance or compliance concerns arise
- Active → Merged when a merge case is approved and executed
- Merged → Superseded when the canonical lineage changes
- Active → Archived or Retired when the identity is formally retired

All transitions are guarded by policy, authority, and provenance requirements.

---

## Summary

The Global Registry Foundation is the reusable identity backbone for Touchline.
It establishes the platform’s permanent identity model, governance model,
verification model, duplicate-handling model, public-resolution model, and
provenance model. It is intentionally generic so future registries can reuse it
without weakening its core invariants.

## Decisions Confirmed

- The foundation owns reusable registry identity, verification, authority,
  merge, provenance, and public-profile policy.
- Child registries reuse the foundation and contribute only registry-specific
  extensions.
- Internal UUID remains the system primary identity; public registry ID is
  permanent and human-readable.
- Verification and merge are governed by explicit authority and audit controls.

## Decisions Requiring Approval

- Whether public registry IDs should embed a jurisdiction segment or remain
  jurisdiction-agnostic.
- Whether federation-level verification should be mandatory for certain
  high-trust registry types.
- Whether QR resolution should be globally public or visibility-gated per
  registry type.
- Whether external trusted authorities will be integrated directly or via the
  Integration Gateway.

## Open Questions

- Which registry types should be governed by dual-approval from the start?
- Which evidence categories are mandatory for each future registry family?
- Which public fields should be globally available by default versus restricted
  by policy?
- How should imported legacy identities be assigned initial verification levels?

## Dependencies

- IAM for actor identity and access control
- Organization Engine for tenant and jurisdiction context
- Workflow for review and approval processes
- Document Service for evidence storage mechanics
- Audit for immutable event logging
- Search for discovery and indexing
- Notification for workflow alerts
- Integration Gateway for external authority connections

## Readiness Assessment for Phase 2: Domain Data Model

The foundation is ready for Phase 2 domain modeling because the core concepts,
lifecycle, authority model, verification workflow, evidence framework, duplicate
and merge rules, public visibility model, and extension strategy are now defined
at the domain level. The next phase should formalize the data model, value
object schemas, and event payload contracts without weakening the foundation’s
invariants.
