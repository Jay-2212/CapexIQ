# Methodology

This explains, in plain language, how this tool turns the numbers you enter into the
results on the dashboard. It's the content behind every "Show calculation background"
panel (SPEC.md §22) — written so a hospital administrator or a CFO's finance team can
follow the logic without reading code. For the exact formula behind each step, see
`report-templates/formula-appendix.md`; for term definitions, see
`content/glossary.md`.

All figures below are **illustrative only** — a hypothetical MRI scenario used to show
how the pieces connect, not a real benchmark or recommendation.

---

## 1. From usage to revenue

Everything starts with how much the equipment is used and what it's billed at.

```text
Billed monthly revenue = Usage per day × Billed revenue per use × Working days per month
                        = 25 × ₹7,500 × 25
                        = ₹46,87,500
```

That's the sticker-price view — what you'd bill if every patient paid the full rate in
full, on time. It's what Basic Mode shows by default, because it's the number you can
estimate before you know your exact payer mix.

**Realized revenue** brings in the fact that different payer types (private cash,
insurance/TPA, corporate, government scheme) pay different effective rates, once
scheme discounts and claim disallowances are accounted for:

```text
Realized revenue per use = weighted average, across payer types, of:
  (that payer's share of your volume) × (their billed tariff) × (their realization %)

Monthly realized revenue = Usage per day × Realized revenue per use × Working days per month
                          = ₹42,18,750   [illustrative, at 90% blended realization]
```

Realized revenue is always less than or equal to billed revenue. The gap between them
is real money the hospital never collects — scheme discounts, disallowed claims,
write-offs — not a rounding difference.

## 2. From realized revenue to cash in hand

Realized revenue isn't cash the moment it's earned — each payer type takes a different
number of days to actually pay (**DSO**). A private cash patient might pay same-day; a
government scheme might take 60-90 days.

```text
Cash received in a given month = realized revenue from earlier months, shifted forward
                                  in time according to each payer type's own DSO
```

The gap between cumulative realized revenue and cumulative cash actually received is
the **working capital gap** — the cash a hospital needs to have on hand to bridge the
wait, separate from whether the equipment is profitable on paper.

## 3. Costs

Costs split into two kinds, because they behave differently as volume changes:

```text
Variable cost per use = Consumables + Professional/reporting fee + Other per-use cost
Monthly variable cost = Usage per day × Variable cost per use × Working days per month

Fixed operating cost  = Staff cost + Utilities + Fixed maintenance allocation + Other
```

**Maintenance is not flat over the equipment's life.** It follows a schedule:

```text
Years 1 to (warranty years)                          → covered by warranty, cost ₹0
Years (warranty+1) to (warranty + CMC years)         → CMC cost applies
Years after that                                      → AMC cost applies
```

The jump from ₹0 (warranty) to a real annual cost (CMC, then AMC) is the
**maintenance cliff** — a common source of over-optimistic multi-year projections if a
model just uses Year 1's cost for every year.

## 4. Surplus, EMI, and cash flow after financing

```text
Monthly operating surplus = Monthly realized revenue − (Monthly variable cost + Monthly fixed cost)
```

If the equipment is financed (loan or lease), the **EMI** is subtracted next:

```text
EMI = Principal × monthlyRate × (1 + monthlyRate)^tenure ÷ ((1 + monthlyRate)^tenure − 1)

Cash flow after EMI = Cash received − Operating cash expenses − EMI
```

If there's a **launch delay** before revenue starts (civil work, installation,
licensing, training) and the equipment is financed, interest still accrues during that
window with nothing yet to offset it:

```text
Pre-operative interest = Principal × (Annual interest rate ÷ 12 ÷ 100) × Launch delay in months
```

## 5. The core outputs: payback, ROI, NPV, IRR

Once a full year-by-year (or month-by-month) net cash-flow series exists, the
headline numbers all derive from it:

```text
Payback period = Initial investment ÷ Annual net cash flow
                (or, from a multi-year series: the point cumulative cash flow first
                 reaches the initial investment, interpolated within that year)

ROI = (Annual net return ÷ Initial investment) × 100

NPV = (Σ each year's cash flow, discounted back to today at the discount rate)
      − Initial investment

IRR = the discount rate at which NPV would equal exactly zero
```

**Discounted payback** applies the same discounting NPV uses before finding the
payback point — always a longer period than simple payback, since money in the future
is worth less than money today.

**Break-even usage per day** answers a different question: not "is this profitable at
my expected volume," but "what's the minimum volume before it's profitable at all":

```text
Contribution per use = Realized revenue per use − Variable cost per use
Break-even usage per day = Fixed monthly cost ÷ Contribution per use ÷ Working days per month
```

## 6. Comparing options: EAC

**Equivalent Annual Cost (EAC)** answers a different kind of question than payback/ROI
— not "is this a good investment" but "if I strip out revenue, what does owning and
running this equipment cost me per year, on a comparable basis":

```text
EAC = (discounted total lifetime cost, purchase + operating + maintenance + financing)
      ÷ annuity factor (a function of discount rate and useful life)
```

This is what makes a 10-year MRI and a 5-year ultrasound machine, or a cash purchase
and a lease, comparable side by side — each collapses to one number per year, on the
same footing regardless of how long the equipment lasts or how it's financed.

## 7. The Investment Outlook score

The dashboard's single 0-100 score is a **weighted lens on the numbers already shown
above** — not a separate, hidden calculation. It exists so a busy administrator gets
one number to anchor on, while the finance team can still see exactly what it's built
from.

Four components, each scored 0-100 independently, then combined by weight:

```text
Return Strength (35%)              — how far IRR sits above the discount rate
Speed to Payback (25%)             — how fast discounted payback happens, relative
                                      to the equipment's own useful life
Financing Resilience (20%)         — DSCR: does operating cash flow comfortably
                                      cover the EMI? (skipped for cash purchases,
                                      weight redistributed to the other three)
Operational Margin of Safety (20%) — how much cushion exists between expected
                                      usage and break-even usage
```

```text
Composite score = 0.35 × Return Strength + 0.25 × Speed to Payback
                + 0.20 × Financing Resilience + 0.20 × Operational Margin of Safety

Bands:  Strong 75-100 · Moderate 55-74 · Caution 35-54 · Weak 0-34
```

**Illustrative worked example** (continuing the numbers above, plus some additional
assumptions not shown earlier — not a real scenario):

```text
IRR 18.2%, discount rate 12.5%              → Return Strength ≈ 78.5
Discounted payback 3.8 years, useful life 10 years → Speed to Payback = 70
Monthly cash flow before EMI ₹4,50,000, EMI ₹3,20,000 (DSCR 1.41×) → Financing Resilience = 41
Usage 25/day, break-even 20.5/day (18% cushion) → Operational Margin of Safety = 45

Composite = 0.35×78.5 + 0.25×70 + 0.20×41 + 0.20×45 ≈ 62 → "Moderate"

Driver: Financing Resilience is the lowest sub-score, so the dashboard shows:
"Main risk: EMI is consuming a large share of monthly operating cash flow
relative to lenders' typical comfort margin (DSCR 1.41×)."
```

The driver line is always generated from the actual lowest-scoring component and its
real underlying number — never separately written copy that could drift from what the
score is actually measuring. Full methodology and every anchor-point's rationale live
in `financial-model-spec.md` §1.

## 8. Sensitivity analysis and the automatic actionable insight

**Sensitivity analysis** re-runs the entire waterfall above under a different set of
assumptions (lower utilization, lower realization %, a different financing structure)
so you can see how exposed the result is to any one assumption being wrong, rather
than trusting a single point estimate.

A special case of this — the **automatic actionable insight** — runs silently in the
background on every scenario: it tests a grid of modest tariff increases (2% to 15%)
starting at different future years, and surfaces the single smallest price change that
would improve payback by at least 6 months. If no realistic price change clears that
bar, nothing is shown — silence is the normal, expected result, not a fallback state.
Full grid, gate, and selection logic in `financial-model-spec.md` §4 and
`report-templates/formula-appendix.md` §6.2.

---

## A note on what this methodology does and doesn't guarantee

Every calculation above is deterministic and auditable — the same inputs always
produce the same outputs, and every number can be traced back to the formula that
produced it. What it can't do is know whether your inputs are accurate. See
`content/benchmark-notes.md` for how to read the confidence level behind any default
value, and `report-templates/disclaimer.md` before using any output to support an
actual capital decision.
