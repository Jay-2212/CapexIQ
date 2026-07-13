# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-13)*

**Phase 6 (wizard UI implementation) is built.** `/app` now has a real, working
pre-step + 3-step Basic Mode wizard + Advanced Mode panel + a minimal `/results` page,
all wired to a single canonical calculation pipeline. Planning was already doubly
audited before this session started (`$capexiq-ui-assurance` + `$capexiq-prebuild-
assurance`, both merged 2026-07-12); this session is the first real product code.

- **Canonical pipeline (`formulas/computeAssessment.ts`, new):** the single
  wizard-inputs-to-full-result derivation `wizard-state.md` §4 requires. Composition
  order (accrual-basis NPV/IRR, DSO-extended array feeding a separate working-capital
  metric, Basic Mode's flat blended maintenance rate vs. Advanced Mode's
  `cmcYears`-plus-sourced-rate schedule, financing-mode cash-flow treatment) is not
  guessed — it's copied exactly from `tests/scenarios/`'s independently-hand-derived
  golden scenarios (A-D), and a new test file (`tests/formulas/computeAssessment.test.ts`)
  reproduces every one of those golden numbers.
- **Full wizard**, `app/(assessment)/` (a Next.js route group sharing one
  `WizardProvider` across `/assess/*` and `/results`): pre-step (equipment tiles + bed
  size/city tier), Investment/Usage & Revenue/Operating Costs steps, the Advanced Mode
  panel (all 6 groups A-F), a live preview strip, `localStorage` draft persistence
  (debounce, multi-tab conflict banner, write-failure handling), the route guard, focus
  management, and "Start over." `app/forms/` holds the reducer/schema/validation/
  persistence logic; `app/advanced/` and `app/components/` hold the UI.
- **Verification:** 161 tests pass (109 pre-existing + 52 new — reducer transitions,
  validation, financing-mode mapping, persistence, and 2 React Testing Library
  component tests), `npm run build` and `npx tsc --noEmit` both clean. **No interactive
  browser QA was possible this session** (no working Chrome extension connection) — see
  `ISSUES.md` ISS-21 for exactly what that leaves unverified and a recommended manual
  pass.
- **Six items logged to `ISSUES.md`'s Open section (ISS-17 through ISS-21, ISS-23)** —
  judgment calls (a realization/claim-deduction composition rule, a Lease-financing
  assumption with no bounded term), deferred scope (utilization ramp-up and the
  per-year maintenance override are collected but not yet consumed by the pipeline),
  and verification/coverage gaps (not every wizard-state.md edge case has its own test;
  the slider touch-target audit ask isn't achievable with a native range input) —
  flagged proactively, none block Phase 6's core functionality. **One bug found and
  fixed the same session:** `payerMixSharePct`'s `required: true` had no default,
  same class of issue as the already-resolved `targetIrr`/F1 bug — fixed with the same
  pattern (auto-filled implicit single-payer default), logged as Resolved ISS-22.
- **Landing page still a placeholder** — `design/ux-product-spec.md` §5's hero/entry
  flow wasn't built this session; `/assess` works standalone via direct URL.
- **New dev dependencies:** `jsdom`, `@testing-library/react`/`jest-dom`,
  `@vitejs/plugin-react` (test-only), `lucide-react` (equipment-tile icon). New
  `vitest.config.ts` (path aliases + jsdom environment) and `tests/setup.ts` (a
  `localStorage`/`scrollIntoView` polyfill — see that file's own comment for why this
  environment's jsdom needed one).

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

### 2026-07-13 — Pre-build audit run, all 13 findings fixed, then reconciled against a parallel UI-assurance audit session at merge time
**What changed:** Jay asked to run `$capexiq-prebuild-assurance` (audit-only), then —
after reviewing the resulting 13 findings — asked to fix all of them in one session,
using a three-layer decision process: small judgment calls decided directly, bigger
ones sanity-checked by an Opus advisor sub-agent, and anything the advisor flagged as a
genuine product-judgment call escalated to Jay with concrete options.
1. **Audit findings (PBA-1 through PBA-13):** whole-model/schema-contract correctness,
   golden scenarios, browser storage/privacy, and static-host deployment gaps — full
   detail in the audit conversation, not duplicated here. Two confirmed schema-shape
   defects stood out: `warrantyYears`/`cmcYears`/`installationAndAncillaryCostPercentage`
   used inconsistent `{value}` vs. `{low,typical,high}` shapes across the 5 real
   equipment files (PBA-1), and `equipment-data/custom.json` stored several fields as
   bare `null` instead of the same nested-object shape as the other 5 files — which
   would throw a TypeError the first time generic tooltip/default-population code
   touched Custom equipment (PBA-2).
2. **7 findings fixed directly** (no advisor needed — mechanical, one clear answer):
   normalized equipment-data shapes (PBA-1); reshaped `custom.json` + removed dead
   `financingNorms`/`workingDaysPerMonth` fields the ISS-13 cleanup had missed (PBA-2);
   corrected a false claim in `design/ux-product-spec.md` §6 that discount rate was
   `Unavailable` (only target IRR is — the same false-"unresearched" failure class
   ISS-9 already caught once, in a different file) (PBA-6); added the missing
   response-header/CSP/HSTS/source-map checklist to `agent-build-plan.md` Phase 10,
   which previously had zero security verification items (PBA-9); documented
   `localStorage` quota/private-mode-failure behavior in `wizard-state.md` §7.3,
   previously unspecified (PBA-13); flagged `targetIrr`'s `required: true` with no
   sourced default as a real defect (PBA-5) — **superseded at merge time, see item 6.**
3. **Opus advisor consulted on 5 items** (PBA-3, PBA-4, PBA-7, PBA-8, and golden-scenario
   scope) — 4 of 5 resolvable by engineering reasoning alone, implemented directly:
   - **PBA-3 (DSO-extended cash-received array):** confirmed by direct computation
     (not just code-reading) that `cashReceivedByMonth()`'s output must never be
     truncated to the original projection-horizon length before summing into NPV/
     working capital — doing so silently turns a temporary collection delay into what
     looks like a permanent revenue loss (measured ₹15,00,000 phantom loss in a test
     scenario). Documented as a hard contract in `SPEC.md` §14.4 and
     `report-templates/formula-appendix.md` §1.4.
   - **PBA-7 (Infinity vs. null "no payback" sentinels):** advisor initially suggested
     unifying `paybackPeriod()`'s `Infinity` and `discountedPaybackPeriod()`'s `null`
     into one sentinel — checked this against `formulas/actionableInsight.ts`'s actual
     arithmetic (`baselinePaybackYears − scenarioPaybackYears`) and found unifying to
     `null` would silently break it (`null` coerces to `0` in JS arithmetic, producing
     false-positive tariff-increase suggestions) — **overrode the advisor's specific
     suggestion** and kept both sentinels, documenting the divergence and the
     `JSON.stringify(Infinity) === "null"` serialization hazard instead
     (`formula-appendix.md` §4.6, `agent-build-plan.md` Phase 6).
   - **PBA-8 (localStorage privacy disclosure):** added the advisor-drafted copy to
     `content/field-explanations.md`, distinct from the export-facing
     `report-templates/disclaimer.md` — **wording later reconciled to the
     `$capexiq-ui-assurance` audit's own copy at merge time, see item 6.**
   - **Golden scenarios (PBA-10/11):** built 4 scenarios (not the audit's originally-
     suggested 8), each engineered to multiplex several requirements at once per the
     advisor's suggestion — see item 4 below.
4. **PBA-4 (Basic Mode AMC/CMC + missing `cmcYears` field) — architecture implemented
   directly, one number left open for Jay.** Added `cmcYears` as an Advanced Group E
   field (was a required `formulas/maintenance.ts` parameter with no wizard field
   anywhere). Basic Mode now explicitly documented as collapsing the CMC-then-AMC
   schedule into one flat post-warranty rate. The advisor flagged the *default-source
   formula* for that flat rate as a genuine product call (CMC is pricier than AMC, so
   defaulting from AMC alone would systematically understate cost) — implemented
   Option A (a duration-weighted blend) as the working default, marked
   `"PROVISIONAL pending confirmation"` in `content/inputs-metadata.json`. **Jay
   confirmed Option A directly after the PR opened** — `PROVISIONAL` language removed,
   logged as `ISSUES.md` ISS-16 (see item 6 for the renumbering).
5. **Built `tests/scenarios/`** (previously an empty scaffold) — 5 files, 44 new tests,
   independently hand/Python-derived (never from `/formulas` itself): a simple cash
   purchase crossing the warranty→CMC→AMC transition; a financed purchase with a 3-way
   payer mix and DSO (doubles as the PBA-3 regression test, including the exact
   ₹32,04,000 truncation-hazard number, and the PBA-11 three-ROI-views test); a
   non-viable case at the minimum 1-year useful-life horizon (undefined IRR, `Infinity`
   payback) plus a standalone negative-contribution-margin edge case; a Custom-equipment
   regression test for PBA-2's schema fix; and exact Investment Outlook band-boundary
   tests (75/55/35) plus `financial-model-spec.md` §1.7's worked example reproduced
   exactly. One arithmetic error caught and fixed mid-session by re-deriving in Python
   before trusting a hand-computed number.
6. **Merge-time discovery: this branch and PR #13's `$capexiq-ui-assurance` audit
   branch had run in parallel and collided.** Rebasing onto `main` after PR #13 merged
   surfaced real conflicts, not just git mechanics — both sessions independently found
   and fixed the *same* `targetIrr`-blocks-Basic-Mode defect (this session's PBA-5 vs.
   their F1/ISS-14) and the *same* false discount-rate-`Unavailable` doc claim (PBA-6
   vs. their bonus doc-drift catch), and both used "ISS-14" for their own next-available
   issue number. Reconciled by hand rather than blindly keeping one side: deferred to
   PR #13's `targetIrr` resolution (an auto-filled, labeled heuristic default — more
   complete than this session's simpler `required: false`, since it keeps the field
   semantically meaningful instead of just giving up on requiring it) and to a merged
   discount-rate correction combining both write-ups (PR #13's fix plus this session's
   additional finding that `purchaseCost`/`usagePerDay`/`billedTariff`/`launchDelay`
   have the identical null-default gap for several equipment types, which PR #13 didn't
   cover). PR #13's `wizard-state.md` §7.3 (multi-tab conflict banner + shared-device
   disclosure) and this session's §7.3 (storage-write-failure handling) covered
   genuinely different parts of the same gap — merged into one three-part section
   rather than picking one. This session's `ISSUES.md` ISS-14 (AMC/CMC default-source)
   renumbered to **ISS-16** to stop colliding with PR #13's already-published ISS-14/
   ISS-15. `content/field-explanations.md`'s independently-drafted privacy-disclosure
   copy reconciled to PR #13's exact wording (one source of truth, not two drafts of
   the same sentence).
**Files touched:** `equipment-data/mri.json`/`ct.json`/`dialysis.json`/`ultrasound.json`/
`custom.json`, `content/inputs-metadata.json`, `content/field-explanations.md`,
`content/tooltip-copy.md`, `design/ux-product-spec.md`, `SPEC.md`,
`report-templates/formula-appendix.md`, `agent-build-plan.md`, `app/forms/wizard-state.md`,
`ISSUES.md` (ISS-16 added/resolved, ISS-14/ISS-15 cross-referenced), `tests/scenarios/*`
(5 new files + README), `HANDOFF.md`, `DIRECTORY.md`, `INTRODUCTION.md` (reading-order
clarification, unrelated to the audit — see the pointer below). No `/formulas` file
touched — every fix was a data/contract/doc correction or a new test, never a change to
already-tested calculation logic.
`npm test` 109/109 (65 original + 44 new), `npx tsc --noEmit` clean, `npm run build`
clean — re-verified after the audit fixes and again after the merge reconciliation.
**Also this session, unrelated to the audit:** Jay asked to relax `INTRODUCTION.md`'s
reading order to keep the project genuinely context-efficient — only `INTRODUCTION.md`
and `CONVENTIONS.md` stay a hard mandate every session; `HANDOFF.md` must still be
*updated* before finishing but reading it is now framed as strongly recommended, not a
mandate on par with the first two; `DIRECTORY.md`/`ISSUES.md`/`agent-build-plan.md`/
`SPEC.md` are explicitly reference docs to consult when a task needs them, not a
checklist every session has to clear first.
**What's next:** Phase 6 (wizard UI implementation) — pure build from here. `ISSUES.md`'s
Open section is empty; every finding from both this audit and PR #13's is Accepted or
Resolved.

See `handoff-archive/2026-Q3.md` for entries before 2026-07-13's pre-build-audit-fixes
entry above (including the `$capexiq-ui-assurance` audit and the creation of the
`capexiq-prebuild-assurance` skill).

See handoff-archive/2026-Q3.md for entries before 2026-07-13.
