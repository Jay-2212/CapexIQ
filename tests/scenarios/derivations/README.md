# tests/scenarios/derivations/

Standalone scripts that independently re-derive a golden scenario's expected values —
no import from `/formulas`, a second implementation of the same well-defined math
(NPV/IRR/EAC/payback), written in a different language than the code under test. These
are what makes `tests/scenarios/*.test.ts`'s "independently derived, not copied from a
run of the code" claim checkable by anyone, not just trusted on the comment's word.

Not run by CI — they're a derivation record, not a test. Run one directly
(`python3 tests/scenarios/derivations/<file>.py`) to reproduce a scenario file's
expected values from scratch.

| File | Backs |
|---|---|
| `scenario-a-derivation.py` | `tests/scenarios/simple-cash-purchase.test.ts` (golden scenario A) |
| `scenario-c-derivation.py` | `tests/scenarios/non-viable-and-edge-cases.test.ts` (golden scenario C) |

Golden scenarios B (financed + payer mix + DSO) and the Investment Outlook band-
boundary cases don't have a standalone script here — their expected values are instead
hand-derived inline, with the exact arithmetic shown in each test's own comment (see
`tests/scenarios/financed-payer-mix-dso.test.ts` and
`tests/scenarios/investment-outlook-band-boundaries.test.ts`). Both files previously
cited an external Python script at a now-nonexistent local path; that claim was removed
rather than left dangling, and full A/C-style standalone scripts for them remain a
reasonable follow-up if anyone wants a fully external independent check for those two
too.

If you add a new golden scenario with hand-derived expectations, add its derivation
script here too — a comment claiming "independently derived" with nothing to check it
against is the exact failure mode this folder exists to prevent (see `HANDOFF.md`'s
note on the previously-dangling `/Users/jay/.claude/jobs/...` path this replaced).
