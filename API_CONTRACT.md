# Touchline Football Ecosystem Platform
## Enterprise API Contract & Integration Architecture

**Document Version:** 1.0
**Status:** Baseline — Source of Truth for API Design
**Owner:** Enterprise Solution Architecture
**Audience:** Backend, Frontend, Mobile, Integrations, Partners, AI Services
**Scope:** REST/JSON over HTTPS, OpenAPI 3.1, multi-tenant SaaS

> This document defines the **contract** — not the implementation. No source code, no UI, no SQL. It governs every current and future consumer: Web App, Mobile App, Public Website, Third-Party Partners, AI Services, and future microservices.

---

## Table of Contents

1. API Design Principles
2. API Naming Convention
3. Versioning Strategy
4. Authentication Flow
5. Authorization Matrix
6. Standard Headers
7. Request Standard
8. Response Standard
9. Error Response Standard
10. Pagination Strategy
11. Filtering Strategy
12. Sorting Strategy
13. Search Strategy
14. File Upload Strategy
15. Rate Limiting Strategy
16. API Security Strategy
17. Audit Strategy
18. Event Strategy
19. Webhook Strategy
20. Integration Strategy
21. Endpoint Catalog (per domain)
22. OpenAPI Structure
23. API Folder Structure
24. Integration Flow
25. External API Strategy
26. Future GraphQL Readiness
27. Future gRPC Readiness

---

# 1. API Design Principles

- **RESTful, resource-oriented.** URLs identify resources (nouns); HTTP verbs express intent; state transitions are explicit.
- **JSON only** on the wire (`application/json; charset=utf-8`); binary via signed URLs, not multipart-in-JSON.
- **Stateless.** No server-side session; every request carries its own auth context.
- **Versioned.** URL-based major version (`/v1`), backward-compatible within a major.
- **Secure by default.** TLS 1.3, OAuth2/OIDC bearer tokens, RLS-backed authorization, least privilege.
- **Consistent.** One naming style, one pagination style, one error envelope, one date format across the whole surface.
- **Idempotent where applicable.** All GET/PUT/DELETE inherently idempotent; POST supports `Idempotency-Key` on create endpoints and side-effect endpoints (payments, notifications, match events).
- **Deterministic contracts.** OpenAPI 3.1 is the single source of truth; SDKs, mocks, and tests are generated from it.
- **Multi-tenant by construction.** Tenant is resolved from the auth token; never trusted from the URL/body.
- **Additive evolution.** Never break clients; deprecate with headers and long notice.
- **Observability first.** Every response carries a `Request-Id`; every mutation emits an audit event.
- **Fail closed.** Unknown fields rejected on write; unknown query params rejected in strict mode.

---

# 2. API Naming Convention

- **Base URL:** `https://api.touchline.app/v1`
- **Regional bases (future):** `https://api.eu.touchline.app/v1`, `https://api.asia.touchline.app/v1`
- **Resource segments:** plural, lower-kebab-case: `/player-registrations`, `/match-events`
- **Path params:** UUID v4/v7 only: `/players/{playerId}/passport`
- **Sub-resources:** hierarchical up to 2 levels; deeper relationships expressed via query filters
- **Actions (verbs) as sub-resources** only when true state transitions:
  `POST /matches/{id}:start`, `POST /matches/{id}:complete`, `POST /registrations/{id}:approve`, `POST /transfers/{id}:reject`
- **Query params:** snake_case: `?age_category=U15&status=active`
- **Body fields:** camelCase in JSON payloads (`firstName`, `dateOfBirth`, `tenantId`)
- **IDs:** always `<entity>Id` (e.g., `clubId`, `playerId`)
- **Booleans:** `is/has/can` prefix (`isMinor`, `hasConsent`, `canPlay`)
- **Timestamps:** `<something>At` (`createdAt`, `kickedOffAt`) — ISO-8601 UTC (`2026-07-28T14:33:00Z`)
- **Enums:** UPPER_SNAKE in wire values (`STATUS_ACTIVE`, `EVENT_TYPE_GOAL`) — stable regardless of translation
- **Collections:** always `{ data: [...], meta: {...}, links: {...} }`
- **Single resource:** always `{ data: {...}, meta: {...} }`

---

# 3. Versioning Strategy

- **URL major version:** `/v1`, `/v2` — breaking changes only.
- **Minor/patch:** additive, backward-compatible, released continuously; advertised in `API-Version` response header (`v1.14.2`).
- **Deprecation policy:**
  - `Deprecation: true` header + `Sunset: <RFC-8594 date>` header, minimum **12 months** before removal.
  - Deprecated fields marked in OpenAPI (`deprecated: true`) with `x-sunset` and `x-replacement`.
- **Client capability negotiation:** `Accept-Version: v1` optional; URL wins.
- **Beta surfaces:** `/v1/beta/...` — no SLA, may change with 30 days' notice.
- **Internal-only:** `/v1/internal/...` — restricted to platform services; not documented publicly.
- **Feature flags** for progressive rollout at endpoint or field level via `X-Feature-Flags` (server-controlled).

---

# 4. Authentication Flow

**Supported flows** (all issued by Lovable Cloud / managed Supabase Auth, JWT):

| Flow | Consumer | Notes |
|---|---|---|
| Email + Password | Web/Mobile users | MFA optional/required by tenant policy |
| Phone/OTP (SMS) | Parents, grassroots users | Rate-limited, throttled |
| Google OAuth | Web/Mobile | Via managed broker (`lovable.auth.signInWithOAuth('google')`) |
| Apple OAuth | Mobile | Via managed broker |
| SAML SSO | Federations, enterprise tenants | Tenant-scoped IdP metadata |
| OAuth 2.1 Authorization Code + PKCE | Third-party apps, AI clients | Managed Cloud Auth OAuth server; consent at `/.lovable/oauth/consent` |
| Client Credentials | Server-to-server partners | Scoped, non-user tokens |
| API Keys (scoped) | Machine/service accounts, webhooks-in | Prefixed `tls_`, tenant-scoped, revocable |

**Token model**
- Access token: JWT, short-lived (60 min), RS256 signed by managed issuer JWKS
- Refresh token: rotating, 30-day sliding window, revocable
- MFA step-up: `amr` claim required for restricted operations (finance, transfers, medical)

**Bearer usage**
- `Authorization: Bearer <access_token>` on every authenticated call
- API keys: `Authorization: Bearer tls_live_...` with server-side rate limits
- Never accept tokens in query strings; never log them

**Sessions**
- Web: httpOnly, Secure, SameSite=Lax cookies mirroring bearer; CSRF token on unsafe methods
- Mobile: secure keychain / keystore storage

**Sign-out**
- `POST /auth/sign-out` revokes refresh token and current access token; downstream services honor JWT revocation list

---

# 5. Authorization Matrix

Authorization is **RBAC + ABAC**, enforced by:
1. Route-level permission check (declared in OpenAPI `x-required-permission`)
2. Row-Level Security (RLS) at Postgres
3. Field-level masking for restricted classifications

**Standard roles** (composable; a user may hold multiple, scoped by tenant/org):

| Role | Scope |
|---|---|
| `PLATFORM_OWNER` | Global (Touchline staff) |
| `PLATFORM_SUPPORT` | Global read + limited write |
| `FEDERATION_ADMIN` | Federation tenant |
| `ASSOCIATION_ADMIN` | Regional/District association |
| `COMPETITION_ORGANIZER` | One or more competitions |
| `CLUB_ADMIN` | Club |
| `CLUB_STAFF` | Club (limited) |
| `ACADEMY_ADMIN` | Academy |
| `COACH` | Team(s) |
| `MEDICAL_STAFF` | Team/Club — PHI access |
| `REFEREE` | Self + assigned matches |
| `SCOUT` | Watchlists, reports |
| `AGENT` | Represented players |
| `PLAYER` | Self |
| `GUARDIAN` | Linked minor(s) |
| `FINANCE_OFFICER` | Tenant finance |
| `AUDITOR` | Read-only + audit logs |
| `PARTNER_INTEGRATION` | Scoped API key |
| `AI_SERVICE` | Scoped machine token |
| `PUBLIC` | Anonymous read of public endpoints |

**Permission naming:** `<domain>.<resource>.<action>` — e.g., `match.event.create`, `finance.invoice.read`, `medical.injury.read`.

**Matrix excerpt** (C=Create, R=Read, U=Update, D=Delete, X=Execute action):

| Resource | PLATFORM_OWNER | FED_ADMIN | CLUB_ADMIN | COACH | MEDICAL | PLAYER | GUARDIAN | PUBLIC |
|---|---|---|---|---|---|---|---|---|
| Federation | CRUD | RU (own) | R | R | R | R | R | R (public fields) |
| Club | CRUD | CRUD | RU (own) | R (own) | R (own) | R | R | R (public) |
| Player | CRUD | CRUD | CRU (registered) | R (squad) | R (assigned) | R (self) | R (linked) | R (public fields) |
| PlayerRegistration | CRUD | CRUD + approve | CRU (own club) | R (own team) | — | R (self) | R (linked) | — |
| Match | CRUD | CRUD | R (involved) | R (own team) | R (own team) | R (own) | R | R (public) |
| MatchEvent | CRUD | CRUD | CRU (own team) X:reverse | CRU (own team) | — | R | R | R (public) |
| Medical/Injury | — | — | — | R (own team, limited) | CRUD | R (self) | R (linked) | — |
| Finance/Invoice | R | CRUD (own) | CRU (own) | — | — | R (self) | R (linked) | — |
| Transfer | CRUD X:approve | CRUD X:approve | C R (own) X:accept | — | — | R (self) | R (linked minor) | — |
| Standings | R | R | R | R | R | R | R | R |
| Audit Log | R | R (own tenant) | R (own org) | R (own scope) | R (own scope) | R (self access) | R (linked access) | — |

Public endpoints (`/public/**`) never require auth and never return PII/PHI.

---

# 6. Standard Headers

**Request**
| Header | Required | Purpose |
|---|---|---|
| `Authorization` | On authenticated calls | Bearer JWT or API key |
| `Content-Type` | On body requests | `application/json` |
| `Accept` | Recommended | `application/json` |
| `Accept-Language` | Optional | i18n (`en`, `id`, `es`) |
| `X-Tenant-Id` | Optional/forbidden | **Ignored** if token binds a tenant; only used by `PLATFORM_OWNER` |
| `Idempotency-Key` | On POST create + side-effect | UUID; 24-hour dedup window |
| `X-Request-Id` | Optional | Client trace correlation |
| `If-Match` | On concurrent update | ETag for optimistic locking |
| `If-None-Match` | On cached GET | ETag validation |
| `X-Client-Info` | Recommended | `web/1.14.0`, `ios/2.0.1` |
| `X-Signature` | On webhook-in | HMAC signature of raw body |
| `X-Signature-Timestamp` | On webhook-in | Replay protection |

**Response**
| Header | Purpose |
|---|---|
| `Content-Type` | `application/json; charset=utf-8` |
| `X-Request-Id` | Server-assigned correlation id |
| `API-Version` | Minor/patch version served |
| `ETag` | Concurrency + caching |
| `Cache-Control` | Cacheability directives |
| `RateLimit-Limit` / `-Remaining` / `-Reset` | RFC-9331 rate limit info |
| `Retry-After` | On 429/503 |
| `Deprecation` / `Sunset` | Deprecated endpoints |
| `X-Trace-Id` | Distributed trace id |

---

# 7. Request Standard

- **Method semantics:**
  - `GET` — safe, idempotent, cacheable
  - `POST` — create OR non-idempotent action
  - `PUT` — full replacement, idempotent
  - `PATCH` — partial update (JSON Merge Patch — RFC 7396)
  - `DELETE` — soft delete (idempotent); hard delete requires `?hard=true` and elevated permission
- **Body:** JSON object; arrays only for bulk endpoints (`/batch`).
- **Bulk:** `POST /<resource>/batch` — max 500 items, all-or-nothing OR partial with per-item status; controlled by `atomic=true|false`.
- **Idempotency:** server stores `(Idempotency-Key, tenantId, endpoint)` → response for 24h; replay returns original result.
- **Concurrency:** clients send `If-Match: "<etag>"` for updates; server returns `412 Precondition Failed` on mismatch.
- **Validation:** JSON Schema (via OpenAPI 3.1) + business rules; unknown fields rejected (`additionalProperties: false`).
- **Nulls vs missing:** `null` = explicit clear; missing = no change (PATCH semantics).
- **Locale/units:** metric only in API; presentation converts.
- **Time:** UTC only; requests specifying local time must include IANA `timeZone`.

---

# 8. Response Standard

**Envelope — single resource**
```json
{
  "data": { "id": "uuid", "type": "player", "attributes": { ... }, "relationships": { ... } },
  "meta": { "requestId": "uuid", "servedAt": "2026-07-28T14:33:00Z", "apiVersion": "v1.14.2" }
}
```

**Envelope — collection**
```json
{
  "data": [ { ... } ],
  "meta": { "requestId": "uuid", "page": { "size": 25, "hasMore": true, "estimatedTotal": 12345 } },
  "links": { "self": "...", "next": "...?cursor=...", "prev": null }
}
```

**Empty collection:** `data: []`, HTTP 200.
**Created:** HTTP 201 with `Location` header and full resource in `data`.
**Accepted async:** HTTP 202 with `data.operationId` and `links.status`.
**No content:** HTTP 204 (only for hard delete confirmations).

**Type field:** every resource carries `"type": "<resource-name>"` for polymorphic clients.

---

# 9. Error Response Standard

Modeled on **RFC 9457 Problem Details** with additive fields.

```json
{
  "error": {
    "type": "https://errors.touchline.app/validation/field-required",
    "code": "VALIDATION_FIELD_REQUIRED",
    "title": "Validation failed",
    "status": 422,
    "detail": "Field 'dateOfBirth' is required.",
    "instance": "urn:request:018f...",
    "errors": [
      { "field": "dateOfBirth", "code": "REQUIRED", "message": "Required" },
      { "field": "email", "code": "FORMAT_INVALID", "message": "Not an email" }
    ],
    "retryable": false,
    "docsUrl": "https://docs.touchline.app/errors/validation-field-required"
  },
  "meta": { "requestId": "uuid", "servedAt": "2026-07-28T14:33:00Z" }
}
```

**Canonical HTTP mapping**
| Status | Meaning | Example `code` |
|---|---|---|
| 400 | Malformed request | `REQUEST_MALFORMED` |
| 401 | Missing/invalid auth | `AUTH_TOKEN_INVALID` |
| 403 | Authenticated but forbidden | `PERMISSION_DENIED` |
| 404 | Resource not found or not visible under RLS | `RESOURCE_NOT_FOUND` |
| 405 | Method not allowed | `METHOD_NOT_ALLOWED` |
| 409 | State conflict (duplicate, illegal transition) | `RESOURCE_CONFLICT`, `STATE_INVALID_TRANSITION` |
| 410 | Gone (hard-deleted / sunsetted) | `RESOURCE_GONE` |
| 412 | ETag mismatch | `PRECONDITION_FAILED` |
| 413 | Payload too large | `PAYLOAD_TOO_LARGE` |
| 415 | Unsupported media | `MEDIA_UNSUPPORTED` |
| 422 | Validation | `VALIDATION_*` |
| 423 | Locked (legal hold) | `RESOURCE_LOCKED` |
| 429 | Rate limited | `RATE_LIMITED` |
| 451 | Legal restriction (minor privacy) | `LEGAL_RESTRICTED` |
| 500 | Server error | `INTERNAL_ERROR` |
| 502/503/504 | Upstream/unavailable/timeout | `UPSTREAM_*` |

Never leak stack traces; `detail` is safe for end users; developer info in `meta.debug` (dev/staging only).

---

# 10. Pagination Strategy

**Default: cursor-based (opaque)** — stable under insert/delete, scales to millions.

- Query: `?page[size]=25&page[cursor]=<opaque>`
- Response: `links.next`, `links.prev`, `meta.page.hasMore`.
- Size: default 25, max 100 (200 for internal analytics endpoints).
- Cursors encode `(sortKey, id)` + tenantId + query hash; unforgeable (HMAC).

**Offset pagination** offered only for small, bounded lists (`?page[number]=1&page[size]=25`); returns `meta.page.totalPages`.

**Keyset for time-series** endpoints (`match-events`, `audit-log`): `?before=<iso>&after=<iso>&limit=100`.

**Count discipline:** exact totals only on request (`?include=totals`); default returns `estimatedTotal` from statistics.

---

# 11. Filtering Strategy

RHS-bracket operators, safe and expressive:

- Equality: `?status=ACTIVE`
- Multiple values (IN): `?status=ACTIVE,SUSPENDED`
- Ranges: `?birthDate[gte]=2010-01-01&birthDate[lte]=2010-12-31`
- Existence: `?photoUrl[exists]=true`
- Text: `?name[like]=juan` (server does trigram search)
- Booleans: `?isMinor=true`
- Nested relation: `?club.id=<uuid>`
- Composite AND (default) — OR via `?or[status]=ACTIVE&or[status]=INJURED`

Filters are declared per endpoint in OpenAPI; unknown filters → `422 VALIDATION_UNKNOWN_FILTER`.
Free-form filter DSLs are **not** exposed publicly; complex queries go through **Search** (§13).

---

# 12. Sorting Strategy

- `?sort=lastName,-createdAt` — comma-separated fields, `-` prefix = DESC.
- Whitelist per endpoint (declared in OpenAPI `x-sortable-fields`).
- Deterministic tie-breaker: server always appends `,id ASC` internally.
- Max 3 sort keys.
- Localized sort: `?sort=lastName&collation=id-ID`.

---

# 13. Search Strategy

Two tiers.

**Simple search** — endpoint-local:
- `?q=<term>` runs trigram + prefix search on declared searchable fields.
- Returns paginated `data` with `meta.search.matches` per row.

**Federated search** — cross-domain:
- `GET /search?q=&type=player,club&filters=...&limit=20`
- Backed by a dedicated read model (materialized views today; OpenSearch/Meilisearch later).
- Respects RLS: only returns resources the caller can see.

**Semantic search (AI)**
- `POST /ai/search/players` with natural-language prompt or embedding.
- Returns `data` ranked by vector similarity; `meta.model.version` stamped.

---

# 14. File Upload Strategy

**Never** upload binary through the JSON API. Two-step signed-URL protocol:

1. `POST /uploads:presign`
   - Body: `{ purpose, contentType, byteSize, checksumSha256, filename }`
   - Purpose enum: `PLAYER_PHOTO`, `PLAYER_DOCUMENT`, `MATCH_MEDIA`, `CLUB_LOGO`, `MEDICAL_SCAN`, `CONTRACT`, `KYC`.
   - Response: `{ uploadUrl, method: "PUT", headers, expiresAt, mediaAssetId }`.
2. Client `PUT`s directly to `uploadUrl` (S3-compatible object storage).
3. `POST /media-assets/{mediaAssetId}:confirm` — server verifies checksum + size + MIME; malware scan; PHI/PII classification.

**Constraints**
- Max sizes per purpose (photo 10MB, document 20MB, video 2GB via multipart upload).
- Allowed MIME whitelist per purpose.
- Confidential purposes (`MEDICAL_SCAN`, `KYC`, `CONTRACT`) → private bucket, signed short-lived read URLs only.
- Every media asset gets antivirus + EXIF strip + variant generation (thumbnail, web, mobile).

---

# 15. Rate Limiting Strategy

Multi-dimensional token bucket:

| Dimension | Default |
|---|---|
| Per user | 300 req/min, burst 100 |
| Per API key | 600 req/min, burst 200 |
| Per tenant | 5,000 req/min |
| Per IP (unauthenticated) | 60 req/min |
| Per endpoint category | see below |

**Category limits**
| Category | Limit |
|---|---|
| Write endpoints | 60 req/min per user |
| Match-event ingest | 240 req/min per match (offline burst tolerant) |
| Auth (login, OTP) | 10 req/min per IP + per identity |
| Public portal | 120 req/min per IP, aggressive edge caching |
| AI endpoints | 30 req/min per user, quota-based per tenant plan |
| Webhook delivery (outbound) | 100 req/sec per subscription, exponential backoff |

Headers: RFC-9331 (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).
Overrun: `429 RATE_LIMITED` with `Retry-After`.
Tenant plan overrides configurable (`STARTER`, `PRO`, `FEDERATION`, `ENTERPRISE`).

---

# 16. API Security Strategy

- **Transport:** TLS 1.3 only; HSTS preload; no TLS 1.0/1.1.
- **AuthN:** JWT (RS256), managed OAuth server; scoped API keys for machines.
- **AuthZ:** RBAC declarative + ABAC + RLS enforced in the database.
- **Input validation:** JSON Schema + business rules; strict `additionalProperties: false`; length + regex on every string.
- **Output filtering:** field-level masking by data classification.
- **CSRF:** cookie sessions require `X-CSRF-Token` on unsafe methods; bearer-token-only clients exempt.
- **CORS:** allowlist per origin per tenant; no wildcard on authenticated APIs.
- **Injection:** parameterized queries only; no dynamic SQL from user input; JSON path expressions validated.
- **SSRF:** outbound HTTP restricted to allowlisted domains via egress proxy.
- **Secrets:** never in logs, URLs, or error bodies; managed via Cloud Secrets.
- **PII/PHI:** field-level encryption for restricted classifications; access logged.
- **Anti-abuse:** bot detection, device fingerprinting on auth, geo-anomaly detection.
- **DoS:** WAF + edge rate limiting + circuit breakers per downstream.
- **Vulnerability lifecycle:** dependency SBOM, weekly scans, coordinated disclosure (`security.txt`).
- **Compliance surfaces:** GDPR-equivalent DSAR endpoints; minor-safe defaults (`marketing=false`, `publicVisibility=false`).
- **Audit:** every mutation + every restricted read → `audit_event`.

---

# 17. Audit Strategy

- **What is audited:** every non-GET; every `GET` on classification `restricted`; every auth event; every permission change; every export.
- **How:** the API layer emits a structured event to the audit sink (§8 of Data Architecture) synchronously with the write; failures block the write when classification ≥ `confidential`.
- **Fields:** `actorUserId`, `actorRole`, `tenantId`, `action`, `entity`, `entityId`, `before/after` (redacted per classification), `requestId`, `ip`, `userAgent`, `deviceId`, `mfaAssuranceLevel`.
- **Access:** `GET /audit-log` scoped by role; platform-owner queries carry justification code.
- **Retention:** per data class (financial 7y, minor-related 10y+, general 2y).
- **Tamper evidence:** hash-chained per tenant per day; daily digest exported to WORM storage.

---

# 18. Event Strategy

Domain events power webhooks, analytics, AI features, and future microservices.

**Envelope (CloudEvents 1.0 compatible)**
```json
{
  "specversion": "1.0",
  "id": "uuid",
  "type": "touchline.match.event.recorded.v1",
  "source": "/tenants/<tenantId>/matches/<matchId>",
  "subject": "matchEventId",
  "time": "2026-07-28T14:33:00Z",
  "datacontenttype": "application/json",
  "tenantid": "uuid",
  "traceparent": "00-...",
  "data": { ... },
  "dataclassification": "internal"
}
```

**Event catalog (excerpt)**
- Identity: `user.created`, `user.mfa.enrolled`, `user.signed_in`, `user.signed_out`
- Org: `tenant.provisioned`, `club.created`, `academy.updated`
- People: `player.created`, `player.verified`, `guardian.linked`
- Registration: `registration.submitted`, `registration.approved`, `registration.rejected`, `transfer.completed`
- Competition: `competition.published`, `fixture.scheduled`, `fixture.rescheduled`
- Match: `match.started`, `match.event.recorded`, `match.completed`, `match.forfeited`, `match.verified`
- Medical: `injury.recorded`, `clearance.issued`
- Finance: `invoice.issued`, `payment.captured`, `payment.failed`, `payout.sent`
- Communication: `notification.dispatched`, `notification.failed`
- Content: `media.uploaded`, `media.scanned`
- AI: `ai.prediction.produced`, `ai.model.deployed`
- Security: `security.incident.detected`

**Delivery guarantees**
- At-least-once, ordered per aggregate (`subject`), deduplicable by `id`.
- Consumers must be idempotent.
- Retention on the event bus: 7 days hot, 30 days replayable.

---

# 19. Webhook Strategy

**Outbound (Touchline → partner)**
- Managed via `/webhook-subscriptions`.
- Signing: HMAC-SHA256 over raw body, header `X-Touchline-Signature: t=<ts>,v1=<hex>`.
- Replay window: 5 minutes (`t` timestamp).
- Delivery: exponential backoff (10s, 30s, 2m, 10m, 1h, 6h, 24h — 8 attempts), then dead-letter.
- Content: CloudEvents envelope (§18), UTF-8 JSON, max 256 KB.
- Idempotency: `X-Touchline-Event-Id` = event `id`.
- Manual redelivery: `POST /webhook-deliveries/{id}:redeliver`.

**Inbound (partner → Touchline)**
- Fixed path: `/api/public/webhooks/{integration}` (no auth gate).
- Verified signature per integration (Stripe-style HMAC or provider-native).
- Idempotency by provider event id.
- Timeouts: 5s hard; long work deferred to background queue with 2xx quickly.

**Subscription model**
- Filters: event `type`, tenant scope, entity subject prefix.
- Formats: `cloudevents+json` (default), `application/json` (legacy).
- Health: subscriptions auto-disabled after 100 consecutive failures; owner notified.

---

# 20. Integration Strategy

- **First-party clients:** Web (SPA/PWA), Mobile (iOS/Android), Public Portal — all consume `/v1` with bearer JWT.
- **Third-party integrations:** OAuth 2.1 Authorization Code + PKCE via managed OAuth server (§ Cloud OAuth Server); scopes: `openid email profile touchline.read.<domain> touchline.write.<domain>`.
- **AI services:** dedicated `AI_SERVICE` machine tokens; access via `/ai/*`; feature store read via internal API.
- **Enterprise SSO:** SAML/OIDC per tenant; JIT provisioning to `identity.user` + `user_role_assignment`.
- **File/data exchange:** signed URLs + async export jobs (`POST /exports`) delivering Parquet/CSV to a provided sink.
- **Message-bus consumers (future):** CDC → Kafka/NATS bridge for near-real-time analytics and downstream microservices.
- **Standards adopted:** OpenAPI 3.1, JSON Schema 2020-12, RFC-9457 Problem Details, RFC-9331 RateLimit, RFC-8594 Sunset, RFC-7396 Merge Patch, CloudEvents 1.0, OAuth 2.1, OIDC Core, SCIM 2.0 (future user provisioning), UBL (future invoicing).

---

# 21. Endpoint Catalog

> Per-endpoint spec fields: **Method**, **URL**, **Purpose**, **Params**, **Request Body**, **Response**, **Validation**, **Permission**, **Business Rules**, **Errors**, **Audit Events**. Bodies described schematically; full JSON Schemas live in the OpenAPI document.

## 21.1 Authentication (`/auth`)

| # | Method | URL | Purpose | Permission |
|---|---|---|---|---|
| A1 | POST | `/auth/sign-up` | Register email/password user (invite or self) | PUBLIC |
| A2 | POST | `/auth/sign-in` | Password sign-in; returns tokens | PUBLIC |
| A3 | POST | `/auth/sign-in/otp` | Request SMS/email OTP | PUBLIC |
| A4 | POST | `/auth/sign-in/otp/verify` | Verify OTP → tokens | PUBLIC |
| A5 | POST | `/auth/oauth/{provider}/start` | Begin OAuth (google/apple) | PUBLIC |
| A6 | POST | `/auth/oauth/callback` | OAuth callback → session | PUBLIC |
| A7 | POST | `/auth/refresh` | Rotate access token | PUBLIC (with refresh) |
| A8 | POST | `/auth/sign-out` | Revoke session | AUTH |
| A9 | POST | `/auth/password/forgot` | Request reset email | PUBLIC |
| A10 | POST | `/auth/password/reset` | Complete reset | PUBLIC (token) |
| A11 | POST | `/auth/mfa/enroll` | Start MFA enrollment | AUTH |
| A12 | POST | `/auth/mfa/verify` | Confirm MFA factor | AUTH |
| A13 | DELETE | `/auth/mfa/{factorId}` | Remove factor | AUTH + step-up |
| A14 | GET | `/auth/me` | Current identity + roles | AUTH |
| A15 | GET | `/auth/sessions` | List active sessions | AUTH |
| A16 | DELETE | `/auth/sessions/{id}` | Revoke session | AUTH |

**Representative detail — A2 `POST /auth/sign-in`**
- **Request:** `{ email, password, deviceInfo }`
- **Response 200:** `{ data: { accessToken, refreshToken, expiresIn, user, mfaRequired } }`
- **Validation:** email RFC5322, password min 12 chars (leaked-password check enabled).
- **Business Rules:** lockout after 5 failed attempts / 15 min; MFA challenge when policy requires.
- **Errors:** `AUTH_INVALID_CREDENTIALS` (401), `AUTH_LOCKED` (423), `AUTH_MFA_REQUIRED` (401 with `mfaChallengeId`), `RATE_LIMITED` (429).
- **Audit:** `user.sign_in.attempted`, `user.sign_in.succeeded`|`failed`.

## 21.2 Users (`/users`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/users` | List users in tenant | `user.read` |
| POST | `/users:invite` | Invite user (email + role) | `user.invite` |
| GET | `/users/{id}` | Get user | `user.read` |
| PATCH | `/users/{id}` | Update profile | Self or `user.update` |
| DELETE | `/users/{id}` | Soft delete/disable | `user.delete` |
| POST | `/users/{id}/roles` | Assign role | `role.assign` |
| DELETE | `/users/{id}/roles/{roleId}` | Revoke role | `role.assign` |
| GET | `/users/{id}/permissions` | Effective permissions | Self or `user.read` |
| POST | `/users/{id}:disable` | Lock account | `user.disable` |
| POST | `/users/{id}:enable` | Unlock account | `user.disable` |

## 21.3 Organizations (`/organizations`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/organizations` | List orgs in tenant | `org.read` |
| POST | `/organizations` | Create org | `org.create` |
| GET/PATCH/DELETE | `/organizations/{id}` | CRUD | `org.*` |
| GET | `/organizations/{id}/members` | Members | `org.read` |
| POST | `/organizations/{id}/members` | Add member | `org.member.add` |
| DELETE | `/organizations/{id}/members/{userId}` | Remove | `org.member.remove` |

## 21.4 Federations (`/federations`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/federations` | List | `federation.read` |
| POST | `/federations` | Create | `PLATFORM_OWNER` |
| GET/PATCH | `/federations/{id}` | Read/update | `federation.update` |
| GET | `/federations/{id}/associations` | Nested associations | `federation.read` |
| GET | `/federations/{id}/competitions` | Competitions | `federation.read` |
| POST | `/federations/{id}:publish-charter` | Publish rules pack | `FEDERATION_ADMIN` |

## 21.5 Associations (`/associations`)
Regional and district associations under a federation.

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/associations` | List (filter by `federationId`) | `association.read` |
| POST | `/associations` | Create | `FEDERATION_ADMIN` |
| GET/PATCH/DELETE | `/associations/{id}` | CRUD | `association.*` |
| GET | `/associations/{id}/clubs` | Clubs in scope | `association.read` |

## 21.6 Academies (`/academies`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/academies` | List | `academy.read` |
| POST | `/academies` | Create | `academy.create` |
| GET/PATCH/DELETE | `/academies/{id}` | CRUD | `academy.*` |
| GET | `/academies/{id}/branches` | Branches | `academy.read` |
| GET | `/academies/{id}/players` | Enrolled players | `academy.read` |
| GET | `/academies/{id}/programs` | Training programs | `academy.read` |

## 21.7 Football Schools — SSB (`/football-schools`)
Grassroots schools ("Sekolah Sepak Bola").

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/football-schools` | List (filter by district) | `ssb.read` |
| POST | `/football-schools` | Create | `ssb.create` |
| GET/PATCH/DELETE | `/football-schools/{id}` | CRUD | `ssb.*` |
| GET | `/football-schools/{id}/students` | Students | `ssb.read` |
| POST | `/football-schools/{id}/students:enroll` | Enroll minor (guardian consent required) | `ssb.enroll` |

## 21.8 Clubs (`/clubs`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/clubs` | List | `club.read` |
| POST | `/clubs` | Create | `club.create` |
| GET/PATCH/DELETE | `/clubs/{id}` | CRUD | `club.*` |
| GET | `/clubs/{id}/teams` | Teams | `club.read` |
| POST | `/clubs/{id}/teams` | Create team | `club.team.create` |
| GET | `/clubs/{id}/staff` | Staff list | `club.read` |
| GET | `/clubs/{id}/venues` | Venues | `club.read` |
| POST | `/clubs/{id}:verify` | Federation verification | `FEDERATION_ADMIN` |

## 21.9 Players (`/players`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/players` | List/search | `player.read` |
| POST | `/players` | Create | `player.create` |
| GET | `/players/{id}` | Detail | `player.read` |
| PATCH | `/players/{id}` | Update (concurrency via ETag) | `player.update` |
| DELETE | `/players/{id}` | Soft delete | `player.delete` |
| GET | `/players/{id}/passport` | Passport events | `player.passport.read` |
| GET | `/players/{id}/digital-id` | Digital ID + QR | Self / guardian / staff |
| POST | `/players/{id}:verify` | Trigger verification | `player.verify` |
| POST | `/players/{id}/photos` | Attach photo | `player.update` |
| GET | `/players/{id}/statistics` | Aggregated stats | `player.read` |
| GET | `/players/{id}/medical/summary` | High-level medical status | `medical.read` |
| POST | `/players/{id}:merge` | Merge duplicates | `PLATFORM_SUPPORT` |

**Representative — GET `/players/{id}`**
- **Params:** `include` (`club,team,guardian,passport`) up to 3.
- **Response 200:** `{ data: Player, meta }`; ETag header.
- **Validation:** UUID; include whitelist.
- **Permission:** `player.read` + RLS (self, guardian, club staff, federation).
- **Business Rules:** minor fields (`address`, `phone`, `school`) masked unless guardian/staff; deceased players show tombstone banner.
- **Errors:** 404 `RESOURCE_NOT_FOUND`, 403 `PERMISSION_DENIED`, 451 on public read of minor.
- **Audit:** `player.viewed` when classification ≥ `confidential`.

## 21.10 Parents / Guardians (`/guardians`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/guardians` | List | `guardian.read` |
| POST | `/guardians` | Create | `guardian.create` |
| GET/PATCH/DELETE | `/guardians/{id}` | CRUD | `guardian.*` |
| POST | `/guardians/{id}/links` | Link to player (consent flow) | `guardian.link` |
| DELETE | `/guardians/{id}/links/{playerId}` | Unlink | `guardian.link` |
| POST | `/guardians/{id}:consent` | Submit signed consent | Self |

## 21.11 Coaches (`/coaches`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/coaches` | List | `coach.read` |
| POST | `/coaches` | Create | `coach.create` |
| GET/PATCH/DELETE | `/coaches/{id}` | CRUD | `coach.*` |
| GET | `/coaches/{id}/licenses` | Licenses | `coach.read` |
| POST | `/coaches/{id}/licenses` | Add license (docs required) | `coach.update` |
| POST | `/coaches/{id}:assign-team` | Assign to team | `club.staff.assign` |

## 21.12 Medical (`/medical`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/medical/records?playerId=` | Records for a player | `medical.read` |
| POST | `/medical/records` | Create record | `medical.create` |
| GET/PATCH | `/medical/records/{id}` | Read/update | `medical.*` |
| GET | `/medical/injuries` | Injuries list | `medical.read` |
| POST | `/medical/injuries` | Record injury | `medical.create` |
| POST | `/medical/injuries/{id}:close` | Close case | `medical.update` |
| GET | `/medical/clearances` | Clearances | `medical.read` |
| POST | `/medical/clearances` | Issue clearance | `medical.clearance.issue` |
| POST | `/medical/clearances/{id}:revoke` | Revoke | `medical.clearance.issue` |

**Rules:** all endpoints require MFA step-up; PHI classification = restricted; every access audited to `pii_access_log`.

## 21.13 Referees (`/referees`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/referees` | List | `referee.read` |
| POST | `/referees` | Create | `referee.create` |
| GET/PATCH/DELETE | `/referees/{id}` | CRUD | `referee.*` |
| GET | `/referees/{id}/qualifications` | Qualifications | `referee.read` |
| GET | `/referees/{id}/availability` | Availability windows | `referee.read` |
| PUT | `/referees/{id}/availability` | Update availability | Self |
| GET | `/referees/{id}/assignments` | Assigned matches | Self / `referee.read` |

## 21.14 Scouts (`/scouts`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/scouts` | List | `scout.read` |
| POST | `/scouts` | Create | `scout.create` |
| GET/PATCH/DELETE | `/scouts/{id}` | CRUD | `scout.*` |
| GET | `/scouts/{id}/reports` | Reports authored | Self / `scout.read` |
| GET | `/scouts/{id}/watchlists` | Watchlists | Self |

## 21.15 Competitions (`/competitions`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/competitions` | List | `competition.read` |
| POST | `/competitions` | Create | `competition.create` |
| GET/PATCH/DELETE | `/competitions/{id}` | CRUD | `competition.*` |
| GET | `/competitions/{id}/editions` | Editions | `competition.read` |
| POST | `/competitions/{id}/editions` | Create edition | `competition.edition.create` |
| POST | `/competitions/{id}/editions/{editionId}:publish` | Publish rules pack + fixtures | `COMPETITION_ORGANIZER` |
| GET | `/competitions/{id}/editions/{editionId}/groups` | Groups | `competition.read` |
| POST | `/competitions/{id}/editions/{editionId}/groups` | Create group | `competition.edition.update` |
| GET | `/competitions/{id}/editions/{editionId}/rules` | Frozen rules snapshot | `competition.read` |

## 21.16 Seasons (`/seasons`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/seasons` | List | `season.read` |
| POST | `/seasons` | Create | `season.create` |
| GET/PATCH | `/seasons/{id}` | Read/update | `season.*` |
| POST | `/seasons/{id}:open` | Open registration window | `season.manage` |
| POST | `/seasons/{id}:close` | Close season | `season.manage` |

## 21.17 Registrations (`/registrations`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/registrations` | List (filters: season, club, player, status) | `registration.read` |
| POST | `/registrations` | Submit registration | `registration.create` |
| GET/PATCH | `/registrations/{id}` | Read/update | `registration.*` |
| POST | `/registrations/{id}:approve` | Approve | `registration.approve` |
| POST | `/registrations/{id}:reject` | Reject with reason | `registration.approve` |
| POST | `/registrations/{id}:revoke` | Revoke | `registration.revoke` |
| POST | `/transfers` | Initiate transfer | `transfer.create` |
| POST | `/transfers/{id}:accept` | Receiving club accepts | `transfer.accept` |
| POST | `/transfers/{id}:approve` | Federation approve | `transfer.approve` |
| POST | `/transfers/{id}:reject` | Reject | `transfer.approve` |
| POST | `/transfers/{id}/itc` | Issue/request international clearance | `transfer.itc` |

**Registration approve — rules:** verified Digital ID; guardian consent for minor; age category matches; no active dual registration; documents complete.

## 21.18 Fixtures (`/fixtures`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/fixtures` | List | `fixture.read` |
| POST | `/fixtures` | Create | `fixture.create` |
| GET/PATCH | `/fixtures/{id}` | CRUD | `fixture.*` |
| POST | `/fixtures/{id}:reschedule` | Reschedule (reason required) | `fixture.reschedule` |
| POST | `/fixtures/{id}:cancel` | Cancel | `fixture.cancel` |
| POST | `/fixtures:generate` | Auto-generate for an edition | `COMPETITION_ORGANIZER` |

## 21.19 Matches (`/matches`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/matches` | List | `match.read` |
| GET | `/matches/{id}` | Detail | `match.read` |
| POST | `/matches/{id}:start` | Kickoff | `match.control` |
| POST | `/matches/{id}:halftime` | Half-time | `match.control` |
| POST | `/matches/{id}:resume` | Resume | `match.control` |
| POST | `/matches/{id}:complete` | Full-time (verified lineups required) | `match.control` |
| POST | `/matches/{id}:forfeit` | Forfeit with reason | `match.control` |
| POST | `/matches/{id}:abandon` | Abandon | `match.control` |
| POST | `/matches/{id}:verify` | Referee/organizer verification | `match.verify` |
| GET | `/matches/{id}/report` | Official report | `match.read` |
| PUT | `/matches/{id}/report` | Submit report | `match.report` |

## 21.20 Lineups (`/matches/{id}/lineups`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/matches/{id}/lineups` | Both lineups | `match.read` |
| PUT | `/matches/{id}/lineups/{teamId}` | Submit lineup | `match.lineup.submit` |
| POST | `/matches/{id}/lineups/{teamId}:verify` | Verify via QR/ID scan | `match.lineup.verify` |
| POST | `/matches/{id}/lineups/{teamId}/substitutions` | Record substitution | `match.event.create` |

**Rules:** every listed player must have a valid registration and Digital ID; verification checks photo + document; audit event per player scanned.

## 21.21 Match Events (`/matches/{id}/events`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/matches/{id}/events` | List (paged, keyset) | `match.read` |
| POST | `/matches/{id}/events` | Record event (idempotent) | `match.event.create` |
| POST | `/matches/{id}/events/{eventId}:reverse` | Correct a prior event | `match.event.correct` |
| POST | `/matches/{id}/events:batch` | Bulk sync (offline capture) | `match.event.create` |

**Rules:** append-only; corrections via reversal; `Idempotency-Key` mandatory (or `clientEventId` in body for batch); offline batch max 500.

## 21.22 Training (`/training`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/training/programs` | List programs | `training.read` |
| POST | `/training/programs` | Create | `training.create` |
| GET/PATCH/DELETE | `/training/programs/{id}` | CRUD | `training.*` |
| GET | `/training/sessions` | List sessions | `training.read` |
| POST | `/training/sessions` | Schedule session | `training.create` |
| POST | `/training/sessions/{id}:start` | Start session | `training.control` |
| POST | `/training/sessions/{id}:complete` | Complete session | `training.control` |
| GET | `/training/sessions/{id}/drills` | Drills | `training.read` |

## 21.23 Attendance (`/attendance`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/attendance?sessionId=` | List | `training.read` |
| POST | `/attendance` | Record attendance (QR/bulk) | `training.attendance.create` |
| PATCH | `/attendance/{id}` | Adjust | `training.attendance.update` |
| POST | `/attendance:bulk` | Bulk mark team | `training.attendance.create` |

## 21.24 Statistics (`/statistics`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/statistics/players/{id}` | Aggregated player stats | `player.read` |
| GET | `/statistics/teams/{id}` | Team stats | `club.read` |
| GET | `/statistics/competitions/{editionId}` | Competition stats | `competition.read` |
| GET | `/statistics/top-scorers?editionId=` | Leaderboards | `competition.read` |
| GET | `/statistics/discipline?editionId=` | Cards/suspensions | `competition.read` |

Backed by materialized views; supports `?asOf=<date>`.

## 21.25 Standings (`/standings`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/standings?editionId=&groupId=` | Current standings | `competition.read` (public via `/public`) |
| GET | `/standings/history?editionId=` | Snapshots | `competition.read` |
| POST | `/standings/{editionId}:recompute` | Force recompute | `COMPETITION_ORGANIZER` |

## 21.26 Finance (`/finance`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/finance/chart-of-accounts` | CoA | `finance.read` |
| GET | `/finance/journals` | Journals | `finance.read` |
| GET | `/finance/ledger?accountId=` | Ledger entries | `finance.read` |
| GET | `/finance/wallets` | Wallets | `finance.read` |
| POST | `/finance/payouts` | Initiate payout | `finance.payout` + MFA |

## 21.27 Invoices (`/invoices`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/invoices` | List (filters: status, party, dueDate) | `finance.invoice.read` |
| POST | `/invoices` | Create | `finance.invoice.create` |
| GET | `/invoices/{id}` | Detail | `finance.invoice.read` |
| POST | `/invoices/{id}:issue` | Issue (freezes content) | `finance.invoice.issue` |
| POST | `/invoices/{id}:void` | Void (before payment) | `finance.invoice.void` |
| POST | `/invoices/{id}:credit-note` | Credit correction | `finance.invoice.credit` |
| GET | `/invoices/{id}/pdf` | Rendered PDF (signed URL) | `finance.invoice.read` |

## 21.28 Payments (`/payments`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/payments` | List | `finance.payment.read` |
| POST | `/payments:intent` | Create payment intent (gateway) | `finance.payment.create` |
| POST | `/payments/{id}:capture` | Capture | `finance.payment.capture` |
| POST | `/payments/{id}:refund` | Refund | `finance.payment.refund` + MFA |
| POST | `/payments/{id}:dispute` | Open dispute | `finance.payment.dispute` |
| GET | `/payments/{id}/allocations` | Allocations to invoices | `finance.payment.read` |

**Rules:** `Idempotency-Key` mandatory on all POSTs; gateway webhooks reconcile via `/api/public/webhooks/{gateway}`.

## 21.29 Sponsors (`/sponsors`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/sponsors` | List | `sponsor.read` |
| POST | `/sponsors` | Create | `sponsor.create` |
| GET/PATCH/DELETE | `/sponsors/{id}` | CRUD | `sponsor.*` |
| POST | `/sponsors/{id}/agreements` | Add sponsorship agreement | `sponsor.agreement.create` |
| GET | `/sponsors/{id}/placements` | Ad/logo placements | `sponsor.read` |

## 21.30 Media (`/media-assets`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| POST | `/uploads:presign` | Signed upload URL | `media.upload` |
| POST | `/media-assets/{id}:confirm` | Confirm upload | `media.upload` |
| GET | `/media-assets` | List | `media.read` |
| GET | `/media-assets/{id}` | Detail (with variants) | `media.read` |
| DELETE | `/media-assets/{id}` | Soft delete | `media.delete` |
| GET | `/media-assets/{id}/download` | Signed short-lived URL | `media.read` |
| POST | `/media-assets/{id}/tags` | Add tags | `media.update` |

## 21.31 Documents (`/documents`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/documents` | List | `document.read` |
| POST | `/documents` | Register document (post-upload) | `document.create` |
| GET | `/documents/{id}` | Metadata | `document.read` |
| POST | `/documents/{id}:sign` | Request e-signature | `document.sign` |
| GET | `/documents/{id}/signatures` | Signature status | `document.read` |
| POST | `/documents/{id}:archive` | Archive | `document.archive` |

## 21.32 Notifications (`/notifications`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/notifications` | Inbox for current user | AUTH |
| POST | `/notifications:mark-read` | Mark read (ids[]) | AUTH |
| GET | `/notifications/preferences` | Channel prefs | AUTH |
| PUT | `/notifications/preferences` | Update | AUTH |
| POST | `/notifications:dispatch` | Send (system/marketing/system) | `notification.dispatch` |
| GET | `/notifications/templates` | Templates | `notification.template.read` |
| POST | `/notifications/templates` | Create template | `notification.template.write` |

**Rules:** marketing dispatch to minors blocked at API layer (451 `LEGAL_RESTRICTED`).

## 21.33 Messaging (`/messages`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/messages/threads` | List threads | AUTH |
| POST | `/messages/threads` | Create thread | `messaging.create` |
| GET | `/messages/threads/{id}` | Thread detail | Participant |
| POST | `/messages/threads/{id}/messages` | Post message | Participant |
| POST | `/messages/threads/{id}:read` | Mark read | Participant |
| POST | `/messages/threads/{id}:archive` | Archive | Participant |

**Rules:** minor-safe channel — coach↔guardian only; direct coach↔minor blocked unless guardian present in thread.

## 21.34 Reports (`/reports`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/reports/catalog` | Available reports | `report.read` |
| POST | `/reports:run` | Run report (async) | `report.run` |
| GET | `/reports/runs/{id}` | Status | `report.read` |
| GET | `/reports/runs/{id}/download` | Signed URL to output | `report.read` |
| POST | `/reports/schedules` | Schedule | `report.schedule` |

## 21.35 Analytics (`/analytics`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/analytics/dashboards` | Dashboards for role | AUTH |
| GET | `/analytics/dashboards/{id}` | Widgets + data | AUTH |
| POST | `/analytics/query` | Ad-hoc query (whitelisted metrics/dims) | `analytics.query` |
| GET | `/analytics/exports` | Async exports | `analytics.export` |

## 21.36 AI (`/ai`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| POST | `/ai/search/players` | Semantic player search | `ai.search` |
| POST | `/ai/players/{id}/similar` | k-NN similar players | `ai.similarity` |
| POST | `/ai/predict/injury-risk` | Injury risk prediction | `ai.predict` |
| POST | `/ai/predict/match-outcome` | Outcome prediction | `ai.predict` |
| POST | `/ai/video/tag` | Auto-tag video events | `ai.video` |
| GET | `/ai/models` | Registry | `ai.read` |
| GET | `/ai/predictions/{id}` | Retrieve prediction with lineage | `ai.read` |

**Rules:** every response carries `meta.model.version` and `meta.model.explainabilityUrl`; results for minors are aggregated and never expose raw features externally.

## 21.37 Marketplace (`/marketplace`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/marketplace/listings` | Browse | `marketplace.read` |
| POST | `/marketplace/listings` | Create listing | `marketplace.list` |
| GET/PATCH/DELETE | `/marketplace/listings/{id}` | CRUD | `marketplace.*` |
| POST | `/marketplace/listings/{id}/offers` | Make offer | `marketplace.offer` |
| POST | `/marketplace/offers/{id}:accept` | Accept | `marketplace.offer.accept` |
| POST | `/marketplace/offers/{id}:reject` | Reject | `marketplace.offer.accept` |
| POST | `/marketplace/contracts` | Draft contract | `marketplace.contract.create` |
| POST | `/marketplace/contracts/{id}:sign` | Sign | `marketplace.contract.sign` |

**Rules:** minors excluded from open marketplace listings; agent representation required for professional listings; commission splits validated to sum to 100%.

## 21.38 Public Portal (`/public`)

Unauthenticated, cache-friendly, PII-safe.

| Method | URL | Purpose |
|---|---|---|
| GET | `/public/competitions` | Public competition list |
| GET | `/public/competitions/{id}` | Competition detail |
| GET | `/public/standings?editionId=` | Standings |
| GET | `/public/fixtures?editionId=` | Fixtures |
| GET | `/public/matches/{id}` | Match summary (score, events, no PII) |
| GET | `/public/clubs/{slug}` | Public club profile |
| GET | `/public/players/{slug}` | Public player profile (adult only, opt-in) |
| GET | `/public/news` | News/announcements |
| GET | `/public/sponsors` | Public sponsors |
| GET | `/public/venues/{id}` | Venue info |
| GET | `/public/search?q=` | Public search |
| GET | `/public/schema/{resource}` | JSON-LD for SEO |

**Rules:** aggressive edge cache (60–300s); minors and restricted data never returned; opt-in publication flag per player/club.

## 21.39 Settings (`/settings`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/settings/tenant` | Tenant settings | `settings.read` |
| PATCH | `/settings/tenant` | Update | `settings.update` |
| GET | `/settings/plan` | Subscription plan | `settings.read` |
| POST | `/settings/plan:change` | Change plan | `billing.manage` |
| GET | `/settings/feature-flags` | Effective flags | `settings.read` |
| GET | `/settings/webhooks` | Subscriptions | `webhook.read` |
| POST | `/settings/webhooks` | Create subscription | `webhook.manage` |
| DELETE | `/settings/webhooks/{id}` | Remove | `webhook.manage` |
| GET | `/settings/api-keys` | List keys | `apikey.read` |
| POST | `/settings/api-keys` | Create scoped key (shown once) | `apikey.manage` |
| DELETE | `/settings/api-keys/{id}` | Revoke | `apikey.manage` |
| GET | `/settings/roles` | Roles | `settings.read` |
| GET | `/settings/permissions` | Permission catalog | `settings.read` |

## 21.40 Audit Logs (`/audit-log`)

| Method | URL | Purpose | Permission |
|---|---|---|---|
| GET | `/audit-log` | Query (filters: actor, action, entity, tenant, time) | `audit.read` |
| GET | `/audit-log/{id}` | Detail | `audit.read` |
| POST | `/audit-log:export` | Async export (signed URL) | `audit.export` |
| GET | `/audit-log/access` | Read-access log (PII/PHI) | `audit.access.read` |

**Rules:** justification code required for restricted queries; every audit query is itself audited.

---

# 22. OpenAPI Structure

Single logical spec, physically split for maintainability.

```
openapi.yaml                    # root: info, servers, security, tag order, $ref to sections
components/
  parameters/                   # shared query/path/header parameters
  headers/                      # standard response headers
  responses/                    # 400/401/403/404/409/422/429/500 templates
  schemas/                      # canonical data schemas (Player, Club, Match, ...)
  securitySchemes/              # oauth2, bearer, apiKey, oidc
  examples/                     # request/response examples per resource
paths/
  auth/*.yaml
  users/*.yaml
  organizations/*.yaml
  federations/*.yaml
  associations/*.yaml
  academies/*.yaml
  football-schools/*.yaml
  clubs/*.yaml
  players/*.yaml
  guardians/*.yaml
  coaches/*.yaml
  medical/*.yaml
  referees/*.yaml
  scouts/*.yaml
  competitions/*.yaml
  seasons/*.yaml
  registrations/*.yaml
  fixtures/*.yaml
  matches/*.yaml
  training/*.yaml
  attendance/*.yaml
  statistics/*.yaml
  standings/*.yaml
  finance/*.yaml
  invoices/*.yaml
  payments/*.yaml
  sponsors/*.yaml
  media/*.yaml
  documents/*.yaml
  notifications/*.yaml
  messages/*.yaml
  reports/*.yaml
  analytics/*.yaml
  ai/*.yaml
  marketplace/*.yaml
  public/*.yaml
  settings/*.yaml
  audit-log/*.yaml
tags.yaml                       # tag order + descriptions
webhooks.yaml                   # outbound webhook event schemas (OpenAPI 3.1 webhooks section)
```

- **Vendor extensions:** `x-required-permission`, `x-audit-event`, `x-idempotent`, `x-classification`, `x-rate-limit`, `x-feature-flag`, `x-sortable-fields`, `x-filterable-fields`, `x-sunset`.
- **Linting:** Spectral ruleset enforces naming, response envelopes, error schema, security requirement on every operation, examples on 2xx and 4xx.
- **Distribution:** `openapi.yaml` served at `GET /openapi.yaml`; SDKs generated for TS, Kotlin, Swift, Python.
- **Mocking:** Prism-based mock server per environment.
- **CI:** breaking-change detection vs previous version; SDKs and docs regenerate on every merge.

---

# 23. API Folder Structure (Server-side, logical)

> Physical implementation follows TanStack Start + Supabase, but the *logical* API surface maps 1:1 to domains, independent of framework specifics.

```
api/
  _shared/
    contracts/            # request/response DTOs mirroring OpenAPI
    validators/           # zod schemas per operation
    middleware/           # auth, tenant, rate-limit, idempotency, audit, error
    errors/               # RFC-9457 error factory + code catalog
    pagination/           # cursor codec, keyset helpers
    filters/              # RHS-bracket parser
    events/               # CloudEvents publisher
  domains/
    auth/
    users/
    organizations/
    federations/
    associations/
    academies/
    football-schools/
    clubs/
    players/
    guardians/
    coaches/
    medical/
    referees/
    scouts/
    competitions/
    seasons/
    registrations/
    fixtures/
    matches/
    lineups/
    match-events/
    training/
    attendance/
    statistics/
    standings/
    finance/
    invoices/
    payments/
    sponsors/
    media/
    documents/
    notifications/
    messages/
    reports/
    analytics/
    ai/
    marketplace/
    settings/
    audit-log/
  public/                 # /public/** anonymous, cache-first
  webhooks/
    inbound/              # /api/public/webhooks/{integration}
    outbound/             # subscription + delivery + signing
  integrations/
    payment-gateway/
    sms-provider/
    email-provider/
    identity-provider/    # SAML/OIDC per tenant
    ai-gateway/
```

Each domain folder contains: `routes/`, `services/`, `policies/`, `events/`, `openapi/`.

---

# 24. Integration Flow

**Canonical inbound flow**
```
Client → TLS → Edge (WAF, rate-limit, cache) → API Gateway (routing, auth, tenant resolve)
      → Domain Handler (validation, permission, service)
      → Data Layer (RLS-scoped Postgres)  ─┬─→ Audit Event
                                           └─→ Domain Event (CloudEvents)
                                                          ├─→ Webhook Dispatcher
                                                          ├─→ Analytics/CDC
                                                          └─→ AI Feature Pipeline
```

**Match-day resilience flow**
```
Mobile app (offline)
  → Local event buffer (idempotency keys per client event)
  → On reconnect: POST /matches/{id}/events:batch
  → Server dedup + append → domain events → live standings recompute
  → Push notifications to subscribers
```

**Third-party integration flow (OAuth Authorization Code + PKCE)**
```
Partner app → /oauth/authorize (managed) → user → /.lovable/oauth/consent (app)
   → approve → redirect with code → /oauth/token → access + refresh
   → Authorization: Bearer <token> on /v1/**  (scopes enforced)
```

**Webhook (outbound) flow**
```
Domain event → filter subscriptions → sign → HTTP POST → 2xx? done : backoff retry
                                                              └─→ dead-letter after 8 attempts
```

---

# 25. External API Strategy

**Categories & providers**
| Concern | Strategy |
|---|---|
| Payments | Provider-agnostic port; adapters for Stripe, Midtrans, local rails; webhook-in reconciliation |
| Identity | OIDC + SAML per tenant; social via managed brokers |
| SMS/OTP | Multi-provider with failover; per-country routing |
| Email | Transactional (SES/Postmark), Marketing (SendGrid/Mailchimp) segregated |
| Object storage | S3-compatible; per-tenant prefix; short-lived signed URLs |
| Video processing | Cloud media pipeline; async jobs; webhook completion |
| AI Gateway | Lovable AI Gateway for chat/embeddings/TTS/STT; per-tenant quotas |
| Maps/Geo | Provider-agnostic port; adapters for major providers |
| Regulator/Federation systems | Adapters over their proprietary formats; scheduled reconciliation |

**Principles**
- **Anti-corruption layer** per external provider — vendor DTOs never leak into domain.
- **Timeouts, retries, circuit breakers** on every outbound call.
- **Egress allowlist** enforced by proxy; no arbitrary URLs from user input.
- **Secrets** in Cloud Secrets; rotated on schedule + on incident.
- **Observability** — every outbound call emits latency, error, retry metrics with provider tag.
- **Contractual mocks** for CI so vendor outages never block builds.
- **Data residency** — provider region pinned to tenant residency.

---

# 26. Future GraphQL Readiness

- **When:** introduced only if consumer needs (mobile bandwidth, complex aggregations) justify it; REST remains primary.
- **Placement:** `/graphql` alongside `/v1`, sharing auth, RLS, and audit.
- **Schema:** generated from OpenAPI `components/schemas` + explicit relationship graph; not a raw table dump.
- **Governance:** persisted queries only in production; ad-hoc queries limited to internal tools; depth and cost limits enforced.
- **Authorization:** field-level directives derived from RBAC/ABAC; same permission catalog.
- **Subscriptions:** backed by the CloudEvents bus for match, standings, notifications.
- **Deprecation:** GraphQL fields carry `@deprecated(reason)`; sunset headers mirrored via extensions.
- **Non-goals:** GraphQL will not replace REST for third-party partners, webhooks, or public portal.

---

# 27. Future gRPC Readiness

- **When:** for internal high-throughput service-to-service traffic (event ingestion, AI feature pipelines, standings engine, video processing).
- **Placement:** internal mesh only; never exposed publicly.
- **Contracts:** `.proto` files derived from the same domain model; **REST remains the public contract**.
- **Streaming:** bidirectional streams for live match events, real-time standings, live video tagging.
- **AuthN:** mTLS between services; short-lived SPIFFE identities.
- **AuthZ:** service-level policies + row-level checks on writes.
- **Observability:** OpenTelemetry across gRPC + HTTP; correlated by `traceparent`.
- **Coexistence:** gRPC handlers and REST handlers call the same domain services; contracts diverge only in transport, never in semantics.

---

**End of Enterprise API Contract v1.0**
