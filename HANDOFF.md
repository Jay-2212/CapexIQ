# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-05)*

**Where things stand:** The product is now called **CapexIQ** (was the placeholder
"Healthcare Capex Decision Support Tool"), tagline "Know if it pays for itself, before
you buy it.", living at `capexiq.jaybharti.me` (a subdomain, not a `/roi` path). This is
one project in one folder — it is *not* split across two repos; an earlier note in this
file said the app code lived in a separate, unreachable repo, which was wrong and has
been corrected (see `ISSUES.md` ISS-7). The identity/asset layer (logo, hero lockup,
OG image, manifest, head tags, dashboard mockup) and the code skeleton were both done
in this same folder, using "CapexIQ" from the start.

The rename is fully actioned across the identity layer: `logo-lockup.svg` and
`hero-lockup.svg` carry the CapexIQ wordmark, `og-image.svg/.png`, `site.webmanifest`,
`head-tags-snippet.html`, and `dashboard-mockup.svg` all updated to match. The icon mark
(pulse line → ascending bars) was deliberately kept unchanged — see the log entry below
for why. A skeletal Next.js + TypeScript app now exists (`/app`, `/formulas`,
`/equipment-data`, `/report-templates`, `/content`, `/exports`, `/tests`) per SPEC.md
§32, adjusted for a subdomain root instead of a `/roi` path. Every formula is a typed
stub that throws "not implemented"; equipment data JSON files have the right schema but
null placeholder values. Product, audience, tone, and the green/amber/red Investment
Outlook system are unchanged throughout.

All visual/design assets, `data-requirements.md`'s first research pass, and this
documentation system (INTRODUCTION.md, DIRECTORY.md, SPEC.md, ISSUES.md, HANDOFF.md,
AGENTS.md, README.md, and two new pillar docs — `CONVENTIONS.md` and
`agent-build-plan.md`) are in place. The repo is live at `github.com/Jay-2212/CapexIQ`.

**Build is now verified.** Node.js (v26.4.0) and npm (11.17.0) were installed via
Homebrew (`brew install node`) and put on PATH automatically. `npm install` and
`npm run build` both succeed — Next.js 15.5.20 compiles, type-checks, and produces a
working static export in `out/` (ISS-1 resolved). `npm install` surfaces 7 dev-only
audit warnings (esbuild/postcss transitive, not runtime-exploitable) — tracked as ISS-8,
not urgent.

**A full phased build plan now exists** in `agent-build-plan.md`: 9 phases from real
equipment data through formulas, content, a deliberately separate "wizard state design"
phase (write the transition table before any UI code — this is the direct fix for a
past project's session-timer bug, where stop/resume/tab-switch behavior was never
enumerated before being built), wizard UI, dashboard, exports, scenarios, and finally
deploy/go-live QA. `CONVENTIONS.md` sets the rules every phase is held to: one concern
per file, pure/tested `/formulas`, no duplicated calculation logic between dashboard and
exports, and which phases are safe to parallelize across agents (formulas and content
are; the wizard reducer is not).

**What's next:** Per `agent-build-plan.md`, Phase 1 (real equipment data) and Phase 2
(real formulas) can start immediately and in parallel — see that doc for the exact
per-file breakdown. Separately, you're setting up Cloudflare Pages + DNS for
`capexiq.jaybharti.me` yourself (ISS-2) — exact build settings were given directly in
chat (build command `npm run build`, output directory `out`, Node version pinned via
`NODE_VERSION` env var).

**Anything blocking or half-finished:** Nothing blocking. See `ISSUES.md` for the full
open list (infra not wired yet, equipment data still placeholder, some benchmark gaps
still genuinely unresearched, dev-dependency audit warnings). One cosmetic known quirk:
the CFO persona's background-removed cutout retains her office chair — see `ISSUES.md`
ISS-5.

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
