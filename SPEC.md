# SPEC.md — CapexIQ (Idea Spec v0.2)

> This is the original spec, moved in from Documents root, content unchanged below the
> divider except for the identity fields (name/URL/tagline), which were updated on
> 2026-07-05 when the project was renamed from the placeholder "Healthcare Capex
> Decision Support Tool" to **CapexIQ**. The **Quick Index** below is new — added purely
> for navigation, so an agent can jump straight to the relevant section instead of
> reading all 40 sections front to back.

**Name:** CapexIQ &nbsp;&nbsp;**Tagline:** "Know if it pays for itself, before you buy
it." &nbsp;&nbsp;**Working URL:** `capexiq.jaybharti.me` &nbsp;&nbsp;**Version:** 0.2
&nbsp;&nbsp;**Status:** Early concept / living idea document

---

## Quick Index

Section numbers match the `##` headers below — jump to the one you need rather than reading top to bottom.

**Product & positioning**
- §1 Core Idea — what the tool is, the "buy this machine?" framing
- §2 Positioning — messaging, product promise, what makes it different from a generic ROI calculator
- §3 Primary Users — hospital owners, admins, COOs, CFOs, consultants, students
- §4 Core Product Philosophy — progressive disclosure, agent-friendly + human-friendly build, financial honesty over false simplicity
- §5 Scope and Geography — India-first, INR default, why not global in v1
- §6 What the Tool Should Help Answer — the actual questions the tool answers
- §7 Product Flow — the 7-step wizard flow

**Equipment & inputs**
- §8 Equipment Library — full long-term equipment category list
- §9 Suggested Version 1 Equipment Scope — MRI / CT / Cath Lab / Dialysis / Ultrasound / Custom for v1
- §10 Basic Mode — exact input fields, why professional fee belongs in Basic
- §11 Advanced Mode — payer mix, utilization ramp-up, financing, launch delay, maintenance, model assumptions

**Financial model**
- §12 Financial Output Definitions — billed vs. realized vs. cash received, contribution, surplus, etc.
- §13 Revenue, Usage, Utilization, and Realization — utilization ramp-up concept, basic vs. advanced revenue formulas
- §14 Revenue Realization and Working Capital — core v0.2 addition, working-capital-gap logic
- §15 PM-JAY, Insurance, TPA, and NABH — how much these matter, where each belongs
- §16 Time-to-Revenue, Launch Delay, and Pre-Operative Interest — launch delay modelling, EMI-vs-revenue timing
- §17 Depreciation — straight-line only for v1
- §18 Inflation and Discount Rate — where these apply
- §19 Financing Module — cash / loan / lease, EMI logic
- §20 Warranty, AMC, CMC, and Maintenance Cliff — year-wise maintenance schedule
- §31 Formula Concepts — the actual formulas, one per output metric

**Dashboard & UX**
- §21 Decision Dashboard — Investment Outlook score, key metrics, risk insights
- §22 Calculation Transparency — "show calculation background" requirement
- §23 Benchmark Ranges and Tooltips — how benchmarks should be sourced and shown
- §25 Visual Design Direction — colors, typography, what to avoid (see also `../design/`)
- §26 Interface Ideas — landing page, wizard, results dashboard
- §27 Visualizations — recommended charts
- §28 Scenario Analysis — comparing scenarios / equipment options
- §30 Narrative Summary — auto-generated written summary requirements

**Data, research & risk**
- §24 Research and Data Requirements — what `data-requirements.md` needs to cover (**the recommended next artifact — see §39**)
- §36 Open Questions for Future Iteration — unresolved product / data / design questions
- §37 Risks — 7 named risks + mitigations

**Build & exports**
- §29 Exports — Excel / Word / ZIP export contents
- §32 Suggested Technical Architecture — the actual folder structure (`/formulas`, `/equipment-data`, etc.)
- §33 Assets and Images — visual asset direction (done — see `DIRECTORY.md`)

**Meta**
- §34 Naming Ideas
- §35 Portfolio / Resume Value
- §38 Proposed Version Roadmap — v0.1 through v0.6 plan
- §39 Immediate Next Steps — explicitly recommends `data-requirements.md` next
- §40 Current Conclusion — the "why this matters" closing thought

---

<!-- ORIGINAL SPEC BELOW THIS LINE — UNCHANGED -->

# CapexIQ — Idea Spec v0.2

**Working URL:** `capexiq.jaybharti.me`  
**Working name:** CapexIQ (was "Healthcare Capex Decision Support Tool")  
**Tagline:** Know if it pays for itself, before you buy it.  
**Version:** 0.2  
**Status:** Early concept / living idea document  
**Date:** 2026-07-04 (renamed 2026-07-05)  
**Owner:** Jay Bharti  

---

## Version 0.2 Update Note

This version fully merges the original v0.1 idea spec with the financial realism improvements raised during critique and discussion.

The major v0.2 improvement is that the project should not behave like a simple billed-revenue ROI calculator. It should distinguish billed revenue from realized revenue, operating surplus from cash flow, fixed costs from variable professional payouts, and Year 1 results from later-year maintenance and financing realities.

The tool should still remain simple and administrator-friendly at the surface level, but the model underneath should be honest enough for hospital finance and CFO-level discussion.

Core v0.2 additions:

```text
Revenue realization and DSO / collection delay
Payer-wise realization assumptions
Working capital gap visibility
Professional / reporting fee per use
Time-to-revenue and launch delay
Pre-operative interest and pre-opening cash burden
Warranty period and AMC/CMC cliff modelling
Clear financial output definitions
Stronger benchmark-data caution
Billed view vs cash-flow view in dashboard and exports
```

---

## 1. Core Idea

Build a professional web-based decision support tool for hospitals evaluating whether a high-value healthcare equipment investment is financially viable.

This should not feel like a generic ROI calculator. It should feel like a serious, polished, hospital-administration-facing tool that can be used by owners, administrators, operations heads, and finance teams to build a proposal around new equipment purchase decisions.

The tool should live as its own subdomain of the personal website, linked from the
portfolio rather than nested inside it:

```text
capexiq.jaybharti.me
```

The project should be useful as a portfolio/resume/interview project because it connects hospital administration, healthcare finance, operations, strategy, and analytics.

The tool should help a user move from a rough question like:

```text
Should we buy this machine?
```

to a structured decision view like:

```text
Under these assumptions, this equipment appears financially strong / moderate / risky.
The biggest driver is utilization.
The biggest cash-flow risk is delayed realization from insurance/TPA/government payers.
The investment requires X uses per day to break even and Y months of working capital buffer before stable cash flow.
```

---

## 2. Positioning

### 2.1 Initial framing

Not:

```text
Should I buy this machine?
```

Better:

```text
CapexIQ — Know if it pays for itself, before you buy it.
```

Possible landing page statement:

```text
Evaluate healthcare equipment investments with ROI, payback, NPV, IRR, break-even analysis, utilization assumptions, cash-flow timing, and export-ready financial models.
```

### 2.2 Product promise

```text
Simple enough for an administrator.
Deep enough for a CFO.
Structured enough for agents to build.
Polished enough for a portfolio.
```

### 2.3 What makes this different from a generic ROI calculator

The tool should explicitly model healthcare-specific financial realities:

```text
Utilization ramp-up
Payer mix
Revenue realization
Claim deductions
Collection delay / DSO
Professional fee per use
Warranty and AMC/CMC cliffs
Loan EMI timing
Launch delay before first revenue
Break-even usage
Scenario comparison
Export-ready proposal generation
```

The core positioning is not just “calculate ROI.”

The stronger positioning is:

```text
A hospital equipment investment model that shows both viability and risk.
```

---

## 3. Primary Users

The tool should primarily cater to:

1. Hospital owners
2. Hospital administrators
3. Operations heads / COOs
4. Finance managers / CFOs
5. Consultants or analysts preparing feasibility proposals
6. Students or early-career healthcare administrators demonstrating applied finance and operations thinking

### 3.1 User context

A small hospital owner may use the tool directly to evaluate whether buying an MRI, CT, dialysis setup, ultrasound unit, cath lab, or other equipment makes sense.

In a bigger hospital, the process will be multi-person:

- Administrator/operations person identifies the need.
- Doctors/clinical teams help decide equipment type and model.
- Vendor quotations determine actual machine cost.
- Finance/CFO reviews deeper assumptions, NPV, IRR, loan impact, depreciation, cash flows, and working capital.
- Management/board reviews proposal and decision summary.

Therefore, the interface must be simple upfront but must have depth available when required.

---

## 4. Core Product Philosophy

### 4.1 Progressive disclosure

The biggest risk is overwhelming the user. The tool should not show 50 fields at once.

It should reveal complexity gradually.

Basic Mode should show only the minimum inputs needed for a directional viability estimate.

Advanced Mode should contain CFO-level assumptions and deeper financial modelling.

The guiding principle:

```text
Do not hide financial reality, but do not force every user to face every assumption at once.
```

### 4.2 Human-friendly UI, agent-friendly build

The project has two simultaneous design principles:

```text
Agent-friendly building.
Human-friendly interface.
```

#### Agent-friendly build means:

- Clear file structure
- Editable data files
- Separated formulas
- Separated assumptions
- Separated report templates
- No hardcoded financial logic scattered across components
- Easy to add new equipment categories
- Easy to update benchmark ranges later
- Formula modules that can be tested independently
- Export templates that can reuse the same model outputs

#### Human-friendly interface means:

- Clean, professional layout
- No generic SaaS clutter
- Minimal upfront fields
- Helpful explanations and question-mark tooltips
- Clear results
- Charts and summaries that aid decision-making
- Advanced assumptions hidden until needed
- Plain-language warnings when assumptions create risk

### 4.3 Financial honesty over false simplicity

The tool should avoid giving a dangerously clean answer if the assumptions are incomplete.

For example, the tool should not say:

```text
Monthly surplus: ₹12,00,000
```

without clarifying whether this is based on billed revenue or actual expected collections.

Better:

```text
Estimated operating surplus based on billed revenue: ₹12,00,000
Estimated cash surplus after expected collection delay and EMI: ₹6,50,000
```

The user should always understand what view they are seeing.

---

## 5. Scope and Geography

### 5.1 Initial scope

India-first.

Default currency should be Indian Rupees.

```text
₹ INR should be default.
```

A currency toggle may be included later for USD/global use, but the first version should be India-focused because:

- Cost assumptions differ by country.
- Procedure pricing differs by geography.
- Loan/lease norms differ.
- Tax and depreciation expectations differ.
- Equipment utilization patterns differ.
- Payer mix and collection delays differ.
- Government schemes and insurance behavior differ.

### 5.2 Currency idea

Potential future toggle:

```text
INR / USD
```

But if USD is added later, the assumptions should not merely be converted mechanically. The underlying cost, pricing, and financing context should be adapted.

---

## 6. What the Tool Should Help Answer

The tool should help answer questions like:

```text
Is this equipment financially viable for this hospital?
```

```text
How many scans/procedures/tests/sessions per day are required to break even?
```

```text
How long will it take to recover the investment?
```

```text
What is the expected ROI?
```

```text
What happens if utilization is lower than expected?
```

```text
How does cash purchase compare with loan or lease?
```

```text
What is the difference between billed revenue and actual cash received?
```

```text
How much working capital is needed before cash collections stabilize?
```

```text
What happens when the warranty ends and AMC/CMC begins?
```

```text
Can this proposal be exported into Excel or a Word report for discussion?
```

---

## 7. Product Flow

High-level flow:

```text
1. Select equipment
2. Enter basic investment details
3. Estimate usage and revenue
4. Add operating costs
5. View first-pass decision dashboard
6. Open advanced financial assumptions if needed
7. Review cash-flow, financing, and risk dashboard
8. Export Excel / Word report / ZIP package
```

Possible wizard-style layout:

```text
Step 1: Equipment
Step 2: Investment
Step 3: Usage & Revenue
Step 4: Operating Costs
Step 5: Results
Step 6: Advanced Model
Step 7: Export
```

The main interface should avoid feeling like a spreadsheet at first. Spreadsheet-level depth should exist, but behind an advanced panel, methodology view, or export.

---

## 8. Equipment Library

The tool should not be only an MRI or CT calculator. It should be broad enough to cover major hospital capex categories.

### 8.1 Equipment categories

#### Imaging / Radiology

- MRI
- CT Scan
- X-Ray
- Ultrasound
- Mammography
- Cath Lab

#### Lab Diagnostics

- Fully automated biochemistry analyzer
- Hematology analyzer
- Immunoassay analyzer
- Pathology setup

#### Critical Care / OT

- Ventilator
- Anesthesia workstation
- Laparoscopy tower
- Modular OT

#### Treatment / Revenue Units

- Dialysis unit
- Endoscopy unit
- Physiotherapy setup

#### Custom Equipment

A generalized custom equipment calculator should allow the user to enter:

- Equipment name
- Purchase cost
- Usage per day
- Revenue per use
- Cost per use
- Professional fee per use
- Other monthly costs
- Financing assumptions
- Useful life
- Warranty / maintenance assumptions

Custom mode is important because the general ROI/NPV model should work for any equipment, even if there is no predefined template.

---

## 9. Suggested Version 1 Equipment Scope

Although the long-term library can include many equipment types, version 1 should probably not attempt everything.

Recommended v1 supported equipment:

1. MRI
2. CT Scan
3. Cath Lab
4. Dialysis unit
5. Ultrasound
6. Custom Equipment

Reason:

These are financially meaningful, familiar in hospital administration, and sufficiently complex to prove the model.

They also naturally demonstrate the healthcare-specific issues that make this tool more serious:

- MRI / CT: utilization, radiologist fee, high capex, AMC/CMC, payer mix
- Cath Lab: high procedure value, specialist payout, consumables/stents, insurance/TPA delay
- Dialysis: recurring sessions, consumables, package pricing, predictable utilization
- Ultrasound: lower capex but high doctor/sonologist dependency
- Custom: generalized model flexibility

Version 2 can add:

- X-Ray
- Mammography
- Biochemistry analyzer
- Hematology analyzer
- Immunoassay analyzer
- Ventilator
- Modular OT
- Laparoscopy tower
- Endoscopy unit
- Physiotherapy setup

---

## 10. Basic Mode

Basic Mode should be administrator-friendly.

It should ask only for inputs that an owner/administrator/operations person can reasonably estimate or obtain from a vendor quote, tariff sheet, or internal discussion.

Basic Mode should not be overloaded, but it must include the minimum inputs needed to avoid false break-even results.

### 10.1 Basic Mode inputs

```text
Equipment category
Equipment name / model, optional
Hospital bed size
City / tier (required — same benchmarking-lookup role as bed size)
Hospital type: private / charitable-trust / corporate / government, optional
Purchase cost
Installation / civil cost
Expected months before revenue starts
Expected usage per day
Average billed revenue per use
Working days per month
Consumable cost per use
Professional / reporting fee per use
Other variable cost per use
Staff cost per month
Electricity / utility cost per month
Other fixed operating cost per month
Warranty period
AMC / CMC cost after warranty
Acquisition mode: cash / loan / lease, optional quick selection
```

### 10.2 Why professional / reporting fee belongs in Basic Mode

For many high-value healthcare equipment decisions, specialist payout is not a minor detail.

Examples:

```text
MRI / CT: Radiologist reporting fee per scan
Ultrasound: Sonologist fee per scan
Cath Lab: Cardiologist / cath team fee per procedure
Dialysis: Nephrologist / technician variable cost per session
Custom: Professional fee per use
```

If this cost is hidden only inside Advanced Mode, the break-even calculation may be wrong. Therefore, Basic Mode should include it as an optional but visible per-use field.

### 10.3 Possible wording improvements

Use “usage per day” as the generalized field instead of “tests per day” or “scans per day.”

For equipment-specific modes, the label can adapt:

```text
MRI: Scans per day
CT: Scans per day
Dialysis: Sessions per day
Cath Lab: Procedures per month or procedures per day
Ultrasound: Scans per day
Custom: Usage per day
```

Revenue field should be called:

```text
Average billed revenue per use
```

not just:

```text
Revenue per use
```

because Advanced Mode may later convert billed revenue into realized revenue after payer deductions and collection delay.

### 10.4 Basic outputs

Basic Mode should show:

```text
Estimated billed monthly revenue
Estimated monthly variable cost
Estimated monthly fixed operating cost
Estimated monthly operating surplus before financing
Annual billed revenue
Annual operating cost
Simple payback period
Simple ROI %
Break-even usage per day
Investment outlook
Key risk note
```

Basic Mode should also include a soft note:

```text
This first-pass view is based on billed revenue. Open Advanced Financial Assumptions to model payer deductions, collection delays, loan EMI timing, and working capital requirement.
```

---

## 11. Advanced Mode

Advanced Mode should be hidden initially and revealed only when the user wants deeper financial modelling.

Possible label:

```text
Advanced financial assumptions
```

Advanced Mode is where the tool becomes CFO-grade.

### 11.1 Advanced Mode input groups

#### A. Revenue realization and payer mix

```text
Private cash %
Insurance / TPA %
Corporate credit %
PM-JAY / government scheme %
Other payer %
Average billed tariff by payer type
Expected realization % by payer type
Expected claim deduction / disallowance % by payer type
Collection delay / DSO by payer type
```

#### B. Utilization ramp-up

```text
Month 1–3 utilization %
Month 4–6 utilization %
Month 7–12 utilization %
Year 2 onward utilization %
Expected mature utilization
Seasonality adjustment, optional later
```

#### C. Financing

```text
Cash purchase / loan / lease
Down payment
Loan amount
Interest rate
Loan tenure
Processing charges
EMI start month
Moratorium period, if any
Lease rental, if lease mode is selected
Lease tenure, if lease mode is selected
```

#### D. Launch delay and pre-opening cost

```text
Civil work duration
Installation duration
Licensing / approval duration
Training / commissioning duration
Expected revenue start month
Pre-opening fixed costs
Pre-operative interest
Working capital buffer
```

#### E. Maintenance and lifecycle cost

```text
Warranty period
AMC cost by year
CMC cost by year
Maintenance inflation
Major replacement cost, optional
Downtime assumption, optional later
```

#### F. Financial model assumptions

```text
Discount rate
Inflation rate
Useful life
Salvage value
Depreciation method
Tax assumptions, optional
Price escalation
Cost escalation
Scenario assumptions
```

### 11.2 Advanced outputs

```text
Net realized revenue
Cash received by month
Monthly operating cash flow
Cash flow after EMI
Working capital gap
NPV
IRR
Discounted payback period
Equivalent Annual Cost
Opportunity cost note
Loan EMI
Interest burden
Annual cash flow
Cumulative cash flow
Sensitivity analysis
Scenario comparison
Maintenance cliff warning
Launch delay warning
```

---

## 12. Financial Output Definitions

This section is important because terms like revenue, surplus, profit, and cash flow can become misleading if used loosely.

The tool should define outputs clearly.

### 12.1 Billed revenue

```text
Billed revenue = Value charged to patient / payer before deductions, disallowances, package constraints, or collection delay.
```

Example:

```text
25 scans/day × ₹7,500 billed tariff × 25 working days = ₹46,87,500 billed monthly revenue
```

### 12.2 Realized revenue

```text
Realized revenue = Expected collectible revenue after payer-specific deductions, discounts, package rates, and disallowances.
```

Example:

```text
Insurance billed tariff may be ₹7,500, but expected realization may be 85% after deductions.
```

### 12.3 Cash received

```text
Cash received = Realized revenue shifted according to expected collection delay / DSO.
```

Example:

```text
Cash patients may pay immediately.
TPA revenue may be collected after 60 days.
Government scheme revenue may be collected after 90 days or more.
```

### 12.4 Variable cost per use

```text
Variable cost per use = Consumables + professional/reporting fee + other per-use costs.
```

### 12.5 Contribution per use

```text
Contribution per use = Realized revenue per use - variable cost per use.
```

### 12.6 Fixed monthly cost

```text
Fixed monthly cost = Staff cost + utilities + fixed maintenance allocation + other fixed operating expenses.
```

### 12.7 Operating surplus

```text
Operating surplus = Revenue - operating costs before financing, tax, and depreciation.
```

### 12.8 Cash flow after EMI

```text
Cash flow after EMI = Operating cash flow - loan EMI / lease payment.
```

### 12.9 Accounting profit

```text
Accounting profit = Operating surplus after depreciation, interest, and tax assumptions, if accounting mode is enabled.
```

For v1, the main dashboard should focus on operating surplus and cash flow rather than pretending to produce a fully audited accounting profit.

---

## 13. Revenue, Usage, Utilization, and Realization

### 13.1 Important distinction

This tool is not projecting total hospital revenue growth.

It is evaluating whether adding a particular machine/equipment/service is financially viable.

Therefore, avoid calling this “revenue growth.”

Better term:

```text
Utilization ramp-up
```

### 13.2 Why utilization ramp-up matters

A new MRI, CT, Cath Lab, or dialysis unit may not operate at full capacity from day one.

Example:

```text
Month 1–3: 30% utilization
Month 4–6: 50% utilization
Month 7–12: 70% utilization
Year 2 onward: 80% utilization
```

This should be included as an advanced assumption.

### 13.3 Basic usage model

Simple version:

```text
Billed monthly revenue = Usage per day × Average billed revenue per use × Working days per month
```

### 13.4 Advanced revenue model

Advanced version:

```text
Payer-wise billed revenue
× Expected realization percentage
= Net realized revenue
```

Then:

```text
Net realized revenue shifted by collection delay / DSO
= Cash received by month
```

Example payer mix:

```text
Private cash: 60%
Insurance/TPA: 25%
PM-JAY/government scheme: 15%
```

Example realization:

```text
Private cash: 98–100% realization, immediate collection
Insurance/TPA: 80–95% realization, 45–90 day collection delay
Government scheme: package-rate realization, delayed collection depending on scheme and process
```

These values should not be hardcoded without research. They should be editable and source-backed if benchmarks are shown.

---

## 14. Revenue Realization and Working Capital

This is a core v0.2 addition.

The tool must not assume that billed revenue becomes cash on day one.

In Indian healthcare, especially where payer mix includes insurance, TPA, corporate credit, or government schemes, actual cash collection may be delayed and may be lower than the billed amount.

### 14.1 Why this matters

A hospital may buy equipment on loan. EMI may begin soon after disbursement, but cash from TPA or government payer claims may come much later.

This creates a working capital gap.

The tool should therefore model:

```text
Billed revenue
Expected deductions / disallowances
Net realized revenue
Collection delay / DSO
Cash received by month
Cash flow after EMI
Working capital gap
```

### 14.2 Dashboard warning example

```text
Cash-flow warning: EMI begins before projected collections stabilize. Based on the entered payer mix and collection delay, the project may require approximately ₹X working capital support during the first Y months.
```

### 14.3 Basic vs Advanced handling

Basic Mode should not ask every DSO question upfront.

Instead:

- Basic Mode calculates first-pass billed revenue.
- Advanced Mode models net realization and collection timing.
- Results should label the difference clearly.

The dashboard should provide two views:

```text
Accounting / billed view
Cash-flow view
```

### 14.4 Cash-flow horizon contract (added 2026-07-13, capexiq-prebuild-assurance PBA-3)

`formulas/dso.ts`'s `cashReceivedByMonth()` returns a series **longer** than the input
revenue series it's given — extended by the largest payer's collection delay, in
months, because a delayed collection can land after the last month of the projection
that generated it. This is deliberate and must be preserved end to end:

- **Every consumer that sums or discounts cash flows (NPV, IRR, the annual cash-flow
  summary, the working-capital-gap metric) must use the full DSO-extended series, never
  truncate it to the original projection-horizon length before summing.** Over the full
  extended series, total cash received always equals total realized revenue exactly
  (cash conservation — nothing is ever actually lost, only delayed). Truncating to a
  fixed horizon before summing silently drops the tail and makes a temporary collection
  delay look like a permanent, unresolved revenue loss.
- **Collections may land after `usefulLifeYears`** if DSO requires it, and that's
  correct, not a bug — the cash was earned by revenue generated during the equipment's
  life; refusing to collect it past an arbitrary horizon would fabricate a loss.
- **The only legitimate revenue write-off is a separate, explicitly modeled bad-debt /
  ultimate-collection-rate parameter** (e.g., a payer type whose realization or
  collection percentage is deliberately below 100%) — never an artifact of where the
  projection table happens to end. A fixed-length display table (e.g., an Excel annual
  summary capped at `usefulLifeYears` rows) may show the *display* truncated, with any
  still-in-transit collections rolled into a "collections in transit" footer line, but
  the underlying NPV/IRR/working-capital math must never be computed from the truncated
  view.

See `report-templates/formula-appendix.md` §1.4 for the formula-level statement of the
same rule.

---

## 15. PM-JAY, Insurance, TPA, and NABH Considerations

### 15.1 PM-JAY

PM-JAY should not be central by default.

It matters only if payer mix is included.

Example:

```text
Private cash: 60%
Insurance/TPA: 25%
PM-JAY/government scheme: 15%
```

This affects average realization per scan/procedure.

Therefore, PM-JAY can be included in advanced payer-mix assumptions, not as a core required field.

### 15.2 Insurance and TPA

Insurance and TPA should be included in Advanced Mode because they can materially affect:

```text
Realization percentage
Claim deductions
Days sales outstanding
Cash-flow timing
Working capital requirement
```

### 15.3 NABH

NABH should not be central to the financial calculator.

NABH may be relevant only as a context note around quality, compliance, empanelment, or operational readiness, but it should not be part of the core ROI/NPV model unless a later use case specifically requires compliance-cost modelling.

---

## 16. Time-to-Revenue, Launch Delay, and Pre-Operative Interest

This is a core v0.2 addition.

Large healthcare equipment is rarely plug-and-play.

For equipment such as MRI, CT, Cath Lab, X-Ray, modular OT, and other infrastructure-linked services, revenue may start only after:

```text
Civil work
Room preparation
Shielding or structural work
Electrical and HVAC readiness
Vendor installation
Calibration and commissioning
Licensing or regulatory approval
Staff training
Doctor onboarding
Referral and demand development
```

### 16.1 Basic Mode handling

Basic Mode should include:

```text
Expected months before revenue starts
```

Default:

```text
0 months
```

This allows a simple but useful launch delay.

### 16.2 Advanced Mode handling

Advanced Mode can break this into:

```text
Civil work duration
Installation duration
Licensing / approval duration
Commissioning duration
Training duration
Expected revenue start month
Pre-opening fixed cost
Pre-operative interest
```

### 16.3 EMI timing issue

The model should distinguish:

```text
Investment date
Loan disbursement date
EMI start date
Revenue start date
Cash collection start date
```

If EMI starts before revenue, the dashboard should warn the user.

Example:

```text
EMI starts in Month 1, but revenue starts in Month 4. The project has a pre-revenue debt-service period of 3 months.
```

---

## 17. Depreciation

Depreciation should be kept simple.

Initial recommendation:

```text
Straight-line depreciation
```

Inputs:

```text
Useful life
Salvage value
```

Formula:

```text
Annual depreciation = (Purchase cost - Salvage value) / Useful life
```

Avoid too much complexity in v1. If someone needs extremely detailed depreciation/tax modelling, they may already have a finance team and a dedicated spreadsheet.

Advanced Mode may later support:

```text
Written down value method
Tax depreciation assumptions
Book depreciation vs tax depreciation
```

But v1 should prioritize transparent and testable modelling.

---

## 18. Inflation and Discount Rate

### 18.1 Inflation

Inflation can affect:

- Operating expenses
- AMC/CMC
- Consumables
- Staff cost
- Professional fee per use
- Electricity / utility cost
- Possibly revenue per use, if the user chooses to escalate price annually

This should be in Advanced Mode.

### 18.2 Discount rate

Used for NPV calculation.

No sourced benchmark exists yet for an Indian private-healthcare-capex cost-of-capital
figure — a prior draft of this section cited `data-requirements.md` §12.3 for a 12.0%
default, but that citation was false (§12.3 has no discount-rate row; see ISSUES.md
ISS-9). Until real research lands, the tool must ship with this field genuinely
unset/user-entered rather than a fabricated-looking default, and must let the user edit
it in the Advanced assumptions or settings pane, dynamically recalculating NPV in
real-time. See `equipment-data/common-assumptions.json`.

### 18.3 Target IRR (Hurdle Rate)

Used to evaluate the Investment Outlook.

Same problem as §18.2: a prior draft cited a 15.0% default as "sourced from
`data-requirements.md` §12.3," which is false — no such row exists. Confirmed
unresearchable after two research passes (`ISSUES.md` ISS-9, `data-requirements.md`
§17.2) — no fabricated benchmark is ever shown for this field.

**Resolved 2026-07-12** (UI assurance audit finding F1, Jay's decision) — see
`design/ux-product-spec.md` §6 and `agent-build-plan.md` Phase 5: rather than leaving
this genuinely blank (which would block Basic Mode's step-gate on an unresearchable
field), the wizard auto-fills it with a computed heuristic (`discountRate + 400bps`),
shown with the same "Typical" tag every sourced default uses, and its tooltip states
explicitly that this is a suggested starting point, not a researched number — the field
stays fully user-editable. The Investment Outlook score itself does not consume this
field directly (`financial-model-spec.md` §1.6 uses `discountRate` as the hurdle); its
only role is this UI comparison/starting-value.

Do not hardcode unsupported assumptions without sources.

---

## 19. Financing Module

The tool should support different acquisition methods.

### 19.1 Modes

```text
Cash purchase
Loan purchase
Lease
```

### 19.2 Loan inputs

```text
Down payment
Loan amount
Interest rate
Loan tenure
Processing charges, optional
Moratorium period, optional
EMI start month
```

### 19.3 Loan outputs

```text
Monthly EMI
Total interest paid
Debt service impact
Cash flow after EMI
Pre-revenue EMI burden
Debt service coverage style note, optional later
```

This module should be optional and probably appear after the basic ROI result, not before.

The user should first understand whether the equipment makes operational sense, then evaluate financing.

---

## 20. Warranty, AMC, CMC, and Maintenance Cliff

This is a core v0.2 addition.

The original simple field “Maintenance / AMC per year” is not enough.

Many medical equipment purchases include a warranty period. AMC/CMC may begin only after the warranty ends, often creating a later-year cost cliff.

### 20.1 Basic Mode handling

Basic Mode should ask:

```text
Warranty period
AMC / CMC cost after warranty
```

### 20.2 Advanced Mode handling

Advanced Mode should allow year-wise maintenance schedule:

```text
Year 1: Warranty / ₹0
Year 2: Warranty / ₹0
Year 3: AMC ₹X
Year 4: CMC ₹Y
Year 5: CMC ₹Y with inflation
```

### 20.3 Dashboard insight

The dashboard should not average away the maintenance cliff.

It should show a note like:

```text
Year 1 and Year 2 cash flows appear stronger because warranty is active. AMC/CMC begins in Year 3 and reduces annual surplus by ₹X.
```

---

## 21. Decision Dashboard

The results page should be clear, professional, and not misleading.

### 21.1 Avoid only saying

```text
Buy / Don’t Buy
```

That is too simplistic.

### 21.2 Better output

```text
Investment Outlook: Strong / Moderate / Caution / Weak
Score: 78 / 100
```

Then show objective metrics:

```text
Simple payback: 3.8 years
ROI: 24%
NPV: ₹1.4 crore
IRR: 18.2%
Break-even: 11 scans/day
Working capital gap: ₹X during first Y months
Cash-flow stabilization month: Month Z
```

### 21.3 Dashboard views

The dashboard should include:

```text
Billed revenue view
Realized revenue view
Cash-flow after EMI view
```

This is important because the same project may look profitable on billed revenue but stressful on cash flow.

### 21.4 Risk insight

Show one or two clear risk statements:

```text
Main risk: Profitability is most sensitive to daily utilization.
```

```text
If usage falls below 11 scans/day, the investment may not break even within the expected useful life.
```

```text
Cash-flow risk: TPA/government collections are delayed compared with EMI obligations.
```

```text
Maintenance risk: AMC/CMC begins in Year 3 and materially reduces annual surplus.
```

### 21.5 Scoring caution

A score is useful visually, but it should not hide the assumptions.

The tool should always make it clear that the score is based on user-entered assumptions and editable benchmarks.

---

## 22. Calculation Transparency

Every result should allow the user to see how it was calculated.

Use expandable panels such as:

```text
Show calculation background
```

Example:

```text
Billed monthly revenue
= Usage per day × Billed revenue per use × Working days per month
= 25 × ₹7,500 × 25
= ₹46,87,500
```

Example:

```text
Realized monthly revenue
= Billed revenue × Expected realization percentage
= ₹46,87,500 × 90%
= ₹42,18,750
```

Example:

```text
Contribution per use
= Realized revenue per use - Consumables per use - Professional fee per use - Other variable cost per use
```

This should be done for:

- Billed revenue
- Realized revenue
- Cash received by month
- Variable costs
- Fixed costs
- Monthly surplus
- Cash flow after EMI
- Payback
- ROI
- Break-even usage
- NPV
- IRR explanation
- EMI
- Depreciation
- AMC/CMC impact
- Working capital gap

This is important because administrators and finance teams need trust, not just outputs.

---

## 23. Benchmark Ranges and Tooltips

The tool can provide typical ranges, but only if grounded in real data.

### 23.1 Important caution

Do not show random generic industry ranges.

For example, do not show something like:

```text
MRI scans/day: 18–35
```

unless it is properly researched and contextualized.

### 23.2 Primary data beats scraped benchmark data

For major assumptions, the tool should prefer:

```text
Vendor quotation
Hospital tariff sheet
Hospital internal utilization data
Actual payer contracts
Actual loan quote
Actual AMC/CMC quote
```

over generic web-scraped benchmarks.

Benchmarks should support the user, not pretend to replace primary data.

### 23.3 Better benchmark structure

Ranges should depend on:

```text
Hospital bed size
City/tier
Equipment type
Service type
Machine configuration
New vs refurbished status
Ownership type, if relevant
Payer mix, if relevant
```

Example tooltip idea:

```text
Typical range for 100-bed hospital in Tier 2 city: X–Y scans/day.
Source: [to be researched]
Confidence: Medium.
Applicability: Use only as directional context. Prefer your own hospital’s utilization estimate.
```

### 23.4 UI pattern (Click-to-Open Tooltip Callout)

Hover-based tooltips are rejected due to poor touch-screen and mobile support. The tool must implement click-triggered callout popovers:

**Wizard exception, added 2026-07-11** (`design/ux-product-spec.md` §4.B): while
entering data in the wizard specifically, fields don't use this popover pattern at
all — the definition and direction (slots 1-2 below) are always visible as plain text
under the field, no click required. The click-popover pattern below applies outside
the wizard (dashboard, results, everywhere else), plus an inline (non-popover)
"more info" expansion inside the wizard for the remaining slots. See
`design/ux-product-spec.md` §4 for the full mechanism and the 7-slot content
structure (`content/tooltip-copy.md`), which supersedes the 4-slot schema sketched
below.

*   **Trigger**: A small `?` question-mark circle icon next to each complex input label.
*   **Behavior**: Clicking the trigger toggles a small relative callout box (popover dialog). Clicking outside or clicking a close button dismisses it.
*   **Central Registry**: Control type classifications (sliders vs. static input boxes), slider bounds, and tooltip texts are stored cohesively in [inputs-metadata.json](file:///Users/jay/Documents/Roi_Calculator/content/inputs-metadata.json) to avoid duplication. The actual default *values* are not stored there — they live in `equipment-data/<type>.json` (equipment-specific) or `equipment-data/common-assumptions.json` (shared), each carrying its own confidence/sourceId, per the fix in ISSUES.md ISS-9.
*   **Content Schema**: Each popover contains:
    1.  **Professional Definition**: Standard business/medical description of the variable.
    2.  **Default Value**: Sourced from `data-requirements.md` benchmarks where one exists (e.g., 13 years useful life for diagnostics per Companies Act, S8, High confidence, or discount rate at 12.5% typical, Medium confidence). Where no benchmark exists at all (target IRR is the one such field — see ISSUES.md ISS-9 and §18.3's 2026-07-12 resolution for its labeled-heuristic exception), the popover must say so explicitly ("no benchmark available, enter your own estimate") rather than showing a number that looks sourced but isn't.
    3.  **Higher Value Impact**: Clear description of what increasing this variable does to ROI, NPV, payback, or risk.
    4.  **Lower Value Impact**: Clear description of what decreasing this variable does to the financial model.

### 23.5 Control Types: Sliders vs. Input Boxes

Input controls are categorized to balance interactive scenario modeling with numeric precision:

*   **Sliders**: Used for highly dynamic operational variables that users "play with" to observe real-time chart updates:
    *   *Usage per Day* (scans/sessions/procedures)
    *   *Average Billed Tariff per Use* (INR scan price)
    *   *Working Days per Month* (Days)
    *   *Moratorium / Launch Delay* (Months)
    *   *Payer Mix %* (linked sliders summing to 100%)
*   **Input Boxes**: Used for precise capital, structural, and financial benchmarks:
    *   *Purchase Cost (Capex)* (INR)
    *   *Salvage Value %* (Percentage)
    *   *Useful Life (Years)* (Years)
    *   *Consumables Cost per Use* (INR)
    *   *Professional Fee per Use* (INR)
    *   *Fixed Monthly Operating Costs* (INR)
    *   *Financing Interest Rate %* and *Tenure* (Months)
    *   *Discount Rate %* and *Target Hurdle IRR %*

---

## 24. Research and Data Requirements

A separate Markdown file should be created later for the research agent.

Working file name:

```text
data-requirements.md
```

The research file should ask an internet-enabled agent to collect grounded Indian data.

### 24.1 Data required

For each equipment type, collect:

```text
Equipment cost ranges in India
Typical useful life
Warranty norms
AMC/CMC ranges
Consumable cost ranges
Professional/reporting fee norms, if available
Space/civil requirements
Licensing / regulatory requirements
Typical installation timelines
Typical usage ranges by hospital size
Average procedure/test pricing
Payer-wise realization issues
Electricity/power assumptions
Staffing assumptions
Depreciation assumptions
Loan/lease market assumptions
Relevant formula references
```

### 24.2 Research quality requirements

The agent should return:

```text
Value / range
Source URL
Source name
Date accessed
Confidence level
Notes / caveats
Applicability limitations
```

Instruction to research agent:

```text
Do not invent values. If reliable data is unavailable, say unavailable and suggest what primary data would be needed.
```

### 24.3 Benchmark warning for implementation

If data confidence is low, the UI should say so.

Example:

```text
Benchmark unavailable or low confidence. Please use vendor quotation or hospital-specific data.
```

The tool should never force a weak benchmark into the user’s model.

---

## 25. Visual Design Direction

The tool should look professional, white, serious, and non-generic.

### 25.1 Avoid

- Startup-style purple gradients
- Overly playful cards
- Generic SaaS design
- Loud colors
- Too many icons
- Cartoonish visuals
- Too much visual noise

### 25.2 Use

```text
White / off-white background
Soft borders
Minimal shadows
Clean typography
Calm spacing
Financial dashboard seriousness
Restrained color coding
```

### 25.3 Color logic

```text
Green: strong / viable / positive
Amber: caution / borderline
Red: weak / risk / negative
Blue/gray: neutral informational elements
```

Colors should not dominate the page.

### 25.4 Typography suggestions

For general UI:

```text
Inter
IBM Plex Sans
Source Sans 3
```

For financial outputs / tabular numbers:

```text
IBM Plex Mono
Tabular numerals
```

This can make financial values feel more structured and serious.

### 25.5 Interactive Component Specifications (Sliders & Tooltip Callouts)

All interactive UI components are built using the following design specifications, mapped directly to variables in `tokens.css`:

#### A. Slider Styling (Custom Range Inputs)
*   **Track Height / Thickness**: `4px` (for a thin, clean look) or `6px` on active focus.
*   **Track Color**: Background track `var(--border-subtle)` (`#E6E4E0`); active fill track `var(--status-neutral)` (`#3E5C76`).
*   **Thumb Shape**: Perfect circle, diameter `18px` or `20px`.
*   **Thumb Color**: Solid `var(--accent-interactive)` (`#3E5C76`) outer boundary with a `4px` concentric center dot of `var(--bg-primary)` (`#FFFFFF`). **Updated 2026-07-11** — was `--accent-navy`; the "Signal" theme (`design/ux-product-spec.md` §1) narrows `--accent-navy` to header/logo/dark-surface use only, so interactive elements like this thumb use `--accent-interactive` instead.
*   **Hover & Focus State**: Thumb scales to `22px` on hover. Focus adds a soft ring of `0 0 0 3px var(--status-neutral-bg)` (`rgba(62, 92, 118, 0.15)`).
*   **Value Indicator**: The numerical value is displayed directly above or adjacent to the slider in `var(--font-mono)` with a medium weight (`500`).

#### B. Tooltip Callout Box Styling (Popover Dialogs)
*   **Dimensions**: Auto width with a maximum width of `280px` (or `320px` on larger screens) to prevent blocking main content.
*   **Background**: Solid `var(--bg-primary)` (`#FFFFFF`).
*   **Border & Radius**: `1px solid var(--border-default)` (`#D8D6D1`); radius `var(--radius-sm)` (`6px`).
*   **Shadow Elevation**: Standard `var(--shadow-modal)` (`0 4px 16px rgba(28, 28, 26, 0.10)`) for crisp elevation against off-white panels.
*   **Padding**: `12px` padding on all sides, standard typography sizing (body text `12px` or `13px`, headings `14px`).
*   **Relative Alignment**: Renders dynamically above or below the `?` icon. Displays a small CSS triangle arrow pointing directly at the trigger icon.
*   **Dismissal**: Dismissed by clicking outside, clicking the close `x` icon, or clicking the trigger again.
*   **Typography**: Popover title in `var(--font-ui)` bold; numeric values/benchmarks formatted in `var(--font-mono)` (`#1C1C1A`); general copy in `var(--text-secondary)` (`#5C5B57`).

---

## 26. Interface Ideas

### 26.1 Landing page

**Resolved 2026-07-11** — see `design/ux-product-spec.md` §5 for the finalized
structure, entry flow, and CTA wording ("Start Assessment," superseding "Start
Evaluation" below; "Explore Methodology" becomes a header/footer link, not a second
hero CTA). The hero tagline and subtext below are still accurate and unchanged.

Should be crisp and serious.

Possible hero:

```text
CapexIQ
Know if it pays for itself, before you buy it.
```

Subtext:

```text
Evaluate hospital equipment investments using ROI, payback, NPV, IRR, break-even analysis, cash-flow timing, utilization sensitivity, and export-ready financial models.
```

CTA:

```text
Start Evaluation
```

Secondary CTA:

```text
Explore Methodology
```

### 26.2 Main calculator/evaluation flow

Use a step-by-step form.

Do not show every field at once.

### 26.3 Results dashboard

Show:

- Investment outlook
- Key metric cards
- Billed revenue vs realized revenue comparison
- Break-even chart
- Cumulative cash flow chart
- EMI / working capital warning
- Warranty / AMC cliff note
- Assumption summary
- Advanced financial metrics
- Export options

---

## 27. Visualizations

Charts should be used to make the decision easier to understand.

Recommended charts:

```text
Break-even graph
Cumulative cash flow timeline
Revenue vs operating expense
Billed revenue vs realized revenue
Cash received by month
Annual cash flow
Maintenance cliff chart
Sensitivity chart
Scenario comparison chart
```

Potential later charts:

```text
NPV waterfall
Utilization sensitivity curve
Loan vs cash comparison
Working capital gap timeline
```

Charts should be clean and restrained, not flashy.

---

## 28. Scenario Analysis

The tool should eventually allow scenario comparison.

### 28.1 Scenarios

```text
Conservative
Base case
Optimistic
```

Or user-created scenarios:

```text
MRI Option A
MRI Option B
CT Upgrade
Cath Lab Expansion
```

### 28.2 Compare option

After completing one evaluation, user can choose:

```text
Add another scenario
Compare equipment options
```

The comparison should show:

```text
Capex
Monthly billed revenue
Monthly realized revenue
Monthly operating surplus
Cash flow after EMI
Payback
ROI
NPV
IRR
Break-even usage
Working capital gap
Risk level
```

This is valuable for administrators comparing vendor quotes or different equipment options.

---

## 29. Exports

Export is one of the strongest features.

Hospital administrators and finance managers like Excel because they can inspect, edit, forward, and present the model.

### 29.1 Export options

```text
Download Excel Model
Download Word Proposal
Download ZIP Package
```

### 29.2 ZIP package contents

```text
1. Financial Model.xlsx
2. Proposal Report.docx
3. Charts/
4. Assumptions Summary.pdf, optional later
```

### 29.3 Excel model should include

```text
Inputs
Assumptions
Payer mix and realization assumptions
Launch delay assumptions
Monthly billed revenue
Monthly realized revenue
Monthly cash received
Monthly operating costs
Monthly EMI / lease payment
Monthly cash flow after EMI
Working capital gap
Annual summary
NPV / IRR
Break-even analysis
Warranty and AMC/CMC schedule
Sensitivity analysis
Charts
Formula notes
```

### 29.4 Word report should include

```text
Executive summary
Investment overview
Key assumptions
Financial results
Billed vs realized revenue note
Cash-flow and working capital note
Financing summary
Warranty / AMC / CMC note
Charts
Risk notes
Methodology
Formula appendix
Disclaimer
```

### 29.5 Important export philosophy

The website should not just calculate. It should help create an actual proposal.

The exported model should be transparent enough that a finance person can inspect and challenge it.

**Resolved 2026-07-07:** this means live, embedded Excel formulas (cells reference an
Assumptions sheet, e.g. `=Assumptions!B4*...`), not static computed values — "inspect and
challenge" requires being able to click into a cell and trace it. See
`agent-build-plan.md` Phase 4-H and Phase 8.

---

## 30. Narrative Summary

The tool should generate a professional written summary.

Example:

```text
Based on the entered assumptions, the proposed MRI investment shows a simple payback period of 3.8 years and an estimated ROI of 24% on the billed-revenue view. After adjusting for payer realization and collection delay, the project requires approximately ₹X working capital support during the first Y months. Sensitivity analysis indicates that daily utilization, average realization per scan, and professional fee per scan are the most important drivers of financial performance.
```

This summary can appear on the results page and be included in the Word report.

The summary should be factual and assumption-based, not overconfident.

Avoid:

```text
This investment is definitely profitable.
```

Use:

```text
Under the entered assumptions, the investment appears financially viable, but the result is sensitive to utilization and payer realization.
```

---

## 31. Formula Concepts

### 31.1 Billed monthly revenue

```text
Billed monthly revenue = Usage per day × Average billed revenue per use × Working days per month
```

### 31.2 Realized revenue per use

```text
Realized revenue per use = Weighted average of payer-wise billed tariff × realization percentage
```

### 31.3 Monthly realized revenue

```text
Monthly realized revenue = Usage per day × Realized revenue per use × Working days per month
```

### 31.4 Cash received by month

```text
Cash received in month t = Realized revenue from prior months shifted according to payer-wise collection delay / DSO
```

### 31.5 Monthly variable cost

```text
Monthly variable cost = Usage per day × Variable cost per use × Working days per month
```

### 31.6 Variable cost per use

```text
Variable cost per use = Consumable cost per use + Professional/reporting fee per use + Other variable cost per use
```

### 31.7 Monthly fixed operating cost

```text
Monthly fixed operating cost = Staff cost + Utilities + Fixed maintenance allocation + Other fixed costs
```

### 31.8 Monthly operating cost

```text
Monthly operating cost = Monthly variable cost + Monthly fixed operating cost
```

### 31.9 Monthly operating surplus

```text
Monthly operating surplus = Monthly realized revenue - Monthly operating cost
```

### 31.10 Cash flow after EMI

```text
Cash flow after EMI = Cash received - Operating cash expenses - EMI / lease payment
```

### 31.11 Payback period

```text
Payback period = Initial investment / Annual net cash flow
```

For simple payback, use annual operating surplus.

For cash payback, use cumulative cash flow after EMI and launch delay.

### 31.12 ROI

```text
ROI = Annual net return / Initial investment × 100
```

The UI should clarify whether ROI is based on billed view, realized view, or cash-flow view.

### 31.13 Break-even usage

```text
Break-even usage per day = Fixed monthly cost / Contribution per use / Working days per month
```

Where:

```text
Contribution per use = Realized revenue per use - Variable cost per use
```

### 31.14 NPV

```text
NPV = Sum of discounted future cash flows - Initial investment
```

### 31.15 IRR

```text
IRR = Discount rate at which NPV becomes zero
```

### 31.16 Straight-line depreciation

```text
Annual depreciation = (Purchase cost - Salvage value) / Useful life
```

### 31.17 Pre-operative interest

```text
Pre-operative interest = Interest accrued during the period before commercial revenue starts
```

This may be shown separately or added to project cost depending on the selected model setting.

---

## 32. Suggested Technical Architecture

This needs to be agent-friendly.

Note: the original draft nested the app under `/app/roi` because the tool was meant to
live at the path `jaybharti.me/roi`. Since the project now lives on its own subdomain
(`capexiq.jaybharti.me`, §1/§34), the whole app is the root route — no `/roi` nesting
needed. Structure below reflects that.

Possible structure:

```text
/app
  page.tsx
  components/
  forms/
  results/
  charts/
  advanced/

/equipment-data
  mri.json
  ct.json
  cath-lab.json
  dialysis.json
  ultrasound.json
  custom.json

/formulas
  revenue.ts
  realization.ts
  dso.ts
  workingCapital.ts
  roi.ts
  npv.ts
  irr.ts
  depreciation.ts
  breakEven.ts
  emi.ts
  maintenance.ts
  launchDelay.ts
  sensitivity.ts

/report-templates
  word-report-template.md
  excel-sheet-structure.md
  methodology.md
  formula-appendix.md
  disclaimer.md

/content
  field-explanations.md
  benchmark-notes.md
  glossary.md
  tooltip-copy.md

/assets
  equipment-images/
  icons/

/exports
  excel-generator.ts
  word-generator.ts
  zip-generator.ts

/tests
  formulas/
  scenarios/
```

### 32.1 Architecture principle

Financial formulas should be tested and separated from UI.

Equipment assumptions should live in editable data files.

Report templates should be modular.

The same calculation engine should power:

```text
Dashboard
Charts
Excel export
Word report
Scenario comparison
```

No formula should be implemented separately in multiple places.

---

## 33. Assets and Images

The tool will need professional visuals.

Options:

1. Generated equipment illustrations
2. Licensed stock-style equipment photos
3. Minimal line icons
4. Abstract hospital-finance visuals

### 33.1 Asset direction

Images should be:

```text
Professional
Clean
White-background friendly
Healthcare-administration appropriate
Not cartoonish
Not overly futuristic
Not generic AI-looking
```

### 33.2 Equipment image needs

Possible asset list:

```text
MRI machine
CT scanner
Cath Lab setup
Dialysis unit
Ultrasound machine
Laboratory analyzer
Operation theatre equipment
Hospital corridor / admin planning image
Financial dashboard mock image
```

Use images carefully. The UI should not become image-heavy.

---

## 34. Naming Ideas

**Decided (2026-07-05): CapexIQ.** Tagline: "Know if it pays for itself, before you buy
it." Route: `capexiq.jaybharti.me` (subdomain, not a path — see §32 note). Chosen
deliberately plain/safe over a cleverer option ("Prognosis" was the runner-up — same
idea but leans on the medical/financial double-meaning of the word) because this is a
side project and a boring name that reads as a real product was preferred over spending
more time on branding. The brainstorm below is kept for history; nothing past this point
in §34 is still open.

Working names (historical brainstorm, superseded by the decision above):

```text
Healthcare Capex Decision Support
Healthcare Equipment ROI Studio
Hospital Capex Planner
CapexGrid
MedCapex ROI
Hospital Investment Modeler
```

Current best descriptive name:

```text
Healthcare Capex Decision Support Tool
```

Possible public page title:

```text
Healthcare Capex Decision Support
```

Possible route:

```text
/roi
/capex
/healthcare-roi
```

Current preferred route:

```text
jaybharti.me/roi
```

---

## 35. Portfolio / Resume Value

Possible resume line:

```text
Built a healthcare capital expenditure decision-support tool for hospitals, incorporating ROI, payback period, NPV, IRR, break-even usage, depreciation, utilization sensitivity, payer mix, revenue realization, DSO-based cash-flow timing, working capital gap analysis, warranty/AMC modelling, and exportable Excel/Word proposal generation for equipment such as MRI, CT, Cath Lab, dialysis, and ultrasound units.
```

Shorter version:

```text
Designed and built a healthcare capex decision-support platform for hospital equipment investments, combining operational assumptions, financial modelling, cash-flow risk, scenario analysis, and export-ready proposal generation.
```

Even shorter version:

```text
Built a healthcare capex decision-support tool for hospital equipment investments with ROI, NPV, IRR, break-even, cash-flow, and proposal export features.
```

---

## 36. Open Questions for Future Iteration

### 36.1 Product questions

1. Should the tool require login or stay fully open?
2. Should scenarios be saved locally or in a database?
3. Should users be able to share a scenario link?
4. Should the tool include a disclaimer that outputs are indicative and not financial advice?
5. Should the tool allow hospital type selection: private, charitable, trust, corporate, government? —
   **Resolved 2026-07-11**: yes, optional, in Basic Mode — informational/report-context
   only. No formula in `financial-model-spec.md` or `/formulas` currently consumes it;
   if a future version wants it to actually affect the model (e.g. tax treatment), that
   needs a separate formula-design pass, not a silent assumption. See
   `content/inputs-metadata.json#basic.hospitalType`.
6. Should it ask bed size as a required input? — **Resolved 2026-07-11, reasoning
   updated same day:** yes, required — but as the lookup key for bed-size-dependent
   utilization/tariff benchmarks (§23.3) and as maintenance-quote context (a user
   documenting their own vendor's CMC/AMC quote), not for a bed-tiered CMC/AMC
   *default*. A hypothesis that CMC/AMC pricing itself scales with bed count was
   tested via a fourth research pass and found unsupported — see
   `data-requirements.md` §19.5, `ISSUES.md` ISS-12 (resolved).
7. Should city tier be required or optional? — **Resolved 2026-07-11**: required,
   alongside bed size — same benchmarking-lookup role (§23.3's tooltip example already
   references "Tier 2 city" as a benchmark dimension). See §10.1.
8. Should the tool support multi-equipment packages later?
9. Should there be a methodology page explaining formulas? — **Resolved 2026-07-11**:
   yes, a separate page (not embedded in the landing page), linked from the header and
   footer. Content already written: `report-templates/methodology.md` and
   `formula-appendix.md`. See `design/ux-product-spec.md` §5.3.
10. Should the score be shown immediately or only after advanced metrics are calculated?
    — **Resolved 2026-07-07**: immediately, live, no "Calculate" button or loading
    screen — see `agent-build-plan.md` Phase 4-G (live-recalculation contract);
    formulas are pure and cheap enough that there's nothing to wait on.
11. Should Basic Mode show only billed revenue or also a simplified realized-revenue
    assumption? — **Found already resolved, annotated 2026-07-11**: §10.4 already
    answers this — Basic Mode shows billed revenue only, with a soft note pointing to
    Advanced Mode for realized-revenue modeling (payer deductions, collection delay).
    No new decision needed; this was a doc-cross-reference gap, not an open question.
12. Should the working capital gap be shown in v1 dashboard or only in Advanced Mode?
    — **Resolved 2026-07-11**: Advanced Mode only — §11.2 lists it under Advanced
    outputs and §10.4's Basic outputs list omits it, consistent with keeping Basic
    Mode's output set simple. Confirmed with Jay rather than left as a silent
    inference from list placement alone.
13. Should professional/reporting fee be mandatory for specific equipment types? —
    **Found already resolved, annotated 2026-07-11**: §10.2 already answers this —
    "optional but visible" in Basic Mode, uniformly across equipment types, not
    mandatory and not equipment-specific. No new decision needed.
14. What should the entry flow into the wizard look like — land directly on the
    wizard/dashboard, or a marketing hero page with an explicit CTA that launches a
    dedicated assessment flow? — **Resolved 2026-07-11**, finalized in
    `design/ux-product-spec.md` §5.2: single-scroll landing page, hero reads "Start
    Assessment" (see also §26.1 below, whose "Start Evaluation" wording this
    supersedes). Clicking it opens a distinct pre-step (not the full wizard yet) where
    the user picks equipment type and hospital bed count, with equipment imagery,
    before proceeding into the full input flow. This reframes Phase 5's assumption
    about the wizard's entry point — Phase 5 must design against this, not a "lands
    straight on the dashboard" model.

### 36.2 Data questions

1. What are reliable sources for equipment cost ranges in India?
2. How can typical usage per day be estimated by bed size?
3. Can WHO or other manuals provide planning norms relevant to equipment utilization?
4. What data exists for MRI/CT/dialysis pricing across Indian cities?
5. What are realistic AMC/CMC ranges?
6. How should useful life be assigned to each equipment category?
7. What default discount rate should be used? — **Resolved 2026-07-07**: 12.5% typical
   (range 11.1–14.1%), sourced from listed Indian hospital-chain WACC. See
   `data-requirements.md` §17.1 and `equipment-data/common-assumptions.json`.
8. Should payer mix include PM-JAY as a default advanced option?
9. Can loan/lease assumptions be grounded in current Indian healthcare equipment financing norms?
10. What sources can support space and civil-work assumptions?
11. What reliable sources exist for DSO/collection delay norms in Indian healthcare?
12. Can professional/reporting fee benchmarks be sourced reliably, or should they remain user-entered only?
13. What data exists on warranty periods and CMC/AMC costs by equipment category?
14. Should DSCR (debt service coverage ratio) be part of the model, despite Advanced
    Mode's financing section (§11.C) never mentioning it? — **Resolved 2026-07-07**:
    yes — it's the "Financing Resilience" component of the Investment Outlook score.
    See `financial-model-spec.md` §1.2.3 for the exact formula and normalization.

### 36.3 Design questions

1. What exact typography should be used? — **Open.** `agent-build-plan.md` Phase 4-A
   names what has to be decided (a concrete type scale, line-heights, and a
   weight-to-role mapping) but does not itself decide it — `design/ux-product-spec.md`
   does not exist yet. Deliberately deferred; Jay is taking this up directly (2026-07-07).
2. Should the UI feel more like a government/consulting report or modern healthcare SaaS?
3. Should the result score be circular, card-based, or text-based?
4. How much color is acceptable before it starts feeling generic?
5. Should the homepage include equipment visuals or remain mostly typographic?
6. Should the advanced mode be a drawer, accordion, or separate tab? — **Resolved 2026-07-07**: inline collapsible panel below Basic Mode fields, with a preview banner listing what it unlocks. See `agent-build-plan.md` Phase 4-F.
7. Should charts appear immediately or after clicking “View financial dashboard”?
8. How should warnings be displayed without making the tool feel negative or scary?
9. Excel export formula strategy — **Resolved 2026-07-07**: live, embedded Excel formulas (not static pasted values), so a finance person can click into and trace any cell. See `agent-build-plan.md` Phase 4-H.

---

## 37. Risks

### Risk 1: Overwhelming users

Mitigation:

- Use progressive disclosure.
- Keep Basic Mode short.
- Hide advanced assumptions.
- Use tooltips and defaults.
- Allow users to skip unknown fields while showing what that means.

### Risk 2: Unreliable benchmark data

Mitigation:

- Do not invent values.
- Use source-backed ranges.
- Show confidence levels.
- Allow users to override every assumption.
- Prefer vendor quote and hospital-specific data over scraped benchmarks.

### Risk 3: Generic design

Mitigation:

- Avoid generic SaaS templates.
- Use serious typography.
- Keep interface white, structured, and professional.
- Use charts and financial summaries thoughtfully.

### Risk 4: Formula errors

Mitigation:

- Keep formulas in separate files.
- Add tests.
- Show calculation background.
- Export formulas transparently in Excel.
- Use shared formula engine for dashboard and exports.

### Risk 5: Too much complexity in v1

Mitigation:

- Launch with 5 equipment types plus custom.
- Add more equipment later.
- Keep advanced features modular.
- Basic Mode remains simple even if Advanced Mode is deep.

### Risk 6: Misleading cash-flow interpretation

Mitigation:

- Clearly distinguish billed revenue, realized revenue, and cash received.
- Show DSO and collection-delay effects in Advanced Mode.
- Warn when EMI starts before revenue or cash collection.
- Show working capital gap where applicable.

### Risk 7: Maintenance cliff hidden by averages

Mitigation:

- Ask warranty period separately.
- Model AMC/CMC by year.
- Show Year 3/4 maintenance impact clearly.
- Avoid flattening lifecycle cost in a way that hides later-year risk.

---

## 38. Proposed Version Roadmap

### v0.1 — Concept Spec

Goal:

```text
Record the idea, product philosophy, user segments, feature direction, and major design decisions.
```

### v0.2 — Financial Realism Spec

Current document.

Goal:

```text
Merge the original idea with healthcare-specific financial realism: revenue realization, payer mix, DSO, working capital, professional fee per use, launch delay, pre-operative interest, warranty, and AMC/CMC cliff modelling.
```

### v0.3 — Research/Data Requirements

Create:

```text
data-requirements.md
```

Goal:

```text
Define exactly what external data is needed and how a research agent should collect it, including source quality, confidence levels, and caveats.
```

### v0.4 — UX/Product Spec

Create:

```text
ux-product-spec.md
```

Goal:

```text
Define user journey, screens, information architecture, field labels, tooltip content, warning messages, and design rules.
```

### v0.5 — Formula and Model Spec

Create:

```text
financial-model-spec.md
```

Goal:

```text
Define formulas, assumptions, calculations, exports, test cases, model states, and edge cases.
```

### v0.6 — Agent Build Spec

Create:

```text
agent-build-plan.md
```

Goal:

```text
Break implementation into tasks for coding agents, including folder structure, components, formulas, exports, charts, tests, and validation requirements.
```

---

## 39. Immediate Next Steps

When work resumes, the next discussion should focus on:

1. Final v1 user journey
2. Final v1 equipment list
3. Basic Mode field count and exact labels
4. Advanced Mode field groups
5. Default assumptions vs user-entered assumptions
6. Design style and typography
7. Data requirements file for research agents
8. Formula specification
9. Export structure
10. Agent-friendly implementation plan

Recommended next artifact:

```text
data-requirements.md
```

Reason:

The model should not ship with fake or weak benchmark assumptions. The next step should define what data is needed, what sources are acceptable, and where the tool should say “unavailable” instead of pretending to know.

---

## 40. Current Conclusion

This is a strong project idea because it sits at the intersection of:

```text
Hospital administration
Healthcare finance
Operations planning
Capital budgeting
Data-informed decision-making
Professional proposal generation
```

The project should be built carefully and iteratively.

The first priority is not coding.

The first priority is clarity:

```text
Who is it for?
What does it calculate?
What does it hide?
What does it reveal?
What assumptions are trusted?
What assumptions are editable?
How does it help a real hospital decision?
```

Version 0.2 strengthens the idea by making the model less naive.

The tool should not merely ask:

```text
How much revenue will this machine generate?
```

It should ask:

```text
How much revenue will be billed?
How much will actually be realized?
When will cash arrive?
What costs vary with each use?
When does EMI begin?
When does revenue begin?
When does AMC/CMC begin?
What utilization is required to survive?
```

That shift is what can make the project feel serious, useful, and credible.
