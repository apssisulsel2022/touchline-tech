# SoccerOS — Master Product Requirements Document (PRD)

**Document owner:** Chief Product Officer
**Status:** v1.0 — Source of Truth
**Companions:** `ARCHITECTURE.md`, `DOMAINS.md`
**Scope:** Nationwide Football Ecosystem Platform for grassroots and youth development.

---

## 1. Executive Summary

### 1.1 Vision
Become the digital operating system of football for a nation — the single trusted platform where every player, coach, club, academy, referee, and federation runs their football life.

### 1.2 Mission
Give grassroots and youth football professional-grade infrastructure: verifiable player identity, transparent competitions, data-driven development, and fair economics — accessible from a phone, everywhere.

### 1.3 Objectives
1. **Formalize** grassroots football with verified digital player identities and passports.
2. **Standardize** competitions, fixtures, results, and standings across regions.
3. **Empower** clubs and academies with tools they could never afford alone.
4. **Protect** minors with consent-first, guardian-aware workflows.
5. **Illuminate** talent with performance data and scouting pipelines.
6. **Sustain** the ecosystem with transparent finance, solidarity, and marketplace flows.

---

## 2. Product Goals

### 2.1 Short-Term (0–6 months, MVP)
- Tenant onboarding for **1 Federation + 3 Regional Associations**.
- Player registration, verification, and Digital Player ID issuance.
- Competitions, fixtures, match results, standings.
- Club and academy management with rosters and staff.
- Basic notifications, guardian consent, audit logging.

### 2.2 Medium-Term (6–18 months, V1–V2)
- Full transfer & clearance workflow with solidarity computation.
- Training programs, attendance, load & injury tracking.
- Performance metrics, statistics, rankings.
- Scouting engine with watchlists and evaluations.
- Payments, invoicing, sponsorships, initial marketplace.
- Public website surfaces (fixtures, standings, player pages).

### 2.3 Long-Term (18–36 months, V3 → National Scale)
- AI analytics: talent prediction, injury risk, style similarity.
- Federated interoperability with FIFA/AFC identifiers.
- National league backbone with broadcast integration.
- Multi-country tenancy and language expansion.
- Full open API + partner ecosystem.

---

## 3. Product Scope

### 3.1 In Scope
- Multi-tenant SaaS for Federation → Regional/Provincial/District → Club/Academy → Team → Player.
- Identity, RBAC, and audit for every action.
- Player Registration, Verification, Digital Player ID, Passport.
- Competition, League, Tournament, Season, Fixture, Match, Lineup, Events, Standings.
- Training, Attendance, Performance, Statistics, Ranking.
- Finance: Payments, Invoices, Solidarity, Sponsors, Marketplace basics.
- Notifications, Messaging, Media, Documents, Reports.
- Public Website surfaces and Public API.
- Mobile-first PWA (installable, offline-tolerant match day).

### 3.2 Out of Scope (initial release)
- Live video broadcasting infrastructure (integration only, not production).
- Wearables / IoT tracking hardware manufacturing.
- Ticketing and venue access control hardware.
- Betting or fantasy products.
- Full-blown ERP/HR for clubs (payroll, tax filing).
- Adult professional-league contract management beyond registrations/transfers.

### 3.3 Future Scope
- Referee academy & certification LMS.
- Coach education & licensing LMS.
- Anti-doping case management.
- Talent-export interoperability with international federations.
- Fan communities, ticketing, e-commerce.
- On-device video capture with automated event tagging.

---

## 4. User Personas

Each persona below lists: **Context · Goals · Pains · Success looks like**.

### 4.1 Platform Owner (SoccerOS operator)
- **Context:** Runs SLA, security, billing, and expansion.
- **Goals:** Uptime, tenant growth, low support cost, compliance.
- **Pains:** Multi-tenant blast radius, regulatory surprises, abuse.
- **Success:** 99.9% uptime, <1% churn, zero PII incidents.

### 4.2 Federation
- **Context:** National governing body.
- **Goals:** Governance, compliance, unified data, national team pipeline.
- **Pains:** Fragmented data, age fraud, opaque grassroots, manual paperwork.
- **Success:** Every player verified; every match reported; rankings trusted.

### 4.3 Provincial Association
- **Context:** Regional delegate of Federation.
- **Goals:** Run regional competitions, approve clubs, verify players.
- **Pains:** Paper-based registrations, disputes without evidence.
- **Success:** Digital workflows end-to-end; disputes resolved with audit trail.

### 4.4 District Association
- **Context:** Sub-regional operator.
- **Goals:** Local competitions, community engagement.
- **Pains:** Small budget, volunteer staff, tool sprawl.
- **Success:** One tool that "just works" on a phone.

### 4.5 Academy Owner
- **Context:** Runs youth development business.
- **Goals:** Enroll players, deliver curriculum, showcase graduates, get paid.
- **Pains:** Cash collection, parent communication, tracking outcomes, training-compensation claims.
- **Success:** Growing enrolment, on-time payments, alumni traceable to pro clubs.

### 4.6 Club Manager
- **Context:** Operational lead of a club with multiple teams.
- **Goals:** Field eligible teams, run competitions, manage roster/staff/finance.
- **Pains:** Eligibility mistakes, ad-hoc spreadsheets, sponsor reporting.
- **Success:** Zero ineligible-player forfeits, clean books, sponsors renewed.

### 4.7 Coach
- **Context:** Prepares team; selects lineup.
- **Goals:** Plan training, evaluate players, win matches, develop talent.
- **Pains:** No structured data on players, chasing attendance, ad-hoc comms.
- **Success:** One place for plans, attendance, performance, and lineup.

### 4.8 Parent (Guardian)
- **Context:** Legal guardian of a minor player.
- **Goals:** Enroll child, consent safely, follow progress, pay fees.
- **Pains:** Paper forms, WhatsApp chaos, unclear medical/consent status.
- **Success:** One app for consents, schedules, payments, and updates.

### 4.9 Player
- **Context:** The athlete (often a minor).
- **Goals:** Play, improve, be seen, get scouted.
- **Pains:** Invisible outside their bubble; no verifiable record.
- **Success:** Owns a portable Digital ID + Passport with real stats.

### 4.10 Referee
- **Context:** Officiates matches.
- **Goals:** Get assignments, verify players, file reports quickly.
- **Pains:** Paper match sheets, ID doubt, late payments.
- **Success:** Digital match sheet + verified players + on-time fees.

### 4.11 Scout
- **Context:** Discovers talent for clubs/national teams.
- **Goals:** Watchlists, comparable data, live reports.
- **Pains:** No structured player data, consent risks with minors.
- **Success:** Compliant scouting funnel with real numbers.

### 4.12 Medical Staff
- **Context:** Team physio/doctor.
- **Goals:** Clear players safely; track injuries and RTP.
- **Pains:** Paper records, no injury history at transfer.
- **Success:** Complete, private, portable medical record with consent gates.

### 4.13 Competition Organizer
- **Context:** Runs a league or tournament.
- **Goals:** Publish calendar, manage fixtures, produce standings, handle protests.
- **Pains:** Manual bracket math, dispute paperwork, results delays.
- **Success:** Same-day official standings; zero manual recomputation.

### 4.14 Sponsor
- **Context:** Brand funding football.
- **Goals:** Reach, brand safety, measurable exposure.
- **Pains:** No proof of impressions, minors-related brand risk.
- **Success:** Dashboards + reports proving value and safe placement.

### 4.15 Public Visitor (Fan / Media / Family)
- **Context:** Anonymous or lightly authenticated.
- **Goals:** Check fixtures, results, standings, player pages.
- **Pains:** Info scattered across social media, unreliable.
- **Success:** One authoritative destination with fast, mobile pages.

---

## 5. User Problems

Grouped by persona cluster (numbered for traceability to Section 6).

**Governance (Federation, Provincial, District)**
P01. Player identity fraud, especially age fraud.
P02. Fragmented registrations across regions.
P03. Manual, paper-based approvals and disputes.
P04. No unified competition calendar or standings.
P05. Poor grassroots visibility for national-team pipeline.
P06. Weak audit trail; appeals cannot be adjudicated with evidence.

**Clubs & Academies**
P07. Roster and eligibility errors causing forfeits.
P08. Cash-based fee collection with high leakage.
P09. No portable record when a player leaves.
P10. Cannot claim training-compensation/solidarity fairly.
P11. Sponsor reporting is ad-hoc PDFs.
P12. Compliance overhead for minors and medical clearance.

**Coaching & Development**
P13. No structured performance data on youth players.
P14. Attendance tracked on paper; load unmanaged.
P15. Selection decisions lack shared evidence.
P16. No consistent curriculum tracking.

**Parents & Players**
P17. Consent, medical, and payment flows are opaque.
P18. Communications scattered across WhatsApp/SMS.
P19. Players are invisible beyond their local club.
P20. No lifetime, portable record of their football journey.

**Officials & Scouts**
P21. Referees receive assignments late; match sheets manual.
P22. Player identity uncertain at kickoff.
P23. Scouting minors risks legal/consent breaches.
P24. No comparable, structured data across leagues.

**Medical**
P25. Records lost between clubs, seasons, transfers.
P26. Injury history not visible at registration.

**Competitions & Sponsors**
P27. Bracket/standings recomputation is manual and error-prone.
P28. Protests handled off-platform.
P29. Sponsors lack measurable, safe placement metrics.

**Public**
P30. Fans lack a single authoritative source for grassroots football.

---

## 6. Product Solutions

Traceability format: **[Pxx] → Solution**.

- **[P01, P22] Digital Player ID + Verification:** signed, revocable, offline-verifiable credential bound to KYC + biometric photo; scanned at match day.
- **[P02, P04] Multi-tenant hierarchy (Federation → Regional → Club/Academy):** shared taxonomy, single calendar, unified standings.
- **[P03, P06, P28] Digital workflows + Audit Log:** every approval, protest, and change is a versioned, attributable event.
- **[P05, P19, P24] Player Profiles + Statistics + Rankings + Scouting Engine:** every player has an authoritative page; scouts see comparable data.
- **[P07, P22] Eligibility engine on Lineup:** blocks unregistered/uncleared/suspended players before kickoff.
- **[P08, P17] Payments + Invoices + Parent portal:** digital fees, receipts, and consent all in one place.
- **[P09, P20, P25, P26] Player Passport + Medical Records (consent-gated):** portable across clubs and transfers.
- **[P10] Solidarity/Training Compensation module:** derives entitlements from registration and training history.
- **[P11, P29] Sponsor dashboards + Reports:** measurable placement, brand-safety rules for minors.
- **[P12] Guardian workflows + Minor-safe defaults:** consent required; media hidden by default; scouting scope-limited.
- **[P13, P14, P15, P16] Training + Attendance + Performance:** structured sessions, load, and evaluations feed selection.
- **[P18] Notifications + Messaging (moderated for minors):** one channel, jurisdictionally compliant.
- **[P21, P27] Fixture assignments + auto-standings:** referees notified; results propagate deterministically to tables.
- **[P23] Consent-scoped scouting:** minors require guardian scope; every access logged.
- **[P30] Public Website + API:** authoritative, SEO-optimized, mobile-first surfaces; open API for media partners.

---

## 7. Core Modules

Modules mirror the bounded contexts in `DOMAINS.md`. Grouped by capability.

### 7.1 Foundation
- **Identity & Authentication** — sign-in, MFA, sessions, OAuth.
- **Authorization (RBAC)** — roles, permissions, tenant-scoped policies.
- **Tenancy** — Federation/Regional/Club/Academy hierarchy and switching.
- **Audit Logs** — immutable event ledger.
- **Settings** — org, user, branding, locale, feature flags.
- **Notifications & Messaging** — push/email/SMS + in-app chat.
- **Documents & Media** — vault, uploads, rights management.
- **Public API** — versioned, scoped, rate-limited.

### 7.2 People
- **Player** — canonical profile & career history.
- **Parent/Guardian** — consents and delegated actions.
- **Coach / Manager / Medical / Referee / Scout** — professional profiles and assignments.
- **Digital Player ID** — issuance, verification, revocation.
- **Player Verification** — KYC, age, biometric.
- **Player Passport** — append-only lifetime record.

### 7.3 Organizations
- **Federation / Regional Association** — governance, approvals, discipline.
- **Club / Academy** — teams, roster, staff, facilities.

### 7.4 Competitions
- **Competition (umbrella) / League / Tournament / Season** — rules, calendars, formats.
- **Fixture** — scheduling, venue, officials.
- **Match / Lineup / Match Events** — the played instance and its ledger.
- **Standings / Ranking / Statistics** — deterministic derivations.

### 7.5 Development
- **Registration (generic engine)** & **Player Registration** — season-scoped affiliation.
- **Player Transfer** — offers, clearances, solidarity.
- **Training / Attendance / Performance** — plans, presence, evaluations.
- **Scouting Engine** — watchlists, evaluations, pipelines.
- **AI Analytics** — talent, risk, style, forecasting.

### 7.6 Commerce
- **Finance / Payments / Invoices** — money flows with double-entry integrity.
- **Sponsors** — deals, rights, reporting.
- **Marketplace** — services and equipment (later phase).

### 7.7 Surfaces
- **Public Website** — fixtures, standings, player pages.
- **Reports** — scheduled, exportable, versioned.

---

## 8. Functional Requirements

Requirement IDs are stable (`FR-<Area>-<n>`). Each requirement is testable.

### 8.1 Identity & RBAC
- FR-IAM-01 Users sign in via email/password, magic link, or Google OAuth.
- FR-IAM-02 Privileged roles (Federation Admin, Platform Owner) MUST enable MFA.
- FR-IAM-03 Sessions are revocable; a sign-out invalidates all tokens for that session.
- FR-RBAC-01 Every action is authorized by `has_permission(user, permission, tenant)`.
- FR-RBAC-02 Roles are tenant-scoped and stored separately from user profile.

### 8.2 Tenancy
- FR-TEN-01 A user MAY belong to multiple tenants and switch context.
- FR-TEN-02 All tenant-scoped data carries `organization_id`; server sets it, never the client.
- FR-TEN-03 Cross-tenant reads are impossible via RLS; regression tests enforce this.

### 8.3 Player, Verification, Digital ID, Passport
- FR-PLY-01 One canonical Player profile; duplicates flagged for merge.
- FR-PVR-01 Verification requires ID document + biometric photo + guardian attestation (minors).
- FR-DID-01 Digital Player ID is issued only after passed verification.
- FR-DID-02 Digital Player ID is verifiable offline for ≥24h.
- FR-PPT-01 Passport is append-only; corrections are compensating entries citing source events.

### 8.4 Registration & Transfer
- FR-REG-01 Registration allowed only within federation-approved windows.
- FR-REG-02 A player cannot be actively registered with two clubs in the same competition.
- FR-REG-03 Medical clearance required before first match; expiry enforced.
- FR-TRF-01 Transfers require releasing-club clearance; timeouts escalate to federation.
- FR-TRF-02 Solidarity and training-compensation are auto-calculated and invoiced.

### 8.5 Competitions & Matches
- FR-CMP-01 Rulebooks are versioned per season and immutable during the season.
- FR-FIX-01 A club cannot have overlapping fixtures; reschedules require approval + audit.
- FR-MTH-01 A match becomes official after referee sign-off and protest-window closure.
- FR-LNP-01 Fielding an ineligible player triggers automatic forfeit and disciplinary case.
- FR-EVT-01 Match events are append-only; cards accumulate to suspensions per rulebook.
- FR-STD-01 Standings are recomputed deterministically from events; discrepancies alert operators.

### 8.6 Training, Performance, Scouting, AI
- FR-TRN-01 Training sessions record plan, attendance, load metrics.
- FR-PRF-01 Player ratings are reproducible from source events with model version cited.
- FR-SCE-01 Scouting minors requires guardian consent with defined scope and expiry.
- FR-AI-01 No fully automated adverse action against a player without human review.

### 8.7 Finance
- FR-FIN-01 All monetary movements are double-entry; period closes are immutable.
- FR-INV-01 Invoices carry sequential numbering per legal entity; corrections use credit notes.
- FR-PAY-01 Card data is tokenized by provider; SoccerOS never stores PAN.

### 8.8 Communication, Media, Docs
- FR-NTF-01 Users control channel preferences; transactional vs marketing separated.
- FR-MSG-01 Coach ↔ minor messages are logged and visible to guardians.
- FR-MED-01 Minors' media is hidden by default; requires guardian consent to publish.
- FR-DOC-01 Legal documents are encrypted at rest with role-gated, audited access.

### 8.9 Public Surfaces & API
- FR-WEB-01 Public pages expose only consented, non-sensitive fields.
- FR-API-01 Public API is versioned (SemVer) with a 12-month deprecation policy.
- FR-API-02 Per-key quotas and scopes match RBAC permissions.

### 8.10 Reports & Audit
- FR-RPT-01 Reports snapshot data at generation time; regenerations are versioned artifacts.
- FR-AUD-01 Every security- and business-relevant event is logged, immutable, and exportable.

---

## 9. Non-Functional Requirements

### 9.1 Performance
- NFR-PERF-01 API p95 < 300 ms for read; < 600 ms for write (excl. media).
- NFR-PERF-02 Page LCP p95 < 2.5 s on 4G, mid-range Android.
- NFR-PERF-03 Standings recomputation < 5 s after a match event on a top-tier competition.

### 9.2 Scalability
- NFR-SCAL-01 Target 100k MAU, 10k concurrent sessions, 1M players, 10k organizations.
- NFR-SCAL-02 Horizontal scaling via managed platform; no in-memory session pinning.
- NFR-SCAL-03 High-volume tables partitioned monthly; hot paths use materialized views.

### 9.3 Availability
- NFR-AVL-01 Platform SLA 99.9% monthly for authenticated app.
- NFR-AVL-02 Match-day features degrade gracefully offline (lineup, ID verify, event capture queue).
- NFR-AVL-03 RPO 15 min, RTO 2 h; documented DR runbooks.

### 9.4 Security
- NFR-SEC-01 HTTPS everywhere; HSTS enforced.
- NFR-SEC-02 RLS on every tenant-scoped table; no service-role client in browser paths.
- NFR-SEC-03 Password HIBP check; MFA for privileged roles.
- NFR-SEC-04 PII and medical data encrypted at rest, access audited.
- NFR-SEC-05 Quarterly penetration test; continuous dependency and secret scanning.
- NFR-SEC-06 GDPR-style data export & deletion for users and tenants.

### 9.5 Maintainability
- NFR-MNT-01 Strict TypeScript, ESLint, Prettier enforced in CI.
- NFR-MNT-02 Module boundaries enforced (no cross-module deep imports).
- NFR-MNT-03 Forward-only, reversible-by-design migrations with ADRs for breaking changes.
- NFR-MNT-04 Test pyramid: unit + integration (Supabase test project) + e2e (Playwright).

### 9.6 Accessibility
- NFR-A11Y-01 WCAG 2.1 AA compliance for all user surfaces.
- NFR-A11Y-02 Keyboard-first navigation; visible focus; ARIA on complex widgets.
- NFR-A11Y-03 Touch targets ≥ 44px; color contrast ≥ 4.5:1.

### 9.7 Mobile First
- NFR-MOB-01 Designed at 360px baseline; scales to desktop.
- NFR-MOB-02 Match-day flows optimized for one-handed operation.
- NFR-MOB-03 Data-frugal: initial route JS < 200 KB gzipped.

### 9.8 PWA
- NFR-PWA-01 Installable (manifest + icons + theme).
- NFR-PWA-02 Service worker caches static + last-known reference data.
- NFR-PWA-03 Match-day offline queue with conflict-safe sync when back online.

### 9.9 Internationalization & Localization
- NFR-I18N-01 All strings via `t()`; default `en`; roadmap `es`, `pt`, `fr`, `ar` (RTL).
- NFR-I18N-02 Dates, numbers, currencies rendered per tenant locale.

### 9.10 Observability & Compliance
- NFR-OBS-01 Structured logs with request IDs; RUM on client.
- NFR-OBS-02 SLO dashboards; on-call paging on burn-rate.
- NFR-COMP-01 Data residency configurable per federation where required.

---

## 10. Success Metrics

### 10.1 KPIs (product outcomes)
- Verified players / total players ≥ **95%** within 12 months of federation onboarding.
- Digital Player IDs used at kickoff ≥ **90%** of official matches.
- Ineligible-player forfeits reduced by **≥80%** vs pre-platform baseline.
- Same-day official standings for **100%** of managed competitions.
- On-time fee collection ≥ **85%** across academies using the platform.

### 10.2 Business Metrics
- Federations onboarded, Regions onboarded, Clubs/Academies active.
- MAU / WAU / DAU; DAU:MAU stickiness ≥ **25%**.
- ARR by tenant tier; net revenue retention ≥ **110%**.
- Support cost per active tenant trending down QoQ.
- Sponsor-facing impressions reported vs delivered accuracy ≥ **99%**.

### 10.3 Technical Metrics
- Uptime 99.9% monthly; error budget adherence.
- API p95 latency, LCP p95, INP p95 within NFR targets.
- Change failure rate < **10%**; MTTR < **1h**.
- Critical vulns time-to-remediate < **7 days**.
- Zero cross-tenant data leaks (hard gate).

---

## 11. Future Roadmap

### 11.1 MVP (0–6 months)
- Foundation: Identity, RBAC, Tenancy, Audit, Notifications, Settings, Docs, Media.
- People: Player, Guardian, Coach, Manager, Medical, Referee.
- Identity of Play: Verification, Digital Player ID, Passport (read-only outputs).
- Organizations: Federation, Regional, Club, Academy.
- Competitions: Competition, Season, Fixture, Match, Lineup, Match Events, Standings.
- Registration: Player Registration with fees + medical clearance.
- Public Website (fixtures, standings, minimal player pages).
- Reports v0 (competitions & rosters).

### 11.2 Version 1 (6–12 months)
- Full Transfer & Clearance workflow + Solidarity/Training compensation.
- Training, Attendance, Performance, Statistics deep integration.
- Finance: Invoices, Payments (cards + local methods), Sponsors basic.
- Scouting Engine v1 (watchlists, evaluations).
- Public API v1 (read); Partner keys.
- PWA offline for match day.

### 11.3 Version 2 (12–18 months)
- Rankings (players, teams, coaches), advanced Statistics.
- Marketplace v1 (coaches for hire, gear).
- Sponsors reporting suite; brand-safety controls for minors.
- Multi-competition calendars and cross-federation reporting.
- Public API v1 (write for approved partners).

### 11.4 Version 3 (18–30 months)
- AI Analytics: talent prediction, injury risk, style similarity, result forecasting.
- Automated event-tagging assistance from video clips.
- Referee & Coach LMS integrations.
- Advanced discipline & appeals workflows.

### 11.5 National Scale (30–36+ months)
- Nationwide backbone: all federations, provinces, districts on one platform.
- Broadcast/media partner integrations.
- Multi-country tenancy; RTL locales; regional data residency.
- Interoperability with FIFA/AFC identifiers and transfer systems.
- Public open-data portal for research and journalism.

---

## Appendix A — Traceability

- Personas (§4) → Problems (§5) → Solutions (§6) → Modules (§7) → Requirements (§8).
- Requirements (§8) → Non-Functionals (§9) → Metrics (§10).
- Modules (§7) map 1:1 to Bounded Contexts in `DOMAINS.md`.
- Architecture and stack constraints live in `ARCHITECTURE.md` and are authoritative.

## Appendix B — Governance of this PRD
- **Owner:** Chief Product Officer.
- **Change control:** any change to Sections 3, 8, 9 requires an ADR + product-council approval.
- **Cadence:** reviewed at end of each version milestone (MVP, V1, V2, V3).
- **Source of truth:** this document supersedes decks, tickets, and chat threads.
