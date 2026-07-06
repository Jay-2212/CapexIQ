# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-06)*

**Where things stand:** Product is **CapexIQ**, tagline "Know if it pays for itself,
before you buy it.", living at `capexiq.jaybharti.me` (confirmed resolving, HTTP 200).
Repo is live at `github.com/Jay-2212/CapexIQ` (main, last pushed 2026-07-05 — today's
session's changes are not yet pushed). Build is verified: `npm install`/`npm run build`
succeed (Next.js 15.5.20, static export to `out/`). Core docs: `CONVENTIONS.md` (code
rules), `agent-build-plan.md` (9 phases, dependencies, Definition of Done), `ISSUES.md`
(open/accepted/resolved tracker — check before assuming anything is fine).

UI/UX decisions for the input layer are settled: operational variables (usage/day,
billed tariff, working days, launch delay) render as sliders; structural/capital
variables (purchase cost, useful life, financing terms) render as precise input boxes;
tooltips are click-to-open popovers (hover rejected, poor touch support), each showing
professional definition, default value (or an explicit "no benchmark available" note),
and higher/lower-value impact. This is codified in `content/inputs-metadata.json`.

**Correction this session (2026-07-06, see ISSUES.md ISS-9):** a prior pass populated
`inputs-metadata.json` with per-field numeric defaults, several invented rather than
sourced — most seriously, SPEC.md falsely claimed a 12% discount rate / 15% target IRR
were "sourced from `data-requirements.md` §12.3," which has no such row. Cleaned up:
`inputs-metadata.json` now holds only UI/control schema (control type, slider bounds,
tooltip copy), zero numbers. All equipment-specific benchmarks live only in
`equipment-data/<type>.json` (now also has `billedTariffPerUse` and `launchDelayMonths`
fields, both null pending research). Non-equipment-specific figures (discount rate,
target IRR, loan interest rate/tenure, working days/month) moved to new
`equipment-data/common-assumptions.json`, each carrying honest confidence/sourceId —
the fabricated ones are now `null`/`"Unavailable"`, not fake-precise numbers. SPEC.md
§18.2/§18.3/§23.4 corrected to stop asserting the false citation. `agent-build-plan.md`
Phase 1 now includes a reconciliation check for this. A deep-research prompt covering
exactly the now-null gaps (usage/day, tariff, discount rate, hurdle rate, launch delay)
is ready to hand to a research agent — see ISS-9 for the full list.

**Also streamlined this session:** `agent-build-plan.md` Phase 4 was split awkwardly
from Phase 6 — the wizard got a proper stateful-flow transition table (per
`CONVENTIONS.md` §1) but the dashboard's live slider-driven recalculation (edit
Discount Rate/IRR/interest rate → instant chart/gauge update) did not, despite being
the same class of stateful UI bug the rule exists to catch. Phase 4 is now "Interactive
state design" with two parts — Part A (wizard flow) and Part B (slider →
recompute → chart re-render, shared by both the wizard's live preview and the
dashboard's Advanced settings pane) — and Phase 6 implements Part B rather than
inventing its own behavior.

**What's next:** Get the deep-research pass done (prompt ready, see this session's
conversation) to fill the now-null gaps in `equipment-data/`. Once that lands, Phase 1
(equipment data) and Phase 2 (formula engine) of `agent-build-plan.md` can proceed in
parallel — Phase 2's Group A formulas (pure, no data dependency) can actually start
immediately, independent of the research pass.

**Anything blocking or half-finished:** Nothing blocking. Today's doc changes are
uncommitted/unpushed as of this entry — see the open PR for this cleanup.

---

## End-of-session checklist

Before you finish a session, do this:

- [ ] Overwrite the **Current State** block above — don't leave it describing an old session.
- [ ] Add a new entry at the **top** of the Change Log below (most recent first).
- [ ] If you made a new folder, confirm it has a README.txt/sources.txt.
- [ ] If the log below is approaching ~150 lines, archive it (see rule below).

---

## Archive rule

Once the Change Log below exceeds roughly 150 lines, move everything except the most
recent 2-3 entries into `handoff-archive/YYYY-Q#.md` (e.g. `handoff-archive/2026-Q3.md`),
and leave a one-line pointer in its place: `See handoff-archive/2026-Q3.md for entries
before <date>.` This keeps HANDOFF.md fast to read no matter how old the project gets.

---

## Change Log

*(most recent first)*

### 2026-07-06 — Cleaned up invented benchmark numbers (ISS-9); streamlined build-plan Phase 4/6
**What changed:** Audited the prior session's `content/inputs-metadata.json` and found
several invented numbers, most seriously a false claim that a 12% discount rate / 15%
target IRR were sourced from `data-requirements.md` §12.3 (no such row exists there).
Also found `usagePerDay`/most `billedTariffPerUse` defaults had no source at all
(utilization is an explicit open gap per §15), a dialysis tariff default that
contradicted its own cited source's explicit caution against using it as a default, and
`loanInterestRate` presented as a clean default despite the source rating it
Low-Medium confidence / `sensitivity_range`. Fixed by: rewriting
`content/inputs-metadata.json` to hold only UI/control schema (no numbers); adding
`billedTariffPerUse` and `launchDelayMonths` fields (both null) to every
`equipment-data/<type>.json`; creating `equipment-data/common-assumptions.json` for
non-equipment-specific figures (discount rate, target IRR, loan terms, working
days/month), each with honest confidence/sourceId, with the fabricated ones now
`null`/`"Unavailable"`; correcting SPEC.md §18.2/§18.3/§23.4's false citation and
absolute claims. Separately, restructured `agent-build-plan.md` Phase 4 into
"Interactive state design" (Part A: wizard flow, Part B: slider-driven live
recalculation shared by the wizard and the dashboard's Advanced settings pane) since
Phase 6 had been inventing its own live-recalculation behavior outside the
transition-table discipline `CONVENTIONS.md` §1 requires. Logged the whole episode as
ISSUES.md ISS-9, including a process note (per user direction) that build-plan/spec
docs get one primary agent going forward, not parallel unsupervised editing.
**Files touched:** `content/inputs-metadata.json`, `equipment-data/*.json` (all 6),
`equipment-data/common-assumptions.json` (new), `equipment-data/README.txt`, `SPEC.md`,
`agent-build-plan.md`, `DIRECTORY.md`, `ISSUES.md` (ISS-9 added), `HANDOFF.md` (this
entry + Current State).
**What's next:** hand the prepared deep-research prompt to a research agent to fill the
now-null gaps (usage/day, tariff, discount rate, hurdle rate, launch delay); once real
values land, Phase 1 can complete. Phase 2 Group A formulas can start now, independent
of this.

### 2026-07-06 — Centralized inputs metadata added; UI/UX slider and tooltip specifications plan integrated
**What changed:** Created `content/inputs-metadata.json` as a single, cohesive input registry for the frontend and reports, mapping inputs to control types (sliders for operational inputs vs. input boxes for capital inputs), defaults sourced from `data-requirements.md` benchmarks (e.g., 12% discount rate, 15% target IRR, 11.5% loan rate, 13/15 years useful life), and custom tooltip content schemas. Updated `SPEC.md` §18, §23, and §25 to document click-to-open popover tooltip behavior (rejecting hover actions), slider/popover custom CSS dimensions/borders/shadows matching `tokens.css`, and dynamic recalculation settings. Updated `agent-build-plan.md` Phases 4, 5, and 6 to require integration of the inputs metadata registry, custom sliders, click tooltips, and real-time dashboard default parameter editability. Documented registry under `DIRECTORY.md`.
**Files touched:** `content/inputs-metadata.json` (new), `SPEC.md`, `agent-build-plan.md`, `DIRECTORY.md`, `HANDOFF.md` (this entry + Current State).
**What's next:** Phase 1 (real equipment data) and Phase 2 (real formulas) of the build plan.

### 2026-07-05 — Build verified; phased build plan + code conventions written
**What changed:** Installed Node.js/npm via Homebrew and verified the skeleton for
real: `npm install` then `npm run build` both succeed (Next.js 15.5.20, static export
to `out/`), resolving ISS-1. Added `.gitignore` entries for `next-env.d.ts` and
`*.tsbuildinfo` (standard Next.js generated files) and committed `package-lock.json`
for reproducibility. `npm install` surfaces 7 dev-only audit warnings (esbuild/postcss,
transitive through vite/vitest and next) — logged as ISS-8, not urgent, not a build
blocker. Wrote two new pillar docs: `agent-build-plan.md` (the "v0.6 — Agent Build
Spec" artifact SPEC.md §38 already called for — 9 phases from equipment data through
deploy/go-live QA, each with dependencies, parallelization notes, and a Definition of
Done) and `CONVENTIONS.md` (file/dependency/typing/testing rules, and — directly
addressing user-reported pain from a past project where a browser extension's session
timer shipped with broken stop/resume/tab-switch behavior — a hard rule that any
stateful UI flow gets its states and transitions written down and edge-case-tested
*before* implementation, not after). `agent-build-plan.md` Phase 4 applies this rule
concretely to this project's input wizard. Wired both new docs into `INTRODUCTION.md`'s
reading order and `DIRECTORY.md`'s folder map and quick-lookup table.
**Files touched:** `.gitignore`, `package-lock.json` (new), `ISSUES.md` (ISS-1 resolved,
ISS-2 updated with real repo URL + Cloudflare build settings note, ISS-8 added),
`agent-build-plan.md` (new), `CONVENTIONS.md` (new), `INTRODUCTION.md`, `DIRECTORY.md`,
`HANDOFF.md` (this entry + Current State).
**What's next:** Phase 1 (real equipment data) and Phase 2 (real formulas) per
`agent-build-plan.md` — both can start now, in parallel. Cloudflare Pages + DNS setup
(ISS-2) is being done directly by the project owner, not an agent, using build settings
given in chat (build command `npm run build`, output dir `out`, `NODE_VERSION` pinned).

### 2026-07-05 — Code skeleton built; ISSUES.md created; corrected "two repos" mixup
**What changed:** Built the skeletal Next.js + TypeScript structure per SPEC.md §32:
`/app` (root route, adjusted from the spec's original `/app/roi` nesting since the tool
now lives on its own subdomain rather than a path — noted directly in SPEC.md §32), 13
formula modules under `/formulas` (typed signatures only, each throws "not
implemented"), 6 equipment-data JSON placeholders (schema-shaped, null values, not real
numbers), placeholder `.md` files under `/report-templates` and `/content`, export
generator stubs under `/exports`, and empty test-folder scaffolds under `/tests`. Added
`package.json`/`tsconfig.json`/`next.config.ts`/`.gitignore`, plus a public-facing root
`README.md` (GitHub renders this; `INTRODUCTION.md` stays the agent/dev briefing).
Created `ISSUES.md` as a new top-level tracker (open/accepted/resolved problems) and
migrated `DIRECTORY.md`'s old "Known quirks" section into it rather than keeping two
copies. Also caught and corrected a mixup: a concurrent session's rebrand pass (see the
entry directly below) assumed the app code lived in a separate, unreachable GitHub repo
and left `ISSUES.md`/`HANDOFF.md` saying so — there is no second repo, it's this same
folder, and the skeleton was written using "CapexIQ" from the start with no old-name
strings to fix. Recorded as `ISSUES.md` ISS-7 (resolved) so the assumption doesn't
resurface. Also updated the remaining scattered old-name mentions this session found:
`data-requirements.md`, `equipment-images/sources.txt`, `design/colors.md` headers, plus
INTRODUCTION.md/DIRECTORY.md rename passes and SPEC.md's identity metadata, §1, §26.1,
§32, and §34 (marked "Decided: CapexIQ" with the historical brainstorm kept below it).
**Files touched:** `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`,
`README.md` (new), `app/**`, `formulas/**`, `equipment-data/**`, `report-templates/**`,
`content/**`, `exports/**`, `tests/**` (all new), `ISSUES.md` (new), `HANDOFF.md` (this
entry + Current State), `DIRECTORY.md`, `INTRODUCTION.md`, `SPEC.md`,
`data-requirements.md`, `equipment-images/sources.txt`, `design/colors.md`,
`design/tokens.css` (header comment only).
**What's next:** Also done in this session (after the skeleton above): `git init`,
initial commit, and `gh repo create Jay-2212/CapexIQ --public --push` — repo is now
live at `github.com/Jay-2212/CapexIQ`. Remaining, per `ISSUES.md`: verify the build with
a real Node environment, wire up Cloudflare Pages + DNS, populate real equipment data,
implement formulas, build the UI.

### 2026-07-05 — CapexIQ rebrand: identity layer actioned
**What changed:** Actioned `design/rebrand-brief.md` (product renamed Healthcare Capex
Decision Support Tool → **CapexIQ**, tagline "Know if it pays for itself, before you buy
it.", URL moved from `jaybharti.me/roi` to the subdomain `capexiq.jaybharti.me`).
Updated: `logo-lockup.svg` wordmark (was a two-line "Healthcare Capex / Decision
Support", now a single "CapexIQ"); `og-image.svg`/`.png` (small caps logo label,
headline swapped to the tagline, footer URL updated, PNG re-rendered); `site.webmanifest`
(`name`/`short_name` → "CapexIQ", `start_url`/`scope` → "/" since it's now a subdomain
root, not a path); `head-tags-snippet.html` (added a `<title>`, updated OG/Twitter
title/description/url/image); `dashboard-mockup.svg` (header title text only). Built
the brief's optional deliverable, `hero-lockup.svg` (icon + wordmark + tagline, for the
landing hero). **Deliberately did not change** the icon mark itself (pulse line →
ascending bars) — it already reads as "signal turning into a growth/analysis chart",
which fits "IQ" well enough, and changing it would have cascaded into re-exporting all
5 favicon sizes for a rename brief that explicitly said not to over-design. Flagging
this call per the brief's request. Also caught up this file and `DIRECTORY.md` /
`design/README.txt`, which still had stale old-name references from before this pass.
**Files touched:** `design/logo-lockup.svg`, `design/og-image.svg`, `design/og-image.png`,
`design/site.webmanifest`, `design/head-tags-snippet.html`, `design/dashboard-mockup.svg`,
`design/hero-lockup.svg` (new), `design/README.txt`, `DIRECTORY.md`, `HANDOFF.md` (this
entry). Colors, photography, icons, fonts, and `hero-background.svg` untouched, per the
brief.
**What's next:** The actual app code/repo (separate from this asset folder — see
`ISSUES.md` ISS-1/ISS-2) still carries the old name wherever it appears (page titles,
metadata, package.json, etc.) and needs the same rename pass applied once that repo is
reachable.

### 2026-07-05 — data-requirements.md: research brief + first pass
**What changed:** Built `data-requirements.md` per SPEC.md §24/§39 — defines what real
Indian healthcare-equipment data is needed (source quality rules, required output
format, acceptance criteria), then ran a first research pass against that brief:
findings with source IDs and confidence levels for MRI/CT/Cath Lab/Dialysis/Ultrasound
plus financing and depreciation norms, and a machine-readable starter assumptions table
meant to seed future equipment JSON files. Explicitly flags what's still genuinely
unresearched (payer-wise realization %, DSO by payer, specialist fees, actual vendor
quotes) rather than guessing at those numbers.
**Files touched:** `data-requirements.md` (new, at project root).
**What's next:** Build equipment data files (`mri.json`, etc.) from this file's §14
starter table; deepen research on the §15 open gaps if/when better sources surface.

### 2026-07-05 — Agent-documentation system built
**What changed:** Created the self-governing documentation system: this file
(HANDOFF.md), INTRODUCTION.md, DIRECTORY.md, and SPEC.md (the original spec, moved in
from Documents root with a new index prepended, content otherwise unchanged). Slimmed
AGENTS.md down to a thin pointer at INTRODUCTION.md — its old heavy content (directory
map, lookup tables, known quirks) moved into DIRECTORY.md so it isn't duplicated in two
places.
**Files touched:** `SPEC.md` (new), `INTRODUCTION.md` (new), `HANDOFF.md` (new),
`DIRECTORY.md` (new), `AGENTS.md` (rewritten/slimmed). Deleted
`/Users/jay/Documents/healthcare-capex-decision-support-v0.2.md` (moved into SPEC.md).
**What's next:** Build equipment data files (`mri.json`, etc.) from
`data-requirements.md` §14's starter table, then content/copy files and app scaffolding
per SPEC.md §32.

### 2026-07-05 — Background-removed persona cutouts
**What changed:** Generated transparent (background-removed) versions of all 4 persona
photos using rembg/U2Net, saved alongside the originals in a `transparent/` subfolder so
both versions are available.
**Files touched:** `people-personas/transparent/01–04-*-cutout.png`,
`people-personas/transparent/README.txt`.
**What's next:** CFO cutout (#03) has the office chair retained in her silhouette — flagged, not fixed. Manual touch-up needed if a fully isolated cutout is required.

### 2026-07-05 — Full design system + brand assets
**What changed:** Built the complete visual design system by hand (no stock/AI
generation): color palette + CSS tokens, a full decision-dashboard mockup, a favicon
mark + multi-size exports, a logo lockup, a hero background, an OG/social share image,
a PWA manifest, and a copy-paste `<head>` tags snippet.
**Files touched:** everything under `design/`.
**What's next:** none at the time — this was a complete deliverable for the design system.

### 2026-07-05 — Icon set and fonts sourced
**What changed:** Curated ~60 icons from the Lucide library (MIT/ISC, no attribution
required) into 5 purpose-based folders, and downloaded Inter / IBM Plex Sans / IBM Plex
Mono as self-hostable TTF files (weights 400/500/600/700).
**Files touched:** everything under `icons/`, everything under `fonts/`.
**What's next:** none at the time.

### 2026-07-05 — Equipment and persona stock photography sourced
**What changed:** Sourced and downloaded free, no-watermark, hi-res stock photos: 9
equipment/hero images and 4 persona photos, all from Pexels (free license, no
attribution required). Two equipment images are flagged as approximations (no exact
free stock photo exists for a real cath lab or for this actual product's dashboard).
**Files touched:** everything under `equipment-images/`, everything under
`people-personas/` (originals only, transparent cutouts came later).
**What's next:** background removal for persona photos (done in a later entry above).

---

*(No entries before this point — this is the first Change Log for this project.)*
