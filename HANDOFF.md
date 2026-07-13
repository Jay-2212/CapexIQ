# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-13, Phase 6 "part 2" follow-up session — ISS-24/ISS-25 resolved)*

**Phase 6 (wizard UI implementation) is built, browser-QA'd, and every issue anyone
has flagged against it — in planning, in the first live-QA session, or in this
follow-up session — is now resolved.** `/app` has a real, working landing page,
pre-step + 3-step Basic Mode wizard + Advanced Mode panel + a minimal `/results` page
+ a fully-designed Methodology page, all wired to a single canonical calculation
pipeline. Planning was already doubly audited before the implementation session
started (`$capexiq-ui-assurance` + `$capexiq-prebuild-assurance`, both merged
2026-07-12).

- **This session closed the two items the prior session's live-QA pass had
  deliberately left open** (ISS-24, ISS-25) rather than silently deciding or silently
  fixing them — both went through an Opus advisor pass before implementation, per
  Jay's standing instruction. See `ISSUES.md`'s Resolved section for full reasoning;
  summarized:
  1. **ISS-25 — red validation state no longer shows before any interaction.**
     Validation *truth* is unchanged (still live, zero debounce, still the only thing
     driving the step-gate/route guard) but *display* is now gated: a field's error
     only appears once it's been touched (edited) or the user has clicked "Next" on
     its (incomplete) step — the latter via a new, deliberately separate
     `attemptedSteps` map, kept apart from the existing `touched` map specifically so
     it can't clear a sibling field's "Typical" pill (the advisor caught this on the
     first draft, which would have written the reveal into `touched` directly). A
     blocked "Next" now reveals *every* blocked field on the step at once, a strict
     improvement over the original F7 behavior. `wizard-state.md` §2 rewritten to
     match — it previously said the opposite ("shows immediately... no you'll find
     out when you hit Next").
  2. **ISS-24 — Methodology page redesigned as a two-column documentation layout.**
     A sticky in-page table of contents (built from the same two source docs' own
     headings) next to the rendered content, reusing the landing page's header/
     footer. Along the way, found and fixed a real (not just cosmetic) renderer
     defect: `renderSimpleMarkdown`'s inline handler had no support for single-
     backtick code spans, which both source docs use 93 times combined — they were
     rendering as literal stray backticks around plain text, not just unstyled.
  Both verified live in the browser (dev server + `claude-in-chrome`), not just by
  the added test coverage: fresh `/assess` load shows no red anywhere, a blocked
  "Next" reveals every blocker while leaving a sibling field's "Typical" pill intact,
  and the Methodology page's ToC anchors/nesting/inline code all render correctly.

- **First interactive browser QA of Phase 6, prior session (2026-07-13)** —
  `claude-in-chrome` was disconnected for both earlier Phase 6 sessions (see
  `ISSUES.md` ISS-21); that session it worked, and Jay asked for a full manual visual/
  interaction pass plus an Opus advisor sanity-check on every finding before fixing
  anything. Found and fixed 3 real bugs, and built the previously-missing landing
  page — see `ISSUES.md` ISS-26 for the full detail, not duplicated here:
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

- **Canonical pipeline (`formulas/computeAssessment.ts`):** the single
  wizard-inputs-to-full-result derivation `wizard-state.md` §4 requires. Composition
  order (accrual-basis NPV/IRR, DSO-extended array feeding a separate working-capital
  metric, Basic Mode's flat blended maintenance rate vs. Advanced Mode's
  `cmcYears`-plus-sourced-rate schedule, financing-mode cash-flow treatment) is copied
  exactly from `tests/scenarios/`'s independently-hand-derived golden scenarios (A-D).
  The earlier of the two prior sessions added two previously-missing pieces the
  pipeline now consumes: a month-by-month utilization ramp-up (ISS-19) and a bounded
  Lease tenure with buyout, mirroring Loan (ISS-18, Jay's decision after an Opus
  advisor pass).
- **Full wizard**, `app/(assessment)/` (a Next.js route group sharing one
  `WizardProvider` across `/assess/*` and `/results`): pre-step (equipment tiles + bed
  size/city tier), Investment/Usage & Revenue/Operating Costs steps, the Advanced Mode
  panel (all 6 groups A-F, now including Group C's new `leaseTenureMonths`), a live
  preview strip, `localStorage` draft persistence (debounce, multi-tab conflict
  banner, write-failure handling), the route guard, focus management, and "Start
  over." `app/forms/` holds the reducer/schema/validation/persistence logic;
  `app/advanced/` and `app/components/` hold the UI.
- **Verification:** 183 tests pass (175 going into this session + 8 new/updated for
  ISS-25's touch/attempt gating — reducer, validation, and component-level), `npm run
  build` and `npx tsc --noEmit` both clean. **Interactive browser QA has now happened
  twice** — once in the prior session (closing `ISSUES.md` ISS-21's original gap) and
  again this session for both ISS-24 and ISS-25's fixes specifically.
- **Every item ever logged to `ISSUES.md` is now Resolved** (ISS-17 through ISS-26) —
  using the triage Jay asked for ("/advisor" mode): fix directly where the issue
  turned out to be mechanical, run genuine judgment calls past an Opus advisor first
  (ISS-17, ISS-18, ISS-23, ISS-24, ISS-25), and only bring to Jay the one call the
  advisor itself flagged as a real product decision (ISS-18's lease archetype — Jay
  chose lease-to-own with a bounded tenure). `ISSUES.md`'s Open section is empty.
- **Landing page and Methodology page are both real, fully-designed routes** — `/`
  (built in the prior session) and `/methodology` (given its own design pass this
  session — see above), sitting outside the `(assessment)` route group's shared
  `WizardProvider` (they don't need wizard state).
- **New dev dependencies (implementation session):** `jsdom`,
  `@testing-library/react`/`jest-dom`, `@vitejs/plugin-react` (test-only),
  `lucide-react` (equipment-tile icon). `vitest.config.ts` (path aliases + jsdom
  environment) and `tests/setup.ts` (a `localStorage`/`scrollIntoView` polyfill, plus
  an `afterEach(cleanup)` added in a prior follow-up session once a multi-render test
  file exposed that it was missing).

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

### 2026-07-13 — Phase 6 "part 2": ISS-25's eager-validation reveal fixed, ISS-24's Methodology page redesigned
**What changed:** Jay asked to close the two items the prior session's live-QA pass
had deliberately left open rather than silently deciding: ISS-25 (red validation
state showing before any user interaction) and ISS-24 (Methodology page functional
but visually plain). Both went through an Opus advisor pass before implementation.
1. **ISS-25.** Validation *truth* (is a value actually invalid right now) is
   unchanged — still computed live, zero debounce, still the sole thing driving the
   step-gate/route guard. What changed is *display*: a field's error now only shows
   once the field is touched (edited — the pre-existing `touched` map, also used for
   the "Typical" pill) or the containing step has been attempted (a new, deliberately
   separate `attemptedSteps` map). The advisor caught a real flaw in the first draft
   before it was written: reusing `touched` for the Next-click reveal, or writing to
   it on blur, would have cleared the "Typical" pill on every still-default,
   still-valid field on the same step. A blocked "Next" now reveals every blocked
   field on its step at once (`StepNav.tsx` dispatches a new `ATTEMPT_STEP` action),
   a strict improvement over the prior audit-F7 behavior of only focusing the first
   one. A field's step, for gating, is resolved via a new static path→step lookup
   (`wizardValidation.ts`'s `stepForFieldPath`) rather than `state.currentStep` —
   the latter is only synced by `RouteGuard`'s effect on route change and isn't
   reliable before that effect runs, which a standalone component test surfaced
   directly (the same race class ISS-26 already fixed once for hydration).
   `wizard-state.md` §2 rewritten — it previously documented the opposite behavior.
   **A second advisor pass, before this was called done, caught a real regression:**
   the pre-step (`app/(assessment)/assess/page.tsx`) predates `StepNav`'s extraction
   and used the native `disabled` attribute on its own inline Button instead of
   `StepNav`'s `aria-disabled`-plus-focus-jump pattern, so a blocked "Next:
   Investment" there fired nothing — combined with the new reveal-gating, the
   pre-step's own required fields (Hospital bed size, City/tier, the exact fields
   ISS-25 was originally reported against) would have shown no red *ever* until
   individually touched. Fixed by giving it the same `goNext` logic. 8 new/updated
   tests total. Verified live in the browser: no red on a fresh `/assess` load, both
   blockers appear together on a blocked "Next" on every step including the pre-step,
   and a sibling field's "Typical" pill survives that click.
2. **ISS-24.** Read both source docs in full before touching CSS, since the
   renderer's own "doesn't handle lists/tables/links" caveat needed verifying, not
   assuming — neither doc uses those, but both use single-backtick inline code spans
   heavily (93 lines combined) that the renderer didn't handle at all, rendering
   literal stray backticks — a real defect, not just missing style. Fixed
   `renderSimpleMarkdown.tsx`: inline code-span support, slugified heading `id`s (via
   a new `idPrefix`, namespaced per doc), and `extractHeadings`/`nestHeadings` for a
   table of contents. Rebuilt `app/methodology/page.tsx` as a two-column
   documentation layout — sticky ToC next to the content, reusing the landing page's
   header/footer — and fixed an incidental a11y issue (each source doc's own leading
   `# Title` line was rendering as a second/third page-level `<h1>`; the page now
   supplies one `<h1>` and demotes the appendix's title to `<h2>`). No new marketing
   copy; collapses to one column below 900px.
**Files touched:** `app/forms/wizardTypes.ts`, `wizardReducer.ts`, `initialState.ts`,
`useFieldController.ts`, `wizardValidation.ts`, `wizard-state.md`,
`app/components/StepNav.tsx`, `app/advanced/GroupA.tsx`, `app/methodology/
renderSimpleMarkdown.tsx`, `app/methodology/page.tsx`, `app/globals.css`, plus test
files in `tests/wizard/`. 183 tests pass (up from 175), `npm run build`/`npx tsc
--noEmit` both clean. `ISSUES.md` ISS-24/ISS-25 moved to Resolved.
**See also:** `ISSUES.md`'s Resolved section for each entry's full reasoning.

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

See `handoff-archive/2026-Q3.md` for entries before 2026-07-13's Phase 6 follow-up
(all 6 issues opened by the implementation session resolved) entry above — including
the original Phase 6 (wizard UI implementation) build entry, archived this session
per this doc's own ~150-line archive rule.
