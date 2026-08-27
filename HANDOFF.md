# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-08-27, WebMCP compatibility and live verification)*

**CapexIQ's six-tool WebMCP surface is deployed and verified in both the Codex
in-app Browser and the required external readiness scan:**

- The root `LICENSE` with the official MIT text and Copyright 2026 Jay Prakash
  Bharti is the single project license presented for GitHub detection.
- The README is a visual product brief covering CapexIQ's differentiators, Chrome
  `document.modelContext` integration, six tools, Mermaid agent flow,
  auditable calculation spine, gallery, quickstart, verification, disclaimers, and
  third-party attribution.
- Added four optimized PNG showcase assets under `docs/assets/screenshots/`, with
  the first three cropped to remove capture-only empty canvas from the live
  deployment screenshots. The folder's `README.txt` records capture provenance and
  refresh guidance.
- The native WebMCP surface under `app/webmcp/` exposes
  `get_presets`, `get_wizard_form`, `simulate`, `apply_inputs`,
  `export_assessment`, and `get_metric_guide`. The registry prefers the current
  `document.modelContext` API and falls back to deprecated
  `navigator.modelContext` for older validators and hosts.
- Source verification is green: 330 tests, `npx tsc --noEmit`, `npm run lint`,
  `npm run build`, and `git diff --check`. Production Pages deployment
  `c5519861-9568-424b-8d79-bfb918fe05a5` (source `51bc16f`) is live at both
  `https://c5519861.capexiq-portfolio.pages.dev` and
  `https://capexiq.jaybharti.me/assess`.
- The IsItAgentReady scan now reports
  `checks.discovery.webMcp.status = "pass"` and finds all six tools via its legacy
  navigator host. The in-app Browser independently executes all six tools successfully
  with synthetic CT inputs, including a no-download Excel export.
- Registration passes an `AbortSignal`, cleanup aborts that signal, and execute
  callback typing includes the API's cancellation options.
- `apply_inputs` now derives its immediate response through the same wizard reducer
  actions it dispatches, so `currentStateSummary`, completion, and KPIs no longer lag
  one React render behind the applied values.

### Earlier verification context retained below

*(Last updated: 2026-08-07, autonomous release-quality/accessibility verification pass
— see the Change Log entry below for the full list; one mechanical bug fixed
(ISS-34, purchase-cost unit conversion), one new bug documented not fixed (ISS-35), no
financial-model formula/scoring/threshold/benchmark changed)*

**This session re-ran the full baseline (npm ci, typecheck, lint, 290 tests, build,
`git diff --check`, a real end-to-end Excel/Word/ZIP export generation+structural
inspection) — all green, matching the 2026-08-06 session's claims exactly. GitHub
Actions CI showed one failed run on commit `8bc6c3c`
("job was not acquired by Runner... even after multiple attempts") — confirmed
transient infra, not a code/workflow defect, by re-running the identical job, which
went green with no changes. Browser QA (Claude-in-Chrome, no Dark Reader interference
confirmed via DOM check) walked the full flow on **Dialysis, a non-MRI equipment type
producing a Weak outcome** — the exact combination the 2026-08-06 session flagged as
still-untested. Found and fixed one real, high-value mechanical bug: `app/forms/
equipmentDefaults.ts` was converting every equipment type's "Typical" purchase-cost
default as if it were raw rupees, when each `equipment-data/*.json` file states its own
unit (Lakh or Crore) — both currently-populated cases (Dialysis, Cath Lab) were wrong by
a factor of 10^5-10^7, silently seeding a "Typical"-badged field a real user could trust
without noticing (see ISS-34, resolved). Also found and documented, not fixed, a second,
smaller defect in the actionable-insight card's never-payback gating (ISS-35). Everything
below this paragraph describes state as of 2026-07-14/2026-08-06 and is still accurate
unless a note above says otherwise.**

**The warm-beige "calm clinical intelligence" redesign and Phase 7's results dashboard
depth are both implemented and verified live.** The canonical calculation pipeline and
Crore-based financial contracts are unchanged throughout.

- `/` has a decision-led hero, a compact model-coverage strip, a three-step story, a
  legible Basic/Advanced comparison, concise role cards, and a final CTA. Landing-only
  rules live in `app/landing.css`. Purpose-made CT and COO assets are in
  `public/design/hero-ct-suite-v2.webp` and
  `public/people-personas/05-operations-head-coo-v2.webp`.
- `/assess` collects hospital name and carries the selected equipment into the hospital
  profile stage. Investment supports independent Lakh/Crore display units for purchase
  and civil cost while persisting canonical Crore values. Usage and costs are grouped
  by meaning. Required-field errors are gated behind touch/attempt
  (`app/forms/useFieldController.ts`'s `touched || attempted` check, driving every
  field's `data-invalid` — confirmed via direct DOM inspection, not just visually, that
  a fresh untouched load never sets `data-invalid="true"`); a blocked "Next"/"Begin the
  assessment" reveals every blocked field on that step via `ATTEMPT_STEP`.
- Basic completion offers two explicit paths. Advanced Mode is a six-topic workspace
  with one active topic; payer assumptions use a compact table. Help and Methodology no
  longer expose repository/code language; Methodology is a two-column doc layout with
  its own sticky table of contents (`app/methodology/page.tsx`).
- `/results` leads with a human outlook, score, NPV/IRR/payback, and supporting
  metrics, then **Phase 7's new depth**: a break-even comparison bar
  (`app/charts/BreakEvenBar.tsx`), a cumulative cash-flow bar chart
  (`app/charts/CashFlowChart.tsx`, fed by the new pure `cumulativeCashFlowSeries`
  in `formulas/roi.ts` — never recomputed in the component, per CONVENTIONS.md §3), a
  data-driven risk callout (`app/components/RiskCallout.tsx`) that reuses
  `investmentOutlookScore.ts`'s own 55-point "Moderate" floor to decide which
  sub-scores get called out, plus a working-capital-gap timing note, and a collapsed-
  by-default **"Adjust the assumptions that move this the most"** quick-settings panel
  (`app/components/ResultsQuickSettings.tsx`) — Discount Rate, Target Hurdle IRR, and
  the active financing rate/rental (Loan interest rate, Lease rental, or a plain note
  for Cash), reusing the existing `NumberField` so edits dispatch through the one
  wizard reducer and `useAssessmentResult` recomputes live with no separate wiring.
  This is Phase 7's literal "Advanced settings pane" goal line, not just the pre-
  existing "Open Advanced Mode" link satisfying it by proxy — live-verified in the
  browser (lowering the discount rate from 12.5% to 8% moved the score from 45/
  "Caution" to 65/"Moderate" and NPV from −₹9.0L to +₹1.12Cr instantly). All four are
  pure-presentational/dispatch-only and read `AssessmentResult`/
  `InvestmentOutlookResult`/the wizard reducer directly — no calculation logic inline.
- Root verification: **196 tests passing across 33 files, clean TypeScript, clean
  static-export build.** A Phase 4-D contrast check (computed WCAG contrast ratios via
  `getComputedStyle`, not eyeballing) found and fixed one real failure: the cash-flow
  chart's small year labels were `--text-muted` at 3.29:1 against the card background,
  below the 4.5:1 small-text floor; switched to `--text-secondary` (5.91:1). All other
  new chart/callout text checked at 5.9:1–14.7:1.

**A note on this session's browser QA:** the automation browser has the Dark Reader
extension active, which repaints every page (confirmed via `data-darkreader-*`
attributes and a since-superseded false hydration-mismatch console warning it causes).
Structural/layout/copy/responsive QA in this doc is trustworthy; color/contrast claims
are based on either (a) a `<meta name="darkreader-lock">` injected via
`javascript_tool`, which reliably makes Dark Reader release a page for one clean
render, or (b) direct `getComputedStyle`/CSS-source inspection bypassing the extension
entirely — never on an un-locked screenshot. Future sessions using `claude-in-chrome`
for visual QA should do the same, or ask Jay to disable the extension for `localhost`.

**Two things flagged, not silently decided:**
1. **The "red validation box before a field is filled" behavior Jay asked to have
   fixed was already resolved** before this session started — independently, by two
   different uncommitted/unmerged efforts that both landed on the same touched/attempt
   gating (see the Change Log entry below for how they were reconciled). This session
   could not reproduce the bug anywhere in the flow (landing → equipment select →
   hospital profile → investment currency fields → usage sliders → costs → Advanced
   payer table, including hard reloads), and confirmed it structurally: every field
   component keys its red state off the gated `error`/`data-invalid`, never off raw
   `required`. Re-open if Jay still sees it — that would mean a component or browser
   this session didn't reach.
2. **Historical deployment note — ISS-28 is now resolved:** at the time of this older
   verification the live Cloudflare Pages deployment was stale and `/assess` was not
   directly available. The verified `9b14e06` Pages deployment now serves the current
   build on the custom domain and direct `/assess` route. The Git integration still did
   not auto-create the deployment, so this release used the authenticated Pages upload
   path after the source push.

**2026-07-14 session — Phase 8 (Excel/Word/ZIP exports) built, plus Phase 7's last
open item:**
- **Chart-level hover tooltips** (the one item Phase 7 was missing) are built:
  `app/charts/CashFlowChart.tsx`/`BreakEvenBar.tsx` bars are focusable/hoverable marks
  showing exact value + series label + period, on both mouse hover and keyboard focus,
  live-verified in a real browser. See `docs/agent-build-plan.md` Phase 7's Do-list.
- **Phase 8 exports are real**, not stubs: `exports/excel-generator.ts` produces a
  `.xlsx` with live, embedded formulas (Assumptions/Monthly/Annual Summary/Break-even
  Analysis/Maintenance Schedule/Charts(data)/Formula Notes tabs) referencing an
  Assumptions sheet by direct cell address; `exports/word-generator.ts` produces a
  12-section `.docx`; `exports/zip-generator.ts` bundles both. All three are wired to
  three new download buttons on `/results` (`app/components/ExportPanel.tsx`), lazy-
  loading `exceljs`/`docx`/`jszip` on click so the initial page bundle is untouched.
  Live-verified end to end in a real browser against a real MRI scenario: all three
  downloads produced correctly-sized, correctly-MIME-typed files with zero console
  errors.
- **The formula-correctness verification for Excel is a HyperFormula oracle, not a
  "does a formula string exist" check** — the exact cell plan
  (`exports/workbookPlan.ts`) is fed into a real formula-evaluation engine and every
  evaluated result is checked against `computeAssessment()`/the new
  `formulas/monthlySeries.ts` across two golden scenarios. This caught two real bugs
  before they shipped (an unquoted space-containing sheet-name reference, and a
  missing upper-bound guard on a DSO cash-received lookup that produced `#NUM!` past
  the useful-life horizon). See `docs/agent-build-plan.md` Phase 8's DoD status for the
  full verification writeup. **Follow-up (2026-07-14):** LibreOffice is now installed
  in this environment and was used to actually recalculate a real generated `.xlsx`
  headlessly (`soffice --convert-to xlsx` with `OOXMLRecalcMode` forced to always-
  recalculate, since exceljs writes formulas with no cached values and LibreOffice
  doesn't recalc xlsx on load by default) — its IRR cell matched
  `computeAssessment()`'s own IRR to ~13 significant digits, independently confirming
  the HyperFormula oracle's result.
- **ISS-29 (billed/realized ramp asymmetry) resolved:** `computeAssessment.ts` ramped
  realized revenue/variable cost by the utilization ramp but never ramped billed
  revenue — an existing asymmetry this phase's monthly-series work made externally
  visible for the first time. Jay's decision (2026-07-14, after an advisor pass over
  three options): ramp billed revenue too, in `formulas/monthlySeries.ts` and
  `exports/workbookPlan.ts` only — `computeAssessment.ts`'s own flat headline
  `roiBilled`/`roiRealized`/`annualOperatingSurplus` fields are untouched (they already
  used flat, unramped figures for both revenue views). See `ISSUES.md` ISS-29.
- **Chart images (Excel "Charts" tab, Word §8) are deferred, not built** — flagged
  explicitly in both `report-templates/excel-sheet-structure.md` and
  `word-report-template.md`, a data table stands in for now. Now that LibreOffice is
  available, verifying a rasterized image round-trips correctly is unblocked but still
  not done this session — remains a fast-follow.
- Verification: 249 tests (up from 203 at Phase 8's start; monthlySeries/workbookPlan/
  excel-generator/word-generator/zip-generator/chart-tooltip tests all new, plus the
  ISS-29 fix's updated ramp assertions), clean `tsc --noEmit`, clean static-export
  `npm run build` (confirmed via build output that exceljs/docx/jszip stay in lazy
  chunks — `/results` grew ~1KB, not the ~1MB+ eager-bundling would add).

**2026-07-14 (same day), separate session — Phase 9 (scenario comparison /
sensitivity / actionable insight) built:**
- **`app/components/ScenarioComparisonTable.tsx`** (SPEC.md §28): only the SPEC §28.1
  *user-named* scenario option is implemented — no auto Conservative/Base/Optimistic
  preset, since no researched or Jay-approved numeric definition of those terms exists
  anywhere; inventing one would be exactly the unsourced product constant CLAUDE.md
  reserves for Jay. The three names remain `<datalist>` suggestions only. Compares
  Capex/billed tariff/usage-per-day overrides through the same `computeAssessment()`
  everyone else uses (via new `formulas/assessmentOverrides.ts`), rendering every
  SPEC §28.2 column. Ephemeral `useState`, not wizard state — lost on reload by design.
- **`app/components/SensitivityStrip.tsx`** (the continuous, slider-driven view SPEC
  §11.2/§27 name but never spec in detail): drags usage/day and realization %
  (bounds from `content/inputs-metadata.json`) and shows a live NPV/IRR/payback strip.
  Deliberately runs the full canonical `computeAssessment()`, **not** the lighter
  `runScenario` `docs/agent-build-plan.md`'s Phase 9 text originally pointed at — an Opus
  advisor pass caught that `runScenario` has no utilization ramp/maintenance
  schedule/payer-mix granularity, so at rest it would show different numbers than the
  dashboard headline directly above it. Local-state only, never dispatched through
  the wizard reducer (unlike `ResultsQuickSettings`), so it can never mutate the
  user's real inputs.
- **`app/components/ActionableInsightCard.tsx`** (docs/financial-model-spec.md §4,
  Jay-approved 2026-07-07): renders the passive price-increase suggestion or nothing.
  **Found the underlying formula already built** — `formulas/actionableInsight.ts`
  existed since a Phase 2/3-era session (commit `128a929`), fully implementing §4's
  grid/gate/cheapest-win/null-case/rounding rules with its own passing tests, just
  never wired to any UI. Reused as-is. This session's actual new formula work was
  `formulas/sensitivity.ts`'s `deriveScenarioAssumptions()`, bridging the canonical
  `AssessmentInputs`/`AssessmentResult` pair into the `ScenarioAssumptions` shape both
  the strip and the insight card need, without inventing a baseline.
- Live-verified in a real browser (`claude-in-chrome`, fresh MRI scenario, no Dark
  Reader interference this time): sensitivity strip's resting NPV/IRR/payback matched
  the dashboard headline exactly (₹8,17,36,626 / 52.4% / 1.9yr) — confirming the
  `computeAssessment`-not-`runScenario` call; dragging usage to 49/day live-updated to
  ₹22,84,48,931 / 116.3% / 0.9yr and Reset restored the baseline exactly; scenario
  table added/edited (tariff ₹3,500→₹5,000 recomputed NPV/IRR/payback/every column
  correctly)/renamed via the datalist/removed cleanly; mobile viewport (390×844)
  checked, no overflow, controls stack correctly. No qualifying actionable insight
  appeared for this particular scenario (already-fast 1.9yr payback) — correct,
  expected `null`, not force-exercised further.
- Verification: **265 tests** (up from 250 after `npm install` in a fresh worktree;
  15 new — `assessmentOverrides`, `deriveScenarioAssumptions`,
  `ActionableInsightCard`, `SensitivityStrip`, `ScenarioComparisonTable`), clean
  `tsc --noEmit`, clean static-export `npm run build`.
- **Chart images (Excel "Charts" tab, Word §8) remain deferred, not built this
  session either** — Jay's own framing for this session ("Now unblocked by
  LibreOffice being available, but not built this session; remains a fast-follow")
  is accurate: LibreOffice is installed and was already used earlier the same day to
  headlessly verify a real generated `.xlsx` (see this doc's Phase 8 entry above), so
  the original blocker is gone, but building/verifying the actual chart images was
  out of scope for this session, which was Phase 9. `report-templates/excel-sheet-
  structure.md` Tab 6 and `word-report-template.md` §8 still carry the explicit
  data-table-stands-in note. Next session can go straight to building and
  LibreOffice-verifying it, no blocker to re-confirm first.

**Next:** Phase 9 (sensitivity/scenario comparison/actionable insight) is now built —
see this doc's entry above and `docs/agent-build-plan.md`'s Phase 9 section. Two fast-follows
remain open across Phases 7-8: a visual QA pass across the other equipment types and a
Strong/Weak outcome (only MRI at Caution/Moderate, and this session's own fresh MRI
Strong/100 run, have been live-tested — Weak/Caution on a non-MRI type is still
untested), and chart images (Excel "Charts" tab, Word §8 — LibreOffice is available and
already used once for formula verification, but the images themselves are still not
built). Phase 10 (deploy/go-live QA) is next in the numbered sequence once those
fast-follows are cleared or explicitly deferred further by Jay. A dedicated real-user
copy pass and the Dark-Reader-free device QA pass noted above remain open. Do not return
Advanced Mode to a six-group continuous scroll, expose internal field/formula
identifiers in public UI, or fix the stale live-deploy issue without checking with Jay
first (it may be intentional, e.g. mid-migration).

---

Full history of how we got here lives in the Change Log below (most recent first) —
not duplicated here per this doc's own "overwrite, don't append" rule for this section.

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

### 2026-08-27 — WebMCP legacy-host compatibility and acceptance pass
**What was found:** CapexIQ's live implementation already followed the current
`document.modelContext` API, and the Codex in-app Browser exposed all six tools. The
required IsItAgentReady scan still injected the deprecated `navigator.modelContext`
namespace, so it reported no tools even though the production bundle and browser
runtime were healthy.

**What changed:** Added a narrow host resolver that prefers `document.modelContext`
and falls back to `navigator.modelContext`, tightened execute-callback cancellation
typing, added fallback and precedence tests, and documented the compatibility rule.
The final live-tool pass also found and fixed stale immediate output from
`apply_inputs` by deriving its response through the canonical wizard reducer. No
financial formulas changed.

**Verification:** 330/330 tests, TypeScript, ESLint, static build, and diff check pass.
Committed and pushed as `2eac4c4` and `51bc16f`. Cloudflare Pages production deployment
`c5519861-9568-424b-8d79-bfb918fe05a5` is live on the custom domain. The external
scan now reports `checks.discovery.webMcp.status = "pass"` with six tools. The in-app
Browser independently executed all six tools with synthetic CT inputs, including a
no-download Excel export; all six returned success.

### 2026-08-27 — Showcase screenshot cleanup and license consolidation
**What changed:** Tightened the public repository presentation without touching the
application, methodology page, financial model, or WebMCP implementation:
1. Cropped `01-hero-landing.png`, `02-assessment-wizard.png`, and
   `03-results-dashboard.png` to remove the capture-only empty canvas while
   preserving their full visible content. `04-sensitivity-and-exports.png` was
   already clean and was left unchanged.
2. Replaced the README's previous promotional framing with a neutral “What makes
   CapexIQ better” comparison focused on hospital decision quality.
3. Removed the duplicate `LICENSE-CODE` file so the root `LICENSE` is the single
   MIT license presented for GitHub detection.
**Verification:** `npm test` passed 326/326 tests in 47 files; `npx tsc --noEmit`,
`npm run lint` (zero errors/warnings), `npm run build`, and `git diff --check` all
passed.

### 2026-08-27 — README showcase, screenshot evidence, and GitHub license detection
**What changed:** Elevated the repository's public presentation without changing
application or financial-model behavior:
1. Added a standard root `LICENSE` containing the official MIT License text and
   `Copyright (c) 2026 Jay Prakash Bharti`; retained `LICENSE-CODE` for its existing
   source-scope documentation.
2. Rewrote `README.md` as a visual product showcase with Live Demo, 326-test,
   Chrome WebMCP, TypeScript strict-mode, Next.js App Router, and MIT badges;
   problem/solution comparison; WebMCP tool catalog and Mermaid flow; calculation
   spine; screenshot gallery; quickstart; DevTools inspection notes; disclaimer;
   and third-party attribution.
3. Added `docs/assets/screenshots/README.txt` plus four PNG assets captured from
   `https://capexiq.jaybharti.me` in the Codex in-app Browser on a synthetic MRI
   assessment: landing hero, assessment wizard, results dashboard, and sensitivity
   plus local exports. PNG encoding and compression were normalized after capture.
4. Removed capture-only temporary files; no application, formula, WebMCP, or export
   source files were changed.
**Verification:** `npm test` passed 326/326 tests in 47 files; `npx tsc --noEmit`,
`npm run lint` (zero errors/warnings), `npm run build`, and `git diff --check` all
passed. The four final assets are tracked only as `docs/assets/screenshots/*.png`
alongside the provenance README.

### 2026-08-27 — WebMCP deployment and runtime verification
**What was found:** The canonical source checkout contains the six-tool WebMCP
implementation, but the live `/assess` page serves a pre-WebMCP 4,971-byte layout
bundle with no `modelContext`, `registerTool`, or tool-name symbols. The in-app
browser exposes a WebMCP capability, but the live page still reports no
`document.modelContext`; its discovery wrapper then fails because the bridge's
`webmcp_list_tools` command is unsupported. The live response also lacks the
origin-isolation policy signals called out by current Chrome guidance; no restrictive
`tools` Permissions Policy was observed. Source tests/build/typecheck remain green.
The registry also needs an API
conformance follow-up for async registration and AbortController cleanup.
**Resolution:** Updated the registry to the current async registration/lifecycle
shape, added `public/_headers` with `Origin-Agent-Cluster: ?1`, added the Chrome
DevTools WebMCP `.mcp.json` configuration, pushed commits `4e2a71e` and `95350c7`,
and directly deployed the verified `out/` artifact to Pages as deployment
`e6802ef3-c38c-4948-86e5-26d00253a295`. The built-in browser still cannot list
page tools because its `webmcp_list_tools` bridge command is unsupported.

### 2026-08-27 — Web Model Context Protocol (WebMCP) standard implementation
**What changed:** Implemented native WebMCP support (`document.modelContext`) for CapexIQ under `app/webmcp/` with zero modifications to existing financial formulas in `formulas/`:
1. **Core WebMCP layer:** Built `types.ts`, `toolDefinitions.ts` (with strict schemas and character budgets), and `registry.ts` (with safe SSR/browser feature detection and error shielding).
2. **6 Tool Handlers (`app/webmcp/handlers/`):**
   - `handleGetPresets`: Benchmark lookup across all 6 equipment types from `equipment-data/*.json`.
   - `handleGetWizardForm`: Live 4-step snapshot inspection with computed KPIs.
   - `handleSimulate`: In-memory sandbox financial simulation without mutating browser state.
   - `handleApplyInputs`: Dispatches updates to `WizardContext`, supports Basic vs. Advanced mode, and automatically routes to `/results`.
   - `handleExport`: Integrated with `.xlsx`, `.docx`, and `.zip` generators.
   - `handleGetMetricGuide`: Reference manual for NPV, IRR, Payback, EAC, Working Capital, and Payer Mix optimization.
3. **React Integration:** Mounted `WebMCPProvider` in `app/(assessment)/layout.tsx` for tool registration on mount and unregistration on teardown.
4. **Error recovery envelopes:** Standardized 3-part diagnostic envelopes (`error_code`, `message`, `suggested_fix`) across negative contribution margins, invalid payer mixes, and out-of-bounds parameters.
5. **Verification:** 326/326 tests passing in Vitest (24 new WebMCP tests), clean TypeScript, clean ESLint, and clean `next build` static export.

### 2026-08-27 — Results dashboard presentation refinement
**What changed:** Jay asked for a narrow visual and comparison pass before WebMCP. The
existing calculation engine and previously approved wizard behavior were preserved.
1. **Cumulative cash flow:** moved the five Y-axis labels into a fixed HTML axis so
   they remain readable instead of being horizontally stretched with the SVG plot.
2. **Chart arrangement:** stacked the break-even and cumulative cash-flow cards at full
   width, removing the empty side space created by the shorter break-even card.
3. **What-if marker:** moved the current-value marker outside the non-uniformly-scaled
   SVG and made it a fixed CSS circle, preserving the chart's wide aspect ratio.
4. **Compare Options:** replaced the old dense table with a compact lower/base/higher
   summary. Lower and higher tariff/usage values start at −20%/+20% and are editable;
   the base case remains read-only. Break-even usage and risk stay visible, while the
   other ten metrics are behind a `Look at all the details` disclosure and recalculate
   through the canonical assessment engine.
5. **Verification:** focused results tests (12/12), full suite (302/302), TypeScript,
   ESLint, static-export build, and `git diff --check` passed. The live Results page was
   refreshed and checked in the browser, including editing an alternative and expanding
   its detail table. Code commit: `7ff85bd`; final Cloudflare Pages deployment:
   `https://a6eab817.capexiq-portfolio.pages.dev`; the custom domain was refreshed and
   showed the same result.
**Not touched, on purpose:** WebMCP, backend/Supabase, export formatting, financial
methodology, scoring constants, sourced benchmarks, purchase-unit behavior, payer
collection behavior, financing flow, and image assets.

### 2026-08-27 — WebMCP foundation pass: financing flow, layout, assets, and repository organization
**What changed:** Jay asked for five foundation fixes before WebMCP itself: repair the
preview strip, make the Basic/Advanced action mode-aware, make Basic loan calculations
complete without forcing the full Advanced panel, optimize served images, and clean the
GitHub root.
1. **Preview strip:** removed sticky positioning so the payback/status strip stays in
   the page's normal flow and cannot cover the heading or fields while scrolling.
2. **Mode-aware result action:** Step 3 now says `Continue with Basic...` while the
   Advanced workspace is closed and `Continue with Advanced...` while it is open.
3. **Basic financing:** added the minimum Loan fields (down payment, interest rate,
   tenure) and the analogous Lease fields to Basic Mode. They use the existing Group C
   state, existing validation, and the canonical `toAssessmentInputs()` mapping, so
   the loan/lease math is included in Basic results and the values carry into Advanced.
   Added focused component, validation, and calculation regression tests.
4. **Image delivery:** replaced served raster copies with resized quality-85 WebP
   copies, added intrinsic dimensions and loading hints, and removed one unused served
   COO image. Root source assets were preserved. This is a visual-quality optimization,
   not mathematical lossless encoding.
5. **Repository organization:** moved the three long planning/research/model documents
   into `docs/`, added `docs/README.md`, and updated repository references and the
   directory map. The existing MIT code licence remains at `LICENSE-CODE`.
6. **Tool preparation:** updated the local web-search skill to prefer TinyFish with
   Firecrawl as fallback, and configured Chrome DevTools MCP for a refreshed Codex
   session. WebMCP code was not added in this pass.
7. **Verification:** `npm test` 298/298, `npx tsc --noEmit`, `npm run lint`,
   `npm run build`, and `git diff --check` all pass. Local browser verification covered
   the Basic Loan path, Advanced value carry-over, Results navigation, normal-flow
   preview strip, and WebP image loading.
**Not touched, on purpose:** backend/Supabase, WebMCP tool definitions, Excel/Word
export redesign, financial methodology, scoring constants, sourced benchmarks, and
deployment configuration.

### 2026-08-27 — Results dashboard repair before WebMCP
**What changed:** Jay reported regressions in the results dashboard and asked for a
narrow repair pass before beginning WebMCP. No wizard unit behavior, payer collection
logic, financing flow, image assets, exports, or WebMCP code was changed.
1. **IRR:** replaced endpoint-only bisection with a bounded scan plus bisection of each
   sign-change interval. Multiple valid roots now use the smallest non-negative root;
   genuinely unrecoverable cash flows remain `Undefined` by design.
2. **Charts:** restored a compact break-even card with a numeric scale, added readable
   Y-axis labels/grid lines to cumulative cash flow, removed the result-row stretch that
   created a large blank break-even card, and made the sensitivity SVG fill its wide plot.
3. **Scenario comparison:** restored the fixed three-column lower/base/higher layout,
   with ±20% applied to billed tariff and usage and all metrics recomputed through the
   canonical assessment engine.
4. **Verification:** full suite 301/301, `npx tsc --noEmit`, `npm run lint`, static
   `npm run build`, and `git diff --check` passed. Cloudflare Pages deployment
   `845f8530` was refreshed and checked live before the final commit; the live DOM showed
   a numeric IRR, five cash-flow axis labels, a full-width sensitivity path, and the
   lower/base/higher scenario headers.

### 2026-08-07 — Autonomous release-quality/accessibility verification pass
**What changed:** Jay was unavailable; ran a scoped verification pass per this
project's `CLAUDE.md` (advisor-triage for judgment calls, never touch methodology/
benchmarks/scoring, close at most one high-value mechanical issue found via tests or
browser QA).
1. **Full baseline re-verified, matching the 2026-08-06 session's claims exactly:**
   `npm ci` (clean, 5 accepted dev-only audit findings per ISS-8), `npx tsc --noEmit`
   (clean), `npm run lint` (clean), `npm test` (290/290 passing before this session's
   own additions), `npm run build` (clean static export), `git diff --check` (clean).
   A real end-to-end export pass (financed loan + ramped utilization + multi-payer MRI
   scenario, run outside the test suite) generated real `.xlsx`/`.docx` files,
   confirmed via `file`/`unzip -l` as genuine OOXML with the expected 7-sheet/
   correctly-sized structure.
2. **GitHub Actions CI investigated:** the run on commit `8bc6c3c` showed as failed
   ("job was not acquired by Runner of type hosted even after multiple attempts") —
   this is a GitHub-side runner-provisioning glitch, not a workflow or code defect
   (public repo, unlimited hosted-runner minutes, standard `ubuntu-latest`). Confirmed
   by re-running the identical job with no changes: went green. No CI changes made or
   needed.
3. **Browser QA (Claude-in-Chrome) walked the full flow on Dialysis** — a non-MRI
   equipment type producing a Weak outcome, the exact gap the 2026-08-06 session
   flagged as still-untested ("only MRI at Strong/Moderate has been browser-tested").
   No Dark Reader interference (confirmed via a `data-darkreader-*` DOM check before
   trusting any visual/contrast observation). Verified: landing → equipment select →
   hospital profile validation (confirm-again "Start over," per-field
   `aria-required`/`aria-invalid`/`data-invalid` gating spot-checked via DOM, matching
   the 2026-08-06 session's fix) → Investment/Usage/Costs steps → Basic-path
   completion → Results dashboard (Weak/0, NPV/IRR/payback, risk notes) → quick-
   settings live recalculation (discount rate 12.5%→6% moved NPV live, no separate
   wiring) → Advanced Mode opens without error (Payers & collection table renders) →
   export buttons (self-labeling text, no `aria-label` needed) → keyboard focus
   (Tab moves through interactive elements with a visible focus ring, confirmed via
   `getComputedStyle` box-shadow, not just a screenshot).
4. **ISS-34 (resolved) — found and fixed:** `app/forms/equipmentDefaults.ts` divided
   every equipment type's `purchaseCost.typical` by a flat 10,000,000 to seed the
   "Typical"-badged purchase-cost default, silently assuming raw rupees. Each
   `equipment-data/*.json` file actually states its own unit for that field, and both
   currently-populated cases use a scaled unit (Dialysis: Lakh, Cath Lab: Crore) — the
   bug produced a default off by 10^5 (Dialysis) to 10^7 (Cath Lab), passing validation
   silently since it's a required-but-nonzero number. Fixed by making the one consumer
   unit-aware (`purchaseCostTypicalInCrore()`, three cases: Crore as-is, Lakh ÷100,
   else ÷CRORE) — no sourced value in any `equipment-data/*.json` file was touched,
   only how the already-correct number scales into the wizard's internal Crore
   representation. `installationCost` (derived from the same base value) is fixed too.
   Verified live in the browser, both directions of the Lakh/Crore toggle, for both
   equipment types, not just via the new unit test
   (`tests/wizard/equipmentDefaults.test.ts`, 3 cases). Full detail in `ISSUES.md`.
5. **ISS-35 (open) — found, documented, not fixed:** in the same Weak-outcome scenario,
   `ActionableInsightCard` rendered the literal text "...by about Infinity months" —
   `formulas/actionableInsight.ts`'s `paybackImprovementMonths` is `Infinity` whenever
   the baseline never pays back (using `runScenario()`'s `Infinity` sentinel), which
   trivially clears the ≥6-month qualifying gate and renders unformatted into the
   sentence. This is a gating decision as much as a display bug, so it's documented
   only, not fixed this session — see `ISSUES.md` ISS-35.
6. **Verification:** 293/293 tests (290 baseline + 3 new), clean `tsc --noEmit`, clean
   `npm run lint`, clean static-export `npm run build`, `git diff --check` clean.
**Not touched, on purpose:** ISS-30 (launch delay methodology, reserved for Jay),
ISS-31 (accepted IRR behavior), ISS-28 (stale Cloudflare deploy — no direct deployment
evidence gathered this session, not claimed fixed), any scoring weight, threshold,
benchmark figure, sourced default value, or methodology composition rule.

### 2026-08-06 — Autonomous correctness/export/accessibility/release-quality pass
**What changed:** Jay was unavailable; ran an Opus-advised QA pass with a standing
mandate to fix what's safely fixable and document (never invent a fix for) anything
touching methodology, benchmarks, or scoring weights, per this project's `CLAUDE.md`.

1. **CI added (new):** `.github/workflows/ci.yml` — install/typecheck/lint/test/build/
   `git diff --check` on every push and PR to `main`. No CI existed before this session.
2. **`npm run lint` fixed (ISS-32):** the repo never had a committed ESLint config, so
   `next lint` (deprecated, interactive-only without one) had never actually run to
   completion non-interactively. Added `eslint.config.mjs` (flat config,
   `next/core-web-vitals` + `next/typescript`), pinned `eslint@^9`/
   `eslint-config-next@15.5.22` to match the installed `next` version (note: a
   same-session `npm audit fix` bumped `next` itself 15.5.20→15.5.22, a same-major
   patch update within `package.json`'s existing `^15.0.0` range — see ISS-8), changed
   the script to `eslint .`. Fixed the 7 findings the first clean run surfaced (2 real
   unescaped-entity JSX issues, 1 stale eslint-disable, 2 dead variable bindings in
   `exports/workbookPlan.ts`, 3 `let`→`const` in test files) — no behavior change.
3. **`npm audit fix` (non-breaking) applied** — fixed `brace-expansion`/`undici`
   findings surfaced by the new eslint dependency tree. Two more (next/sharp,
   uuid/exceljs) remain and are documented as accepted in ISS-8, matching that issue's
   existing "don't force a breaking downgrade" precedent.
4. **`formulas/workingCapitalPeak.ts` gained its first dedicated unit test**
   (`tests/formulas/workingCapitalPeak.test.ts`) — previously only exercised
   indirectly through `computeAssessment.test.ts`'s golden scenarios. Hand-derived
   fixtures (arithmetic shown in comments), including a same-value-doesn't-overtake-
   the-peak tie case and a payer whose delay never resolves within the tested horizon.
5. **Reproducibility fix for the "independently derived" golden-scenario claim:** four
   `tests/scenarios/*.test.ts` files cited a now-nonexistent local path
   (`/Users/jay/.claude/jobs/d6da810d/tmp/*.py`) as their derivation source — a claim
   nobody could actually check. Recreated the derivation in-repo for two scenarios
   (`tests/scenarios/derivations/scenario-a-derivation.py`,
   `scenario-c-derivation.py` — standalone, no import from `/formulas`, independently
   verified to reproduce every expected value in the corresponding test file exactly)
   and honestly downgraded the claim for the other two (their arithmetic is shown
   inline in each test's own comments, which was already true — the dangling external
   reference was just removed rather than reproduced from scratch under this session's
   time budget). See `tests/scenarios/derivations/README.md`.
6. **`irr.ts`'s error message fixed for the multiple-IRR case (ISS-31), math
   unchanged.** A classic multiple-sign-change cash flow (textbook: initial 4,000,
   +25,000, then -25,000, real roots at 25% and 400%) has NPV the same sign at both
   ends of the [-99%, 1000%] bracket, so `irr()` throws — defensible (picking a root
   among several is a methodology call, not implemented) but the old message implied
   no root existed at all. Message now says a single IRR isn't well-defined and cash
   flows may have zero *or multiple* roots. `computeAssessment.ts` already converts
   any thrown IRR to `null` either way — no downstream behavior changed. Pinned by a
   new test in `tests/formulas/irr.test.ts`.
7. **Export label fix for a real dashboard/export mismatch when a utilization ramp is
   set:** `computeAssessment.ts`'s headline `roiBilled`/`roiRealized`/monthly-revenue
   fields are flat (mature-utilization) figures, while NPV/IRR/payback already reflect
   the ramp-up period (ISS-29, resolved 2026-07-14) — so a ramped assessment's Word
   proposal and Excel Monthly tab could look like they disagreed with each other. Added
   an "at mature utilization" note to Word §4/§5 (only when a ramp is set) and a
   Formula Notes row on the Excel Monthly tab explaining the relationship — labels
   only, no calculation changed. Pinned by new tests in
   `tests/exports/word-generator.test.ts` and `tests/exports/workbookPlan.test.ts`.
8. **`aria-required` added to every wizard field control** (`NumberField`,
   `SelectField`, `TextField`, `SliderField`, `CurrencyUnitField`, via
   `FieldShell`'s `renderControl`). Required fields previously showed a visual
   asterisk marked `aria-hidden="true"` — correct for sighted users, but a screen
   reader got no indication a field was required at all. Pinned by a new test in
   `tests/wizard/components.test.tsx` (and a matching negative case confirming a
   genuinely-optional field like Acquisition Mode stays `aria-required="false"`).
9. **Two real, undocumented gaps found and left alone deliberately, not fixed:**
   - **ISS-30:** `basic.launchDelayMonths` ("expected months before revenue starts")
     is a real, required, validated wizard field with no effect whatsoever on
     `computeAssessment()`'s output — `app/forms/toAssessmentInputs.ts` never reads
     it. `formulas/launchDelay.ts`'s `preOperativeInterest()` is fully implemented and
     tested but never called from the canonical pipeline. Wiring it in requires a
     methodology decision (how the delay composes with EMI timing, revenue-start
     shift, and pre-operative-interest capitalization — SPEC.md §16.3) that this
     project's `CLAUDE.md` reserves for Jay; confirmed the document-only call with an
     Opus advisor pass before proceeding. Fixed the tooltip copy so the field stops
     implying it does something it doesn't (`content/tooltip-copy.md`, regenerated
     into `content/tooltip-copy.generated.json` — that regeneration also picked up
     unrelated copy improvements already in the `.md` source that a prior session
     forgot to regenerate for, e.g. the realization %/claim-deduction wording and a
     missing "Lease tenure" entry). Pinned by a new test in
     `tests/wizard/toAssessmentInputs.test.ts`.
   - **ISS-33:** `formatInr` builds an explicit U+2212 minus sign for negatives;
     `formatNumber`/`formatPercent` rely on `Intl.NumberFormat`'s plain ASCII hyphen
     default. Cosmetic inconsistency, not a correctness bug — documented, not fixed,
     found while writing the first dedicated unit tests for
     `app/components/formatting.ts` (previously only `formatInrCompact` had one).
10. **Verification:** full test suite, `npx tsc --noEmit`, `npm run lint`, and
    `npm run build` (static export) all run clean. One real export path
    (`generateExcelWorkbook`/`generateWordProposal`/`generateExportZip`) exercised
    end-to-end outside the test suite too — real `.xlsx`/`.docx`/`.zip` bytes
    generated from realistic financed+ramped+multi-payer inputs, unzipped, and
    structurally inspected. Confirmed no `localStorage` reference anywhere in
    `exports/` or `formulas/`.
**Not touched, on purpose:** any scoring weight, threshold, benchmark figure, or
methodology composition rule; the disclaimer; the scoped code license; third-party
notices.

### 2026-07-14 — Phase 9 built: scenario comparison, sensitivity strip, actionable insight
**What changed:** Jay asked to build Phase 9 and to carry forward the chart-images
fast-follow note rather than build it this session.
1. **`formulas/assessmentOverrides.ts` (new):** `applyAssessmentOverrides()` overrides
   purchaseCost/usagePerDay/billedTariffPerUse/realizationPercentage on a canonical
   `AssessmentInputs` (uniform across the payer mix for tariff/realization — neither
   new UI exposes per-payer editing), plus `weightedAverageBilledTariff()`/
   `weightedAverageRealization()` for baseline slider/table positions. Never a second
   calculation path — every override still runs back through `computeAssessment()`.
2. **`app/components/ScenarioComparisonTable.tsx` (new, SPEC.md §28):** only SPEC
   §28.1's user-named scenario option is implemented, not an auto Conservative/Base/
   Optimistic preset — no researched or Jay-approved numeric definition of those terms
   exists, and inventing one would be exactly the unsourced product constant
   CLAUDE.md's escalation rule reserves for Jay. Compares Capex/billed-tariff/usage
   overrides, full SPEC §28.2 column set, ephemeral `useState`.
3. **`app/components/SensitivityStrip.tsx` (new):** the continuous, slider-driven view
   SPEC §11.2/§27 name but never spec in UI detail. An Opus advisor pass caught that
   `docs/agent-build-plan.md`'s Phase 9 text pointed at `runScenario` for this, which lacks
   utilization ramp/maintenance-schedule/payer-mix granularity and would show numbers
   diverging from the dashboard headline at rest — resolved toward the full canonical
   `computeAssessment()` instead, honoring the same section's live-recalculation-
   contract instruction. Local-state overrides only, never dispatched through the
   wizard reducer.
4. **`app/components/ActionableInsightCard.tsx` (new) + `formulas/sensitivity.ts`'s
   `deriveScenarioAssumptions()` (new):** docs/financial-model-spec.md §4's passive
   price-increase suggestion. **Found `formulas/actionableInsight.ts` already fully
   implemented** from a Phase 2/3-era session (commit `128a929`, predating this phase
   by weeks) — its existing tests confirmed it matches §4's grid/gate/cheapest-win/
   null-case/rounding rules exactly, so it was reused as-is rather than rewritten.
   `deriveScenarioAssumptions()` bridges the canonical `AssessmentInputs`/
   `AssessmentResult` pair into the `ScenarioAssumptions` shape both this card and the
   sensitivity strip's tariff context need, without inventing a baseline.
5. **Live-verified in a real browser** (fresh worktree, fresh MRI scenario, no Dark
   Reader interference): sensitivity strip's resting NPV/IRR/payback matched the
   dashboard headline exactly; dragging usage to 49/day live-recalculated correctly and
   Reset restored the baseline; scenario table add/edit/rename-via-datalist/remove all
   worked, every SPEC §28.2 column recomputed correctly on a tariff change; mobile
   viewport (390×844) checked, no overflow. No qualifying actionable insight for this
   particular (already-fast) scenario — correct `null` behavior.
6. **Verification:** 265 tests (up from 250 after a fresh `npm install`), clean
   `tsc --noEmit`, clean static-export `npm run build`.
7. **Chart images (Excel "Charts" tab, Word §8) intentionally not built this
   session** — Jay's own instruction was to carry the fast-follow note forward, not
   build now. LibreOffice is available (installed the same day, used for Phase 8's IRR
   spot-check above) so the original blocker is gone; building/verifying the images
   themselves remains open for a future session.

### 2026-07-14 — Phase 8 follow-up: ISS-29 resolved, LibreOffice IRR spot-check
**What changed:** Jay asked to resolve the two items Phase 8 left open (see the entry
below): the flat-billed/ramped-realized asymmetry (ISS-29) and the un-verified-against-
real-Excel IRR cell.
1. **LibreOffice installed and actually used.** The prior session had no headless
   Excel/LibreOffice available; this session installed LibreOffice via Homebrew. A
   first `soffice --headless` attempt hung indefinitely (macOS `AppleSystemPolicy`
   blocking the process — not a slow first-launch); after Jay approved a permission
   prompt, a retry succeeded. Generated a real `.xlsx` for the financed+ramped+multi-
   payer-DSO golden scenario and forced a real recalculation (`OOXMLRecalcMode` set to
   always-recalculate in a scratch profile, since exceljs writes formulas with no
   cached values and LibreOffice doesn't recalc xlsx on load by default). LibreOffice's
   own IRR cell (`19.0812674185733%`) matched `computeAssessment()`'s own IRR
   (`19.081267418573276%`) to ~13 significant digits — independent confirmation beyond
   the existing HyperFormula oracle test.
2. **ISS-29 resolved** — advisor pass weighed three options (ramp billed to match
   realized; ramp everywhere including headline ROI; leave flat and document). Jay
   chose ramping billed revenue to match realized, reusing the existing ramp curve.
   Fixed in `formulas/monthlySeries.ts` and `exports/workbookPlan.ts`'s Monthly-sheet
   billed-revenue formula only; `computeAssessment.ts`'s flat headline
   `roiBilled`/`roiRealized`/`annualOperatingSurplus` fields are untouched by design —
   confirmed before the fix that `Annual Summary`'s billed column already just `SUM()`s
   the Monthly sheet (no separate headline recomputation to reconcile). Updated
   `tests/formulas/monthlySeries.test.ts`, `report-templates/excel-sheet-structure.md`.
   See `ISSUES.md` ISS-29 (moved to Resolved).
3. **Verification:** full suite 249/249 passing, clean `tsc --noEmit`.

See `handoff-archive/2026-Q3.md` for entries before 2026-07-14's Phase 9 entry above.
