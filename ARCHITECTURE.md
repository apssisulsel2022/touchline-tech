# SoccerOS — Architecture Foundation

> Production-ready foundation for a multi-tenant, mobile-first Football Ecosystem SaaS.
> This document defines the **foundation only**. No business modules are implemented yet.

---

## 1. Overall System Architecture

**Pattern:** Modular Monolith on the frontend, Backend-as-a-Service (Supabase) with Postgres as the source of truth. Clean Architecture layering per module (Domain → Application → Infrastructure → Presentation). API-first via PostgREST + Edge Functions/Server Functions.

```text
 ┌──────────────────────────────────────────────────────────┐
 │                       Clients (PWA)                       │
 │  React + TS + Vite + Tailwind + shadcn/ui  (mobile-first) │
 └───────────────┬──────────────────────────────────────────┘
                 │  HTTPS / JSON / Realtime WS
 ┌───────────────▼──────────────────────────────────────────┐
 │                     API Layer (API-First)                 │
 │  TanStack Start server fns  │  Supabase PostgREST/Realtime│
 │  Edge Functions (webhooks, cron, integrations)            │
 └───────────────┬──────────────────────────────────────────┘
 ┌───────────────▼──────────────────────────────────────────┐
 │                Domain Layer (per module)                  │
 │  Entities · Value Objects · Domain Services · Policies    │
 └───────────────┬──────────────────────────────────────────┘
 ┌───────────────▼──────────────────────────────────────────┐
 │           Infrastructure (Supabase-backed)                │
 │  Postgres (RLS) · Auth · Storage · Realtime · pg_cron     │
 └──────────────────────────────────────────────────────────┘
```

**Cross-cutting:** Observability (logs, error reporting), Feature Flags, i18n, Audit Log, Rate Limiting (edge), Caching (TanStack Query + HTTP), Background Jobs (pg_cron + Edge Fns).

---

## 2. Folder Structure

```text
src/
  app/                     # App shell, providers, router bootstrap
  routes/                  # File-based routes (TanStack Router)
    _authenticated/        # Auth-gated subtree (managed layout)
    api/public/            # Webhooks & external HTTP endpoints
  modules/                 # Business modules (DDD bounded contexts)
    <module>/
      domain/              # Entities, VOs, domain services, types
      application/         # Use-cases, DTOs, validators (zod)
      infrastructure/      # Supabase repos, mappers, adapters
      presentation/        # Components, hooks, pages fragments
      index.ts             # Public module API (barrel)
  shared/                  # Cross-module primitives
    ui/                    # shadcn components + variants
    hooks/
    lib/                   # utils, formatters, guards
    config/                # env, constants, feature flags
    types/                 # global TS types
  integrations/
    supabase/              # generated client, types, middleware
  styles.css
supabase/
  migrations/              # SQL migrations (versioned)
  policies/                # RLS policy docs
  seed/                    # seed data (dev only)
docs/
  adr/                     # Architecture Decision Records
  api/                     # OpenAPI + module contracts
tests/
  unit/  integration/  e2e/
```

---

## 3. Module Structure (Bounded Contexts)

Planned contexts (foundation reserves namespaces; no implementation yet):

- `identity`     — users, sessions, MFA
- `tenancy`      — organizations, memberships, billing tier
- `rbac`         — roles, permissions, policies
- `clubs`        — clubs, academies, teams, staff
- `players`      — profiles, medical, consents, guardians
- `competitions` — leagues, cups, seasons, fixtures
- `matches`      — events, lineups, results, stats
- `training`     — sessions, plans, attendance
- `scouting`     — reports, evaluations, pipelines
- `finance`      — fees, invoices, payouts
- `communications` — notifications, messaging, announcements
- `media`        — assets, highlights, storage
- `analytics`    — dashboards, KPIs

Each module is independently deployable in logic (module boundary enforced by ESLint `no-restricted-imports`) and exposes only its `index.ts` public API.

---

## 4. Route Structure

```text
/                           Marketing / landing
/auth                       Sign-in, sign-up, magic link, OAuth
/onboarding                 Tenant creation & invite acceptance
/_authenticated/
  /app                      Tenant switcher / home
  /app/$orgSlug             Tenant workspace root
    /dashboard
    /clubs                  (…)
    /teams
    /players
    /competitions
    /matches
    /training
    /scouting
    /finance
    /communications
    /media
    /settings
      /organization
      /members
      /roles
      /billing
      /integrations
/admin                      Platform super-admin (staff only)
/api/public/*               Webhooks, cron, public APIs
/sitemap.xml  /robots.txt
```

Tenant scoping is URL-first (`/app/$orgSlug/...`) and validated server-side against membership.

---

## 5. State Management Strategy

| Concern              | Tool                              |
| -------------------- | --------------------------------- |
| Server/cache state   | **TanStack Query** (default)      |
| URL / routing state  | **TanStack Router** search params |
| Ephemeral UI state   | React `useState` / `useReducer`   |
| Cross-cut UI state   | **Zustand** (thin, per-slice)     |
| Forms                | **react-hook-form** + **zod**     |
| Realtime             | Supabase Realtime → query invalidation |

Rules: no global Redux; server state never duplicated in Zustand; query keys namespaced `[module, tenantId, entity, params]`.

---

## 6. Component Architecture

- **Atomic layering:** `ui/` (primitives from shadcn) → `components/` (composed) → `features/` inside each module → `pages` (route components).
- **Presentational vs Container:** hooks encapsulate data; components stay declarative.
- **Variants via CVA** on shadcn primitives; **never** hardcode colors in `className`.
- **Accessibility:** WCAG 2.1 AA; keyboard-first; Radix primitives.
- **Mobile-first:** design at 360px, scale up; touch targets ≥ 44px.

---

## 7. Database Strategy (PostgreSQL / Supabase)

- **Schema layout:** `public` (Data API surface), `app` (internal helpers), `audit` (logs), `billing`.
- **Tenant column:** every tenant-scoped table has `organization_id uuid not null` + FK + index.
- **IDs:** `uuid` PKs (`gen_random_uuid()`), `created_at`/`updated_at`/`deleted_at` (soft delete).
- **Migrations:** forward-only SQL under `supabase/migrations/`, one concern per file.
- **Grants:** every `public` table ships explicit `GRANT`s per role in the same migration.
- **RLS:** enabled on every tenant table; policies scope to membership via `app.is_member(org)`.
- **Enums:** Postgres enums for finite domains (roles, statuses).
- **Types:** generated TS types committed to `src/integrations/supabase/types.ts`.
- **Search:** `pg_trgm` + tsvector columns for player/club search.
- **Time:** all timestamps `timestamptz` in UTC; format at edge.
- **Auditing:** `audit.events` table populated by trigger for INSERT/UPDATE/DELETE on sensitive tables.

---

## 8. Security Strategy

- **AuthN:** Supabase Auth (email/password + Google OAuth via Lovable broker); optional MFA (TOTP).
- **AuthZ:** RLS + `has_permission(user, permission, org)` security-definer function.
- **Secrets:** server-only env; never `VITE_*` for secrets; service role only in edge/server contexts.
- **Transport:** HTTPS only; HSTS at hosting layer.
- **Input:** zod validation on every server function boundary.
- **Output:** explicit column projection; no `select *` on user-facing endpoints.
- **CSRF/XSS:** SameSite=Lax cookies where used; DOMPurify for any rich text.
- **Rate limiting:** per-IP + per-user token bucket at edge routes.
- **Password hygiene:** HIBP check enabled; min 12 chars.
- **Audit log:** immutable append-only; access to PII gated by role + logged.
- **PII:** encrypted-at-rest (Supabase default) + column-level encryption for medical/consent data.
- **GDPR:** data export & deletion endpoints per user & per tenant.
- **Security scans:** run in CI + on release.

---

## 9. RBAC Strategy

**Roles** (per tenant, stored in separate `user_roles` table — never on profile):

```text
enum app_role:
  owner | admin | manager | coach | scout | analyst |
  medical | finance | player | guardian | member | viewer
```

**Permissions** are fine-grained strings (`players:read`, `matches:write`, `finance:invoice:issue`) mapped to roles in `role_permissions`. Checks go through `has_permission(auth.uid(), 'x', org_id)` (SECURITY DEFINER, `search_path=public`). Platform-level `super_admin` is a separate flag on `platform_staff`, never a tenant role.

RLS pattern:

```sql
using ( app.is_member(organization_id)
        and app.has_permission(auth.uid(), 'players:read', organization_id) )
```

---

## 10. Multi-Tenant Strategy

- **Model:** shared schema, shared database, **row-level isolation** via `organization_id` + RLS. Chosen for cost & operational simplicity at nationwide scale; upgrade path to schema-per-tenant reserved for enterprise tier.
- **Tenant resolution:** `orgSlug` in URL → resolved to `organization_id` in a route `beforeLoad`, injected into router context and every query key.
- **Membership:** `memberships (user_id, organization_id, role, status)`.
- **Cross-tenant users:** a user can belong to many orgs; tenant switcher in shell.
- **Data ingress:** every insert/update sets `organization_id` from server-resolved context, never from client payload.
- **Isolation tests:** integration tests attempt cross-tenant reads and MUST fail.
- **Per-tenant config:** `organization_settings` (branding, locale, timezone, feature flags).
- **Billing:** per-organization subscription (Stripe when enabled).

---

## 11. Coding Standards

- **Language:** TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Lint/Format:** ESLint (with `boundaries` plugin for module borders) + Prettier.
- **Imports:** absolute via `@/…`; forbidden cross-module deep imports.
- **Errors:** typed `Result<T, E>` at application layer; throw only in infrastructure.
- **Validation:** zod schemas colocated with use-cases; DTOs inferred from schemas.
- **Async:** always `await`; no floating promises (`no-floating-promises` rule).
- **Comments:** explain *why*, not *what*.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:` …).
- **PRs:** small, single-purpose, checklist enforced.

---

## 12. Naming Convention

| Kind                | Convention                        | Example                    |
| ------------------- | --------------------------------- | -------------------------- |
| Files (components)  | `PascalCase.tsx`                  | `PlayerCard.tsx`           |
| Files (utils/hooks) | `kebab-case.ts` / `useThing.ts`   | `format-date.ts`           |
| Folders             | `kebab-case`                      | `player-profile/`          |
| Types/Interfaces    | `PascalCase`                      | `PlayerProfile`            |
| Enums               | `PascalCase` + singular           | `MatchStatus`              |
| Constants           | `SCREAMING_SNAKE`                 | `MAX_ROSTER_SIZE`          |
| DB tables           | `snake_case`, plural              | `player_profiles`          |
| DB columns          | `snake_case`                      | `organization_id`          |
| DB enums            | `snake_case`                      | `app_role`                 |
| Routes              | `kebab-case`                      | `/app/$org/match-reports`  |
| Query keys          | `[module, tenantId, entity, …]`   | `['players', org, 'list']` |
| Env vars            | `SCREAMING_SNAKE`, `VITE_` public | `VITE_SUPABASE_URL`        |

---

## 13. Development Guidelines

- **Branching:** trunk-based; short-lived feature branches; protected `main`.
- **Reviews:** ≥1 reviewer; CI must be green.
- **Testing pyramid:** unit (domain/app) → integration (Supabase test project) → e2e (Playwright) → visual (per shadcn variants).
- **Definition of Done:** typecheck ✓, lint ✓, tests ✓, migrations reversible ✓, RLS covered ✓, docs updated ✓, a11y checked ✓, analytics events added ✓.
- **ADRs:** any decision that changes architecture goes in `docs/adr/NNN-title.md`.
- **Feature flags:** ship dark; enable per tenant.
- **Error reporting:** all uncaught errors go through `reportLovableError`.
- **i18n:** all user-visible strings via `t()`; default `en`, plan `es`, `pt`, `fr`, `ar`.

---

## 14. Scalability Strategy

- **Read scale:** Postgres read replicas via Supabase; TanStack Query cache + HTTP `Cache-Control` on public routes; CDN for static.
- **Write scale:** partition high-volume tables (`match_events`, `audit.events`) by month; batched inserts via edge functions.
- **Hot paths:** materialized views for standings/leaderboards, refreshed by `pg_cron`.
- **Search:** trigram + GIN indexes; escalate to dedicated search (Meilisearch) when p95 > 200ms.
- **Realtime:** Supabase channels scoped per `organization_id`; fan-out capped, fallback polling.
- **Media:** Supabase Storage + CDN; image variants generated on upload via edge function.
- **Background work:** `pg_cron` → edge functions; idempotent with job ledger table.
- **Observability:** structured logs, request IDs, RUM on client, Postgres `pg_stat_statements` reviewed weekly.
- **Load targets:** 100k MAU, 10k concurrent, p95 API < 300ms, p95 page LCP < 2.5s on 4G.

---

## 15. Deployment Strategy

- **Hosting:** Vercel (frontend + server functions). Supabase managed (DB, Auth, Storage, Edge Fns).
- **Environments:** `local` → `preview` (per PR) → `staging` → `production`. Separate Supabase projects per env; no shared secrets.
- **CI/CD (GitHub Actions):**
  1. Install & cache
  2. Typecheck + lint
  3. Unit + integration tests
  4. Build
  5. Supabase migration dry-run (staging)
  6. Deploy preview / promote to prod on `main`
- **Migrations:** applied by CI via `supabase db push`; forward-only; destructive changes require an ADR + two-phase deploy (expand → contract).
- **Secrets:** Vercel + Supabase env vars; rotated quarterly.
- **Backups:** Supabase PITR (7–30 days by tier) + weekly logical dumps to cold storage.
- **DR:** documented RPO 15m / RTO 2h; runbooks in `docs/runbooks/`.
- **Release process:** semver on the app; release notes auto-generated from Conventional Commits; feature flags decouple deploy from release.
- **Monitoring:** Vercel Analytics + Sentry (or equivalent) + Supabase logs; on-call rotation with paging on SLO burn.

---

## Not In This Foundation (Explicitly Deferred)

Business modules (clubs, players, competitions, …), UI screens beyond shell, billing plans, and integrations. Those will be built on top of this foundation in subsequent milestones, one bounded context at a time.
