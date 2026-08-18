# TOUCHLINE ENTERPRISE ARCHITECTURE
## TAG-02 — Global Registry Foundation
### Artefact 03 — Logical Data Model

> This document translates the approved conceptual domain model into a
> technology-independent logical data model for the Global Registry Foundation.
> It defines the logical entities, relationships, ownership, lifecycle, and
> constraints without introducing database schema, SQL, or implementation code.

---

## 1. Modeling Intent

The logical data model expresses the canonical structure of the Global Registry
Foundation as a reusable enterprise information model. It is intended to support:

- stable canonical identity management
- verification and evidence governance
- duplicate detection and merge control
- public visibility and QR resolution
- lineage, provenance, and auditability
- extension by future child registries without weakening core invariants

This model is derived only from the approved conceptual domain model and remains
independent of any specific storage engine or platform.

---

## 2. Logical Entity Catalog

| Logical Entity | Purpose | Core Logical Attributes | Primary Owner |
| --- | --- | --- | --- |
| RegistryDefinition | Defines the policy and governance profile for a registry family. | registry definition identifier, registry type, registry code, jurisdiction, lifecycle policy, verification policy, visibility defaults, authority profile, retention policy, version | Global Registry Foundation |
| RegistryType | Represents the formal class or family of registry. | registry type code, family, risk profile, default verification level, default visibility, extension model | Global Registry Foundation |
| RegistryIdentity | The canonical identity record for a subject within the foundation. | internal identity key, public registry identifier, registry type, canonical status, current verification level, current visibility state, registration context, lifecycle state, effective version | Global Registry Foundation |
| IdentityAttribute | Stores a logical attribute value attached to an identity. | attribute identifier, attribute name, attribute value, trust level, effective date, validity period, source reference | Global Registry Foundation |
| RegistryIdentifier | Represents a permanent or historical identifier associated with an identity. | identifier identifier, identifier value, identifier role, status, issuance context, validity period | Global Registry Foundation |
| IdentityClaim | Represents a statement made about a subject. | claim identifier, claim type, claim value, submitted by, claim status, confidence, related evidence references | Global Registry Foundation |
| IdentityEvidence | Represents evidence supporting a claim or verification case. | evidence identifier, evidence type, issuer, reference number, issue date, expiry date, sensitivity classification, validity status, linkage to case | Global Registry Foundation |
| VerificationCase | Encapsulates the review context for a set of claims and evidence. | verification case identifier, related identity, case status, assigned authority, required verification level, review outcome | Global Registry Foundation |
| VerificationReview | Represents a review action or review note on a verification case. | review identifier, reviewer actor, review outcome, review note, timestamp, review authority scope | Global Registry Foundation |
| VerificationDecision | Captures the formal decision made in a verification case. | decision identifier, decision type, decision reason, decision actor, decision timestamp, effective trust level | Global Registry Foundation |
| DuplicateCase | Represents a review workflow for potential duplicate identities. | duplicate case identifier, case status, case reason, candidate scope, review authority, resolution outcome | Global Registry Foundation |
| DuplicateCandidate | Represents a candidate identity or record identified as potentially duplicate. | candidate identifier, candidate source identity, match rationale, match score, review decision | Global Registry Foundation |
| IdentityMatch | Captures the comparison and evidence supporting a duplicate or conflict relation. | match identifier, candidate pair or set, similarity basis, strength, review status, explainability reference | Global Registry Foundation |
| MergeCase | Encapsulates the decision to unify two or more identities. | merge case identifier, canonical identity, source identities, merge reason, merge status, review authority | Global Registry Foundation |
| MergeSource | Represents a source identity participating in a merge. | merge source identifier, source identity, source role, merge lineage status, alias created indicator | Global Registry Foundation |
| MergeDecision | Captures the formal decision to approve, reject, or defer a merge. | merge decision identifier, decision type, decision actor, decision reason, decision timestamp | Global Registry Foundation |
| IdentityAlias | Represents an alternate identifier retained after merge or import. | alias identifier, alias value, alias context, effective period, status | Global Registry Foundation |
| RegistryAuthority | Represents an authority body, role, or organizational entity that can act in the registry domain. | authority identifier, authority type, authority scope, jurisdiction, capability profile, status | Global Registry Foundation |
| AuthorityAssignment | Links an authority to a registry domain or identity workflow context. | assignment identifier, authority, assigned scope, effective period, assignment status, delegated indicator | Global Registry Foundation |
| PublicProfile | Represents the visibility-safe public presentation of an identity. | public profile identifier, related identity, profile status, visibility level, publication context, profile version | Global Registry Foundation |
| PublicFieldPolicy | Defines which fields are allowed to appear in a public profile. | policy identifier, policy scope, field classification, visibility rule, status | Global Registry Foundation |
| QRResolutionRecord | Records a QR or public resolution request or destination. | resolution record identifier, public profile reference, resolution target, resolution policy, status | Global Registry Foundation |
| RegistrySnapshot | Represents an immutable point-in-time view of an identity’s logical state. | snapshot identifier, related identity, snapshot version, effective state summary, snapshot timestamp | Global Registry Foundation |
| RegistryStatusHistory | Captures the lifecycle history of an identity. | history identifier, identity reference, prior status, new status, reason, effective timestamp | Global Registry Foundation |
| RegistryChangeRecord | Captures significant logical changes to identity state. | change identifier, change category, change reason, actor, before/after summary, timestamp | Global Registry Foundation |
| ProvenanceRecord | Defines the lineage and trust context for data or events. | provenance identifier, subject entity reference, source actor, source organization, source type, confidence, effective date | Global Registry Foundation |
| ExternalRegistryReference | Represents a reference to a related identity in an external registry or trusted source. | reference identifier, external source, external identifier, trust classification, linkage status | Global Registry Foundation |
| ImportBatch | Represents a grouped import of identities or claims into the foundation. | import batch identifier, source system, import reason, batch status, submission authority, import policy version | Global Registry Foundation |
| ImportRecord | Represents a single imported identity or record within a batch. | import record identifier, import batch, target identity, import result, validation outcome, lineage reference | Global Registry Foundation |

---

## 3. Logical Relationships

| Parent Entity | Relationship | Child Entity | Cardinality |
| --- | --- | --- | --- |
| RegistryType | governs | RegistryDefinition | 1 to 0..* |
| RegistryDefinition | governs | RegistryIdentity | 1 to 0..* |
| RegistryIdentity | owns | IdentityAttribute | 1 to 0..* |
| RegistryIdentity | owns | RegistryIdentifier | 1 to 0..* |
| RegistryIdentity | has | IdentityClaim | 1 to 0..* |
| RegistryIdentity | has | VerificationCase | 1 to 0..* |
| RegistryIdentity | has | DuplicateCandidate | 1 to 0..* |
| RegistryIdentity | has | PublicProfile | 1 to 0..1 |
| RegistryIdentity | has | RegistrySnapshot | 1 to 0..* |
| RegistryIdentity | has | RegistryStatusHistory | 1 to 0..* |
| RegistryIdentity | has | RegistryChangeRecord | 1 to 0..* |
| RegistryIdentity | has | ProvenanceRecord | 1 to 0..* |
| RegistryIdentity | has | ExternalRegistryReference | 1 to 0..* |
| VerificationCase | contains | IdentityEvidence | 1 to 0..* |
| VerificationCase | contains | VerificationReview | 1 to 0..* |
| VerificationCase | produces | VerificationDecision | 1 to 0..1 |
| VerificationCase | relates to | IdentityClaim | 1 to 0..* |
| DuplicateCase | contains | DuplicateCandidate | 1 to 0..* |
| DuplicateCase | contains | IdentityMatch | 1 to 0..* |
| MergeCase | references | RegistryIdentity (canonical) | 1 to 1 |
| MergeCase | references | MergeSource | 1 to 0..* |
| MergeCase | produces | MergeDecision | 1 to 0..1 |
| MergeCase | creates | IdentityAlias | 1 to 0..* |
| RegistryAuthority | receives | AuthorityAssignment | 1 to 0..* |
| RegistryDefinition | scopes | AuthorityAssignment | 1 to 0..* |
| PublicProfile | uses | PublicFieldPolicy | 1 to 0..* |
| PublicProfile | records | QRResolutionRecord | 1 to 0..* |
| ImportBatch | contains | ImportRecord | 1 to 0..* |
| ImportRecord | may create or update | RegistryIdentity | 0..1 to 0..1 |
| ProvenanceRecord | describes | any auditable entity | 0..1 to 0..* |

---

## 4. Cardinality Matrix

| Entity A | Entity B | Cardinality | Business Meaning |
| --- | --- | --- | --- |
| RegistryDefinition | RegistryIdentity | 1 : 0..* | One registry definition may govern many identities. |
| RegistryType | RegistryDefinition | 1 : 0..* | One registry type may be used by many definitions. |
| RegistryIdentity | IdentityAttribute | 1 : 0..* | One identity may have many attributes. |
| RegistryIdentity | RegistryIdentifier | 1 : 0..* | One identity may have many identifiers. |
| RegistryIdentity | VerificationCase | 1 : 0..* | One identity may have many verification cases over time. |
| VerificationCase | IdentityEvidence | 1 : 0..* | One case may have many evidence items. |
| VerificationCase | VerificationDecision | 1 : 0..1 | One case may have one effective outcome. |
| RegistryIdentity | DuplicateCandidate | 1 : 0..* | One identity may appear as a candidate in many duplicate cases. |
| DuplicateCase | DuplicateCandidate | 1 : 0..* | One duplicate case may hold many candidates. |
| DuplicateCase | IdentityMatch | 1 : 0..* | One duplicate case may contain many match evaluations. |
| MergeCase | RegistryIdentity | 1 : 1 | One merge case selects one canonical identity. |
| MergeCase | MergeSource | 1 : 0..* | One merge case may involve many source identities. |
| MergeCase | IdentityAlias | 1 : 0..* | One merge case may create many aliases. |
| RegistryAuthority | AuthorityAssignment | 1 : 0..* | One authority may have many assignments. |
| RegistryDefinition | AuthorityAssignment | 1 : 0..* | One definition may be scoped by many authority assignments. |
| RegistryIdentity | PublicProfile | 1 : 0..1 | One identity may have at most one active profile concept. |
| PublicProfile | QRResolutionRecord | 1 : 0..* | One profile may have many resolution records. |
| RegistryIdentity | RegistrySnapshot | 1 : 0..* | One identity may have many snapshots. |
| ImportBatch | ImportRecord | 1 : 0..* | One batch may contain many import records. |
| RegistryIdentity | ExternalRegistryReference | 1 : 0..* | One identity may link to many external references. |

---

## 5. Ownership Matrix

| Logical Entity | Primary Ownership | Secondary Ownership | Rationale |
| --- | --- | --- | --- |
| RegistryDefinition | Global Registry Foundation | Registry Owner / Authority | Foundation owns policy semantics; registry owner governs local policy intent. |
| RegistryType | Global Registry Foundation | Registry Owner | Type model is shared foundation-level classification. |
| RegistryIdentity | Global Registry Foundation | Registry Authority | The canonical identity belongs to the foundation; authorities govern its lifecycle. |
| IdentityAttribute | Global Registry Foundation | Registry Authority | Attribute values are part of the canonical identity record. |
| RegistryIdentifier | Global Registry Foundation | Registry Authority | Identifier issuance and control remain foundation-owned. |
| IdentityClaim | Global Registry Foundation | Submitter / Authority | Claims are submitted by actors but governed by the foundation. |
| IdentityEvidence | Global Registry Foundation | Submitter / Authority | Evidence is bound to the foundation case and governed by authority policy. |
| VerificationCase | Global Registry Foundation | Verifying Authority | The workflow belongs to the foundation but is executed by authorities. |
| DuplicateCase | Global Registry Foundation | Reviewing Authority | Duplicate resolution is a foundation workflow. |
| MergeCase | Global Registry Foundation | Approving Authority | Merge governance belongs to the foundation and must be authority-controlled. |
| RegistryAuthority | Global Registry Foundation | Governance Authority | Authority bodies are part of the governing model. |
| AuthorityAssignment | Global Registry Foundation | Governance Authority | Assignment is a foundation governance concept. |
| PublicProfile | Global Registry Foundation | Publishing Authority | Public visibility is a foundation concern. |
| ProvenanceRecord | Global Registry Foundation | Source Actor / Authority | Provenance is owned by the foundation but sourced from external or internal actors. |
| ExternalRegistryReference | Global Registry Foundation | External Source / Authority | The reference is maintained by the foundation but pointed to external systems. |
| ImportBatch | Global Registry Foundation | Importing Authority | Import process is a foundation operation. |

---

## 6. Aggregate Mapping

| Aggregate Root | Logical Entities in Aggregate | Purpose |
| --- | --- | --- |
| RegistryDefinition | RegistryDefinition, RegistryType, RegistryStatusHistory | Represents the governing definition and lifecycle policy for a registry family. |
| RegistryIdentity | RegistryIdentity, IdentityAttribute, RegistryIdentifier, RegistryStatusHistory, RegistryChangeRecord, ProvenanceRecord, RegistrySnapshot | Represents the canonical identity and its state evolution. |
| VerificationCase | VerificationCase, IdentityClaim, IdentityEvidence, VerificationReview, VerificationDecision | Represents verification workflow and trust determination. |
| DuplicateCase | DuplicateCase, DuplicateCandidate, IdentityMatch | Represents duplicate detection and review resolution. |
| MergeCase | MergeCase, MergeSource, MergeDecision, IdentityAlias | Represents merge execution and lineage preservation. |
| AuthorityAssignment | RegistryAuthority, AuthorityAssignment | Represents authority empowerment and scope. |
| PublicProfile | PublicProfile, PublicFieldPolicy, QRResolutionRecord | Represents public visibility and public resolution behavior. |

---

## 7. Shared Kernel Mapping

The logical model should not share implementation internals with adjacent domains,
but it must rely on shared concepts through explicit contracts.

| Shared Concern | Logical Concept Used | Mapping Principle |
| --- | --- | --- |
| Identity and Access | Actor identity, subject identity, authentication context | The foundation consumes actor identity but does not own authentication semantics. |
| Tenancy and Organization | Jurisdiction, organization scope, ownership context | The foundation uses scope and organizational context for authority and visibility decisions. |
| RBAC and Authorization | Authority role, authority scope, permission context | The foundation consumes permission context but governs domain-specific authorization rules. |
| Workflow | VerificationCase, DuplicateCase, MergeCase | The foundation uses workflow concepts for business process coordination. |
| Document Service | IdentityEvidence reference and evidence lifecycle | The foundation maintains evidence metadata and policy, not the document storage mechanics. |
| Audit | ProvenanceRecord, RegistryChangeRecord, RegistryStatusHistory | The foundation produces immutable evidence for governance and compliance. |
| Search | RegistrySnapshot, PublicProfile, RegistryIdentifier | The foundation exposes discoverable state for search and lookup. |
| Integration Gateway | ExternalRegistryReference, ImportBatch, ImportRecord | The foundation integrates with external or federated sources via canonical contracts. |

---

## 8. Canonical Data Model Mapping

| Canonical Concept | Logical Representation |
| --- | --- |
| Canonical registry identity | RegistryIdentity |
| Registry definition | RegistryDefinition |
| Public registry identifier | RegistryIdentifier with role = public identifier |
| Internal identifier | RegistryIdentity internal identifier |
| Verification trust state | VerificationCase + VerificationDecision + VerificationLevel concept |
| Lifecycle state | RegistryIdentity + RegistryStatusHistory |
| Public visibility state | PublicProfile + PublicFieldPolicy |
| Provenance lineage | ProvenanceRecord |
| Duplicate case result | DuplicateCase + IdentityMatch |
| Merge outcome | MergeCase + MergeDecision + IdentityAlias |
| Authority scope | AuthorityAssignment + RegistryAuthority |
| Evidence set | IdentityEvidence connected to VerificationCase |
| Import lineage | ImportBatch + ImportRecord + ProvenanceRecord |

---

## 9. Business Key Strategy

The logical model uses a combination of surrogate identity and natural business keys.

| Logical Entity | Business Key Strategy |
| --- | --- |
| RegistryDefinition | Use a stable internal surrogate key plus a natural business key composed of registry type and registry code. |
| RegistryIdentity | Use a stable internal surrogate key as the canonical identifier, with a separate public registry identifier as a business key. |
| RegistryIdentifier | Use a stable internal identifier plus a unique logical identifier value. |
| RegistryAuthority | Use a stable internal surrogate key plus a jurisdiction-qualified authority code. |
| PublicProfile | Use a stable internal profile key plus a linkage to the owning identity. |
| VerificationCase | Use a stable case identifier plus a relationship to the owning identity and case type. |
| DuplicateCase | Use a stable case identifier plus links to the candidate identities and review context. |
| MergeCase | Use a stable case identifier plus the canonical identity key. |
| ImportBatch | Use a stable import batch identifier plus source system and batch reference. |

### Key Design Principles
- The internal surrogate key is the system identity for persistence and correlation.
- The public registry identifier is the externally meaningful business key.
- Historical or imported identifiers are retained as aliases and not treated as replacements for the canonical identifier.
- Business keys must be unique within their governance scope and must remain immutable once assigned.

---

## 10. Identity Strategy

The foundation must clearly separate distinct identity concepts.

| Identity Type | Logical Representation | Purpose |
| --- | --- | --- |
| Subject identity | RegistryIdentity | Represents the canonical subject within the foundation. |
| Actor identity | External actor reference from identity and access domain | Represents the person or service acting in workflows. |
| Public identity | RegistryIdentifier with role = public identifier | Represents the externally visible reference. |
| Alias identity | IdentityAlias | Preserves historical or imported alternate identifiers. |
| External identity | ExternalRegistryReference | Represents references to third-party or federated identity records. |

### Identity Principles
- One canonical RegistryIdentity exists for each subject within a registry family.
- A public registry identifier is unique and permanent.
- A subject may have many aliases or external references, but only one canonical identity in the foundation.
- Actor identity is not equivalent to registry identity.
- Organization or tenant membership does not imply ownership of the canonical registry identity.

---

## 11. Relationship Rules

| Rule | Applies To | Meaning |
| --- | --- | --- |
| A registry identity must be created under a valid registry definition. | RegistryIdentity | Identity creation must align with a known governance definition. |
| A verification case must be related to one and only one identity. | VerificationCase | Verification is always scoped to one canonical identity. |
| A public profile may exist only for an identity that is not permanently retired. | PublicProfile | Public exposure must respect lifecycle policy. |
| A merge case must select one canonical identity and one or more source identities. | MergeCase | Merge behavior must preserve a single surviving canonical record. |
| Duplicate cases must never directly create a canonical merge without authority review. | DuplicateCase / MergeCase | Avoids irreversible matching without governance. |
| Alias records must reference a merge or import event and remain attributable. | IdentityAlias | Prevents ambiguous lineage. |
| Provenance is mandatory for any significant change event. | ProvenanceRecord | Ensures trust and auditability. |
| Evidence cannot be detached silently from an approved or pending case. | IdentityEvidence | Preserves review integrity. |
| Authority assignments must be scoped to a jurisdiction or governance boundary. | AuthorityAssignment | Prevents unauthorized action outside the assigned scope. |
| Public visibility must never expose restricted fields by default. | PublicProfile / PublicFieldPolicy | Ensures privacy and policy compliance. |

---

## 12. Lifecycle Mapping

| Logical Entity | Lifecycle States | Notes |
| --- | --- | --- |
| RegistryIdentity | Draft, Submitted, Pending Screening, Pending Verification, Under Review, Verified, Active, Restricted, Suspended, Rejected, Merged, Superseded, Archived, Retired | The canonical lifecycle is shared across all registry families. |
| VerificationCase | Open, Pending Review, More Information Required, Approved, Rejected, Expired, Withdrawn | Reflects the evidence/decision workflow. |
| DuplicateCase | Open, Under Review, Resolved, Dismissed, Escalated | Tracks duplicate resolution progress. |
| MergeCase | Requested, Approved, Executed, Reversed, Rejected | Tracks the controlled merge workflow. |
| PublicProfile | Draft, Published, Hidden, Suspended, Retired | Tracks visible representation of identity data. |
| AuthorityAssignment | Active, Expired, Revoked, Suspended | Tracks the validity of authority rights. |
| IdentityEvidence | Submitted, Approved, Expired, Withdrawn, Rejected | Tracks evidence validity and review state. |
| ImportBatch | Pending, Validated, Accepted, Partially Accepted, Failed, Reconciled | Tracks batch import outcomes. |

---

## 13. Dependency Matrix

| Logical Entity | Depends On | Type of Dependency |
| --- | --- | --- |
| RegistryDefinition | RegistryType | Classification and policy profile |
| RegistryIdentity | RegistryDefinition | Governance context |
| IdentityAttribute | RegistryIdentity | Ownership and identity context |
| RegistryIdentifier | RegistryIdentity | Ownership and lifecycle context |
| IdentityClaim | RegistryIdentity | Subject context |
| IdentityEvidence | VerificationCase | Review and evidence linkage |
| VerificationCase | RegistryIdentity | Identity scope |
| VerificationDecision | VerificationCase | Outcome generation |
| DuplicateCandidate | RegistryIdentity | Candidate identity reference |
| DuplicateCase | DuplicateCandidate | Review workflow grouping |
| IdentityMatch | DuplicateCase | Evidence basis |
| MergeCase | RegistryIdentity | Canonical selection |
| MergeSource | MergeCase | Merge participation |
| IdentityAlias | MergeCase | Lineage and continuity |
| AuthorityAssignment | RegistryAuthority | Authority definition |
| AuthorityAssignment | RegistryDefinition | Scope and policy context |
| PublicProfile | RegistryIdentity | Identity presentation |
| PublicFieldPolicy | PublicProfile | Visibility rule applicability |
| QRResolutionRecord | PublicProfile | Resolution target |
| RegistrySnapshot | RegistryIdentity | State capture |
| RegistryStatusHistory | RegistryIdentity | Lifecycle history |
| RegistryChangeRecord | RegistryIdentity | Change record context |
| ProvenanceRecord | Any auditable entity | Lineage and trust metadata |
| ExternalRegistryReference | RegistryIdentity | Cross-reference relationship |
| ImportRecord | ImportBatch | Batch grouping |
| ImportRecord | RegistryIdentity | Target identity update |

---

## 14. Logical Constraints

| Constraint | Applies To | Rule |
| --- | --- | --- |
| Required canonical linkage | RegistryIdentity | Every identity must be linked to a valid registry definition. |
| Single canonical state | RegistryIdentity | An identity must not have more than one active canonical state at a time. |
| Verified trust requirement | Active identities | An identity may not become active without meeting the required verification threshold. |
| Immutable public identifier | RegistryIdentifier | A public identifier must not be reassigned or reused. |
| Evidence must remain attributable | IdentityEvidence | Each evidence item must preserve its source and review context. |
| Authority scope validation | AuthorityAssignment | Each assignment must remain within an explicit scope and jurisdiction. |
| Merge safety | MergeCase | Merge must preserve lineage and may not occur without review approval. |
| Visibility compliance | PublicProfile | Public exposure must only include fields permitted by policy. |
| Provenance completeness | Any significant change | Every significant change must be associated with provenance metadata. |
| Retention of lineage | MergeCase / IdentityAlias | Historical lineage must survive merge, reverse-merge, or retirement. |

---

## 15. Unique Constraints

| Constraint | Applies To | Reason |
| --- | --- | --- |
| One public registry identifier per identity per registry family | RegistryIdentifier | Prevents duplicate public identities. |
| One active public profile per identity | PublicProfile | Prevents conflicting public representations. |
| One active authority assignment per authority-scope pair for a given governance context | AuthorityAssignment | Prevents duplicate concurrent authority claims. |
| One canonical identity per subject within a registry family | RegistryIdentity | Preserves the canonical identity model. |
| One effective verification decision per case at a time | VerificationDecision | Ensures a single authoritative decision state. |
| One active merge case per identity pair in a given review window | MergeCase | Avoids duplicate merge workflows for the same persons or records. |
| One active duplicate case per candidate pair where the case remains unresolved | DuplicateCase | Prevents fragmentation of duplicate review. |
| One effective lifecycle state per identity at a time | RegistryIdentity | Maintains consistency of status. |

---

## 16. Business Rules Mapping

| Business Rule from Conceptual Model | Logical Entity / Relationship Affected | Mapping |
| --- | --- | --- |
| Every registry identity has exactly one internal identity key. | RegistryIdentity | Internal identity is the primary surrogate key. |
| Every issued public registry identifier is unique and permanent. | RegistryIdentifier | Public identifier is modeled as a unique logical key with immutable status. |
| Public identifiers are never reused. | RegistryIdentifier | Reuse is prohibited by lifecycle and uniqueness rules. |
| Registry identities are not owned by tenant organizations. | RegistryIdentity / AuthorityAssignment | Ownership belongs to foundation governance, not tenant organization. |
| Verified attributes cannot be silently overwritten by lower-trust sources. | IdentityAttribute / ProvenanceRecord | Trust and provenance preserve source precedence. |
| Sensitive evidence requires explicit authorization. | IdentityEvidence / VerificationCase | Visibility and access are governed through review context and authority. |
| Registry status transitions must follow the approved lifecycle. | RegistryIdentity / RegistryStatusHistory | Lifecycle state changes are recorded and constrained. |
| Suspended identities remain historically resolvable. | RegistryIdentity / RegistrySnapshot | Suspension does not remove historical visibility. |
| Merged identifiers resolve to the canonical identity. | RegistryIdentifier / MergeCase | Merge preserves lineage and canonical resolution. |
| Audit history cannot be altered by normal domain operations. | ProvenanceRecord / RegistryChangeRecord | Append-only logical history is preserved. |
| Merge operations preserve provenance. | MergeCase / ProvenanceRecord | Provenance is retained at merge and alias creation. |
| Duplicate detection never performs irreversible auto-merge. | DuplicateCase / MergeCase | Duplicate evaluation and merge execution are distinct workflows. |
| Public profiles expose only approved fields. | PublicProfile / PublicFieldPolicy | Field policy controls exposure. |
| QR resolution does not expose internal keys. | QRResolutionRecord / PublicProfile | Resolution targets are policy-safe and opaque. |
| Imported records retain source and batch provenance. | ImportRecord / ProvenanceRecord | Lineage and source are preserved on import. |
| Authority actions remain within jurisdiction and scope. | AuthorityAssignment | Assignment scope governs valid authority actions. |

---

## 17. Soft Delete Strategy

The logical model should not rely on physical deletion for business removal.
Instead, logical lifecycle states should be used.

| Entity | Soft Delete Strategy |
| --- | --- |
| RegistryIdentity | Use lifecycle state values such as Archived, Retired, or Merged rather than deletion. |
| IdentityEvidence | Mark as Withdrawn or Replaced; retain the historical link for review and audit. |
| VerificationCase | Mark as Rejected, Withdrawn, or Closed; preserve the decision history. |
| DuplicateCase | Mark as Resolved, Dismissed, or Escalated; retain review trail and rationale. |
| MergeCase | Mark as Reversed or Completed; preserve lineage and alias history. |
| PublicProfile | Mark as Hidden or Retired; retain the profile version history. |
| RegistryIdentifier | Mark as Retired or Superseded rather than deleting. |
| AuthorityAssignment | Mark as Revoked or Expired rather than deleting. |

### Soft Delete Principles
- Deletion is not used to remove historical truth.
- Retired or archived states preserve visibility for compliance and lineage.
- A “deleted” logical state is represented as a governed lifecycle outcome, not as data disappearance.

---

## 18. Audit Strategy

The logical model treats audit as a first-class enterprise concern and separates
business state from its historical evidence.

| Audit Mechanism | Logical Representation |
| --- | --- |
| Change history | RegistryChangeRecord / RegistryStatusHistory |
| Lineage and trust history | ProvenanceRecord |
| Verification history | VerificationCase / VerificationDecision / VerificationReview |
| Merge history | MergeCase / MergeDecision / IdentityAlias |
| Public visibility history | PublicProfile / QRResolutionRecord |
| Import lineage | ImportBatch / ImportRecord |
| Snapshot history | RegistrySnapshot |

### Audit Principles
- All material changes must be attributable to a source actor or authority.
- Audit information must be immutable in intent and preserved across lifecycle transitions.
- Provenance and change history must be queryable independently of current state.
- The logical model supports both operational traceability and compliance reporting.

---

## 19. Summary

This logical data model preserves the canonical structure of the Global Registry
Foundation as a reusable enterprise information model. It separates:

- canonical identity from actor identity
- public identifier from internal identity
- verification workflow from lifecycle state
- duplicate resolution from merge execution
- public visibility from internal state
- provenance from ordinary state changes

The model is intentionally stable, policy-driven, and technology-neutral so it can
be implemented in any suitable platform while remaining faithful to the approved
conceptual domain model.
