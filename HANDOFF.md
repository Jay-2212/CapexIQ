# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-13, first manual browser QA session)*

**Phase 6 (wizard UI implementation) is built, browser-QA'd for the first time, and
every issue found — in planning or in this session's live QA — is resolved.** `/app`
has a real, working landing page, pre-step + 3-step Basic Mode wizard + Advanced Mode
panel + a minimal `/results` page + a Methodology page, all wired to a single
canonical calculation pipeline. Planning was already doubly audited before the
implementation session started (`$capexiq-ui-assurance` + `$capexiq-prebuild-
assurance`, both merged 2026-07-12).

- **First interactive browser QA of Phase 6, this session** — `claude-in-chrome` was
  disconnected for both prior Phase 6 sessions (see `ISSUES.md` ISS-21); this session
  it worked, and Jay asked for a full manual visual/interaction pass plus an Opus
  advisor sanity-check on every finding before fixing anything. Found and fixed 3 real
  bugs, and built the previously-missing landing page — see `ISSUES.md` ISS-26 for the
  full detail, not duplicated here:
  1. `app/globals.css` had zero CSS for most component class families actually used
     (pre-step, results, Advanced panel, banners, step-nav, start-over) — the pre-step
     rendered raw multi-thousand-pixel equipment images, `/results` was an unstyled
     text dump. Fixed with token-based CSS matching the existing "Signal" theme.
  2. A hard reload/deep-link to any wizard step always bounced the user back to the
     pre-step (a `RouteGuard`-vs-`useWizardPersistence` mount-order race). Fixed with
     a `state.hasHydrated` gate.
  3. `SliderField` displayed a fake value (`def.min`) for genuinely-unset required
     fields, masking a real missing answer as an already-filled one. Fixed by tracking
     the display value as `number | null` end to end.
  4. **Built the landing page** (`app/page.tsx`, `design/ux-product-spec.md` §5) and a
     minimal Methodology page (`app/methodology/page.tsx`) — this had fallen through
     the cracks between phases (no phase's "Do" list explicitly included it, see
     `agent-build-plan.md`'s Phase 6 entry, now corrected). Root `/` had shown the
     original pre-Phase-6 scaffold placeholder text until this fix.
  Two items flagged to `ISSUES.md` Open rather than silently decided or silently
  fixed: ISS-24 (Methodology page is functional but visually plain, not a designed
  page — deliberately out of scope this session) and ISS-25 (required-field errors
  showing immediately on an untouched page load — confirmed spec-intended per
  `wizard-state.md` §2, but flagged for Jay to reconsider, not changed).

- **Canonical pipeline (`formulas/computeAssessment.ts`):** the single
  wizard-inputs-to-full-result derivation `wizard-state.md` §4 requires. Composition
  order (accrual-basis NPV/IRR, DSO-extended array feeding a separate working-capital
  metric, Basic Mode's flat blended maintenance rate vs. Advanced Mode's
  `cmcYears`-plus-sourced-rate schedule, financing-mode cash-flow treatment) is copied
  exactly from `tests/scenarios/`'s independently-hand-derived golden scenarios (A-D).
  This follow-up session added two previously-missing pieces the pipeline now
  consumes: a month-by-month utilization ramp-up (ISS-19) and a bounded Lease tenure
  with buyout, mirroring Loan (ISS-18, Jay's decision after an Opus advisor pass).
- **Full wizard**, `app/(assessment)/` (a Next.js route group sharing one
  `WizardProvider` across `/assess/*` and `/results`): pre-step (equipment tiles + bed
  size/city tier), Investment/Usage & Revenue/Operating Costs steps, the Advanced Mode
  panel (all 6 groups A-F, now including Group C's new `leaseTenureMonths`), a live
  preview strip, `localStorage` draft persistence (debounce, multi-tab conflict
  banner, write-failure handling), the route guard, focus management, and "Start
  over." `app/forms/` holds the reducer/schema/validation/persistence logic;
  `app/advanced/` and `app/components/` hold the UI.
- **Verification:** 175 tests pass (173 going into this session + 2 new regression
  tests for this session's RouteGuard and SliderField fixes), `npm run build` and
  `npx tsc --noEmit` both clean. **Interactive browser QA has now actually happened**
  — this session's `claude-in-chrome` connection worked, closing the gap `ISSUES.md`
  ISS-21 tracked across the two prior sessions where it didn't.
- **All six items this session's own predecessor logged to `ISSUES.md` are now
  Resolved (ISS-17 through ISS-21, ISS-23)** — using the triage Jay asked for
  ("/advisor" mode): fix directly where the issue turned out to be mechanical (ISS-19,
  ISS-20, and most of ISS-21/ISS-23 once actually investigated), run genuine judgment
  calls past an Opus advisor first (ISS-17, ISS-18, ISS-23), and only bring to Jay the
  one call the advisor itself flagged as a real product decision (ISS-18's lease
  archetype — Jay chose lease-to-own with a bounded tenure). See `ISSUES.md`'s Resolved
  section for each entry's full reasoning.
- **Landing page and Methodology page now built** (this session — see the bullet list
  above) — `/` and `/methodology` are real routes, sitting outside the `(assessment)`
  route group's shared `WizardProvider` (they don't need wizard state).
- **New dev dependencies (implementation session):** `jsdom`,
  `@testing-library/react`/`jest-dom`, `@vitejs/plugin-react` (test-only),
  `lucide-react` (equipment-tile icon). `vitest.config.ts` (path aliases + jsdom
  environment) and `tests/setup.ts` (a `localStorage`/`scrollIntoView` polyfill, plus
  an `afterEach(cleanup)` added this follow-up session once a multi-render test file
  exposed that it was missing).

**Next: Phase 7 (results dashboard and charts)** — the gauge, metric cards, break-even/
cash-flow charts, risk callouts, narrative summary, and the Advanced settings pane,
against `design/dashboard-mockup.svg`. `/results` already shows real numbers from the
same pipeline Phase 7 will build the visual layer on top of.

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

### 2026-07-13 — First manual browser QA of Phase 6: 3 bugs fixed, landing page + Methodology page built (ISS-26, ISS-24, ISS-25)
**What changed:** Jay asked to run the dev server and manually/visually inspect the
site in Chrome — the first time this was actually possible for Phase 6 (both prior
sessions had no working `claude-in-chrome` connection, `ISSUES.md` ISS-21). Walked the
full wizard flow (pre-step through results, plus the Advanced panel), found issues by
reading the rendered DOM/computed styles and the source behind them, then ran every
finding past an Opus advisor for an independent sanity check before fixing anything —
per Jay's explicit instruction to default to the advisor's judgment on calls like
these rather than asking each one individually.
1. **`app/globals.css` had zero CSS for most component class families actually used**
   (`assess-page`, `assessment-header*`, `equipment-tile*`, `advanced-panel*`,
   `advanced-group*`, `banner*`, `maintenance-schedule*`, `payer-row*`, `results-*`,
   `step-nav`, `start-over`) — only `field-shell`, `preview-strip`,
   `progress-stepper`, `slider-field`, `wizard-field-tooltip`, and `button` had rules.
   Wrote the missing CSS, token-based, matching the existing "Signal" theme (no new
   visual language, no gradients/glassmorphism per `ux-product-spec.md` §1.3). Folded
   in a set of `@media (max-width: 640px)` rules at the same time (the "attempt
   responsive/mobile if time permits" ask) since most of the new layout uses
   `repeat(auto-fit, minmax(...))` grids that are inherently responsive without needing
   explicit breakpoints for everything.
   - **Found mid-fix, not part of the original QA findings:** `.equipment-tile__icon`
     and the new `.landing-how__icon` pattern applied `aspect-ratio` + `padding`
     directly to a raw Lucide `<svg>` icon, which rendered the icon completely
     invisible (a replaced-element sizing interaction, not a color/visibility bug —
     confirmed via computed styles that the icon's real geometry, color, and opacity
     were all correct; the icon's own content viewport was just being squeezed to
     zero). Fixed by wrapping icons in a flex-centered container `<div>` and sizing
     the icon itself via its own `size` prop instead of CSS on the SVG root.
2. **A hard reload/deep-link to any wizard step always bounced the user back to the
   pre-step**, resetting `currentStep` (underlying field values survived in
   `localStorage`, only the step position was lost). Root cause, confirmed by the
   advisor independently reading the same two files: `app/forms/RouteGuard.tsx`'s
   pathname-effect is a child of the component that mounts `useWizardPersistence`, so
   it runs on first commit against `emptyWizardState()` — before that sibling/parent
   effect's `RESTORE_DRAFT` dispatch lands. The advisor rejected the alternative fix
   (reading `localStorage` synchronously during `useReducer`'s lazy init) as an SSR
   hydration-mismatch risk for this static export. Fixed instead with a
   `state.hasHydrated` reducer field: a new `MARK_HYDRATED` action fires from the
   persistence hook's load effect on every mount (whether or not a draft existed), and
   `RouteGuard` now skips its redirect logic until that flag is true. `START_OVER`
   preserves `hasHydrated: true` (it's a client-side reset, not a reload — there's no
   draft left to wait on). Regression test in
   `tests/wizard/routeGuardAndPersistence.test.tsx` reproduces the exact previously-broken
   scenario (a complete saved draft, deep-linked to `/assess/investment`) and asserts
   no redirect.
3. **`SliderField` displayed a fake value for genuinely-unset required fields** — e.g.
   MRI's `basic.billedTariffPerUse` has no sourced default (confirmed via
   `content/inputs-metadata.json` and the live state), so the real value is `null`,
   but the slider and its paired number input both showed `def.min` (500) as though
   answered, while the field was still flagged invalid underneath — a visible
   contradiction between "looks filled" and "is required, unfilled." Fixed by making
   `localValue: number | null` throughout: the number input shows empty when null, the
   range thumb still gets a visual position from `def.min` for display only (never
   written to state), and clearing the number input now sets the field back to `null`
   instead of snapping to `def.min`. Regression test in `tests/wizard/components.test.tsx`.
4. **Built the landing page** (`app/page.tsx`, `design/ux-product-spec.md` §5: header,
   hero, "how it works," "who it's for," "what's in the tool," footer) and a minimal
   Methodology page (`app/methodology/page.tsx`, §5.3) so the footer/header link isn't
   dead. This had fallen through the cracks between phases — the entry flow was
   finalized back in Phase 5, but no phase's "Do" checklist in `agent-build-plan.md`
   ever explicitly included building it (now corrected, see that file's Phase 6
   entry). Root `/` had shown the original pre-Phase-6 scaffold placeholder text
   ("This is a scaffold...") until this fix. The Methodology page renders
   `report-templates/methodology.md` and `formula-appendix.md` through a small
   dependency-free markdown-to-JSX renderer (`app/methodology/
   renderSimpleMarkdown.tsx`) rather than a bespoke design — Jay's ask this session was
   specifically the landing page, not this one; logged as ISS-24 for a real design
   pass later. Copied `people-personas/*.jpg` and `design/hero-background.svg` into
   `public/` (same static-export requirement as `equipment-images/` before it — see
   `public/README.md`, updated).
5. **Two items flagged rather than silently decided:** ISS-24 (Methodology page's own
   design polish, deferred) and ISS-25 (required-field errors showing on a completely
   untouched page load — confirmed spec-intended per `wizard-state.md` §2's "validate
   on every change... no debounce" rule, not a bug, but flagged for Jay to reconsider
   since it's a real deviation from the more common "don't red-flag before the user
   touches the field" convention).
**Verification:** 175 tests pass (173 + 2 new regression tests; one existing
`RouteGuard` test updated to mount `useWizardPersistence` alongside it, matching real
app composition, since the fix changed what that test needed to simulate), `npx tsc
--noEmit` clean, `npm run build` (static export) clean including the new `/` and
`/methodology` routes. Every fix and the landing page build were manually re-verified
live in Chrome after implementation, not just via automated tests.
**Files touched:** `app/globals.css`, `app/forms/wizardTypes.ts`,
`app/forms/initialState.ts`, `app/forms/wizardReducer.ts`,
`app/forms/useWizardPersistence.ts`, `app/forms/RouteGuard.tsx`,
`app/components/SliderField.tsx`, `app/(assessment)/assess/page.tsx`, `app/page.tsx`
(rewritten), `app/methodology/page.tsx` (new),
`app/methodology/renderSimpleMarkdown.tsx` (new), `public/people-personas/*`,
`public/design/hero-background.svg`, `public/README.md`,
`tests/wizard/routeGuardAndPersistence.test.tsx`, `tests/wizard/components.test.tsx`,
`agent-build-plan.md` (Phase 6 entry), `ISSUES.md` (ISS-24, ISS-25, ISS-26).

### 2026-07-13 — Phase 6 follow-up: all 6 issues opened by the implementation session resolved (ISS-17 to ISS-21, ISS-23)
**What changed:** Jay asked to work through everything ISS-17-ISS-23 flagged, using a
three-layer triage: fix directly where possible, consult an Opus advisor for genuine
judgment calls, only bring to Jay what the advisor itself said needed his input.
1. **ISS-20 (small, fixed directly):** `SliderField.tsx` now distinguishes a keyboard
   arrow/Home/End/Page key press from a pointer drag (a `keydown`-set ref checked by
   the `input` handler) and dispatches immediately for the former, keeping the ~120ms
   debounce only for drags.
2. **ISS-19 (small once investigated, fixed directly):** turned out to be fully
   specified by its own schema notes, not an open modeling question — implemented a
   month-by-month utilization ramp in `computeAssessment.ts` (feeding both per-year
   cash flows and the existing monthly working-capital calc from one series) and a
   per-year `maintenanceCostByYearPct` override on the warranty/CMC/AMC schedule.
   `toAssessmentInputs.ts` only applies the ramp once all 4 periods are filled in, and
   lets Advanced Mode's `expectedMatureUtilization` supersede `basic.usagePerDay` as
   the ramp baseline once opened. Fully backward-compatible — every pre-existing
   golden-scenario test passed unchanged. New: `tests/formulas/
   computeAssessment.rampAndMaintenanceOverride.test.ts` + wizard-wiring tests.
3. **ISS-17, ISS-18, ISS-23 (genuine judgment calls, sent to an Opus advisor):** the
   advisor confirmed ISS-17's realization×claim-deduction multiplication is the
   correct revenue-cycle waterfall (only the tooltip copy needed correcting, to stop
   defining realization % against billed tariff instead of the post-deduction amount)
   and confirmed ISS-23's paired-numeric-input pattern already satisfies WCAG 2.5.8's
   Equivalent-control exception (rejected building a custom slider — not worth the
   regression risk for no conformance gain). Both fixed directly on the advisor's
   say-so. ISS-18 (Lease's unbounded rental) the advisor flagged as a real bug that
   needed Jay's sign-off on which lease archetype to model — asked via
   `AskUserQuestion` with the advisor's recommendation marked; Jay confirmed
   lease-to-own with a bounded `leaseTenureMonths` (mirrors Loan's `tenureMonths`),
   implemented in `computeAssessment.ts` (both financing branches now share one
   tenure-capping code path), `toAssessmentInputs.ts`, `content/inputs-metadata.json`,
   `SPEC.md`, `content/tooltip-copy.md`, and `app/advanced/GroupC.tsx`.
4. **ISS-21 (re-attempted, narrowed but not closed):** `claude-in-chrome` is still
   disconnected in this environment (re-verified via the skill, not assumed stale) —
   real browser QA remains blocked. Added `tests/wizard/routeGuardAndPersistence.test.tsx`
   to close two of the specific gaps that entry named: the route guard's redirect and
   the cross-tab conflict banner actually firing, both via jsdom `StorageEvent`/router
   mocks. Found and fixed a latent test-infra bug while writing these — `tests/
   setup.ts` had no `afterEach(cleanup)`, so a multi-render test file leaked DOM
   between tests (silent until this session's second test in one file).
**Verification:** 173/173 tests pass (161 + 12 new), `npx tsc --noEmit` and `npm run
build` both clean. **Still recommend:** a manual `npm run dev` click-through once a
working browser connection is available — nothing visual/layout, and no real
multi-tab session, has been exercised yet.

### 2026-07-13 — Phase 6 (wizard UI implementation) built: reducer, canonical pipeline, full wizard, 161 tests
**What changed:** Jay confirmed Phases 1-5 were genuinely ready to build against (this
session's own verification: 109/109 tests, clean build, on `origin/main`) and said
"let's build." Built the whole of Phase 6 as one continuous flow (`CONVENTIONS.md`
§7 — no parallelizing a single stateful flow), in a worktree, committing progressively.
1. **`formulas/computeAssessment.ts` (new)** — the canonical wizard-inputs-to-result
   pipeline `wizard-state.md` §4 requires ("there is exactly one"). No formula for this
   composition existed before this session (`formulas/sensitivity.ts` is a separate,
   simpler annual-only grid-search tool for the actionable-insight engine, not this).
   Every composition decision (which cash-flow basis feeds NPV/IRR vs. the
   working-capital metric, how financing/maintenance/break-even compose) was derived
   by reading `tests/scenarios/`'s 4 golden scenarios line by line and matching them
   exactly, not invented — `tests/formulas/computeAssessment.test.ts` proves the new
   pipeline reproduces every golden number. New `formulas/workingCapitalPeak.ts` for
   the peak-working-capital-need metric SPEC.md §14.2's dashboard warning needs.
2. **The wizard itself** — `app/forms/` (reducer, field schema expanded from
   `content/inputs-metadata.json`'s templates using `wizard-state.md` §7.1's final
   payer/ramp suffixes, validation, `localStorage` persistence per §7's full
   contract including the multi-tab conflict banner and write-failure handling),
   `app/advanced/` (all 6 Advanced Mode groups), `app/components/` (field controls,
   preview strip, step nav with the audit-F7 disabled-Next-focus behavior), and
   `app/(assessment)/` (a Next.js route group so `/assess/*` and `/results` share one
   `WizardProvider` despite not being nested in the URL) — pre-step, 3 Basic Mode
   steps, and a minimal but real `/results` page (full dashboard is Phase 7).
3. **One real bug found and fixed mid-build, not by either prior audit:**
   `payerMixSharePct`'s `required: true` had no sourced default and sat inside the
   collapsed Advanced panel — same failure class as the already-resolved
   `targetIrr`/F1 issue, would have blocked every Basic-Mode-only user at Step 3.
   Fixed the same way (auto-filled implicit default). Logged as Resolved ISS-22.
4. **Six items flagged to `ISSUES.md`'s Open section (ISS-17 through ISS-21, ISS-23)**
   rather than silently decided: the realization%/claim-deduction% combination rule (no
   golden test covers it), Lease financing's unbounded term (no `leaseTenureMonths`
   field exists), utilization ramp-up and the per-year maintenance override being
   collected but not yet consumed by the pipeline, incomplete edge-case test coverage
   against the letter of Phase 6's DoD, and the slider touch-target audit ask not being
   achievable with a native `<input type="range">`.
5. **Verification:** 161 tests (109 pre-existing + 52 new, including 2 React Testing
   Library component tests added specifically to cover interactive behavior this
   session's environment couldn't test in an actual browser — no working Chrome
   extension connection this session, see ISS-21), `npm run build` and `npx tsc
   --noEmit` both clean. Also fixed along the way: `vitest.config.ts` needed a jsdom
   `url` option plus a `localStorage`/`scrollIntoView` polyfill (`tests/setup.ts`) —
   this environment's jsdom left `window.localStorage` undefined for reasons unrelated
   to product code (verified against a raw `new JSDOM()` outside vitest, which works
   fine); a real browser always has working `localStorage`.
6. **Housekeeping:** `equipment-images/` copied into `public/equipment-images/` (static
   export requires `public/` for served assets; the repo-root folder stays canonical
   for sourcing/licensing). `content/tooltip-copy.md` gained a generated
   machine-readable sibling (`tooltip-copy.generated.json`, via new
   `scripts/generateTooltipCopy.mjs`) since no runtime markdown-parsing story existed
   yet. Old flat `app/results/README.md` moved into the new route group location.
**Files touched:** extensive — `formulas/computeAssessment.ts` and
`formulas/workingCapitalPeak.ts` (new); all of `app/forms/`, `app/advanced/`,
`app/components/`, `app/(assessment)/` (new); `public/` (new); `scripts/` (new);
`content/tooltip-copy.generated.json` (new); `tests/formulas/computeAssessment*.test.ts`
and all of `tests/wizard/` (new); `vitest.config.ts`, `tests/setup.ts` (new);
`package.json`/`package-lock.json` (new dev deps); `ISSUES.md` (ISS-17 through ISS-23),
`agent-build-plan.md` (Phase 6 checkboxes, 2 marked partial with reasons, 1 unmet with
a reason), `DIRECTORY.md` (full Phase 6 section rewrite), `HANDOFF.md` (this entry).
**What's next:** Phase 7 (results dashboard and charts) — build the visual layer
(gauge, metric cards, break-even/cash-flow charts, risk callouts, narrative summary,
Advanced settings pane) on top of the same `computeAssessment.ts` pipeline `/results`
already uses. A manual browser click-through of Phase 6 (ISS-21) is recommended before
or alongside that work. ISS-19's ramp-up/per-year-maintenance pipeline gaps are natural
Phase 9 (sensitivity) companions.

See `handoff-archive/2026-Q3.md` for entries before 2026-07-13's Phase 6 (wizard UI
implementation) entry above.
