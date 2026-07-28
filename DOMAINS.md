# SoccerOS — Business Domain Model (DDD Blueprint)

> Companion to `ARCHITECTURE.md`. This document defines **what the business is**, not how it is built. Every domain below is a candidate **Bounded Context**; grouping follows Domain-Driven Design (Core / Supporting / Generic).

Legend for each domain:
**Purpose · Description · Responsibilities · Roles · Submodules · Relationships · Key Business Rules**

---

## A. Strategic Classification

### Core Domains (competitive advantage — invest heavily)
Player, Digital Player ID, Player Passport, Player Registration, Player Verification, Player Transfer, Competition, League, Tournament, Season, Fixture, Match, Match Events, Lineup, Performance, Statistics, Ranking, Standings, Scouting Engine, AI Analytics.

### Supporting Domains (necessary but not differentiating — build with care)
Federation, Regional Association, Academy, Club, Coach, Manager, Medical Staff, Referee, Scout, Parent, Registration, Training, Attendance, Finance, Payments, Invoices, Sponsors, Marketplace, Reports, Public Website.

### Generic Domains (buy/adopt where possible — commodity)
Identity & Authentication, Authorization (RBAC), Platform Owner, Notifications, Messaging, Media, Gallery, Documents, Settings, Audit Logs, API.

---

## B. Domain Catalog

### CORE DOMAINS

---

### 1. Player (Core)
- **Purpose:** Represent the athlete as the atomic unit of value in the ecosystem.
- **Description:** Canonical profile of a footballer across their entire career: identity, biography, physical attributes, positions, footedness, history, affiliations.
- **Responsibilities:** Maintain lifetime profile; aggregate career history across clubs/competitions; expose consented views to third parties; own the source-of-truth relationship to `Digital Player ID` and `Player Passport`.
- **Roles:** Player, Parent (for minors), Coach (read), Scout (read w/ consent), Club Admin (read of own roster), Federation (regulatory read).
- **Submodules:** Profile, Biometrics, Career History, Positions & Preferred Foot, Injuries (link to Medical), Awards, Consents.
- **Relationships:** ← Parent (guardianship), ↔ Club/Academy (affiliation), ↔ Player Registration, ↔ Player Transfer, ↔ Player Passport, ↔ Digital Player ID, → Performance, → Statistics, → Scouting Engine.
- **Key Business Rules:**
  - One player = one canonical profile (deduplication mandatory).
  - Minors (< 18) require verified guardian consent for public visibility, transfers, and media.
  - Profile changes to regulated fields (DOB, nationality) require federation verification.
  - A player may hold multiple nationalities but exactly one *sporting* nationality per federation cycle.

---

### 2. Digital Player ID (Core)
- **Purpose:** Provide a tamper-evident, verifiable digital identifier per player usable across clubs, matches, and federations.
- **Description:** Signed credential (QR + short code) bound to a Player, revocable, re-issuable, and check-inable at venues.
- **Responsibilities:** Issue, rotate, revoke, and verify player identity at match-day and registration events; anti-fraud (photo, biometric hash, issuance chain).
- **Roles:** Federation (issuer), Referee (verifier), Club Admin (presenter), Player/Parent (holder).
- **Submodules:** Credential Issuance, Verification, Revocation, Anti-Impersonation Photo, Offline Verification Cache.
- **Relationships:** ⇐ Player, ⇐ Player Verification, → Match (eligibility check), → Player Passport.
- **Key Business Rules:**
  - Only Federation (or delegated Regional Association) can issue.
  - ID must be verifiable offline for 24h (match-day resilience).
  - Revocation is irreversible; a new ID must be issued.
  - One active ID per player per federation.

---

### 3. Player Passport (Core)
- **Purpose:** FIFA-style lifetime record of a player's clubs, transfers, competitions, and disciplinary history.
- **Description:** Append-only ledger derived from registrations, transfers, and match events.
- **Responsibilities:** Compile career timeline; enforce solidarity/training-compensation traceability; export to federations.
- **Roles:** Federation, Regional Association, Club (read), Player/Parent (read).
- **Submodules:** Career Timeline, Transfer Ledger, Disciplinary Record, Compensation Entitlements.
- **Relationships:** ⇐ Player, ⇐ Player Transfer, ⇐ Player Registration, ⇐ Match Events (cards/suspensions).
- **Key Business Rules:**
  - Append-only; no destructive edits — corrections are compensating entries.
  - Every entry must cite a source event (transfer id, match id, registration id).
  - Solidarity contributions traceable per training club per year (ages 12–23).

---

### 4. Player Registration (Core)
- **Purpose:** Legally bind a player to a club/academy for a season within a competition.
- **Description:** Season-scoped affiliation with documents, fees, medical clearance, and eligibility windows.
- **Responsibilities:** Manage registration windows; validate documents; block ineligible players; produce roster of record.
- **Roles:** Club Admin, Federation, Regional Association, Player/Parent (submit), Medical Staff (clearance).
- **Submodules:** Registration Form, Document Upload, Fee Collection, Medical Clearance, Approval Workflow.
- **Relationships:** ↔ Player, ↔ Club/Academy, ↔ Season, ↔ Competition, → Player Passport, → Finance.
- **Key Business Rules:**
  - Registration only inside federation-approved window.
  - No player may be actively registered with two clubs in the same competition.
  - Medical clearance mandatory before first match; expires per federation policy.
  - Minors require guardian signature.

---

### 5. Player Verification (Core)
- **Purpose:** Confirm the real-world identity, age, and eligibility of a player.
- **Description:** Multi-source verification: government ID, biometric photo, guardian attestation, prior federation record.
- **Responsibilities:** KYC-for-football; age verification; anti-fraud; audit trail.
- **Roles:** Federation, Regional Association, Verification Officer, Player/Parent.
- **Submodules:** Document KYC, Biometric Match, Age Assessment, Manual Review Queue.
- **Relationships:** → Digital Player ID, → Player Registration, ⇐ Player.
- **Key Business Rules:**
  - No Digital Player ID may be issued without a passed verification.
  - Age-fraud flags trigger federation review and lock affected competitions.
  - Verification decisions are logged immutably (Audit Logs).

---

### 6. Player Transfer (Core)
- **Purpose:** Move a player's registration from one club to another with legal, financial, and regulatory guarantees.
- **Description:** Workflow with offer, agreement, clearance letter, fee, and passport update.
- **Roles:** Federation, Regional Association, Club (releasing + acquiring), Player/Parent, Finance.
- **Submodules:** Transfer Request, International Clearance, Fee & Solidarity Calculation, Approval, Passport Update.
- **Relationships:** ↔ Player, ↔ Club, ↔ Player Registration, → Player Passport, → Finance, → Notifications.
- **Key Business Rules:**
  - Transfer window enforced per competition.
  - Releasing club must issue clearance; timeouts auto-escalate to federation.
  - Minors: only permitted under strict exceptions (family relocation, etc.).
  - Solidarity/training compensation auto-computed and invoiced.

---

### 7. Competition (Core, umbrella)
- **Purpose:** Abstract container for any organized football contest.
- **Description:** Parent concept specialized as League or Tournament; defines rules, eligibility, format, and calendar.
- **Roles:** Federation, Regional Association, Competition Organizer, Referee Coordinator.
- **Submodules:** Rulebook, Eligibility Rules, Format Configuration, Calendar, Disciplinary Framework.
- **Relationships:** ↔ Season, → League, → Tournament, → Fixture, → Registration, → Standings.
- **Key Business Rules:**
  - Rulebook is versioned per season; historical matches judged under their rulebook.
  - Only registered clubs/players may participate.

---

### 8. League (Core, specialization of Competition)
- **Purpose:** Round-robin (or double round-robin) competition producing standings.
- **Submodules:** Divisions, Promotion/Relegation, Points System, Head-to-Head Rules.
- **Relationships:** ← Competition, → Season, → Fixture, → Standings.
- **Key Business Rules:** Promotion/relegation and points system are declared before the season starts and are immutable during the season.

---

### 9. Tournament (Core, specialization of Competition)
- **Purpose:** Knockout, group-stage, or hybrid competition producing a champion.
- **Submodules:** Groups, Brackets, Seeding, Tie-Breakers.
- **Relationships:** ← Competition, → Fixture, → Standings.
- **Key Business Rules:** Bracket integrity is preserved; walkovers are recorded, not silently advanced.

---

### 10. Season (Core)
- **Purpose:** Temporal container binding competitions, registrations, and rulebooks.
- **Submodules:** Calendar, Windows (registration/transfer), Rulebook Version.
- **Relationships:** ↔ Competition, ↔ Player Registration, ↔ Standings.
- **Key Business Rules:** All statistics, standings, and passports are season-scoped.

---

### 11. Fixture (Core)
- **Purpose:** Scheduled instance of a match between two teams in a competition.
- **Submodules:** Scheduling, Venue Assignment, Referee Assignment, Rescheduling, Broadcast Slot.
- **Relationships:** ← Competition/League/Tournament, → Match, ↔ Referee, ↔ Venue.
- **Key Business Rules:**
  - No club may have two fixtures at overlapping times.
  - Reschedules require federation approval and audit entry.

---

### 12. Match (Core)
- **Purpose:** The played instance of a fixture — the atomic event that generates value.
- **Submodules:** Match Sheet, Officials, Weather/Pitch, Result, Sanctions, Protests.
- **Relationships:** ← Fixture, ↔ Lineup, → Match Events, → Statistics, → Standings, → Player Passport.
- **Key Business Rules:**
  - Result becomes official only after referee sign-off and protest window closure.
  - All players on the sheet must be eligible (registered, cleared, not suspended).

---

### 13. Lineup (Core)
- **Purpose:** Roster of players fielded by each club for a match, with roles.
- **Submodules:** Starting XI, Substitutes, Captain, Formation, Substitutions.
- **Relationships:** ← Match, ↔ Player, ↔ Player Registration, ↔ Digital Player ID.
- **Key Business Rules:**
  - Substitution limits enforced per rulebook.
  - Ineligible player fielded ⇒ automatic forfeit + disciplinary.

---

### 14. Match Events (Core)
- **Purpose:** Time-stamped, structured log of what happened in a match.
- **Submodules:** Goals, Cards, Substitutions, Injuries, VAR/Review, Penalties.
- **Relationships:** ← Match, → Statistics, → Player Passport, → Standings.
- **Key Business Rules:**
  - Events are append-only; corrections create compensating events with reason.
  - Cards accumulate toward suspensions per competition rules.

---

### 15. Performance (Core)
- **Purpose:** Derived per-player and per-team measures of quality and contribution.
- **Submodules:** Player Ratings, Physical Metrics (if instrumented), Position Heatmaps, Trends.
- **Relationships:** ⇐ Match Events, ⇐ Training, → Scouting Engine, → AI Analytics.
- **Key Business Rules:** Ratings are reproducible from source events; models are versioned.

---

### 16. Statistics (Core)
- **Purpose:** Raw and aggregated counts (goals, assists, minutes, xG-lite, etc.).
- **Submodules:** Per-Match, Per-Season, Per-Career, Team Stats.
- **Relationships:** ⇐ Match Events, → Standings, → Ranking, → Reports.
- **Key Business Rules:** Historical stats are frozen once the season closes.

---

### 17. Ranking (Core)
- **Purpose:** Ordered lists across players, teams, coaches — global, regional, per-age.
- **Submodules:** Player Rankings, Team Rankings, Top Scorers, Fair Play.
- **Relationships:** ⇐ Statistics, ⇐ Standings, → Public Website, → Reports.
- **Key Business Rules:** Ranking methodology is public and versioned.

---

### 18. Standings (Core)
- **Purpose:** Official table of a competition.
- **Submodules:** Points, GD, GF/GA, Tie-Break Chain, Form.
- **Relationships:** ⇐ Match, ⇐ Match Events, ← Competition/League/Tournament.
- **Key Business Rules:** Recomputed deterministically from match results; discrepancies raise alerts.

---

### 19. Scouting Engine (Core)
- **Purpose:** Discover, evaluate, and shortlist talent.
- **Submodules:** Watchlists, Evaluation Reports, Pipelines, Comparisons, Alerts.
- **Roles:** Scout, Club Manager, Academy Director, Federation talent unit.
- **Relationships:** ⇐ Player, ⇐ Performance, ⇐ Statistics, ⇐ AI Analytics, → Notifications.
- **Key Business Rules:**
  - Scouting minors requires guardian consent and federation-approved scope.
  - All evaluation reports are attributed to their author and versioned.

---

### 20. AI Analytics (Core)
- **Purpose:** Machine-learned insights on players, matches, and competitions.
- **Submodules:** Talent Prediction, Injury Risk, Style Similarity, Result Forecasting, Anomaly Detection (fraud).
- **Relationships:** ⇐ Performance, ⇐ Statistics, ⇐ Match Events, → Scouting Engine, → Reports.
- **Key Business Rules:**
  - Models are versioned; decisions cite model + inputs.
  - No fully automated adverse action on a player without human review.
  - Sensitive predictions (e.g., injury risk) are gated to Medical Staff.

---

### SUPPORTING DOMAINS

---

### 21. Federation
- **Purpose:** National governing authority modeled as a tenant of the platform.
- **Responsibilities:** Set national rulebooks; approve competitions, transfers, and registrations; issue Digital Player IDs; publish rankings.
- **Roles:** Federation Admin, Compliance Officer, Registrar, Discipline Committee.
- **Submodules:** Governance, Compliance, Discipline, Approvals, National Team Callups.
- **Relationships:** Parent of Regional Associations, oversight over Competitions, Transfers, Verification.
- **Key Business Rules:** Federation decisions are audit-logged and appealable; overrides subordinate rulebooks.

---

### 22. Regional Association
- **Purpose:** Federation delegate at state/province/district level.
- **Responsibilities:** Run regional competitions; approve local registrations; verify players; disciplinary first-instance.
- **Relationships:** ← Federation, → Clubs & Academies, → Competitions.
- **Key Business Rules:** Cannot override Federation rulebook; may add stricter local rules.

---

### 23. Academy
- **Purpose:** Youth development organization.
- **Responsibilities:** Enroll players; deliver training programs; track development; graduate to clubs.
- **Roles:** Academy Director, Coach, Medical Staff, Parent, Player.
- **Submodules:** Enrollment, Curriculum, Cohorts, Graduation, Compensation Claims.
- **Relationships:** ↔ Player, ↔ Training, ↔ Player Transfer, → Finance.
- **Key Business Rules:** Training records support future solidarity/training compensation claims.

---

### 24. Club
- **Purpose:** Competitive football organization fielding teams in competitions.
- **Responsibilities:** Manage teams, rosters, staff, fixtures, finances, media.
- **Roles:** Club Owner, Manager, Coach, Team Admin, Medical, Finance.
- **Submodules:** Teams, Roster, Staff, Facilities, Merchandising, Home Venue.
- **Relationships:** ↔ Player Registration, ↔ Player Transfer, ↔ Competition, ↔ Finance, ↔ Sponsors.
- **Key Business Rules:** A club may operate multiple teams across age groups and gender categories, each with its own roster.

---

### 25. Coach
- **Purpose:** Person responsible for team preparation and match-day decisions.
- **Responsibilities:** Design training; select lineups; evaluate players.
- **Submodules:** Certifications, Assignments, Sessions, Selections.
- **Relationships:** ↔ Team, ↔ Training, ↔ Lineup, ↔ Performance.
- **Key Business Rules:** Coaching a level requires a valid certification recognized by the federation.

---

### 26. Manager
- **Purpose:** Administrative/operational lead for a team or club.
- **Responsibilities:** Operations, logistics, roster admin, competition entries.
- **Relationships:** ↔ Club, ↔ Competition, ↔ Finance.
- **Key Business Rules:** Distinct from Coach (though may be same person); permissions differ.

---

### 27. Medical Staff
- **Purpose:** Safeguard player health and clear participation.
- **Responsibilities:** Medical assessments; injury records; return-to-play; anti-doping liaison.
- **Submodules:** Records, Clearances, Injuries, RTP Protocols.
- **Relationships:** ↔ Player, ↔ Registration (clearance), ↔ Match (injury log), → AI Analytics (injury risk).
- **Key Business Rules:** Medical data is PII+; strict role-based access, encrypted, audit-logged; retention per jurisdiction.

---

### 28. Referee
- **Purpose:** Officiate matches impartially.
- **Responsibilities:** Assignments, availability, match reports, discipline reporting.
- **Submodules:** Certifications, Availability, Assignments, Post-Match Report.
- **Relationships:** ↔ Fixture, ↔ Match, ↔ Match Events, ↔ Federation.
- **Key Business Rules:** Cannot officiate a club they are affiliated with; conflicts auto-detected.

---

### 29. Scout
- **Purpose:** Identify and report on talent.
- **Responsibilities:** Watchlists, evaluations, live reports.
- **Relationships:** ↔ Scouting Engine, ↔ Player (consented views).
- **Key Business Rules:** Scouting minors requires explicit consent and scope limits.

---

### 30. Parent (Guardian)
- **Purpose:** Legal guardian of a minor player.
- **Responsibilities:** Consent, medical authorization, registrations, communications.
- **Relationships:** ↔ Player (minor), ↔ Player Registration, ↔ Notifications.
- **Key Business Rules:** Guardianship must be verified; any action on a minor requires guardian on record.

---

### 31. Registration (generic workflow)
- **Purpose:** Reusable enrollment engine (players, teams, staff, referees, coaches).
- **Submodules:** Forms, Documents, Fees, Approvals.
- **Relationships:** Used by Player Registration, Club, Academy, Coach, Referee.
- **Key Business Rules:** Every registration has an owner, a reviewer, and an outcome log.

---

### 32. Training
- **Purpose:** Structured practice sessions and development plans.
- **Submodules:** Session Plans, Attendance, Drills, Load Management.
- **Relationships:** ↔ Team, ↔ Player, → Performance, → Attendance.
- **Key Business Rules:** Load metrics inform injury-risk models; excessive load triggers alerts.

---

### 33. Attendance
- **Purpose:** Track presence at trainings, matches, meetings.
- **Relationships:** ↔ Training, ↔ Match, → Reports.
- **Key Business Rules:** Attendance changes are timestamped and attributed.

---

### 34. Finance
- **Purpose:** Money in and out across the ecosystem.
- **Submodules:** Ledger, Budgets, Payouts, Solidarity, Tax.
- **Roles:** Finance Officer, Club Treasurer, Federation Auditor.
- **Relationships:** ↔ Payments, ↔ Invoices, ↔ Transfers, ↔ Sponsors, ↔ Marketplace.
- **Key Business Rules:** Double-entry integrity; no soft-delete; period closes are immutable.

---

### 35. Payments
- **Purpose:** Capture and process funds (fees, transfers, subscriptions).
- **Submodules:** Providers, Methods, Reconciliation, Refunds.
- **Relationships:** ↔ Finance, ↔ Invoices, ↔ Registration.
- **Key Business Rules:** PCI scope minimized via provider tokenization; every capture has a matching invoice.

---

### 36. Invoices
- **Purpose:** Formal billing artifacts with legal validity.
- **Submodules:** Templates, Numbering, Tax, Issuance, Credit Notes.
- **Relationships:** ↔ Payments, ↔ Finance.
- **Key Business Rules:** Sequential numbering per legal entity; issued invoices are immutable — corrections via credit notes.

---

### 37. Sponsors
- **Purpose:** Brands funding clubs, competitions, players.
- **Submodules:** Deals, Rights, Impressions, Reporting.
- **Relationships:** ↔ Club, ↔ Competition, ↔ Media, ↔ Finance.
- **Key Business Rules:** Sponsorship of minors follows federation and advertising-standards restrictions.

---

### 38. Marketplace
- **Purpose:** Two-sided marketplace for services and equipment (coaches for hire, gear, tryouts).
- **Submodules:** Listings, Bookings, Payouts, Reviews.
- **Relationships:** ↔ Finance, ↔ Payments, ↔ Users.
- **Key Business Rules:** Vetted sellers only; disputes routed to platform; commissions transparent.

---

### 39. Reports
- **Purpose:** Structured, exportable insights for stakeholders.
- **Submodules:** Templates, Scheduling, Distribution, Exports (PDF/CSV).
- **Relationships:** ⇐ Statistics, ⇐ Finance, ⇐ Attendance, ⇐ Standings.
- **Key Business Rules:** Reports snapshot data at generation time; regeneration produces a new versioned artifact.

---

### 40. Public Website
- **Purpose:** Public-facing content for fans, media, sponsors.
- **Submodules:** Pages, News, Fixtures, Standings, Player Pages, SEO.
- **Relationships:** ⇐ Competitions, ⇐ Standings, ⇐ Players (public consented view), ⇐ Media.
- **Key Business Rules:** Only consented, non-sensitive fields exposed; minors hidden by default.

---

### GENERIC DOMAINS

---

### 41. Identity & Authentication
- **Purpose:** Prove *who* the user is.
- **Submodules:** Sign-up, Sign-in, MFA, Sessions, Password Reset, OAuth, Magic Links.
- **Relationships:** Foundation for every other domain.
- **Key Business Rules:** Passwords checked against HIBP; MFA required for privileged roles; sessions revocable.

---

### 42. Authorization (RBAC)
- **Purpose:** Decide *what* an authenticated user may do, per tenant.
- **Submodules:** Roles, Permissions, Policies, Delegations.
- **Relationships:** Enforced in every domain via `has_permission` + RLS.
- **Key Business Rules:** Least privilege; roles stored separately from user profile; platform-staff role never available as a tenant role.

---

### 43. Platform Owner
- **Purpose:** SoccerOS operator (super-admin).
- **Responsibilities:** Onboard federations, run platform SLAs, incident response, billing to tenants.
- **Relationships:** Cross-cutting oversight (read-mostly); write only via audited runbooks.
- **Key Business Rules:** Platform-owner actions are always audit-logged and require MFA + reason.

---

### 44. Notifications
- **Purpose:** Deliver push/email/SMS messages triggered by domain events.
- **Submodules:** Channels, Templates, Preferences, Deliverability.
- **Relationships:** Consumes events from most domains.
- **Key Business Rules:** Respect user preferences and jurisdictional consent; transactional vs marketing separation.

---

### 45. Messaging
- **Purpose:** Person-to-person and group chat within the ecosystem.
- **Submodules:** Threads, Attachments, Moderation, Retention.
- **Relationships:** ↔ Users across Clubs/Academies/Teams.
- **Key Business Rules:** Coach↔minor conversations are logged and moderated; guardians have visibility rights.

---

### 46. Media & Gallery
- **Purpose:** Store and serve photos, videos, highlights.
- **Submodules:** Uploads, Transcoding, Rights, Albums, Highlights.
- **Relationships:** ↔ Match, ↔ Player, ↔ Club, ↔ Public Website.
- **Key Business Rules:** Image rights per player/parent consent; minors' media restricted by default.

---

### 47. Documents
- **Purpose:** Manage legal and administrative files (IDs, contracts, clearances).
- **Submodules:** Vault, Templates, e-Signature, Retention.
- **Relationships:** ↔ Registration, ↔ Transfer, ↔ Verification.
- **Key Business Rules:** Encrypted at rest; access is role-gated and audit-logged; retention per jurisdiction.

---

### 48. Settings
- **Purpose:** Per-tenant and per-user configuration.
- **Submodules:** Org Settings, User Preferences, Feature Flags, Branding, Locale.
- **Relationships:** Consumed by all UI/domains.
- **Key Business Rules:** Sensitive setting changes require confirmation + audit entry.

---

### 49. Audit Logs
- **Purpose:** Immutable record of security- and business-relevant events.
- **Submodules:** Event Store, Query, Export.
- **Relationships:** Written by all domains.
- **Key Business Rules:** Append-only; tamper-evident; retention meets regulatory floor.

---

### 50. API
- **Purpose:** Programmatic access for federations, clubs, partners, and integrations.
- **Submodules:** Public API, Partner API, Webhooks, Keys, Rate Limits, Versioning.
- **Relationships:** Facade over all domains under the same RBAC/RLS.
- **Key Business Rules:** SemVer'd; deprecation policy published; per-key quotas; scopes match RBAC permissions.

---

## C. Ubiquitous Language (selected terms)

Player · Guardian · Club · Academy · Federation · Regional Association · Season · Window (registration/transfer) · Competition · League · Tournament · Fixture · Match · Lineup · Event · Card · Suspension · Clearance · Passport · Digital Player ID · Verification · Transfer · Solidarity · Standings · Ranking · Watchlist · Evaluation · Session · Load · Attendance · Invoice · Ledger · Sponsorship · Consent · Roster · Tenant.

---

## D. Context Map (integration patterns)

- **Federation → Regional Association → Club/Academy:** *Customer–Supplier* (upstream sets rules).
- **Player Registration ↔ Player Passport:** *Published Language* (append-only events).
- **Match Events → Statistics → Standings → Ranking:** *Conformist / Downstream* (deterministic derivation).
- **AI Analytics ↔ Performance/Statistics:** *Open-Host Service* (analytics reads via published contracts).
- **Identity/RBAC/Audit/Notifications:** *Shared Kernel* used by all.
- **Marketplace ↔ Finance/Payments:** *Anticorruption Layer* around external providers.

---

## E. Dependency Diagram

See the companion Mermaid artifact for a visual dependency graph.

