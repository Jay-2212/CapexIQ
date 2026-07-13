# Tooltip Copy

The actual short-form text shown in each field's click-to-open popover (SPEC.md §23.4,
UI mechanics resolved in `agent-build-plan.md`'s Phase 4 gap-analysis pass: click-to-open,
not hover). Distinct from `content/field-explanations.md`, which is the longer prose
reference this file draws from — these entries are the compressed, structured version
meant to fit in a small popover.

**Two known follow-ups, not blockers on the content itself:**
1. **Keying.** Entries below are keyed by the same readable field name
   `field-explanations.md` uses, not a final machine field ID — Phase 5's
   `wizard-state.md` (not yet written) will define those IDs. Re-keying this file once
   that lands is a mechanical rename, not a content rewrite; the actual copy below
   doesn't depend on wizard flow or screen layout.
2. **Reconciling with `inputs-metadata.json`.** 10 fields there already carry an
   earlier, simpler 4-slot tooltip object (definition / default-explanation /
   higher-impact / lower-impact) from before this project's Phase 4 gap-analysis pass
   added the 7-slot structure below (adding an explicit **Direction** slot, and
   splitting default-value from confidence and how-to-estimate from why-it-matters).
   Whoever wires up the popover component should treat this file as authoritative and
   update `inputs-metadata.json`'s existing 10 entries to match, rather than keeping
   two formats live.

**The 7 slots, every entry below:** Definition · Direction · Default/typical value ·
Confidence · Source note · How to estimate · Why it matters.

Numeric defaults are never hardcoded here — they live in `equipment-data/<type>.json`
or `common-assumptions.json` and vary by equipment type, per this project's
data/content separation rule (`ISSUES.md` ISS-9). Where a value is genuinely the same
structure across all equipment types (e.g. working days/month), that's noted; where it
varies by equipment type, the popover should pull the live number from the selected
equipment's data file at render time.

---

## Basic Mode

### Equipment category
- **Definition:** Which equipment type you're evaluating (MRI, CT, Cath Lab, Dialysis, Ultrasound, Custom).
- **Direction:** Context-dependent — determines every other default, not itself a "higher/lower is better" value.
- **Default/typical value:** No default; required first selection.
- **Confidence:** N/A.
- **Source note:** N/A.
- **How to estimate:** Select the type matching your actual purchase.
- **Why it matters:** Drives every benchmark default shown elsewhere in the tool.

### Equipment name / model (optional)
- **Definition:** A free-text label for your own reference in the exported report.
- **Direction:** N/A — doesn't affect any calculation.
- **Default/typical value:** Blank.
- **Confidence:** N/A.
- **Source note:** N/A.
- **How to estimate:** Enter your vendor's model name if you want it on the report.
- **Why it matters:** Cosmetic only; helps you tell exported reports apart later.

### Hospital bed size
- **Definition:** Your hospital's total bed count.
- **Direction:** Context-dependent — used as a lookup key for scale-dependent benchmarks, not a value with a "better" direction.
- **Default/typical value:** No default; required input (`data-requirements.md` §19).
- **Confidence:** N/A (your own hospital's fact, not a benchmark).
- **Source note:** N/A.
- **How to estimate:** Use your hospital's registered/licensed bed count.
- **Why it matters:** A 50-bed and a 500-bed hospital see different typical utilization and vendor pricing; this is what lets the tool distinguish them.

### City / tier
- **Definition:** Which city or city-tier (Tier 1/2/3) the hospital is in.
- **Direction:** Context-dependent.
- **Default/typical value:** No default; required input.
- **Confidence:** N/A (your own hospital's fact).
- **Source note:** N/A.
- **How to estimate:** Select your actual city or nearest tier classification.
- **Why it matters:** Feeds city-tier-dependent benchmarks (utilization, tariff) where research supports the breakdown.

### Purchase cost
- **Definition:** The equipment's upfront price, before installation.
- **Direction:** Lower is better — reduces upfront capital, shortens payback, improves NPV/IRR.
- **Default/typical value:** See the selected equipment's `equipment-data/<type>.json#purchaseCost` — a wide range (configuration and brand vary enormously).
- **Confidence:** Varies by equipment type — see the data file.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Use an actual vendor quotation wherever possible; benchmark ranges here are directional only.
- **Why it matters:** The base of your initial investment and of depreciation.

### Installation / civil cost
- **Definition:** One-time site preparation, civil work, and commissioning cost on top of the equipment's sticker price.
- **Direction:** Lower is better.
- **Default/typical value:** Often expressed as a % of purchase cost — see `equipment-data/<type>.json#installationAndAncillaryCostPercentage`.
- **Confidence:** Varies by equipment type — mostly Medium/Low, tender-mandated bid-allocation floors rather than measured actual spend.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Check whether your vendor's turnkey quote already includes this before entering it separately — double-counting here is a common mistake.
- **Why it matters:** Adds directly to initial investment alongside purchase cost.

### Expected months before revenue starts
- **Definition:** The gap between paying for the equipment and it seeing its first patient.
- **Direction:** Lower is better — shorter delay means less pre-operative interest and an earlier start to revenue.
- **Default/typical value:** See `equipment-data/<type>.json#launchDelayMonths`.
- **Confidence:** Varies by equipment type; Dialysis/Ultrasound are Low confidence (informal/adjacent sources only).
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Sum your own civil work, installation, licensing, and training timelines if you have them — see the Advanced Mode launch-delay breakdown for the individual components.
- **Why it matters:** Longer delays mean more pre-operative interest accrues (if financed) before revenue offsets it.

### Expected usage per day
- **Definition:** Scans/sessions/procedures per average working day.
- **Direction:** Higher is better, up to realistic capacity — the single largest lever on revenue and on clearing break-even.
- **Default/typical value:** See `equipment-data/<type>.json#typicalUtilization`.
- **Confidence:** Varies by equipment type; several are Medium or single-study-sourced — check the specific figure's confidence before relying on it.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Prefer your own market/referral estimate over the benchmark if you have one; this is one of the weaker-researched fields overall.
- **Why it matters:** Drives both revenue and whether you clear break-even usage per day.

### Average billed revenue per use
- **Definition:** The full invoiced/sticker price per scan or procedure, before payer deductions.
- **Direction:** Higher is better, within what the local market will bear.
- **Default/typical value:** See `equipment-data/<type>.json#billedTariffPerUse`.
- **Confidence:** Varies by equipment type and rate tier (NABH vs. non-NABH) — see the data file.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Use your own tariff sheet; government-scheme rates (CGHS/PM-JAY) shown as benchmarks are a reimbursement floor, not your private cash tariff.
- **Why it matters:** The starting point for both billed and (after realization %) realized revenue.

### Working days per month
- **Definition:** How many days per month the machine actually runs.
- **Direction:** Higher is better, within realistic operating limits.
- **Default/typical value:** 25 days/month, flat across all equipment types.
- **Confidence:** This is a modeling convention, not a researched benchmark — not calendar-accurate (doesn't vary 26/28/26 by month).
- **Source note:** `equipment-data/common-assumptions.json#workingDaysPerMonth`.
- **How to estimate:** Adjust if your facility has unusual closure patterns (e.g. more or fewer weekly closures than typical).
- **Why it matters:** A direct multiplier on both monthly revenue and monthly variable cost.

### Consumable cost per use
- **Definition:** Per-use cost of contrast agent, dialyzer, gel, drapes, or whatever consumable applies to this equipment type.
- **Direction:** Lower is better.
- **Default/typical value:** No centralized benchmark yet — vendor/consumable-contract dependent.
- **Confidence:** Unavailable — enter your own figure.
- **Source note:** N/A.
- **How to estimate:** Use your actual consumable supply contract or recent invoices.
- **Why it matters:** Part of variable cost per use, which sets your contribution margin per scan.

### Professional / reporting fee per use
- **Definition:** The doctor's own fee for performing or reporting the procedure.
- **Direction:** Lower is better (from a margin perspective) but is a real, necessary cost, not one to minimize by omission.
- **Default/typical value:** No centralized benchmark yet — varies widely by specialty and market.
- **Confidence:** Unavailable — enter your own figure.
- **Source note:** N/A.
- **How to estimate:** Use your actual radiologist/cardiologist/sonologist fee arrangement.
- **Why it matters:** Kept in Basic Mode deliberately, not buried in Advanced Mode — omitting it can make break-even look falsely optimistic. Distinct from a separate referral/commission arrangement, which this tool doesn't model (`ISSUES.md` ISS-11).

### Other variable cost per use
- **Definition:** Any remaining per-use cost not captured by consumables or the professional fee.
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark — hospital-specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Include anything else that scales directly with volume.
- **Why it matters:** Completes variable cost per use.

### Staff cost per month
- **Definition:** Fixed monthly salary cost for staff dedicated to running this equipment.
- **Direction:** Lower is better.
- **Default/typical value:** No centralized benchmark — staffing model dependent.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual technician/support staffing cost for this equipment.
- **Why it matters:** Part of fixed operating cost, independent of volume.

### Electricity / utility cost per month
- **Definition:** Fixed monthly utility cost attributable to running the equipment.
- **Direction:** Lower is better.
- **Default/typical value:** No centralized benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** High-draw equipment (MRI especially) can make this non-trivial — check your actual utility allocation if metered separately.
- **Why it matters:** Part of fixed operating cost.

### Other fixed operating cost per month
- **Definition:** Any other fixed monthly cost not captured above (e.g. facility overhead allocation).
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Include any remaining fixed allocation specific to this equipment.
- **Why it matters:** Completes fixed operating cost.

### Warranty period
- **Definition:** Years after installation during which the manufacturer covers repairs/parts at no extra cost.
- **Direction:** Higher is better — delays when AMC/CMC cost begins.
- **Default/typical value:** See `equipment-data/<type>.json#warrantyYears`.
- **Confidence:** Varies by equipment type; MRI is High (two independent government tenders), Ultrasound is Medium (single tender).
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Use your actual vendor contract's warranty term.
- **Why it matters:** Determines when the maintenance cliff (warranty → CMC/AMC) hits your cash flow.

### AMC / CMC cost after warranty
- **Definition:** Annual maintenance cost once warranty ends (see the glossary for AMC vs. CMC). Basic Mode applies this as one flat rate for the entire post-warranty period — it doesn't distinguish the pricier CMC years from the cheaper AMC years that follow; open Advanced Mode's "CMC coverage period after warranty" and per-year override if you want that precision.
- **Direction:** Lower is better.
- **Default/typical value:** A blend of `equipment-data/<type>.json#cmcAnnualCostPercentage` and `#amcAnnualCostPercentage` — see that field's `defaultSource` note in `content/inputs-metadata.json` for the exact formula.
- **Confidence:** Mixed — AMC figures are a generic proxy across all 5 equipment types (Medium); MRI's CMC has an open, unresolved contradiction between a generic tender ceiling and one hospital's much lower observed cost (`ISSUES.md` ISS-12) — shown as a flagged range, not averaged.
- **Source note:** `equipment-data/<type>.json`; see `content/benchmark-notes.md` §4 on why some figures show as a flagged range rather than one number.
- **How to estimate:** Use your actual AMC/CMC quote if you have one — this is one of the more contract-specific figures, and generic benchmarks are weak evidence for your particular deal.
- **Why it matters:** The single largest driver of the post-warranty cost cliff.

### Acquisition mode (cash / loan / lease)
- **Definition:** How you're financing the purchase.
- **Direction:** Context-dependent — no universal "better" direction; changes which other fields apply.
- **Default/typical value:** Cash (no financing fields required).
- **Confidence:** N/A.
- **Source note:** N/A.
- **How to estimate:** Select based on your actual planned financing; opens the full Advanced Mode Financing group if loan or lease.
- **Why it matters:** Determines whether EMI/lease payments, and the Financing Resilience score component, apply at all.

---

## Advanced Mode

### A. Revenue realization and payer mix

#### Payer mix shares (private cash / insurance-TPA / corporate credit / PM-JAY-government / other)
- **Definition:** Your patient volume split across payer types.
- **Direction:** Context-dependent — shifting mix toward higher-realization payers improves revenue, but mix itself reflects your actual patient base, not a lever to optimize in isolation.
- **Default/typical value:** No default; should sum to 100%, linked as connected sliders.
- **Confidence:** N/A (your own hospital's data).
- **Source note:** N/A.
- **How to estimate:** Use your own historical payer-mix breakdown.
- **Why it matters:** Feeds directly into realized revenue and DSO.

#### Billed tariff by payer type
- **Definition:** The billed rate for this payer type, if it differs from the standard tariff.
- **Direction:** Higher is better, within contractual/scheme limits.
- **Default/typical value:** No default — payer-contract specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual payer contract or scheme rate card.
- **Why it matters:** Some payers (e.g. government scheme) are billed differently than private cash for the same procedure.

#### Realization % by payer type
- **Definition:** Of the amount a claim survives claim deduction/disallowance (see below), the share you actually expect to collect — e.g. slower TPA settlement, minor short-payments, or write-offs on the approved portion. **Not** a share of billed tariff directly; claim deduction is applied first, realization second (`effective collection = billed tariff × (1 − claim deduction%) × realization%`), so the two haircuts multiply rather than overlap (ISS-17).
- **Direction:** Higher is better.
- **Default/typical value:** No centralized benchmark — payer-contract and collections-history specific.
- **Confidence:** Unavailable — a genuinely open data gap (`ISSUES.md` ISS-4).
- **Source note:** N/A.
- **How to estimate:** Use your own historical collections data by payer type, on the *approved* (post-deduction) amount, if available.
- **Why it matters:** Scales realized revenue down from the claim-deduction-adjusted amount.

#### Claim deduction / disallowance % by payer type
- **Definition:** The share of billed tariff typically disallowed/rejected on claim review, before realization is applied.
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your own claims-history disallowance rate if available.
- **Why it matters:** Kept separate from realization % so the two effects — formal claim rejection vs. collection shortfall on what's approved — aren't conflated (see realization %'s definition above for how they combine).

#### Collection delay / DSO by payer type
- **Definition:** How long, on average, it takes to receive cash from this payer type after billing.
- **Direction:** Lower is better — shorter DSO reduces the working capital gap.
- **Default/typical value:** No centralized benchmark — a genuinely open data gap (`ISSUES.md` ISS-4).
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your own accounts-receivable aging by payer type if available.
- **Why it matters:** Determines the size and duration of the working capital gap.

### B. Utilization ramp-up

#### Month 1-3 / 4-6 / 7-12 / Year 2+ utilization %
- **Definition:** What % of eventual mature utilization the equipment runs at during each early period.
- **Direction:** Higher is better, within realistic ramp-up expectations.
- **Default/typical value:** No centralized benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your own or comparable-launch ramp-up experience; modeling a ramp-up (rather than assuming full usage from month one) avoids overly optimistic early-year projections.
- **Why it matters:** Shifts early cash flow lower, which can materially affect payback and working capital needs.

#### Expected mature utilization
- **Definition:** Steady-state usage per day once ramp-up is complete.
- **Direction:** Higher is better.
- **Default/typical value:** Same source as Basic Mode's "expected usage per day."
- **Confidence:** See that field's confidence.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Same as Basic Mode's usage-per-day field.
- **Why it matters:** The ceiling the ramp-up percentages above are applied against.

### C. Financing

#### Down payment
- **Definition:** Upfront cash portion paid if financing via loan.
- **Direction:** Higher down payment lowers EMI but increases upfront cash needed — context-dependent trade-off, not one-directional.
- **Default/typical value:** No benchmark — lender/negotiation specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual loan terms.
- **Why it matters:** Reduces the financed loan amount, and therefore EMI.

#### Interest rate
- **Definition:** The annual loan interest rate.
- **Direction:** Lower is better.
- **Default/typical value:** 8-15% range referenced in research.
- **Confidence:** Low-Medium.
- **Source note:** `data-requirements.md`.
- **How to estimate:** Prefer your own lender's actual quote over this range.
- **Why it matters:** Directly drives EMI size and total interest paid.

#### Loan tenure
- **Definition:** How many months the loan is repaid over.
- **Direction:** Context-dependent — longer tenure lowers EMI but increases total interest paid.
- **Default/typical value:** No centralized benchmark — lender-specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual loan terms.
- **Why it matters:** A direct input to the EMI formula.

#### Processing charges
- **Definition:** One-time lender fee, typically a % of loan amount.
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual lender's fee schedule.
- **Why it matters:** Adds to upfront cost alongside purchase and installation.

#### EMI start month / Moratorium period
- **Definition:** When repayment begins, and any grace period before it does.
- **Direction:** A longer moratorium delays cash outflow but may accrue interest in the meantime — context-dependent.
- **Default/typical value:** No benchmark — loan-specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual loan sanction terms.
- **Why it matters:** Common for equipment with a launch delay before revenue starts; shifts when EMI first hits cash flow.

#### Lease rental (if lease mode)
- **Definition:** The periodic lease payment, used instead of EMI when acquisition mode is lease.
- **Direction:** Lower is better.
- **Default/typical value:** No centralized benchmark — lessor-specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual lease quotation.
- **Why it matters:** Replaces EMI in the cash-flow-after-financing calculation.

#### Lease tenure (if lease mode)
- **Definition:** How many months the lease rental is paid before the equipment is modeled as owned outright for the rest of its useful life (ISS-18) — mirrors Loan tenure.
- **Direction:** Context-dependent — reflects your actual lease agreement, not a lever to optimize.
- **Default/typical value:** No centralized benchmark — lessor-specific.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your actual lease agreement's term.
- **Why it matters:** Without a bounded tenure, a lease would be charged for the equipment's entire useful life while a loan payoff eventually stops — understating Lease relative to Loan in the financing-mode comparison.

### D. Launch delay and pre-opening cost

#### Civil work / installation / licensing-approval / training-commissioning duration
- **Definition:** The individual components that sum to Basic Mode's "expected months before revenue starts."
- **Direction:** Lower is better for each.
- **Default/typical value:** No per-component centralized benchmark; the combined figure is in `equipment-data/<type>.json#launchDelayMonths`.
- **Confidence:** See the combined figure's confidence in the data file.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Break down your own timeline by phase if you want to see which one is driving your total delay.
- **Why it matters:** Identifies which phase to focus on shortening.

#### Pre-opening fixed costs
- **Definition:** Costs incurred before revenue starts (e.g. staff hired ahead of go-live, pre-launch marketing).
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Include any pre-revenue spend not already part of purchase or installation cost.
- **Why it matters:** Adds to the effective initial investment beyond equipment and installation.

#### Working capital buffer
- **Definition:** Cash set aside to cover the gap between launch and the point collections cover operating costs on their own.
- **Direction:** Higher provides more safety margin but ties up more cash — context-dependent.
- **Default/typical value:** No benchmark; derived from the working capital gap calculation (§B above).
- **Confidence:** N/A — a planning figure, not a researched benchmark.
- **Source note:** N/A.
- **How to estimate:** Size against the calculated working capital gap for your scenario.
- **Why it matters:** Protects against a cash crunch in the early operating period.

### E. Maintenance and lifecycle cost

#### CMC coverage period after warranty
- **Definition:** How many years of CMC (comprehensive, parts-and-labor) coverage follow the warranty, before AMC (labor-only) coverage begins. Added 2026-07-13 (`capexiq-prebuild-assurance` PBA-4) — the underlying formula always needed this; it had no wizard field before.
- **Direction:** Context-dependent — a longer CMC period is a cost (higher rate) but usually means better coverage; there's no universal "better" direction.
- **Default/typical value:** See `equipment-data/<type>.json#cmcYears`.
- **Confidence:** Varies by equipment type — see each equipment file's own note.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Use your actual vendor contract's CMC term.
- **Why it matters:** Only affects the result if you're using the per-year "AMC / CMC cost by year" override below — Basic Mode's single blended rate doesn't need this field at all.

#### AMC / CMC cost by year
- **Definition:** Year-by-year maintenance cost detail, instead of one blended post-warranty figure.
- **Direction:** Lower is better.
- **Default/typical value:** See Basic Mode's AMC/CMC field; this is the same source broken out by year if your contract has a stepped schedule.
- **Confidence:** Same as the blended figure.
- **Source note:** `equipment-data/<type>.json`.
- **How to estimate:** Use your vendor's actual year-by-year schedule if it isn't flat.
- **Why it matters:** Useful when a contract escalates rather than staying constant.

#### Maintenance inflation
- **Definition:** Annual escalation rate applied to AMC/CMC cost over the equipment's life.
- **Direction:** Lower is better.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your vendor contract's escalation clause if one exists.
- **Why it matters:** Compounds maintenance cost growth over a multi-year projection.

#### Major replacement cost (optional)
- **Definition:** A one-time cost for a known major component replacement (e.g. an MRI coil or tube) expected partway through useful life.
- **Direction:** Lower is better.
- **Default/typical value:** No centralized benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use vendor guidance on expected component life if known.
- **Why it matters:** Can materially affect multi-year total cost of ownership if omitted.

#### Downtime assumption (optional, later)
- **Definition:** Reserved for a future version to model expected revenue loss from downtime.
- **Direction:** N/A — not yet part of the core model.
- **Default/typical value:** N/A.
- **Confidence:** N/A.
- **Source note:** N/A.
- **How to estimate:** N/A.
- **Why it matters:** Not currently used in any calculation.

### F. Financial model assumptions

#### Discount rate
- **Definition:** The rate used to discount future cash flows to present value (cost of capital).
- **Direction:** Lower discount rate raises calculated NPV; higher lowers it — not itself a value to "improve," but a cost-of-capital input.
- **Default/typical value:** 12.5% typical (11.1-14.1% range).
- **Confidence:** Medium — proxy from listed Indian hospital-chain WACC, not project-specific.
- **Source note:** `equipment-data/common-assumptions.json`; `data-requirements.md` §17.1.
- **How to estimate:** Confirm against your own hospital's actual cost of capital where known.
- **Why it matters:** Used in NPV, discounted payback, and the Investment Outlook score's Return Strength component.

#### Target IRR / hurdle rate
- **Definition:** The minimum return required before an investment is considered acceptable.
- **Direction:** N/A — a threshold you set, not a calculated output.
- **Default/typical value:** No reliable Indian benchmark exists; suggested starting point is discount rate + 300-500bps.
- **Confidence:** Unavailable (confirmed unresearchable after two research passes).
- **Source note:** `data-requirements.md` §17.2.
- **How to estimate:** Use your own institution's hurdle-rate policy if one exists.
- **Why it matters:** A comparison bar for IRR; not itself consumed by the Investment Outlook score, which uses discount rate as the hurdle instead.

#### Inflation rate
- **Definition:** A general inflation assumption, distinct from equipment-specific maintenance inflation.
- **Direction:** Lower is generally more favorable to real returns.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use a standard macro inflation assumption if the model calls for one elsewhere.
- **Why it matters:** Distinct from maintenance-specific escalation; not yet consumed by a specific formula in this version.

#### Useful life
- **Definition:** The depreciation period, per the Companies Act Schedule II for most diagnostic equipment.
- **Direction:** N/A — a regulatory/accounting fact, not a lever.
- **Default/typical value:** 13 years (MRI/CT/Ultrasound) or 15 years (Cath Lab/Dialysis).
- **Confidence:** High (Companies Act Schedule II, source S8).
- **Source note:** `equipment-data/<type>.json`; `data-requirements.md` §12.4/§14.
- **How to estimate:** Use the sourced figure unless your own accounting policy differs.
- **Why it matters:** The denominator in depreciation, EAC, and the Investment Outlook score's Speed to Payback ratio.

#### Salvage value
- **Definition:** Assumed residual value at end of useful life, as a % of original cost.
- **Direction:** Higher salvage value lowers annual depreciation.
- **Default/typical value:** 5% of original cost, all equipment types (Companies Act Schedule II).
- **Confidence:** Medium-High — well-established in practice, but not independently re-verified against primary Schedule II text this pass.
- **Source note:** `equipment-data/<type>.json`; `data-requirements.md` §18.2.
- **How to estimate:** Use the sourced figure unless you have a specific reason to expect a different residual value.
- **Why it matters:** Reduces the depreciable base in the straight-line depreciation formula.

#### Depreciation method
- **Definition:** Currently straight-line only.
- **Direction:** N/A.
- **Default/typical value:** Straight-line (fixed for v1).
- **Confidence:** N/A.
- **Source note:** SPEC.md §17.
- **How to estimate:** N/A — no alternative method available yet.
- **Why it matters:** Reserved for a future version that might support accelerated methods.

#### Tax assumptions (optional)
- **Definition:** Reserved for a future version; not yet part of the core financial model.
- **Direction:** N/A.
- **Default/typical value:** N/A.
- **Confidence:** N/A.
- **Source note:** N/A.
- **How to estimate:** N/A.
- **Why it matters:** Not currently used in any calculation.

#### Price escalation / Cost escalation
- **Definition:** Annual growth rate assumptions applied to billed tariff and operating costs respectively, for multi-year projections.
- **Direction:** Higher price escalation improves revenue growth; higher cost escalation worsens margin — opposite directions on the same lever type.
- **Default/typical value:** No benchmark.
- **Confidence:** Unavailable.
- **Source note:** N/A.
- **How to estimate:** Use your own historical tariff/cost growth if available.
- **Why it matters:** Affects multi-year projections beyond Year 1; distinct from the automatic actionable-insight engine's own tariff-increase testing (`financial-model-spec.md` §4).

#### Scenario assumptions
- **Definition:** The set of overrides (utilization, realization %, financing type, and similar) defining a named alternative scenario in sensitivity analysis.
- **Direction:** N/A — a modeling tool, not a value with its own direction.
- **Default/typical value:** N/A.
- **Confidence:** N/A.
- **Source note:** SPEC.md §28.
- **How to estimate:** Choose realistic downside/upside variants of your own baseline assumptions.
- **Why it matters:** Lets you see how exposed the result is to any one assumption being wrong.
