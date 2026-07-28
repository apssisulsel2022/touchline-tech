# SoccerOS — Business Process Blueprint

**Document owner:** Product Owner + Enterprise BA
**Status:** v1.0
**Companions:** `ARCHITECTURE.md`, `DOMAINS.md`, `PRD.md`
**Purpose:** Enterprise-grade specification of every business process end-to-end. This is the operational counterpart of the PRD and domain model.

**Conventions used for every process (BPMN-style, 15 fields):**
1. Process Name · 2. Objective · 3. Actors · 4. Trigger · 5. Preconditions · 6. Main Flow · 7. Alternative Flow · 8. Exception Flow · 9. Business Rules · 10. Data Created · 11. Data Updated · 12. Notifications · 13. Approval Flow · 14. KPIs · 15. Related Modules

Process IDs are stable (`BP-###`) for traceability from PRD `FR-*` to implementation.

---

## Part I — Onboarding & Identity Processes

---

### BP-001 · Platform Registration
1. **Process Name:** Platform Registration (SoccerOS operator side)
2. **Objective:** Provision a new nation/federation tenant on SoccerOS.
3. **Actors:** Platform Owner (SoccerOS staff), Federation Admin (prospective).
4. **Trigger:** Signed platform contract / MSA with a federation.
5. **Preconditions:** Legal entity vetted; DPA and data-residency chosen; billing plan agreed.
6. **Main Flow:**
   1. Platform Owner creates Federation tenant record (name, country, timezone, currency, locale).
   2. System provisions tenant namespace, storage bucket, and default roles/permissions.
   3. Platform Owner invites Federation Admin (email + MFA-required flag).
   4. Federation Admin completes profile, accepts DPA, enables MFA.
   5. Tenant status transitions `provisioning → active`.
7. **Alternative:** Trial tenant with expiry; sandbox tenant for training.
8. **Exception:** Duplicate country code → reject; invite bounce → resend + fallback channel.
9. **Business Rules:** One production federation tenant per country; MFA mandatory for Federation Admin; audit log entry for tenant creation.
10. **Data Created:** `organizations` (federation), `memberships`, `organization_settings`, `audit.events`.
11. **Data Updated:** Billing subscription; platform metrics counters.
12. **Notifications:** Invitation email, welcome email, audit-ops channel.
13. **Approval Flow:** Platform Owner → (internal) Legal sign-off → Provisioning.
14. **KPIs:** Time-to-provision (< 1 business day), invitation acceptance rate.
15. **Related Modules:** Platform Owner, Tenancy, Identity, RBAC, Audit, Notifications.

---

### BP-002 · Organization Registration (generic)
1. **Process Name:** Organization Registration.
2. **Objective:** Register any football organization (association, club, academy) under a parent.
3. **Actors:** Federation Admin / Regional Admin (approver), Applicant Org Admin.
4. **Trigger:** Applicant requests organization membership.
5. **Preconditions:** Applicant has an authenticated user; parent tenant exists.
6. **Main Flow:**
   1. Applicant selects org type (Association / Club / Academy) and parent.
   2. Fills profile, uploads legal documents.
   3. Pays registration fee (if configured).
   4. Approver reviews and approves/rejects.
   5. Org becomes active; Applicant becomes Org Admin.
7. **Alternative:** Import from federation legacy system (bulk).
8. **Exception:** Missing docs → returned for correction; duplicate legal ID → reject.
9. **Business Rules:** Legal ID unique per country; must inherit rulebook of parent; RBAC roles auto-seeded.
10. **Data Created:** `organizations`, `documents`, `payments`, `memberships`.
11. **Data Updated:** Parent org counters; approval workflow state.
12. **Notifications:** Submission receipt, decision, activation.
13. **Approval Flow:** Applicant → Regional Approver → Federation (if required).
14. **KPIs:** Approval SLA, rejection rate, first-time-right %.
15. **Related Modules:** Tenancy, RBAC, Documents, Payments, Notifications, Audit.

---

### BP-003 · Association Registration (Regional / Provincial / District)
1. **Objective:** Establish a Federation delegate at a sub-national level.
2. **Actors:** Federation Admin, Association Admin.
3. **Trigger:** Federation directive or application.
4. **Preconditions:** Federation active; territory not already covered.
5. **Main Flow:** Federation creates Association → assigns territory → invites Admin → Admin accepts and configures branding.
6. **Alternative:** Reorganization/merger of associations.
7. **Exception:** Overlapping territory → hard fail with map preview.
8. **Business Rules:** One association per territory per level; cannot override Federation rulebook.
9. **Data Created:** `organizations` (association), `territories`, `memberships`.
10. **Data Updated:** Federation hierarchy tree.
11. **Notifications:** Invitation, activation, hierarchy change broadcast.
12. **Approval Flow:** Federation → Association Admin acceptance.
13. **KPIs:** Coverage %, time-to-activate.
14. **Related Modules:** Federation, Regional Association, Tenancy, RBAC.

---

### BP-004 · Academy Registration
- Inherits BP-002 with academy-specific fields: curriculum, age groups, coach-to-player ratio, facilities.
- **Actors:** Academy Owner, Regional Approver.
- **Business Rules:** Coaches must hold valid certifications; safeguarding policy attached; solidarity-eligibility flag set.
- **KPIs:** Player capacity utilization, graduation rate, compliance score.
- **Related Modules:** Academy, Coach, Documents, Certification, Finance.

---

### BP-005 · Club Registration
- Inherits BP-002 with club-specific fields: colors, home venue, teams by age/gender.
- **Business Rules:** Distinct legal entity per club; sanction history considered in approval.
- **Related Modules:** Club, Documents, Sponsors, Finance.

---

### BP-006 · Coach Registration
1. **Objective:** Onboard a coach with verified certifications and club affiliations.
2. **Actors:** Coach (applicant), Club/Academy Admin, Federation (certification authority).
3. **Trigger:** Coach self-signs up or is invited.
4. **Preconditions:** Identity verified; safeguarding declaration signed.
5. **Main Flow:** Sign up → profile → upload certifications → federation verifies → club/academy assigns.
6. **Alternative:** Provisional status with grace period.
7. **Exception:** Certification unverifiable → limited role until resolved.
8. **Business Rules:** Coaching age group requires matching license level; safeguarding check mandatory for youth.
9. **Data Created:** `coach_profiles`, `certifications`, `assignments`, `documents`.
10. **Data Updated:** Club/Academy staff list; certification registry.
11. **Notifications:** Verification result, assignment, expiry reminders.
12. **Approval Flow:** Coach → Federation cert verify → Club/Academy assign.
13. **KPIs:** % certified coaches, expired-license leakage, safeguarding compliance.
14. **Related Modules:** Coach, Certification, Documents, RBAC, Notifications.

---

### BP-007 · Parent (Guardian) Registration
1. **Objective:** Establish legal guardianship of minor players.
2. **Actors:** Parent, Player (minor), Federation/Association (verifier).
3. **Trigger:** Parent invited during Player Registration OR self-signs up.
4. **Preconditions:** Legal ID capable of guardianship proof.
5. **Main Flow:** Sign up → identity verified → link to minor(s) with proof → consents captured.
6. **Alternative:** Multiple guardians per minor; delegated guardianship.
7. **Exception:** Guardianship dispute → escalate to Federation compliance.
8. **Business Rules:** Every minor must have ≥1 verified guardian; consents are versioned.
9. **Data Created:** `parent_profiles`, `guardianship_links`, `consents`.
10. **Data Updated:** Player consent status.
11. **Notifications:** Verification result, consent requests.
12. **Approval Flow:** Parent → Verifier → Link active.
13. **KPIs:** % minors with active guardian, consent completeness.
14. **Related Modules:** Parent, Player, Documents, Consent, Notifications.

---

### BP-008 · Player Registration
1. **Objective:** Bind a player to a club/academy for a season within a competition.
2. **Actors:** Player (or Parent for minor), Club/Academy Admin, Medical Staff, Federation Registrar.
3. **Trigger:** Registration window opens or transfer completed.
4. **Preconditions:** Verified identity; medical clearance current; no active same-competition registration.
5. **Main Flow:**
   1. Applicant submits registration form (season, competition, position).
   2. Uploads documents (ID, photo, guardian consent if minor).
   3. Pays fees.
   4. Medical Staff records clearance.
   5. Club submits to Federation/Association for approval.
   6. Registration activates on approval.
6. **Alternative:** Bulk import at season start; late registration with penalty.
7. **Exception:** Missing medical clearance → block first match; document rejected → returned for correction.
8. **Business Rules:** No dual-club active registration per competition; minor consent mandatory; window enforcement.
9. **Data Created:** `player_registrations`, `documents`, `payments`, `medical_clearances`.
10. **Data Updated:** Club roster; Passport (registration entry).
11. **Notifications:** Submission, decision, activation, expiry.
12. **Approval Flow:** Club → Medical → Federation Registrar.
13. **KPIs:** Approval SLA, rejection rate, on-time registration %.
14. **Related Modules:** Player Registration, Player, Medical, Documents, Payments, Passport.

---

### BP-009 · Player Verification
1. **Objective:** Confirm real identity, age, and eligibility.
2. **Actors:** Player/Parent, Verification Officer, Federation.
3. **Trigger:** Registration submission OR periodic re-verification.
4. **Preconditions:** Documents uploaded; biometric photo captured.
5. **Main Flow:** KYC checks → biometric match → age assessment → officer review → decision logged.
6. **Alternative:** Automated pass for low-risk; manual queue for edge cases.
7. **Exception:** Age fraud flag → freeze player & related registrations, notify Federation.
8. **Business Rules:** No Digital Player ID without a passed verification; decisions immutable.
9. **Data Created:** `verification_cases`, `verification_decisions`, `audit.events`.
10. **Data Updated:** Player verification status.
11. **Notifications:** Result to Player/Parent; alerts on fraud flags.
12. **Approval Flow:** System pre-check → Officer decision → Federation confirm on flags.
13. **KPIs:** Auto-pass rate, false-flag rate, fraud caught.
14. **Related Modules:** Player Verification, Documents, Digital Player ID, Audit.

---

### BP-010 · Digital Player ID Creation
1. **Objective:** Issue a tamper-evident portable player credential.
2. **Actors:** Federation (issuer), Player/Parent (holder), Referee (verifier).
3. **Trigger:** Verification passed OR ID rotation.
4. **Preconditions:** Verified Player; active registration.
5. **Main Flow:** Generate signed credential (QR + short code) → bind photo + biometric hash → publish to holder → cache for offline verify.
6. **Alternative:** Re-issue after loss/rotation.
7. **Exception:** Revocation → immediate propagation to eligibility engine.
8. **Business Rules:** One active ID per player per federation; offline-verifiable ≥24h.
9. **Data Created:** `digital_player_ids`, `id_events` (issue/rotate/revoke).
10. **Data Updated:** Player active-credential pointer.
11. **Notifications:** Holder notified; caches invalidated on revoke.
12. **Approval Flow:** Automated on verify; manual for re-issue after loss.
13. **KPIs:** Coverage %, kickoff scan rate, revocation latency.
14. **Related Modules:** Digital Player ID, Player Verification, Player.

---

### BP-011 · Player Passport
1. **Objective:** Maintain lifetime append-only career record.
2. **Actors:** System (auto), Federation (custodian), Player/Parent (viewer).
3. **Trigger:** Registration, transfer, disciplinary event, or match event affecting record.
4. **Preconditions:** Player exists.
5. **Main Flow:** Domain event emitted → passport ledger appends entry with source event id → snapshot recomputed.
6. **Alternative:** Manual custodial correction via compensating entry.
7. **Exception:** Duplicate source event → dedupe; missing source → reject entry.
8. **Business Rules:** Append-only; every entry cites source; snapshot deterministic.
9. **Data Created:** `passport_entries`.
10. **Data Updated:** `passport_snapshots` (materialized view).
11. **Notifications:** Player/Parent on new entries (opt-in).
12. **Approval Flow:** N/A (system) except for compensating entries (Federation).
13. **KPIs:** Ledger completeness, snapshot latency.
14. **Related Modules:** Player Passport, Player Registration, Transfer, Match Events.

---

### BP-012 · Player Transfer
1. **Objective:** Move a player registration between clubs with legal, financial, regulatory guarantees.
2. **Actors:** Releasing Club, Acquiring Club, Player/Parent, Federation (International/Domestic), Finance.
3. **Trigger:** Acquiring club submits transfer request.
4. **Preconditions:** Player has active registration; transfer window open.
5. **Main Flow:**
   1. Acquiring club creates offer.
   2. Player/Parent consents (minor safeguards).
   3. Releasing club issues clearance letter.
   4. Fees & solidarity computed and invoiced.
   5. Federation approves; passport updated; new registration created.
6. **Alternative:** Free agent transfer (no releasing fee); loan with return date.
7. **Exception:** Clearance timeout → escalation to Federation; minor transfer disallowed unless exception qualifies.
8. **Business Rules:** Window enforcement; minor exceptions strictly limited; solidarity auto-calculated (ages 12–23).
9. **Data Created:** `transfer_requests`, `clearances`, `invoices`, `passport_entries`, new `player_registrations`.
10. **Data Updated:** Old registration status (`terminated`), club rosters.
11. **Notifications:** All parties at each state change.
12. **Approval Flow:** Acquiring Club → Player/Parent consent → Releasing Club → Federation.
13. **KPIs:** Cycle time, clearance SLA, solidarity payout accuracy.
14. **Related Modules:** Transfer, Player Registration, Passport, Finance, Notifications.

---

## Part II — Competition Lifecycle Processes

---

### BP-013 · Season Creation
1. **Objective:** Establish the temporal container for competitions and registrations.
2. **Actors:** Federation Admin (or Association Admin as delegate).
3. **Trigger:** New season planning cycle.
4. **Preconditions:** Federation calendar approved.
5. **Main Flow:** Define season name, dates, registration & transfer windows, rulebook version → publish.
6. **Alternative:** Regional season inheriting national one.
7. **Exception:** Overlapping seasons → block or explicit exception.
8. **Business Rules:** Rulebook immutable during season; windows enforced downstream.
9. **Data Created:** `seasons`, `windows`, `rulebook_versions`.
10. **Data Updated:** Competition templates; federation calendar.
11. **Notifications:** All tenants under federation; public site update.
12. **Approval Flow:** Federation Admin sign-off.
13. **KPIs:** Publish lead time, downstream adherence.
14. **Related Modules:** Season, Federation, Competition, Public Website.

---

### BP-014 · Competition Creation
1. **Objective:** Define a league or tournament within a season.
2. **Actors:** Competition Organizer, Federation/Association.
3. **Trigger:** Season active; slot open.
4. **Preconditions:** Season exists; rulebook selected.
5. **Main Flow:** Choose format (league/tournament/hybrid) → configure divisions/groups/brackets → set eligibility (age/gender/level) → define points/tie-break → set fees.
6. **Alternative:** Clone from previous season.
7. **Exception:** Conflicting eligibility with parent rulebook → reject.
8. **Business Rules:** Rulebook adherence; format immutable after first fixture published.
9. **Data Created:** `competitions`, `competition_rules`, `divisions`, `groups`.
10. **Data Updated:** Season competition list.
11. **Notifications:** Prospective clubs/academies.
12. **Approval Flow:** Organizer → Federation/Association approval (BP-015).
13. **KPIs:** Setup time, format error rate.
14. **Related Modules:** Competition, League, Tournament, Season.

---

### BP-015 · Competition Approval
1. **Objective:** Governance sign-off before public visibility.
2. **Actors:** Organizer, Federation/Association approver.
3. **Trigger:** Organizer submits competition for approval.
4. **Preconditions:** Competition draft complete.
5. **Main Flow:** Review rulebook adherence, calendar, financial model → approve → publish.
6. **Alternative:** Conditional approval with change requests.
7. **Exception:** Rejected → return with reasons; audit entry.
8. **Business Rules:** Only approved competitions accept registrations.
9. **Data Created:** `competition_approvals`, `audit.events`.
10. **Data Updated:** Competition status → `open_for_registration`.
11. **Notifications:** Organizer + potential participants.
12. **Approval Flow:** Multi-level (Association → Federation for high-tier).
13. **KPIs:** Approval SLA, first-pass rate.
14. **Related Modules:** Competition, Federation, Audit.

---

### BP-016 · Competition Registration
1. **Objective:** Enroll a club/academy team into an approved competition.
2. **Actors:** Club/Academy Admin, Competition Organizer.
3. **Trigger:** Registration window open.
4. **Preconditions:** Team meets eligibility; fees payable.
5. **Main Flow:** Select team → verify eligibility → pay entry fee → organizer approves → seed assigned.
6. **Alternative:** Wildcard / invitational seat.
7. **Exception:** Ineligible team → block; overbooking → waitlist.
8. **Business Rules:** One entry per team per competition; deadline enforced.
9. **Data Created:** `competition_entries`, `payments`.
10. **Data Updated:** Competition capacity, seedings.
11. **Notifications:** Confirmation, seed publication.
12. **Approval Flow:** Club → Organizer.
13. **KPIs:** Fill rate, on-time entries.
14. **Related Modules:** Competition, Club, Finance.

---

### BP-017 · Team Registration
1. **Objective:** Register a team (age/gender category) within a club/academy for a season.
2. **Actors:** Club/Academy Admin.
3. **Trigger:** Season start / new age group.
4. **Preconditions:** Club active.
5. **Main Flow:** Define team (category, coach, kit) → assign staff → open for player registrations.
6. **Alternative:** Merge/split teams; guest teams.
7. **Exception:** Missing head coach → block.
8. **Business Rules:** Head coach license must match age group; one primary coach per team.
9. **Data Created:** `teams`, `team_staff`.
10. **Data Updated:** Club roster tree.
11. **Notifications:** Staff assignments.
12. **Approval Flow:** Club internal only.
13. **KPIs:** Time-to-open registrations.
14. **Related Modules:** Club, Academy, Coach.

---

### BP-018 · Roster Submission
1. **Objective:** Submit official season roster to Competition.
2. **Actors:** Club/Team Admin, Competition Organizer.
3. **Trigger:** Roster deadline for competition.
4. **Preconditions:** Players actively registered and cleared.
5. **Main Flow:** Compile eligible players → submit → organizer validates → locked as official roster.
6. **Alternative:** Roster amendments within allowed windows.
7. **Exception:** Ineligible player → auto-remove with reason.
8. **Business Rules:** Squad size limits, foreign/local quotas per rulebook.
9. **Data Created:** `official_rosters`.
10. **Data Updated:** Player eligibility snapshots.
11. **Notifications:** Club + Organizer.
12. **Approval Flow:** Club → Organizer.
13. **KPIs:** On-time submission %, amendment volume.
14. **Related Modules:** Team, Player Registration, Competition.

---

### BP-019 · Fixture Generation
1. **Objective:** Produce match schedule for a competition.
2. **Actors:** Competition Organizer, System (generator).
3. **Trigger:** Registration closed; format finalized.
4. **Preconditions:** Teams entered; venues available.
5. **Main Flow:** Choose algorithm (round-robin/knockout/groups) → constraints (venues, rest days, TV slots) → generate draft → review → publish.
6. **Alternative:** Manual fixture entry for legacy.
7. **Exception:** No feasible schedule → relax constraints; report conflicts.
8. **Business Rules:** No club plays two fixtures at overlapping times; minimum rest days.
9. **Data Created:** `fixtures`.
10. **Data Updated:** Public calendar; team schedules.
11. **Notifications:** Clubs, referees pool, public site.
12. **Approval Flow:** Organizer approves published set.
13. **KPIs:** Conflict count, time-to-publish.
14. **Related Modules:** Fixture, Competition, Venue, Referee.

---

### BP-020 · Match Scheduling / Rescheduling
1. **Objective:** Adjust a fixture's date/time/venue after publication.
2. **Actors:** Competition Organizer, Clubs, Referee Coordinator, Federation.
3. **Trigger:** Weather, venue conflict, force majeure, request by club.
4. **Preconditions:** Fixture published; deadline not exceeded.
5. **Main Flow:** Request submitted → both clubs agree → organizer approves → federation approves (if required) → all subscribers notified.
6. **Alternative:** Emergency same-day reschedule.
7. **Exception:** No agreement → escalation to Federation with binding decision.
8. **Business Rules:** Change requires audit reason; not permitted within N hours of kickoff without exception.
9. **Data Created:** `reschedule_events`, `audit.events`.
10. **Data Updated:** `fixtures`, dependent calendars.
11. **Notifications:** All stakeholders + public site.
12. **Approval Flow:** Clubs → Organizer → Federation (conditional).
13. **KPIs:** Reschedule rate, notice-time to fans.
14. **Related Modules:** Fixture, Notifications, Federation.

---

### BP-021 · Referee Assignment
1. **Objective:** Assign qualified officials to a fixture.
2. **Actors:** Referee Coordinator, Referees.
3. **Trigger:** Fixture published.
4. **Preconditions:** Referee pool with availability & certifications.
5. **Main Flow:** System proposes based on level/availability/conflicts → coordinator confirms → referees accept.
6. **Alternative:** Auto-swap on conflict; neutral venue rule.
7. **Exception:** No accepted referee 24h before → escalate; consider postponement.
8. **Business Rules:** Referee cannot officiate own club; level must match competition tier.
9. **Data Created:** `referee_assignments`.
10. **Data Updated:** Referee availability calendar.
11. **Notifications:** Referees, clubs, organizer.
12. **Approval Flow:** Coordinator; Federation on appeals.
13. **KPIs:** Coverage %, late-assignment rate, no-show rate.
14. **Related Modules:** Referee, Fixture.

---

### BP-022 · Lineup Submission
1. **Objective:** Publish starting XI + subs before kickoff.
2. **Actors:** Coach/Team Admin, Referee, Eligibility engine.
3. **Trigger:** T-minus X minutes to kickoff (per rulebook).
4. **Preconditions:** Official roster locked; players cleared.
5. **Main Flow:** Coach selects XI + subs + captain → eligibility check → referee validates via Digital Player ID scan → lineup locked.
6. **Alternative:** Emergency substitution pre-kickoff for medical.
7. **Exception:** Ineligible player selected → block with reason; late lineup → sanction per rulebook.
8. **Business Rules:** Squad limits enforced; captain mandatory; ID scan required for youth per federation rule.
9. **Data Created:** `lineups`, `lineup_entries`.
10. **Data Updated:** Match state → `ready_to_start`.
11. **Notifications:** Both teams, referee, public.
12. **Approval Flow:** Coach → Referee.
13. **KPIs:** On-time lineups, ineligibility blocks.
14. **Related Modules:** Lineup, Match, Digital Player ID.

---

### BP-023 · Match Execution
1. **Objective:** Play the fixture with structured event capture.
2. **Actors:** Referee, Match Recorder (may be referee), Coaches.
3. **Trigger:** Kickoff.
4. **Preconditions:** Lineup locked; officials present.
5. **Main Flow:** Kickoff → capture events in real time (goals/cards/subs/injuries) → halftime → resume → full time → referee sign-off.
6. **Alternative:** Match abandoned (weather, safety) → partial record.
7. **Exception:** Loss of connectivity → offline queue with sync on reconnect (PWA).
8. **Business Rules:** Only referee finalizes; events append-only; substitution limits enforced.
9. **Data Created:** `match_events` (see BP-024/025/026), match state transitions.
10. **Data Updated:** Match status; live standings preview.
11. **Notifications:** Live updates to subscribers.
12. **Approval Flow:** Referee sign-off → validation window opens (BP-028).
13. **KPIs:** Live event latency, missed-event rate.
14. **Related Modules:** Match, Match Events, Referee, Notifications.

---

### BP-024 · Match Event Recording (generic)
- Structured capture of any match event: type, minute, player(s), context.
- **Business Rules:** Append-only; correction via compensating event citing prior id + reason.
- **KPIs:** Event completeness vs baseline.

### BP-025 · Goal Recording
- **Main Flow:** Enter minute, scorer, assist(s), body part, from set-piece flag → validate against lineup → append.
- **Business Rules:** Scorer must be on pitch at minute; own-goal marker distinct.
- **Data Created:** `goal_events`. **Updates:** live score.

### BP-026 · Card Recording
- **Main Flow:** Yellow/Red, minute, reason code → update player disciplinary counters → check accumulation → auto-suspend if threshold met.
- **Business Rules:** Two yellows = red; red implies mandatory ban per rulebook.
- **Data Created:** `card_events`, potential `suspensions`.

### BP-027 · Substitution
- **Main Flow:** Player out / player in / minute → check limits → append.
- **Business Rules:** Substituted player cannot return unless rulebook allows; concussion sub exception.

---

### BP-028 · Match Validation
1. **Objective:** Officialize the match record.
2. **Actors:** Referee, Competition Organizer, Clubs (protest right), Federation.
3. **Trigger:** Referee sign-off.
4. **Preconditions:** Match complete; events captured.
5. **Main Flow:** Referee submits report → organizer reviews → protest window opens (e.g., 48h) → if none, mark `official`.
6. **Alternative:** Protest raised → discipline flow (attach evidence).
7. **Exception:** Match voided (fraud, safety) → replay or forfeit ruling.
8. **Business Rules:** Standings not final until match `official`; protest window per rulebook.
9. **Data Created:** `match_reports`, `protests` (if any).
10. **Data Updated:** Match status; standings; disciplinary tallies.
11. **Notifications:** Clubs, competition subscribers.
12. **Approval Flow:** Referee → Organizer → Federation (on protest).
13. **KPIs:** Time-to-official, protest rate, overturn rate.
14. **Related Modules:** Match, Match Events, Standings, Federation.

---

### BP-029 · Standings Update
1. **Objective:** Reflect competition table from official results.
2. **Actors:** System (deterministic engine).
3. **Trigger:** Match becomes official OR event correction.
4. **Preconditions:** Official match state.
5. **Main Flow:** Recompute per rulebook (points, GD, tie-breakers) → publish to public site + subscribers.
6. **Alternative:** Full recompute on rulebook clarification.
7. **Exception:** Non-deterministic tie → apply documented next tie-break; alert if none.
8. **Business Rules:** Deterministic; discrepancies raise alerts; frozen at season close.
9. **Data Created:** `standings_snapshots`.
10. **Data Updated:** Live standings materialized view.
11. **Notifications:** Public site cache invalidation.
12. **Approval Flow:** N/A (system).
13. **KPIs:** Recompute latency, discrepancy count.
14. **Related Modules:** Standings, Competition, Public Website.

---

### BP-030 · Statistics Update
- **Objective:** Roll up per-player, per-team, per-competition, per-season stats.
- **Trigger:** Official match / event correction.
- **Business Rules:** Frozen at season close; reproducible from source events.
- **Data Updated:** `player_stats_snapshots`, `team_stats_snapshots`.
- **KPIs:** Snapshot latency, reconciliation accuracy.

---

### BP-031 · Awards
1. **Objective:** Grant honors (top scorer, MVP, fair play).
2. **Actors:** Competition Organizer, Federation, Voters (if applicable).
3. **Trigger:** Season/competition close or milestone.
4. **Preconditions:** Statistics finalized; eligibility rules published.
5. **Main Flow:** Compute or collect votes → shortlist → decision → announce → passport entry.
6. **Alternative:** Community voting; jury voting.
7. **Exception:** Tied results → tie-break rules or shared award.
8. **Business Rules:** Awards linked to source data; correctable only via compensating award.
9. **Data Created:** `awards`, `passport_entries`.
10. **Data Updated:** Player/Team profiles.
11. **Notifications:** Recipients, public site.
12. **Approval Flow:** Organizer/Jury → Federation ratification (top awards).
13. **KPIs:** Announcement SLA, dispute rate.
14. **Related Modules:** Awards, Statistics, Passport, Public Website.

---

## Part III — Development, Health & Attendance Processes

---

### BP-032 · Training Session
1. **Objective:** Deliver and record structured training.
2. **Actors:** Coach, Players, Medical (optional).
3. **Trigger:** Scheduled session or ad-hoc.
4. **Preconditions:** Team roster; venue.
5. **Main Flow:** Plan → conduct → record attendance (BP-034) → capture load metrics → post-session notes.
6. **Alternative:** Cancelled/rescheduled.
7. **Exception:** Injury during session → BP-036.
8. **Business Rules:** Load thresholds monitored; safeguarding protocols in force.
9. **Data Created:** `training_sessions`, `session_metrics`.
10. **Data Updated:** Player load profiles.
11. **Notifications:** Players/parents on schedule and cancellations.
12. **Approval Flow:** Coach ownership; head coach visibility.
13. **KPIs:** Session completion %, load compliance.
14. **Related Modules:** Training, Attendance, Performance, Medical.

---

### BP-033 · Player Attendance (Match)
- Records presence at official match squad/venue.
- **Trigger:** Match check-in scan of Digital Player ID.
- **Data Created:** `attendance_records`. **KPIs:** No-show rate.

### BP-034 · Training Attendance
- **Trigger:** Session start.
- **Business Rules:** Attendance is timestamped and attributed; used in selection analytics.

---

### BP-035 · Medical Check
1. **Objective:** Clear players for participation.
2. **Actors:** Medical Staff, Player/Parent, Federation (audit).
3. **Trigger:** Pre-registration, pre-season, injury return.
4. **Preconditions:** Consent for medical processing.
5. **Main Flow:** Assessment → clearance decision → validity date set.
6. **Alternative:** Conditional clearance (specific restrictions).
7. **Exception:** Not cleared → registration blocked; appeal path.
8. **Business Rules:** Medical data highly restricted; retention per jurisdiction.
9. **Data Created:** `medical_records`, `medical_clearances`.
10. **Data Updated:** Player eligibility for match/training.
11. **Notifications:** Player/Parent, Club Admin (status only, not details).
12. **Approval Flow:** Medical Staff signs; club sees status only.
13. **KPIs:** Clearance coverage, expiry leakage.
14. **Related Modules:** Medical Staff, Player Registration, Documents.

---

### BP-036 · Player Injury
1. **Objective:** Record injuries and manage return-to-play.
2. **Actors:** Medical Staff, Coach, Player/Parent.
3. **Trigger:** Injury observed (match/training) or reported.
4. **Preconditions:** Player under active registration.
5. **Main Flow:** Log injury (type, mechanism, severity) → treatment plan → RTP protocol → clearance to return.
6. **Alternative:** Referred to external specialist.
7. **Exception:** Recurring injury → escalate to load review.
8. **Business Rules:** No participation before RTP clearance; data private to Medical + guardian.
9. **Data Created:** `injuries`, `rtp_protocols`.
10. **Data Updated:** Player availability; AI injury-risk features.
11. **Notifications:** Coach (availability only), Parent (details).
12. **Approval Flow:** Medical → Coach acknowledgement.
13. **KPIs:** Time-to-RTP, recurrence rate.
14. **Related Modules:** Medical, Training, Performance, AI Analytics.

---

## Part IV — Finance, Sponsorship & Commerce Processes

---

### BP-037 · Financial Transactions (umbrella)
- All money flows: fees, transfer payments, solidarity, sponsorships, payouts.
- **Business Rules:** Double-entry integrity; every capture matched to invoice; period close immutable.
- **KPIs:** Reconciliation accuracy, days-to-close.

### BP-038 · Invoice Payment
1. **Objective:** Collect payment against an issued invoice.
2. **Actors:** Payer (Player/Parent/Club/Sponsor), Finance, Payment Provider.
3. **Trigger:** Invoice issued or scheduled charge.
4. **Preconditions:** Valid payment method.
5. **Main Flow:** Present invoice → payer authorizes → provider captures → webhook → invoice `paid`.
6. **Alternative:** Installments; partial payments.
7. **Exception:** Declined → retry policy; chargeback → dispute workflow.
8. **Business Rules:** No PAN storage; idempotency on provider webhooks.
9. **Data Created:** `payments`, `payment_events`.
10. **Data Updated:** Invoice status; ledger entries.
11. **Notifications:** Payer, Finance, dependent workflow (unblock registration).
12. **Approval Flow:** Finance policy on high-value.
13. **KPIs:** Success rate, DSO.
14. **Related Modules:** Payments, Invoices, Finance.

---

### BP-039 · Refund Process
1. **Objective:** Return funds within policy.
2. **Actors:** Payer, Finance, Payment Provider.
3. **Trigger:** Refund request or automatic (cancelled competition, etc.).
4. **Preconditions:** Original capture exists.
5. **Main Flow:** Request → approval by Finance → provider refund → invoice adjustment via credit note.
6. **Alternative:** Partial refund; alternative credit.
7. **Exception:** Refund window expired → policy exception path.
8. **Business Rules:** Credit note ties back to original invoice; audit-logged.
9. **Data Created:** `refunds`, `credit_notes`.
10. **Data Updated:** Ledger; invoice status.
11. **Notifications:** Payer, Finance.
12. **Approval Flow:** Requester → Finance manager (thresholds).
13. **KPIs:** Refund SLA, refund ratio.
14. **Related Modules:** Payments, Invoices, Finance.

---

### BP-040 · Sponsor Management
1. **Objective:** Onboard sponsors; manage deals, rights, reporting.
2. **Actors:** Sponsor, Club/Competition, Finance, Compliance.
3. **Trigger:** New sponsorship deal.
4. **Preconditions:** Brand-safety review passed (esp. minors).
5. **Main Flow:** Contract → rights configured (branding slots, media) → activation → measurement → periodic reports → invoicing.
6. **Alternative:** Barter deals; performance-based.
7. **Exception:** Compliance breach → suspend activation.
8. **Business Rules:** Sponsorship of minors restricted; disclosures per jurisdiction.
9. **Data Created:** `sponsorships`, `rights`, `impressions`.
10. **Data Updated:** Media placements; finance ledger.
11. **Notifications:** Sponsor, Club/Competition, Compliance.
12. **Approval Flow:** Compliance → Finance → Activation.
13. **KPIs:** Delivery vs promise, renewal rate.
14. **Related Modules:** Sponsors, Finance, Media, Compliance.

---

## Part V — Documents, Certifications & Communications

---

### BP-041 · Document Upload
1. **Objective:** Manage legal/administrative artifacts.
2. **Actors:** Any user with permission; verifier.
3. **Trigger:** Registration, transfer, verification, dispute.
4. **Preconditions:** Allowed file types; consent to store PII.
5. **Main Flow:** Upload → virus scan → classify → encrypt at rest → link to entity.
6. **Alternative:** e-signature workflow.
7. **Exception:** Malware detected → quarantine + alert; over-quota → block with guidance.
8. **Business Rules:** Retention per jurisdiction; role-gated access; audit on read of sensitive docs.
9. **Data Created:** `documents`, `document_links`.
10. **Data Updated:** Entity completeness score.
11. **Notifications:** Verifier notified of new uploads.
12. **Approval Flow:** Verifier acceptance where required.
13. **KPIs:** Verification SLA, rejection rate.
14. **Related Modules:** Documents, Storage, Audit.

---

### BP-042 · Certification
1. **Objective:** Manage coach/referee/medical certifications.
2. **Actors:** Certificate holder, Federation certification authority.
3. **Trigger:** New certification, renewal, revocation.
4. **Preconditions:** Course/exam passed or external certificate presented.
5. **Main Flow:** Submit evidence → verify → issue digital certificate → link to profile → renewal reminders.
6. **Alternative:** Reciprocal recognition from other federations.
7. **Exception:** Fraud detected → revoke; role restriction applied.
8. **Business Rules:** Role usage gated by valid certification; expiries hard-enforced.
9. **Data Created:** `certifications`.
10. **Data Updated:** Coach/Referee/Medical profile.
11. **Notifications:** Holder + affiliated orgs.
12. **Approval Flow:** Federation certification authority.
13. **KPIs:** Coverage %, expiry compliance.
14. **Related Modules:** Certification, Coach, Referee, Medical.

---

### BP-043 · Notifications
- Event-driven multi-channel delivery (push/email/SMS/in-app).
- **Business Rules:** Preferences honored; transactional vs marketing separated; failed sends retried with backoff.
- **KPIs:** Delivery rate, engagement rate.

### BP-044 · Messaging
- In-app chat between allowed pairs/groups.
- **Business Rules:** Coach ↔ minor logged and visible to guardians; moderation queue for reports.
- **KPIs:** Response time, moderation actions per 1k messages.

---

### BP-045 · Reports
1. **Objective:** Produce scheduled or on-demand structured outputs.
2. **Actors:** Any authorized user; system scheduler.
3. **Trigger:** Schedule or manual request.
4. **Preconditions:** Data sources available.
5. **Main Flow:** Choose template + params → generate snapshot → deliver (download/email/API) → archive versioned artifact.
6. **Alternative:** Subscribed recurring reports.
7. **Exception:** Data source unavailable → queued with alert.
8. **Business Rules:** Snapshots at generation time; regeneration produces new version; PII redaction per role.
9. **Data Created:** `report_runs`, `report_artifacts`.
10. **Data Updated:** Consumption metrics.
11. **Notifications:** Report ready.
12. **Approval Flow:** N/A (RBAC gates access).
13. **KPIs:** SLA, delivery success, usage.
14. **Related Modules:** Reports, Statistics, Finance, Standings.

---

### BP-046 · Audit Logging
- Every business- or security-relevant action emits an immutable audit event.
- **Business Rules:** Append-only; tamper-evident; retention meets floor; export supported.
- **KPIs:** Coverage %, tamper alerts, export latency.

---

## Part VI — End-to-End View

### 1) Overall End-to-End Football Ecosystem Flow

```text
Federation onboarded (BP-001)
  → Associations set up (BP-003)
    → Clubs & Academies registered (BP-002, BP-004, BP-005)
      → Coaches (BP-006) & Parents (BP-007) onboarded
        → Players registered (BP-008) → Verified (BP-009) → Digital ID (BP-010) → Passport (BP-011)
          → Medical Check (BP-035) clears player
            → Season (BP-013) → Competition (BP-014) approved (BP-015)
              → Competition Registration (BP-016) → Team Registration (BP-017) → Roster (BP-018)
                → Fixtures generated (BP-019) → Referees assigned (BP-021) → Reschedules (BP-020)
                  → Training (BP-032) & Training Attendance (BP-034) throughout
                    → Match day: Lineup (BP-022) → Match Execution (BP-023)
                      → Events: Goals (BP-025) / Cards (BP-026) / Subs (BP-027) / Injuries (BP-036)
                        → Match Validation (BP-028) → Standings (BP-029) → Statistics (BP-030)
                          → Awards (BP-031) at season close
                            → Passport updated across the journey
Continuous rails: Documents (BP-041), Certification (BP-042),
Notifications (BP-043), Messaging (BP-044), Reports (BP-045),
Audit (BP-046), Finance (BP-037/038/039), Sponsors (BP-040),
Transfers (BP-012) whenever a window opens.
```

### 2) Cross-Domain Dependency Diagram
See Mermaid artifact: `SoccerOS_Business_Processes.mmd`.

### 3) Business Process Map (by capability lane)

```text
Lane: GOVERNANCE   → BP-001, BP-003, BP-015, BP-020 (esc.), BP-042
Lane: ORG ONBOARD  → BP-002, BP-004, BP-005, BP-006, BP-007
Lane: PLAYER LIFE  → BP-008, BP-009, BP-010, BP-011, BP-012
Lane: COMPETITION  → BP-013, BP-014, BP-016, BP-017, BP-018, BP-019, BP-020, BP-021
Lane: MATCH DAY    → BP-022, BP-023, BP-024–027, BP-028, BP-033
Lane: DEVELOPMENT  → BP-032, BP-034, BP-035, BP-036, BP-030, BP-031
Lane: COMMERCE     → BP-037, BP-038, BP-039, BP-040
Lane: PLATFORM     → BP-041, BP-043, BP-044, BP-045, BP-046
```

### 4) Critical Business Rules (cross-cutting)

- **CR-01** No player action possible without a valid **Verification + Digital Player ID**.
- **CR-02** **Registration windows** and **transfer windows** are absolute; no bypass without federation exception + audit.
- **CR-03** **Rulebooks are versioned per season** and immutable during the season.
- **CR-04** **Match events and passport entries are append-only**; corrections are compensating entries citing sources.
- **CR-05** **Minors require verified guardian consent** for registrations, transfers, media, scouting, and marketing.
- **CR-06** **Ineligible-player fielding = automatic forfeit** + disciplinary case.
- **CR-07** **Referees cannot officiate their affiliated clubs**; conflicts auto-detected.
- **CR-08** **Standings and statistics are deterministic derivations** from official events; discrepancies raise alerts.
- **CR-09** **Medical data is highly restricted** (encrypted, role-gated, audited); coaches see availability only.
- **CR-10** **Finance is double-entry**; invoices are sequential and immutable; corrections via credit notes.
- **CR-11** **Digital Player IDs verifiable offline ≥24h** for match-day resilience.
- **CR-12** **Every privileged action logged** (Audit Logs), including approvals, overrides, and PII reads.
- **CR-13** **Cross-tenant reads are impossible** — enforced by RLS + tests.
- **CR-14** **AI decisions require human review** for adverse actions on players.
- **CR-15** **All communications with minors are logged and visible to guardians**.

### 5) Future Automation Opportunities

- **A-01** AI-assisted match event tagging from video clips (BP-024–027).
- **A-02** Predictive load management and injury-risk alerts (BP-032/036).
- **A-03** Auto-scheduling optimizer for fixtures with multi-constraint solver (BP-019).
- **A-04** Referee assignment optimizer (fairness, travel, exposure) (BP-021).
- **A-05** Automated solidarity/training-compensation computation and disbursement (BP-012/037).
- **A-06** Duplicate-player detection and merge suggestions (BP-008/009).
- **A-07** Sponsor impression measurement from broadcast/stream feeds (BP-040).
- **A-08** Anomaly detection for age fraud, roster manipulation, financial irregularities (BP-009/046).
- **A-09** Auto-generated multilingual reports and press summaries (BP-045).
- **A-10** Digital wallet for Player ID + Passport with revocation broadcast (BP-010/011).
- **A-11** Real-time public score & standings via realtime channels (BP-023/029).
- **A-12** Continuous compliance monitoring (consents, certifications, expiries) (BP-007/042).

---

## Appendix — Traceability

- PRD `FR-*` ↔ Processes `BP-*` ↔ Domains in `DOMAINS.md`.
- Every process maps to at least one Bounded Context and at least one PRD functional requirement.
- Governance of this document mirrors PRD: Product Council approves changes to Critical Business Rules.
