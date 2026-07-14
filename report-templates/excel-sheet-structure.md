# Excel sheet structure — Financial Model.xlsx

Phase 8 (`agent-build-plan.md`), per SPEC.md §29 and Phase 4-H's resolved decision:
**every downstream cell is a live, embedded Excel formula referencing the Assumptions
sheet — never a pasted-in value.** This document is the tab-by-tab contract
`exports/excel-generator.ts` builds against, written before that generator per Phase
5's "doc before code" pattern.

Every formula below is transcribed from `report-templates/formula-appendix.md`
(itself transcribed from `/formulas`) into Excel formula syntax — no formula is
invented here that doesn't already exist in `/formulas`. Where Excel has a native
equivalent of a `/formulas` function (e.g. `PMT` for `monthlyEmi()`), that native
function is used directly rather than reimplementing the amortization math with raw
arithmetic, since it's mathematically identical and more inspectable to a finance
reader already familiar with Excel.

**Convention:** every formula shown in this document uses a readable alias (e.g.
`UsagePerDay`, `RealizedPerUse`) for the cell it refers to — these aliases are this
document's own shorthand for readability, not Excel defined names. The shipped
workbook resolves each alias to a **direct cell address** at generation time (e.g.
`Assumptions!$B$4`), per the "direct refs, not defined names" decision below.

**Convention:** percentages are stored as the plain number the app itself uses (e.g.
a 12.5% discount rate is the number `12.5`, not Excel's native 0.125-with-%-format) —
formulas divide by 100 explicitly, exactly matching every `/formulas` file's own
convention. This avoids a second, Excel-only unit convention a formula author could
silently get backwards.

**Billed/realized ramp symmetry (ISS-29, resolved 2026-07-14):** Phase 8 originally
surfaced an asymmetry where `formulas/computeAssessment.ts` ramped *realized* revenue
and variable cost by `inputs.utilizationRamp` (Advanced Group B) but never ramped
*billed* revenue. Jay's decision: ramp billed revenue too, reusing the same ramp
curve — both figures are usagePerDay-driven and differ only in per-use rate, so a
volume ramp affects both identically. The Monthly sheet's Billed Revenue column below
now varies month to month under the ramp exactly like Realized Revenue and Variable
Cost do. This is contained to `formulas/monthlySeries.ts`/this Excel export — the
dashboard's headline `roiBilled`/`roiRealized`/`annualOperatingSurplus` in
`computeAssessment.ts` already use flat, unramped annual figures for *both* revenue
views and are unchanged by this fix. See `ISSUES.md`.

---

## Tab 1 — Assumptions

One labeled row per raw input, grouped to match `content/inputs-metadata.json`'s
Basic/Advanced structure. Every cell here is a **plain value, user-editable** — no
formulas. Every other tab references these cells by **direct cell address**
(`=Assumptions!$B$4*Assumptions!$B$7`), not an Excel defined name. Named ranges were
considered for readability but rejected: a defined-name write that Excel can't
resolve fails silently as `#NAME?` throughout the workbook with nothing in this
project's headless test pipeline able to catch it (no Excel/LibreOffice available to
open the file), whereas a direct cell reference is exactly what the Phase 8 spike
proved round-trips correctly through `exceljs`, and is exactly what "traceable to the
Assumptions sheet" (the DoD's own words) requires — Excel's own "trace precedents"
still works identically on a direct reference. The table below still gives each
Assumptions row a **name** for this document's own readability; that name is a label
for humans reading this doc, not an Excel defined name in the shipped file.

| Row | Name | Value | Notes |
|---|---|---|---|
| Purchase cost | `PurchaseCost` | ₹ | |
| Installation cost | `InstallationCost` | ₹ | |
| Initial investment | `InitialInvestment` | `=PurchaseCost+InstallationCost` | the one formula cell on this sheet — a pure sum of the two above, kept here (not the Monthly/Annual sheet) since every other sheet references it as an assumption |
| Usage per day | `UsagePerDay` | count | |
| Working days per month | `WorkingDaysPerMonth` | count | |
| Variable cost per use | `VariableCostPerUse` | ₹ | |
| Fixed cost per month | `FixedCostPerMonth` | ₹ | |
| Useful life (years) | `UsefulLifeYears` | years | |
| Discount rate | `DiscountRate` | e.g. `12.5` (%, see convention above) | |
| Salvage value % | `SalvageValuePct` | e.g. `5` | |
| Financing type | `FinancingType` | `Cash` / `Loan` / `Lease` (text) | drives IF-branches downstream |
| Loan down payment | `LoanDownPayment` | ₹ | 0 if not a loan |
| Loan interest rate | `LoanInterestRate` | e.g. `11.5` | 0 if not a loan |
| Loan/lease tenure (months) | `FinancingTenureMonths` | count | 0 if cash |
| Lease rental per month | `LeaseRentalPerMonth` | ₹ | 0 if not a lease |
| Warranty years | `WarrantyYears` | years | |
| CMC years | `CmcYears` | years | |
| CMC annual cost | `CmcAnnualCost` | ₹ | |
| AMC annual cost | `AmcAnnualCost` | ₹ | |
| Ramp: months 1-3 % | `RampMonth1to3Pct` | e.g. `50` | `100` if no ramp entered (matches `computeAssessment.ts`'s no-ramp-means-flat-100% default) |
| Ramp: months 4-6 % | `RampMonth4to6Pct` | | |
| Ramp: months 7-12 % | `RampMonth7to12Pct` | | |
| Ramp: year 2+ % | `RampYear2PlusPct` | | |

**Payer mix table** (always exactly 5 rows — `app/forms/payerAndRampKeys.ts`'s fixed
`PAYER_TYPES`: Private cash, Insurance/TPA, Corporate credit, PM-JAY/government,
Other):

| Payer | Share of volume % | Billed tariff (₹) | Realization % (post-deduction) | Collection delay (days) |
|---|---|---|---|---|
| Private cash | `PayerShare1` | `PayerTariff1` | `PayerRealization1` | `PayerDelay1` |
| Insurance/TPA | `PayerShare2` | `PayerTariff2` | `PayerRealization2` | `PayerDelay2` |
| Corporate credit | `PayerShare3` | `PayerTariff3` | `PayerRealization3` | `PayerDelay3` |
| PM-JAY/government | `PayerShare4` | `PayerTariff4` | `PayerRealization4` | `PayerDelay4` |
| Other | `PayerShare5` | `PayerTariff5` | `PayerRealization5` | `PayerDelay5` |

Two derived, still-live cells sit directly below the payer table (formula-appendix.md
§1.1/§1.2 transcribed as `SUMPRODUCT`, not five separate manually-summed terms):

```
BilledPerUseWeighted = SUMPRODUCT(PayerShare1:PayerShare5, PayerTariff1:PayerTariff5) / 100
RealizedPerUse       = SUMPRODUCT(PayerShare1:PayerShare5, PayerTariff1:PayerTariff5, PayerRealization1:PayerRealization5) / 10000
```

**Maintenance `costByYearPct` per-year overrides (ISS-19) — corrected 2026-07-14, an
advisor review caught this before ship: this is in scope, not a niche gap.**
`app/advanced/MaintenanceScheduleFields.tsx` is a real, UI-reachable Advanced-mode
control, and both `computeAssessment.ts` and `formulas/monthlySeries.ts` apply it — an
earlier draft of this document called it "out of scope," which would have meant the
Excel model's headline NPV/IRR silently disagreed with the dashboard for any user who
sets one. A "Maintenance overrides (%, blank = use standard schedule)" block sits on
this sheet directly below the derived per-use cells above — one row per projection
year, blank meaning "use the standard ladder." Both the Monthly tab's maintenance-cost
column and the Maintenance Schedule tab's Year-n-cost formula check this override
first (`IF(override<>"", override/100*PurchaseCost, <standard ladder>)`), matching
`computeAssessment.ts`'s own override-takes-precedence logic exactly. Verified via
`tests/exports/workbookPlan.test.ts`'s golden scenario C (override set on two
non-adjacent years) — NPV and every monthly/annual net-cash-flow cell match
`computeAssessment()`/`buildMonthlySeries()` with the override applied.

---

## Tab 2 — Monthly

One row per month of `UsefulLifeYears × 12` (matches `formulas/monthlySeries.ts`'s
`buildMonthlySeries()` exactly — this tab **is** that function's output, expressed as
formulas instead of values). Columns, all formulas:

| Column | Formula (row *n*, month number = *n*) |
|---|---|
| Month # | `=ROW()-<header row>` |
| Year # | `=ROUNDUP([Month #]/12,0)` |
| Ramp % | `=IF([Month #]<=3,RampMonth1to3Pct,IF([Month #]<=6,RampMonth4to6Pct,IF([Month #]<=12,RampMonth7to12Pct,RampYear2PlusPct)))/100` |
| Billed revenue | `=UsagePerDay*BilledPerUseWeighted*WorkingDaysPerMonth*[Ramp %]` — ramped the same as Realized revenue (ISS-29) |
| Realized revenue | `=UsagePerDay*RealizedPerUse*WorkingDaysPerMonth*[Ramp %]` |
| Variable cost | `=UsagePerDay*VariableCostPerUse*WorkingDaysPerMonth*[Ramp %]` |
| Fixed cost | `=FixedCostPerMonth` |
| Maintenance cost | `=IF(INDEX(override_row_for_this_year)<>"",INDEX(...)/100*PurchaseCost,IF([Year #]<=WarrantyYears,0,IF([Year #]<=WarrantyYears+CmcYears,CmcAnnualCost,AmcAnnualCost)))/12` — checks the per-year override (Tab 1) first |
| EMI / lease | `=IF(FinancingType="Cash",0,IF([Month #]<=FinancingTenureMonths,MonthlyPayment,0))` — `MonthlyPayment` is a single named cell on this sheet, `=IF(FinancingType="Loan",-PMT(LoanInterestRate/12/100,FinancingTenureMonths,InitialInvestment-LoanDownPayment),IF(FinancingType="Lease",LeaseRentalPerMonth,0))` (native `PMT`, matching `formulas/emi.ts`'s amortization formula exactly, including its zero-interest straight-division case — `PMT` handles rate=0 the same way) |
| Net cash flow after financing | `=[Realized revenue]-[Variable cost]-[Fixed cost]-[Maintenance cost]-[EMI / lease]` |
| Cash received — Private cash | `=IF([Month #]-CEILING(PayerDelay1/30,1)>=1, INDEX([Realized revenue column], [Month #]-CEILING(PayerDelay1/30,1))*PayerShare1/100, 0)` |
| Cash received — Insurance/TPA | same pattern with `PayerDelay2`/`PayerShare2` |
| Cash received — Corporate credit | same pattern with `PayerDelay3`/`PayerShare3` |
| Cash received — PM-JAY/government | same pattern with `PayerDelay4`/`PayerShare4` |
| Cash received — Other | same pattern with `PayerDelay5`/`PayerShare5` |
| Cash received — Total | `=SUM(` the five payer columns on this row `)` |

The sheet has `UsefulLifeYears*12 + MAX(payer collection delays in months)` rows so
every payer's shifted cash lands somewhere on the sheet (mirrors
`formulas/dso.ts`'s `cashReceivedByMonth()` extending past the input series length —
see formula-appendix.md §1.4's "never truncate" rule). Rows beyond the input horizon
have blank Billed/Realized/Variable/Fixed/Maintenance/EMI cells (no operating activity
after useful life ends) but still resolve a Cash received figure for revenue earned
in the final in-horizon months.

---

## Tab 3 — Annual Summary

One row per year of `UsefulLifeYears`. Every figure is a `SUM` over that year's 12
rows on the Monthly tab — never a re-derivation:

| Column | Formula |
|---|---|
| Year | `1..UsefulLifeYears` |
| Billed revenue | `=SUM(Monthly!<year's 12 billed-revenue cells>)` |
| Realized revenue | `=SUM(Monthly!<...realized revenue...>)` |
| Operating cost (variable+fixed+maintenance) | `=SUM(Monthly!<variable>)+SUM(Monthly!<fixed>)+SUM(Monthly!<maintenance>)` |
| EMI / lease | `=SUM(Monthly!<emi/lease>)` |
| Net cash flow after financing | `=SUM(Monthly!<net cash flow after financing>)` |
| Cumulative cash position | `=[prior year's cumulative]-InitialInvestment` for year 1's "prior," else `=[prior row]+[this row's net cash flow]` |

Below the year rows, three named summary cells:

```
NPV = NPV(DiscountRate/100, [Net cash flow after financing, year 1..UsefulLifeYears]) - InitialInvestment
IRR = IRR({-InitialInvestment, [Net cash flow after financing, year 1..UsefulLifeYears]})
```

Both use Excel's native `NPV`/`IRR` functions directly against the annual net-cash-
flow row — the same accrual (realized-revenue) series `computeAssessment.ts` feeds
its own `npv()`/`irr()` calls (per `agent-build-plan.md` Phase 6's PBA-3 note: NPV/IRR
use the accrual series; the DSO-extended cash-received series feeds the working-
capital metric only, not headline NPV/IRR — the Monthly tab's Cash received columns
exist for transparency/traceability, not because NPV/IRR are computed from them).

`IRR` is left blank with a text note ("Undefined for this cash-flow pattern — no
rate makes NPV cross zero") if Excel's `IRR()` returns `#NUM!` — matching
`formulas/irr.ts`'s own `null`-on-undefined contract; the generator checks
`computeAssessment.ts`'s own `result.irr === null` before writing this cell, rather
than relying on Excel's `#NUM!` error text to communicate the same thing.

---

## Tab 4 — Break-even Analysis

A handful of named cells, transcribed from formula-appendix.md §2.1/§2.2:

```
ContributionPerUse = RealizedPerUse - VariableCostPerUse
BreakEvenUsagePerDay = IF(ContributionPerUse<=0, "Undefined — contribution margin is zero or negative",
                          FixedCostPerMonth/ContributionPerUse/WorkingDaysPerMonth)
ExpectedUsagePerDay = UsagePerDay
ClearsBreakEven = IF(ISNUMBER(BreakEvenUsagePerDay), ExpectedUsagePerDay>=BreakEvenUsagePerDay, "N/A")
```

---

## Tab 5 — Maintenance Schedule

One row per year, transcribed from formula-appendix.md §2.3, checking Tab 1's
per-year override first (see Tab 1's note for why this is in scope):

```
Year n coverage = IF(override_n<>"","Override",IF(n<=WarrantyYears,"Warranty",IF(n<=WarrantyYears+CmcYears,"CMC","AMC")))
Year n cost     = IF(override_n<>"",override_n/100*PurchaseCost,IF(n<=WarrantyYears,0,IF(n<=WarrantyYears+CmcYears,CmcAnnualCost,AmcAnnualCost)))
```

---

## Tab 6 — Charts

**Deferred, not silently dropped (2026-07-13 scoping call, see `ISSUES.md`).** The
original plan called for two rasterized chart images (cumulative cash flow,
break-even comparison), matching SPEC.md §29.3's literal "Charts" line item. Given
this phase's real bar is the live-formula requirement (the Definition of Done is
about formulas, not images) and no headless Excel/LibreOffice is available in this
environment to verify an embedded image renders correctly, chart images are deferred
to a fast-follow rather than shipped half-verified. In their place, this tab is a
**data table** — the same year-by-year cumulative cash-flow figures and break-even
comparison numbers the Annual Summary/Break-even tabs already compute — which is
arguably *more* useful in a spreadsheet a finance person can already re-chart
themselves, and costs no additional formula-correctness risk.

---

## Tab 7 — Formula Notes

Plain-language restatement of every formula used above, one row per named formula,
sourced verbatim from `report-templates/formula-appendix.md` §1-§4 (never
hand-restated in a way that could drift from that file — the generator reads
directly from a small formula-notes content object shared with the Word generator).

---

## Explicitly out of scope for Phase 8 (per `agent-build-plan.md`)

- **Sensitivity analysis tab** — SPEC.md §29.3 lists it, but `formulas/sensitivity.ts`
  is still Phase 9 scope (`runScenario()` is a stub the discrete/continuous scenario
  features haven't been built against yet). Omitted rather than built against an
  unfinished formula, per Phase 8's own "Depends on: Phase 2" (formulas must exist
  first).
- **Assumptions Summary.pdf** — SPEC.md §29.2 marks this "optional later."
