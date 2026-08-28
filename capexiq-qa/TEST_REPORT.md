# CapexIQ Overnight QA — Stage A Test Report

Date: 2026-08-28 (Asia/Kolkata)
Tester: Agent A
Starting source commit: `9db6fe2` (`fix(results): round scenario comparison inputs to 2 decimal places`)
Source checkout: `/Users/jay/Documents/Roi_Calculator`

## Scope and test conditions

Testing used synthetic data only. The supplied URL `https://capexiq.jai-bharti.me`
did not resolve (`ERR_NAME_NOT_RESOLVED`). The repository's validated canonical
host, `https://capexiq.jaybharti.me`, loaded successfully and was used for the
live Advanced run. A local development server at `http://localhost:3000` was
used for the Basic run and source-level artifact inspection. No destructive
controls or persistent-record operations were used.

The Advanced synthetic project was a private Tier-1 hospital MRI acquisition:

- Nirman Medical Centre; 250 beds; 1.5T MRI Suite.
- Purchase ₹6.5 Cr; installation ₹75 Lakh; two-month launch delay; loan financing.
- Mature usage 25 scans/day; ₹8,500 billed/use; 25 working days/month.
- Variable costs: ₹1,200 consumable, ₹1,800 professional/reporting, ₹350 other.
- Fixed costs: ₹4.5 Lakh staff, ₹1.5 Lakh utilities, ₹75,000 other fixed/month.
- Payers: 55% private cash, 25% insurance/TPA, 10% corporate credit, 10% PM-JAY.
- Ramp: 50% / 70% / 85% / 100%; 13-year life; 12.5% discount rate.
- Loan: ₹1.25 Cr down payment, 11.5%, 60 months, 1.5% processing fee.
- Working-capital buffer ₹10 Lakh; maintenance and replacement assumptions populated.

The Basic synthetic project was a corporate Tier-2 imaging centre CT acquisition:

- Sunrise Imaging Centre; 120 beds; 128-slice CT.
- Purchase ₹450 Lakh; installation ₹35 Lakh; one-month launch delay; cash financing.
- Usage 14/day; ₹5,000 billed/use; 25 working days/month.
- Defaults retained for the remaining simplified cost fields.

## End-to-end results

### Advanced Mode — PASS with findings

- Begin Assessment, Advanced Mode selection, all six advanced groups, navigation,
  completion, results, and Adjust assumptions flow worked.
- Values persisted when moving between groups and when navigating back from results.
- Results displayed coherent values: score 29/100, NPV `−₹1,93,75,156`, IRR 8.3%,
  payback 8.5 years, and initial investment ₹7,25,00,000.
- Excel and Word downloads completed. Files are preserved at:
  - `artifacts/before/advanced_before.xlsx`
  - `artifacts/before/advanced_before.docx`
- No browser console errors or failed requests were observed during the run.

### Basic Mode — PASS with findings

- Begin Assessment, Basic Mode, investment/demand/cost inputs, completion,
  results, Back navigation, and persistence all worked.
- Basic results displayed coherent values: score 97/100, NPV `₹5,92,77,042`,
  IRR 35.8%, payback 2.7 years, and initial investment ₹4,85,00,000.
- Basic mode completed without requiring advanced-only fields and produced both
  exports:
  - `artifacts/before/basic_before.xlsx`
  - `artifacts/before/basic_before.docx`
- No browser console errors or failed requests were observed during the run.

## Prioritized defect log

### TEST-001

Severity: High
Component: Basic and Advanced investment form validation / accessibility

Observed: On a fresh start-flow render before any current-run field interaction
(the browser restored an older draft), the purchase-cost and installation-cost
inputs had `aria-invalid="true"` and visible alert messages immediately. The
launch-delay slider was also marked invalid at its initial value. This was
reproduced on both the live Advanced start flow and the local Basic start flow
before interacting with the fields.

Expected: A fresh untouched form should not present required-field errors before
the user has touched a field or attempted to continue. Restoring draft values
may preserve analyst data, but should not surface stale validation state from a
prior session before current interaction. Once validation is triggered, invalid
fields should still be clearly identified.

Reproduction: Begin Assessment → leave the initial investment fields untouched
→ inspect the initial form. Read-only DOM evidence on local showed blank number
inputs with `aria-invalid="true"`, `describedby="basic.purchaseCost-error"` and
`basic.installationCost-error`, plus the launch-delay range with
`aria-invalid="true"`.

Evidence: Initial investment-page snapshots and DOM inspection from the live
canonical host and `http://localhost:3000`; no implementation cause is asserted
here.

### TEST-002

Severity: High
Component: Excel exporter / workbook presentation and print setup

Observed: Both before-fix workbooks opened and contained actual Excel formulas,
but meaningful cells had `General` number formats instead of currency,
percentage, decimal, or date formats. Headers were clipped, including payer
headers such as `Realization % (post-...)` and `Collection delay (da...)`.
The workbook had no freeze panes and no print area. LibreOffice PDF rendering
produced a 32-page portrait printout with horizontal and vertical splits,
blank pages, and raw unformatted decimals, making the financial model hard to
read or print.

Expected: The workbook should be readable in Excel and in print/PDF: financial
values should use appropriate number formats, headers should fit or wrap, key
tables should have usable widths and repeated headings, and print layout should
avoid avoidable blank/split pages.

Reproduction: Download the Advanced or Basic Excel export, inspect workbook
metadata and render it to PDF. Both files showed the same class of issue.

Evidence: `artifacts/before/advanced_before.xlsx`,
`artifacts/before/basic_before.xlsx`; structural audit found sheets
`Assumptions`, `Monthly`, `Annual Summary`, `Break-even Analysis`,
`Maintenance Schedule`, `Charts`, and `Formula Notes`, no hidden sheets,
no merges, no freeze panes, no print area, and 2,327–2,339 formulas. Rendered
pages are under `artifacts/before/render-advanced/` and
`artifacts/before/render-basic/`.

Important non-defect observation: formulas were stored as real formula cells,
not formula-looking strings. After LibreOffice recalculation, key workbook
values reconciled with the dashboard, including Advanced NPV about
`−₹1,93,75,156`, IRR about 8.28%, and Basic NPV about `₹5,92,77,042`, IRR
about 35.79%. No formula correctness defect was reproduced in these scenarios.

### TEST-003

Severity: Medium
Component: Results / actionable insight card

Observed: The Advanced results page displayed: `improve your payback period by
about Infinity months` and compared `Never (within useful life)` to `10.4 yr`,
even though the main results card reported a finite 8.5-year payback.

Expected: The insight should show finite, meaningful before/after periods when
they can be calculated, or omit/replace the insight when the comparison is not
valid. It should never show `Infinity` to an analyst.

Reproduction: Complete the Advanced synthetic MRI assessment above and view
the results page's actionable pricing insight.

Evidence: Live canonical-host results page; exact rendered text recorded above.

### TEST-004 (accessibility candidate — not confirmed)

Severity: Low
Component: Advanced maintenance schedule form

Observed: The 13 maintenance schedule number inputs displayed visible `Yr 1`
through `Yr 13` text but had no explicit input `id`, `name`, or `aria-label` in
the inspected DOM. The schedule values themselves persisted and exported
correctly. Each input is, however, nested inside its corresponding HTML
`<label>`, which provides an implicit label association.

Expected: Each input must expose its year to assistive technology while
retaining the existing visible year labels and behavior.

Reproduction: Open Advanced Group E after setting a 13-year useful life and
inspect `.maintenance-schedule__year input` elements; independently check the
computed accessible name before changing implementation.

Evidence: All 13 inputs were present and editable. The DOM lacks an explicit
identifier, but the wrapping `<label>` means this is not yet a confirmed
accessibility defect. Stage B should verify rather than assume a fix is needed.

### TEST-005

Severity: Low
Component: Word exporter / Advanced report pagination

Observed: The Advanced Word report was readable and complete, but the note after
the Financial Results section split across a page: page 1 ended with `see the
Usage` and page 2 began `assumptions), so they differ...`.

Expected: A short explanatory note should remain together where practical, or
break at a natural paragraph boundary.

Reproduction: Open `artifacts/before/advanced_before.docx` or its rendered PDF.

Evidence: `artifacts/before/render-advanced-docx/`; three-page report opened and
rendered without clipping, overlap, blank pages, or missing sections.

## Artifact audit summary

### Excel

- Both workbooks opened successfully and had the expected seven visible sheets.
- Formulas were actual formula cells and referenced the expected sheets/cells.
- Recalculated values reconciled with the on-screen results for both modes.
- Formatting and print usability are the primary Excel defects (TEST-002).

### Word

- Both documents opened and rendered successfully in three pages.
- Titles, headings, tables, currency/percentage values, and disclaimers were
  present and readable.
- No missing sections, clipping, overlap, unexpected blank pages, or broken
  tables were found.
- Only the Advanced explanatory-note page split was recorded (TEST-005).

## Stage A conclusion

The core Basic and Advanced flows, calculations, persistence, and export
generation were working for the tested synthetic scenarios. The prioritized
repair targets are stale validation reveal state after draft restore, Excel
formatting/print setup, and the invalid `Infinity`/`Never` results insight. The
maintenance schedule label finding remains an accessibility candidate pending
verification. Root-cause analysis is intentionally deferred to Stage B.
