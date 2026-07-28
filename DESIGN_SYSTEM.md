# Touchline — Enterprise Design System

**Document type:** Design System Specification (single source of truth)
**Status:** v1.0.0 — Approved baseline
**Audience:** Product Designers, UX Architects, Frontend Engineers, QA, Accessibility reviewers
**Scope:** All Touchline surfaces — Platform Owner, Federation, Provincial/District Association, Academy, Football School (SSB), Club, Coach, Parent, Player, Referee, Scout, Public Visitor.

> This document is specification only. No implementation code, no React components, no CSS. Token values are expressed as design values, not stylesheets.

---

## 0. Table of Contents

| # | Section |
|---|---------|
| 1 | Design Language |
| 2 | Color System |
| 3 | Typography System |
| 4 | Spacing System |
| 5 | Border Radius |
| 6 | Shadow & Elevation |
| 7 | Icon System |
| 8 | Animation System |
| 9 | Breakpoints |
| 10 | Accessibility (WCAG 2.2 AA) |
| 11 | Responsive Rules |
| 12 | Component Library Standards |
| 13 | Form Design Standards |
| 14 | Table Design Standards |
| 15 | Dashboard Design |
| 16 | Layout System |
| 17 | Navigation System |
| 18 | Page Template Library |
| 19 | Design Tokens (master reference) |
| 20 | Design Governance |
| 21 | Checklists |

---

# 1. Design Language

## 1.1 Brand Vision

Touchline is the **operating system of a national football ecosystem**. The interface must feel like infrastructure a federation can run a season on — calm, precise, verifiable — while still feeling like a product a 14-year-old player and their parent enjoy opening on a phone.

**Vision statement:** *Every player counted. Every match trusted. Every decision evidenced.*

## 1.2 Brand Personality

| Trait | Expression in UI | Anti-pattern |
|---|---|---|
| **Trustworthy** | Verified badges, provenance timestamps, audit trails visible | Unlabelled "magic" AI output |
| **Precise** | Exact numbers, units, effective dates; no vague "recently" | Rounded/fuzzy stats without tooltips |
| **Composed** | Generous whitespace, restrained color, one accent per screen | Rainbow dashboards |
| **Athletic** | Confident type, decisive motion, strong numeric display | Bouncy, playful, cartoon motion |
| **Inclusive** | Plain language, high contrast, large touch targets | Jargon-only labels, dense mobile tables |

## 1.3 Brand Voice

- **Clear over clever.** "Registration closes 12 Aug, 23:59" not "Hurry — spots vanishing!"
- **Second person, active voice.** "Upload the birth certificate" not "The birth certificate must be uploaded".
- **Consequence-first for destructive actions.** "This removes the player from the squad list for Round 4."
- **Never blame the user.** "That file is larger than 10 MB" not "You uploaded an invalid file".
- **Minor-safe tone.** Any surface visible to under-18 users avoids commercial pressure, ranking shaming, and body/weight language.

| Context | Voice |
|---|---|
| Governance / compliance | Formal, unambiguous, cites the rule |
| Coach & match-day | Terse, imperative, glanceable |
| Parent & player | Warm, reassuring, explains the "why" |
| Public visitor | Editorial, celebratory, brand-forward |

## 1.4 Visual Identity

- **Core mark:** a touchline — a single decisive horizontal rule. Used as the section divider motif and the active-nav indicator across the product.
- **Signature device:** the *pitch grid* — a 4px-based orthogonal grid, visible only as alignment discipline, never as decoration.
- **Color strategy:** deep pitch-green primary, ink-navy neutral scale, one warm accent for attention. Green means brand, not "success" — success has its own token.
- **Photography-light:** the product is data-first. Imagery appears in public and profile surfaces only.
- **Density:** two supported densities — `comfortable` (default) and `compact` (opt-in, data tables and match-day only).

## 1.5 Emotional Experience

| Moment | Target emotion | Design lever |
|---|---|---|
| First login | Oriented, not overwhelmed | Role-shaped empty dashboard with 3 quick actions |
| Player ID verified | Pride, legitimacy | Verified state animation ≤ 400 ms, shareable card |
| Match-day event capture | Focus, zero anxiety | Compact layout, offline badge, undo always available |
| Registration rejected | Respected, guided | Reason + exact fix + resubmit CTA in one card |
| Medical/injury surfaces | Serious, private | Muted palette, explicit access notice, no celebratory motion |

## 1.6 Visual Hierarchy

Priority order on every screen: **Identity → Status → Primary action → Data → Secondary actions → Meta.**

Rules:
1. Exactly one primary (filled) button per view region.
2. Status is communicated by badge + text, never color alone.
3. Numbers outrank labels: statistic values use Display/Statistic styles, labels use Label style at `text-muted`.
4. Maximum 3 levels of visual weight per card.
5. Page title is the only H1. Section titles are H2. Card titles are H3.

## 1.7 Content Hierarchy

| Level | Content | Style |
|---|---|---|
| L1 | Page identity + entity name | Headline, `text-primary-fg` |
| L2 | Status, compliance state, dates | Badge + Caption |
| L3 | Primary metrics | Statistic |
| L4 | Supporting records / tables | Body / Table |
| L5 | Provenance: created by, last updated, version | Caption, `text-muted` |

**Truncation rule:** entity names truncate at the end with an ellipsis and expose the full value via tooltip and `title`. IDs never truncate — they wrap.

## 1.8 Spacing Philosophy

- Space is the primary grouping tool; borders are secondary; background fills are last.
- Related elements: `space-2`/`space-3`. Sibling groups: `space-6`. Sections: `space-10`/`space-12`.
- Never mix ad-hoc values — every gap must map to a spacing token.
- Whitespace scales with viewport, not with content volume.

## 1.9 Interaction Philosophy

- **Predictable:** the same control does the same thing everywhere.
- **Reversible:** every destructive action offers undo (≤ 10 s) or a typed confirmation.
- **Optimistic where safe:** toggles, favorites, reordering. **Pessimistic where governed:** registrations, transfers, finance, match results.
- **One decision per screen** in wizards; one primary action per view.
- **Keyboard parity:** every mouse interaction has a keyboard equivalent.

## 1.10 Consistency Rules

1. One component per job — no bespoke variants outside the library.
2. Tokens only. A raw hex, px, or ms value in a design file is a defect.
3. Identical entities render with the identical card anywhere they appear.
4. Action placement is fixed: primary bottom-right in dialogs, top-right in page headers.
5. Terminology follows the domain glossary (DOMAINS.md); UI never invents synonyms.

## 1.11 Iconography Rules

- Single family, outline, 1.5px stroke, 24px grid (Lucide-compatible geometry).
- Icons support text; icon-only is allowed only for universally understood actions (close, search, more) and always carries an accessible name.
- Never use an icon to convey status alone — pair with a label.
- No filled/outline mixing within one region.
- Custom football/medical icons must be drawn on the same 24px grid with the same stroke and terminals.

## 1.12 Illustration Rules

- Purpose: empty states, onboarding, error pages, marketing only.
- Style: geometric line-art on the pitch grid, 2 colors max (neutral + primary), no gradients, no faces, no skin tones (inclusivity).
- Max one illustration per view; never inside data tables or dashboards.
- Must read correctly at 120px and in dark mode.

## 1.13 Photography Rules

- Documentary, in-action, natural light. No stock-studio posing.
- Aspect ratios: 16:9 (hero/match), 4:3 (facility), 1:1 (avatar), 3:4 (player portrait).
- Overlaid text requires a scrim meeting 4.5:1 contrast.
- **Minor safeguarding:** photos of under-18s require consent state on the record; if consent is absent, render initials avatar — never a placeholder photo of a child.
- All images require meaningful alt text; decorative images use empty alt.

## 1.14 Empty State Philosophy

Every empty state answers three questions: *what is this, why is it empty, what do I do next.*

| Type | Pattern |
|---|---|
| First-use | Illustration + title + 1 sentence + primary action |
| No results (filtered) | Icon + "No results for …" + Clear filters action |
| Permission-empty | Lock icon + who can grant access + Request access |
| Error-empty | Alert + retry + support reference ID |
| Success-empty ("all clear") | Check icon + reassuring line, no action |

Never show a bare "No data".

## 1.15 Loading Philosophy

| Duration | Treatment |
|---|---|
| < 300 ms | No indicator (avoid flicker) |
| 300 ms – 1 s | Inline spinner on the triggering control |
| 1 s – 5 s | Skeleton matching final layout |
| > 5 s | Determinate progress + explanatory copy + cancel |
| Background jobs | Toast on start, notification on completion |

Skeletons mirror real geometry; layout must not shift on load (CLS target ≤ 0.1). Never block the whole page for a partial fetch.

## 1.16 Error Philosophy

Structure: **What happened → Why → What to do → Reference.**

| Class | Surface |
|---|---|
| Field validation | Inline, below field, red text + icon |
| Form-level | Alert at top of form, links to first bad field |
| Permission (403) | Full-region state, explains required role |
| Not found (404) | Page state with search + back |
| Server (5xx) | Page/section state, retry, correlation ID shown |
| Network offline | Persistent banner + queued-changes count |

Never expose stack traces, SQL, or internal identifiers. Always show a copyable correlation ID.

## 1.17 Success Philosophy

- Scale feedback to significance: toast for routine, inline state for contextual, dedicated screen for milestones (Digital ID verified, registration approved, transfer completed).
- Success is confirmed by state change, not only by a toast.
- Toast auto-dismiss 5 s; success messages never carry destructive actions.
- Celebration motion is reserved for player/parent milestones and respects reduced-motion.

## 1.18 Motion Philosophy

Motion explains change: where something came from, where it went, what is loading. It never decorates.

- Enter fast, exit faster. Standard 200 ms; large surfaces 300 ms.
- Motion originates from the trigger point.
- Never animate data values in governance/finance contexts (charts may animate on first paint only).
- `prefers-reduced-motion` replaces all movement with opacity cross-fades ≤ 100 ms.

## 1.19 Micro-Interaction Philosophy

| Interaction | Feedback |
|---|---|
| Hover | Surface elevates one step or background shifts one tint; ≤ 120 ms |
| Press | 98% scale or darker tint; instant |
| Focus | 2px ring + 2px offset, always visible |
| Toggle | Thumb travel 150 ms, color cross-fade |
| Copy ID | Icon morphs to check for 1.2 s |
| Save | Button → spinner → check → label restores after 1.5 s |
| Drag | Source 40% opacity, drop zone dashed border |

---

# 2. Color System

## 2.1 Palette Architecture

Three layers, strictly one-directional:
**Primitive (raw ramps) → Semantic (role tokens) → Component (component-scoped aliases).**
Product surfaces reference **semantic tokens only**.

## 2.2 Primitive Ramps

Notated in OKLCH-friendly perceptual steps 50–950.

### Pitch Green (brand primary)

| Step | Role |
|---|---|
| 50 | Faintest tint, selected-row background |
| 100 | Subtle badge background |
| 200 | Hover on subtle surfaces |
| 300 | Disabled brand fill |
| 400 | Dark-mode accent text |
| 500 | Dark-mode primary fill |
| **600** | **Light-mode primary fill (base)** |
| 700 | Hover on primary |
| 800 | Pressed on primary |
| 900 | Brand ink on light surfaces |
| 950 | Deep brand background |

### Ink Navy (neutral)

Steps 0 (white), 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000 (near-black). Slightly blue-shifted neutrals to pair with the green without muddiness.

### Additional ramps (same 50–950 structure)

| Ramp | Purpose |
|---|---|
| **Kit Amber** | Accent / attention / highlights |
| **Signal Green** | Success (distinct from brand green — more yellow) |
| **Caution Amber** | Warning |
| **Card Red** | Danger / destructive |
| **Sky Blue** | Info / neutral system messaging |
| **Violet** | Analytics & AI-derived content (always paired with an "AI" label) |

### Data-visualization categorical ramp

8 hues, colorblind-tested (deuteranopia/protanopia), ordered for sequential use: Teal, Indigo, Amber, Magenta, Cyan, Lime, Orange, Slate. Sequential and diverging ramps are derived separately for heatmaps.

## 2.3 Semantic Color Tokens

| Token | Meaning | Light source | Dark source |
|---|---|---|---|
| `color.bg.canvas` | App background | Neutral 50 | Neutral 950 |
| `color.bg.surface` | Card / panel | Neutral 0 | Neutral 900 |
| `color.bg.surface.raised` | Popover, dropdown, modal | Neutral 0 | Neutral 800 |
| `color.bg.surface.sunken` | Wells, code, table head | Neutral 100 | Neutral 950 |
| `color.bg.subtle` | Hover on rows | Neutral 100 | Neutral 800 |
| `color.bg.inverse` | Tooltip, toast dark | Neutral 900 | Neutral 100 |
| `color.text.primary` | Body & headings | Neutral 900 | Neutral 50 |
| `color.text.secondary` | Supporting copy | Neutral 700 | Neutral 300 |
| `color.text.muted` | Labels, meta | Neutral 500 | Neutral 400 |
| `color.text.disabled` | Disabled label | Neutral 400 | Neutral 600 |
| `color.text.inverse` | On dark/filled | Neutral 0 | Neutral 950 |
| `color.text.link` | Hyperlink | Sky 700 | Sky 400 |
| `color.border.subtle` | Dividers | Neutral 200 | Neutral 800 |
| `color.border.default` | Inputs, cards | Neutral 300 | Neutral 700 |
| `color.border.strong` | Emphasis, focus-within | Neutral 400 | Neutral 600 |
| `color.primary.bg` | Primary fill | Green 600 | Green 500 |
| `color.primary.bg.hover` | | Green 700 | Green 400 |
| `color.primary.bg.pressed` | | Green 800 | Green 300 |
| `color.primary.fg` | Text on primary | Neutral 0 | Neutral 950 |
| `color.primary.subtle` | Tinted background | Green 50 | Green 950 |
| `color.primary.text` | Brand text | Green 700 | Green 400 |
| `color.secondary.*` | Neutral-filled actions | Neutral 100/200/300 | Neutral 800/700/600 |
| `color.accent.*` | Highlights, promos | Kit Amber 500 family | Kit Amber 400 family |
| `color.success.{bg,subtle,fg,text,border}` | Signal Green family | | |
| `color.warning.{…}` | Caution Amber family | | |
| `color.danger.{…}` | Card Red family | | |
| `color.info.{…}` | Sky Blue family | | |
| `color.state.hover` | Generic hover overlay | Neutral @ 4% | Neutral 0 @ 6% |
| `color.state.pressed` | Generic press overlay | Neutral @ 8% | Neutral 0 @ 10% |
| `color.state.selected` | Selected row/nav | Green 50 | Green 950 |
| `color.state.disabled.bg` | | Neutral 100 | Neutral 800 |
| `color.focus.ring` | Focus indicator | Sky 600 | Sky 400 |
| `color.focus.ring.offset` | Ring offset | = canvas | = canvas |
| `color.overlay.scrim` | Modal backdrop | Neutral 950 @ 50% | Neutral 950 @ 65% |

### Domain overlay tokens

| Token | Use |
|---|---|
| `color.domain.medical` | Medical surfaces accent (muted teal) — signals confidentiality |
| `color.domain.finance` | Finance accent (indigo) |
| `color.domain.governance` | Compliance accent (slate) |
| `color.domain.ai` | AI/derived content (violet) — mandatory with an "AI generated" label |
| `color.domain.minor` | Minor-protected content marker (amber outline) |

## 2.4 Status Semantics (canonical)

| Status | Token family | Icon | Never |
|---|---|---|---|
| Verified / Approved / Paid | success | Check-circle | Use brand green |
| Pending / Awaiting review | warning | Clock | Use gray (reads as disabled) |
| Rejected / Suspended / Overdue | danger | X-circle | Rely on red alone |
| Draft / Archived | neutral | File / Archive | Use warning |
| Informational / Scheduled | info | Info / Calendar | Use primary |
| Live / In progress | accent + pulse dot | Dot | Animate in reduced-motion |

## 2.5 Dark Mode Rules

1. Dark mode is a token remap, never a separate design.
2. Elevation is expressed by **lighter surfaces**, not stronger shadows.
3. Never pure black (`#000`) or pure white text; use Neutral 950 / Neutral 50.
4. Saturated fills drop one step (600 → 500) to prevent glare.
5. Images and charts get a 4–8% desaturation layer.
6. Contrast must be re-verified per mode — passing light does not imply passing dark.

## 2.6 Contrast Requirements

| Content | Minimum |
|---|---|
| Body text ≤ 18.66px | 4.5:1 |
| Large text ≥ 24px or ≥ 18.66px bold | 3:1 |
| Icons & UI boundaries | 3:1 |
| Focus indicator vs adjacent | 3:1 |
| Chart series against surface | 3:1 |
| Disabled content | exempt, but must not be the only state |

**Do:** Badge = dot + label + color.
**Don't:** Row highlighted only by a pale red background.

---

# 3. Typography System

## 3.1 Type Families

| Role | Family | Rationale |
|---|---|---|
| UI / body | **Inter** (variable) | Neutral, superb at small sizes, wide language coverage |
| Display / headline | **Space Grotesk** | Athletic, geometric, distinctive without novelty |
| Numeric / tabular | **Inter — tabular figures** | Aligned columns for scores, money, standings |
| Mono | **JetBrains Mono** | IDs, correlation refs, API keys |

Fallback stack: system-ui → Segoe UI → Roboto → Helvetica Neue → Arial → sans-serif. Latin Extended + Cyrillic subsets loaded; other scripts load on demand.

## 3.2 Type Scale (1.200 minor-third for display, 1.125 for UI)

| Token | Size | Line height | Weight | Tracking | Family | Use |
|---|---|---|---|---|---|---|
| `type.display.xl` | 60 | 64 (1.07) | 700 | −0.02em | Display | Marketing hero |
| `type.display.lg` | 48 | 52 (1.08) | 700 | −0.02em | Display | Public page hero |
| `type.display.md` | 36 | 40 (1.11) | 700 | −0.015em | Display | Section hero |
| `type.headline.lg` | 30 | 38 (1.27) | 600 | −0.01em | Display | Page H1 |
| `type.headline.md` | 24 | 32 (1.33) | 600 | −0.01em | UI | Section H2 |
| `type.title.lg` | 20 | 28 (1.4) | 600 | 0 | UI | Card title, dialog title |
| `type.title.md` | 18 | 26 (1.44) | 600 | 0 | UI | Sub-section H3 |
| `type.subtitle` | 16 | 24 (1.5) | 500 | 0 | UI | Lead paragraph, card subtitle |
| `type.body.lg` | 16 | 26 (1.63) | 400 | 0 | UI | Long-form reading |
| `type.body.md` | 14 | 22 (1.57) | 400 | 0 | UI | **Default body** |
| `type.body.sm` | 13 | 20 (1.54) | 400 | 0 | UI | Dense contexts |
| `type.caption` | 12 | 16 (1.33) | 400 | 0.01em | UI | Meta, timestamps, helper |
| `type.label.md` | 14 | 20 | 500 | 0 | UI | Form labels |
| `type.label.sm` | 12 | 16 | 500 | 0.02em | UI | Overline, table headers (uppercase) |
| `type.button.lg` | 16 | 24 | 600 | 0 | UI | Large button |
| `type.button.md` | 14 | 20 | 600 | 0 | UI | Default button |
| `type.button.sm` | 13 | 18 | 600 | 0 | UI | Small button |
| `type.table.header` | 12 | 16 | 600 | 0.04em, uppercase | UI | Column header |
| `type.table.cell` | 14 | 20 | 400 | 0 | UI | Cell |
| `type.table.cell.num` | 14 | 20 | 500 | 0, tabular | UI | Numeric cell |
| `type.stat.xl` | 40 | 44 | 700 | −0.02em, tabular | Display | Hero KPI |
| `type.stat.lg` | 32 | 36 | 700 | −0.02em, tabular | Display | KPI card |
| `type.stat.md` | 24 | 28 | 600 | −0.01em, tabular | UI | Inline stat |
| `type.code` | 13 | 20 | 400 | 0 | Mono | IDs, references |

## 3.3 Weights

100–900 variable axis exposed as: Regular 400, Medium 500, Semibold 600, Bold 700. **Light (300) and Black (900) are not permitted in product UI.**

## 3.4 Typographic Rules

- Measure: 60–75 characters for prose (`max-w-prose`); unlimited for tables.
- Never center-align paragraphs > 2 lines.
- Sentence case everywhere except `type.label.sm` and table headers (uppercase).
- Numbers in tables and stats always use **tabular lining figures**.
- Currency: symbol + non-breaking space + tabular amount; negative values in parentheses in finance contexts.
- Dates: `DD MMM YYYY` display, ISO-8601 in exports, always with timezone for match times.
- No text below 12px anywhere, including charts and legends.
- Line-height never below 1.3 for multi-line text.
- Localization headroom: layouts must tolerate +35% string length.

---

# 4. Spacing System

## 4.1 Base Grid

**4px base unit.** All spacing, sizing, and positioning are multiples of 4. Icon and control heights snap to the same grid.

## 4.2 Spacing Tokens

| Token | Value | Typical use |
|---|---|---|
| `space.0` | 0 | Reset |
| `space.px` | 1 | Hairline offsets |
| `space.0.5` | 2 | Icon-to-text nudge |
| `space.1` | 4 | Tight inline gap |
| `space.2` | 8 | Icon ↔ label, chip padding |
| `space.3` | 12 | Input inner padding, list row gap |
| `space.4` | 16 | Default component gap, card padding (compact) |
| `space.5` | 20 | Form field vertical rhythm |
| `space.6` | 24 | Card padding (comfortable), grid gutter |
| `space.8` | 32 | Group separation |
| `space.10` | 40 | Section gap (mobile) |
| `space.12` | 48 | Section gap (desktop) |
| `space.16` | 64 | Page top/bottom padding |
| `space.20` | 80 | Marketing band |
| `space.24` | 96 | Hero band |

## 4.3 Container Widths

| Token | Max width | Use |
|---|---|---|
| `container.xs` | 480 | Auth cards, OTP, single-field flows |
| `container.sm` | 640 | Wizards, single-column forms |
| `container.md` | 768 | Reading / documentation |
| `container.lg` | 1024 | Detail pages |
| `container.xl` | 1280 | **Default app content** |
| `container.2xl` | 1440 | Dashboards, wide tables |
| `container.full` | 100% | Data grids, match-day, timelines |

Gutters: 16 (mobile), 24 (tablet), 32 (desktop), 40 (≥1440).

## 4.4 Contextual Spacing Rules

| Context | Rule |
|---|---|
| Section gaps | `space.12` desktop, `space.10` mobile |
| Card padding | `space.6` comfortable / `space.4` compact; header ↔ body `space.4` |
| Card grid gutter | `space.6` desktop, `space.4` mobile |
| Form: label ↔ control | `space.1.5` (6) |
| Form: control ↔ helper/error | `space.1.5` (6) |
| Form: field ↔ field | `space.5` |
| Form: fieldset ↔ fieldset | `space.8` with divider |
| Form actions | `space.8` above, right-aligned desktop, full-width stacked mobile |
| Dashboard widget gap | `space.6` |
| Dashboard page padding | `space.8` desktop, `space.4` mobile |
| Table cell padding | 12×16 comfortable, 8×12 compact |
| Sidebar item padding | 8×12, item gap `space.1` |
| Inline button group gap | `space.2` |

---

# 5. Border Radius

| Token | Value | Applied to |
|---|---|---|
| `radius.none` | 0 | Table cells, full-bleed media, data grid |
| `radius.sm` | 4 | Chips, tags, small badges, checkboxes |
| `radius.md` | 8 | **Buttons, inputs, selects, tooltips** |
| `radius.lg` | 12 | Cards, popovers, dropdown menus |
| `radius.xl` | 16 | Modals, drawers, bottom sheets, feature panels |
| `radius.2xl` | 24 | Marketing/hero panels only |
| `radius.full` | 9999 | Avatars, pills, switches, FAB, status dots |

Rules: nested radius = outer − padding (min `radius.sm`); never mix more than two radii in one composite; media inside a card inherits the card radius on the clipped corners only.

---

# 6. Shadow & Elevation

Shadows are two-layer (ambient + key), tinted with the neutral hue — never pure black.

| Token | Elevation | Spec (light) | Use |
|---|---|---|---|
| `shadow.none` | 0 | none | Flat rows, table |
| `shadow.xs` | 1 | 0 1px 2px −1px / 0 1px 3px | Cards at rest, inputs |
| `shadow.sm` | 2 | 0 2px 4px −2px / 0 4px 6px | Card hover, raised chips |
| `shadow.md` | 3 | 0 4px 6px −4px / 0 10px 15px | Dropdown, popover, combobox |
| `shadow.lg` | 4 | 0 8px 10px −6px / 0 20px 25px | Drawer, sticky bars, command palette |
| `shadow.xl` | 5 | 0 12px 16px −8px / 0 25px 50px | Modal dialog, bottom sheet |
| `shadow.focus` | — | 0 0 0 2px offset + 0 0 0 4px ring | Focus indicator |
| `shadow.inner` | — | inset 0 2px 4px | Wells, pressed segmented control |

Dark mode: shadow opacity is halved and elevation is additionally expressed as a lighter surface + 1px `border.subtle`. Elevation may never jump more than one level on hover.

---

# 7. Icon System

## 7.1 Sizes

| Token | Size | Use |
|---|---|---|
| `icon.xs` | 12 | Inline caption, badge dot pair |
| `icon.sm` | 16 | Buttons, inputs, table cells, menu items |
| `icon.md` | 20 | Sidebar nav, tabs, toolbar |
| `icon.lg` | 24 | Page headers, empty-state inline |
| `icon.xl` | 32 | Feature tiles, cards |
| `icon.2xl` | 48 | Empty states, dialogs |

## 7.2 Stroke & Geometry

- Stroke 1.5px at 16–24px; 2px at ≥32px to preserve optical weight.
- Round caps, round joins, 24px artboard, 2px safe padding.
- Icons align to the text baseline optically, not mathematically.

## 7.3 Usage Rules

- Icon + label is the default; icon-only requires `aria-label` and a tooltip.
- Never scale an icon non-uniformly, recolor to a non-token value, or rotate for new meaning.
- One icon = one meaning platform-wide (registry enforced).
- Icons in destructive actions inherit danger color only on the action, never in navigation.

## 7.4 Semantic Icon Registry (extract)

| Meaning | Icon |
|---|---|
| Add / Create | plus |
| Edit | pencil |
| Delete | trash |
| Approve / Verified | check-circle / badge-check |
| Reject | x-circle |
| Pending | clock |
| Search | search |
| Filter | sliders-horizontal |
| Sort | arrow-up-down |
| Export / Import | download / upload |
| Settings | settings |
| Notification | bell |
| More actions | ellipsis-vertical |
| Help | circle-question |
| Audit / History | history |
| Lock / Permission | lock |
| Offline | cloud-off |

## 7.5 Domain Icon Sets

| Set | Examples |
|---|---|
| **Sports / general** | trophy, medal, stopwatch, target, flag, podium |
| **Football-specific** | football (ball), pitch, goal-net, whistle, yellow-card, red-card, substitution (arrows), corner-flag, penalty-spot, offside-flag, captain-armband, kit-shirt, boot, formation-grid, scoreboard |
| **Medical** | stethoscope, heart-pulse, bandage, syringe, clipboard-health, physio-hand, injury-marker (body map), recovery-arc |
| **Finance** | wallet, receipt, invoice, credit-card, bank, coins, chart-ledger, refund-arrow, subscription-cycle |
| **Analytics** | chart-bar, chart-line, chart-area, chart-radar, heatmap-grid, funnel, gauge, sparkline, sigma, brain (AI — violet + label) |
| **Governance** | shield-check, gavel, file-signature, stamp, id-card, passport |

Custom icons enter the registry only via the governance process (§20) with a documented meaning and an owner.

---

# 8. Animation System

## 8.1 Duration Tokens

| Token | Value | Use |
|---|---|---|
| `motion.duration.instant` | 0 ms | Press feedback |
| `motion.duration.fast` | 100 ms | Hover, focus, tooltip |
| `motion.duration.quick` | 150 ms | Toggle, checkbox, small fades |
| `motion.duration.base` | 200 ms | **Default transitions** |
| `motion.duration.moderate` | 300 ms | Dropdown, popover, accordion |
| `motion.duration.slow` | 400 ms | Modal, drawer, bottom sheet |
| `motion.duration.deliberate` | 600 ms | Chart draw-in, milestone celebration |

## 8.2 Easing Tokens

| Token | Curve | Use |
|---|---|---|
| `motion.ease.standard` | cubic-bezier(0.2, 0, 0, 1) | Most transitions |
| `motion.ease.decelerate` | cubic-bezier(0, 0, 0, 1) | Elements entering |
| `motion.ease.accelerate` | cubic-bezier(0.3, 0, 1, 1) | Elements exiting |
| `motion.ease.emphasized` | cubic-bezier(0.2, 0, 0, 1) w/ 400ms | Large surfaces |
| `motion.ease.spring.subtle` | stiffness 300 / damping 30 | Toggles, chips |
| `motion.ease.linear` | linear | Progress, spinners, skeleton shimmer |

## 8.3 Choreography

| Pattern | Spec |
|---|---|
| Hover | background/elevation, 100 ms, standard |
| Press | scale 0.98, instant in, 100 ms out |
| Focus | ring appears instantly (never animated in) |
| Tooltip | fade + 2px rise, 100 ms in / 75 ms out, 400 ms open delay |
| Dropdown / Popover | fade + scale 0.96→1 from trigger origin, 150 ms in / 100 ms out |
| Modal | scrim fade 200 ms; panel scale 0.96→1 + 8px rise, 300 ms decelerate; exit 200 ms accelerate |
| Drawer | slide from edge 300 ms decelerate; exit 250 ms accelerate |
| Bottom sheet | slide up 300 ms; drag-to-dismiss with velocity spring |
| Accordion | height + opacity, 200 ms standard |
| Tabs | indicator slides 200 ms; panel cross-fades 150 ms |
| Page transition | content fade + 8px rise, 200 ms; nav chrome never animates |
| Toast | slide-in from edge + fade, 250 ms; exit fade 150 ms; stack shifts 200 ms |
| Skeleton | shimmer 1.5 s linear infinite, ≤ 10% opacity delta |
| Spinner | 700 ms linear rotation |
| Progress bar | width transition 300 ms standard; indeterminate 1.2 s loop |
| Charts | series draw-in 600 ms staggered 60 ms per series, first paint only; no animation on filter re-render |
| List reorder | FLIP 200 ms |
| Value change | numeric roll only in non-governed contexts, ≤ 400 ms |

## 8.4 Reduced Motion

When `prefers-reduced-motion: reduce`: no translation, scale, or parallax; opacity fades ≤ 100 ms; spinners become static progress text or a non-spinning indicator; auto-playing carousels and pulses stop; chart draw-in renders final state immediately.

---

# 9. Breakpoints

| Token | Min width | Device class | Layout behavior |
|---|---|---|---|
| `bp.xs` | 0 | Small phone | Single column, bottom nav, sheets, stacked cards |
| `bp.sm` | 640 | Large phone / small tablet portrait | 2-up card grid, larger type |
| `bp.md` | 768 | Tablet | Collapsible icon rail, 2-column forms, tables gain horizontal scroll |
| `bp.lg` | 1024 | Laptop | Persistent sidebar, 3-up grid, full data tables |
| `bp.xl` | 1280 | Desktop | Default app frame, 4-up grid, optional right panel |
| `bp.2xl` | 1536 | Large desktop | Max container 1440, wider gutters |
| `bp.3xl` | 1920 | Ultra-wide | Content capped, centered; optional dual-pane / third column; never stretch text lines |

Orientation: match-day capture and video-review surfaces provide a landscape-optimized layout on tablets.

---

# 10. Accessibility — WCAG 2.2 AA

## 10.1 Commitments

Touchline targets **WCAG 2.2 Level AA** on all surfaces, with AAA contrast on safeguarding, medical, and finance flows.

## 10.2 Perceivable

- Text contrast 4.5:1; large text and UI/graphics 3:1.
- Never color alone: pair with icon, text, or pattern (charts use pattern fills as a toggleable option).
- All non-decorative images have alt text; decorative use empty alt.
- Charts provide an accessible data table alternative and a text summary.
- Content reflows at 320px CSS width with no two-dimensional scrolling (except data tables, which are exempted by design and get a card fallback).
- Text can be resized to 200% and spacing overridden without loss of function.

## 10.3 Operable

- Every function is keyboard reachable in logical DOM order; no keyboard traps.
- **Focus visible (2.4.11 AA):** 2px ring, 2px offset, 3:1 contrast, never clipped by overflow, never obscured by sticky headers (scroll-margin applied).
- **Target size (2.5.8 AA):** minimum 24×24 CSS px; product minimum **44×44** for all primary touch targets; spacing ≥ 8px between adjacent targets.
- **Dragging (2.5.7 AA):** every drag interaction (squad builder, formation editor, kanban) has a non-drag alternative (menu "Move to…" or keyboard cut/paste).
- Skip-to-content link as first focusable element.
- No time limits on governed forms; where sessions expire, warn at T−2 min with extend.
- Access keys and shortcuts are remappable and disabled while typing.

## 10.4 Understandable

- Consistent navigation and consistent identification across all role layouts.
- **Consistent help (3.2.6 AA):** Help entry point in the same topbar position on every page.
- **Redundant entry (3.3.7 AA):** previously entered data is auto-filled or selectable in multi-step flows.
- **Accessible authentication (3.3.8 AA):** no cognitive-function test without an alternative; OTP fields support paste; password managers supported.
- Errors identified in text, with suggestions; reversible/checked/confirmed for legal and financial submissions.
- Language of page and of parts declared; plain-language target grade 8 for parent/player surfaces.

## 10.5 Robust

- Semantic HTML first; ARIA only to fill gaps.
- Radix/shadcn primitives are the mandated base for dialog, menu, popover, tabs, combobox, tooltip — no hand-rolled equivalents.
- Live regions: `polite` for toasts/autosave, `assertive` for errors and match-event confirmations.
- Status changes announced; loading announced ("Loading players, please wait") and completion announced with result count.

## 10.6 Keyboard Map

| Key | Behavior |
|---|---|
| Tab / Shift+Tab | Move focus |
| Enter / Space | Activate |
| Esc | Close overlay, cancel edit |
| Arrows | Move within composite widgets (menu, tabs, grid, radio, calendar) |
| Home / End | First / last item |
| Cmd/Ctrl+K | Command palette |
| `/` | Focus search |
| Cmd/Ctrl+S | Save form |
| Cmd/Ctrl+Enter | Submit form |
| `g` then `d` | Go to dashboard (role-scoped) |
| `?` | Keyboard shortcut help |

## 10.7 Screen Reader Patterns

| Component | Requirement |
|---|---|
| Dialog | role=dialog, aria-modal, labelled by title, focus moves in, returns to trigger |
| Table | caption, scope on headers, aria-sort on sortable columns, row count announced |
| Form | label associated, aria-describedby for helper + error, aria-invalid on error |
| Toast | role=status (polite) / role=alert (assertive) |
| Tabs | tablist/tab/tabpanel with aria-controls |
| Progress | role=progressbar with now/min/max, or aria-busy for indeterminate |
| Avatar group | single accessible summary ("4 coaches: …"), individual images decorative |
| Badge | text content is the source of truth; icon is aria-hidden |

---

# 11. Responsive Rules

## 11.1 Strategy

**Design desktop-first for information architecture; build mobile-first for behavior.** Enterprise workflows are designed at 1280 to guarantee density feasibility, then implemented from the smallest breakpoint upward so mobile is never a degraded afterthought.

Role-based reality check:
- Coach, Referee, Parent, Player → mobile is the primary device.
- Federation, Association, Platform Owner, Finance → desktop primary.
- Academy/Club admin → both; must be fully usable on tablet.

## 11.2 Responsive Tables

| Breakpoint | Behavior |
|---|---|
| ≥1024 | Full table, sticky header, sticky first column, column settings |
| 768–1023 | Horizontal scroll with pinned identity column + scroll shadow affordance |
| <768 | **Card list transformation**: each row becomes a card with primary field as title, 3 key fields as label/value pairs, actions in an overflow menu |

Never shrink font below 12px or hide data without an explicit, discoverable control.

## 11.3 Responsive Forms

- <768: single column, full-width controls, labels above, sticky footer action bar.
- ≥768: up to 2 columns; logically paired fields share a row (first/last name, city/postcode).
- ≥1280: optional 3-column for short fields only; help panel may move to a right rail.
- Multi-step: mobile shows "Step 2 of 5" + progress bar; desktop shows a full stepper.
- Numeric/date inputs use the correct mobile keyboard and native pickers where they outperform custom ones.

## 11.4 Responsive Navigation

| Breakpoint | Pattern |
|---|---|
| <768 | Bottom tab bar (max 5 items incl. "More") + hamburger drawer for full tree |
| 768–1023 | Collapsed 64px icon rail with tooltips; expandable overlay |
| ≥1024 | Persistent 256px sidebar, collapsible to 64px, state remembered per user |
| ≥1536 | Sidebar + optional contextual right panel |

Breadcrumbs hide below 768 and are replaced by a single back affordance with the parent name.

## 11.5 Responsive Dashboard

| Breakpoint | Grid |
|---|---|
| <640 | 1 column, KPIs 2-up in a scrollable strip |
| 640–1023 | 2 columns |
| 1024–1279 | 3 columns |
| ≥1280 | 4 columns, 12-column widget grid |
| ≥1920 | 12-column grid, container capped at 1440 unless "wide mode" enabled |

Widget priority order is defined per role; low-priority widgets collapse into an accordion on mobile.

## 11.6 Responsive Charts

- Mobile: max 3 series, legend below, no axis rotation, direct labels preferred, tap = tooltip.
- Tablet: 5 series, legend right or below.
- Desktop: full series, hover crosshair, brush/zoom, export.
- Minimum chart height 200px; heatmaps and radars get a table fallback below 640.
- Aspect ratio locked; never render a chart under 280px wide — show a stat card instead.

## 11.7 Responsive Cards

- Grid: 1 → 2 → 3 → 4 columns across xs → sm → lg → xl.
- Card min width 280px; below that, switch to list rows.
- Media aspect ratio preserved via aspect-ratio utilities.
- Actions collapse to an overflow menu below 768.

---

# 12. Component Library Standards

**Base:** shadcn/ui (Radix primitives) + Tailwind, extended with Touchline tokens and domain components. Every component specifies: anatomy, variants, sizes, states, content rules, a11y, responsive behavior, do/don't.

Universal state matrix for interactive components: `default, hover, active/pressed, focus-visible, selected, disabled, loading, error, read-only`.

## 12.1 Actions

### Buttons

| Variant | Use | Rule |
|---|---|---|
| `primary` | The single most important action | Max 1 per view region |
| `secondary` | Alternative actions | Neutral fill |
| `outline` | Tertiary, toolbar | Border + transparent |
| `ghost` | Low-emphasis, in-table, icon actions | No border |
| `link` | Navigation styled as text | Underline on hover |
| `destructive` | Delete, reject, revoke | Always requires confirmation |
| `destructive-outline` | Destructive in a list of options | |

Sizes: `sm` 32h, `md` 40h (default), `lg` 48h, `xl` 56h (mobile primary CTA). Icon-only: 32/40/48 square, min 44 on touch.

Content rules: verb-first, 1–3 words, sentence case, no terminal punctuation, no "Click here". Loading replaces the label with a spinner + retains width. Disabled buttons always pair with a tooltip explaining why.

**Do:** `Approve registration` / **Don't:** `OK`, `Submit`, `Yes`

### Icon Button
Icon-only, requires `aria-label` + tooltip. Never for ambiguous or destructive-without-confirmation actions.

### FAB
Mobile only, bottom-right, 56px, `radius.full`, `shadow.lg`, one per screen, hides on scroll-down and returns on scroll-up. Never on desktop.

### Button Group
Segmented, shared border, single radius at the ends. Max 4 items; beyond that use a Select. Roving tabindex; `aria-pressed` for toggles.

## 12.2 Inputs & Data Entry

| Component | Key standards |
|---|---|
| **Input** | 40h (md), label above, helper below, error replaces helper; leading/trailing icons or addons; character counter when max length applies |
| **Textarea** | Min 3 rows, auto-grow to 12, resize vertical only, counter mandatory when limited |
| **Password** | Visibility toggle (labelled), strength meter with text (not color alone), paste allowed, autocomplete honored |
| **Search** | Leading search icon, clear button, 300 ms debounce, results announced, recent searches on focus, Esc clears |
| **OTP** | 4–8 separate boxes, auto-advance, full paste support, single hidden accessible field, resend timer, never disable paste |
| **Phone** | Country selector with flag + dial code, E.164 storage, inline format-as-you-type, `tel` keyboard |
| **Email** | `email` keyboard, lowercase-on-blur, typo suggestion ("did you mean gmail.com"), no blocking regex |
| **Number** | Tabular figures, stepper buttons ≥32px, min/max/step, scroll-wheel disabled, unit suffix inside the field |
| **Currency** | Right-aligned, tabular, currency code shown, thousands separators, cents policy per tenant, negative in parentheses |
| **Date Picker** | Text input + calendar popover, locale format, keyboard entry always allowed, min/max, disabled dates explained on hover |
| **Time Picker** | 15-min default step, 12/24h per locale, timezone label mandatory for match times |
| **Date Range** | Dual-month desktop, single-month mobile, presets (Today, 7d, 30d, Season, Custom), start ≤ end enforced inline |
| **Calendar** | Grid role, arrow-key navigation, week starts per locale, today marked with ring not color-fill, events as dots with counts |
| **Dropdown / Select** | Native on mobile ≤ 10 options, custom listbox otherwise, type-ahead, max-height 320 with scroll, selected check on the left |
| **Autocomplete** | Async with loading row, min 2 chars, highlight matched substring, no-results with create action where allowed |
| **Combobox** | Free text + suggestions, multi-select as removable chips, chips wrap and never truncate the input |
| **Checkbox** | 20px box, 44px hit area, indeterminate supported, label clickable, group = fieldset + legend |
| **Radio** | 20px, always ≥2 options, default selected where a safe default exists, arrow-key group navigation |
| **Switch** | Immediate effect (no Save), 44×24 track, label on the left, optimistic with rollback + toast on failure |
| **Slider** | 44px thumb hit area, value shown in a label, keyboard arrows/PageUp/Home/End, ranges get two labelled thumbs |

**Don't:** use a switch for anything that requires a form submit; use placeholder text as the label; disable paste anywhere.

## 12.3 Display & Status

| Component | Standards |
|---|---|
| **Tag** | Neutral by default, removable variant with an accessible remove label, max 24 chars then tooltip |
| **Badge** | Status semantics from §2.4; dot + text; sizes sm/md; never interactive |
| **Chip** | Interactive filter token; selected state = filled + check; group is a toolbar with roving tabindex |
| **Avatar** | Sizes 24/32/40/48/64/96; initials fallback with deterministic neutral background; status dot bottom-right; group max 4 + "+N" with accessible summary; minors respect photo-consent rules |
| **Tooltip** | Supplementary only — never the sole source of critical info; 400 ms delay; 240px max; not focusable; touch = long-press or converts to popover |
| **Popover** | Interactive content, focus trapped optionally, Esc closes, arrow aligned to trigger, 320px default |
| **Accordion** | One or multiple open; chevron right-aligned; header is a button; content lazy-loads; never nest deeper than 2 |
| **Tabs** | Horizontal, ≤ 7 tabs then overflow scroll with fade; underline indicator; URL-synced; content preserved on switch; vertical variant for settings ≥1024 |
| **Stepper** | Horizontal desktop / compact "Step X of Y" mobile; states: complete (check), current (filled), upcoming (outline), error (danger); non-linear navigation only when steps are independent |
| **Breadcrumb** | Max 4 visible + ellipsis collapse; current page not a link; hidden < 768 |
| **Pagination** | Page numbers ≥768, prev/next + "Page X of Y" below; page size 10/25/50/100; total count always shown; cursor mode shows "Load more" instead |
| **Timeline** | Vertical, newest first by default, grouped by day, each entry: actor + action + timestamp + optional diff; used for audit trails and player passport |
| **Tree View** | For org hierarchy (Federation → Province → District → Club → Team); arrow-key navigation, expand/collapse all, lazy load, search filters with ancestors preserved |
| **Progress** | Linear (determinate/indeterminate) + circular; always paired with text; step progress shows "3 of 7" |
| **Skeleton** | Mirrors final layout, shimmer ≤10% delta, min display 300 ms to avoid flash |
| **Loading Spinner** | Sizes 16/20/24/32; centered in its container; never full-page above 1 s (use skeleton) |

## 12.4 Feedback & Overlays

| Component | Standards |
|---|---|
| **Toast** | Bottom-right desktop / top mobile; max 3 stacked; 5 s success, 7 s error, sticky for actionable; one action + dismiss; never for critical errors requiring a decision |
| **Alert** | Inline banner: info/success/warning/danger; icon + title + body + optional action; dismissible only when non-critical; page-level alerts sit directly under the page header |
| **Dialog** | 480 (sm) / 640 (md) / 800 (lg); title required; body scrolls, header/footer fixed; primary bottom-right; Esc + scrim close unless a form is dirty (then confirm); focus returns to trigger; max 1 nested level |
| **Confirmation Dialog** | Danger icon + consequence sentence + affected count; destructive-typed confirmation (type the entity name) for irreversible governance/finance actions; cancel is the default focus |
| **Drawer** | Right side desktop (400/560/720), full-height; used for detail-in-context and filters; supports deep-link; does not stack |
| **Bottom Sheet** | Mobile replacement for dialog/drawer/menu; drag handle, snap points 50%/90%, swipe-to-dismiss, safe-area padding |
| **Context Menu** | Right-click desktop + "more" button parity; grouped with separators; destructive last and colored; keyboard accessible via the button |
| **Command Palette** | Cmd/Ctrl+K; fuzzy search across navigation, entities, and actions; grouped results; recent + suggested; role-scoped so it never reveals unauthorized entities |

## 12.5 Data Components

| Component | Standards |
|---|---|
| **Data Table** | See §14. Anatomy: toolbar (search, filters, view options, bulk bar) → header → rows → footer (pagination + counts) |
| **Virtual Table** | For ≥1,000 rows: fixed row height, windowed rendering, sticky header, keyboard paging preserved, jump-to-row, announced row position |
| **Charts** | Line (trends), Bar/Column (comparison), Stacked (composition over time), Area (volume), Pie/Donut (max 5 slices, prefer bar), Radar (player attributes), Scatter (scouting correlation), Heatmap (attendance, pitch zones), Gauge (readiness), Sparkline (in-table trend), Funnel (registration conversion), Pitch map (event positions). Every chart: title, axis labels with units, legend, empty state, loading skeleton, accessible table alternative, export |

## 12.6 Card Family

**Base card anatomy:** container (`surface`, `radius.lg`, `border.subtle`, `shadow.xs`) → optional media → header (title, subtitle, status, overflow) → body → footer (metadata + actions). Whole-card click targets are allowed only when there is exactly one destination; otherwise the title is the link.

| Card | Primary content | Status | Actions |
|---|---|---|---|
| **Statistic Card** | Label, value (`stat.lg`), delta with direction arrow + text, sparkline, period | Trend semantics (up ≠ always good — polarity configured per metric) | Drill-down |
| **Player Card** | Photo/initials, name, age band, position chip, club, jersey #, Digital ID verified badge | Verified / Pending / Suspended | View passport, Add to shortlist |
| **Coach Card** | Photo, name, licence level badge, teams count, tenure | Licence valid/expiring/expired | View profile, Assign |
| **Academy Card** | Crest, name, region, players count, accreditation tier | Accredited / Provisional / Lapsed | View, Manage |
| **Competition Card** | Banner, name, season, format, teams count, dates | Draft / Open / Live / Completed | View standings, Manage |
| **Match Card** | Home vs Away crests, score or kickoff time, venue, round, referee | Scheduled / Live (pulse) / FT / Postponed / Abandoned | View, Report, Capture events |
| **Team Card** | Crest, name, age group, coach, squad size, W-D-L strip | Registered / Incomplete | View squad |
| **Parent Card** | Avatar, name, linked children chips, contact, consent state | Consent complete / Missing | Message, View children |
| **Medical Card** | Player, condition category (not diagnosis in list view), status, expected return, last update | Cleared / Restricted / Out | View record (permission-gated, access logged) |
| **Notification Card** | Icon by category, title, body preview, timestamp, unread dot | Read/unread | Primary action, Mark read, Mute category |

Domain-card rules: medical cards never show diagnosis details in list contexts; minor-related cards suppress contact details unless the viewer holds the guardian-contact permission; finance cards always show currency and effective date.

---

# 13. Form Design Standards

## 13.1 Label Rules

- Always visible; never placeholder-as-label; positioned above the control.
- Sentence case, no colon, concise noun phrase.
- Required marked with `*` + a legend ("* Required"); if most fields are required, mark the optional ones instead.
- Labels programmatically associated; grouped controls use fieldset + legend.

## 13.2 Placeholder Rules

- Optional; shows format examples only ("e.g. 12 Aug 2025", "+27 82 000 0000").
- Never contains instructions, requirements, or the label text.
- Contrast ≥ 4.5:1 against the field.

## 13.3 Helper Text

Persistent, below the field, `caption` at `text.muted`. Explains why data is needed or what format is expected. For sensitive fields (ID number, medical, guardian contact) it states how the data is used and who can see it.

## 13.4 Validation Rules

| Timing | Rule |
|---|---|
| On blur | First validation of a field |
| On change | Only after the field has already errored (re-validate to clear early) |
| On submit | Full-form validation; focus moves to the first invalid field |
| Async (uniqueness, ID lookup) | Debounced 500 ms, spinner in the field, result icon |

Never validate while the user is still typing the first time. Never block typing to enforce a format — format on blur.

## 13.5 Inline Validation

Error state: red border, danger icon in the field, message below, `aria-invalid`, `aria-describedby`. Success state (only for verified/async-checked fields): green check, no message.

## 13.6 Server Validation

- Field-mapped server errors render inline on the corresponding field.
- Unmapped errors render in a form-level alert with a correlation ID.
- The form never clears user input on failure.
- Conflict (409) shows a comparison of "your value" vs "current value" with an explicit resolution choice.

## 13.7 Error Messages

| Do | Don't |
|---|---|
| "Enter a date of birth on or before 31 Dec 2012." | "Invalid input." |
| "This jersey number is already used by A. Mokoena." | "Duplicate." |
| "File must be a PDF or JPG under 10 MB." | "Upload failed." |

Specific, actionable, no blame, no error codes in the primary sentence (codes go in a copyable detail line).

## 13.8 Success Messages

Inline for single-field saves ("Saved" with a check, 2 s), toast for whole-form saves, dedicated confirmation screen for submissions that trigger a governed workflow (registration, transfer, appeal) — including a reference number and next-step expectations ("Reviewed within 3 working days").

## 13.9 Confirmation Flow

Required before: submitting a governed record, deleting anything referenced elsewhere, publishing a fixture list, disbursing funds, revoking access, transferring a player. The dialog states scope, count, reversibility, and effective date.

## 13.10 Multi-Step Forms

- 3–7 steps; each step has one clear objective and a descriptive title.
- Progress always visible; completed steps revisitable; forward jumps blocked until valid.
- Draft saved on every step change; a resume banner appears on return.
- Review step summarizes all sections with "Edit" links back.
- Long-running approvals show the wizard result plus tracking reference.

## 13.11 Autosave Strategy

| Context | Strategy |
|---|---|
| Drafts (profiles, long records) | Debounced 2 s after last change + on blur; "Saving…" → "Saved HH:MM" indicator |
| Wizards | Save on step transition |
| Governed submissions | **No autosave** — explicit submit only |
| Match-day capture | Local-first queue, sync when online, per-item sync status, conflict resolution UI |
| Failure | Non-blocking banner "Changes not saved — retrying", manual retry, warn on navigate away |

---

# 14. Table Design Standards

## 14.1 Anatomy

Toolbar (title + count, search, filter chips, view/density, columns, export, bulk actions) → header row (sticky) → body rows → footer (selection summary, pagination, page-size).

## 14.2 Sorting

- Single-column default; multi-sort via Shift+click on permitted tables, shown as ordered chips.
- Sortable headers are buttons with `aria-sort`; direction arrow always visible on the active column, appearing on hover for others.
- Sort persists in the URL and per-user view.
- Default sort is documented per table (usually most-recent-first or alphabetical).

## 14.3 Filtering

- Quick filter chips for the 3 most common predicates; advanced filters in a drawer.
- Active filters displayed as removable chips above the table with "Clear all".
- Filters are URL-encoded and shareable; saved views can be named and shared per role scope.
- Result count updates live and is announced politely.

## 14.4 Search

Debounced 300 ms, searches defined fields (documented per table), highlights matches, supports quoted exact match, empty result state offers "Clear search".

## 14.5 Pagination

Server-side by default. Offset pagination for bounded sets, cursor pagination for large/streaming sets ("Load more" / infinite scroll with a manual fallback). Page size options 10/25/50/100; selection persists across pages with an explicit "N selected across pages" indicator.

## 14.6 Bulk Actions

- Checkbox column; header checkbox selects the current page with an option "Select all N matching filters".
- A sticky action bar replaces the toolbar when ≥1 row is selected, showing the count and available actions.
- Destructive bulk actions require confirmation with the exact count and a preview of the first 5 affected records.
- Partial-failure results are shown as a report ("42 succeeded, 3 failed") with per-row reasons and a downloadable log.

## 14.7 Column Settings

Show/hide, reorder (drag + keyboard "move up/down"), pin left/right, resize, reset to default. Identity column cannot be hidden. Settings persist per user per table.

## 14.8 Export

Formats CSV / XLSX / PDF (report layouts). Exports respect current filters, sort, and visible columns, and state the row count before confirming. Large exports (>5,000 rows) run as a background job with a notification and a download link. Exports containing personal or medical data require an explicit purpose acknowledgement and are audit-logged.

## 14.9 Import

Steps: download template → upload file → column mapping → validation preview (valid / warning / error counts) → dry run → commit → result report. Errors are downloadable with row numbers. Imports are idempotent by external key and always audit-logged.

## 14.10 Sticky & Density

Sticky header always; sticky identity column ≥768; sticky bulk-action bar. Density options: comfortable (48px rows), compact (36px), spacious (56px) — persisted per user.

## 14.11 Row Behavior

Whole row is clickable only when there is one obvious destination; otherwise the identity cell links. Row hover = `bg.subtle`. Row actions: up to 2 inline icon buttons + overflow menu, revealed on hover but always present for keyboard and touch.

## 14.12 Table States

Loading (skeleton rows matching column widths), empty (first-use), no-results (filtered), error (inline with retry), partial (loaded rows + error banner for the failed page).

---

# 15. Dashboard Design

## 15.1 Principles

1. Answer "what needs my attention today?" above the fold.
2. Maximum 4 KPI cards in the primary strip.
3. Every widget is drillable to a full view.
4. Every metric declares its period and comparison basis.
5. Personalization is additive: reorder and show/hide, never break the default.

## 15.2 Standard Layout (desktop, 12-column)

Row 1: page header (title, period selector, quick actions).
Row 2: 4 × KPI cards (3 cols each).
Row 3: primary chart (8 cols) + activity feed (4 cols).
Row 4: two domain widgets (6 + 6).
Row 5: table widget (12).

## 15.3 Widget Specifications

| Widget | Content | Empty state | Drill-down |
|---|---|---|---|
| **KPI Card** | Label, value, delta vs previous period, sparkline, period | "No data for this period" | Metric detail |
| **Analytics Widget** | Chart + segment control + legend + export | Illustration + "Data appears after the first match" | Analytics page |
| **Activity Feed** | Actor avatar, action sentence, entity link, relative time; grouped by day; max 10 + "View all" | "No recent activity" | Audit log |
| **Recent Matches** | Match cards, score/kickoff, result chip (W/D/L), venue | "No matches in this period" | Match detail |
| **Training Summary** | Sessions count, attendance %, load (AU), RPE trend | "No sessions logged" | Training module |
| **Player Growth** | Height/weight trend, attribute radar, minutes played, age-band context | "Add measurements to see growth" | Player passport |
| **Attendance Summary** | Attendance % gauge, heatmap by week, at-risk list (below threshold) | "Attendance starts after the first session" | Attendance report |
| **Finance Summary** | Collected vs outstanding, aging buckets, next payout date | "No transactions yet" | Finance module |
| **Competition Summary** | Standings top 5, next fixture, round progress, pending results | "No active competitions" | Competition detail |
| **Notification Center** | Grouped by category, unread count, mark-all-read, mute controls | "You're all caught up" (success-empty) | Notifications page |
| **Quick Actions** | 3–6 role-scoped primary tasks as icon tiles | n/a | Direct action |
| **Compliance Widget** | Expiring documents/licences with days remaining and severity | "Everything is current" | Compliance list |

## 15.4 Role Dashboard Priorities (widget order)

| Role | Top widgets |
|---|---|
| Platform Owner | Tenants, MRR/usage, system health, incidents, adoption funnel |
| Federation | Registered players, compliance rate, competitions live, sanctions queue, regional map |
| Provincial / District Association | Clubs by status, fixtures this week, referee coverage, escalations |
| Academy / SSB | Enrollment, attendance, coach licences, fee collection, player growth |
| Club | Squad readiness, next fixture, registration status, outstanding fees |
| Coach | Next session, availability, injury list, attendance, load |
| Parent | Child's next event, fees due, consents outstanding, messages |
| Player | Next match, minutes played, attributes, Digital ID status, achievements |
| Referee | Assignments, submitted reports pending, availability, payments |
| Scout | Shortlists, watch fixtures, new prospects matching filters, reports due |

## 15.5 Dashboard Behavior

Period selector (Today / 7d / 30d / Season / Custom) applies to all period-aware widgets and is URL-persisted. Widgets load independently with their own skeletons; a failed widget shows an inline retry without breaking the page. Data freshness is shown as "Updated 2 min ago" with a manual refresh.

---

# 16. Layout System

## 16.1 Application Shell

Regions: **Topbar** (56/64px) · **Sidebar** (256px / 64px collapsed) · **Content** (page header + body) · optional **Right panel** (360px) · **Footer** (minimal, app version + support).

Content is capped by `container.xl` unless the page declares wide mode. Exactly one `<main>` landmark, rendered by the shell.

## 16.2 Role Layouts

| Layout | Shell | Distinctive features |
|---|---|---|
| **Platform Owner** | Sidebar + topbar with tenant switcher | Global tenant scope banner, system-health strip, impersonation banner (persistent, danger-tinted, exit action) |
| **Federation** | Sidebar + topbar with season selector | Governance queues, national scope indicator, map view, bulk approval surfaces |
| **Association (Provincial / District)** | Same as Federation, scoped | Region badge in the topbar, escalation inbox, fixture coverage board |
| **Academy / SSB** | Sidebar + topbar with team switcher | Enrollment pipeline, session calendar as the default landing, parent-comms shortcuts |
| **Club** | Sidebar + team switcher | Squad-centric nav, match-day mode entry point, finance shortcuts |
| **Coach** | Mobile-first: bottom nav + compact topbar | Match-day mode (fullscreen, landscape, offline badge), session builder, roster quick access |
| **Parent** | Mobile-first: bottom nav (Home, Children, Payments, Messages, More) | Child switcher as a prominent segmented control, consent center, calendar |
| **Player** | Mobile-first, card-led, minor-safe | Digital ID card hero, next event, progress; no commercial content for minors |
| **Referee** | Mobile-first, task-led | Assignments list as home, offline match report, availability toggle, payments |
| **Scout** | Desktop-first, data-dense | Split view: filter rail + results grid + detail drawer; shortlist tray persistent |
| **Public Visitor** | Marketing/topbar + footer, no sidebar | Full-width sections, standings/fixtures/results, club and competition pages, SEO-optimized, no personal data |
| **Authentication** | Centered card 480px on a branded split background | Logo, single objective per screen, locale switcher, support link, no app nav |
| **Mobile (all roles)** | Topbar (title + actions) + bottom nav + sheets | Safe-area insets, thumb-zone primary actions, pull-to-refresh, offline banner |

## 16.3 Page Header Standard

Breadcrumb (≥768) → title (H1) → status badges → subtitle/meta → actions (right, primary last) → optional tabs. Sticky on scroll for detail pages with a condensed variant (title + primary action only).

## 16.4 Layout Rules

- Never nest scroll containers beyond one level.
- Sticky elements must not consume more than 25% of viewport height on mobile.
- Right panels are supplementary; no content may exist only there.
- Impersonation, offline, and sandbox modes always render a persistent, unmissable banner.

---

# 17. Navigation System

## 17.1 Sidebar

- Structure: primary items → grouped sections (labelled, collapsible) → utility (settings, help) pinned at the bottom.
- Max 7 top-level items per role; grouping beyond that.
- Item anatomy: icon (20) + label + optional count badge; active state = filled background + 3px left accent bar + semibold label.
- Depth limit 2 (item → sub-item); deeper structure moves into in-page tabs.
- Collapsed rail shows icons + tooltips; state persists per user.
- Role-scoped: items the user cannot access are hidden, not disabled.

## 17.2 Topbar

Left: menu toggle (mobile), breadcrumb or context switcher (tenant/season/team). Right: quick search, quick actions (+), notifications with unread badge, help (consistent position — WCAG 3.2.6), user menu (profile, preferences, theme, language, sign out). Height 56 mobile / 64 desktop; `shadow.xs` on scroll.

## 17.3 Mobile Navigation

Bottom tab bar: max 5 items, icon + label, 56px tall + safe area, active = filled icon + primary label. "More" opens a sheet with the full tree. Bottom nav hides in fullscreen modes (match-day capture, video review).

## 17.4 Breadcrumb

Home icon → ancestors → current (plain text). Truncate the middle with an ellipsis menu beyond 4 levels. Reflects the entity hierarchy, not the click path.

## 17.5 Quick Search

Topbar field or `/` shortcut. Scoped, typed results (Players, Teams, Competitions, Matches, Documents) with entity icons and secondary identifiers to disambiguate names. Results respect permissions absolutely.

## 17.6 Command Palette

Cmd/Ctrl+K. Sections: Recent · Suggested actions · Navigation · Entities · Settings. Fuzzy matching, keyboard-only operable, shows shortcut hints, executes actions directly (with confirmation for destructive ones).

## 17.7 Recent & Favorites

Recent: last 10 visited entities per user, shown in the palette and on the dashboard. Favorites: star any entity; pinned to a sidebar "Favorites" group, reorderable, max 15 with graceful overflow.

---

# 18. Page Template Library

Each template defines regions, default states, and required behaviors. All new screens must start from a template.

| Template | Regions | Required states | Notes |
|---|---|---|---|
| **Dashboard** | Header + period · KPI strip · widget grid | loading (per widget), empty, error (per widget) | Role-configured widget order |
| **List** | Header + count · toolbar · table/card grid · footer pagination | loading, empty, no-results, error, permission-empty | Filters URL-synced, saved views |
| **Detail** | Header (identity, status, actions) · summary panel · tabs (Overview, Related, Activity, Documents, Settings) | loading, not-found, permission | Sticky condensed header; audit tab where governed |
| **Create** | Breadcrumb · single-column form · sticky action bar | validating, submitting, error, success | Unsaved-changes guard |
| **Edit** | Same as Create + "last updated by/at" + Discard | dirty, conflict (409), saving | Optimistic-lock conflict UI |
| **Wizard** | Stepper · step body · footer (Back / Save draft / Next) · review step | per-step validation, draft-saved, submitted | 3–7 steps, resume banner |
| **Analytics** | Header + filters · KPI row · chart grid · breakdown table · export | loading, empty, insufficient-data | Every chart has a table alternative |
| **Profile** | Cover/identity block · key facts · tabs · related entities | loading, restricted-fields | Minor-safeguarding rules applied |
| **Calendar** | Header (view switch: month/week/day/agenda, filters) · grid · event detail popover/sheet | loading, empty, conflict | Agenda view is the mobile default |
| **Timeline** | Filter rail · chronological entries grouped by day · load-more | loading, empty, filtered-empty | Used for passport and audit |
| **Report** | Parameters panel · preview · generate/schedule · export | generating, queued, ready, failed | Print stylesheet mandatory |
| **Settings** | Vertical tabs / sections · grouped forms · per-section save | saving, saved, error, permission | Dangerous settings isolated in a danger zone |
| **Auth** | Centered card · single objective · locale + support links | loading, error, locked, expired-link | Accessible auth rules (§10.4) |
| **Error / Empty page** | Illustration · title · explanation · actions · reference ID | 403, 404, 500, offline, maintenance | Always offers a route out |

---

# 19. Design Tokens — Master Reference

## 19.1 Naming Convention

`{category}.{concept}.{variant}.{state}` — lowercase, dot-separated, no abbreviations except widely known (bg, fg, xs–2xl).
Examples: `color.primary.bg.hover`, `space.6`, `type.body.md`, `shadow.lg`, `motion.duration.base`, `z.modal`.

Three tiers: `primitive.*` (raw) → semantic (`color.text.primary`) → component (`button.primary.bg`, which must reference a semantic token). Product code and design files use semantic and component tiers only.

## 19.2 Token Categories

| Category | Prefix | Count | Notes |
|---|---|---|---|
| Colors | `color.*` | ~120 semantic | Light + dark value sets |
| Typography | `type.*` | 26 composite styles | size + line-height + weight + tracking + family |
| Spacing | `space.*` | 16 | 4px grid |
| Radius | `radius.*` | 7 | |
| Shadow | `shadow.*` | 8 | Mode-aware |
| Motion | `motion.duration.*`, `motion.ease.*` | 7 + 6 | |
| Opacity | `opacity.*` | 8 | |
| Border | `border.width.*`, `border.style.*` | 5 | |
| Icon | `icon.size.*`, `icon.stroke.*` | 8 | |
| Z-index | `z.*` | 10 | |
| Breakpoints | `bp.*` | 7 | |
| Containers | `container.*` | 7 | |
| Density | `density.*` | 3 | comfortable / compact / spacious |

## 19.3 Opacity Tokens

| Token | Value | Use |
|---|---|---|
| `opacity.0` | 0 | Hidden (animating) |
| `opacity.5` | 0.05 | Hover overlay light |
| `opacity.10` | 0.10 | Hover overlay dark mode |
| `opacity.20` | 0.20 | Dividers on media |
| `opacity.40` | 0.40 | Drag source |
| `opacity.50` | 0.50 | Scrim, disabled media |
| `opacity.70` | 0.70 | Secondary emphasis |
| `opacity.100` | 1 | Default |

Disabled components use `opacity.50` **plus** a non-opacity indicator (cursor, aria-disabled, tooltip reason).

## 19.4 Border Tokens

| Token | Value | Use |
|---|---|---|
| `border.width.none` | 0 | |
| `border.width.hairline` | 1 | Default: cards, inputs, dividers |
| `border.width.thick` | 2 | Focus ring, selected card, active tab indicator |
| `border.width.heavy` | 3 | Active sidebar accent bar |
| `border.style.solid` / `border.style.dashed` | | Dashed reserved for drop zones and placeholders |

## 19.5 Z-index Tokens

| Token | Value | Layer |
|---|---|---|
| `z.base` | 0 | Content |
| `z.raised` | 10 | Hover cards, sticky table columns |
| `z.sticky` | 100 | Sticky headers, toolbars |
| `z.navigation` | 200 | Sidebar, topbar, bottom nav |
| `z.dropdown` | 300 | Menus, selects, comboboxes |
| `z.overlay` | 400 | Scrim |
| `z.modal` | 500 | Dialogs, drawers, sheets |
| `z.popover` | 600 | Popovers over modals |
| `z.toast` | 700 | Notifications |
| `z.tooltip` | 800 | Tooltips |
| `z.critical` | 900 | Impersonation / offline / maintenance banners, dev tools |

Arbitrary z-index values are prohibited.

## 19.6 Density Tokens

| Token | Row height | Control height | Card padding |
|---|---|---|---|
| `density.spacious` | 56 | 48 | 32 |
| `density.comfortable` | 48 | 40 | 24 |
| `density.compact` | 36 | 32 | 16 |

## 19.7 Token Governance

- Tokens are defined once, in the design-token source of truth, and consumed by both design tooling and the theme layer.
- Adding a token requires: name, tier, rationale, light/dark values, contrast evidence, owner.
- Deprecating a token requires: replacement mapping, a deprecation notice for one minor version, and removal in the next major.
- Tenant theming may override **brand color and logo only**; semantic, spacing, type, and a11y tokens are locked to preserve accessibility.

---

# 20. Design Governance

## 20.1 Component Naming Convention

- **PascalCase**, domain-prefixed for non-generic components: `PlayerCard`, `MatchScoreboard`, `CompetitionStandingsTable`.
- Generic primitives keep library names: `Button`, `Dialog`, `DataTable`.
- Composition suffixes: `*Card`, `*Table`, `*Form`, `*Drawer`, `*Dialog`, `*Panel`, `*Widget`, `*Field`, `*Provider`.
- Boolean props read as states: `isLoading`, `isDisabled`, `hasError`. Variant props use enums, never booleans (`variant="destructive"`, not `destructive`).
- No abbreviations, no numeric suffixes (`PlayerCard2` is a defect), no "New"/"Old" prefixes.

## 20.2 Folder Structure (design-system scope)

```
design-system/
  tokens/            primitives, semantic, component, themes (light|dark)
  foundations/       color, type, spacing, radius, shadow, motion, icon docs
  primitives/        library-level components (Button, Input, Dialog …)
  patterns/          composed patterns (DataTable, FormLayout, PageHeader …)
  domain/            football-specific (PlayerCard, MatchCard, PitchMap …)
  layouts/           shells per role, auth, public, mobile
  templates/         the 14 page templates
  icons/             registry + custom sets (football, medical, finance)
  illustrations/     empty states, errors, onboarding
  content/           voice & tone, glossary, message catalog
  a11y/              checklists, test matrix, ARIA patterns
  governance/        contribution, review, versioning, changelog
```

## 20.3 Token Naming Convention

Recap: `{category}.{concept}.{variant}.{state}`; semantic names describe **role**, never appearance. `color.danger.bg` — correct. `color.red.500` in product usage — prohibited.

## 20.4 Documentation Rules

Every component page documents, in order: purpose · when to use / when not to use · anatomy diagram · props/variants table · all states · content guidelines · accessibility notes · responsive behavior · do & don't examples · related components · changelog. A component without documentation is not released.

## 20.5 Versioning Rules

Semantic versioning for the design system:
- **Major** — breaking API/visual change, token removal, layout contract change. Requires a migration guide.
- **Minor** — new components, new variants, new tokens, additive props.
- **Patch** — bug, a11y, or documentation fixes with no API change.

Deprecations are announced one minor ahead, marked in docs and tooling, and removed only at a major. Design files and code releases share the same version number.

## 20.6 Contribution Guidelines

1. **Search first** — extend an existing component before proposing a new one.
2. **Propose** — RFC covering problem, evidence of ≥3 use cases, alternatives considered.
3. **Design** — token-only, all states, light + dark, all breakpoints, a11y annotations (roles, names, focus order, keyboard map).
4. **Review** — design review + a11y review + engineering feasibility.
5. **Build** — Radix/shadcn base where one exists, tokens only, docs + examples.
6. **Verify** — a11y audit, contrast checks, keyboard pass, screen reader pass, responsive pass, RTL pass.
7. **Release** — versioned, changelogged, announced.

One-off exceptions require a written justification, an owner, and an expiry date; unexpired exceptions are reviewed quarterly.

## 20.7 Review Checklist (design)

- [ ] Uses only approved tokens (no raw hex/px/ms)
- [ ] Uses an existing component where one exists
- [ ] All states designed (default → loading → error → empty → disabled → selected)
- [ ] Light and dark mode both designed and contrast-verified
- [ ] Designed at 320, 768, 1024, 1280, 1920
- [ ] One primary action per view region
- [ ] Content follows voice, glossary, and minor-safety rules
- [ ] Empty, loading, and error states specified
- [ ] Permission variants specified (what each role sees)
- [ ] Keyboard map and focus order annotated
- [ ] Localization headroom +35% verified
- [ ] Matches an existing page template

## 20.8 Design QA Checklist (pre-release)

- [ ] Pixel/token parity with the spec (spacing on the 4px grid)
- [ ] Focus ring visible on every interactive element, never clipped
- [ ] Touch targets ≥ 44×44 with ≥ 8px separation
- [ ] No layout shift on load (CLS ≤ 0.1); skeletons match final geometry
- [ ] Long strings, long names, and 0/1/many data cases handled
- [ ] Error, empty, offline, and permission states verified in the build
- [ ] Motion respects reduced-motion; nothing animates data in governed views
- [ ] Dark mode verified on every surface including charts and images
- [ ] Screen reader pass (NVDA + VoiceOver) on the primary flow
- [ ] Keyboard-only pass end-to-end
- [ ] RTL layout pass
- [ ] Print/report layout verified where applicable
- [ ] Analytics/event names attached to primary actions

---

# 21. Checklists

## 21.1 Accessibility Checklist (WCAG 2.2 AA)

**Perceivable**
- [ ] Text contrast ≥ 4.5:1 (large text / UI / graphics ≥ 3:1), verified in both modes
- [ ] Information never conveyed by color alone
- [ ] All meaningful images have alt text; decorative images have empty alt
- [ ] Charts have a text summary and an accessible data table
- [ ] Content reflows at 320px width; 200% zoom without loss of function
- [ ] Text spacing overrides do not break layout

**Operable**
- [ ] Full keyboard operability; logical focus order; no traps
- [ ] Focus indicator visible, 2px + 2px offset, ≥3:1, never obscured (2.4.11)
- [ ] Targets ≥ 24×24 minimum, 44×44 for primary touch actions (2.5.8)
- [ ] Drag interactions have a single-pointer alternative (2.5.7)
- [ ] Skip link present; landmarks correct; exactly one `<main>`
- [ ] No unavoidable time limits; session expiry warned with extend

**Understandable**
- [ ] Navigation and component identification consistent across roles
- [ ] Help is in the same place on every page (3.2.6)
- [ ] Redundant entry avoided in multi-step flows (3.3.7)
- [ ] Authentication has no cognitive-function test without an alternative (3.3.8)
- [ ] Errors identified in text with correction suggestions
- [ ] Legal/financial submissions are reversible, checked, or confirmed
- [ ] Page and part language declared

**Robust**
- [ ] Semantic HTML; ARIA only where necessary and correct
- [ ] Radix/shadcn primitives used for all overlay/composite widgets
- [ ] Status messages announced via appropriate live regions
- [ ] Tested with NVDA (Windows) and VoiceOver (macOS/iOS)
- [ ] Automated axe scan clean; manual audit completed and signed off

## 21.2 Responsive Checklist

- [ ] Verified at 320, 375, 768, 1024, 1280, 1440, 1920
- [ ] No horizontal page scroll at any breakpoint (tables excepted, with pinned column)
- [ ] Tables transform to cards below 768
- [ ] Forms collapse to a single column below 768 with a sticky action bar
- [ ] Navigation switches sidebar → rail → bottom nav correctly
- [ ] Dashboard grid reflows 4 → 3 → 2 → 1
- [ ] Charts reduce series and reposition legends per §11.6
- [ ] Modals become bottom sheets on mobile
- [ ] Touch targets and thumb-zone placement verified on a real device
- [ ] Safe-area insets respected (notch, home indicator)
- [ ] Landscape verified for match-day and video surfaces
- [ ] Images use correct aspect ratios and responsive sources
- [ ] Ultra-wide capped and centered; text measure never exceeds 75ch
- [ ] Offline and low-bandwidth behavior verified on mobile

## 21.3 Design Governance Checklist

- [ ] Component exists in the library or has an approved RFC
- [ ] Naming follows the convention (§20.1)
- [ ] Tokens only; no raw values; new tokens approved and documented
- [ ] Documentation complete (purpose, anatomy, variants, states, a11y, do/don't)
- [ ] Version bumped correctly; changelog entry written
- [ ] Deprecations announced with a migration path
- [ ] Design file and code implementation are in sync and share the version
- [ ] Accessibility review signed off
- [ ] Content review signed off (voice, glossary, minor-safety)
- [ ] Cross-role impact assessed (does this change 3 layouts or 13?)
- [ ] Exceptions logged with owner and expiry

## 21.4 UX Best Practices (platform-wide)

1. **Show scope, always.** Tenant, season, team, and region context is visible before any data is read.
2. **Permission-shaped UI.** Hide what a role cannot do; explain what they could request.
3. **Evidence over assertion.** Every governed status shows who changed it, when, and why.
4. **Progressive disclosure.** Advanced controls live behind "Advanced" — defaults must be correct for 80% of users.
5. **Fail visibly, recover easily.** Nothing fails silently; every failure offers a next step.
6. **Offline is a first-class state**, not an error, for coach and referee surfaces.
7. **Protect minors by default.** Least data, consent-gated media and contact details, no public exposure.
8. **Confidential by design.** Medical and finance surfaces state who can see the data and log access.
9. **Label AI output.** Derived and predicted values are marked, dated, and explained; never presented as fact.
10. **Numbers need units and periods.** No bare figures.
11. **Respect the thumb.** Mobile primary actions live in the bottom third.
12. **Speed is a feature.** Perceived performance budget: interactive feedback < 100 ms, meaningful paint < 1 s, full data < 2.5 s.
13. **Design for the worst case:** the longest name, the 5,000-row table, the 2G connection, the 4-year-old Android phone.
14. **Every screen must be explainable in one sentence.** If it can't be, it's two screens.

---

**Document owner:** Design System Guild
**Review cadence:** Quarterly, plus on every major release
**Related artifacts:** ARCHITECTURE.md · DOMAINS.md · PRD.md · PROCESSES.md · BACKLOG.md · DATA_ARCHITECTURE.md · API_CONTRACT.md
