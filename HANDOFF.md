# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-14, Phase 9 (scenario comparison / sensitivity / actionable
insight) built + verified; Phase 8 exports built + verified, ISS-29 resolved, IRR
spot-checked against real LibreOffice; Phase 7's chart-tooltip gap closed)*

**The warm-beige "calm clinical intelligence" redesign and Phase 7's results dashboard
depth are both implemented and verified live.** The canonical calculation pipeline and
Crore-based financial contracts are unchanged throughout.

- `/` has a decision-led hero, a compact model-coverage strip, a three-step story, a
  legible Basic/Advanced comparison, concise role cards, and a final CTA. Landing-only
  rules live in `app/landing.css`. Purpose-made CT and COO assets are in
  `public/design/hero-ct-suite-v2.png` and
  `public/people-personas/05-operations-head-coo-v2.png`.
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
2. **`capexiq.jaybharti.me` (the live Cloudflare Pages deployment) is badly stale** —
   it still serves the pre-Phase-6 scaffold placeholder ("This is a scaffold...instead
   of the built product. Likely means Cloudflare Pages isn't auto-deploying from
   `origin/main` pushes, or the last deploy predates Phase 6 entirely. Worth Jay's
   attention independent of this session's work.

**2026-07-14 session — Phase 8 (Excel/Word/ZIP exports) built, plus Phase 7's last
open item:**
- **Chart-level hover tooltips** (the one item Phase 7 was missing) are built:
  `app/charts/CashFlowChart.tsx`/`BreakEvenBar.tsx` bars are focusable/hoverable marks
  showing exact value + series label + period, on both mouse hover and keyboard focus,
  live-verified in a real browser. See `agent-build-plan.md` Phase 7's Do-list.
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
  the useful-life horizon). See `agent-build-plan.md` Phase 8's DoD status for the
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
  `runScenario` `agent-build-plan.md`'s Phase 9 text originally pointed at — an Opus
  advisor pass caught that `runScenario` has no utilization ramp/maintenance
  schedule/payer-mix granularity, so at rest it would show different numbers than the
  dashboard headline directly above it. Local-state only, never dispatched through
  the wizard reducer (unlike `ResultsQuickSettings`), so it can never mutate the
  user's real inputs.
- **`app/components/ActionableInsightCard.tsx`** (financial-model-spec.md §4,
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
see this doc's entry above and `agent-build-plan.md`'s Phase 9 section. Two fast-follows
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
   `agent-build-plan.md`'s Phase 9 text pointed at `runScenario` for this, which lacks
   utilization ramp/maintenance-schedule/payer-mix granularity and would show numbers
   diverging from the dashboard headline at rest — resolved toward the full canonical
   `computeAssessment()` instead, honoring the same section's live-recalculation-
   contract instruction. Local-state overrides only, never dispatched through the
   wizard reducer.
4. **`app/components/ActionableInsightCard.tsx` (new) + `formulas/sensitivity.ts`'s
   `deriveScenarioAssumptions()` (new):** financial-model-spec.md §4's passive
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

### 2026-07-14 — Phase 8 exports built (Excel/Word/ZIP), Phase 7's chart-tooltip gap closed
**What changed:** Jay asked for Phase 8 (Excel/Word/ZIP exports) to be fully built,
following the newly-updated design language, plus the one leftover Phase 7 item
(chart-level hover tooltips). Full detail in the Current State block above; summary:
1. **Chart hover tooltips** — `CashFlowChart`/`BreakEvenBar` bars now show exact
   value + series + period on hover and keyboard focus (`.chart-tooltip`, new CSS),
   per the `$dataviz` skill's interaction rules. 7 new tests.
2. **`formulas/monthlySeries.ts` (new)** — extracted the ramp-fraction/monthly-array
   logic already inside `computeAssessment.ts` (byte-identical refactor, all 203
   pre-existing tests unchanged) and extended it with `monthlyCashReceived`/
   `monthlyEmiOrLease` for the Excel export's Monthly tab. Billed revenue stays flat/
   unramped, faithfully matching the existing engine rather than inventing a ramped
   version that would disagree with the dashboard — flagged as `ISSUES.md` ISS-29.
3. **`exports/workbookPlan.ts` + `excel-generator.ts`** — a pure cell/formula plan
   (direct cell addresses, not Excel defined names — see the doc's rationale) written
   into a real `.xlsx` via `exceljs`. Verified via a **HyperFormula test oracle**
   (`tests/exports/workbookPlan.test.ts`, 23 tests across 4 golden scenarios — cash;
   financed+ramped+DSO; a per-year maintenance override; lease financing) that
   evaluates every formula cell and checks it against `computeAssessment()`/
   `buildMonthlySeries()`'s own numbers — not merely that a formula string exists,
   per an advisor review that flagged the weaker check before it was built. Caught 3
   real bugs pre-ship: an unquoted space-containing sheet name; a missing upper-bound
   guard on a DSO cash-received `INDEX()` lookup; and a second advisor pass catching
   that the Excel maintenance formulas ignored `costByYearPct` (ISS-19) — a real,
   UI-reachable Advanced-mode override that would have made the Excel's headline
   NPV/IRR silently disagree with the dashboard for any user who sets one. Fixed by
   adding a per-year override table to the Assumptions sheet, checked first in both
   the Monthly and Maintenance Schedule formulas.
4. **`exports/word-generator.ts`** — 12-section Word proposal via `docx`, reusing
   `app/components/riskNotes.ts` (extracted from `RiskCallout.tsx` this session) for
   risk notes rather than a second derivation. Verified by unzipping the generated
   `.docx` and checking `word/document.xml` for the exact numbers `computeAssessment()`
   produced (6 tests).
5. **`exports/zip-generator.ts` + `app/components/ExportPanel.tsx`** — bundles both
   via `jszip`; three download buttons on `/results`, lazy-loading the heavy libraries
   on click (confirmed via build output: `/results` grew ~1KB, not ~1MB+). Live-
   verified in a real browser (MRI scenario, "Apex Test Hospital"): all three
   downloads produced correctly-sized, correctly-MIME-typed blobs, zero console errors.
6. **Chart images deferred, not built** — flagged explicitly in both
   `report-templates/excel-sheet-structure.md` and `word-report-template.md` (data
   tables stand in); no headless Excel/LibreOffice available here to verify a
   rasterized image round-trips, judged the wrong tradeoff against the harder
   live-formula verification work this phase actually required.
**Verification:** 248 tests (up from 203), clean `tsc --noEmit`, clean static-export
`npm run build`. Advisor consulted before implementation planning (chart-image scope,
defined-names vs. direct cell refs, oracle-coverage requirements) and again before
declaring done — that second pass is what caught the `costByYearPct` gap above.
**Files touched:** `formulas/monthlySeries.ts` (new), `formulas/computeAssessment.ts`
(byte-identical extraction of the ramp-fraction helper), `exports/{workbookPlan,
excel-generator,word-generator,zip-generator}.ts`, `app/components/{ExportPanel,
riskNotes}.tsx`, `app/components/RiskCallout.tsx` (now consumes `riskNotes.ts`),
`app/charts/{CashFlowChart,BreakEvenBar}.tsx`, `app/globals.css` (chart-tooltip +
export-panel CSS), `app/(assessment)/results/page.tsx`, `report-templates/
{excel-sheet-structure,word-report-template}.md`, `package.json` (added `exceljs`,
`docx`, `jszip`, dev-only `hyperformula`), `tests/exports/*.test.ts` (new),
`tests/formulas/monthlySeries.test.ts` (new), `tests/results/charts.test.tsx`
(tooltip tests added), `agent-build-plan.md`, `ISSUES.md`, `DIRECTORY.md`.


See `handoff-archive/2026-Q3.md` for entries before 2026-07-13's Phase 7 results
dashboard entry above.
