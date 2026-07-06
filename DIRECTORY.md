# DIRECTORY.md — the map of the codebase

What exists, where it lives, and what it's for. This file is an index — it points to
each folder's own `README.txt`/`sources.txt` for detail (license, attribution, sourcing
notes) rather than repeating that content here. If a description below feels thin,
that's on purpose — go to the file it points to.

---

## Folder map

```text
Roi_Calculator/                  (becomes the "CapexIQ" GitHub repo)
├── README.md                    <- public-facing repo landing page (GitHub renders this)
├── INTRODUCTION.md              <- start here (project brief + rules), agent/dev-facing
├── HANDOFF.md                   <- current state + change log
├── DIRECTORY.md                 <- this file
├── ISSUES.md                    <- open problems/gaps/quirks tracker, check every session
├── CONVENTIONS.md               <- how code gets written here — read before coding
├── agent-build-plan.md          <- phased build plan, dependencies, Definition of Done
├── SPEC.md                      <- full product spec (moved from Documents root, indexed)
├── data-requirements.md          research brief + first-pass findings on real Indian
│                                 healthcare-equipment data (SPEC.md §24), see below
├── AGENTS.md                    <- thin pointer to INTRODUCTION.md (auto-discovered filename)
├── package.json / tsconfig.json / next.config.ts / .gitignore   <- Next.js + TS scaffold
├── app/                          Next.js App Router UI (root route, not nested — see
│   ├── layout.tsx                SPEC.md §32's note on why: subdomain, not a path)
│   ├── page.tsx                  placeholder landing page, not the real wizard yet
│   ├── globals.css               imports design/tokens.css
│   ├── components/README.md      shared UI components — empty scaffold
│   ├── forms/README.md           7-step wizard inputs — empty scaffold
│   ├── results/README.md         decision dashboard — empty scaffold
│   ├── charts/README.md          break-even / cash-flow charts — empty scaffold
│   └── advanced/README.md        Advanced Mode UI — empty scaffold
├── formulas/                     13 calculation modules per SPEC.md §32 — signatures
│                                 only, every function throws "not implemented"
├── equipment-data/                mri/ct/cath-lab/dialysis/ultrasound/custom.json —
│   ├── common-assumptions.json    non-equipment-specific benchmarks (discount rate,
│   │                               target IRR, financing) — see ISS-9, mostly still null
│   └── README.txt                schema-shaped placeholders, not real data (ISS-3/ISS-9)
├── report-templates/              word/excel/methodology/disclaimer — placeholder .md
│   └── README.txt
├── content/                       field-explanations/benchmark-notes/glossary/tooltip
│   ├── inputs-metadata.json       <- UI/control schema only (control type, slider bounds,
│   │                                 tooltip copy) — NO numeric defaults, see ISS-9
│   └── README.txt                 copy — placeholder .md
├── exports/                       excel/word/zip generator stubs
│   └── README.md
├── tests/
│   ├── formulas/README.md
│   └── scenarios/README.md
├── equipment-images/             9 equipment/hero photos (JPG, hi-res, free stock)
│   └── sources.txt
├── people-personas/              4 persona photos (JPG) for "who this is for" section
│   ├── sources.txt
│   └── transparent/             same 4, background removed (PNG, transparent)
│       └── README.txt
├── icons/                        60 curated SVG icons (Lucide), grouped by purpose
│   ├── README.txt
│   ├── LICENSE-lucide.txt
│   ├── equipment-clinical/
│   ├── financial-model/
│   ├── ui-status/
│   ├── export/
│   └── navigation/
├── fonts/                        Inter, IBM Plex Sans, IBM Plex Mono (TTF, 4 weights)
│   ├── README.txt
│   ├── Inter/
│   ├── IBM-Plex-Sans/
│   └── IBM-Plex-Mono/
└── design/                       colors, tokens, mockup, logo, favicon, hero bg, OG image
    └── README.txt
```

---

## Quick lookup — "I need X, where do I look?"

| You need... | Go to | Notes |
|---|---|---|
| To understand the product | `SPEC.md` | Use its index at the top, don't read front-to-back |
| Where things stand right now | `HANDOFF.md` | Current State block at the top |
| Which phase to build next | `agent-build-plan.md` | Phases in order, each with dependencies + Definition of Done |
| How code should be structured/tested | `CONVENTIONS.md` | Read before writing or editing any code |
| Real Indian data on equipment cost/maintenance/financing/utilization | `data-requirements.md` | §12-14 have first-pass findings + a starter assumptions table; §15 lists what's still genuinely unknown |
| A photo of MRI/CT/dialysis/etc. equipment | `equipment-images/` | 9 photos, see its `sources.txt` |
| A photo of a hospital admin/CFO/COO/consultant | `people-personas/` | 4 photos; use `transparent/` if you need them cut out of a background |
| An icon for a specific equipment type or UI state | `icons/<category>/` | See table below for which subfolder |
| The exact hex colors / CSS variables to use | `design/tokens.css` | Import this globally; `design/colors.md` explains the *why* |
| A mockup of what the actual dashboard should look like | `design/dashboard-mockup.svg` | Matches SPEC.md §21 |
| The app's icon/favicon | `design/favicon-mark.svg` + `design/favicon-exports/` | Pre-rendered at 16/32/48/180/512px |
| The logo for a header/nav bar | `design/logo-lockup.svg` | Icon + "CapexIQ" wordmark, single file |
| A hero-section lockup with tagline | `design/hero-lockup.svg` | Icon + wordmark + "Know if it pays for itself, before you buy it." |
| A background image for the landing page hero | `design/hero-background.svg` | Deliberately subtle — sits behind text |
| The social-share preview image | `design/og-image.png` (+ `.svg` source) | 1200×630, use as `og:image` |
| `<head>` tags for favicon/manifest/OG/Twitter | `design/head-tags-snippet.html` | Copy-paste, update domain if needed |
| PWA manifest | `design/site.webmanifest` | Pairs with the favicon exports |
| Font files to self-host | `fonts/<family>/` | TTF, weights 400/500/600/700 |

---

## icons/ — which subfolder has what

| Subfolder | Use for |
|---|---|
| `equipment-clinical/` | Equipment category icons: MRI/CT (`scan`), cath lab/cardiology (`heart-pulse`), dialysis (`droplets`), ultrasound (`waves`), lab (`microscope`, `flask-conical`, `test-tube`), OT (`cross`), hospital/building (`hospital`, `building-2`), bed size (`bed`) |
| `financial-model/` | Dashboard metrics: `calculator`, `indian-rupee`, `trending-up/down`, `percent`, `landmark` (loan), `wallet`, `piggy-bank`, `scale` (break-even), `pie-chart`/`bar-chart`/`line-chart`/`area-chart`, `gauge` (investment score) |
| `ui-status/` | Tooltip (`help-circle`), warnings (`alert-triangle`, `circle-alert`), success (`circle-check`), risk (`circle-x`), advanced-mode toggle (`sliders-horizontal`), timing (`clock`, `hourglass`, `calendar`) |
| `export/` | Excel (`file-spreadsheet`), Word (`file-text`), ZIP (`package`), `download`, `folder` |
| `navigation/` | Step-wizard (`list-checks`, `circle-check-big`), stakeholders (`users`), break-even target (`target`) |

Full Lucide library (1994 icons) is available anytime via `npm install lucide-static` or
`lucide-react` — only add that dependency when you actually start coding. These ~60 are
just the ones the spec calls for; don't re-download the whole library for one extra
icon. Check here first, and if it's genuinely missing, `npm view lucide-static` has the
rest. License: ISC, see `icons/LICENSE-lucide.txt` — no attribution required.

---

## design/ — full contents

| File | What it is |
|---|---|
| `colors.md` | Full palette with rationale: neutrals, semantic status (green/amber/red/blue-gray), chart series, accessibility note |
| `tokens.css` | The same palette as CSS custom properties — import this, don't hardcode hex values elsewhere |
| `dashboard-mockup.svg` | Full decision-dashboard mockup (Investment Outlook gauge, metric cards, break-even chart, cumulative cash-flow chart, risk callout) — matches SPEC.md §21 |
| `favicon-mark.svg` | Master icon (pulse line → ascending bars), navy rounded square |
| `favicon-exports/` | That icon pre-rendered as PNG at 16/32/48/180(apple-touch-icon)/512px |
| `logo-lockup.svg` | Icon + "CapexIQ" wordmark for header/nav |
| `hero-lockup.svg` | Icon + "CapexIQ" + tagline ("Know if it pays for itself, before you buy it."), for the landing hero |
| `hero-background.svg` | Dot-grid + faint ascending trend lines for the landing page hero, vignetted to recede behind a headline |
| `og-image.svg` / `og-image.png` | 1200×630 social share preview (LinkedIn/WhatsApp/Twitter link unfurl) |
| `site.webmanifest` | PWA manifest referencing the favicon exports |
| `head-tags-snippet.html` | Copy-paste `<head>` block wiring up favicons, manifest, OG/Twitter meta tags |
| `rebrand-brief.md` | The brief that drove the Healthcare Capex → CapexIQ identity update (2026-07-05) — kept for history, already actioned |
| `README.txt` | Same summary as this table, scoped to just this folder |

**Colors are the single source of truth in `tokens.css`.** If you ever change a hex
there, the SVGs in this folder (mockup, favicon, logo, hero, OG image) were hand-coded
against the *current* values and won't update automatically — search-and-replace the
old hex across the `.svg` files too.

---

## data-requirements.md — what's actually in it

This is not just a research brief — it also contains a completed first research pass.
Structure (§ numbers match its own headers, not SPEC.md's):

| § | What's there |
|---|---|
| 1-4 | Purpose, research scope (India-first, v1 equipment list), source quality rules, required output format |
| 5-6 | Core data areas and equipment-specific data requirements (the brief itself) |
| 7-9 | Defaults vs. benchmarks vs. user inputs, UI implications, research agent instructions |
| 10-11 | Acceptance criteria, first-pass checklist |
| 12-13 | **First research pass findings** — general and equipment-specific, with source IDs and confidence levels |
| 14 | **Machine-readable starter assumptions** — a table (equipment_type / metric / value range / unit / confidence / source_id) meant to seed `equipment-data/*.json` or `assumptions.csv` |
| 15 | Research gaps still open — what must stay user-entered or low-confidence (payer realization %, DSO by payer, specialist fees, actual vendor quotes) |

Confidence levels and source IDs are already assigned per SPEC.md §23's caution against
inventing benchmarks — don't treat anything in §14 as final without checking its
confidence column.

---

## Known quirks and open issues

Tracked in **`ISSUES.md`**, not here — check it before assuming something's fine, and add
to it the moment you spot a new problem. One quirk stays here because it's pure trivia,
not an issue: `people-personas/01-hospital-administrator.jpg` and
`02-operations-head-coo.jpg` are two different photos from the same original photoshoot
(same photographer/setting) — fine individually, just visually similar side by side.

Also worth knowing: Investment Outlook / risk colors are green/amber/red, the hardest
pair for red-green colorblindness. Always pair color with the icons in
`icons/ui-status/` and a text label — never rely on color alone (see `design/colors.md`
accessibility note).

---

## What's NOT here yet

Visual/design assets are done, a first research pass on real Indian data exists
(`data-requirements.md`), the project is renamed to CapexIQ, and a skeletal Next.js
code structure exists per SPEC.md §32. Still missing:

- Real content in every placeholder file: equipment data JSON (ISS-3), report templates,
  content/copy files, formula implementations (all currently `throw new Error("not
  implemented")`), and all UI components.
- The skeleton has never been through `npm install`/`npm run build` — Node isn't
  installed in the environment it was built in. See ISSUES.md ISS-1.
- Cloudflare Pages project + DNS record for `capexiq.jaybharti.me` — dashboard-only
  action, see ISSUES.md ISS-2.
- A financial disclaimer — this tool gives investment guidance; needs one before launch
  (`report-templates/disclaimer.md` is a placeholder, not the real thing).
- Real values for several benchmark fields that a prior pass filled with invented
  numbers (including a fabricated citation to `data-requirements.md` §12.3 for discount
  rate/target IRR, which doesn't exist there) — stripped back to `null`/unresourced on
  2026-07-06, see ISSUES.md ISS-9. A deep-research prompt covering exactly these gaps is
  ready to hand to a research agent.

Check `HANDOFF.md`'s Current State block and `ISSUES.md` before assuming any of the
above is still missing — they're the source of truth for what's actually done.
