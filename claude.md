# CLAUDE.md - MineSight Project Guidelines

## Project
Coal mine governance platform. 2 roles: Contractor, Supervisor.
Core loop: observation → corrective action → verified closure → audit trail → risk score updates.

## Roles & Boundaries (enforce strictly — no cross-role writes)

**Contractor** (writes own data only)
- Profile: ID, task_type (blasting/transport/excavation/maintenance), license/cert wallet w/ expiry
- Digital attendance register (per worker: training status, PPE issued)
- Machinery register: type, ownership, last serviced, next due, cert expiry
- Explosives stock (procured/used/remaining) — visible only if task_type = blasting
- Unresolved Action Center: read-only view of Supervisor's open remarks, red-flagged

**Supervisor** (writes observations/actions only, not contractor profiles)
- Contractor status dashboard (all contractors, aggregated)

- Observation logger: category, photo, severity → auto-creates action, red-flags contractor
- Daily yield/environment log: tonnage, dust/effluent readings vs. threshold → flag on breach
- Closure verification: checks evidence, clears red flag, writes audit trail entry

## task_type field
Set once at contractor onboarding, not per-login. Drives conditional rendering
(e.g., explosives stock only for blasting). Don't build a login-time picker.

## AI / Data Rules
- No PII exposed across role boundaries (e.g. Contractor A never sees Contractor B's data)
- Risk scores/alerts: deterministic, rule-based only. No LLM-generated scores or unexplained flags.
- LLM use limited to: document field extraction (cert expiry dates from uploaded PDFs). Nothing else.

## Code Rules
- Modular, minimal deps. No new libraries without explicit ask.
- No unrequested scope (IoT hardware, features outside the 3 roles above).
- Snippets/diffs only — no prose explanation unless asked.
- No restating requirements already in this file before coding — just build.
