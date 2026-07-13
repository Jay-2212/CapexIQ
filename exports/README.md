Excel/Word/ZIP generators — SPEC.md §29. Real (Phase 8, 2026-07-14), consuming the
same `AssessmentInputs`/`AssessmentResult` the dashboard already computed — no formula
is reimplemented here.

- `workbookPlan.ts` — pure, exceljs-independent function producing every cell/formula
  in the Excel workbook as data (see `report-templates/excel-sheet-structure.md` for
  the tab-by-tab contract). Verified cell-by-cell via a HyperFormula test oracle
  (`tests/exports/workbookPlan.test.ts`), not just a formula-string presence check.
- `excel-generator.ts` — writes `workbookPlan.ts`'s plan into a real `.xlsx` via
  `exceljs`.
- `word-generator.ts` — the 12-section Word proposal (`report-templates/
  word-report-template.md`) via `docx`, reusing `app/components/riskNotes.ts` for the
  risk-notes section rather than a second derivation.
- `zip-generator.ts` — bundles both via `jszip` per SPEC.md §29.2.

No chart images this phase (deferred, not dropped — see both template docs' Charts
notes and `ISSUES.md`). All three generators are dynamically imported from
`app/components/ExportPanel.tsx` on click, never bundled into the initial page load.
