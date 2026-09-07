# CLAUDE.md - MineSight Project Guidelines

## Project
Coal mine governance platform. 2 roles: Contractor, Supervisor.
Core loop: observation -> corrective action -> verified closure -> audit trail -> risk score updates.
Full reasoning behind every feature below lives in blueprint.txt — read it before proposing scope changes.

## Roles & Boundaries (enforce strictly — no cross-role writes)

**Contractor** (writes own data only)
- Profile: ID, task_type (blasting/transport/excavation/maintenance), license/cert wallet w/ expiry
- Digital attendance register (per worker: training status, PPE issued)
- Worker Roster: per-worker training + PPE status, separate from attendance headcount
- Machinery register: type, ownership, last serviced, next due, cert expiry
- Explosives stock (procured/used/remaining) — visible only if task_type = blasting
- Unresolved Action Center: read-only view of Supervisor's open remarks, red-flagged, with
  proof-upload to resolve
- Rule-Breaking Track Record & Risk Indicator: total observations received, unresolved count,
  calculated Risk Level (Low/Moderate/High) — deterministic, feeds contract-eligibility note

**Supervisor** (writes observations/actions only, not contractor profiles)
- Contractor Status Dashboard: searchable directory — task type, Risk Level, Violation Frequency
  Meter (visual bar, not a number), unresolved count, Restricted/Blacklisted flag on repeat offenders
- Quick Observation Logger: contractor select, category (PPE/Dust/Effluent/Equipment), severity
  (Low/Moderate/Critical), photo, auto-captured GPS/timestamp -> instantly red-flags the contractor
- Daily Yield & Environment Tracker: tonnage + environmental readings (dust/PM10, effluent/pH,
  noise) vs. defined thresholds
- Platform-Wide Warning System: any threshold breach anywhere fires a dashboard-wide flag —
  this is what replaces a dedicated Compliance Officer role in the 2-role MVP
- Closure Verification: reviews contractor-submitted proof, clears the red flag, writes an
  audit trail entry
- Contractor Overview Drill-Down: clicking a contractor name opens a separate, minimal page
  (license status + machinery maintenance status + headcount only — not the full Contractor
  Portal) — keeps the RBAC boundary honest
- Document Upload / Smart OCR Ingestion: upload an environmental report -> extracts the reading,
  flags vs. threshold, auto-updates the relevant widget + Total Mine Environmental Risk. Reference
  build simulates extraction with a scripted delay — a real parser is still required, do not treat
  the demo as a working parser.

## task_type field
Set once at contractor onboarding, not per-login. Drives conditional rendering
(e.g., explosives stock only for blasting). Don't build a login-time picker.
Edge case: if a contractor genuinely spans multiple task types, make it multi-select,
not single-select — decide this before building, not after.

## AI / Data Rules
- No PII exposed across role boundaries (e.g. Contractor A never sees Contractor B's data)
- Risk scores/alerts/flags (incl. Risk Level, Violation Frequency, Restricted/Blacklisted status,
  Platform-Wide Warnings): deterministic, rule-based only. No LLM-generated scores or unexplained
  flags — every flag must trace back to an actual data point.
- LLM use limited to: document field extraction (cert expiry dates, environmental reading values
  from uploaded PDFs). Nothing else — never risk judgment, never a generated summary presented as fact.
- Missing data shows as "Pending" / "Not Logged" — never invented or estimated.

## Code Rules
- Modular, minimal deps. No new libraries without explicit ask.
- No unrequested scope (IoT hardware, a third role, features outside Contractor/Supervisor).
- Snippets/diffs only — no prose explanation unless asked.
- No restating requirements already in this file before coding — just build.

---

## Frontend Design Reference (for regenerating/extending the HTML mockups)

This section is reference material for prompting UI generation — not a coding
instruction to re-apply on every task. Use it when asked to build or extend a
portal page; ignore it for backend/logic work.

### Design System
- Font: Inter (Google Fonts), fallback system-ui/sans-serif.
- Background canvas: #F8FAFC. Primary text: #0F172A (ink). Secondary text:
  #475569 (subink) and #64748B (muted).
- Cards: white background, 1px border #E2E8F0, 14px rounded corners, no
  drop shadows — flat, calm, corporate-safety aesthetic.
- Status color system (used consistently everywhere — badges, borders, bars, backgrounds):
  - Emerald (#DCFCE7 bg / #166534 text / #BBF7D0 border) = compliant/good
  - Amber (#FEF3C7 bg / #92400E text / #FDE68A border) = moderate/warning
  - Rose (#FEE2E2 bg / #991B1B text / #FECACA border) = critical/breach
  - Sky (#E0F2FE bg / #075985 text / #BAE6FD border) = neutral/info tag
- Small pill-shaped tags (rounded-full, ~12px font, bold) for every status label.
- Zero generic filler metrics — every number ties to safety, compliance, environmental
  risk, or active contractor status.
- Tailwind CSS via CDN only, plain vanilla JS inline, no frameworks, no charting library
  (build meters/bars with plain divs + width percentages).

### Pages built so far (reference implementations, see blueprint.txt Sections 2A/3A)
- `contractor_portal.html` — full Contractor Portal per blueprint.txt Section 2
- `supervisor_portal.html` — full Supervisor Portal per blueprint.txt Section 3
- `contractor_overview_flagged.html` / `contractor_overview_compliant.html` — the
  Contractor Overview Drill-Down (3.6) sample pages, linked from the Supervisor's
  Contractor Status Dashboard

### Interaction requirements (must actually function, not just look clickable)
- Contractor search filter (real-time, no page reload)
- "+" button on a contractor row: preselects that contractor in the Observation Logger
  and smooth-scrolls to it
- Severity toggle: 3 buttons, one active at a time, color-coded by severity
- OCR upload demo: file select -> "Analyzing..." -> reveals extracted value, updates the
  matching widget and Total Risk bar/label live
- "Review Evidence & Clear Flag": flips that specific card to the emerald palette and
  disables the button — scoped to that one card only
