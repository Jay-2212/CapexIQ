Export report templates for CapexIQ (Excel/Word/methodology/disclaimer content) —
SPEC.md §29, §32. **Content complete as of 2026-07-11 (Phase 3)**; the actual
generators that consume this content (`exports/*.ts`) are still stubs — that's Phase 8.

- `disclaimer.md` — the real financial disclaimer, not a placeholder
- `methodology.md` — plain-language walkthrough of the full calculation waterfall
  (usage → revenue → costs → cash flow → ROI/NPV/IRR → break-even → Investment
  Outlook score), one continuous worked example threaded through every section
- `formula-appendix.md` — authoritative formula reference, one section per
  `/formulas` file, each formula transcribed exactly from the real implementation
- `excel-sheet-structure.md` / `word-report-template.md` — export layout specs for
  Phase 8 to build against; exports will contain live, embedded formulas, not static
  values (SPEC.md §29.5)
