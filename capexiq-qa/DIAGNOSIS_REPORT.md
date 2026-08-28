# CapexIQ Overnight QA — Stage B Diagnosis Report

Date: 2026-08-28 (Asia/Kolkata)
Diagnosis owner: Agent A (read-only fallback after two diagnosis workers were
cleanly stopped without producing a report)
Source commit inspected: `9db6fe2`

This report is based on the reproduced evidence in `TEST_REPORT.md` and direct
inspection of the current source. No implementation files were changed during
diagnosis. The calculation methodology, scoring constants, schemas, and public
routes are not implicated by the evidence and should remain unchanged.

## TEST-001 — stale validation reveal after draft restore

Severity: High
Status: Confirmed

### Root cause

`app/forms/useFieldController.ts` correctly gates the displayed field error on
`touched || attempted`. `app/forms/wizardReducer.ts`'s `RESTORE_DRAFT` action
resets `attemptedSteps`, but spreads the persisted `action.state` unchanged for
`touched`. `app/forms/useWizardPersistence.ts` serializes the complete wizard
state, so a previous session's touched map is restored with the draft. A blank
or invalid field that was edited in a previous session is therefore immediately
rendered with `error`, `data-invalid`, and `aria-invalid` on the next load even
though the current session has not interacted with it.

This matches the live/local evidence and explains why the existing fresh-provider
component tests pass: those tests start from `emptyWizardState()` and do not
exercise a restored state containing touched fields. The validation predicate and
step gate themselves are not wrong.

### Affected code

- `app/forms/useWizardPersistence.ts`: persists the whole reducer state.
- `app/forms/wizardReducer.ts`: `RESTORE_DRAFT` preserves `touched` while
  explicitly treating `attemptedSteps` as ephemeral.
- `app/forms/useFieldController.ts`: the correct gating point whose input state
  is stale after restore.
- `tests/wizard/wizardReducer.test.ts` and
  `tests/wizard/components.test.tsx`: no restored-touched regression coverage.

### Safest repair

Treat `touched` as session presentation state during `RESTORE_DRAFT`, just like
`attemptedSteps`: restore all analyst-entered values and durable settings, but
replace `touched` with `{}`. This preserves calculations, navigation, field
values, and draft persistence while preventing stale red validation and restoring
the expected Typical treatment for the current session. Add a reducer regression
test with a touched invalid field and a component-level restore test if the
existing test harness makes that practical.

### Risk and verification

Risk is limited to restored drafts showing Typical tags again until the user edits
the fields; no formula or persisted analyst value changes. Verify that an invalid
restored value has no visible error/`aria-invalid` before interaction, that editing
it reveals the error, that an attempted step still reveals errors, and that all
restored numeric/string values remain unchanged.

## TEST-002 — Excel workbook presentation and print setup

Severity: High
Status: Confirmed

### Root cause

`exports/excel-generator.ts` performs only mechanical cell writes followed by a
single bold first-row style and fixed widths: column A is width 26 and columns B
through P are width 16. It does not assign `numFmt`, alignment/wrap, borders,
section/header styles, row heights, freeze panes, print areas, page orientation,
fit-to-page settings, or repeating print titles. The plan in
`exports/workbookPlan.ts` correctly provides formulas and values, but the
generator has no sheet-aware formatting pass. Long payer and monthly headers
therefore clip, financial values remain `General`, and the default portrait
print layout spills the wide/long model into many split and blank pages.

The formula layer is not the cause: the before-fix workbooks contain ExcelJS
formula cells, the expected seven sheets, and direct references. LibreOffice
recalculation reconciled Advanced NPV/IRR and Basic NPV/IRR with the dashboard.

### Affected code

- `exports/excel-generator.ts`: incomplete workbook styling and page setup.
- `exports/workbookPlan.ts`: cell layout/labels are the formatting pass's source
  of truth; no formula correction is justified.
- `tests/exports/excel-generator.test.ts`: currently checks generation/content,
  but not meaningful number formats, views, print setup, or header usability.

### Safest repair

Keep `buildWorkbookPlan()` and every formula string unchanged. Add a targeted,
sheet-aware formatting pass in `excel-generator.ts` using reusable helpers for:

- header/title rows, readable widths, wrapped text, vertical alignment, and
  restrained borders/fills;
- INR/currency, percentage, decimal, year, and date-appropriate formats based on
  known columns/rows (percentages remain stored as plain app values and should
  use a `0.0"%"`-style display format, not divide the value again);
- frozen panes for tabular headers;
- landscape/fit-to-width print setup, print areas bounded to used cells, and
  repeating header rows where ExcelJS supports them.

Do not replace formulas with cached values or change sheet order/addresses. Add
metadata assertions and a formula-preservation regression test; use a small
round-trip/LibreOffice audit to confirm formulas still evaluate after styling.

### Risk and verification

Risk is medium because styles are shared across all export modes and page setup
varies by sheet. Verify both Basic and Advanced workbooks: same seven sheet names
and order, same formula count/addresses, no error values after recalculation,
dashboard reconciliation, usable headers, correct currency/percentage display,
freeze panes, bounded print areas, and materially fewer split/blank print pages.

## TEST-003 — non-finite actionable insight text

Severity: Medium
Status: Confirmed

### Root cause

`formulas/actionableInsight.ts` calculates
`paybackImprovementMonths = (baselinePaybackYears - scenarioPaybackYears) * 12`
without checking finiteness. `runScenario()` intentionally returns `Infinity`
when the simplified scenario does not recover its investment within its useful
life. If the baseline is `Infinity` and a tariff scenario is finite, the
comparison passes the `>= 6` gate because the improvement is also `Infinity`.
`app/components/ActionableInsightCard.tsx` then rounds and prints that value,
while `formatYears()` separately renders the baseline as
`Never (within useful life)`. The result is the observed `Infinity months` copy.

The canonical financial engine is not implicated. The insight is an optional
simplified scenario surface and already has an explicit null/no-card contract.

### Affected code

- `formulas/actionableInsight.ts`: non-finite baseline/scenario values enter the
  materiality filter and improvement field.
- `app/components/ActionableInsightCard.tsx`: presents the unguarded improvement.
- `tests/results/actionableInsightCard.test.tsx`: lacks a non-finite baseline
  case; `tests/formulas/roi.test.ts` confirms Infinity is a valid no-payback
  sentinel elsewhere.

### Safest repair

Keep the existing `Infinity` sentinel in the financial formulas and add a finite
guard to the optional insight qualification: only calculate/qualify a payback
improvement when both baseline and scenario payback years are finite. If either
is non-finite, return no insight for that candidate. This removes the invalid
claim without inventing an arbitrary conversion from "never" to months or
changing dashboard payback semantics. Add formula/component coverage asserting
the card is absent and no `Infinity months` text is rendered.

### Risk and verification

Risk is low: some optional suggestions disappear for scenarios that cannot be
compared in finite months. Verify the existing qualifying suggestion still
renders, the no-materiality case stays absent, and a non-finite baseline plus a
finite tariff scenario never renders `Infinity`, `NaN`, or fabricated months.

## TEST-004 — maintenance schedule labels

Severity: Low
Status: Not a confirmed defect; no implementation change recommended

`app/advanced/MaintenanceScheduleFields.tsx` renders each number input inside an
actual `<label>` containing the visible `Yr N` text. Although the input has no
explicit `id`, `name`, or `aria-label`, the wrapping label is a valid implicit
accessible-name association. The Stage A DOM inspection did not calculate the
accessible name, so it is insufficient evidence for a defect. Verify with a
label/query or accessibility-tree check in Stage D; do not add redundant ARIA or
change the schedule markup unless that independent check fails.

## TEST-005 — Advanced Word note split

Severity: Low
Status: Confirmed presentation defect

`exports/word-generator.ts` creates the Advanced ramp note as a normal paragraph
after the Financial Results table. It does not set paragraph pagination controls,
so the DOCX layout engine is free to split the note at the page boundary. The
document content, values, headings, tables, and disclaimer are otherwise valid.

### Safest repair

Keep the note text and section order unchanged. Create that one note with
`keepLines: true` (and, if needed after rendering, a narrowly scoped pagination
setting on the preceding section) so it moves as a unit rather than splitting
mid-sentence. Add a DOCX XML regression assertion for the keep-lines property;
render Advanced and Basic reports to confirm no blank page or new table overflow.

## Confirmed non-defects and regression baseline

- Basic and Advanced navigation, field persistence, completion, calculations, and
  downloads worked with the synthetic scenarios.
- Both before-fix Excel files opened with the expected seven visible sheets and
  real formula cells. Recalculated NPV/IRR/break-even values reconciled with the
  dashboard. No formula, schema, route, or methodology change is justified.
- Both before-fix Word files opened/rendered as complete three-page documents;
  only the Advanced note pagination issue was found.
- No browser console errors or failed requests were observed in the tested flows.

## Recommended implementation order

1. C fixes restored-touched validation state and adds regression coverage.
2. C adds the Excel formatting/page-setup pass without changing the workbook plan.
3. C guards non-finite actionable insights.
4. C applies the one-paragraph Word pagination repair.
5. D independently reruns automated checks, both modes, four exports, formula
   reconciliation, visual rendering, and the TEST-004 accessibility check.
