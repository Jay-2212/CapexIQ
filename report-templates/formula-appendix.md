# Formula Appendix

This is the authoritative, plain-language reference for every formula in `/formulas`.
Every entry below matches the actual implementation exactly (file, function, and
logic) — this document is what the code is tested against, not the other way around.
Terms in **bold** are defined in `content/glossary.md`; this file doesn't redefine them.

Ships as an appendix on the Word report and as the "Formulas" sheet in the Excel
export, so a CFO or auditor can trace any headline number back to its exact
calculation without reading TypeScript.

---

## 1. Revenue

### 1.1 Billed monthly revenue
`formulas/revenue.ts` — `billedMonthlyRevenue()`

```text
Billed monthly revenue = Usage per day × Average billed revenue per use × Working days per month
```

### 1.2 Realized revenue per use
`formulas/realization.ts` — `realizedRevenuePerUse()`

```text
Realized revenue per use = Σ over payer types of:
  (payer's share of volume ÷ 100) × payer's billed tariff × (payer's realization % ÷ 100)
```

A volume-weighted average across every payer type in the mix (private cash,
insurance/TPA, corporate credit, PM-JAY/government scheme, other), each with its own
tariff and **realization %**.

### 1.3 Monthly realized revenue
`formulas/revenue.ts` — `monthlyRealizedRevenue()`

```text
Monthly realized revenue = Usage per day × Realized revenue per use × Working days per month
```

### 1.4 Cash received by month
`formulas/dso.ts` — `cashReceivedByMonth()`

```text
For each payer type, that payer's share of a month's realized revenue is added to the
cash-received total in the month it's actually collected:

  collection month = revenue month + ceil(payer's days-to-collect ÷ 30)
```

Each payer type can have a different **DSO**, so a single month's realized revenue
splits across several future collection months rather than landing all at once. The
output series extends past the input series by the largest payer's collection delay,
in months.

**Consuming this series (added 2026-07-13, PBA-3):** always sum/discount the full
extended series when computing NPV, IRR, the annual cash-flow summary, or the
working-capital gap — never truncate it to the original projection-horizon length
first. Cash is conserved over the full series (total received = total realized
revenue); truncating drops the tail and turns a temporary collection delay into what
looks like a permanent loss. See `SPEC.md` §14.4 for the full contract.

---

## 2. Costs

### 2.1 Contribution per use
`formulas/breakEven.ts` — `contributionPerUse()`

```text
Contribution per use = Realized revenue per use − Variable cost per use
```

### 2.2 Break-even usage per day
`formulas/breakEven.ts` — `breakEvenUsagePerDay()`

```text
Break-even usage per day = Fixed monthly cost ÷ Contribution per use ÷ Working days per month
```

**Undefined when contribution per use is zero or negative** — the formula throws
rather than returning a misleading number, since there is no usage level at which a
loss-making contribution margin breaks even. The Investment Outlook score (§5) treats
this case as an Operational Margin of Safety score of 0, not an error to hide.

### 2.3 Maintenance schedule (warranty → CMC → AMC)
`formulas/maintenance.ts` — `maintenanceScheduleForYears()`

```text
For each year of the projection:
  year ≤ warranty years           → covered by warranty, cost = 0
  warranty years < year ≤          → covered by CMC, cost = CMC annual cost
    (warranty years + CMC years)
  otherwise                        → covered by AMC, cost = AMC annual cost
```

Produces one schedule entry per projection year, so the **maintenance cliff** (the
cost jump the moment warranty ends) is visible year-by-year rather than averaged away.

### 2.4 Pre-operative interest
`formulas/launchDelay.ts` — `preOperativeInterest()`

```text
Pre-operative interest = Principal × (Annual interest rate ÷ 100 ÷ 12) × Launch delay in months
```

Simple (non-compounding) monthly interest accrued during the **launch delay** window,
before any revenue exists to offset it.

---

## 3. Financing and depreciation

### 3.1 EMI (Equated Monthly Installment)
`formulas/emi.ts` — `monthlyEmi()`

```text
If annual interest rate = 0:
  EMI = Principal ÷ Tenure in months

Otherwise:
  monthlyRate = Annual interest rate ÷ 12 ÷ 100
  EMI = Principal × monthlyRate × (1 + monthlyRate)^tenureMonths
        ÷ ((1 + monthlyRate)^tenureMonths − 1)
```

Standard amortizing-loan formula, with the zero-interest case handled as a straight
division rather than a division by zero.

### 3.2 Straight-line depreciation
`formulas/depreciation.ts` — `annualStraightLineDepreciation()`

```text
Annual depreciation = (Purchase cost − Salvage value) ÷ Useful life
```

Straight-line only for v1, per SPEC.md §17 — an equal amount expensed every year of
**useful life**, no accelerated-depreciation option yet.

---

## 4. Core financial outputs

### 4.1 NPV (Net Present Value)
`formulas/npv.ts` — `npv()`

```text
NPV = (Σ over each period t of: cash flow[t] ÷ (1 + discount rate ÷ 100)^t) − Initial investment
```

### 4.2 IRR (Internal Rate of Return)
`formulas/irr.ts` — `irr()`

```text
IRR = the discount rate at which NPV = 0
```

Solved numerically by bisection search between −99% and 1,000%, narrowing until NPV is
within 0.000001 of zero (or 100 iterations elapse). **Undefined and throws** when the
cash-flow series (initial investment plus all period cash flows) doesn't contain both
a positive and a negative value, or when no sign change in NPV exists across the
search range — there is no rate that makes an all-positive or all-negative series
break even. The Investment Outlook score (§5.1) falls back to a net-return-ratio
calculation in this case rather than propagating the error to the dashboard.

### 4.3 ROI (Return on Investment)
`formulas/roi.ts` — `roi()`

```text
ROI = (Annual net return ÷ Initial investment) × 100
```

Takes a `view` parameter (billed / realized / cash-flow) purely as a label — the
caller is responsible for passing in the correctly-computed annual net return for
that view; the formula itself doesn't change based on which view is selected.

### 4.4 Payback period (simple)
`formulas/roi.ts` — `paybackPeriod()`

```text
Payback period = Initial investment ÷ Annual net cash flow
```

Returns `Infinity` if annual net cash flow is zero or negative — the investment never
pays back under a flat-annual-cash-flow assumption.

### 4.5 Payback period (from a multi-year cash-flow series)
`formulas/roi.ts` — `paybackPeriodFromCashFlows()`

```text
Find the smallest year y such that:
  cumulative cash flow through year (y − 1) + cash flow[y] ≥ Initial investment

Payback period = (y − 1) + (Initial investment − cumulative cash flow through year (y − 1)) ÷ cash flow[y]
```

Linear interpolation within the year the cumulative cash flow crosses the initial
investment. Returns `Infinity` if cumulative cash flow never reaches the initial
investment across the whole series.

### 4.6 Discounted payback period
`formulas/discountedPayback.ts` — `discountedPaybackPeriod()`

```text
Same as §4.5, but each year's cash flow is first discounted:
  discounted cash flow[t] = cash flow[t] ÷ (1 + discount rate ÷ 100)^t
```

Always longer than (or equal to) simple payback, since discounting reduces the value
of every future cash flow. Returns `null` (not `Infinity`) if cumulative discounted
cash flow never reaches the initial investment — the Investment Outlook score (§5.1.2)
treats `null` the same way it treats a ratio of 1.0 or more: a Speed to Payback score
of 0.

**On the `Infinity`/`null` split (added 2026-07-13, capexiq-prebuild-assurance PBA-7):**
§4.4/§4.5's `Infinity` and §4.6's `null` are two *different, deliberate* sentinels for
"never pays back," not an inconsistency to unify. `Infinity` is required by
`formulas/actionableInsight.ts`'s subtraction-based comparison
(`baselinePaybackYears − scenarioPaybackYears`) — `Infinity` propagates correctly
through that arithmetic (a scenario that still never pays back correctly fails the
materiality gate); if this were `null` instead, `null` coerces to `0` in JavaScript
arithmetic and would silently produce a wrong, false-positive "improvement." `null` is
required by `investmentOutlookScore.ts`'s explicit `=== null` branch. **Do not unify
these into one sentinel** — that was considered and rejected specifically because of
the `actionableInsight.ts` dependency above.

What *is* a real hazard: `JSON.stringify(Infinity)` silently produces the string
`"null"` — indistinguishable from `discountedPaybackPeriod`'s genuine `null`, or any
other explicit "unavailable" marker, if either payback value is ever serialized (a
scenario fixture, a future export intermediate format, anything touching
`localStorage` — though per this project's browser-storage rules, calculated results
should never be persisted there in the first place). Any future serialization
boundary must encode `Infinity` as an explicit, distinct marker (e.g., a string
`"never"` or a `neverPaysBack: true` flag) before calling `JSON.stringify` — never
rely on `JSON.stringify`'s default behavior for a value that can be `Infinity`. See
`agent-build-plan.md` Phase 6/8 for the corresponding checklist item.

### 4.7 EAC (Equivalent Annual Cost)
`formulas/eac.ts` — `equivalentAnnualCost()`

```text
annuityFactor = (1 − (1 + discount rate ÷ 100)^(−useful life)) ÷ (discount rate ÷ 100)
              = useful life                                       [if discount rate = 0]

EAC = (Initial investment + Σ over each year of: cost[year] ÷ (1 + discount rate ÷ 100)^year) ÷ annuityFactor
```

Converts the full discounted lifetime cost of owning and running the equipment
(purchase, installation, operating, maintenance, financing — costs only, no revenue)
into a single comparable annual figure. Used for comparing financing structures or
equipment options with different useful lives against each other, not as an input to
the Investment Outlook score.

---

## 5. Investment Outlook score

`formulas/investmentOutlookScore.ts` — `investmentOutlookScore()`. Full methodology,
worked example, and design rationale in `financial-model-spec.md` §1 — this section is
the condensed formula reference; that document is the one to read for *why* each
anchor point was chosen.

### 5.1 Four sub-scores, each normalized to 0–100

**Return Strength (weight 35%)**

```text
If IRR is defined:
  spread = IRR − Discount rate
  score = 0                          if spread ≤ −5
  score = (spread + 5) ÷ 5 × 50      if −5 < spread ≤ 0
  score = 50 + (spread ÷ 10) × 50    if 0 < spread ≤ 10
  score = 100                        if spread > 10

If IRR is undefined (formulas/irr.ts throws), fall back to:
  netReturnRatio = NPV ÷ Initial investment
  score = 0                                  if netReturnRatio ≤ −0.2
  score = (netReturnRatio + 0.2) ÷ 0.2 × 50  if −0.2 < netReturnRatio ≤ 0
  score = 50 + (netReturnRatio ÷ 0.5) × 50   if 0 < netReturnRatio ≤ 0.5
  score = 100                                 if netReturnRatio > 0.5
```

**Speed to Payback (weight 25%)**

```text
ratio = Discounted payback years ÷ Useful life years   (or treat as ≥ 1 if payback is null)

score = 0                                  if ratio ≥ 1.0
score = (1.0 − ratio) ÷ 0.5 × 50           if 0.5 ≤ ratio < 1.0
score = 50 + ((0.5 − ratio) ÷ 0.3) × 50    if 0.2 ≤ ratio < 0.5
score = 100                                 if ratio < 0.2
```

**Financing Resilience (weight 20% — 0% for cash purchases, see §5.3)**

```text
DSCR = Monthly operating cash flow before EMI ÷ Monthly EMI

score = 0                              if DSCR ≤ 1.0
score = (DSCR − 1.0) ÷ 0.5 × 50        if 1.0 < DSCR ≤ 1.5
score = 50 + ((DSCR − 1.5) ÷ 0.5) × 50 if 1.5 < DSCR ≤ 2.0
score = 100                             if DSCR > 2.0
```

**Operational Margin of Safety (weight 20%)**

```text
cushion = (Usage per day − Break-even usage per day) ÷ Usage per day
          (score = 0 directly if usage per day = 0, or if break-even usage is undefined)

score = 0                                     if cushion ≤ 0
score = (cushion ÷ 0.20) × 50                 if 0 < cushion ≤ 0.20
score = 50 + ((cushion − 0.20) ÷ 0.30) × 50   if 0.20 < cushion ≤ 0.50
score = 100                                    if cushion > 0.50
```

### 5.2 Composite score

```text
Composite = 0.35 × Return Strength + 0.25 × Speed to Payback
          + 0.20 × Financing Resilience + 0.20 × Operational Margin of Safety

Rounded to the nearest integer for display.
```

### 5.3 Cash-purchase weight redistribution

If financing type is cash (no EMI, no DSCR), Financing Resilience is dropped and its
20% weight redistributes proportionally across the other three (each original weight
÷ 0.8):

```text
Return Strength 43.75%, Speed to Payback 31.25%, Operational Margin of Safety 25%
```

Never scored as a silent 100 — that would misrepresent "not applicable" as "excellent."

### 5.4 Bands

```text
Strong    75–100
Moderate  55–74
Caution   35–54
Weak      0–34
```

### 5.5 Driver (explainability)

The sub-score with the lowest value is the mechanically-derived driver — never
hand-authored. Ties broken in fixed order: Return Strength → Speed to Payback →
Financing Resilience → Operational Margin of Safety. If the driver's own score is ≥
55, it's framed as a strength ("Main strength: ...") rather than a risk.

---

## 6. Scenario analysis and the automatic actionable insight

### 6.1 Scenario run
`formulas/sensitivity.ts` — `runScenario()`

For each projection year, computes annual net cash flow (applying a tariff increase
from a given start year onward, if one is specified), then derives ROI, payback years,
NPV, and IRR (`null` if undefined) from that cash-flow series — the same underlying
formulas as §1-§4, run against a hypothetical set of assumptions instead of the
baseline.

### 6.2 Automatic actionable price-increase insight
`formulas/actionableInsight.ts` — `actionablePriceIncreaseInsight()`. Full rationale
and worked example in `financial-model-spec.md` §4.

```text
Test grid: price increases of [2%, 5%, 8%, 10%, 15%] of current billed tariff,
           starting in year [1, 2, 3], each capped at floor(useful life years ÷ 2)

For each (delta, start year) combination:
  paybackImprovementMonths = (baseline payback years − scenario payback years) × 12
  qualifies if paybackImprovementMonths ≥ 6

Among qualifying combinations, select:
  1. smallest price-increase delta
  2. tie-break: earliest start year
  3. tie-break: largest payback improvement

Returns null if no combination qualifies — the expected, common result.
```

Rupee amounts round to the nearest ₹5 for display.
