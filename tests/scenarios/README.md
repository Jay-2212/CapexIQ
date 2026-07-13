Independently-derived, end-to-end golden scenario tests — added 2026-07-13
(`capexiq-prebuild-assurance` PBA-10), distinct from the discrete/continuous
scenario-*comparison* UI feature (`agent-build-plan.md` Phase 9). These exist to catch
integration-level defects that per-formula unit tests in `tests/formulas/` can't see
(a wrong hand-off between two formulas, an undocumented sentinel divergence, a schema
shape that breaks one equipment type but not others) — several of these tests are
direct regressions for defects the pre-build audit actually found, not hypothetical
coverage.

Every expected value was derived independently (hand arithmetic or a standalone Python
script re-implementing the relevant formula from first principles) — never by calling
`/formulas` itself. See each test file's header comment for its derivation script path.

| File | Covers |
|---|---|
| `simple-cash-purchase.test.ts` | Scenario A — round-number cash purchase, crosses the warranty → CMC → AMC maintenance transition (PBA-4's `cmcYears`), full NPV/IRR/payback/EAC chain. |
| `financed-payer-mix-dso.test.ts` | Scenario B — financed (loan) purchase, 3-way payer mix, per-payer DSO. Exercises the DSO-extended-array cash-conservation contract (PBA-3 regression, including the exact truncation-hazard number the audit found) and the three distinct ROI views (PBA-11). |
| `non-viable-and-edge-cases.test.ts` | Scenario C — negative operating cash flow every year, undefined IRR, `Infinity` payback, at the minimum allowed useful-life horizon (1 year); plus a standalone negative-contribution-margin edge case (`breakEvenUsagePerDay` throwing). |
| `custom-equipment-no-benchmark.test.ts` | Scenario D — Custom equipment schema-shape regression (PBA-2: no more bare `null` fields that would throw) and a fully user-entered pipeline with zero equipment-data defaults. |
| `investment-outlook-band-boundaries.test.ts` | Exact Strong/Moderate/Caution/Weak band boundaries (75/55/35), plus `financial-model-spec.md` §1.7's own worked example reproduced exactly. |

**Logged as follow-up, not built in this pass:** a payer-mix scenario distinct from the
financed/EMI one above (current scenario B already covers payer mix, but a
cash-purchase-with-payer-mix variant would isolate the DSO/realization effect from the
financing effect); a maximum useful-life horizon case (30 years); a scenario that hits
the Investment Outlook boundaries via a full realistic input set rather than
hand-picked sub-score-driving values. None of these are required before Phase 6 — they
add breadth, not a missing safety net.
