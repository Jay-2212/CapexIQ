# Field Explanations

Plain-language explanation for every input field in Basic and Advanced Mode, per
SPEC.md §10-11. Each entry: what it is, why it matters to the result, and how to
estimate it if you don't have an exact number yet. Terms in **bold** are defined in
`content/glossary.md` — this file doesn't redefine them.

This is the prose reference doc, not the exact popover copy — `content/tooltip-copy.md`
(blocked on Phase 4's interaction design) will carry the shorter, structured in-app
version, sourced from this file plus each field's default/confidence from
`equipment-data/`.

---

## Where your data goes (added 2026-07-13, capexiq-prebuild-assurance PBA-8; wording
reconciled 2026-07-13 to the exact copy `app/forms/wizard-state.md` §7.3 already
decided, per `capexiq-ui-assurance`'s F5 finding — one source of truth, not two
independently-drafted versions of the same sentence)

Wizard copy, placed near the "Start over" control (`app/forms/wizard-state.md` §7.3 —
required, not optional, since real hospital financial figures are involved and a
shared admin-office computer is a realistic usage context):

> Your progress is saved in this browser only.

This is input-time UX copy, distinct from `report-templates/disclaimer.md` (which
covers the exported report's financial-advice disclaimer, not browser storage) — don't
conflate the two or merge this into that file.

---

## Basic Mode

### Equipment category
Which of MRI, CT, Cath Lab, Dialysis, Ultrasound, or Custom you're evaluating.
Determines every benchmark default the tool offers elsewhere — get this right first.

### Equipment name / model (optional)
A free-text label (e.g. "Siemens Magnetom 1.5T") for your own reference in the
exported report. Doesn't affect any calculation.

### Hospital bed size
Your hospital's total bed count. Used as a lookup key for utilization and (once
researched — see `data-requirements.md` §19) maintenance-contract benchmarks that
scale with hospital size and negotiating volume. A 50-bed hospital and a 500-bed
hospital genuinely see different typical utilization and vendor pricing; this field is
what lets the tool distinguish them instead of showing one generic number to everyone.

### City / tier
Which city or city-tier (Tier 1/2/3) the hospital is in. Feeds city-tier-dependent
benchmarks (utilization, tariff) where research supports that breakdown.

### Purchase cost
The equipment's upfront price, before installation. The core of your initial
investment and the base for **depreciation**. Best sourced from an actual vendor
quote — benchmark ranges here are wide (e.g. ₹2-14 Cr for MRI) because configuration
and brand vary enormously.

### Installation / civil cost
One-time cost for site preparation, civil work, and commissioning, on top of the
equipment's sticker price. Often expressed as a % of purchase cost in benchmarks —
check whether your vendor's turnkey quote already includes this before entering it
separately (double-counting here is a common modeling mistake).

### Expected months before revenue starts
How long from paying for the equipment to it seeing its first patient — civil work,
installation, licensing, training. Longer delays mean more **pre-operative interest**
accrues (if financed) before any revenue offsets it. See the Advanced Mode "Launch
delay" group for a fuller breakdown of what makes up this number.

### Expected usage per day
Scans/sessions/procedures per average working day. The single largest lever on
revenue and on whether you clear **break-even usage per day** — worth spending real
effort getting this estimate right rather than accepting a generic default, since
benchmark data here is often weak (see each equipment type's tooltip for its specific
confidence level).

### Average billed revenue per use
The full invoiced/sticker price per scan or procedure, before any payer deductions.
This is **billed revenue**, not **realized revenue** — Advanced Mode's payer-mix group
converts one into the other.

### Working days per month
How many days per month the machine actually runs (accounts for weekly closures,
holidays). Default is a flat 25 days/month — a generic modeling convention, not a
calendar-accurate day-count that varies by month.

### Consumable cost per use
Per-use cost of contrast agent, dialyzer, gel, drapes, or whatever consumable applies
to this equipment type — part of **variable cost per use**.

### Professional / reporting fee per use
The doctor's own fee for performing or reporting the procedure (radiologist,
cardiologist, sonologist, etc. — see SPEC.md §10.2 for the full per-equipment
breakdown). Kept in Basic Mode deliberately, not tucked into Advanced Mode, because
leaving it out can make a break-even calculation falsely optimistic. This is not the
same as a separate referral/commission arrangement, which this tool doesn't model.

### Other variable cost per use
Any remaining per-use cost not captured by consumables or the professional fee — the
catch-all term in **variable cost per use**.

### Staff cost per month
Fixed monthly salary cost for staff dedicated to running this equipment (technicians,
dedicated nursing support, etc.) — part of **fixed operating cost**.

### Electricity / utility cost per month
Fixed monthly utility cost attributable to running the equipment — part of **fixed
operating cost**. High-draw equipment (MRI in particular) can make this non-trivial.

### Other fixed operating cost per month
Any other fixed monthly cost not captured above (e.g. facility overhead allocation) —
the catch-all term in **fixed operating cost**.

### Warranty period
How many years after installation the manufacturer covers repairs/parts at no extra
cost. Determines when **AMC/CMC** costs begin — see **maintenance cliff**.

### AMC / CMC cost after warranty
The annual maintenance cost once warranty ends — see the glossary for how AMC and CMC
differ (labour-only vs. parts-included). Advanced Mode's maintenance group lets you
specify AMC and CMC separately, year by year, if you have that detail; Basic Mode
accepts one blended figure to get a first-pass estimate quickly.

### Acquisition mode (cash / loan / lease, optional quick selection)
A quick way to indicate how you're financing the purchase. Selecting loan or lease
here is a shortcut into Advanced Mode's full Financing group (group C) — you can leave
it as cash and skip straight to results, or open Advanced Mode for the full detail.

---

## Advanced Mode

Hidden by default — see the persistent preview banner shown above the collapsed panel
for what opening this unlocks. Everything below adds precision on top of Basic Mode's
first-pass estimate; none of it is required to see an initial result.

**Preview banner copy** (shown above the collapsed panel, per `agent-build-plan.md`
Phase 4-F; extends SPEC.md §10.4's original soft-note to name all six groups below by
label, so nothing Advanced unlocks stays invisible to a Basic-only user):

> This first-pass view is based on billed revenue. Open Advanced Financial Assumptions
> to model payer mix & realization, utilization ramp-up, financing/EMI, launch delay &
> pre-opening cost, maintenance/lifecycle cost, and discount rate/depreciation/tax
> assumptions.

### A. Revenue realization and payer mix

**Private cash % / Insurance-TPA % / Corporate credit % / PM-JAY-government scheme % /
Other payer %** — your patient volume split across payer types. Should sum to 100%;
the tool links these as connected sliders for that reason.

**Average billed tariff by payer type** — some payers (e.g. a government scheme) may
be billed at a different rate than private cash patients for the same procedure;
enter each payer type's actual billed rate if it differs.

**Expected realization % by payer type** — see **realization %** in the glossary; how
much of that payer's billed tariff you actually expect to collect.

**Expected claim deduction / disallowance % by payer type** — insurance/TPA claims are
often partially disallowed on review; this captures that separately from realization
% so the two effects aren't conflated.

**Collection delay / DSO by payer type** — see **DSO** in the glossary; how long, on
average, it takes to actually receive cash from this payer type after billing.

### B. Utilization ramp-up

**Month 1-3 / Month 4-6 / Month 7-12 / Year 2 onward utilization %** — new equipment
rarely runs at mature volume from day one. These let you model a ramp-up curve
(expressed as a % of your eventual mature utilization) instead of assuming full usage
from month one — a common cause of overly optimistic early-year projections if
skipped.

**Expected mature utilization** — the steady-state usage per day once ramp-up is
complete; the ceiling the ramp-up percentages above are applied against.

**Seasonality adjustment (optional, later)** — reserved for a future version to model
predictable monthly demand swings (e.g. festival-season dips); not yet part of the
core model.

### C. Financing

**Cash / loan / lease** — the financing structure driving all remaining fields in this
group.

**Down payment** — the upfront cash portion paid if financing via loan; reduces the
financed **loan amount**.

**Loan amount** — purchase cost (plus any financed installation cost) minus down
payment; the principal the **EMI** is calculated against.

**Interest rate** — the annual loan interest rate. Benchmark data here (8-15% range)
is Low-Medium confidence — prefer your own lender's actual quote.

**Loan tenure** — how many months the loan is repaid over. Longer tenure lowers EMI
but increases total interest paid.

**Processing charges** — one-time lender fee, typically a % of loan amount, added to
upfront cost.

**EMI start month** — when repayment begins; may be delayed relative to disbursement
if a **moratorium period** applies.

**Moratorium period (if any)** — a grace period during which the loan doesn't require
repayment (interest may still accrue) — common for equipment that needs a launch delay
before generating revenue.

**Lease rental (if lease mode selected)** — the periodic lease payment, used instead of
EMI when the acquisition mode is lease rather than loan purchase.

### D. Launch delay and pre-opening cost

**Civil work duration / Installation duration / Licensing-approval duration /
Training-commissioning duration** — the individual components that sum to the
"expected months before revenue starts" figure from Basic Mode. Breaking it out here
lets you see which phase is actually driving your launch delay.

**Expected revenue start month** — the resulting month, counted from purchase, that
the equipment starts generating billed revenue.

**Pre-opening fixed costs** — costs incurred before revenue starts (e.g. staff hired
ahead of go-live, pre-launch marketing) that aren't part of the equipment's purchase
or installation cost.

**Pre-operative interest** — see the glossary; interest that accrues on a loan during
the pre-revenue window, before any income offsets it.

**Working capital buffer** — cash set aside to cover the gap between launch and the
point where realized revenue and collections are covering operating costs on their
own.

### E. Maintenance and lifecycle cost

**Warranty period** — same field as Basic Mode; repeated here so the full maintenance
schedule can be modeled in one place.

**AMC cost by year / CMC cost by year** — year-by-year detail, if you have it, instead
of Basic Mode's single blended post-warranty figure. Useful if your vendor's contract
has a stepped or escalating schedule rather than a flat annual cost.

**Maintenance inflation** — an annual escalation rate applied to AMC/CMC cost over the
equipment's life, if you expect maintenance costs to rise year over year.

**Major replacement cost (optional)** — a one-time cost for a known major component
replacement expected partway through the equipment's useful life (e.g. an MRI coil or
tube replacement), if applicable.

**Downtime assumption (optional, later)** — reserved for a future version to model
expected revenue loss from scheduled/unscheduled equipment downtime; not yet part of
the core model.

### F. Financial model assumptions

**Discount rate** — see the glossary; used to compute **NPV** and **discounted
payback**. Default 12.5% typical (11.1-14.1% range), a proxy from listed Indian
hospital-chain WACC — see `equipment-data/common-assumptions.json`.

**Inflation rate** — a general inflation assumption, distinct from the
equipment-specific **maintenance inflation** field in group E, if the model needs one
elsewhere.

**Useful life** — see the glossary; the depreciation period, typically sourced from
the Companies Act Schedule II for diagnostic equipment.

**Salvage value** — see the glossary; residual value at end of useful life, as a % of
original cost.

**Depreciation method** — currently straight-line only (see the glossary); this field
is here for a future version that might support accelerated methods.

**Tax assumptions (optional)** — reserved for a future version; not yet part of the
core financial model.

**Price escalation / Cost escalation** — annual growth rate assumptions applied to
billed tariff and to operating costs respectively, for multi-year projections.

**Scenario assumptions** — the set of overrides (utilization, realization %,
financing type, and similar) used to define a named alternative scenario in the
**sensitivity analysis** — see SPEC.md §28.
