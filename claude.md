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

#UPDATED SUPERVSIOR WORKFLOW
**Supervisor** (writes observations/actions only, not contractor profiles)
### Design System
- Font: Inter (Google Fonts), fallback system-ui/sans-serif.
- Background canvas: #F8FAFC. Primary text: #0F172A (ink). Secondary text: 
  #475569 (subink) and #64748B (muted).
- Cards: white background, 1px border #E2E8F0, 14px rounded corners, no 
  drop shadows — flat, calm, corporate-safety aesthetic.
- Status color system (used consistently everywhere — badges, borders, 
  bars, backgrounds):
  - Emerald (#DCFCE7 bg / #166534 text / #BBF7D0 border) = compliant/good
  - Amber (#FEF3C7 bg / #92400E text / #FDE68A border) = moderate/warning
  - Rose (#FEE2E2 bg / #991B1B text / #FECACA border) = critical/breach
  - Sky (#E0F2FE bg / #075985 text / #BAE6FD border) = neutral/info tag
- Small pill-shaped tags (rounded-full, ~12px font, bold) for every status 
  label — never plain text for a status.
- Zero generic filler metrics. Every number on the page must tie to safety, 
  compliance, environmental risk, or active contractor status.

### Layout — Section by Section (top to bottom)

1. HEADER
   Mine name + "Supervisor Portal" title, logged-in supervisor name, and a 
   zone-coverage tag (e.g. "Zone Coverage: A · B · C").

2. TOP METRICS BAR (4 cards, responsive 2-col mobile / 4-col desktop)
   - Total Active Contractors Onsite (plain number)
   - Critical Open Observations (rose accent border-left)
   - Overall Compliance Rate % (emerald accent)
   - Overall Mine Environmental Risk % (amber accent)

3. ENVIRONMENTAL & YIELD LOG
   - 4 small cards: Daily Tonnage (vs target), Air Quality/PM10 dust 
     reading, Effluent/Water pH reading, Noise Level (dB) — each shows the 
     reading plus a tag stating "Below Safety Limit (X)" or "Above Safety 
     Limit (X)" with the actual threshold number shown.
   - Below that: one full-width "Total Mine Environmental Risk" card — a 
     percentage + label (e.g. "34% — Moderate"), a horizontal progress bar 
     colored by severity, and a caption stating it's calculated 
     deterministically from the readings above (not AI-guessed).

4. DOCUMENT UPLOAD / SMART OCR INGESTION
   A card with a file input labeled "Upload Environmental Report." On file 
   select, JS shows "Analyzing document..." then after ~1s reveals an 
   extracted-values summary (e.g. "Extracted: PM10 = 118 µg/m³ (Threshold: 
   100)") with a Flagged/Verified tag, AND live-updates the matching widget 
   and Total Risk bar/label from step 3 — this must actually work via JS, 
   not just be decorative.

5. CONTRACTORS DIRECTORY (searchable table)
   Columns: Contractor name (linked, see below) + ID/task type subtext, 
   Task Type, Risk Level (tag), Violation Frequency (small horizontal bar 
   meter, not a number), Unresolved issue count, Flag column ("Frequent 
   Violator" / "Restricted — Future Contracts" tag, or blank if clean), 
   and a "+" button per row.
   - A search input above the table filters rows by name/ID in real time 
     via JS (no page reload).
   - Contractor name links to a separate sample overview page (see below).
   - The "+" button, on click, must: (a) set a <select> in the Quick 
     Observation Logger section to that exact contractor, and (b) smooth-
     scroll the page down to that logger section. Implement via JS, test 
     that it actually works.

6. QUICK OBSERVATION & ENVIRONMENT LOGGER
   A form card: Contractor <select> (prefilled by the "+" button above), 
   Category <select> (PPE / Dust / Effluent / Equipment), a 3-button 
   Severity toggle (Low / Moderate / Critical — clicking one visually 
   activates it and deactivates the others via JS class swap, colored 
   emerald/amber/rose respectively), a textarea for observation details, 
   a photo file input, an auto-captured GPS+timestamp line (JS: current 
   date/time + a fixed zone string, set on page load), and a Submit button.

7. ACTIVE COMPLIANCE & RED-FLAGGED OPERATIONS (live feed)
   A list of open-observation cards, each in a soft rose container 
   (#FEE2E2 bg / #FECACA border), showing: severity tag, contractor + 
   observation ID, the observation text, and a status line ("Awaiting 
   contractor proof" or "Proof submitted — pending review"). Each card has 
   a "Review Evidence & Clear Flag" button. Clicking it must, via JS, flip 
   that specific card to emerald/green, change all its text colors to the 
   emerald palette, and change the button to a disabled "Cleared" state — 
   scoped to that one card only, not all cards.

8. LINKED SAMPLE CONTRACTOR OVERVIEW PAGES (build 2 separate HTML files)
   Each is a SEPARATE, minimal page (not the full contractor self-service 
   portal) — only what a Supervisor needs to check at a glance:
   - Header: contractor name, ID, task type, overall status tag
   - 3 stat cards: Unresolved Issues count, Workers Onsite count, Machines 
     Due Maintenance count
   - License Status list (license name + Up to Date/Expired/Due Soon tag)
   - Machinery Maintenance list (machine name + Up to Date/Overdue/Due 
     Soon tag)
   - A "← Back to Supervisor Portal" link at the top
   Build one variant as a flagged/high-risk contractor (multiple issues, 
   an expired cert, overdue machinery) and one as a fully compliant 
   contractor (zero issues, everything up to date) — same visual system, 
   different data. Link them from 2-3 different rows in the main 
   dashboard's Contractors Directory.

### Technical Constraints
- Tailwind CSS via CDN only — no other libraries, no build step, no 
  charting library (build the risk bars/meters with plain divs + width 
  percentages).
- Plain vanilla JavaScript only, inline in a <script> tag — no frameworks.
- Every interactive behavior described above (search filter, + button 
  preselect+scroll, severity toggle, OCR demo, review&clear) must actually 
  function, not just be styled to look clickable.
- Self-contained files — each HTML file works standalone when opened 
  directly in a browser (file:// is fine).
- Output only the HTML files, no explanation text before/after unless asked.

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
