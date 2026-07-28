# Touchline Football Ecosystem Platform
## Enterprise Data Architecture

**Document Version:** 1.0
**Status:** Baseline — Source of Truth for Database Design
**Owner:** Enterprise Data Architecture
**Audience:** Backend Engineers, Data Engineers, DBAs, Security, Compliance, AI/Analytics
**Scope:** PostgreSQL 15+ on Supabase, multi-tenant SaaS at national federation scale

> **Note:** This document defines the *architecture*, *entities*, *relationships*, *governance*, and *operational strategies* for the Touchline (SoccerOS) database. It intentionally contains **no SQL, no DDL, and no implementation code**. It is the blueprint that governs future migrations.

---

## Table of Contents

1. Enterprise Data Architecture
2. Master Entity List
3. Data Dictionary
4. Relationship Matrix
5. Master ERD (by Domain)
6. Reference Data
7. Transaction Tables
8. Analytics Tables
9. Audit Tables
10. Reporting Views
11. Materialized Views
12. Recommended PostgreSQL Indexes
13. Partitioning Strategy
14. Archiving Strategy
15. Backup Strategy
16. Security Strategy
17. RLS Strategy
18. Performance Optimization
19. Scaling Strategy
20. Future Database Expansion

---

# 1. Enterprise Data Architecture

## 1.1 Architectural Vision

The Touchline database is the **system of record** for an entire national football ecosystem: federations, associations, competitions, clubs, academies, coaches, players, guardians, medical staff, referees, scouts, agents, and fans. It must simultaneously behave as:

- an **OLTP system** for high-frequency match-day writes,
- a **document store** for player passports and event streams,
- an **analytical substrate** for AI models and BI,
- a **compliance vault** for minors, medical, and financial data,
- a **multi-tenant SaaS backbone** with strict data isolation.

## 1.2 Architectural Style

| Layer | Choice | Rationale |
|---|---|---|
| Database Engine | PostgreSQL 15+ (Supabase-managed) | ACID, RLS, JSONB, partitioning, extensions |
| Tenancy Model | **Shared schema, discriminator column** (`tenant_id`) enforced by RLS | Cost-efficient at millions of rows; single migration surface; strong isolation via RLS |
| Data Modeling | Hybrid: **normalized 3NF** for master/OLTP, **denormalized star schema** for analytics, **JSONB** for schemaless event payloads and AI features | Balances integrity, flexibility, and query speed |
| Isolation Strategy | Logical (RLS) + Physical (partitioning by tenant/time for hot tables) | Meets both security and performance |
| Change Data Capture | Postgres logical replication → analytics warehouse + event bus | Enables warehouse, ML, and downstream consumers without OLTP contention |
| Extensions | `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `pg_partman`, `pg_trgm`, `unaccent`, `postgis` (geo), `vector` (AI embeddings), `pg_cron`, `pgaudit` | Enterprise-grade capability without external services |

## 1.3 Data Layers

1. **Reference Layer** — immutable/slow-changing lookups (country, position, status codes).
2. **Master Data Layer** — canonical entities (Player, Club, Competition).
3. **Transactional Layer** — high-volume operational writes (Match Events, Registrations, Payments).
4. **Analytical Layer** — fact/dimension tables, aggregates, materialized views.
5. **AI/ML Feature Layer** — feature store, embeddings (`vector`), model outputs.
6. **Audit Layer** — append-only history, compliance evidence, immutable passports.
7. **Governance Layer** — tenants, roles, permissions, data classification, retention.

## 1.4 Cross-Cutting Data Concerns

- **Identity:** All PKs are `UUID v4` (or `uuid_generate_v7` where sortability matters).
- **Temporal:** Every row carries `created_at`, `updated_at`; append-only tables add `valid_from`/`valid_to`.
- **Auditability:** Every mutation persists an audit event; sensitive tables use trigger-based row snapshots.
- **Soft Delete:** `deleted_at` semantics; RLS filters exclude deleted rows by default; hard delete only via retention job.
- **Optimistic Locking:** `version` (integer) or `updated_at` guard for concurrent updates on Player, Match, Registration.
- **Localization:** Strings on reference data support i18n via a `translations` JSONB column.
- **Geospatial:** Venues, districts, and player origins use `postgis` `geography(Point, 4326)`.
- **Money:** Stored as `numeric(18,4)` with an ISO 4217 currency code; never float.
- **Time Zones:** All timestamps stored as `timestamptz` (UTC); presentation-layer converts to local.

## 1.5 Standard Column Contract (Every Table)

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | Primary key |
| `tenant_id` | uuid | Multi-tenant discriminator (nullable only on platform-global tables) |
| `created_at` | timestamptz | Row creation time (UTC) |
| `updated_at` | timestamptz | Last mutation (UTC), trigger-maintained |
| `created_by` | uuid | FK → `identity.user.id` (nullable for system inserts) |
| `updated_by` | uuid | FK → `identity.user.id` |
| `deleted_at` | timestamptz | Soft-delete marker (NULL = active) |
| `version` | integer | Optimistic lock counter (on mutable business entities) |

## 1.6 Schema Organization

Logical Postgres schemas group bounded contexts:

- `identity` — users, sessions, MFA
- `governance` — tenants, roles, permissions, policies
- `reference` — lookups
- `org` — federation, association, club, academy
- `people` — player, guardian, coach, staff, referee, scout, agent
- `passport` — digital ID, passport events, verification
- `registration` — seasonal registrations, transfers, eligibility
- `competition` — competitions, seasons, groups, standings
- `match` — fixtures, lineups, events, statistics
- `training` — programs, sessions, attendance, load
- `medical` — records, injuries, clearances
- `scouting` — reports, watchlists, evaluations
- `marketplace` — listings, offers, contracts
- `finance` — invoices, payments, ledger
- `communication` — notifications, messages, threads
- `content` — media, documents, video
- `ai` — features, embeddings, predictions, model registry
- `analytics` — facts, dimensions, aggregates
- `audit` — audit log, change history, access log

---

# 2. Master Entity List

Entities grouped by domain. Each entity conforms to §1.5 unless noted.

## 2.1 Identity & Access (Generic Domain)
- `user`, `user_credential`, `user_mfa_factor`, `user_session`, `user_device`, `password_reset_token`, `email_verification_token`, `oauth_identity`, `api_key`.

## 2.2 Governance & Tenancy
- `tenant`, `tenant_settings`, `tenant_domain`, `tenant_subscription`, `role`, `permission`, `role_permission`, `user_role_assignment`, `data_classification`, `retention_policy`, `consent_record`, `legal_hold`.

## 2.3 Reference Data
- `country`, `province`, `city`, `district`, `language`, `currency`, `timezone`, `position`, `foot_preference`, `body_side`, `competition_type`, `competition_format`, `age_category`, `gender`, `player_status`, `staff_status`, `medical_status`, `injury_type`, `injury_severity`, `training_category`, `training_intensity`, `card_type`, `event_type`, `payment_status`, `payment_method`, `notification_type`, `document_type`, `id_document_type`, `contract_type`, `transfer_type`, `sanction_type`, `nationality`, `ethnicity`, `education_level`.

## 2.4 Organization (Supporting Domain)
- `federation`, `regional_association`, `district_association`, `club`, `club_branch`, `academy`, `academy_branch`, `team`, `squad`, `venue`, `pitch`, `organization_membership`, `organization_document`.

## 2.5 People (Core Domain)
- `person` (canonical natural person), `player`, `player_biometric`, `player_school`, `guardian`, `guardian_link`, `coach`, `coach_license`, `medical_staff`, `admin_staff`, `referee`, `referee_qualification`, `scout`, `agent`, `agent_representation`, `staff_assignment`.

## 2.6 Digital Player ID & Passport (Core Domain)
- `player_digital_id`, `player_id_card`, `player_verification`, `player_passport` (append-only header), `player_passport_event` (append-only log), `player_document`, `player_photo`, `player_qr_token`.

## 2.7 Registration & Transfers (Core Domain)
- `season`, `player_registration`, `registration_window`, `eligibility_rule`, `eligibility_check`, `transfer_request`, `transfer_approval`, `transfer_fee`, `solidarity_contribution`, `loan_agreement`, `international_clearance` (ITC).

## 2.8 Competition (Core Domain)
- `competition`, `competition_edition`, `competition_stage`, `competition_group`, `group_membership`, `competition_rule`, `competition_official`, `standings_snapshot`, `standings_engine_run`, `fixture`, `fixture_reschedule`, `sanction`, `protest`, `appeal`.

## 2.9 Match (Core Domain)
- `match`, `match_lineup`, `match_lineup_player`, `match_substitution`, `match_event` (partitioned), `match_statistic` (partitioned), `match_official_assignment`, `match_report`, `match_media`, `match_incident`, `match_verification`.

## 2.10 Training & Performance
- `training_program`, `training_session`, `training_attendance`, `training_drill`, `player_load_metric`, `wellness_survey`, `performance_test`, `performance_test_result`.

## 2.11 Medical (Core Domain)
- `medical_record`, `medical_examination`, `medical_clearance`, `injury`, `injury_treatment`, `rehab_plan`, `rehab_session`, `medication`, `allergy`, `emergency_contact`.

## 2.12 Scouting & Talent
- `scouting_report`, `scouting_evaluation`, `watchlist`, `watchlist_entry`, `talent_pool`, `talent_pool_entry`, `scout_assignment`.

## 2.13 Marketplace
- `player_listing`, `listing_offer`, `contract`, `contract_clause`, `contract_amendment`, `commission_split`.

## 2.14 Finance
- `chart_of_account`, `journal`, `journal_entry`, `invoice`, `invoice_line`, `payment`, `payment_allocation`, `payout`, `subscription_plan`, `subscription`, `subscription_invoice`, `tax_rate`, `wallet`, `wallet_transaction`.

## 2.15 Communication
- `notification`, `notification_channel`, `notification_template`, `notification_delivery`, `message_thread`, `message`, `message_read_receipt`, `announcement`, `broadcast_recipient`.

## 2.16 Content & Media
- `media_asset`, `media_variant`, `document`, `document_signature`, `video_clip`, `video_tag`, `video_playlist`.

## 2.17 AI / ML
- `ai_model`, `ai_model_version`, `ai_feature_definition`, `ai_feature_value` (partitioned), `player_embedding` (`vector`), `match_event_embedding`, `ai_prediction`, `ai_recommendation`, `ai_training_run`.

## 2.18 Analytics
- `dim_player`, `dim_team`, `dim_competition`, `dim_venue`, `dim_date`, `dim_time`, `dim_official`, `dim_tenant`, `fact_match_result`, `fact_match_event`, `fact_player_appearance`, `fact_player_stat_daily`, `fact_registration`, `fact_transfer`, `fact_revenue`, `fact_training_load`, `agg_standings_daily`, `agg_player_form_7d`.

## 2.19 Audit & Compliance
- `audit_event` (partitioned), `data_access_log` (partitioned), `change_history`, `login_attempt`, `security_incident`, `pii_access_log`, `export_request`, `erasure_request`.

---

# 3. Data Dictionary

> The dictionary describes representative entities per domain. All entities inherit the Standard Column Contract (§1.5). Only entity-specific columns and rules are shown.

## 3.1 `governance.tenant`
- **Description:** Root discriminator for multi-tenant isolation. Represents a federation, league, club group, or academy network onboarded to Touchline.
- **Columns:** `id`, `code` (text, unique), `name` (text), `type` (enum: federation, association, club, academy, platform), `country_id` (uuid FK), `status` (enum: active, suspended, archived), `plan_id` (uuid FK subscription_plan), `data_residency` (text), `settings` (jsonb).
- **Nullable:** `plan_id` yes; others no.
- **Defaults:** `status='active'`.
- **Constraints:** `code` unique globally; `type` restricted to enum; FK to `country`.
- **Indexes:** unique(`code`), btree(`status`), btree(`country_id`).
- **Business Rules:** Immutable `code`; deletion is soft-only; suspension cascades logically via RLS.

## 3.2 `identity.user`
- **Description:** Authenticated principal.
- **Columns:** `id`, `email` (citext), `phone_e164` (text), `display_name`, `locale`, `status` (enum: active, invited, disabled, locked), `last_login_at`, `mfa_enrolled` (bool).
- **Nullable:** `phone_e164`, `last_login_at`.
- **Defaults:** `status='invited'`, `mfa_enrolled=false`.
- **Constraints:** unique(`email`) globally; E.164 format for phone.
- **Indexes:** unique(`email`), btree(`status`), btree(`phone_e164`).
- **Business Rules:** Email verification required before `active`; password stored only in `user_credential`.

## 3.3 `people.person`
- **Description:** Canonical natural person. A person may hold multiple roles (player, coach, guardian) across tenants.
- **Columns:** `id`, `tenant_id`, `given_name`, `family_name`, `sex_at_birth` (enum), `gender_id` (uuid FK), `date_of_birth`, `nationality_id`, `secondary_nationality_id`, `country_of_birth_id`, `id_document_type_id`, `id_document_number` (text, encrypted), `photo_asset_id`, `is_minor` (bool, generated), `deceased_at`.
- **Nullable:** most optional; `given_name`, `family_name`, `date_of_birth` required.
- **Defaults:** none.
- **Constraints:** unique(`tenant_id`, `id_document_type_id`, `id_document_number`) partial where not null; `date_of_birth <= today`.
- **Indexes:** btree(`tenant_id`,`family_name`,`given_name`), gin(trigram) for name search, btree(`date_of_birth`).
- **Business Rules:** `id_document_number` encrypted at rest; minors require `guardian_link`; PII classification = **Restricted**.

## 3.4 `people.player`
- **Description:** Sport-specific extension of `person` when acting as a player.
- **Columns:** `id`, `tenant_id`, `person_id` (uuid FK unique per tenant), `player_code` (text, unique per federation), `primary_position_id`, `secondary_position_id`, `foot_preference_id`, `height_cm` (smallint), `weight_kg` (numeric(5,2)), `status_id`, `current_club_id`, `current_team_id`, `debut_date`, `retired_at`.
- **Constraints:** unique(`tenant_id`,`person_id`); unique(`tenant_id`,`player_code`).
- **Indexes:** btree(`tenant_id`,`status_id`), btree(`current_club_id`), btree(`current_team_id`).
- **Business Rules:** Only one active `player_registration` per season per federation; retirement locks new registrations.

## 3.5 `passport.player_passport_event` (Append-Only)
- **Description:** Immutable log of everything material that happens in a player's career: registration, transfer, appearance, card, injury, award, sanction.
- **Columns:** `id`, `tenant_id`, `player_id`, `event_type_id`, `event_at` (timestamptz), `source_entity` (text), `source_id` (uuid), `payload` (jsonb), `hash_prev` (bytea), `hash_self` (bytea).
- **Nullable:** `source_id` optional.
- **Constraints:** No UPDATE, no DELETE (enforced by trigger); `hash_self = sha256(hash_prev || canonical(payload))`.
- **Indexes:** btree(`tenant_id`,`player_id`,`event_at`), brin(`event_at`).
- **Business Rules:** Tamper-evident chain per player; used for regulatory evidence.

## 3.6 `competition.competition_edition`
- **Description:** A specific season/instance of a competition (e.g., "Premier Youth U15 — 2026").
- **Columns:** `id`, `tenant_id`, `competition_id`, `season_id`, `format_id`, `age_category_id`, `gender_id`, `start_date`, `end_date`, `status` (enum: draft, published, in_progress, completed, cancelled), `rules_snapshot` (jsonb), `standings_engine_version` (text).
- **Constraints:** unique(`competition_id`,`season_id`); `end_date >= start_date`.
- **Indexes:** btree(`tenant_id`,`status`), btree(`season_id`).
- **Business Rules:** `rules_snapshot` frozen on publish; standings deterministic vs `standings_engine_version`.

## 3.7 `match.match`
- **Description:** A scheduled or completed fixture.
- **Columns:** `id`, `tenant_id`, `competition_edition_id`, `stage_id`, `group_id`, `home_team_id`, `away_team_id`, `venue_id`, `pitch_id`, `scheduled_at`, `kicked_off_at`, `ended_at`, `status` (enum: scheduled, live, halftime, completed, postponed, cancelled, forfeited, abandoned), `home_score`, `away_score`, `result_type` (enum), `weather` (jsonb), `attendance` (int), `verification_status` (enum), `version` (int).
- **Constraints:** `home_team_id <> away_team_id`; scores non-negative; unique fixture per (`competition_edition_id`, `home_team_id`, `away_team_id`, `scheduled_at`).
- **Indexes:** btree(`tenant_id`,`scheduled_at`), btree(`competition_edition_id`,`status`), btree(`home_team_id`), btree(`away_team_id`).
- **Business Rules:** Cannot transition to `completed` without verified lineups on both sides.

## 3.8 `match.match_event` (Partitioned by month on `occurred_at`)
- **Description:** Atomic in-match event stream (goal, card, sub, VAR, injury).
- **Columns:** `id`, `tenant_id`, `match_id`, `occurred_at`, `minute` (smallint), `added_time` (smallint), `event_type_id`, `team_id`, `player_id`, `secondary_player_id`, `x` (numeric), `y` (numeric), `payload` (jsonb), `recorded_by`, `is_reversed` (bool), `reversed_by_event_id`.
- **Constraints:** FK to `match`; corrections use `is_reversed` + `reversed_by_event_id`, never UPDATE.
- **Indexes:** btree(`match_id`,`occurred_at`), btree(`player_id`), brin(`occurred_at`), gin(`payload`).
- **Business Rules:** Append-only in normal operation; offline capture supported via idempotency key in `payload.client_event_id`.

## 3.9 `registration.player_registration`
- **Description:** Legal binding of a player to a club/team for a season.
- **Columns:** `id`, `tenant_id`, `season_id`, `player_id`, `club_id`, `team_id`, `age_category_id`, `registration_type` (enum: new, renewal, transfer_in, loan_in), `starts_on`, `ends_on`, `status` (enum: pending, approved, rejected, revoked, expired), `approved_by`, `approved_at`, `documents` (jsonb), `version`.
- **Constraints:** unique(`season_id`,`player_id`) for approved rows; `ends_on > starts_on`.
- **Indexes:** btree(`tenant_id`,`season_id`,`status`), btree(`club_id`), btree(`player_id`).
- **Business Rules:** Approval requires verified Digital ID; minors require guardian consent artifact.

## 3.10 `medical.injury`
- **Description:** Recorded injury episode with clinical detail.
- **Columns:** `id`, `tenant_id`, `player_id`, `injury_type_id`, `severity_id`, `body_side_id`, `occurred_at`, `diagnosed_at`, `mechanism` (text), `expected_return_at`, `actual_return_at`, `status` (enum), `clinician_id`, `notes` (text, encrypted).
- **Business Rules:** PHI classification = **Restricted**; access limited to medical role + player + guardian; audit every read.

## 3.11 `finance.invoice` / `payment`
- **Description:** Double-entry accounting artifacts.
- **Business Rules:** Invoices immutable once issued; corrections via credit notes; every payment produces balanced `journal_entry` rows; currency and FX rate stamped at posting.

## 3.12 `ai.player_embedding`
- **Description:** Vector representation of a player for similarity / talent search.
- **Columns:** `id`, `tenant_id`, `player_id`, `model_version_id`, `embedding` (`vector(768)`), `generated_at`.
- **Indexes:** `ivfflat` on `embedding` (cosine).
- **Business Rules:** Regenerated on model version bump; source features traceable via `ai_feature_value`.

## 3.13 `audit.audit_event` (Partitioned by month)
- **Description:** Structured record of every mutation and sensitive read.
- **Columns:** `id`, `tenant_id`, `actor_user_id`, `actor_role`, `action` (enum), `entity_schema`, `entity_table`, `entity_id`, `occurred_at`, `ip_inet` (inet), `user_agent`, `before` (jsonb), `after` (jsonb), `diff` (jsonb), `request_id`, `session_id`, `classification` (enum).
- **Business Rules:** Append-only; retention 7 years for financial, 10 years for minor-related.

> Additional entities follow the same specification pattern; the shape above is the contractual template for the entire dictionary.

---

# 4. Relationship Matrix

## 4.1 One-to-One
| A | B | Notes |
|---|---|---|
| `user` | `user_credential` | Password/secret split from principal |
| `player` | `player_digital_id` | Canonical ID per player |
| `player` | `person` | Player is a role-specialization of person |
| `match` | `match_report` | One official report per match |
| `contract` | `commission_split` | Optional 1:1 when representation exists |
| `tenant` | `tenant_settings` | Config split from tenant header |

## 4.2 One-to-Many
| Parent | Children |
|---|---|
| `tenant` | nearly every business entity via `tenant_id` |
| `federation` | `regional_association`, `competition`, `season` |
| `club` | `team`, `player_registration`, `venue` |
| `academy` | `training_program`, `academy_branch` |
| `person` | `player`, `coach`, `guardian`, `referee`, `scout` |
| `player` | `player_registration`, `player_passport_event`, `match_event`, `injury`, `medical_record`, `player_embedding` |
| `competition` | `competition_edition`, `competition_rule` |
| `competition_edition` | `competition_stage`, `fixture`, `standings_snapshot` |
| `match` | `match_event`, `match_lineup_player`, `match_official_assignment` |
| `training_program` | `training_session` |
| `training_session` | `training_attendance`, `player_load_metric` |
| `invoice` | `invoice_line`, `payment_allocation` |
| `message_thread` | `message` |
| `ai_model` | `ai_model_version`, `ai_prediction` |
| `audit_event` | — (leaf) |

## 4.3 Many-to-Many (with join entities)
| Left | Right | Join |
|---|---|---|
| `role` | `permission` | `role_permission` |
| `user` | `role` (scoped by tenant/org) | `user_role_assignment` |
| `player` | `guardian` | `guardian_link` |
| `player` | `agent` | `agent_representation` |
| `team` | `competition_edition` | `group_membership` |
| `player` | `watchlist` | `watchlist_entry` |
| `match` | `referee` | `match_official_assignment` |
| `training_session` | `player` | `training_attendance` |
| `player` | `talent_pool` | `talent_pool_entry` |
| `notification_template` | `notification_channel` | `notification_template_channel` |
| `subscription_plan` | `feature_flag` | `plan_feature` |

---

# 5. Master ERD (by Domain)

> High-level structural map. Boxes = aggregate roots; arrows = FK direction (child → parent).

```
[Governance]
  tenant ──< tenant_settings
  tenant ──< user_role_assignment >── role ──< role_permission >── permission

[Identity]
  user ──1:1── user_credential
  user ──< user_mfa_factor
  user ──< user_session ──< user_device

[Organization]
  federation ──< regional_association ──< district_association
  federation ──< club ──< team
  federation ──< academy ──< academy_branch
  club ──< venue ──< pitch

[People / Passport]
  person ──< player ──1:1── player_digital_id
  person ──< coach ──< coach_license
  person ──< guardian
  player ──< guardian_link >── guardian
  player ──< player_passport_event   (append-only)
  player ──< player_document

[Registration]
  season ──< player_registration >── player, club, team
  player_registration ──< eligibility_check
  transfer_request ──< transfer_approval ──< transfer_fee ──< solidarity_contribution

[Competition / Match]
  competition ──< competition_edition ──< competition_stage ──< competition_group
  competition_edition ──< fixture ──1:1── match
  match ──< match_lineup ──< match_lineup_player
  match ──< match_event                (partitioned)
  match ──< match_official_assignment >── referee
  competition_edition ──< standings_snapshot

[Training / Medical]
  training_program ──< training_session ──< training_attendance >── player
  training_session ──< player_load_metric
  player ──< medical_record ──< medical_examination
  player ──< injury ──< injury_treatment ──< rehab_plan ──< rehab_session

[Scouting / Marketplace]
  scout ──< scouting_report >── player
  watchlist ──< watchlist_entry >── player
  player_listing ──< listing_offer ──< contract ──< contract_clause

[Finance]
  invoice ──< invoice_line
  invoice ──< payment_allocation >── payment
  journal ──< journal_entry
  subscription_plan ──< subscription ──< subscription_invoice

[Communication / Content]
  message_thread ──< message ──< message_read_receipt
  notification_template ──< notification ──< notification_delivery
  media_asset ──< media_variant
  video_clip ──< video_tag

[AI / Analytics / Audit]
  ai_model ──< ai_model_version ──< ai_prediction
  player ──< player_embedding
  fact_match_event >── dim_player, dim_team, dim_competition, dim_date
  audit_event  (partitioned)   data_access_log  (partitioned)
```

Full per-domain ERDs live under `docs/erd/*.mmd` and are generated from this catalogue during the schema build phase.

---

# 6. Reference Data

Reference tables are small, slow-changing, and cached. Each row carries `id`, `code`, `name`, `translations` (jsonb), `is_active`, plus the Standard Column Contract (tenant_id nullable — most reference data is platform-global).

| Table | Seed Source | Notes |
|---|---|---|
| `country` | ISO 3166-1 alpha-2/3 | includes FIFA code |
| `province` / `city` / `district` | National gazetteer per country | postgis point + polygon |
| `language` | ISO 639-1 | drives i18n |
| `currency` | ISO 4217 | with minor units |
| `timezone` | IANA tz db | |
| `position` | goalkeeper, defender(cb/lb/rb), midfielder(dm/cm/am), forward(lw/rw/st) | hierarchical |
| `foot_preference` | left, right, both | |
| `body_side` | left, right, bilateral | for injuries |
| `competition_type` | league, cup, knockout, tournament, friendly | |
| `competition_format` | round_robin, double_round_robin, single_elim, double_elim, group_then_ko, swiss | |
| `age_category` | U9, U11, U13, U15, U17, U19, U21, Senior, Veteran | with cutoff rules |
| `gender` | male, female, mixed, non_binary | |
| `player_status` | prospect, active, on_loan, injured, suspended, retired, deceased | |
| `staff_status` | active, on_leave, terminated | |
| `medical_status` | fit, limited, unfit, recovering | |
| `injury_type` | muscle, ligament, fracture, concussion, tendon, contusion, illness | |
| `injury_severity` | minimal, mild, moderate, severe, career_ending | days-lost bands |
| `training_category` | technical, tactical, physical, mental, recovery | |
| `training_intensity` | low, moderate, high, maximal | RPE bands |
| `card_type` | yellow, second_yellow, red, blue (futsal) | |
| `event_type` | goal, own_goal, penalty, missed_penalty, assist, yellow, red, sub_in, sub_out, injury, var_review, offside, corner, foul | |
| `payment_status` | pending, authorized, captured, failed, refunded, disputed, void | |
| `payment_method` | card, bank_transfer, wallet, mobile_money, cash, offline | |
| `notification_type` | system, match, registration, medical, finance, marketing | |
| `document_type` | consent, medical, contract, id, photo, certificate | |
| `id_document_type` | passport, national_id, birth_certificate, residence_permit | |
| `contract_type` | professional, semi_pro, amateur, loan, image_rights, representation | |
| `transfer_type` | permanent, loan, free, buyback, exchange | |
| `sanction_type` | warning, fine, match_ban, point_deduction, competition_expulsion | |
| `data_classification` | public, internal, confidential, restricted | |

Reference tables are managed via versioned seed migrations; edits produce audit rows in `audit.change_history`.

---

# 7. Transaction Tables

High-volume, mutable or append-only tables that drive daily operations.

| Table | Write Profile | Key Characteristics |
|---|---|---|
| `match_event` | 30–200 rows / match | partitioned monthly; append-only |
| `match_statistic` | ~50 rows / player / match | partitioned monthly |
| `player_registration` | seasonal bursts | high read, moderate write |
| `training_attendance` | daily per session | wide fan-out, small rows |
| `player_load_metric` | multi-daily per player | time-series; brin index |
| `wellness_survey` | daily per player | time-series |
| `notification_delivery` | very high | partitioned monthly; retention 90d |
| `message` | high | partitioned by thread month |
| `payment` | moderate | strong consistency; audit-heavy |
| `journal_entry` | 2× every posting | append-only; balanced |
| `ai_feature_value` | continuous | partitioned monthly |
| `ai_prediction` | continuous | keyed by model_version |
| `audit_event` | very high | partitioned monthly; append-only |
| `data_access_log` | very high | partitioned monthly |

**Contracts:**
- Idempotency key on all client-originated inserts (`match_event`, `payment`, `notification`).
- Optimistic locking on `match`, `player_registration`, `transfer_request`, `contract`.
- Business-time (`occurred_at`) always distinct from system-time (`created_at`).

---

# 8. Analytics Tables

Star schema kept in `analytics` schema, populated by CDC + scheduled jobs.

**Dimensions:** `dim_player`, `dim_team`, `dim_club`, `dim_academy`, `dim_competition`, `dim_competition_edition`, `dim_season`, `dim_venue`, `dim_official`, `dim_tenant`, `dim_date`, `dim_time`, `dim_position`, `dim_age_category`.
- Slowly-Changing Dimensions Type 2 for `dim_player`, `dim_team`, `dim_club` (career changes preserved).

**Facts:** `fact_match_result`, `fact_match_event`, `fact_player_appearance`, `fact_player_stat_daily`, `fact_training_load_daily`, `fact_registration`, `fact_transfer`, `fact_revenue`, `fact_notification_engagement`.

**Aggregates:** `agg_standings_daily`, `agg_player_form_7d`, `agg_club_squad_value`, `agg_academy_pipeline`, `agg_referee_workload`.

All facts carry `tenant_id` and `date_id`; grain is documented per fact in the data catalogue.

---

# 9. Audit Tables

| Table | Purpose |
|---|---|
| `audit_event` | Structured mutation log (append-only, monthly partitions) |
| `change_history` | Row-level `before`/`after` snapshots for restricted entities |
| `data_access_log` | Read-access log for PII/PHI/Financial |
| `pii_access_log` | Field-level PII access with justification code |
| `login_attempt` | Auth attempts (success/fail), IP, device, geo |
| `security_incident` | Detected anomalies, escalations, resolutions |
| `export_request` | Data subject access request (DSAR) exports |
| `erasure_request` | Right-to-be-forgotten workflow (with legal-hold checks) |
| `consent_record` | Consent grants/withdrawals with hash of shown text |
| `legal_hold` | Locks that prevent deletion during litigation/regulation |

All audit tables are **append-only** with revoke-on-write UPDATE/DELETE; managed retention through partition drop + WORM export.

---

# 10. Reporting Views

Non-materialized SQL views for real-time dashboards (read from OLTP via replicas):

| View | Purpose |
|---|---|
| `vw_active_players_by_club` | live headcount by club, age category, gender |
| `vw_upcoming_fixtures` | next 7 days per tenant/competition |
| `vw_pending_registrations` | approvals queue per club/federation |
| `vw_open_medical_clearances` | fit/unfit status per team |
| `vw_referee_availability` | referee assignment windows |
| `vw_open_invoices` | AR aging by tenant |
| `vw_subscription_health` | MRR, churn, active seats per tenant |
| `vw_notification_delivery_health` | success/failure by channel/last 24h |
| `vw_passport_recent_events` | last N passport events per player |
| `vw_squad_snapshot` | current squad by team with positions and status |

Views enforce RLS by inheriting from underlying tables (`security_invoker=on`).

---

# 11. Materialized Views

Refreshed on schedule; used where reporting views are too expensive.

| Materialized View | Refresh | Purpose |
|---|---|---|
| `mv_standings_current` | after each match completion + hourly | league tables per edition |
| `mv_top_scorers` | hourly during season | leaderboards |
| `mv_player_career_summary` | nightly | aggregated per-player career stats |
| `mv_club_squad_value` | nightly | market-value proxy |
| `mv_academy_pipeline_funnel` | nightly | prospect → contracted funnel |
| `mv_referee_performance` | weekly | cards/fouls/complaints per official |
| `mv_tenant_usage_daily` | daily | active users, matches, storage, API calls |
| `mv_finance_daily_snapshot` | daily | AR/AP/cash by tenant |
| `mv_talent_similarity_topN` | nightly (per model version) | precomputed nearest-neighbor pairs |

All materialized views carry `tenant_id` in the primary key to preserve RLS via wrapper views.

---

# 12. Recommended PostgreSQL Indexes

**Guiding rules**
- Every FK has a supporting btree index (Postgres does not auto-create).
- Every partitioned table indexes the partition key (`occurred_at`, `created_at`).
- Use `brin` for append-only time-series (`match_event`, `audit_event`, `player_load_metric`).
- Use `gin` on `jsonb` `payload` columns queried by key.
- Use `gin_trgm_ops` for name search (`person`, `club`, `player`).
- Use `ivfflat` (or `hnsw` when available) on `vector` embeddings.
- Composite indexes lead with `tenant_id` for RLS-friendly plans.
- Partial indexes for `deleted_at IS NULL` on high-cardinality tables to keep hot indexes small.
- Unique indexes for natural keys (`player_code`, `invoice_number`, `tenant.code`).
- Covering indexes (`INCLUDE`) for hot reporting queries where profitable.

**Representative recommendations**

| Table | Index Type | Columns |
|---|---|---|
| `match_event` | btree | (`tenant_id`,`match_id`,`occurred_at`) |
| `match_event` | brin | (`occurred_at`) |
| `match_event` | gin | (`payload`) |
| `player_registration` | unique partial | (`tenant_id`,`season_id`,`player_id`) WHERE `status='approved'` |
| `player` | gin_trgm | (`family_name`,`given_name`) |
| `player_embedding` | ivfflat cosine | (`embedding`) |
| `audit_event` | btree | (`tenant_id`,`entity_table`,`entity_id`,`occurred_at`) |
| `notification_delivery` | btree | (`tenant_id`,`status`,`created_at`) partial WHERE `status IN ('pending','failed')` |
| `invoice` | unique | (`tenant_id`,`invoice_number`) |
| `standings_snapshot` | btree | (`competition_edition_id`,`as_of`) DESC |
| `person` | encrypted-hash | HMAC index on `id_document_number` for equality lookups on encrypted PII |

---

# 13. Partitioning Strategy

**Range partitioning by month** (default) via `pg_partman`:
- `match_event`, `match_statistic`, `audit_event`, `data_access_log`, `notification_delivery`, `message`, `ai_feature_value`, `player_load_metric`, `wellness_survey`.

**List partitioning by `tenant_id`** — reserved for the top ~20 largest tenants only, applied to `match_event` and `audit_event` sub-partitions when a tenant crosses the "noisy neighbor" threshold. Default remains shared partitions.

**Hash partitioning** — considered for `ai_feature_value` if per-model cardinality justifies it.

**Rules:**
- Retention windows drive partition detach + archive.
- Global indexes avoided; local indexes per partition.
- Constraint exclusion + partition pruning validated in query plans during CI performance tests.
- Rolling window: 24 monthly partitions online for `match_event`; older detached to cold storage.

---

# 14. Archiving Strategy

| Data Class | Hot | Warm | Cold | Purge |
|---|---|---|---|---|
| Match events | 24 months | 24–60 months (replica) | > 5 years (object storage, Parquet) | never (historical record) |
| Notifications | 90 days | 90–365 days | > 1 year (S3) | 3 years |
| Audit — financial | 24 months | 5 years | > 5 years (WORM) | 7 years |
| Audit — minor-related | 24 months | 10 years | 10+ years (WORM) | never before majority + 7 |
| Sessions/logins | 90 days | 1 year | 2 years | 2 years |
| Medical | until majority + 10 years | — | WORM archive | per jurisdiction |
| Finance ledger | current FY + 1 | 7 years | WORM | 10 years |

Archive pipeline: partition detach → export to Parquet → checksum → catalog in `analytics` metastore → drop.

Restore SLA: warm 4h, cold 24h.

---

# 15. Backup Strategy

- **PITR (Point-in-Time Recovery):** continuous WAL archiving; 35-day recovery window on production.
- **Snapshots:** automated daily encrypted snapshots retained 30 days; weekly retained 12 weeks; monthly retained 24 months.
- **Cross-region replication:** async streaming replica in secondary region for DR.
- **Logical exports:** nightly `pg_dump --format=custom` of small critical tables (governance, reference) for granular restore.
- **Verified restores:** monthly automated restore drill into an isolated project; validation queries assert row counts and checksums.
- **RPO / RTO:** RPO ≤ 5 minutes; RTO ≤ 1 hour for primary region; ≤ 4 hours for cross-region failover.
- **Encryption:** backups encrypted with customer-managed keys (CMK); keys rotated annually.
- **Immutable backups** for audit/finance/medical using object-lock (WORM).

---

# 16. Security Strategy

**Defense in depth**
1. **Network:** private networking, IP allowlists, TLS 1.3 in transit, no direct database exposure.
2. **AuthN:** Supabase Auth with MFA required for staff; SSO (OIDC/SAML) for federations.
3. **AuthZ:** RBAC (role → permission) + ABAC (tenant, org scope, resource ownership) enforced via RLS + security-definer functions (`has_permission`, `is_org_member`).
4. **Encryption at rest:** AES-256; column-level encryption via `pgcrypto` for `id_document_number`, medical notes, bank details, phone hashes.
5. **Key management:** CMK in KMS; app-layer envelope encryption for restricted PII; keys never in application code.
6. **Secrets:** managed via Supabase secrets / vault; no secrets in migrations.
7. **Auditing:** `pgaudit` for privileged sessions; every DDL captured; every restricted read logged in `data_access_log`.
8. **Data classification:** every column tagged (`public`, `internal`, `confidential`, `restricted`); classification drives masking, export, and log rules.
9. **Data masking:** dynamic masking policies for non-privileged roles in reporting views.
10. **Compliance:** GDPR-equivalent DSAR pipeline (`export_request`, `erasure_request`); minors safeguarded (age-gated flows, guardian consent, no marketing).
11. **Threat controls:** anomaly detection on `login_attempt` and `data_access_log`; rate limiting; brute-force lockout; leaked-password checks at signup.
12. **Change control:** all schema changes via reviewed migrations with peer approval and CI checks (lint, RLS-coverage, index-coverage).
13. **Least privilege:** app role has no superuser; separate roles for migration, read replica, analytics; per-role grants; no direct table grants on `restricted` classification.

---

# 17. RLS Strategy

**Principles**
- RLS is enabled on **every** table in `public`, `people`, `passport`, `registration`, `competition`, `match`, `training`, `medical`, `scouting`, `marketplace`, `finance`, `communication`, `content`, `ai`, `analytics`, `audit`.
- The `tenant_id` predicate is the **first line**; role/permission predicates layer on top.
- All policy logic centralized in `SECURITY DEFINER` helper functions to avoid recursion and duplication (`current_tenant_id()`, `current_user_id()`, `has_permission(perm)`, `is_member_of_org(org_id)`, `is_guardian_of(player_id)`, `owns_row(entity, id)`).
- Roles are stored in `user_role_assignment` (never on user or profile rows).

**Standard policy set per table**
- **SELECT:** `tenant_id = current_tenant_id() AND deleted_at IS NULL AND has_permission('<entity>.read')` plus scope predicates (own org, own player, guardian link, assigned scout).
- **INSERT:** `tenant_id = current_tenant_id() AND has_permission('<entity>.create')`; forced tenant_id via `WITH CHECK`.
- **UPDATE:** ownership OR elevated permission; version check enforced at app layer.
- **DELETE:** normally forbidden; soft-delete via UPDATE `deleted_at`; hard delete restricted to retention job service role.

**Sensitive-domain overlays**
- **Medical:** additionally requires `has_permission('medical.read')` AND (`is_medical_staff_for(player)` OR `is_guardian_of(player)` OR self).
- **Finance:** requires finance role AND org scope; PII columns masked in non-finance roles.
- **Minor players:** RLS blocks marketing notifications and public exposure regardless of tenant policy.
- **Passport events:** read allowed to federation officials + player + guardian; write only via service role trigger.

**Bypass surfaces**
- Service role bypasses RLS and is used only in verified server-side jobs (retention, ML training, audit export). Never called from client bundles.
- All bypass usage logged in `audit_event` with `classification='restricted'`.

**Testing**
- CI includes RLS coverage tests: for every table, a suite of positive/negative cases across roles, tenants, and ownership scopes.

---

# 18. Performance Optimization

- **Query design:** always filter on `tenant_id` first to leverage index prefix; avoid `SELECT *` in APIs; paginate with keyset (id + created_at) not OFFSET.
- **Indexing:** see §12; enforce index-coverage CI (no seq scan on hot tables >10 MB).
- **Partition pruning:** all date-range queries include `occurred_at` bounds.
- **Connection pooling:** PgBouncer transaction pooling; per-tenant fairness via query timeouts.
- **Read replicas:** analytical and reporting workloads routed to replicas; app never blocks OLTP on analytics.
- **Async work:** notifications, standings recompute, embedding generation via job queue (pg_cron + worker), never in request path.
- **Caching:** `stale-while-revalidate` for reference data at API edge; ETag on read endpoints.
- **Vacuum/autovacuum:** tuned per table; aggressive on high-churn tables; scheduled `REINDEX CONCURRENTLY` monthly on hot indexes.
- **Statistics:** `default_statistics_target=200`; extended stats on multi-column predicates (`tenant_id`,`status`).
- **Slow query budget:** p95 < 300 ms, p99 < 1 s; `pg_stat_statements` monitored; regressions gated in CI perf tests.
- **Bulk operations:** COPY for ingest; chunked writes for CDC; deferred triggers on batch imports.
- **JSONB discipline:** only for genuinely schemaless payloads; promote hot keys to real columns.
- **Vector search:** limit `ivfflat` probes; pre-filter by tenant + cohort before ANN.

---

# 19. Scaling Strategy

**Vertical**
- Right-size compute per tenant tier; separate primary/read replicas; NVMe storage for OLTP.

**Horizontal read**
- N read replicas, geo-routed; replica lag SLO ≤ 3 s for reporting reads.

**Horizontal write**
- Time-based partitioning (default) reduces write hot-spots per partition.
- Tenant-based sub-partitioning for the largest federations.
- Sharding roadmap: if the platform exceeds a single-primary throughput ceiling, shard by `tenant_id` using Citus / logical sharding, with cross-shard queries reserved for platform-owner analytics via CDC-fed warehouse.

**Workload isolation**
- Separate roles/pools for OLTP, analytics, jobs, admin.
- Long-running analytics banned on primary.

**Storage tiering**
- Hot: primary + fast NVMe.
- Warm: replica + standard SSD.
- Cold: object storage (Parquet, encrypted).
- Archive: WORM object storage with legal hold.

**Elastic compute for AI**
- Feature generation and embedding training on external compute; write back predictions to `ai_prediction` in batch.

**Global rollout**
- Multi-region strategy: per-region primary with tenants pinned to a region for data residency; cross-region only for anonymized analytics.

**Capacity planning**
- Growth model tracked per tenant: matches/day, events/match, players, media MB/day, notifications/day. Alarms at 60/80/90% of headroom trigger scale actions.

---

# 20. Future Database Expansion

**Near-term (0–6 months)**
- Native `hnsw` vector index for larger embedding catalogues.
- `pgvectorscale` and quantized vectors to reduce ANN cost.
- Federation-wide fixture-conflict solver as a materialized graph.

**Mid-term (6–18 months)**
- **Graph layer** for scouting/agent/representation relationships via Apache AGE or an external graph store fed by CDC.
- **Time-series store** (TimescaleDB or Citus columnar) for GPS/tracking data.
- **Event store** for a full CQRS/ES adoption in Match and Passport contexts.
- **Multi-region active-active** for read paths (async write follower per region).

**Long-term (18–36 months)**
- **Federated data mesh:** each domain owns its data products; consumers query via governed contracts.
- **Zero-copy analytics:** Iceberg tables on object storage, queried via a lakehouse engine; Postgres stays OLTP.
- **Privacy-preserving analytics:** differential privacy layer for public-facing aggregates about minors.
- **On-device inference cache:** signed prediction bundles for offline match-day devices.

**Data product roadmap**
- Player 360, Club 360, Academy 360, Referee 360, Competition Health, Federation Compliance, Injury Risk, Talent Similarity, Fair-Play Index, Financial Solvency Index — each formalized as a governed data product with SLAs, owner, and access policy.

---

**End of Enterprise Data Architecture v1.0**
