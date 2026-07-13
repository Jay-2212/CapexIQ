# Model and contract audit

## 1. Traceability map

Trace every Basic and Advanced input across:

`equipment-data` default/source -> `content/inputs-metadata.json` -> wizard-state machine key -> parser/validation unit -> formula parameter -> canonical result -> dashboard/chart/narrative -> Excel/Word/ZIP output.

Flag missing, renamed, duplicated, dead, implicitly converted, or differently interpreted fields. Verify repeating payer-mix, ramp-up, and by-year templates expand into stable machine keys.

## 2. Units and time bases

Make explicit for each value:

- rupees vs. percentage vs. count vs. duration;
- per use/day/month/year vs. whole useful life;
- billed vs. realized vs. collected cash;
- pre-EMI vs. post-EMI and operating surplus vs. cash flow;
- nominal vs. discounted values;
- decimal fraction vs. percentage points;
- month index and year index conventions.

Find any boundary where a conversion is implicit, duplicated, or absent.

## 3. Canonical calculation result

Require one typed calculation pipeline/result consumed by preview, results cards, charts, narratives, scenario analysis, and exports. No consumer may independently reconstruct formulas or reinterpret undefined values.

Verify:

- calculation order and dependency graph;
- errors and domain-invalid outputs such as undefined IRR or no break-even;
- distinction among `0`, `null`, unavailable, not applicable, and calculation failure;
- full precision inside the model and consistent rounding only at display/export boundaries;
- score explanations use the same component values and bands as the displayed metrics;
- actionable insights use the same scenario engine and materiality rules.

## 4. Golden scenarios

Require a compact set of independently calculated, end-to-end scenarios. At minimum cover:

- simple cash purchase with round values;
- financed purchase with EMI and collection delay;
- payer mix with partial realization and DSO working-capital gap;
- warranty-to-maintenance transition and launch delay;
- non-viable case with negative NPV/no payback or undefined IRR;
- boundary cases around every Investment Outlook band;
- minimum and maximum useful-life horizons;
- missing optional/unavailable benchmark behavior.

Expected values must come from a separately worked calculation, spreadsheet, or mathematical derivation—not calls to CapexIQ's formulas. Record allowed tolerances and rounding separately.

## 5. Conditional invariants

Hold all other valid inputs constant and test applicable relationships:

- raising realization cannot reduce realized revenue;
- raising usage cannot reduce contribution or improve break-even usage itself;
- raising variable/fixed cost cannot improve ROI, NPV, or payback;
- increasing launch delay cannot improve NPV under otherwise identical positive operations;
- increasing discount rate cannot increase NPV for conventional positive future cash flows;
- adding collection delay cannot reduce the working-capital requirement under the defined model;
- identical inputs always produce identical results;
- dashboard, scenario, and export representations agree before display rounding.

Do not assert an invariant outside its stated domain. IRR, mixed-sign cash flows, taxes, salvage, financing timing, and capped scores can create non-monotonic or flat regions.

## 6. Schema integrity

Require machine validation for equipment files, common assumptions, input metadata, persisted wizard drafts, calculation inputs/results, and scenario fixtures. Check:

- required keys, types, enums, ranges, array lengths, versions, and additional properties;
- source/confidence requirements for defaults;
- deliberate `null`/Unavailable encoding;
- cross-field constraints such as payer mix totals and year-series length;
- schema migrations or safe rejection of old persisted drafts;
- build/test failure on malformed project-owned data.

Prefer one schema or typed contract per boundary and derive consumers from it. Do not create competing validation definitions.

## 7. Financial communication integrity

Ensure every result preserves its qualifier, time basis, assumptions, confidence, and distinction from financial advice. Verify calculation-background and methodology links make results challengeable without exposing a second source of formula truth.
