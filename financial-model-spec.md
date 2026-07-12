# financial-model-spec.md — Investment Outlook score, EAC, discounted payback, and the automatic actionable-insight engine

This is the "v0.5 — Formula and Model Spec" artifact SPEC.md §38 named but never
produced. It exists because `agent-build-plan.md` Phase 2 found that SPEC.md §21/§11.2
name the Investment Outlook 0–100 score, EAC (Equivalent Annual Cost), and discounted
payback as required outputs, but §31 (the formula list) has no corresponding formula for
any of them — this document is that missing formula spec, reviewed and approved by Jay
on 2026-07-07 (resolves `ISSUES.md` ISS-10).

**Principle this document exists to protect (SPEC.md §21.5):** a score is useful
visually, but it must never hide the assumptions it's built on. Everything below is
built from numbers the user already sees elsewhere on the dashboard (IRR, payback,
break-even, EMI) — the score is a weighted lens on those numbers, not a separate,
opaque calculation. "Proprietary" (Phase 3's branding/copy) refers to the presentation
and naming, not to the math being hidden from the team building it.

---

## 1. The Investment Outlook score

### 1.1 Inputs consumed

The score is computed entirely from values already produced by other `/formulas`
modules — no new raw inputs, no new research/benchmark numbers:

- `irr` (`formulas/irr.ts`) and `discountRate` (`equipment-data/common-assumptions.json`)
- `npv` (`formulas/npv.ts`) and `initialInvestment`
- discounted payback period in years (§2 below) and `usefulLifeYears`
  (`equipment-data/<type>.json`)
- `monthlyEmi` (`formulas/emi.ts`) and monthly operating cash flow before EMI (existing
  revenue/cost formula output)
- `breakEvenUsagePerDay` (`formulas/breakEven.ts`) and the user's expected `usagePerDay`

If financing mode is **cash purchase** (no loan), the Financing Resilience component
(§1.2.3) does not apply — see §1.6 for how the weight redistributes.

### 1.2 Four sub-scores, each normalized to 0–100

Each sub-score is computed independently, then combined by weight (§1.3). Each
normalization is a **designed methodology, not a sourced benchmark** — the anchor points
below are deliberate judgment calls (documented so they can be revisited), not numbers
that need a `data-requirements.md` citation.

#### 1.2.1 Return Strength — weight 35%

Measures how far the investment's return sits above or below the cost of capital.

```text
spread = irr - discountRate   (percentage points, e.g. 18.2 - 12.5 = 5.7)

score = 0                                  if spread <= -5
score = (spread + 5) / 5 * 50              if -5 < spread <= 0
score = 50 + (spread / 10) * 50            if 0 < spread <= 10
score = 100                                 if spread > 10
```

**Fallback when `irr()` throws** (SPEC.md's IRR formula is undefined for cash-flow
patterns without both a positive and negative value — see `formulas/irr.ts`): use the
net-return ratio instead of the spread.

```text
netReturnRatio = npv / initialInvestment

score = 0                                        if netReturnRatio <= -0.2
score = (netReturnRatio + 0.2) / 0.2 * 50        if -0.2 < netReturnRatio <= 0
score = 50 + (netReturnRatio / 0.5) * 50         if 0 < netReturnRatio <= 0.5
score = 100                                       if netReturnRatio > 0.5
```

#### 1.2.2 Speed to Payback — weight 25%

Measures how quickly the investment repays itself relative to the equipment's own
useful life — a payback of 4 years means something very different for a 5-year-life
ultrasound machine than a 15-year-life MRI.

```text
ratio = discountedPaybackYears / usefulLifeYears

score = 0                                  if ratio >= 1.0
score = (1.0 - ratio) / 0.5 * 50           if 0.5 <= ratio < 1.0
score = 50 + ((0.5 - ratio) / 0.3) * 50    if 0.2 <= ratio < 0.5
score = 100                                 if ratio < 0.2
```

If discounted payback never occurs within `usefulLifeYears` (cumulative discounted cash
flow never turns positive), treat `ratio` as `>= 1.0` → score `0`. Don't throw — a score
of 0 on this component is itself the correct, informative answer.

#### 1.2.3 Financing Resilience — weight 20% (cash purchases: weight 0, see §1.6)

Measures whether debt service is comfortably covered by operating cash flow — a
DSCR-style ratio. **SPEC.md never mentions DSCR despite Advanced Mode's financing
section (§11.C) covering loan terms in detail** (flagged as an open question,
`agent-build-plan.md` Phase 2); this component is how DSCR enters the product, without
inventing a separate, unexplained metric on the dashboard.

```text
dscr = monthlyOperatingCashFlowBeforeEmi / monthlyEmi

score = 0                              if dscr <= 1.0
score = (dscr - 1.0) / 0.5 * 50        if 1.0 < dscr <= 1.5
score = 50 + ((dscr - 1.5) / 0.5) * 50 if 1.5 < dscr <= 2.0
score = 100                             if dscr > 2.0
```

The 1.0 / 1.5 / 2.0 anchor points come from common commercial-lending DSCR covenant
conventions (lenders commonly require ≥1.25–1.5×) — this is an industry rule-of-thumb
being used as a scoring anchor, not an Indian-healthcare-specific researched figure, and
must not be presented in the UI as a cited benchmark.

`dscr <= 1.0` means operating cash flow doesn't even cover the EMI — a genuine red flag
regardless of how good IRR looks, which is exactly the failure mode this component
exists to catch (this is the "EMI eating into revenue" concern raised directly).

#### 1.2.4 Operational Margin of Safety — weight 20%

Measures the cushion between expected usage and the usage level at which the equipment
stops being profitable.

```text
cushion = (usagePerDay - breakEvenUsagePerDay) / usagePerDay

score = 0                              if cushion <= 0
score = (cushion / 0.20) * 50          if 0 < cushion <= 0.20
score = 50 + ((cushion - 0.20) / 0.30) * 50   if 0.20 < cushion <= 0.50
score = 100                             if cushion > 0.50
```

### 1.3 Composite score

```text
compositeScore = 0.35 * returnStrength
               + 0.25 * speedToPayback
               + 0.20 * financingResilience
               + 0.20 * operationalMarginOfSafety
```

Round to the nearest integer for display (e.g. "78 / 100").

### 1.4 Bands

```text
Strong    75–100
Moderate  55–74
Caution   35–54
Weak      0–34
```

These exact thresholds are what `agent-build-plan.md` Phase 4-C's chart
conditional-coloring must key off of — the score and the charts must never tell
contradictory stories about the same underlying numbers.

### 1.5 Explainability — the "why is it red/yellow/green" driver

Do not hand-author separate driver copy. The driver is **mechanically derived**: the
sub-score with the lowest value is the primary driver, reusing the risk-callout pattern
SPEC.md §21.4 already specifies ("Main risk: ...").

```text
driver = the component (of the 4, or 3 for cash purchases) with the minimum score
```

Ties broken in this fixed order: Return Strength → Speed to Payback → Financing
Resilience → Operational Margin of Safety (arbitrary but must be deterministic — a tied
result must always name the same driver on repeated identical runs, per
`agent-build-plan.md` Phase 9's determinism requirement, which applies here too).

Per-component copy template (Phase 3 owns final wording; this defines which template
fires and from what data):

```text
"Main risk: [component's plain-language name] is [Weak/Caution] — [one clause
 restating the actual number, e.g. 'EMI is consuming 68% of monthly operating cash
 flow' for Financing Resilience, or 'expected usage is only 4% above the break-even
 level' for Operational Margin of Safety]."
```

If the driver component's own score is `>= 55` (Moderate or better), show a positive
variant instead ("Main strength: ...") rather than manufacturing a risk narrative when
nothing is actually weak — a composite of 78 with every sub-score above 60 should not be
forced into a "risk" framing.

### 1.6 Edge cases

- **Cash purchase (no loan):** Financing Resilience does not apply (no EMI exists).
  Redistribute its 20% weight proportionally across the other three:
  Return Strength 43.75%, Speed to Payback 31.25%, Operational Margin of Safety 25%
  (each original weight ÷ 0.8). Do not silently score Financing Resilience as 100 — that
  would misrepresent "not applicable" as "excellent."
- **`irr()` throws:** use the profitability-index fallback (§1.2.1).
- **Break-even undefined** (`breakEvenUsagePerDay` throws when contribution per use is
  ≤ 0 — see `formulas/breakEven.ts`): Operational Margin of Safety scores `0` — the
  investment loses money on every unit of usage, which is the correct interpretation,
  not an error state to hide.
- **`usagePerDay` is 0:** `cushion` is undefined (division by zero) — score `0`
  directly, don't compute the ratio.
- **`discountRate` is a range, not a point value** (`common-assumptions.json` stores
  low/typical/high, 11.1–14.1%): use `typical` (12.5%) for the score unless the user has
  overridden it via the Advanced settings pane (`agent-build-plan.md` Phase 7); if
  overridden, use their value.
- **`targetIrr` is `"Unavailable"`** (confirmed unresearchable, see
  `equipment-data/common-assumptions.json`): this component doesn't consume
  `targetIrr` directly (it uses `discountRate` as the hurdle), so this is not a
  blocker. `targetIrr`'s only UI role is a suggested starting value
  (`discountRate + 300–500bps`), separate from this scoring model. **Resolved
  2026-07-12** (UI assurance audit F1): this heuristic is now auto-filled at the
  wizard-field level, not only in the Phase 7 Advanced settings pane — see
  `app/forms/wizard-state.md` §2 for why (an unresourced required field would
  otherwise have blocked Basic Mode's step gate).

### 1.7 Worked example (illustrative numbers only, not a real equipment scenario)

```text
irr = 18.2%, discountRate = 12.5%  → spread = 5.7 → Return Strength = 50 + 5.7/10*50 = 78.5
discountedPaybackYears = 3.8, usefulLifeYears = 10 → ratio = 0.38
  → Speed to Payback = 50 + (0.5-0.38)/0.3*50 = 70
monthlyOperatingCashFlowBeforeEmi = 4,50,000, monthlyEmi = 3,20,000 → dscr = 1.41
  → Financing Resilience = (1.41-1.0)/0.5*50 = 41
usagePerDay = 25, breakEvenUsagePerDay = 20.5 → cushion = 0.18
  → Operational Margin of Safety = (0.18/0.20)*50 = 45

compositeScore = 0.35*78.5 + 0.25*70 + 0.20*41 + 0.20*45
              = 27.475 + 17.5 + 8.2 + 9.0 = 62.2 → 62 → "Moderate"

Driver = Financing Resilience (41, the lowest) → "Main risk: EMI is consuming a large
share of monthly operating cash flow relative to lenders' typical comfort margin
(DSCR 1.41×)."
```

---

## 2. Equivalent Annual Cost (EAC) and Discounted Payback

Unlike §1, these are standard finance formulas, not a designed/weighted methodology —
no Jay-review-before-code requirement, just precise definitions so `formulas/roi.ts` (or
a new `eac.ts`) implements them correctly.

### 2.1 Discounted payback period

```text
Find the smallest period p such that:
  sum(cashFlow[t] / (1 + discountRate/100)^t  for t = 1..p) >= initialInvestment

discountedPaybackYears = (p - 1) + (shortfallAtPeriodP-1 / discountedCashFlowAtPeriodP)
```

(Linear interpolation within the period where cumulative discounted cash flow crosses
zero — the same interpolation style already used in `formulas/irr.ts`'s bisection.) If
cumulative discounted cash flow never reaches `initialInvestment` within the projection
horizon, discounted payback is undefined — return `null`/`Infinity`, and §1.2.2 treats
that as `ratio >= 1.0` (score 0), not a thrown error.

### 2.2 Equivalent Annual Cost

```text
annuityFactor = (1 - (1 + discountRate/100)^-usefulLifeYears) / (discountRate/100)

EAC = NPV(costs only, i.e. initialInvestment + all operating/maintenance/financing
      costs, discounted, excluding revenue) / annuityFactor
```

EAC answers "what is the equivalent flat annual cost of owning this equipment," useful
for comparing financing structures (cash vs. loan vs. lease) or comparing equipment
options with different useful lives — it is a cost-comparison output, not an input to
the Investment Outlook score in §1.

**Edge case:** `discountRate = 0` → `annuityFactor = usefulLifeYears` (the limit of the
formula as the rate approaches zero), not a division-by-zero error.

---

## 3. Discount rate and target IRR — already resolved, referenced here for completeness

No new research needed. `equipment-data/common-assumptions.json` already has:

- **Discount rate: 12.5% typical** (range 11.1–14.1%), sourced from listed Indian
  hospital-chain WACC (Apollo, Fortis, Max, HCG, KMC, Narayana — see
  `data-requirements.md` §17.1). Static, editable, stored in the repo — not fetched from
  any external API.
- **Target IRR / hurdle rate: confirmed unresearchable** after two research passes (no
  public Indian hospital/investor hurdle-rate benchmark exists —
  `data-requirements.md` §17.2). UI guidance: suggest `discountRate + 300–500bps` as a
  starting point, explicitly labeled a suggestion, never presented as a researched
  number.

---

## 4. Automatic actionable insight — price-increase suggestion

**Where this lives:** a new sub-section of `agent-build-plan.md` Phase 9 (scenario /
sensitivity), reusing `formulas/sensitivity.ts`'s existing `runScenario` machinery — not
a new phase. Framed as a passive, threshold-gated insight, distinct from Phase 9's
user-driven discrete-scenario and continuous-sensitivity-slider features.

### 4.1 Goal

Surface **at most one** actionable suggestion — "raise your per-scan tariff by a
realistic amount, starting at a realistic future point, and your payback improves
meaningfully" — but only when the improvement is large enough to be worth a user's
attention. Silence (no card shown) is the correct, common output, not a fallback state.

### 4.2 No live "double calculation" concern

Formulas are pure and cheap (confirmed: 26 existing formula tests run in under a
millisecond combined). Running ~15 extra scenario evaluations in the background,
alongside the same live-recalculation pass Phase 4-G already runs on every input change,
carries no meaningful performance cost and needs no separate loading state.

### 4.3 The grid

```text
testDeltas = [2%, 5%, 8%, 10%, 15%]   (of current billedTariffPerUse — percentage-based,
                                        not a fixed rupee amount, so it scales correctly
                                        across a ₹500 ultrasound scan and a ₹7,500 MRI
                                        scan alike)

testStartYears = [1, 2, 3], each capped at floor(usefulLifeYears / 2)
                 (never suggest a price change in the back half of the equipment's life)
```

For each of the resulting (delta, startYear) combinations (up to 5 × 3 = 15), re-run the
payback formula with `billedTariffPerUse` increased by `delta` from `startYear` onward,
and compute:

```text
paybackImprovementMonths = (baselinePaybackYears - scenarioPaybackYears) * 12
```

### 4.4 Materiality gate

```text
qualifies = paybackImprovementMonths >= 6
```

(Approved 2026-07-07 — a two-year CAPEX decision shouldn't surface a "win" measured in
weeks; six months is the smallest improvement worth a user's attention.) The 15% cap on
`testDeltas` above is itself the "don't suggest an unrealistic price hike" ceiling — no
combination in the grid can ever propose more than a 15% increase.

### 4.5 Selection — "cheapest win"

Among every `(delta, startYear)` combination that clears the gate, pick:

```text
1. smallest delta
2. tie-break: earliest startYear
3. tie-break: largest paybackImprovementMonths
```

This deliberately optimizes for "the smallest ask that still produces a real result,"
not "the single best-looking number" — a suggestion to raise price by 15% starting Year
1 might show a bigger raw improvement than one needing only 5% starting Year 2, but the
5% suggestion is the more useful, more actionable insight.

### 4.6 Null case

If zero combinations in the grid clear the 6-month gate, return `null`. The dashboard
shows no insight card at all — this is the expected, common result, not an error or an
empty state to fill with something else.

### 4.7 Worked example (illustrative)

```text
billedTariffPerUse = ₹1,500, baselinePaybackYears = 4.2, usefulLifeYears = 10
  (testStartYears capped at floor(10/2) = 5, so [1, 2, 3] all valid)

Grid results (paybackImprovementMonths for each combination) — illustrative:
  2% / Year 1  → 2.1 months   (fails gate)
  5% / Year 1  → 5.4 months   (fails gate)
  5% / Year 2  → 4.8 months   (fails gate)
  8% / Year 1  → 8.9 months   (qualifies)
  8% / Year 2  → 7.6 months   (qualifies)
  10% / Year 1 → 11.2 months  (qualifies)
  ...

Selection: smallest qualifying delta = 8%; of the two 8% combinations, earliest
startYear = Year 1.

Insight shown: "Increasing your per-scan charge by ₹120 (8%) starting Year 1 would
improve your payback period by about 9 months (from 4.2 years to 3.45 years)."
```

Rupee amounts round to the nearest ₹5 for display (`₹1,500 × 1.08 = ₹1,620`, delta
`₹120` — already clean; round only when the raw delta isn't).

### 4.8 Determinism requirement

Same as `agent-build-plan.md` Phase 9's existing rule: running this computation twice
against identical inputs must produce an identical result (same insight, or the same
`null`). No randomness, no floating-point-order-dependent iteration.

---

## Definition of Done for this document

- [x] Investment Outlook score: inputs, four sub-score formulas, weights, composite
      formula, bands, explainability rule, edge cases — all defined with concrete
      numbers, reviewed and approved by Jay (2026-07-07).
- [x] EAC and discounted payback: standard formulas defined precisely.
- [x] Discount rate / target IRR: confirmed already resolved via
      `equipment-data/common-assumptions.json`, no new research needed.
- [x] Automatic actionable insight: grid, materiality gate (6 months), price cap (15%),
      selection rule, null case, all approved by Jay (2026-07-07).
- [ ] `agent-build-plan.md` Phase 2's blocked score/EAC/discounted-payback stub can now
      be implemented against §1/§2 of this document.
- [ ] `agent-build-plan.md` Phase 9 gets a new "automatic actionable insights"
      sub-section implementing §4.
- [ ] `agent-build-plan.md` Phase 4-C's chart conditional-coloring thresholds must match
      §1.4's bands exactly.
