# Glossary

Plain-language definitions for every financial and product term this tool uses.
Referenced by `field-explanations.md`, and intended to be the source `tooltip-copy.md`
and `report-templates/formula-appendix.md` link back to once those are written (Phase
4/Phase 2 respectively — see `agent-build-plan.md` Phase 3), rather than each
redefining the same term differently. Alphabetical within each group.

---

## Revenue and utilization

**Usage per day** — how many scans, sessions, or procedures the equipment performs on
an average working day. The single biggest driver of both revenue and break-even.

**Working days per month** — how many days per month the equipment is actually
operated (accounts for weekly closures, holidays). Default: 25 days/month, a generic
calendar convention — see `equipment-data/common-assumptions.json`.

**Billed revenue** — revenue calculated at the full sticker/invoiced tariff, before any
payer deductions or collection delay. What Basic Mode shows by default.

**Realized revenue** — revenue after payer-specific deductions (insurance disallowance,
scheme discounts, bad debt) are applied. Always less than or equal to billed revenue.
See **Realization %** below.

**Payer mix** — the breakdown of your patient volume across payer types (private cash,
insurance/TPA, corporate credit, PM-JAY/government scheme, other). Each payer type
typically has a different tariff, realization %, and collection delay.

**Realization %** — the share of a payer type's billed tariff that the hospital
actually collects, after scheme discounts, disallowed claims, and write-offs. A private
cash patient might realize close to 100%; a government scheme payer often realizes
less than the billed rate.

**DSO (Days Sales Outstanding)** — how many days, on average, it takes to actually
receive cash for a bill, by payer type. Higher DSO means revenue is recognized sooner
than cash is received — a working-capital risk, not just an accounting detail.

**Cash received by month** — the realized-revenue series shifted forward in time by
each payer's DSO. Distinct from realized revenue precisely because of collection delay.

**Working capital gap** — the difference between cumulative realized revenue and
cumulative cash actually received. Represents the cash a hospital needs to bridge while
waiting on collections.

**Contribution per use** — realized revenue per use minus variable cost per use. What's
left over from each scan/procedure to cover fixed costs and, eventually, profit.

## Costs

**Variable cost per use** — cost that scales directly with volume: consumables,
professional/reporting fee, and any other per-use cost.

**Professional / reporting fee** — the fee paid to the doctor performing or reporting
the procedure (e.g. radiologist reading an MRI, cardiologist running a cath lab
procedure). Kept in Basic Mode, not buried in Advanced Mode, because it's often large
enough to materially change the break-even calculation. Distinct from a separate
referral/commission arrangement, which this tool does not model (out of scope — see
`ISSUES.md` ISS-11).

**Fixed operating cost** — cost that doesn't scale with volume: staff salaries,
electricity/utilities, fixed maintenance allocation, and similar monthly overheads.

**Warranty** — the period, usually starting at installation, during which the
manufacturer covers repairs and parts at no extra cost (beyond what's built into the
purchase price).

**AMC (Annual Maintenance Contract)** — a labour-only maintenance contract, typically
starting after warranty ends. Covers technician visits and routine service, not major
parts.

**CMC (Comprehensive Maintenance Contract)** — a maintenance contract that includes
parts as well as labour — more expensive than AMC, but covers major component
replacement. AMC and CMC are priced very differently; don't treat one figure as a
proxy for the other.

**Maintenance cliff** — the cost jump that happens the moment warranty coverage ends
and AMC/CMC costs begin. A common surprise in multi-year projections if not modeled
explicitly.

## Capital and financing

**Purchase cost (Capex)** — the upfront cost of the equipment itself, before
installation.

**Installation / ancillary cost** — civil work, site preparation, commissioning, and
similar one-time costs beyond the equipment's sticker price, often expressed as a % of
purchase cost.

**Useful life** — the number of years the equipment is depreciated over for accounting
purposes (per the Companies Act Schedule II for most diagnostic equipment in India),
not necessarily its actual physical lifespan.

**Salvage value** — the equipment's assumed residual value at the end of its useful
life, expressed as a % of original cost. Reduces the depreciable base.

**Straight-line depreciation** — the (annual depreciation = (purchase cost − salvage
value) ÷ useful life) method this tool uses — an equal amount expensed each year,
as opposed to accelerated methods.

**EMI (Equated Monthly Installment)** — the fixed monthly loan repayment amount,
covering both principal and interest, for equipment financed via a loan.

**Launch delay / pre-operative period** — the gap between paying for the equipment and
it generating its first rupee of revenue (civil work, installation, licensing,
training). Interest that accrues on a loan during this window, before revenue starts,
is **pre-operative interest**.

**Discount rate** — the annual rate used to convert future cash flows into today's
value (see NPV below) — effectively, the cost of capital or the return the hospital
could earn elsewhere. See `equipment-data/common-assumptions.json` for this tool's
current benchmark (12.5% typical, sourced from listed Indian hospital-chain WACC).

**Target IRR / hurdle rate** — the minimum return a hospital requires before an
investment is considered acceptable. No reliable published Indian benchmark exists for
this (see `data-requirements.md` §17.2) — the tool suggests discount rate + 300–500bps
as a starting heuristic, not a researched figure.

## Core financial outputs

**NPV (Net Present Value)** — the sum of all future cash flows, each discounted back to
today's value at the discount rate, minus the initial investment. Positive NPV means
the investment is expected to create value above the cost of capital.

**IRR (Internal Rate of Return)** — the discount rate at which NPV equals exactly
zero. Compared against the discount rate or target IRR to judge whether a project
clears the bar.

**Payback period** — how long it takes for cumulative net cash flow to equal the
initial investment. **Simple payback** ignores the time value of money; **discounted
payback** accounts for it (always longer than simple payback, or never occurring at
all if returns are weak).

**ROI (Return on Investment)** — annual net return divided by initial investment,
expressed as a percentage. Can be calculated on a billed, realized, or cash-flow basis
— always check which view a reported ROI number is using.

**Break-even usage per day** — the minimum daily usage at which contribution per use
exactly covers fixed monthly costs. Usage below this line means the equipment is
losing money every month, regardless of how good the headline ROI looks at higher
volume.

**EAC (Equivalent Annual Cost)** — converts the total cost of owning and running the
equipment over its useful life into a single, comparable annual figure — useful for
comparing options with different lifespans or financing structures on equal footing.

**DSCR (Debt Service Coverage Ratio)** — monthly operating cash flow (before EMI)
divided by the monthly EMI. A DSCR of 1.5x means operating cash flow comfortably
covers loan payments 1.5 times over; below 1.0x means the project's own cash flow
can't cover its debt payments. Commercial lenders commonly require 1.25–1.5x or
higher as a lending condition.

**Investment Outlook score** — a single 0–100 score combining four weighted
sub-scores: Return Strength (35%, how far IRR sits above the discount rate), Speed to
Payback (25%, how quickly discounted payback happens relative to useful life),
Financing Resilience (20%, DSCR-based — zero-weighted for cash purchases), and
Operational Margin of Safety (20%, how much cushion exists above break-even usage).
Bands: Strong (75–100), Moderate (55–74), Caution (35–54), Weak (0–34). See
`financial-model-spec.md` §1 for the full methodology — the score is always a lens on
numbers already shown elsewhere on the dashboard, never a hidden calculation.

**Sensitivity analysis** — recalculating ROI/payback/NPV/IRR under different
assumption scenarios (e.g. lower utilization, lower realization %) to show how exposed
the investment is to those assumptions being wrong.

**Actionable insight (price-increase suggestion)** — an automatic, silent-unless-useful
suggestion the tool surfaces only when a modest price increase (≤15%) would materially
improve payback (by ≥6 months) — see `financial-model-spec.md` §4. Doesn't appear if
no such improvement exists; never appears as a permanent UI element.

## Confidence and sourcing

**Confidence (High / Medium / Low / Unavailable)** — how strong the evidence is behind
a benchmark figure, not how large or small the number is. See
`content/benchmark-notes.md` for the full explanation of what each tier means and how
to weigh it.

**Basic Mode / Advanced Mode** — Basic Mode asks only for what an administrator can
reasonably estimate from a vendor quote or internal discussion. Advanced Mode (hidden
by default, opened deliberately) adds payer-mix realization, collection delay,
detailed financing terms, launch-delay cost, and lifecycle maintenance modeling — the
CFO-grade view.
