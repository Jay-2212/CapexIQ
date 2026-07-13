Unit tests for `/formulas`, one file per formula module, run via `npm test` (vitest).
**Phase 2 (2026-07-11):** 17 test files, 65 passing tests, 3+ cases per formula (clean
round-number, realistic messy-number, edge case). **Phase 6 addition (2026-07-13):**
`computeAssessment.test.ts` (validates the canonical pipeline against the golden
scenarios in `tests/scenarios/`) and `computeAssessment.integration.test.ts` (the full
wizard-reducer-to-pipeline path). Add tests alongside any future formula change, not
after.
