# TOUCHLINE ENTERPRISE ARCHITECTURE
## TAG-02 — Global Registry Foundation
### Artefact 05 — Supabase Security Model

> This document defines the enterprise security architecture for the Global Registry Foundation using Supabase PostgreSQL, Auth, Storage, Realtime, and Edge Functions. It is intentionally architecture-level and implementation-oriented only where necessary to describe security controls, policies, and governance boundaries.

---

## 1. Security Objectives

The security model is designed to ensure that the Global Registry Foundation operates with:

- strong identity and access control
- explicit tenant and registry boundary enforcement
- least-privilege authorization
- auditable governance actions
- resistant public and internal attack surfaces
- compatibility with Supabase-managed PostgreSQL and Auth services

This model assumes the platform is deployed through Supabase, but the controls are expressed in a way that remains conceptually portable where appropriate.

---

## 2. Authentication Boundary

### 2.1 Identity Domains

The platform must clearly distinguish between the following identity categories:

- end users
- administrators and governance operators
- service accounts and automated integrations
- external authorities and trusted registries
- anonymous public consumers

### 2.2 Authentication Boundaries

| Boundary | Description | Authentication Requirement |
| --- | --- | --- |
| Internal Admin Portal | Governance and authority operations | Strong MFA, role-bound access |
| Registry Operations | Identity lifecycle and workflow actions | Authenticated service or operator identity |
| Public Registry Views | Read-only public lookup or profile access | Optional anonymous access with strict policy limits |
| Integration Layer | Imports, federation, and batch processing | Service identity or signed integration token |
| Audit and Compliance Layer | Read-only governance reporting | Privileged role or least-privilege service identity |

### 2.3 Authentication Principles

- Authentication is always required for privileged or sensitive operations.
- Anonymous access is only permitted where the data exposure is explicitly approved and reduced to the minimum necessary.
- External integrations must authenticate using dedicated service identities rather than user credentials.
- Identity and access boundaries must not be inferred from tenant membership alone.

---

## 3. Authorization Model

The authorization model must be layered and explicit:

1. Authentication establishes identity.
2. Role-based authorization determines permitted actions within the trusted context.
3. Row-level security enforces data access at the record level.
4. Policy-based boundary controls enforce registry, jurisdiction, and tenant scope.
5. Audit controls record every privileged action.

### 3.1 Authorization Layers

| Layer | Purpose |
| --- | --- |
| Identity Layer | Confirms who the actor is |
| Role Layer | Assigns functional privileges |
| Context Layer | Applies scope such as registry, organization, jurisdiction, and tenant |
| Data Layer | Applies RLS and access predicates |
| Governance Layer | Enforces operational approvals and policy compliance |

### 3.2 Authorization Principles

- No user should receive broad access by default.
- Access must be granted by explicit role assignment or explicit policy evaluation.
- Every sensitive operation must be traceable to an authenticated actor.
- Public exposure is constrained through separate policy layers and views.

---

## 4. RBAC Matrix

### 4.1 Core Roles

| Role | Description | Typical Permissions |
| --- | --- | --- |
| super_admin | Full governance and platform control | Manage roles, policies, audit, global settings |
| registry_admin | Full registry governance authority | Manage registry definitions, authority assignments, verification workflows |
| verifier | Executes identity verification and evidence review | Review cases, update verification state |
| registrar | Creates and manages registry records within assigned boundaries | Create/update registry identities and identifiers |
| auditor | Read-only governance and compliance access | View audit trails, provenance, lifecycle history |
| service_integrator | Executes import and federation workflows | Access integration endpoints and batch processing tables |
| tenant_admin | Manages tenant-scoped business operations | Manage tenant-owned records within approved scope |
| tenant_operator | Performs day-to-day scoped operations | Read/write within assigned scope |
| public_reader | Read-only access to approved public data | View safe public profiles and lookup data |
| anonymous | No authenticated identity | Access only explicitly public and non-sensitive resources |

### 4.2 Role-to-Action Matrix

| Role | Read Identity | Write Identity | Verify Cases | Manage Authorities | View Audit | Access Public Profile |
| --- | --- | --- | --- | --- | --- | --- |
| super_admin | Yes | Yes | Yes | Yes | Yes | Yes |
| registry_admin | Yes | Yes | Yes | Yes | Yes | Yes |
| verifier | Yes | Limited | Yes | Limited | Yes | No |
| registrar | Yes | Yes | No | No | No | No |
| auditor | Yes | No | No | No | Yes | No |
| service_integrator | Yes | Limited | No | No | Limited | No |
| tenant_admin | Scoped | Scoped | No | No | Limited | No |
| tenant_operator | Scoped | Scoped | No | No | No | No |
| public_reader | Public only | No | No | No | No | Yes |
| anonymous | Public only | No | No | No | No | Yes |

---

## 5. Tenant Isolation

### 5.1 Isolation Model

Tenant isolation must be enforced at multiple layers:

- application-level context validation
- database-level RLS predicates
- service identity scoping
- storage path scoping
- audit attribution with tenant context

### 5.2 Isolation Strategy

| Scope | Isolation Mechanism |
| --- | --- |
| Organization / tenant | tenant_id or organization_id predicate |
| Registry family | registry_definition_id predicate |
| Jurisdiction | jurisdiction_code predicate |
| Public visibility | public profile policy constraint |
| Storage object access | tenant-scoped storage paths and bucket policies |

### 5.3 Tenant Isolation Principles

- A tenant must never be able to access another tenant’s canonical identity records.
- Tenant-scoped privileges must be enforced even if the application layer is bypassed.
- Public-facing data must be filtered by tenant and visibility policy before exposure.
- Audit records must preserve tenant context even for global or shared records.

### 5.4 Recommended Isolation Design

- Each sensitive table should include a tenant_id or organization_scope_id column where the data is tenant-meaningful.
- For foundation-level data that is shared, use a registry_scope_id and explicit jurisdiction scope rather than open tenancy access.
- Shared governance records should be protected by explicit authority scope, not by implicit trust.

---

## 6. RLS Policies

Row Level Security must be implemented for all tables that contain tenant-scoped, authority-scoped, or sensitive data.

### 6.1 RLS Policy Design Principles

- deny by default
- allow only the minimum necessary rows
- evaluate across role, tenant, registry scope, and visibility status
- prevent policy bypass through views or public objects

### 6.2 Base Policy Pattern

The following pattern should be used consistently:

- users with super_admin or registry_admin can read and update all rows in their assigned scope
- users with tenant_admin or tenant_operator can access only rows where their tenant scope matches
- public_reader and anonymous users can access only rows where visibility is public and tenant scope is approved
- service_integrator can access rows only within the integration scope and approved import batches

### 6.3 Example Policy Categories

| Table | Select Policy | Insert Policy | Update Policy | Delete Policy |
| --- | --- | --- | --- | --- |
| registry_identity | scoped by tenant and authority | registry_admin or registrar | registry_admin or registrar | none; soft delete only |
| verification_case | scoped by tenant/authority | verifier or registry_admin | verifier or registry_admin | none |
| public_profile | public-safe view only | registry_admin or registrar | registry_admin or registrar | none |
| registry_status_history | audit-visible only | system or registry_admin | none | none |
| import_record | service integrator scope only | service_integrator | service_integrator | none |

### 6.4 RLS Policy Guidance

- Use SECURITY DEFINER functions sparingly and only with strict input validation.
- Avoid overbroad policies such as `auth.uid() IS NOT NULL` for sensitive tables.
- Prefer explicit predicates and helper functions over inline duplication.

---

## 7. Security Functions

### 7.1 Recommended Security Helper Functions

| Function | Purpose |
| --- | --- |
| is_super_admin() | Returns true if the current user has global governance access |
| is_registry_admin() | Returns true if the current user can manage registry governance |
| is_verifier() | Returns true if the current user can review verification cases |
| is_tenant_admin(tenant_id) | Returns true if the current user is assigned as admin for the given tenant |
| is_tenant_member(tenant_id) | Returns true if the user belongs to the given tenant |
| has_registry_scope(registry_definition_id) | Returns true if the current user is authorized for the given registry scope |
| has_authority_scope(scope_jsonb) | Returns true if the current user’s authority assignment matches the scope |
| is_public_visible() | Returns true if the record is approved for anonymous or public read |
| can_access_audit_record() | Returns true if the user may review audit data |

### 7.2 Function Security Principles

- Security functions should be immutable and deterministic.
- They should rely on role assignments and scope tables, not on direct trust in client-supplied values.
- They should be wrapped with strict input validation to prevent bypasses.
- They should never reveal secret or sensitive values beyond the approved scope.

---

## 8. Permission Matrix

### 8.1 Functional Permission Matrix

| Capability | super_admin | registry_admin | verifier | registrar | auditor | service_integrator | tenant_admin | tenant_operator | public_reader | anonymous |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read canonical identity | Yes | Yes | Yes | Yes | Yes | Limited | Scoped | Scoped | Public only | Public only |
| Write canonical identity | Yes | Yes | No | Yes | No | No | Scoped | Scoped | No | No |
| Review verification | Yes | Yes | Yes | No | No | No | No | No | No | No |
| Manage authorities | Yes | Yes | No | No | No | No | No | No | No | No |
| View audit trail | Yes | Yes | Limited | No | Yes | No | Limited | No | No | No |
| Run import jobs | Yes | Yes | No | No | No | Yes | No | No | No | No |
| Read public profiles | Yes | Yes | No | No | No | No | No | No | Yes | Yes |
| Access storage objects | Yes | Yes | Limited | Limited | No | Limited | Scoped | Scoped | No | No |

---

## 9. Audit Strategy

### 9.1 Audit Requirements

Every security-sensitive event must be auditable:

- authentication events
- role changes
- tenant assignment changes
- verification case review actions
- merge or duplicate resolution actions
- public visibility changes
- import batch execution
- storage access and object changes
- edge function invocation for privileged operations

### 9.2 Audit Storage

- Store audit events in dedicated audit tables or append-only log tables.
- Preserve actor identity, timestamp, target resource, action, result, and scope data.
- Record both successful and denied actions where feasible.

### 9.3 Audit Principles

- audit records must be tamper-evident in structure and lifecycle
- audit events must preserve enough context to investigate security incidents
- privileged operations must never bypass audit capture

---

## 10. Storage Policies

### 10.1 Storage Security Model

Supabase Storage should be used only for files that are explicitly required by the registry domain and must be access-controlled.

### 10.2 Storage Policy Principles

- bucket access is restricted by bucket-level policies
- object paths must be tenant-scoped or registry-scoped
- only approved object types and sizes should be allowed
- sensitive evidence files must be access-controlled and encrypted at rest and in transit

### 10.3 Recommended Bucket Strategy

| Bucket | Intended Use | Access Pattern |
| --- | --- | --- |
| evidence-documents | Verification evidence | Restricted to authorized verifiers and registrars |
| public-assets | Safe public artifacts | Public-read where appropriate |
| audit-attachments | Compliance evidence | Restricted to auditors and admins |
| import-uploads | Intake files | Restricted to service integrators and admins |

### 10.4 Storage Access Rules

- tenants may only access objects in their own storage namespace
- public buckets must not contain sensitive or restricted content
- private buckets should require signed URLs or server-side authorization for access

---

## 11. Realtime Policies

Realtime channels should be restricted to non-sensitive operational updates unless explicitly required.

### 11.1 Realtime Security Principles

- do not broadcast sensitive identity information over public channels
- require authorization on channels or subscriptions
- restrict broadcast permissions to verified service roles or authorized users
- avoid exposing audit or evidence data through open channels

### 11.2 Recommended Realtime Scope

| Channel | Allowed Users | Data Sensitivity |
| --- | --- | --- |
| verification-updates | authorized verifiers and admins | medium |
| registry-activity | scoped operational users | medium |
| public-profile-updates | public-safe data only | low |
| audit-notifications | auditors and admins | high |

### 11.3 Realtime Guardrails

- channels should be scoped by tenant and role
- broadcast actions should be server-controlled rather than client-driven
- any sensitive updates should pass through an authorization layer before publishing

---

## 12. Edge Function Security

### 12.1 Edge Function Trust Model

Edge Functions should be treated as privileged execution surfaces and must not trust client input implicitly.

### 12.2 Security Requirements

- validate all request inputs and headers
- enforce authentication and role checks inside the function
- use service-role access only for necessary privileged tasks
- avoid exposing secrets in function logs
- require signature or token validation for external integrations

### 12.3 Recommended Edge Function Categories

| Function Type | Security Handling |
| --- | --- |
| identity-import | validate payload, role-check, scope-check |
| public-profile-resolution | allow anonymous read only for safe data |
| verification-webhook | verify request signature, enforce authorization |
| evidence-upload | validate file type, identity scope, and storage authorization |
| audit-export | restrict to auditors and admins |

### 12.4 Edge Function Risk Controls

- always verify `auth.uid()` and role claims in the function context
- never rely solely on the client to enforce permissions
- apply rate limiting where external webhooks are involved
- log failures without exposing secrets or raw tokens

---

## 13. Security Best Practices

### 13.1 Identity Best Practices

- enforce MFA for privileged users
- rotate service account credentials and signing keys regularly
- use short-lived tokens where feasible
- disable shared accounts and shared credentials

### 13.2 Data Protection Best Practices

- encrypt data in transit and at rest
- avoid storing raw secrets in database columns
- treat evidence documents and personal data as restricted assets
- use least-privilege storage and database roles

### 13.3 Operational Security Best Practices

- deploy with environment separation
- restrict database administration access
- maintain separate credentials for development, staging, and production
- review and rotate RLS policies as governance evolves

### 13.4 Application Security Best Practices

- validate all untrusted input on the server side
- use parameterized queries and prepared statements
- treat all API inputs as potentially hostile
- avoid client-side business authorization as the only control

---

## 14. Zero Trust Mapping

The zero trust posture should be applied consistently across all layers.

| Zero Trust Principle | Mapping to Supabase Security Model |
| --- | --- |
| Never trust the network | Enforce auth, RLS, and server-side validation |
| Verify explicitly | Validate identity, role, scope, and request context for every operation |
| Use least privilege | Limit role capabilities and row access to the minimum needed |
| Assume breach | Maintain audit, segmentation, and restricted public surfaces |
| Encrypt everything | Encrypt transit, storage, and sensitive workflow payloads |
| Segment access | Separate admin, integration, public, and tenant-specific access paths |
| Monitor and log | Capture audit events and privileged operations |

---

## 15. Threat Model

### 15.1 Threat Categories

| Threat | Description | Mitigation |
| --- | --- | --- |
| Unauthorized data access | User reads another tenant’s or another registry’s records | RLS, tenant scope, role checks |
| Privilege escalation | User gains broader permissions than intended | Role matrix enforcement, policy review, MFA |
| Data tampering | An attacker modifies identity or evidence records | Constraints, server-side validation, audit logging |
| Cross-tenant leakage | Data from one tenant is exposed to another | Tenant predicates, scoped storage paths |
| Broken object-level authorization | Client bypasses server-side access rules | RLS on all sensitive tables, server-side enforcement |
| Public data overexposure | Public profile reveals restricted fields | Separate public views and field policies |
| Malicious integration input | Attackers inject payloads into import or webhook flows | Signature validation, input validation, throttling |
| Storage abuse | Sensitive files are exposed through poor bucket policies | Bucket scoping, signed URLs, least privilege |
| Realtime leakage | Sensitive updates are broadcast to unauthorized users | Channel authorization and data minimization |
| Audit bypass | Security-relevant actions are not logged | append-only audit tables and policy enforcement |

### 15.2 Threat Handling Strategy

- fail closed rather than open
- deny access by default
- verify every action server-side
- treat logs and audit trails as security-critical

---

## 16. Compliance Mapping

### 16.1 Compliance Concerns

| Concern | Control Mapping |
| --- | --- |
| Confidentiality | RLS, storage policies, least-privilege roles |
| Integrity | constraints, foreign keys, server-side validation, audit trails |
| Availability | partitioning, backup strategy, role segmentation, resilient policies |
| Accountability | audit logging, actor attribution, immutable audit records |
| Privacy | public profile policy, redaction, field-level visibility controls |
| Traceability | provenance records, workflow logs, change history |
| Segregation of duties | separate roles for admins, verifiers, auditors, and integrators |
| Incident response | audit trail, access logs, role review, alerting |

### 16.2 Recommended Compliance Controls

- preserve immutable audit data for investigations and reviews
- separate privilege by function to reduce abuse potential
- ensure public access is limited to approved and safe data
- use policy-driven access rather than one-off exceptions

---

## 17. Supabase-Specific Implementation Notes

### 17.1 Auth

- use Supabase Auth for user and service authentication
- enforce MFA for privileged roles
- map Supabase JWT claims to internal roles and scope claims
- avoid trusting client-side role claims without server-side validation

### 17.2 Database

- implement RLS on sensitive tables
- place policy logic in reusable security helper functions
- manage tenant and registry scope predicates centrally

### 17.3 Storage

- use private buckets by default
- scope object paths by tenant or registry namespace
- prefer signed URLs over public URLs for sensitive documents

### 17.4 Realtime

- use authorization-aware channels and scoped subscriptions
- do not broadcast unrestricted user or audit data

### 17.5 Edge Functions

- protect all functions with role and scope checks
- validate webhook signatures and request origins
- use service-role access only for restricted internal tasks

---

## 18. Summary

This Supabase security model establishes a strong enterprise security posture for the Global Registry Foundation by combining:

- explicit authentication boundaries
- layered authorization and role-based access control
- database-enforced tenant and registry isolation
- RLS-driven data protection
- secure storage, realtime, and edge function design
- auditable governance and compliance controls

The architecture is designed to support both operational security and long-term governance maturity while remaining compatible with Supabase’s managed PostgreSQL and authentication platform.
