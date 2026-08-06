Unit tests for `/formulas`, one file per formula module, run via `npm test` (vitest).
**Phase 2 (2026-07-11):** 17 test files, 65 passing tests, 3+ cases per formula (clean
round-number, realistic messy-number, edge case). **Phase 6 addition (2026-07-13):**
`computeAssessment.test.ts` (validates the canonical pipeline against the golden
scenarios in `tests/scenarios/`) and `computeAssessment.integration.test.ts` (the full
wizard-reducer-to-pipeline path). Add tests alongside any future formula change, not
after.

**2026-08-06 addition:** `workingCapitalPeak.test.ts` — `formulas/workingCapitalPeak.ts`
had no dedicated test before this (only indirect coverage via
`computeAssessment.test.ts`'s golden scenarios). This directory currently holds 24 test
files; don't treat the Phase 2 "17 test files" count above as current — check
`ls tests/formulas/*.test.ts | wc -l` for the live count rather than trusting a number
in this file, since it will drift again.
