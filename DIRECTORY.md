# DIRECTORY.md — the map of the codebase

What exists, where it lives, and what it's for. This file is an index — it points to
each folder's own `README.txt`/`sources.txt` for detail (license, attribution, sourcing
notes) rather than repeating that content here. If a description below feels thin,
that's on purpose — go to the file it points to.

**Last full accuracy pass: 2026-07-13 (Phase 6).** Before this, several sections here
had drifted badly out of date (describing formulas as unimplemented, equipment data as
placeholder, content/report-templates as empty scaffolds — all wrong by the time of
this pass; Phases 1-3 had been complete for a day or more). Check `HANDOFF.md`'s
Current State block if anything below feels stale again — it's the actual source of
truth, this file is a map onto it.

---

## Folder map

```text
Roi_Calculator/                  (the "CapexIQ" GitHub repo)
├── README.md                    <- public-facing repo landing page (GitHub renders this)
├── INTRODUCTION.md              <- start here (project brief + rules), agent/dev-facing
├── HANDOFF.md                   <- current state + change log — read this first, always
├── handoff-archive/             <- old Change Log entries, moved out once HANDOFF.md's
│                                  live log exceeds ~150 lines (its own archive rule)
├── DIRECTORY.md                 <- this file
├── ISSUES.md                    <- open/accepted/resolved tracker, check every session
├── CONVENTIONS.md               <- how code gets written here — read before coding
├── agent-build-plan.md          <- phased build plan (10 phases), dependencies, DoD —
│                                  Phases 1-6 (data/formulas/content/design/wizard-state/
│                                  wizard UI) are complete; Phase 7 (results dashboard) is next
├── financial-model-spec.md      <- Investment Outlook score, EAC, discounted payback,
│                                  automatic actionable-insight engine — implemented
├── design/frontend-experience-audit-2026-07-13.md
│                               <- live-browser frontend critique and phased redesign
│                                  plan (ISS-27): guided flow, units, help, assets,
│                                  Advanced workspace, Methodology, and Results
├── SPEC.md                      <- full product spec (has its own index, don't read
│                                  front-to-back)
├── data-requirements.md          research brief + five completed research passes on
│                                 real Indian healthcare-equipment data, see below
├── AGENTS.md                    <- thin pointer to INTRODUCTION.md (auto-discovered filename)
├── package.json / tsconfig.json / next.config.ts / .gitignore   <- Next.js + TS scaffold
├── .claude/skills/capexiq-ui-assurance/ <- project-local technical UI/UX audit
│                                              skill for Claude Code; preserves the
│                                              existing design and checks planning,
│                                              accessibility, runtime, and performance
├── .claude/skills/capexiq-prebuild-assurance/ <- project-local pre-build
│                                              audit for whole-model/schema
│                                              correctness plus browser/privacy/
│                                              export/deployment security
├── app/                          Next.js App Router UI. Landing page, Methodology
│   │                              page, and the full wizard (Phase 6, real code as
│   │                              of 2026-07-13) are all REAL and built:
│   ├── layout.tsx                root route, not nested — subdomain, not a path
│   ├── page.tsx                  premium beige landing page — editorial hero,
│   │                              assessment story, depth choice, personas, CTA
│   ├── landing.css               landing-only responsive layout and visual system
│   ├── methodology/page.tsx      designed public Methodology page; renders the
│   │                              human methodology without internal formula/code paths
│   ├── globals.css               imports design/tokens.css + responsive 2026 experience CSS
│   ├── (assessment)/             route group sharing one WizardProvider across
│   │   │                          /assess/* and /results (route groups don't affect
│   │   │                          the URL) — see its own README.md
│   │   ├── layout.tsx            WizardProvider, persistence, route guard, live region
│   │   ├── assess/page.tsx       narrated equipment + hospital identity chapter
│   │   ├── assess/investment/    Step 1
│   │   ├── assess/usage/         Step 2
│   │   ├── assess/costs/         grouped costs + Basic/Advanced decision point
│   │   └── results/page.tsx      decision-led result story + Phase 7 depth: score,
│   │                              metrics, break-even bar, cash-flow chart, risk callout
│   ├── forms/                    wizard reducer/schema/validation/persistence logic —
│   │   │                          NOT routed pages, see its own README.md's file table
│   │   └── wizard-state.md       <- Phase 5 deliverable. Full route map,
│   │                              field-to-step assignment, validation timing,
│   │                              localStorage draft persistence — read this before
│   │                              touching any wizard component.
│   ├── advanced/                 six-topic Advanced workspace; one group active at a time
│   ├── components/               shared field controls, buttons, preview strip, plus
│   │   │                          formatting.ts (Indian currency incl. compact Lakh/
│   │   │                          Crore form), RiskCallout.tsx, and
│   │   │                          ResultsQuickSettings.tsx (Phase 7 — collapsed
│   │   │                          Discount Rate / Target IRR / financing-rate pane)
│   └── charts/                   BreakEvenBar.tsx, CashFlowChart.tsx (Phase 7) — see
│                                  its own README.md
├── public/                       Next.js static-export assets (equipment-images/,
│   │                              people-personas/, generated CT hero, legacy hero SVG)
│   └── README.md                  for the pre-step tiles/landing page — see its own README for why
├── formulas/                     16 calculation modules, ALL REAL — implemented,
│                                 reviewed, and tested (Phase 2 + Phase 6 + Phase 8's
│                                 monthlySeries.ts). See below.
├── equipment-data/                mri/ct/cath-lab/dialysis/ultrasound/custom.json —
│   │                               populated from five research passes, Phase 1 complete
│   ├── common-assumptions.json    non-equipment-specific benchmarks (discount rate,
│   │                               working days/month, loan terms) — see ISS-9 for
│   │                               the two fields still honestly `"Unavailable"`
│   └── README.txt
├── report-templates/              word/excel/methodology/disclaimer — CONTENT COMPLETE
│   └── README.txt                 (Phase 3); excel-sheet-structure.md and
│                                   word-report-template.md written for real in Phase 8
│                                   — see exports/ below (Phase 8, built)
├── content/                       field-explanations/benchmark-notes/glossary/tooltip —
│   ├── inputs-metadata.json       CONTENT COMPLETE (Phase 3/4). inputs-metadata.json is
│   │                               UI/control schema only (control type, slider bounds,
│   │                               tooltipKey) — NO numeric defaults, see ISS-9/ISS-4
│   ├── tooltip-copy.generated.json <- machine-readable parse of tooltip-copy.md, added
│   │                               Phase 6; regenerate via scripts/generateTooltipCopy.mjs
│   └── README.txt
├── scripts/                       one-off build/content scripts, see its own README.md
├── exports/                       excel/word/zip generators — REAL (Phase 8, 2026-07-14)
│   ├── workbookPlan.ts             pure cell/formula plan, verified via HyperFormula
│   ├── excel-generator.ts         writes the plan into a real .xlsx via exceljs
│   ├── word-generator.ts          12-section Word proposal via docx
│   ├── zip-generator.ts           bundles both via jszip
│   └── README.md
├── tests/
│   ├── formulas/                  19 files (17 from Phase 2 + 2 new canonical-pipeline
│   │   │                          test files from Phase 6)
│   │   └── README.md
│   ├── scenarios/                 5 golden end-to-end scenario files — independently-
│   │                               derived regression coverage (2026-07-13,
│   │                               capexiq-prebuild-assurance PBA-10), distinct from
│   │                               Phase 9's scenario-comparison UI
│   └── wizard/                    reducer/validation/persistence/component tests for
│                                   app/forms/ (Phase 6) — see its own README.md
├── equipment-images/             9 equipment/hero photos (JPG, hi-res, free stock)
│   └── sources.txt
├── people-personas/              4 sourced persona photos; public also has generated COO v2
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
└── design/                       colors, tokens, mockup, logo, favicon, hero bg, OG
    │                              image, PLUS the Phase 4 UX spec — design is complete
    └── README.txt                (Phase 4); see ux-product-spec.md below
```

---

## Quick lookup — "I need X, where do I look?"

| You need... | Go to | Notes |
|---|---|---|
| To understand the product | `SPEC.md` | Use its index at the top, don't read front-to-back |
| Where things stand right now | `HANDOFF.md` | Current State block at the top — the actual source of truth |
| Which phase to build next | `agent-build-plan.md` | Phases 1-6, 8 done; Phase 7's multi-equipment/multi-band visual QA pass and Phase 9 (scenario comparison) remain |
| The wizard's route map, field-to-step assignment, and state transitions | `app/forms/wizard-state.md` | Read before writing any wizard component |
| The actual wizard reducer/schema/validation code | `app/forms/README.md` | Full per-file table — reducer, field schema, validation, persistence |
| The canonical wizard-to-result calculation pipeline | `formulas/computeAssessment.ts` | Validated against `tests/scenarios/`'s golden numbers; the preview strip and `/results` both call this, never a second copy |
| How code should be structured/tested | `CONVENTIONS.md` | Read before writing or editing any code |
| Real Indian data on equipment cost/maintenance/financing/utilization | `data-requirements.md` | §12-§20 have five research passes' findings; see its own table below |
| The Investment Outlook score, EAC, discounted-payback, actionable-insight formulas | `financial-model-spec.md` | Implemented in `formulas/investmentOutlookScore.ts` etc. |
| Typography/spacing scale, tooltip mechanics, theme, landing-page/entry-flow decisions | `design/ux-product-spec.md` | Phase 4 deliverable, resolves SPEC.md §36.3 |
| Per-field validation bounds, control type (slider vs. input box), tooltip key | `content/inputs-metadata.json` | UI/control schema only — no numeric defaults |
| The exact popover copy for a field's tooltip | `content/tooltip-copy.md` | 7-slot format; keyed by readable field name |
| A plain-language walkthrough of the full calculation waterfall | `report-templates/methodology.md` | One worked example threaded through every section |
| The authoritative formula reference | `report-templates/formula-appendix.md` | One section per `/formulas` file, transcribed from the real implementation |
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

## formulas/ — full contents

15 modules, all implemented and tested (13 from Phase 2, 2 new from Phase 6). No `any`,
no reimplemented logic — each pulls shared math from elsewhere in `/formulas` rather
than duplicating it.

| File | What it computes |
|---|---|
| `depreciation.ts` | Straight-line depreciation per SPEC.md §31 |
| `emi.ts` | Loan EMI (SPEC.md §19) |
| `revenue.ts` | Billed → realized → cash-received revenue waterfall |
| `breakEven.ts` | Break-even usage/volume |
| `npv.ts` | Net present value |
| `irr.ts` | Internal rate of return, with an explicit undefined-IRR fallback |
| `realization.ts` | Payer-mix-weighted realization percentage |
| `dso.ts` | Days sales outstanding, extended through final delayed collection |
| `workingCapital.ts` | Working-capital gap (signed, not floored at zero) |
| `roi.ts` | Return on investment; also `cumulativeCashFlowSeries` (**new, Phase 7** — the running investment-position-by-year the Results cash-flow chart plots, never re-derived in the component) |
| `maintenance.ts` | AMC/CMC annual cost |
| `launchDelay.ts` | Simple monthly pre-operative interest during launch delay |
| `sensitivity.ts` | Scenario-level sensitivity grid, needs every other formula to run end to end |
| `investmentOutlookScore.ts` | The 0-100 Investment Outlook score — 4 weighted sub-scores per `financial-model-spec.md` §1 |
| `eac.ts` | Equivalent Annual Cost |
| `discountedPayback.ts` | Discounted payback period |
| `actionableInsight.ts` | The automatic "cheapest win" tariff/timing suggestion engine |
| `monthlySeries.ts` | **New, Phase 8** — month-by-month billed/realized revenue, costs, EMI/lease, and cash-received (extracted from `computeAssessment.ts`'s own internal logic, byte-identical refactor), feeding the Excel export's Monthly tab. Billed revenue ramps by the same utilization curve as realized revenue (ISS-29, resolved 2026-07-14) — `computeAssessment.ts`'s own flat headline `monthlyBilledRevenue`/`roiBilled` are unaffected. |
| `computeAssessment.ts` | **New, Phase 6.** The canonical wizard-inputs → full-result pipeline — the single derivation `app/forms/wizard-state.md` §4 requires; validated against `tests/scenarios/`'s golden numbers |
| `workingCapitalPeak.ts` | **New, Phase 6.** Peak working-capital gap across a DSO-extended horizon (SPEC.md §14.2's dashboard-warning framing) |

Tests: `tests/formulas/*.test.ts`, one file per module (plus 2 new pipeline test files),
run via `npm test`. See `tests/formulas/README.md` for current counts.

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
| `colors.md` | Full palette with rationale: neutrals, semantic status (green/amber/red/blue-gray), the "Signal" accent-interactive color, chart series, accessibility note |
| `tokens.css` | The same palette as CSS custom properties, plus the type scale (12-40px) and 4px-base spacing scale — import this, don't hardcode hex values elsewhere |
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
| `ux-product-spec.md` | **Phase 4 deliverable (2026-07-11).** Tooltip mechanics (click-to-open, not hover), landing page + entry flow ("Start Assessment" CTA → equipment/bed-count pre-step → wizard), default-value visual treatment, micro-interactions. Resolves SPEC.md §36.3. |
| `README.txt` | Same summary as this table, scoped to just this folder |

**Colors are the single source of truth in `tokens.css`.** If you ever change a hex
there, the SVGs in this folder (mockup, favicon, logo, hero, OG image) were hand-coded
against the *current* values and won't update automatically — search-and-replace the
old hex across the `.svg` files too.

---

## data-requirements.md — what's actually in it

Not just a research brief — five completed research passes live here too. Structure (§
numbers match its own headers, not SPEC.md's):

| § | What's there |
|---|---|
| 1-4 | Purpose, research scope (India-first, v1 equipment list), source quality rules, required output format |
| 5-6 | Core data areas and equipment-specific data requirements (the brief itself) |
| 7-9 | Defaults vs. benchmarks vs. user inputs (§7.3 defines what stays permanently user-entered, see ISS-4), UI implications, research agent instructions |
| 10-11 | Acceptance criteria, first-pass checklist |
| 12-14 | **First research pass** findings + a machine-readable starter assumptions table |
| 15 | Research gaps list — mostly resolved by later passes; check `ISSUES.md` before assuming anything here is still open |
| 16-17 | **Second research pass** (2026-07-07) — discount rate, MRI/dialysis utilization, CGHS tariffs, launch-delay ranges |
| 18 | **Third research pass** (2026-07-07) — warranty, salvage, installation %, AMC/CMC, Cath Lab tariff (previously fully empty) |
| 19 | **Fourth research pass** (2026-07-11) — MRI CMC bed/volume-tiering hypothesis, tested and **not verified** (ISS-12) |
| 20 | **Fifth research pass** (2026-07-12) — target IRR/hurdle rate and standalone CT utilization via live web search; confirmed still unavailable after five passes total (ISS-9). Also documents a live-search-tool hallucination caught mid-pass — worth reading if running a similar pass in the future. |

Confidence levels and source IDs are assigned throughout per §3's rules — don't treat
any figure as final without checking its confidence column. As of the fifth pass, every
equipment-data field either has a real sourced value or is deliberately, permanently
`null`/`"Unavailable"` with the reason documented in `ISSUES.md` (ISS-4, ISS-9, ISS-12).

---

## Known quirks and open issues

Tracked in **`ISSUES.md`**, not here — check it before assuming something's fine, and add
to it the moment you spot a new problem. **As of 2026-07-13, `ISSUES.md`'s Open section
has 5 items from Phase 6** (ISS-17 through ISS-21: a realization/claim-deduction
composition judgment call, a Lease-financing assumption, two Advanced Mode fields
collected but not yet consumed by the canonical pipeline, and a note that no
interactive browser QA was possible in that session's environment) — none block Phase
6's own Definition of Done, but read them before extending the wizard or the pipeline.
One quirk stays here because it's pure trivia, not an issue:
The sourced Administrator/COO photos are from the same photoshoot and looked duplicated
side by side. The live landing page now uses the generated distinct COO v2 under
`public/people-personas/`; keep the sourced originals for provenance/history only.

Also worth knowing: Investment Outlook / risk colors are green/amber/red, the hardest
pair for red-green colorblindness. Always pair color with the icons in
`icons/ui-status/` and a text label — never rely on color alone (see `design/colors.md`
accessibility note).

---

## What's NOT here yet

Phases 1-6 of `agent-build-plan.md` are complete: real equipment data, the tested
formula engine, content, the wizard state contract, and the full wizard. The
2026-07-13 experience redesign is also implemented: premium beige landing,
narrated/grouped Basic flow, one-topic Advanced workspace, designed Methodology, and
decision-led Results foundation. All of it is real working code with 175 passing tests,
a clean build, clean typecheck, and live desktop/mobile browser QA. Specifically
remaining:

- **Phase 7 — Results dashboard and charts.** `/results` already has the redesigned
  outlook story, score ring, NPV/IRR/payback cards, supporting metrics, and Advanced
  route. It still needs break-even/cash-flow charts, richer risk/narrative depth, and
  accessible table equivalents. The mandatory design gate at the top of
  `agent-build-plan.md` Phase 7 governs styling. `design/dashboard-mockup.svg` is an
  information-architecture reference only, not the current visual language. Phase 7 adds the
  Advanced settings pane (`discountRate`/`targetIrr`/`loanInterestRate` quick-tweak,
  wizard-state.md §1.2) — not built.
- **Phase 8 — Exports. Built 2026-07-14.** `exports/*.ts` generate real Excel (live
  embedded formulas, verified via a HyperFormula test oracle plus an actual LibreOffice
  headless recalculation — SPEC.md §29.5), Word, and ZIP files from the same
  `AssessmentInputs`/`AssessmentResult` the dashboard renders. Chart images deferred
  (data tables stand in). This phase also surfaced a flat-billed/ramped-realized
  revenue asymmetry, resolved same-day per Jay's decision — see `ISSUES.md` ISS-29.
- **Phase 9 — Scenario comparison / sensitivity UI, plus 3 pipeline gaps from Phase 6.**
  `formulas/sensitivity.ts` is implemented and tested; there's no UI surfacing it yet.
  `tests/scenarios/` holds golden end-to-end regression tests (2026-07-13), not the
  scenario-comparison UI itself. Also see `ISSUES.md` ISS-19: utilization ramp-up and
  the per-year maintenance schedule override are collected in wizard state but not yet
  consumed by `computeAssessment.ts` — likely Phase 9 work, since sensitivity/ramp
  modeling are closely related.
- **Phase 10 — Deploy and go-live QA.** The site is live at `capexiq.jaybharti.me`
  (Cloudflare Pages), but that's serving the current skeleton (landing page still a
  placeholder), not a finished product — real go-live QA happens once Phases 7-9 land.
  See `ISSUES.md` ISS-21: Phase 6 itself has not had an interactive browser QA pass.

Check `HANDOFF.md`'s Current State block and `ISSUES.md` before assuming any of the
above is still missing or that new gaps haven't appeared — they're the source of truth
for what's actually done.
