# CapexIQ Overnight QA — Stage D Verification Report

Date: 2026-08-28 (Asia/Kolkata)  
Verifier: Agent D / lead verification lane  
Source checkout: `/Users/jay/Documents/Roi_Calculator`  
Branch: `codex/overnight-qa-2026-08-28`  
Final implementation commit verified: `1e9c700a2522888a46d1f06fc3194a03ab8bd625`  
Final handoff documentation commit: `5c74a2570262f30d60b3cf2cb306d4bb485df0b3`

## Scope

Verification used the clean repaired build on `http://localhost:3000` and synthetic
hospital-equipment data. No implementation code was edited during verification. The
canonical live host `https://capexiq.jaybharti.me` remained reachable as a baseline;
the repaired source was not deployed during this run.

## Automated checks

All checks passed against the final implementation commit:

| Command | Result |
|---|---|
| `npm test` | PASS — 47 files, 338 tests |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — Next.js 15.5.22, 10 static pages, 2 static exports |
| `git diff --check` | PASS |

Only the existing Node experimental `localStorage` warning appeared in the test run.

## Browser verification

### Advanced Mode — PASS

Reopened the persisted Advanced assessment after the Basic run, confirmed Advanced
values were still present, and completed the Advanced path to `/results`:

- Synthetic Udaan Multi-Speciality Centre CT assessment with Advanced payer/DSO,
  ramp-up, financing, lifecycle, and finance assumptions retained.
- Results were finite: score 100, NPV ₹13,14,26,719, IRR 56.1%, simple payback
  1.9 years, discounted payback 2.2 years.
- No `Infinity` or `NaN` appeared; no browser console errors or warnings were observed
  in the final run.
- Advanced Excel and Word exports downloaded successfully.

### Basic Mode — PASS

Completed Basic Mode after Advanced values had been entered and Advanced Mode had been
closed—the boundary case that failed in the first D cycle:

- Synthetic Udaan Multi-Speciality Centre CT assessment, cash purchase, ₹4.5 crore
  purchase, ₹35 lakh installation, 14 uses/day, ₹5,000 tariff, 25 working days/month,
  and realistic Basic operating costs.
- Results were finite: score 97, NPV ₹5,92,77,042, IRR 35.8%, simple payback
  2.7 years, discounted payback 3.4 years.
- `Adjust assumptions` returned to `/assess/costs` with Basic values preserved and no
  validation error; final browser logs contained no application errors or warnings.
- Basic Excel and Word exports downloaded successfully.

The final Basic workbook proves the inactive Advanced values are excluded: payer shares
are 100/0/0/0/0, ramp values are 100/100/100/100, collection delays are all zero, and
yearly maintenance overrides are blank. The Advanced workbook retains the entered
55/25/10/10 payer mix, 50/70/85/100 ramp, and delayed collection assumptions.

## Export and artifact audit

### Excel

All four final workbooks opened with ExcelJS and LibreOffice recalculation.

- Seven expected visible sheets were present in the expected order; no merged cells or
  hidden worksheets were introduced.
- Formula maps were unchanged from the corresponding before-fix artifacts: Advanced
  2,339 formulas and Basic 2,327 formulas, with zero changed or added formula addresses.
- Key cells remained genuine formulas, not strings, including `Assumptions!B4`,
  `Assumptions!B32:B33`, `Monthly!C2`, `Monthly!D2`, `Monthly!E2`, `Monthly!J2`,
  `Annual Summary!B16:B17`, and `Break-even Analysis!B3:B4`.
- LibreOffice recalculated values matched the browser results: Basic NPV
  ₹5,92,77,042 / IRR 35.8%; Advanced NPV ₹13,14,26,719 / IRR 56.1%.
- All numeric/formula cells had explicit number formats; no numeric/formula cell was
  left on `General` in either final workbook.
- Title/header fills, Aptos fonts, borders, alignment, wrapping, INR/percentage formats,
  column widths, frozen top rows (`A2`), hidden annual helper columns, print areas, and
  landscape Monthly/Annual layouts were present.
- Rendered PDF output was 8 pages for each final workbook versus 32 pages before. The
  rendered pages were visually inspected; no clipped headers, `###`, `#REF!`, `#VALUE!`,
  `#DIV/0!`, `Infinity`, or `NaN` tokens were found.

### Word

- Both final DOCX files opened and rendered through LibreOffice to three readable A4
  pages, with headings, tables, currency/percentage values, and sections intact.
- The Advanced ramp explanation stayed together at the top of page 2 rather than
  splitting after “see the Usage.”
- Basic and Advanced content matched their final browser metrics; no missing sections,
  unexpected blank pages, `Infinity`, `NaN`, or formula-error text was found.

## Issue verification

| Issue | Verdict | Evidence |
|---|---|---|
| TEST-001 stale restored validation reveal | PASS | Restored local draft showed no stale investment validation errors; reducer/component regression tests pass. |
| TEST-002 Excel presentation/print quality | PASS | Final styled workbooks, metadata, recalculation, and rendered output audited. |
| TEST-003 non-finite actionable insight | PASS | Final Advanced results showed finite values; regression test and rendered-text scans pass. |
| TEST-004 accessible name for wrapped `Yr` labels | PASS | Exact `Yr 1` spinbutton query returned one control in Advanced lifecycle. |
| TEST-005 Word note pagination | PASS | `keepLines` regression test passes and the rendered note remains together on page 2. |
| VERIFY-001 Basic uses inactive Advanced values | PASS | Final Basic result/export excludes persisted payer/DSO, ramp, and yearly maintenance overrides while Advanced reopening retains them. |

## Regression status

No regression was found in Begin Assessment, Basic Mode, Advanced Mode, navigation,
draft persistence, validation, calculations, workbook formulas, Excel opening and
recalculation, Word rendering, or the automated test suite. The first-cycle failing
Basic artifact is retained as `artifacts/after/basic_verify_failed_mode-boundary.xlsx`
and its matching DOCX for audit history; `basic_after.*` are the final passing exports.

No deployment or production data mutation was performed. The live canonical host was
checked for reachability only; the supplied `jai-bharti.me` hostname remained an
unresolvable typo and was not treated as a deployment target.

## Overall verdict

**PASS** — all original defects and the discovered Basic/Advanced boundary defect pass
independent verification on the repaired source, with no material regression found.
