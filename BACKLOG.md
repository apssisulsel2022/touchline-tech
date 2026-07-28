# Touchline — Enterprise Product Backlog

**Document owner:** Senior Product Owner
**Status:** v1.0 — Implementation-Ready Backlog
**Companions:** `PRD.md`, `DOMAINS.md`, `PROCESSES.md`, `ARCHITECTURE.md`
**Format:** Epic → Feature → User Story → Acceptance Criteria (GWT) → Validation → Errors → Permissions → Edge Cases → Notifications → Audit → KPIs → Points → Dependencies → Future Improvements
**Estimation scale:** Fibonacci 1, 2, 3, 5, 8, 13, 21 (>13 must be split)
**Priority scale:** P0 Must (MVP) · P1 Should (V1) · P2 Could (V2) · P3 Future

---

## Table of Contents

1. Platform Owner
2. Identity
3. RBAC
4. Federation
5. Association (Regional / Provincial / District)
6. Academy
7. Football School (SSB)
8. Club
9. Player
10. Parent / Guardian
11. Coach
12. Medical
13. Referee
14. Scout
15. Competition
16. Season
17. Registration
18. Fixture
19. Match
20. Lineup
21. Statistics
22. Training
23. Attendance
24. Performance
25. Finance
26. Payment
27. Sponsor
28. Media
29. Documents
30. Messaging
31. Notification
32. Reporting
33. AI Analytics
34. Player Passport
35. Digital Player ID
36. Marketplace
37. Public Website
38. API
39. Settings
40. Audit
41. Product Roadmap
42. MVP Features
43. Version 1 Features
44. Version 2 Features
45. Future Enterprise Features
46. Technical Debt Risks
47. Business Risks

---

# 1. Platform Owner

## EPIC: EP-OWN-01 — Platform Operations Console
- **Objective:** Give Touchline operators a single console to manage tenants, plans, quotas, uptime, incidents, and billing across the ecosystem.
- **Business Value:** Protects SLA, drives ARR, reduces support cost, enables safe multi-tenant scale.
- **Target Users:** Platform Owner, SRE, Support Lead, Finance Ops.
- **Priority:** P0
- **Dependencies:** Identity, RBAC, Tenancy, Audit, Billing.

### FEATURE: F-OWN-01.1 — Tenant Lifecycle Management
- **Purpose:** Provision, suspend, migrate, and terminate tenants (Federations, Associations, Clubs, Academies, SSBs).
- **Business Rules:**
  - A tenant is created only after signed MSA and KYC of the legal entity.
  - Suspension freezes writes but preserves reads for 30 days.
  - Termination triggers a 90-day data-export window before purge.

#### USER STORY US-OWN-01.1.1
- **As a** Platform Owner
- **I want** to provision a new Federation tenant with plan, region, locale, and admin user
- **So that** onboarding is completed in one flow with no manual DB edits.

**ACCEPTANCE CRITERIA**
- GIVEN a valid MSA reference and KYC pack
  WHEN I submit the "Create Tenant" form
  THEN a Federation tenant is created, the initial Federation Admin receives an activation email, and the tenant appears in the console with status `Active`.
- GIVEN a duplicate legal registration number
  WHEN I submit the form
  THEN creation is blocked with `TENANT_DUPLICATE_LEGAL_ID`.

**VALIDATION RULES**
- Legal name required, ≤ 200 chars.
- Country ISO-3166, currency ISO-4217, locale BCP-47 required.
- Admin email must pass RFC 5322 + HIBP breach check.

**ERROR HANDLING**
- Rollback tenant + admin user atomically on partial failure.
- Surface provider-quota errors with actionable remediation.

**PERMISSIONS**
- `platform.tenant.create` — Platform Owner only.

**EDGE CASES**
- Country not yet supported → block with `COUNTRY_NOT_SUPPORTED`.
- Admin email already owns another tenant → allow, link identity.

**NOTIFICATIONS**
- Email to admin (activation), Slack to `#ops-tenants`.

**AUDIT LOGS**
- `tenant.created`, `tenant.admin.invited` with actor, IP, payload hash.

**KPIs**
- Tenant provision time < 5 min p95; failed provisions < 1%.

**STORY POINTS:** 8
**DEPENDENCIES:** Identity, RBAC, Billing plan catalog.
**FUTURE IMPROVEMENTS:** Self-service tenant provisioning via signed federation invite.

---

### FEATURE: F-OWN-01.2 — Plans, Quotas, Feature Flags
- **Purpose:** Attach commercial plan + entitlements + kill switches to each tenant.
- **Business Rules:** Downgrades never delete data; over-quota triggers soft-block on writes only.

#### USER STORY US-OWN-01.2.1
- **As a** Platform Owner
- **I want** to change a tenant's plan and see immediate quota deltas
- **So that** commercial changes propagate without redeploys.

**ACCEPTANCE CRITERIA**
- GIVEN a tenant on `Grassroots`
  WHEN I upgrade to `Federation Pro`
  THEN entitlements activate within 60 s and the tenant admin is notified.

**VALIDATION RULES**
- Plan change requires reason code and effective date.
**ERROR HANDLING**
- If entitlement service fails, retain previous plan and alert on-call.
**PERMISSIONS**
- `platform.plan.change`.
**EDGE CASES**
- Mid-season downgrade below current usage → keep read/write for season end.
**NOTIFICATIONS**
- Email + in-app banner to tenant admins.
**AUDIT LOGS**
- `tenant.plan.changed` with before/after diff.
**KPIs**
- Entitlement propagation < 60 s p95.
**STORY POINTS:** 5
**DEPENDENCIES:** Billing, Feature Flags.
**FUTURE IMPROVEMENTS:** Usage-based billing meters.

---

### FEATURE: F-OWN-01.3 — Health, Incidents, Status Page
- **Purpose:** Real-time uptime, error-budget, and public status page per region.
#### USER STORY US-OWN-01.3.1
- **As a** Platform Owner
- **I want** an incident to be declared with severity, comms, and post-mortem tracking
**AC:** GIVEN a burn-rate alert WHEN I click "Declare Incident" THEN an incident record is created, on-call is paged, and the public status page updates within 60 s.
**Validation:** severity ∈ {SEV1..SEV4}; scope required.
**Errors:** paging failure → auto-fallback to secondary provider.
**Permissions:** `platform.incident.manage`.
**Edge Cases:** duplicate incidents auto-merged by scope hash.
**Notifications:** page on-call, email tenant admins if SEV1/2.
**Audit:** `incident.declared`, `incident.updated`, `incident.resolved`.
**KPIs:** MTTA < 5 min; MTTR < 60 min.
**Points:** 8. **Deps:** Observability. **Future:** AI-assisted RCA drafts.

---

# 2. Identity

## EPIC: EP-IAM-01 — Authentication & Session Management
- **Objective:** Secure, standards-based sign-in for all persona classes with MFA for privileged roles.
- **Business Value:** Trust, compliance, minor-safety.
- **Target Users:** All personas.
- **Priority:** P0
- **Dependencies:** Cloud Auth, RBAC, Audit.

### FEATURE: F-IAM-01.1 — Email + Password + Magic Link + OAuth
- **Business Rules:** Password ≥ 12 chars, HIBP-checked; magic-link TTL 10 min; OAuth providers per tenant.

#### USER STORY US-IAM-01.1.1
- **As a** User
- **I want** to sign in with email/password or Google
- **So that** I can access my football account securely.

**AC**
- GIVEN a verified account WHEN I submit valid credentials THEN a session is created and I land on my tenant home.
- GIVEN 5 failed attempts in 10 min WHEN I try again THEN the account is soft-locked for 15 min.

**Validation:** email RFC 5322; password strength meter.
**Errors:** generic `AUTH_INVALID` (no user-existence leak).
**Permissions:** public.
**Edge Cases:** disabled account, unverified email, tenant-suspended.
**Notifications:** new-device email; suspicious-login alert.
**Audit:** `auth.login.success`, `auth.login.failure`, `auth.lockout`.
**KPIs:** login success p95 < 800 ms; failed-login rate < 5%.
**Points:** 8. **Deps:** Cloud Auth. **Future:** Passkeys/WebAuthn.

### FEATURE: F-IAM-01.2 — MFA for Privileged Roles
#### USER STORY US-IAM-01.2.1 — Enforce TOTP for Federation Admin
**AC:** GIVEN a Federation Admin without MFA WHEN they sign in THEN they are forced into MFA enrollment before continuing.
**Validation:** TOTP RFC 6238; 6-digit; 30 s window.
**Errors:** lost-device recovery via signed operator ticket only.
**Permissions:** role-driven policy.
**Edge Cases:** clock drift ±60 s tolerated.
**Notifications:** enrollment complete email.
**Audit:** `mfa.enrolled`, `mfa.reset`.
**KPIs:** 100% privileged users with MFA active.
**Points:** 5. **Deps:** Auth. **Future:** WebAuthn primary, TOTP fallback.

### FEATURE: F-IAM-01.3 — Session & Device Management
US: view/revoke sessions. **AC:** revoking a session invalidates its refresh tokens within 30 s. **Points:** 5.

---

# 3. RBAC

## EPIC: EP-RBAC-01 — Role & Permission Engine
- **Objective:** Tenant-scoped roles with fine-grained permissions and delegated admin.
- **Business Value:** Least privilege, audit-ready, safe delegation.
- **Priority:** P0
- **Dependencies:** Identity, Tenancy.

### FEATURE: F-RBAC-01.1 — Role Assignment
**Rules:** Roles stored in a dedicated table, never on profile. All checks via `has_permission(user, permission, tenant)`.

#### USER STORY US-RBAC-01.1.1
- **As a** Federation Admin
- **I want** to grant "Competition Organizer" to a staff member scoped to one league
**AC:** GIVEN a valid target user WHEN I assign the role with scope `league:L-123` THEN the user gains only that scope and it appears in the audit log.
**Validation:** scope must exist and be within admin's own scope.
**Errors:** `RBAC_SCOPE_OUT_OF_BOUNDS`.
**Permissions:** `rbac.role.assign` within scope.
**Edge Cases:** removing last admin blocked with `LAST_ADMIN_PROTECTED`.
**Notifications:** grantee email.
**Audit:** `rbac.role.granted/revoked` with diff.
**KPIs:** privileged actions with correct scope 100%.
**Points:** 8. **Deps:** Identity. **Future:** ABAC policies.

### FEATURE: F-RBAC-01.2 — Permission Catalog & Matrix UI
US: browse & search permissions per role. **Points:** 5.

### FEATURE: F-RBAC-01.3 — Delegated Admin
US: sub-admins can manage only their subtree. **Points:** 5.

---

# 4. Federation

## EPIC: EP-FED-01 — Federation Governance Workspace
- **Objective:** Central workspace for the National Federation to govern the ecosystem.
- **Business Value:** Unified standards, national visibility, compliance.
- **Priority:** P0.
- **Dependencies:** Tenancy, RBAC, Registration, Competition, Discipline.

### FEATURE: F-FED-01.1 — Federation Profile & Rulebook
US: publish season rulebooks (immutable during season).
**AC:** GIVEN a published rulebook WHEN season is `Active` THEN edits are rejected with `RULEBOOK_LOCKED`.
**Validation:** version, effective date, PDF + structured fields.
**Permissions:** `federation.rulebook.publish`.
**Audit:** `rulebook.published`. **KPIs:** rulebook adoption 100%. **Points:** 8.

### FEATURE: F-FED-01.2 — Association Approval Workflow
US: approve/reject Associations and Clubs.
**AC:** approval requires signed statutes + KYC of officers.
**Notifications:** applicant + governance council.
**Audit:** full trail with reviewer.
**Points:** 8. **Future:** e-signature integration.

### FEATURE: F-FED-01.3 — Discipline & Appeals
US: file, review, and rule on disciplinary cases. **Points:** 13 → split by phase.

---

# 5. Association (Regional / Provincial / District)

## EPIC: EP-ASN-01 — Association Operations
- **Objective:** Enable regional bodies to run competitions, approve clubs, verify players.
- **Priority:** P0. **Dependencies:** Federation, Competition, Verification.

### FEATURE: F-ASN-01.1 — Club/Academy/SSB Registration Approval
US: review applicants inside jurisdiction.
**AC:** decisions produce audit entry + applicant notification within 24 h SLA.
**Edge Cases:** duplicate club name in same district → block with `CLUB_NAME_TAKEN`.
**Points:** 8.

### FEATURE: F-ASN-01.2 — Regional Competition Calendar
US: publish season calendar, avoid overlaps. **Points:** 8.

### FEATURE: F-ASN-01.3 — Player Verification Queue
US: verify KYC, age, guardian consent. **Points:** 13 → split.

---

# 6. Academy

## EPIC: EP-ACA-01 — Academy Operations
- **Objective:** Run enrollment, curriculum, teams, and fees for youth academies.
- **Priority:** P0. **Dependencies:** Player, Registration, Payment, Training.

### FEATURE: F-ACA-01.1 — Academy Profile & Programs
US: create programs by age band, fee, schedule. **Points:** 5.

### FEATURE: F-ACA-01.2 — Enrollment Pipeline
#### USER STORY US-ACA-01.2.1
- **As an** Academy Owner
- **I want** guardians to enroll their child online with consent and fee
**AC:** GIVEN a minor applicant WHEN guardian signs consent and pays deposit THEN player is `Enrolled` and appears in roster.
**Validation:** age band matches DOB; medical form uploaded.
**Errors:** payment failure keeps status `Pending`.
**Permissions:** `academy.enrollment.manage`.
**Edge Cases:** guardian conflict (divorce) → require both consents flag.
**Notifications:** confirmation to guardian; welcome pack.
**Audit:** `enrollment.created/approved`.
**KPIs:** enrollment completion rate ≥ 80%.
**Points:** 13 → split into intake, consent, payment. **Deps:** Payment, Documents.
**Future:** waitlist automation.

### FEATURE: F-ACA-01.3 — Curriculum Delivery Tracking
US: coaches log curriculum coverage per session. **Points:** 8.

---

# 7. Football School (SSB)

## EPIC: EP-SSB-01 — Grassroots School Operations
- **Objective:** Lightweight variant of Academy for community-based schools with volunteer staff.
- **Priority:** P0. **Dependencies:** Academy shared modules.

### FEATURE: F-SSB-01.1 — Simplified Enrollment (Guardian-Led)
US: paper-friendly onboarding via QR + phone number.
**AC:** SMS OTP enough to complete enrollment for U-8/U-10.
**Points:** 8.

### FEATURE: F-SSB-01.2 — Volunteer Coach Assignment
US: assign non-licensed coaches with training reminders. **Points:** 5.

### FEATURE: F-SSB-01.3 — Community Impact Report
US: monthly report of active players, sessions, attendance. **Points:** 5.

---

# 8. Club

## EPIC: EP-CLB-01 — Club Management
- **Objective:** Manage teams, roster, staff, competitions, and finance for clubs.
- **Priority:** P0. **Dependencies:** Player, Registration, Competition, Finance.

### FEATURE: F-CLB-01.1 — Team & Roster
US: create teams by age/gender, add/remove players.
**AC:** roster capped per rulebook; over-cap blocked.
**Audit:** `roster.updated`. **Points:** 8.

### FEATURE: F-CLB-01.2 — Staff Management
US: assign coaches, medical, managers with role scope. **Points:** 5.

### FEATURE: F-CLB-01.3 — Competition Entry
US: register team to a competition; system validates eligibility. **Points:** 8.

---

# 9. Player

## EPIC: EP-PLY-01 — Canonical Player Profile
- **Objective:** One authoritative profile per human player with career, medical, media, and stats surfaces.
- **Priority:** P0. **Dependencies:** Verification, Passport, Digital ID.

### FEATURE: F-PLY-01.1 — Profile Creation & Deduplication
#### USER STORY US-PLY-01.1.1
- **As a** Club Manager
- **I want** to create a player profile and be warned about duplicates
**AC:** GIVEN a candidate matching name+DOB+guardian WHEN I submit THEN system shows possible duplicates and requires merge or override with reason.
**Validation:** DOB ≥ 4 yrs; name normalized; photo required.
**Errors:** `PLAYER_DUPLICATE_SUSPECTED`.
**Permissions:** `player.create` within tenant.
**Edge Cases:** homonyms in same district → require guardian phone verify.
**Notifications:** guardian consent request (if minor).
**Audit:** `player.created`, `player.merged`.
**KPIs:** duplicate rate < 0.5%.
**Points:** 13 → split into intake + dedupe UI.

### FEATURE: F-PLY-01.2 — Career History
US: append-only career events (join, leave, transfer, achievements). **Points:** 8.

### FEATURE: F-PLY-01.3 — Player Public Page
US: consented public view. **Points:** 5.

---

# 10. Parent / Guardian

## EPIC: EP-GUA-01 — Guardian Portal
- **Objective:** Empower guardians to consent, pay, communicate, and monitor progress.
- **Priority:** P0. **Dependencies:** Player, Payment, Messaging.

### FEATURE: F-GUA-01.1 — Consent Management
US: sign digital consents with scope + expiry.
**AC:** every minor action requiring consent checks active scope; expired consent blocks action.
**Audit:** `consent.granted/revoked/expired`. **Points:** 8.

### FEATURE: F-GUA-01.2 — Fees & Receipts
US: view invoices, pay online, download receipts. **Points:** 5.

### FEATURE: F-GUA-01.3 — Communication & Schedules
US: view training/match schedule, message coach (moderated). **Points:** 5.

---

# 11. Coach

## EPIC: EP-COA-01 — Coach Workspace
- **Objective:** Enable coaches to plan training, run sessions, evaluate players, and select lineups.
- **Priority:** P0. **Dependencies:** Training, Attendance, Performance, Lineup.

### FEATURE: F-COA-01.1 — Session Planning
US: create plan with drills, load, duration.
**AC:** template library reusable across teams. **Points:** 8.

### FEATURE: F-COA-01.2 — Player Evaluation
US: rate players against rubric versioned per season. **Points:** 8.

### FEATURE: F-COA-01.3 — Lineup Selection
US: pick starting XI + subs against eligibility engine.
**AC:** ineligible players cannot be selected; reason shown inline. **Points:** 8.

---

# 12. Medical

## EPIC: EP-MED-01 — Medical Records & Clearance
- **Objective:** Consent-gated medical records, clearance workflow, injury/RTP tracking.
- **Priority:** P0. **Dependencies:** Player, Documents, Consent.

### FEATURE: F-MED-01.1 — Medical Clearance
US: issue clearance with expiry; block match participation on expiry.
**AC:** GIVEN expired clearance WHEN lineup includes the player THEN block with `MEDICAL_EXPIRED`. **Points:** 8.

### FEATURE: F-MED-01.2 — Injury & RTP Log
US: log injury, treatment, return-to-play stages. **Points:** 8.

### FEATURE: F-MED-01.3 — Privacy & Access Log
US: only medical role + guardian view; every read audited. **Points:** 5.

---

# 13. Referee

## EPIC: EP-REF-01 — Referee Operations
- **Objective:** Assign officials, verify players, submit digital match sheet.
- **Priority:** P0. **Dependencies:** Fixture, Match, Digital Player ID.

### FEATURE: F-REF-01.1 — Assignment & Availability
US: manage availability, receive assignments with acceptance SLA. **Points:** 8.

### FEATURE: F-REF-01.2 — Match Day Digital Sheet
#### USER STORY US-REF-01.2.1
- **As a** Referee
- **I want** to verify players by scanning Digital Player ID at kickoff
**AC:** GIVEN offline device WHEN I scan a signed ID THEN verification succeeds using cached keys (≤24 h).
**Validation:** signature valid; ID not revoked at last sync.
**Errors:** `ID_REVOKED`, `ID_EXPIRED`.
**Permissions:** referee role, scoped to fixture.
**Edge Cases:** camera fail → manual code entry with photo capture.
**Notifications:** post-match summary to both clubs.
**Audit:** `match.id.verified`, `match.sheet.submitted`.
**KPIs:** offline verification success ≥ 99%. **Points:** 13 → split verify + sheet.

### FEATURE: F-REF-01.3 — Fee Ledger
US: track payments to officials. **Points:** 5.

---

# 14. Scout

## EPIC: EP-SCT-01 — Scouting Engine
- **Objective:** Compliant discovery of talent with structured data.
- **Priority:** P1. **Dependencies:** Player, Consent, Performance, Rankings.

### FEATURE: F-SCT-01.1 — Watchlists & Evaluations
US: build lists, add notes, compare players.
**AC:** minors require active guardian scout-consent scope. **Points:** 8.

### FEATURE: F-SCT-01.2 — Report to Club
US: send structured evaluation package to club. **Points:** 5.

### FEATURE: F-SCT-01.3 — Consent-Audit Trail
US: every minor-scouting access logged and visible to guardian. **Points:** 5.

---

# 15. Competition

## EPIC: EP-CMP-01 — Competition Management
- **Objective:** Model leagues, tournaments, cups with versioned rulebooks and formats.
- **Priority:** P0. **Dependencies:** Season, Fixture, Match, Standings.

### FEATURE: F-CMP-01.1 — Competition Setup
US: create with format (league, knockout, group+knockout), tie-breakers, discipline rules. **Points:** 13 → split.

### FEATURE: F-CMP-01.2 — Team Entry & Seeding
US: manage entries, seed brackets. **Points:** 8.

### FEATURE: F-CMP-01.3 — Standings Engine
US: deterministic recompute after each event.
**AC:** recompute completes < 5 s p95 per top-tier league. **Points:** 13.

---

# 16. Season

## EPIC: EP-SEA-01 — Season Lifecycle
- **Objective:** Manage registration windows, calendars, freezes, and closures.
- **Priority:** P0.

### FEATURE: F-SEA-01.1 — Registration Windows
US: define windows per competition; enforce hard cutoffs. **Points:** 5.

### FEATURE: F-SEA-01.2 — Season Freeze & Close
US: freeze data at season end; produce archival snapshot. **Points:** 8.

### FEATURE: F-SEA-01.3 — Rollover
US: carry rosters, sponsors, staff to next season with review. **Points:** 8.

---

# 17. Registration

## EPIC: EP-REG-01 — Player Registration & Transfer
- **Objective:** Season-scoped affiliation, transfers, clearances, solidarity.
- **Priority:** P0. **Dependencies:** Player, Club, Finance, Federation.

### FEATURE: F-REG-01.1 — Player Registration
#### USER STORY US-REG-01.1.1
- **As a** Club Manager
- **I want** to register a player to a competition for the season
**AC:** GIVEN valid profile + medical + fees WHEN I submit THEN player status becomes `Registered:<season>`.
**Validation:** no active dual registration; window open; age band matches.
**Errors:** `REG_WINDOW_CLOSED`, `REG_DUAL_ACTIVE`.
**Permissions:** `club.registration.manage`.
**Edge Cases:** returning player from another federation → require ITC.
**Notifications:** player, guardian, association.
**Audit:** `registration.created/approved/rejected`.
**KPIs:** registration success rate ≥ 95%; median approval < 48 h.
**Points:** 13 → split intake, docs, approval.

### FEATURE: F-REG-01.2 — Transfer & Clearance
US: request transfer, releasing club approves or federation escalates on timeout. **Points:** 13.

### FEATURE: F-REG-01.3 — Solidarity/Training Compensation
US: auto-compute entitlements on transfer; generate invoices. **Points:** 13. **Priority:** P1.

---

# 18. Fixture

## EPIC: EP-FIX-01 — Fixture Scheduling
- **Objective:** Publish and manage fixtures with venue and officials.
- **Priority:** P0.

### FEATURE: F-FIX-01.1 — Automatic Fixture Generation
US: generate schedule from format + constraints. **Points:** 13.

### FEATURE: F-FIX-01.2 — Reschedule Workflow
US: request, approve, notify with reason and audit. **Points:** 8.

### FEATURE: F-FIX-01.3 — Officials Assignment
US: assign referees respecting availability + conflict-of-interest. **Points:** 8.

---

# 19. Match

## EPIC: EP-MTH-01 — Match Execution & Officialization
- **Priority:** P0.

### FEATURE: F-MTH-01.1 — Match Day Live
US: capture kickoff, HT, FT, events. **Points:** 13.

### FEATURE: F-MTH-01.2 — Post-Match Officialization
US: referee sign-off; protest window; official flag.
**AC:** match becomes `Official` only after referee sign + protest window closed.
**Points:** 8.

### FEATURE: F-MTH-01.3 — Protests & Disputes
US: file protest with evidence; federation adjudicates. **Points:** 13.

---

# 20. Lineup

## EPIC: EP-LNP-01 — Lineup Submission & Eligibility
- **Priority:** P0.

### FEATURE: F-LNP-01.1 — Submit Lineup
US: submit starting XI and subs before deadline.
**AC:** blocked if any player fails eligibility engine. **Points:** 8.

### FEATURE: F-LNP-01.2 — Eligibility Engine
US: server-side rule evaluation (registration, suspension, medical, age). **Points:** 13.

### FEATURE: F-LNP-01.3 — In-Match Substitutions
US: record subs with time, respect max subs rule. **Points:** 5.

---

# 21. Statistics

## EPIC: EP-STA-01 — Statistics & Standings
- **Priority:** P0.

### FEATURE: F-STA-01.1 — Match Statistics
US: goals, assists, cards, minutes, saves. **Points:** 8.

### FEATURE: F-STA-01.2 — Player/Team Aggregates
US: season aggregates with model version. **Points:** 8.

### FEATURE: F-STA-01.3 — Rankings
US: top scorers, clean sheets, fair-play. **Points:** 5. **Priority:** P1.

---

# 22. Training

## EPIC: EP-TRN-01 — Training Management
- **Priority:** P1.

### FEATURE: F-TRN-01.1 — Plan Library
US: shared drill/plan library per federation curriculum. **Points:** 8.

### FEATURE: F-TRN-01.2 — Session Execution
US: run session, record load per player. **Points:** 8.

### FEATURE: F-TRN-01.3 — Load Monitoring
US: detect overload risk; alert coach + medical. **Points:** 8. **Priority:** P2.

---

# 23. Attendance

## EPIC: EP-ATT-01 — Attendance Tracking
- **Priority:** P1.

### FEATURE: F-ATT-01.1 — Roll Call
US: mark present/late/absent with reason. **Points:** 5.

### FEATURE: F-ATT-01.2 — Guardian Excuse
US: guardian submits excuse; coach approves. **Points:** 3.

### FEATURE: F-ATT-01.3 — Attendance Analytics
US: trends per player/team. **Points:** 5.

---

# 24. Performance

## EPIC: EP-PRF-01 — Performance Evaluation
- **Priority:** P1.

### FEATURE: F-PRF-01.1 — Rubric Definition
US: federation-published rubric versions. **Points:** 5.

### FEATURE: F-PRF-01.2 — Evaluation Capture
US: coach evaluates against rubric per period. **Points:** 8.

### FEATURE: F-PRF-01.3 — Player Development Report
US: guardian-visible report card. **Points:** 5.

---

# 25. Finance

## EPIC: EP-FIN-01 — Finance Ledger
- **Priority:** P1. **Dependencies:** Payment, Registration, Sponsor.

### FEATURE: F-FIN-01.1 — Double-Entry Ledger
US: all monetary movements posted double-entry.
**AC:** trial balance always equals zero; period close immutable. **Points:** 13.

### FEATURE: F-FIN-01.2 — Invoicing
US: sequential numbering per legal entity; corrections via credit notes. **Points:** 8.

### FEATURE: F-FIN-01.3 — Financial Reports
US: P&L, cashflow, receivables per tenant. **Points:** 8.

---

# 26. Payment

## EPIC: EP-PAY-01 — Payments
- **Priority:** P1.

### FEATURE: F-PAY-01.1 — Card & Local Methods
US: pay by card + local wallets; PAN never stored.
**AC:** provider tokenization; PCI SAQ-A scope. **Points:** 13.

### FEATURE: F-PAY-01.2 — Refunds & Chargebacks
US: process refunds and manage chargebacks. **Points:** 8.

### FEATURE: F-PAY-01.3 — Payout to Clubs
US: schedule payouts with reconciliation. **Points:** 8.

---

# 27. Sponsor

## EPIC: EP-SPN-01 — Sponsor Management
- **Priority:** P2.

### FEATURE: F-SPN-01.1 — Deal & Rights
US: model rights, placements, exclusivity. **Points:** 8.

### FEATURE: F-SPN-01.2 — Placement & Brand Safety
US: enforce minor-safety rules (no alcohol/betting on minors surfaces). **Points:** 8.

### FEATURE: F-SPN-01.3 — Sponsor Reporting
US: impressions delivered vs promised. **Points:** 8.

---

# 28. Media

## EPIC: EP-MED2-01 — Media Vault
- **Priority:** P0.

### FEATURE: F-MED2-01.1 — Upload & Rights
US: upload with rights metadata; minors hidden by default. **Points:** 8.

### FEATURE: F-MED2-01.2 — Album & Publishing
US: publish albums with consent gates. **Points:** 5.

### FEATURE: F-MED2-01.3 — Transcoding & CDN
US: auto transcode + CDN delivery. **Points:** 8. **Priority:** P1.

---

# 29. Documents

## EPIC: EP-DOC-01 — Documents Vault
- **Priority:** P0.

### FEATURE: F-DOC-01.1 — Encrypted Storage
US: encrypted at rest; role-gated access. **Points:** 8.

### FEATURE: F-DOC-01.2 — Templates & E-Sign
US: consent, contracts, medical forms via templates. **Points:** 13. **Priority:** P1.

### FEATURE: F-DOC-01.3 — Access Log
US: every read/download audited. **Points:** 3.

---

# 30. Messaging

## EPIC: EP-MSG-01 — In-App Messaging
- **Priority:** P1.

### FEATURE: F-MSG-01.1 — 1:1 & Group Threads
US: coach ↔ guardian, team channels. **Points:** 8.

### FEATURE: F-MSG-01.2 — Minor-Safe Moderation
US: coach ↔ minor visible to guardian; profanity filter. **Points:** 8.

### FEATURE: F-MSG-01.3 — Attachments
US: images/docs with virus scan. **Points:** 5.

---

# 31. Notification

## EPIC: EP-NTF-01 — Notification Hub
- **Priority:** P0.

### FEATURE: F-NTF-01.1 — Channel Preferences
US: user chooses email/SMS/push per category. **Points:** 5.

### FEATURE: F-NTF-01.2 — Templates & Localization
US: localized templates with variables. **Points:** 8.

### FEATURE: F-NTF-01.3 — Delivery Analytics
US: track sent/delivered/opened/failed. **Points:** 5.

---

# 32. Reporting

## EPIC: EP-RPT-01 — Reports
- **Priority:** P1.

### FEATURE: F-RPT-01.1 — Report Catalog
US: prebuilt reports per module. **Points:** 8.

### FEATURE: F-RPT-01.2 — Scheduled & Exportable
US: schedule + CSV/PDF export; snapshots versioned. **Points:** 8.

### FEATURE: F-RPT-01.3 — Custom Query Builder
US: analyst UI over safe views. **Points:** 13. **Priority:** P2.

---

# 33. AI Analytics

## EPIC: EP-AI-01 — AI Insights
- **Priority:** P2.

### FEATURE: F-AI-01.1 — Talent Prediction
US: predict development trajectory with confidence + explainability. **Points:** 13.

### FEATURE: F-AI-01.2 — Injury Risk
US: flag risk to medical + coach. **Points:** 13.

### FEATURE: F-AI-01.3 — Style Similarity
US: find comparable players. **Points:** 8.
**Rule:** No automated adverse action without human review.

---

# 34. Player Passport

## EPIC: EP-PPT-01 — Lifetime Passport
- **Priority:** P0.

### FEATURE: F-PPT-01.1 — Append-Only Events
US: all career, medical (redacted), and disciplinary events append-only. **Points:** 8.

### FEATURE: F-PPT-01.2 — Portability
US: player can export signed passport package. **Points:** 8.

### FEATURE: F-PPT-01.3 — Corrections
US: compensating entries only, citing source event. **Points:** 5.

---

# 35. Digital Player ID

## EPIC: EP-DID-01 — Digital Player ID
- **Priority:** P0.

### FEATURE: F-DID-01.1 — Issuance
US: issue after verification; signed credential. **Points:** 8.

### FEATURE: F-DID-01.2 — Offline Verification
US: verify ≥ 24 h offline with cached keys. **Points:** 13.

### FEATURE: F-DID-01.3 — Revocation
US: revoke on fraud/expiry; propagate to caches. **Points:** 8.

---

# 36. Marketplace

## EPIC: EP-MKT-01 — Marketplace
- **Priority:** P2.

### FEATURE: F-MKT-01.1 — Coaches for Hire
US: list, book, pay licensed coaches. **Points:** 13.

### FEATURE: F-MKT-01.2 — Gear & Services
US: vendor listings with ratings. **Points:** 8.

### FEATURE: F-MKT-01.3 — Escrow & Dispute
US: hold funds until delivery confirmed. **Points:** 13.

---

# 37. Public Website

## EPIC: EP-WEB-01 — Public Surfaces
- **Priority:** P0.

### FEATURE: F-WEB-01.1 — Fixtures & Results
US: public pages per competition. **Points:** 8.

### FEATURE: F-WEB-01.2 — Player Public Pages
US: consented, minor-safe pages. **Points:** 8.

### FEATURE: F-WEB-01.3 — Federation News
US: publish articles with SEO. **Points:** 5.

---

# 38. API

## EPIC: EP-API-01 — Public API
- **Priority:** P1.

### FEATURE: F-API-01.1 — Read API v1
US: OAuth-scoped read endpoints. **Points:** 13.

### FEATURE: F-API-01.2 — Webhooks
US: subscribe to domain events. **Points:** 8.

### FEATURE: F-API-01.3 — Rate Limits & Quotas
US: per-key quotas mapped to plan. **Points:** 5.

---

# 39. Settings

## EPIC: EP-SET-01 — Settings
- **Priority:** P0.

### FEATURE: F-SET-01.1 — Tenant Branding
US: logo, colors, domain. **Points:** 5.

### FEATURE: F-SET-01.2 — Locale & Currency
US: per-tenant defaults. **Points:** 3.

### FEATURE: F-SET-01.3 — Feature Flags
US: toggle features per tenant. **Points:** 5.

---

# 40. Audit

## EPIC: EP-AUD-01 — Immutable Audit Ledger
- **Priority:** P0.

### FEATURE: F-AUD-01.1 — Event Capture
US: capture actor/action/target/tenant/IP/UA/diff. **Points:** 8.

### FEATURE: F-AUD-01.2 — Search & Export
US: query and export for compliance. **Points:** 8.

### FEATURE: F-AUD-01.3 — Tamper-Evidence
US: hash-chained records; verifier tool. **Points:** 13. **Priority:** P1.

---

# 41. Product Roadmap

- **MVP (0–6 mo):** Foundation, Identity, RBAC, Tenancy (Federation/Association/Club/Academy/SSB), Player, Guardian, Coach, Medical clearance basics, Referee digital sheet, Competition + Season + Fixture + Match + Lineup + Standings, Registration, Digital Player ID (issuance + offline verify), Passport (read-only), Notifications, Documents, Media (basic), Public Website (fixtures/standings), Audit, Settings.
- **V1 (6–12 mo):** Transfer + Solidarity, Training + Attendance + Performance, Finance + Payment + Invoicing, Sponsor basics, Scouting v1, Messaging, Reports catalog, Public API read, PWA offline match-day.
- **V2 (12–18 mo):** Rankings, advanced Statistics, Marketplace v1, Sponsor reporting, cross-federation reporting, Public API write for partners, AI Analytics phase 1.
- **V3 (18–30 mo):** AI talent/injury/style, video-assisted event tagging, LMS integrations, advanced discipline/appeals, tamper-evident audit.
- **National Scale (30–36+ mo):** All federations onboard, broadcast integrations, multi-country tenancy + RTL, FIFA/AFC interop, open-data portal.

# 42. MVP Features (P0 aggregate)
Identity + MFA, RBAC, Tenancy, Federation governance basics, Association approvals, Academy + SSB enrollment, Club roster, Player profile + dedupe, Guardian consent + fees view, Coach lineup, Medical clearance, Referee digital match sheet, Competition + Season + Fixture + Match + Lineup + Standings, Registration, Digital Player ID, Passport read-only, Notifications, Documents (encrypted), Media (upload+consent gate), Public Website (fixtures/standings/player pages), Audit, Settings.

# 43. Version 1 Features (P1 aggregate)
Transfers + Solidarity, Training, Attendance, Performance, Finance ledger, Payments, Invoices, Sponsor basics, Scouting v1, Messaging, Reports catalog, Public API v1 read, Webhooks, PWA offline match-day, Media transcoding+CDN, Rankings basics.

# 44. Version 2 Features (P2 aggregate)
Marketplace v1, Sponsor reporting suite, AI Analytics phase 1 (talent, injury, style), Custom Query Builder, Load monitoring alerts, Public API write for partners, Cross-federation reporting.

# 45. Future Enterprise Features
- FIFA Connect / AFC interoperability
- National broadcast + rights management
- Multi-country tenancy, RTL locales, regional data residency
- Referee & Coach LMS with certification
- Anti-doping case management
- Open-data portal for research/journalism
- On-device video capture with AI event tagging
- Fan communities, ticketing, e-commerce
- Federated identity across national federations
- Enterprise SSO (SAML/OIDC) for federations

# 46. Technical Debt Risks
- **TD-01** Standings engine complexity — risk of divergence between rulebook DSL and code; mitigate with property-based tests.
- **TD-02** Offline Digital ID key rotation — cache invalidation windows.
- **TD-03** Multi-tenant RLS coverage — regressions on new tables; mitigate with automated RLS test harness.
- **TD-04** Payment provider abstraction — leaky provider quirks across countries.
- **TD-05** Media pipeline cost — transcoding storage growth.
- **TD-06** AI model drift — versioning + shadow evaluation.
- **TD-07** i18n retrofits — enforce `t()` from day one.
- **TD-08** PWA cache poisoning — signed manifests, integrity checks.
- **TD-09** Audit ledger volume — partitioning + cold storage strategy.
- **TD-10** Cross-module deep imports — enforce module boundaries in CI.

# 47. Business Risks
- **BR-01** Federation political change delaying adoption — mitigate with regional pilots.
- **BR-02** Data privacy regulation for minors — consent-first defaults, DPO oversight.
- **BR-03** Low digital literacy among grassroots staff — SSB simplified flows + offline.
- **BR-04** Payment collection in cash-heavy markets — support wallets + agent networks.
- **BR-05** Sponsor brand-safety incidents involving minors — enforced placement policies.
- **BR-06** Match-day connectivity failures — offline queue + Digital ID offline verify.
- **BR-07** Discipline disputes without evidence — mandatory audit + protest windows.
- **BR-08** Talent-trafficking risk in scouting minors — consent scope + full audit.
- **BR-09** Federation lock-in objections — data export + open API commitments.
- **BR-10** Competing local incumbents — differentiate via Digital ID + Passport + interop.

---

**End of Backlog v1.0** — Total epics: 40 · Estimated MVP scope: ~ 320 points · Governance: changes to Roadmap or MVP scope require Product Council approval (see PRD §11).
