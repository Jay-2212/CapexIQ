# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-13, Phase 7 results dashboard built and verified)*

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

**Next:** two concrete Phase 7 items before calling it fully closed — chart-level hover
tooltips (value + series + period on the cash-flow chart) and a visual QA pass across
the other equipment types and a Strong/Weak outcome (this session only live-tested MRI
at Caution/Moderate). After that, Phase 8 (Excel/Word/ZIP exports, same `/formulas`
engine) and Phase 9 (sensitivity). A dedicated real-user copy pass and the
Dark-Reader-free device QA pass noted above remain open. Do not return Advanced Mode to
a six-group continuous scroll, expose internal field/formula identifiers in public UI,
or fix the stale live-deploy issue without checking with Jay first (it may be
intentional, e.g. mid-migration).

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

### 2026-07-13 — Phase 7 results dashboard built; reconciled two divergent uncommitted/merged design efforts first
**What changed:** Jay asked for Phase 7 (results dashboard depth) plus a fix for a
red-validation-before-touch bug he'd seen, following "the new design philosophy" —
but the working tree's local `main` had a large uncommitted diff (the full warm-beige
redesign: landing rebuild, hospital name, Lakh/Crore `CurrencyUnitField`, equipment
imagery) that had never been committed, while `origin/main` was one commit ahead with
an independently-authored, already-merged PR (#17, "Resolve ISS-24/ISS-25") that fixed
the *same* validation-reveal bug and rebuilt Methodology, using different (and in the
validation case, more robust — an exhaustive `STEP_FIELD_PATHS`-derived
`stepForFieldPath` instead of a hand-listed one) code. These two lines of work touched
11 of the same files and would have silently clobbered one or the other with a naive
merge.
1. **Reconciliation, not a coin flip:** stashed the uncommitted diff (`git stash push
   -u`), entered a worktree from `origin/main` (so PR #17 was the base), applied the
   stash with `git stash apply` (not `pop`, so the stash survived as a fallback), and
   hand-resolved each of the 11 conflicted files individually — keeping
   `origin/main`'s `ATTEMPT_STEP`/`stepForFieldPath`/Methodology-page implementations
   (more robust, already tested, already shipped) while layering in the stash's actual
   new scope (`hospitalName`, `currencyUnits`/`CurrencyUnit`, the beige landing
   rebuild, `CurrencyUnitField.tsx`, equipment-image carry-forward motion) on top. The
   stash's own duplicate `MARK_STEP_ATTEMPTED` action/dispatch sites were deleted in
   favor of the surviving `ATTEMPT_STEP`. Confirmed byte-for-byte via `diff` that the
   two independent validation-gating implementations were functionally identical
   before choosing which to keep. 191 tests passed immediately after reconciliation,
   before any Phase 7 code was written.
2. **Phase 7 build** (`app/(assessment)/results/page.tsx` + four new presentational
   components): break-even comparison bar and cumulative cash-flow bar chart (moved
   into the pre-scaffolded `app/charts/` — see its README — rather than left in
   `app/components/`, matching what `agent-build-plan.md`'s own Phase 7 goal line and
   `SPEC.md` §27 already named that folder for), a sub-score-driven risk callout, and
   a collapsed-by-default quick-settings panel (`app/components/ResultsQuickSettings.tsx`)
   that is this phase's literal "Advanced settings pane" goal line — Discount Rate,
   Target Hurdle IRR, and the active financing rate/rental, reusing `NumberField` so
   edits dispatch through the one wizard reducer with no separate recompute wiring
   (live-verified: dropping the discount rate from 12.5% to 8% moved the score from
   45/"Caution" to 65/"Moderate" instantly). New pure formula `cumulativeCashFlowSeries`
   in `formulas/roi.ts` (tested) — the chart never re-derives the series itself. New
   `formatInrCompact` in `app/components/formatting.ts` (Lakh/Crore-compact axis
   labels, tested) — this module's own header comment had flagged compact formatting
   as "a Phase 7 concern," so this closes that instead of inventing an unrelated
   pattern. `RiskCallout` reuses `investmentOutlookScore.ts`'s existing 55-point
   "Moderate" band floor as its own flagging threshold rather than a new invented
   cutoff. `design/dashboard-mockup.svg` was read for chart information architecture
   only (per the Phase 7 design gate), never for its old white/slate styling.
3. **One real bug found via live browser QA, not assumed away:** the cash-flow chart's
   per-bar labels became illegible once tested against a realistic 13-year useful-life
   scenario (the mockup only ever showed 6 years) — fixed by thinning labels to ~6
   evenly-spaced ticks while still rendering every bar, full detail staying in the
   chart's accessible `<table>`.
4. **The red-validation-before-touch bug Jay asked to fix could not be reproduced**
   anywhere after reconciliation — see Current State above for the full evidence
   chain, including an extension-proof `data-invalid` DOM check. Also discovered
   `capexiq.jaybharti.me` (the live deploy) is stale, serving the pre-Phase-6
   scaffold — flagged for Jay, not fixed (out of scope, possibly intentional).
5. **Dark Reader in the automation browser silently inverted every screenshot** taken
   before this was noticed (confirmed via `data-darkreader-*` DOM attributes and
   identical computed colors on two elements with different authored CSS variables).
   Re-verified the actual palette and ran a real Phase 4-D contrast check using a
   `<meta name="darkreader-lock">` injection (makes the extension release the page)
   plus direct `getComputedStyle`/WCAG-ratio computation — found and fixed one real
   contrast failure (chart year labels, 3.29:1 → 5.91:1 by switching
   `--text-muted` to `--text-secondary`).
**Verification:** 196 tests (191 immediately post-reconciliation + 5 new
`RiskCallout` branch-coverage tests), `npx tsc --noEmit` clean, `npm run build`
(static export) clean, manual browser QA at 1440px and 390px with Dark Reader locked
for color accuracy, live WCAG contrast computation on every new chart/callout text
element.
6. **A `.next` build-cache trap, not a product bug:** running `npm run build`
   (production) in the same directory as the already-running `npm run dev` server
   corrupted the dev server's chunk cache — every `_next/static/chunks/*` request
   started 503-ing, so the page kept rendering its last-good server HTML but React
   never hydrated (clicks and typing silently did nothing, no console error). Traced
   via `read_network_requests`, not assumed; fixed by killing the dev server, deleting
   `.next`, and restarting. Worth remembering for any future session running both in
   the same worktree.
**Files touched:** `formulas/roi.ts` (`cumulativeCashFlowSeries`, new),
`app/components/formatting.ts` (`formatInrCompact`, new),
`app/charts/{BreakEvenBar,CashFlowChart}.tsx` (new), `app/charts/README.md`,
`app/components/{RiskCallout,ResultsQuickSettings}.tsx` (new),
`app/(assessment)/results/page.tsx`, `app/globals.css` (Phase 7 chart/callout/
quick-settings CSS + one contrast fix), `tests/formulas/roi.test.ts`,
`tests/wizard/formatting.test.ts` (new), `tests/results/{riskCallout.test.tsx,
README.md}` (new); the full reconciliation touched
`DIRECTORY.md`, `HANDOFF.md`, `ISSUES.md`, `agent-build-plan.md`,
`app/(assessment)/assess/page.tsx`, `app/components/StepNav.tsx`, `app/forms/
{useFieldController,wizardReducer,wizardTypes,wizardValidation}.ts`,
`app/methodology/page.tsx`, `tests/wizard/components.test.tsx`, plus the stash's
untouched-by-PR#17 files (landing rebuild, `CurrencyUnitField.tsx`, equipment/hospital
profile motion, `content/inputs-metadata.json`, `design/ux-product-spec.md`,
`public/README.md`, `vitest.config.ts`).

### 2026-07-13 — Phase 7 handoff hardened against legacy-design drift
**What changed:** Added a mandatory design gate directly to `agent-build-plan.md`
Phase 7. Any agent must preserve the implemented warm-beige experience and extend the
current Results foundation; `design/dashboard-mockup.svg` is explicitly limited to
information architecture. Added desktop/mobile browser QA and public-copy requirements,
forbade reviving the stopped Phase 7 worktree, and corrected DIRECTORY.md's stale
description of the Results and Methodology foundations.

### 2026-07-13 — Landing page hierarchy and responsive layout rebuilt
**What changed:** Reworked `/` after a live visual pass found an oversized, heavily
wrapped hero, cramped CTA/privacy details, excessive vertical dead space, and sections
that did not feel like one system. Replaced the landing structure with a shorter
decision-led hero, useful two-link CTA, browser/time notes, a compact model-coverage
strip, three-step assessment story, clearer Basic/Advanced comparison, compact role
cards, and a balanced final CTA. Moved all new landing-specific styling into
`app/landing.css` and imported it from the root layout so assessment styling remains
isolated. Manually verified desktop (1280px) and mobile (390px) in the in-app browser:
no horizontal overflow, no runtime error overlay, and all landing content/assets
rendered. Verified 31 test files / 175 tests, `npx tsc --noEmit`, and the static-export
production build.


See `handoff-archive/2026-Q3.md` for entries before 2026-07-13's Phase 7 results
dashboard entry above.
