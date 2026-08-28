# CapexIQ Overnight QA — Stage C Fix Report

Date: 2026-08-28 (Asia/Kolkata)
Implementation owner: Stage C (completed by the pipeline lead after the bounded
C worker stopped with its partial validation patch preserved)
Source checkout: `/Users/jay/Documents/Roi_Calculator`

## Safety checkpoint

- Starting commit: `9db6fe2`
- Checkpoint branch: `codex/overnight-qa-2026-08-28`
- Checkpoint commit: `79eacd578540a7155699991326969d67f7088ab3`
- Existing work was clean before the checkpoint; the untracked
  `capexiq-qa/` working area was preserved and not committed as source.
- No deployment, push, infrastructure, authentication, schema, route, or
  persistent production-data operation was performed.

## Issue status

### TEST-001 — FIXED

`RESTORE_DRAFT` now restores analyst values and settings while resetting the
session-level `touched` map alongside `attemptedSteps`. This prevents stale
validation errors and `aria-invalid` state from a prior session appearing on a
restored draft. Validation truth, step gating, field values, and calculations
are unchanged.

Changed:

- `app/forms/wizardReducer.ts`
- `tests/wizard/wizardReducer.test.ts`
- `tests/wizard/components.test.tsx`

Added reducer coverage for preserving values/units while clearing touched state,
plus a component-level restored-draft error-reveal regression test.

### TEST-002 — FIXED; visual confirmation required in Stage D

`exports/excel-generator.ts` now applies a reusable workbook formatting pass
without changing `exports/workbookPlan.ts` or any formula/address. It adds
financial number formats, wrapped/readable headers, body borders/alignment,
sheet-specific widths, frozen header panes, bounded print areas, landscape or
portrait fit-to-page setup, repeating header rows, a restrained color hierarchy,
and a footer. Annual IRR helper columns are hidden from the presentation/print
area but remain formula-backed and available for inspection.

Changed:

- `exports/excel-generator.ts`
- `tests/exports/excel-generator.test.ts`

Added round-trip assertions for INR/percentage formats, frozen views, print
areas, fit-to-width behavior, and preservation of live formulas. The plan and
financial formulas were not changed.

### TEST-003 — FIXED

`formulas/actionableInsight.ts` now suppresses optional payback-improvement
insights when the baseline or candidate payback is non-finite. The existing
`Infinity` no-payback sentinel and canonical assessment calculations remain
unchanged, while the results card can no longer display `Infinity months` or a
fabricated month improvement.

Changed:

- `formulas/actionableInsight.ts`
- `tests/results/actionableInsightCard.test.tsx`

Added regression coverage for a non-finite simplified baseline.

### TEST-004 — DEFERRED / NOT CONFIRMED

No implementation change was made. The schedule inputs are nested inside real
HTML `label` elements containing `Yr N`, which is a valid implicit accessible
name association. Stage D must independently verify the accessible name before
reopening this finding.

### TEST-005 — FIXED; visual confirmation required in Stage D

The conditional Advanced utilization-ramp note is now emitted with
`keepLines: true`, keeping the note together during Word pagination without
changing its text or section order.

Changed:

- `exports/word-generator.ts`
- `tests/exports/word-generator.test.ts`

Added a DOCX XML assertion for the keep-lines property.

## Checks

- Focused changed-area tests: 51 passed across 5 files.
- Full test suite: 336 passed across 47 files.
- TypeScript: `npx tsc --noEmit` passed after the final type guard.
- ESLint: `npm run lint` passed.
- Production/static build: `npm run build` passed.
- `git diff --check` passed.

## Regression risk and remaining verification

The highest risk is shared Excel formatting across all modes; formulas and sheet
addresses were deliberately left untouched. Stage D must independently generate
fresh Advanced and Basic Excel/Word exports, recalculate/audit the workbooks,
render Excel and DOCX output, verify both mode flows, and check the live
canonical host separately from the local repaired build. TEST-004 remains open
only if its implicit label does not produce an accessible name.

## Targeted C → D repair cycle — VERIFY-001

Date: 2026-08-28 (Asia/Kolkata)  
Implementation owner: Agent C  
Source checkout: `/Users/jay/Documents/Roi_Calculator`  
Starting checkpoint: `5614fdc8cf9a81d1d65ca085aa4c83665936e256`  
Repair commit: `1e9c700a2522888a46d1f06fc3194a03ab8bd625`
Handoff documentation commit: `91d96fca72585b2c58a1f255518989b8c2ea70b9`

### Status

**FIXED in source; ready for Stage D re-verification.** No deployment, publish, push,
or edit to `VERIFY_REPORT.md` was performed.

### Repair

When `advancedOpen` is false, the canonical mapping now:

- omits `utilizationRamp`, forcing the flat mature-utilization path;
- resolves the existing five payer rows to the Basic billed tariff with 100% private
  cash, 100% realization, and zero collection delay; and
- omits Advanced yearly maintenance overrides while retaining the existing flat Basic
  post-warranty AMC/CMC rate.

When Advanced Mode is open, Group A/B/E mapping is unchanged. Advanced state is not
cleared on collapse, and compact Basic Loan/Lease financing continues to map through
the existing financing fields.

### Changed files

- `app/forms/toAssessmentInputs.ts` — gate ramp and yearly maintenance overrides on
  `advancedOpen`.
- `app/forms/resolvePayerMix.ts` — add the closed-Basic five-row payer contract while
  preserving the existing Advanced resolver path.
- `tests/wizard/toAssessmentInputs.test.ts` — populate Advanced Groups A/B/E, close
  Advanced, assert exact Basic inputs and result equality with clean Basic, and assert
  Advanced values still apply while open.

### Verification

- Focused mapping/reducer/integration tests: **36 passed across 3 files**.
- Full test suite: **338 passed across 47 files** (`npm test`).
- `npx tsc --noEmit`: **PASS**.
- `npm run lint`: **PASS**.
- `npm run build`: **PASS** — Next.js static export completed.
- `git diff --check`: **PASS**.

The only test-run output was the existing Node experimental `localStorage` warning.
