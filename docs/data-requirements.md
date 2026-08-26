# Data Requirements — CapexIQ

**Working URL:** `capexiq.jaybharti.me`  
**Working name:** CapexIQ (was "Healthcare Capex Decision Support Tool")  
**Artifact version:** v0.3 research/data requirements + first research pass  
**Parent spec:** `SPEC.md` v0.2, especially section 24  
**Status:** First research pass complete; not yet a production benchmark database  
**Date:** 2026-07-05  
**Owner:** Jay Bharti

---

## 1. Purpose

This file defines exactly what data a research agent must collect before the calculator ships with benchmark assumptions.

The goal is not to create a perfect national database. The goal is to separate:

```text
User-entered inputs
Grounded default assumptions
Directional benchmark ranges
Low-confidence notes
Unavailable data
```

The calculator must never invent values just to fill a model. If a number cannot be sourced responsibly, mark it as unavailable and explain what primary data would be needed.

---

## 2. Research Scope

### 2.1 Geography

The first data pass is India-first.

Default geography levels:

```text
India national
Metro / Tier 1 city
Tier 2 city
Tier 3 / smaller city
Rural / semi-urban, only where a source supports it
```

When a source is local, record the city/state and do not generalize it nationally unless there is supporting evidence.

### 2.2 Version 1 equipment list

Collect data for the v1 equipment categories from `SPEC.md`:

```text
MRI
CT Scan
Cath Lab
Dialysis unit
Ultrasound
Custom Equipment
```

Custom Equipment does not need benchmark defaults for every category. It needs a generic data schema and clear user-input requirements.

### 2.3 Hospital segments

Where possible, tag benchmarks by:

```text
Hospital bed size
Ownership type
City/tier
Equipment type and configuration
New vs refurbished equipment
Standalone diagnostic center vs hospital department
```

Suggested bed-size buckets:

```text
<50 beds
50-100 beds
101-250 beds
251-500 beds
>500 beds
Standalone diagnostic center
```

---

## 3. Source Quality Rules

### 3.1 Preferred source hierarchy

Use the strongest available source for each data point.

1. Indian government, statutory, or regulator sources
2. Official scheme tariff documents and reimbursement schedules
3. Manufacturer, distributor, or vendor quote documents
4. Hospital tariff pages, rate cards, tenders, and procurement documents
5. NABH, accreditation, professional-body, or clinical-operation references
6. Bank, NBFC, leasing, or lender pages for financing assumptions
7. Peer-reviewed papers, industry reports, or credible market reports
8. Directly cited expert commentary, only with clear caveats
9. News articles or SEO pages, only as weak supporting context

Do not use unsourced blog claims as benchmark values.

### 3.2 Minimum citation fields

Every collected value or range must include:

```text
Value or range
Unit
Source URL
Source name
Publisher / organization
Publication date, if available
Date accessed
Geography covered
Equipment/configuration covered
Confidence level
Notes and caveats
Applicability limitations
```

### 3.3 Confidence levels

Use exactly these confidence labels:

```text
High
Medium
Low
Unavailable
```

Guidance:

```text
High = official/current source, direct tariff/quote/regulatory document, or multiple strong sources agree.
Medium = credible source but local, dated, narrow, or requires cautious interpretation.
Low = weak source, broad market claim, unclear methodology, or only one indirect source.
Unavailable = no responsible value found.
```

Low-confidence data may be shown as a caveated tooltip or research note. It should not silently become a default assumption.

### 3.4 Freshness rules

Record dates carefully. If a source has no publication date, record:

```text
Publication date: Not stated
Date accessed: YYYY-MM-DD
```

For prices, tariffs, AMC/CMC, financing, and regulatory requirements, prefer current sources. If the best available source is old, keep it only with a clear caveat.

---

## 4. Required Research Output Format

The research agent should return two outputs:

```text
1. Human-readable research summary
2. Machine-readable assumptions table
```

### 4.1 Human-readable summary

For each equipment type, include:

```text
Short summary
Reliable assumptions found
Weak or missing assumptions
Recommended default values, if defensible
Values that must remain user-entered
UI warnings needed
Source list
```

### 4.2 Machine-readable assumptions table

Use this column structure for every row:

```text
equipment_type
data_area
metric_name
metric_description
value_type
value_low
value_mid
value_high
unit
currency
period
geography
hospital_segment
equipment_configuration
source_name
source_url
publication_date
date_accessed
confidence
recommended_use
notes
```

Allowed `value_type` values:

```text
single
range
percentage
duration
boolean
text
unavailable
```

Allowed `recommended_use` values:

```text
default_assumption
benchmark_tooltip
sensitivity_range
warning_only
user_input_required
do_not_use
```

---

## 5. Core Data Areas

Collect the following data areas for each v1 equipment type where applicable.

### 5.1 Equipment acquisition cost

Required metrics:

```text
New equipment purchase cost range
Refurbished equipment purchase cost range, if relevant
Common configuration variants
Included accessories
Excluded accessories
Import duty / GST / tax notes, if visible in source
Vendor quote dependencies
```

Notes:

- Separate base machine cost from installation, civil work, accessories, software, and service contract costs when possible.
- Do not mix entry-level and premium configurations without labeling them.

### 5.2 Installation, civil, and site readiness

Required metrics:

```text
Space requirement
Room or department preparation cost
Electrical load / power requirement
UPS / generator / backup requirement
HVAC / cooling requirement
Shielding requirement, if relevant
Water treatment requirement, if relevant
IT / PACS / reporting integration requirement
Installation timeline
Commissioning timeline
Training timeline
```

### 5.3 Regulatory and licensing requirements

Required metrics:

```text
Regulatory approvals needed
Registration or license requirement
Radiation safety requirement, if relevant
Biomedical waste requirement, if relevant
Clinical staffing qualification requirement
Inspection or compliance timeline
Renewal requirement
Penalty or operating-risk note, if relevant
```

Do not summarize legal requirements loosely. Link to the exact authority or document when available.

### 5.4 Utilization and operating volume

Required metrics:

```text
Typical uses per day
Typical uses per month
Practical maximum throughput
Ramp-up period
Mature utilization range
Downtime assumption
Seasonality note, if relevant
Bed-size dependency
City/tier dependency
Referral dependency
```

The calculator should treat utilization as a major driver, not as a fixed benchmark.

### 5.5 Revenue and tariff

Required metrics:

```text
Average billed tariff per use
Tariff range by service/procedure type
Private cash tariff
Insurance / TPA tariff or package amount
PM-JAY / government scheme tariff, if applicable
Corporate credit tariff, if available
Consumable-inclusive vs consumable-extra pricing
Contrast / drug / implant inclusion notes
```

Record whether the value is billed price, package price, expected realization, or cash received.

### 5.6 Payer mix, realization, and DSO

Required metrics:

```text
Expected realization percentage by payer type
Claim deduction / disallowance percentage by payer type
Collection delay / DSO by payer type
Common denial or deduction reasons
Working capital implication
```

Payer types:

```text
Private cash
Insurance / TPA
Corporate credit
PM-JAY / government scheme
Other government payer
Other
```

If payer-wise realization data is unavailable, mark it unavailable and recommend user-entered assumptions.

### 5.7 Variable operating costs

Required metrics:

```text
Consumable cost per use
Drug / contrast / reagent cost per use, if relevant
Implant / stent / catheter cost, if relevant
Disposable kit cost
Film / print / report delivery cost, if relevant
Professional fee per use
Technician or clinical variable payout per use, if applicable
Waste disposal cost, if material
```

Separate consumables from professional fees. The calculator needs both.

### 5.8 Fixed operating costs

Required metrics:

```text
Monthly staff cost
Monthly electricity / utility cost
Monthly rent or space cost, if relevant
Monthly software / PACS / reporting cost
Monthly quality / compliance cost
Security / housekeeping / support cost
Other fixed operating cost
```

Use monthly values where possible.

### 5.9 Maintenance, warranty, AMC, and CMC

Required metrics:

```text
Warranty period
AMC cost range
CMC cost range
AMC/CMC as percentage of equipment cost
Year maintenance begins
Major replacement costs
Downtime during maintenance
Service response-time dependency
Escalation clause
```

The research must support the model's maintenance cliff warning after warranty ends.

### 5.10 Financing and acquisition mode

Required metrics:

```text
Typical down payment
Loan-to-value range
Interest rate range
Tenure range
Processing charges
EMI start timing
Moratorium availability
Lease rental structure
Security / collateral requirement
```

Sources should preferably be banks, NBFCs, leasing providers, vendor-finance pages, or current market documentation.

### 5.11 Accounting, depreciation, and tax assumptions

Required metrics:

```text
Useful life
Depreciation rate or method reference
Salvage value assumption
Tax treatment note, if reliable
Accounting standard reference, if relevant
```

If exact tax/accounting treatment depends on entity type or advisor interpretation, mark as user/advisor input required.

### 5.12 Formula and model references

Required references:

```text
ROI
Simple payback
Discounted payback
NPV
IRR
Equivalent Annual Cost
Break-even usage
Contribution margin
Working capital gap
Loan EMI
Depreciation
```

These are formula references, not equipment benchmarks. Prefer finance textbooks, reliable educational sources, or official accounting references.

---

## 6. Equipment-Specific Data Requirements

### 6.1 MRI

Collect separate assumptions for:

```text
1.5T MRI
3T MRI
New vs refurbished, if sourced
With/without advanced coils or software packages
```

MRI-specific metrics:

```text
Magnet / shielding / room preparation cost
Quench pipe and safety requirements
Chiller / HVAC requirements
Power requirement
PACS/reporting requirement
Radiologist reporting fee per scan
Contrast cost per scan
Scan mix and average scan duration
Common tariff bands by body part, if available
AMC/CMC cost after warranty
Downtime and service dependency
```

### 6.2 CT Scan

Collect separate assumptions for:

```text
16-slice
32-slice
64-slice
128-slice and above, if source quality supports it
```

CT-specific metrics:

```text
Radiation safety and approval requirements
Room shielding requirements
Tube replacement risk / major maintenance item
Power and HVAC requirements
Contrast cost per scan
Radiologist reporting fee per scan
Scan mix and average scan duration
Tariff by plain / contrast / specialized study
AMC/CMC cost after warranty
```

### 6.3 Cath Lab

Collect separate assumptions for:

```text
Single-plane cath lab
Biplane cath lab, if relevant
Cardiology-focused cath lab
Multi-specialty interventional lab, if relevant
```

Cath-lab-specific metrics:

```text
Civil and radiation safety requirements
UPS / backup power requirement
Procedure mix
Average billed package by procedure type
Consumables and disposable cost
Stent / balloon / catheter inclusion or exclusion
Cardiologist and cath team professional fee
Nursing and technician staffing
Insurance / TPA / government package realization
DSO / collection delay
AMC/CMC and downtime risk
```

Do not collapse procedure revenue into one average unless the source supports the mix assumption.

### 6.4 Dialysis Unit

Collect separate assumptions for:

```text
Single dialysis machine
Small unit, 3-5 machines
Larger unit, 6+ machines
Hospital-based vs standalone unit
```

Dialysis-specific metrics:

```text
Machine cost per station
RO plant and water treatment cost
Space per station
Dialyzer and consumable cost per session
Technician and nurse staffing norms
Nephrologist fee or visit cost
Average sessions per machine per day
Working days per month
Private tariff per session
PM-JAY / government package tariff, if available
Insurance or corporate realization
Infection-control and biomedical waste cost
AMC/CMC cost
```

### 6.5 Ultrasound

Collect separate assumptions for:

```text
Basic ultrasound
Color Doppler
High-end ultrasound
Portable ultrasound, if relevant
```

Ultrasound-specific metrics:

```text
Probe configuration and accessory cost
Sonologist / radiologist fee per scan
Common scan tariffs by study type
Average scans per day
PCPNDT applicability and compliance requirements, where relevant
Room and privacy requirement
Printer / reporting / PACS requirement
AMC cost
```

### 6.6 Custom Equipment

Custom Equipment should remain user-driven.

Minimum required user inputs:

```text
Equipment name
Equipment category
Purchase cost
Installation / civil cost
Useful life
Expected usage per day or per month
Average billed revenue per use
Consumable cost per use
Professional fee per use
Other variable cost per use
Monthly fixed operating cost
Warranty period
AMC/CMC after warranty
Financing mode
```

Research requirement:

```text
Provide generic guidance on which assumptions are user-entered, which can use optional benchmark ranges, and which should remain unavailable unless equipment-specific research exists.
```

---

## 7. Defaults vs Benchmarks vs User Inputs

Every assumption must be categorized before implementation.

### 7.1 Safe defaults

Use only when the source quality is high or the value is a neutral product setting.

Examples:

```text
Currency = INR
Working days per month = user-editable default, if explicitly framed as editable
Projection period = user-editable model setting
```

### 7.2 Benchmark tooltips

Use for sourced ranges that help users estimate an input but should not override their local knowledge.

Examples:

```text
Typical scan tariff range
Typical AMC as percentage of equipment cost
Typical installation duration
Typical useful life
```

### 7.3 User input required

Use when values are highly local, commercially sensitive, or too variable.

Examples:

```text
Actual vendor quotation
Hospital-specific utilization
Hospital-specific payer mix
Negotiated insurance realization
Actual loan terms
Actual professional payout agreement
```

### 7.4 Do not use

Use when a value is too weak, stale, or misleading.

The research output should still preserve the source in notes if it explains why the value was rejected.

---

## 8. UI and Product Implications

The data pass must produce warnings the product can use directly.

Required warning types:

```text
Benchmark unavailable
Low-confidence benchmark
Source is old
Source is local-only
Configuration mismatch
Payer realization unavailable
Regulatory requirement needs verification
Vendor quotation required
Professional fee required
Maintenance cliff likely
Working capital risk likely
```

Suggested UI wording:

```text
Benchmark unavailable. Use a vendor quotation or hospital-specific estimate.
```

```text
This benchmark is directional only and may not apply to your city, hospital size, or equipment configuration.
```

```text
Cash flow may be materially lower than billed revenue if payer realization or collection delay is unfavorable.
```

```text
AMC/CMC cost after warranty can materially change Year 3 onward returns. Enter the service-contract quote if available.
```

---

## 9. Research Agent Instructions

The research agent should follow this workflow:

1. Start with the v1 equipment list.
2. For each equipment type, map configuration variants before collecting prices.
3. Collect acquisition cost, installation, regulatory, utilization, revenue, cost, maintenance, financing, and accounting data.
4. Prefer primary and official sources over aggregator summaries.
5. Record exact URLs and access dates.
6. Mark weak data as low confidence instead of forcing a default.
7. Mark unavailable data explicitly.
8. Separate billed revenue from realized revenue and cash received.
9. Separate variable costs from fixed costs.
10. Separate professional fee from consumables.
11. Separate warranty-period assumptions from post-warranty AMC/CMC assumptions.
12. Return both the human-readable summary and machine-readable assumptions table.

Do not:

```text
Invent values
Average unrelated configurations
Convert foreign prices into Indian defaults without local support
Use old tariffs without a date caveat
Treat billed tariffs as cash collections
Treat one hospital's price list as a national benchmark
Hide low confidence behind clean-looking defaults
```

---

## 10. Acceptance Criteria

The data requirements work is complete when:

```text
Each v1 equipment type has a completed research summary.
Each collected value has a source URL and confidence label.
Unavailable values are explicitly marked.
Every proposed default is categorized as default_assumption, benchmark_tooltip, sensitivity_range, warning_only, user_input_required, or do_not_use.
The calculator can identify which fields need user input.
The calculator can show confidence-aware tooltips.
The financial model can distinguish billed revenue, realized revenue, and cash received.
Maintenance cliff, launch delay, financing, and working-capital assumptions are supported.
No fake benchmark value is needed for the first implementation.
```

---

## 11. First Research Pass Checklist

Minimum viable research pass:

```text
MRI acquisition cost and AMC/CMC ranges
CT acquisition cost and AMC/CMC ranges
Cath lab acquisition cost and major consumable/procedure economics
Dialysis machine/unit cost, session pricing, and consumable cost
Ultrasound equipment cost, scan tariff, and sonologist fee
PM-JAY or government package tariffs where relevant
Private hospital or diagnostic tariff examples
Radiologist/sonologist/specialist professional fee evidence, if available
Installation and regulatory requirements for MRI, CT, and Cath Lab
Loan/lease assumptions from current Indian financing sources
Depreciation/useful-life references
```

If this checklist cannot be completed with responsible sources, the UI must ship with user-entered assumptions and only limited benchmark hints.

---

## 12. First Research Pass Findings

### 12.1 Research status

This first pass found enough source-backed data to support directional benchmark tooltips, warning messages, and user-input requirements.

It did not find enough reliable public data to safely hard-code hospital-specific utilization, payer-wise realization, specialist fee, or private negotiated tariff assumptions.

Implementation rule:

```text
Use sourced ranges as benchmark_tooltip or sensitivity_range.
Keep actual vendor quote, utilization, payer mix, realization, DSO, professional fee, and financing terms user-entered.
```

### 12.2 Source register

| ID | Source | Type | URL | Main use | Confidence |
|---|---|---|---|---|---|
| S1 | CCI / Deloitte market study on diagnostic medical imaging equipment in India, 2024 | Market study based on stakeholder consultation | https://www.cci.gov.in/public/images/marketstudie/en/market-study-of-diagnostic-medical-imaging-equipment-industry-in-india1724145632.pdf | MRI/CT equipment cost, refurbished discount, warranty, CMC, scan-price context, lifecycle cost | Medium |
| S2 | AERB Diagnostic Radiology page | Regulator | https://www.aerb.gov.in/english/regulatory-facilities/radiation-facilities/application-in-medicine/diagnostic-radiology | X-ray/CT/cath lab licensing through eLORA | High |
| S3 | AERB regulatory requirements for upcoming radiology facility | Regulator | https://www.aerb.gov.in/english/regulatory-requirements-and-guidelines-for-upcoming-radiology-facility | CT/IR room shielding, control room, staffing, RSO, QA | High |
| S4 | AERB eLORA diagnostic radiology guidelines PDF, 2016 | Regulator guidance | https://www.aerb.gov.in/images/PDF/DiagnosticRadiology/e-LORA-Diagnostic-Radiology-Guidelines.pdf | Procurement permission, licence process, pre-owned equipment process | Medium |
| S5 | National Health Benefit Package 2.2 manual, NHA | Government scheme manual | https://hem.nha.gov.in/HBP.pdf | PM-JAY package logic, special inputs, bundled package caution | High |
| S6 | PMNDP portal, MoHFW | Government programme portal | https://pmndp.mohfw.gov.in/en | Dialysis demand, programme scale, district-hospital dialysis model | High |
| S7 | NHSRC PMNDP page | Government technical-support institute | https://nhsrcindia.org/pradhan-mantri-national-dialysis-program | PMNDP programme context and bid/checklist links | High |
| S8 | Companies Act Schedule II, India Code | Statutory schedule | https://upload.indiacode.nic.in/schedulefile?aid=AC_CEN_22_29_00008_201318_1517807327856&rid=9 | Useful life for medical diagnostic equipment | High |
| S9 | Income Tax Department depreciation rates | Official tax source | https://www.incometaxindia.gov.in/w/depreciation-rates | 40% WDV category for specified life-saving medical equipment | High |
| S10 | HDFC Bank healthcare equipment finance | Lender product page | https://www.hdfc.bank.in/msme-banking/loan-for-specific-industry-segments/medical-equipment-loan | Tenure, financeable equipment types, eligibility/documentation | Medium |
| S11 | Bajaj Finance medical equipment finance | NBFC product page | https://www.bajajfinserv.in/medical-equipment-finance | Interest-rate ceiling, tenure, processing fee, loan amount | Medium |
| S12 | Tata Capital medical equipment loan guide | Lender blog | https://www.tatacapital.com/blog/loan-for-business/loan-for-medical-equipment/ | Broad market interest-rate range | Low |
| S13 | BEL press release on Haldwani cath lab | PSU press release | https://bel-india.in/news-bel/bel-to-set-up-cardiac-cath-lab-in-govt-hospital-haldwani/ | Example cath lab project cost | Low |
| S14 | Maharashtra ESIS turnkey modular cath lab GeM tender PDF, 2026 | Tender document | https://bidplus.gem.gov.in/bidding/bid/documentdownload/9050786/1772102333.pdf | Cath lab scope, turnkey works, power, shielding, UPS, staffing, warranty/CMC expectations | Medium |
| S15 | GeM hemodialysis machine procurement PDF | Tender document | https://bidplus.gem.gov.in/bidding/bid/downloadMseMiiDoc/7655386/1742291522.pdf | Per-machine hemodialysis equipment estimate from one procurement | Low |
| S16 | CGHS 2024 rate PDF examples | Government rate list | https://www.cghs.mohfw.gov.in/CGHSGrievance/FormFlowXACTION?fileName=17062025170805_CGHS-Rate-2024--Thiruvananthapuram.pdf&folderName=Circular&hmode=ftpFileDownload&isGlobal=1 | Scheme tariff examples for CT/MRI/cardiology investigations | Medium |
| S17 | AIIMS rate pages/PDFs | Public hospital tariffs | https://aiims.edu/index.php/en/component/content/article?id=307 | Public-hospital MRI/CT/USG tariff examples | Medium |
| S18 | Delhi PCPNDT portal | State government portal | https://pndt.delhigovt.nic.in/ | Ultrasound Form F/monthly reporting compliance cue | Medium |
| S19 | DCDC Kidney Care dialysis cost article, 2025 | Private provider article | https://dcdc.co.in/2025/01/27/understanding-the-cost-of-dialysis-in-india-what-are-your-options/ | Private dialysis patient-cost context | Low |
| S20 | HospitalStore ultrasound price page, 2026 | Marketplace/retailer page | https://www.hospitalstore.com/ultrasound-machine-price/ | Ultrasound equipment price context | Low |
| S21 | Birla Fertility 3D ultrasound with color Doppler cost page | Private provider tariff page | https://birlafertility.com/cost/3d-ultrasound-color-doppler/ | One ultrasound tariff example | Low |
| S22 | ValueInvesting.io WACC pages for HCG.NS, 524520.BO (KMC), APOLLOHOSP.NS, FORTIS.NS, NH.NS, MAXHEALTH.NS | Financial-modeling site (market-implied beta/CAPM) | https://valueinvesting.io/HCG.NS/valuation/wacc (and the equivalent per-ticker URL for each) | Discount-rate (WACC) benchmark for listed Indian hospital chains | Medium |
| S23 | Nuvama/Edelweiss 2021 DCF research report on Max Healthcare | Broker/analyst research report | https://www.nuvamawealth.com/ewwebimages/WebFiles/Research/f35292e7-d63f-4e40-be14-3a2c31722812.pdf | One analyst's stated WACC assumption (11.1%) for a hospital DCF | Medium |
| S24 | NIMS (Nizam's Institute of Medical Sciences) MRI utilization study, IJSR, June 2018 | Peer-reviewed-adjacent published study | https://www.worldwidejournals.com/international-journal-of-scientific-research-(IJSR)/recent_issues_pdf/2018/June/June_2018_1528207277__280.pdf | MRI scans/day at one Indian tertiary teaching hospital | Medium |
| S25 | "Efficient Health Care: Decreasing MRI Scan Time", PMC | Peer-reviewed article | https://pmc.ncbi.nlm.nih.gov/articles/PMC11140514/ | Global (non-India) MRI daily-throughput context | Medium |
| S26 | "Unit Cost Analysis of PET-CT at an Apex Public Sector Health Care Institute in India" (AIIMS), PMC | Peer-reviewed article | https://pmc.ncbi.nlm.nih.gov/articles/PMC5317060/ | PET/CT scans/day at AIIMS Delhi (proxy only, not standalone CT) | Medium |
| S27 | Elesonic "Complete Cath Lab Equipment Guide 2026" | Vendor blog | https://www.elesonicgroup.com/blog/complete-cath-lab-equipment-guide | Cath lab utilization, new/refurbished acquisition cost (USD), installation timeline | Low-Medium |
| S28 | MoHFW/NITI standard guidelines for maintenance hemodialysis | Government planning guideline | https://www.nitiforstates.gov.in/public-assets/Policy/policy_files/GNC509Q000060.pdf | Design-capacity sessions/machine/day for hemodialysis | High |
| S29 | CGHS rates, Oct 2025 rate list | Government reimbursement rate list | https://www.csir.res.in/sites/default/files/2025-10/cghs_rates.pdf | CT/MRI/ultrasound reimbursement-ceiling tariffs (non-NABH/NABH) | Medium |
| S30 | CGHS package rate list (dialysis), nominally 2014, updated 2024-02-05 | Government reimbursement rate list | https://www.cgspublicationindia.com/PDFOM/RN,%20CGHS_05-02-2024.pdf | Hemodialysis session reimbursement-ceiling tariffs | Medium |
| S31 | "Unit cost of CT scan and MRI at a large tertiary care teaching hospital in North India", 2013 | Peer-reviewed cost study | https://content.scirp.org/pdf/health_2013121817092361.pdf | Historical (2013) actual private-hospital CT/MRI charges — 13 years stale | Low |
| S32 | SashaHealthCare blog, "Where to Buy an MRI Machine in India" | Vendor/supplier blog | https://sashahealthcare.com/where-to-buy-an-mri-machine-in-india/ | MRI installation timeline; confirms MRI doesn't need AERB licensing | Low |
| S33 | DirectMed Imaging, "CT Scanner Installation Process Guide" | Vendor/industry guide | https://directmedimaging.com/ct-scanner-installation-process/ | CT delivery-to-first-scan timeline (site-ready assumption) | Low |
| S34 | PSR Compliance, "AERB Certification" guide | Compliance-consultancy guide | https://www.psrcompliance.com/aerb-certification | Qualitative AERB approval duration for imaging equipment | Low |
| S35 | Block Imaging, "2026 Digital Cath Lab Price Guide" | Vendor/reseller price guide | https://www.blockimaging.com/bid/96958/digital-cath-lab-equipment-cost-price-guide | Refurbished GE/Philips cath lab pricing (USD) | Low |
| S36 | MEA tender: "Procurement and Supply of 200 Kidney Dialysis Machine with 60 RO System", Indian Embassy Nepal, 2022-23 | Government tender document | https://www.mea.gov.in/Portal/Tender/5056_1/1_Etenderdocument-1.pdf | Per-machine dialysis equipment cost from an official bulk procurement | Medium |

### 12.3 Cross-cutting assumptions

| Data area | Finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| Currency | India-first model should default to INR. | default_assumption | High | Parent spec |
| CT/MRI new equipment cost | CCI study reports imported/branded CT scanners usually in the INR 1.5-7 crore range and MRI scanners in the INR 2-14 crore range, depending on specifications. | benchmark_tooltip | Medium | S1 |
| CT configuration cost | CCI stakeholder data gives 16-slice CT around INR 1-2 crore and 128-slice CT around INR 4-7 crore; GeM-listed CT prices observed by the study were broader, about INR 4-20 crore. | benchmark_tooltip / sensitivity_range | Medium | S1 |
| MRI configuration cost | CCI stakeholder data indicates 3T MRI can be around INR 12-14 crore; GeM-listed MRI prices observed by the study were broader, about INR 9-28 crore. | benchmark_tooltip / sensitivity_range | Medium | S1 |
| Refurbished CT/MRI | Refurbished CT/MRI equipment can cost 30-50% less than branded new equipment; OEM-refurbished systems may be assessed for another 5-7 years of performance. | benchmark_tooltip | Medium | S1 |
| New CT/MRI warranty | CCI study reports 1-3 year service warranty commonly offered with branded new equipment. | benchmark_tooltip | Medium | S1 |
| CT/MRI CMC | CCI study reports CMC commonly around 5-15% of equipment value annually, with possible escalation around 5%. | sensitivity_range | Medium | S1 |
| MRI helium refill | CCI stakeholder responses mention helium refill around INR 20-30 lakh, frequency depending on temperature control and operations. | warning_only / sensitivity_range | Low-Medium | S1 |
| CT tube replacement | CCI stakeholder responses mention CT tubes can cost up to INR 30 lakh, workload-dependent. | warning_only / sensitivity_range | Low-Medium | S1 |
| Imaging tariff variation | CCI study found CT/MRI scan prices vary materially by city, establishment type, PPP/government/private setting, and technology level. | benchmark_tooltip | Medium | S1 |
| Public/scheme tariffs | CGHS and AIIMS rates can anchor public/scheme tariff examples, but should not be treated as private cash tariff defaults. | benchmark_tooltip | Medium | S16, S17 |
| Financing tenure | HDFC page gives 12-84 months for healthcare/equipment finance; Bajaj gives 3-120 months. | benchmark_tooltip | Medium | S10, S11 |
| Financing rate | Bajaj lists medical equipment finance rate up to 14% p.a.; Tata Capital guide gives broad 8-15% market range. Actual terms depend on borrower/project. | sensitivity_range | Low-Medium | S11, S12 |
| Depreciation useful life | Companies Act Schedule II lists medical diagnostic equipment such as Cat-scan and ultrasound machines at 13 years; other medical/surgical equipment 15 years. | default_assumption with edit | High | S8 |
| Tax depreciation | Income Tax Department lists specified life-saving medical equipment including haemodialysors, colour Doppler, vascular angiography including DSA, and MRI systems at 40% WDV. Tax treatment should remain advisor-verified. | warning_only / user_input_required | High | S9 |

### 12.4 Regulatory and compliance assumptions

| Equipment | Requirement | Recommended use | Confidence | Source |
|---|---|---|---|---|
| CT Scan | Diagnostic X-ray equipment users must obtain AERB licence/consents through eLORA; procure type-approved/NOC-validated equipment and obtain procurement permission before operation. | warning_only | High | S2, S3, S4 |
| Cath Lab | Interventional radiology equipment is within diagnostic radiology/radiation regulation; cath lab planning must include shielding, adjoining control room, RSO, radiation protection devices, personnel monitoring, QA, and licence renewal. | warning_only | High | S3, S14 |
| CT/Cath Lab | AERB states CT control console should be in a separate adjoining shielded room with viewing and communication; IR equipment rooms should have adjoining control room with shielding and communication. | warning_only | High | S3 |
| CT/Cath Lab | AERB states periodic QA should be carried out at least once in two years and after repairs with radiation-safety implications. | warning_only | High | S3 |
| CT/Cath Lab | X-ray installations require radiologist/related medical practitioner/X-ray technologist with radiation-protection knowledge; CT/fluoroscopy/special procedures require services of a qualified radiologist or related medical practitioner for interpretation/reporting. | warning_only | High | S3 |
| Ultrasound | PCPNDT compliance is required for ultrasound/genetic/imaging centres where prenatal diagnostic use applies; Form F completion and reporting are operational compliance risks. Requirements are state-administered, so local authority verification is required. | warning_only | Medium | S18 |
| MRI | MRI is not ionizing radiation, so AERB X-ray licence logic does not apply in the same way as CT/cath lab; still requires clinical-establishment, safety, staffing, fire/electrical, and local approvals. | warning_only | Medium | S1, S3 |
| Dialysis | PMNDP uses in-house, PPP, and hybrid models at district hospitals; dialysis-centre setup should follow PMNDP/state tender/checklist requirements where public-program participation is intended. | benchmark_tooltip / warning_only | High | S6, S7 |

---

## 13. Equipment Findings

### 13.1 MRI

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| New machine cost | INR 2-14 crore for branded MRI scanners in India, depending on specifications. | benchmark_tooltip | Medium | S1 |
| 3T MRI cost cue | CCI stakeholder responses associate 3T MRI with around INR 12-14 crore. | benchmark_tooltip | Medium | S1 |
| GeM observed range | CCI reports GeM-listed MRI range around INR 9-28 crore depending on tesla model. | sensitivity_range | Low-Medium | S1 |
| Refurbished discount | Refurbished CT/MRI may cost 30-50% less than branded new equipment. | benchmark_tooltip | Medium | S1 |
| Warranty | 1-3 year service warranty commonly reported for branded new CT/MRI equipment. | benchmark_tooltip | Medium | S1 |
| CMC | 5-15% of equipment value annually, with possible escalation. | sensitivity_range | Medium | S1 |
| Major lifecycle risk | Helium refill around INR 20-30 lakh in stakeholder responses; depends on machine and temperature control. | warning_only | Low-Medium | S1 |
| Pricing/tariff | CCI's six-city study shows plain MRI brain prices varying widely by city and establishment type, roughly from low public/PPP rates to private rates near INR 10,000. | benchmark_tooltip | Medium | S1 |
| Required user inputs | Actual vendor quote, tesla, coil/software package, installation/civil cost, annual CMC quote, scan mix, mature scans/day, radiologist reporting fee, payer mix. | user_input_required | High | Derived from S1 + parent spec |

Implementation note:

```text
MRI benchmarks are usable for tooltip ranges only. The calculator should ask for actual vendor quote and annual service-contract quote.
```

### 13.2 CT Scan

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| New machine cost | INR 1.5-7 crore for branded CT scanners in India, depending on specifications. | benchmark_tooltip | Medium | S1 |
| 16-slice CT cue | Around INR 1-2 crore in CCI stakeholder examples. | benchmark_tooltip | Medium | S1 |
| 128-slice CT cue | Around INR 4-7 crore in CCI stakeholder examples. | benchmark_tooltip | Medium | S1 |
| GeM observed range | CCI reports GeM-listed CT range around INR 4-20 crore depending on number of slices. | sensitivity_range | Low-Medium | S1 |
| Refurbished discount | Refurbished CT/MRI may cost 30-50% less than branded new equipment. | benchmark_tooltip | Medium | S1 |
| CMC | 5-15% of equipment value annually, with possible escalation. | sensitivity_range | Medium | S1 |
| Major lifecycle risk | CT tube replacement can cost up to INR 30 lakh in stakeholder responses; workload dependent. | warning_only | Low-Medium | S1 |
| Regulatory | AERB licence/consents through eLORA, type-approved procurement, shielding, separate control console, RSO, QA, personnel monitoring. | warning_only | High | S2, S3, S4 |
| Pricing/tariff | CCI's six-city study shows plain CT brain prices varying from low public/PPP rates to private/diagnostic rates around INR 4,500. | benchmark_tooltip | Medium | S1 |
| Required user inputs | Actual vendor quote, slice count, installation/civil/shielding cost, annual CMC quote, expected scans/day, contrast usage, radiologist fee, payer mix, CT tube risk handling. | user_input_required | High | Derived from S1-S4 + parent spec |

Implementation note:

```text
CT should expose slice count early because both capex and tariff assumptions change materially by configuration.
```

### 13.3 Cath Lab

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| Project cost cue | BEL announced a government hospital cath lab project at estimated cost of INR 9 crore in 2022. | benchmark_tooltip | Low | S13 |
| Turnkey scope | A 2026 Maharashtra ESIS tender covers modular single-plane cath lab with console, wall/ceiling/flooring, MGPS, electrical/cabling, cath lab machine, injector, IVUS/FFR, echo, TMT, HVAC, UPS, defibrillator, ECG, DVT pumps, and other accessories. | warning_only / checklist | Medium | S14 |
| Civil/site scope | Tender places infra, modular works, shielding, furniture, HVAC, and site survey/plans in vendor scope. | checklist | Medium | S14 |
| Power cue | Specific tender asks hospital to arrange 220 KVA power supply for cath lab complex and vendor to provide suitable online UPS with at least 30 minutes backup. | benchmark_tooltip with caveat | Low-Medium | S14 |
| Regulatory | Tender requires AERB/BARC guideline compliance and CDSCO certificate from cath lab OEM. | warning_only | Medium | S14 |
| Staffing cue | Tender includes cath lab technician and biomedical engineer for one year in operations/maintenance scope. | benchmark_tooltip | Low-Medium | S14 |
| CMC cue | Tender asks for two years warranty and quoted AMC/CMC for eight subsequent years; one corrigendum/search result indicated AMC/CMC percentages may be specified by tender. Use actual quote. | user_input_required | Medium | S14 |
| Required user inputs | Project quote, single-plane/biplane, procedure mix, cardiologist fee, cath team cost, stent/balloon/catheter inclusion, insurance/TPA/PM-JAY package realization, DSO, consumables, staffing, maintenance quote. | user_input_required | High | Derived from S14 + parent spec |

Implementation note:

```text
Cath lab cannot be modelled as one simple average procedure. The tool should ask for procedure mix or allow a conservative blended estimate with a visible warning.
```

### 13.4 Dialysis Unit

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| National demand cue | PMNDP states about 2.2 lakh new ESRD patients are added in India each year, creating additional demand for 3.4 crore dialysis sessions annually. | benchmark_tooltip | High | S6, S7 |
| Programme scale | PMNDP portal shows 36 States/UTs, 751 districts, 1,846 centers, 13,482 hemodialysis machines, 32.09 lakh patients, and 432.09 lakh sessions as of statewise status on 31 May 2026. | benchmark_tooltip | High | S6 |
| Care model | PMNDP is delivered through PPP, in-house, and hybrid models depending on state/UT requirements. | benchmark_tooltip | High | S6, S7 |
| Machine cost cue | One GeM procurement document for hemodialysis machines estimated INR 12 lakh per piece and INR 48 lakh total for four machines. Single-procurement only. | benchmark_tooltip | Low | S15 |
| Public programme tariff | PM-JAY/PMNDP tariff evidence is fragmented by HBP/state document; do not hard-code a national reimbursement value without package-master verification. | user_input_required | Medium | S5-S7 |
| Private tariff | Private provider web evidence shows hemodialysis around INR 1,500-4,000 per session, but this is patient-cost content and should not become a default revenue value. | benchmark_tooltip | Low | S19 |
| Required user inputs | Machines/stations, RO plant cost, space/civil cost, sessions/machine/day, working days, consumable/session, nephrologist/technician fee, private tariff, scheme tariff, payer mix, staff cost, biomedical waste, AMC/CMC. | user_input_required | High | Derived from S6, S7, S15 + parent spec |

Implementation note:

```text
For dialysis, model by station/machine and sessions per machine per day. Separate RO plant and water-treatment capex from machine capex.
```

### 13.5 Ultrasound

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| Equipment cost | Reliable public India-specific cost data is weak. Marketplace/retailer evidence suggests very wide ranges from low-lakh basic systems to high-end systems, but this should not be a default. | user_input_required / benchmark_tooltip | Low | S20 |
| Public tariff cue | AIIMS and other public-hospital tariff pages show low public rates for routine ultrasound; these are not private market rates. | benchmark_tooltip | Medium | S17 |
| Private tariff cue | Private hospital rate cards and diagnostic websites vary materially by scan type; one provider page gives 3D ultrasound with color Doppler around INR 3,000-5,500, but this is not comparable to routine USG. | benchmark_tooltip | Low | S21 |
| Regulatory | PCPNDT compliance is a major operational requirement where prenatal diagnostic use applies; state implementation and local authority process must be checked. | warning_only | Medium | S18 |
| Tax depreciation | Income Tax Department lists colour Doppler as specified life-saving medical equipment at 40% WDV. | warning_only / advisor_check | High | S9 |
| Required user inputs | Actual machine quote, probe package, color Doppler/portable/high-end type, sonologist/radiologist fee, scan mix, scans/day, PCPNDT applicability, reporting/printing/PACS cost, AMC. | user_input_required | High | Derived from S9, S17, S18 + parent spec |

Implementation note:

```text
Ultrasound should not use one generic tariff. Ask for scan mix or a conservative average revenue per use.
```

### 13.6 Custom Equipment

| Metric | Researched finding | Recommended use | Confidence | Source |
|---|---|---|---|---|
| Generic equipment mode | No benchmark should be assumed unless the selected equipment has its own researched profile. | user_input_required | High | Parent spec |
| Depreciation | Use Companies Act/Income Tax references only as guidance; entity-specific accounting/tax treatment requires advisor verification. | warning_only | High | S8, S9 |
| Financing | Allow user to enter lender quote; offer benchmark tenure/rate hints from HDFC/Bajaj/Tata only as directional ranges. | benchmark_tooltip | Medium | S10-S12 |

Implementation note:

```text
Custom Equipment must be vendor-quote first. The calculator can still compute ROI/NPV if the user enters the necessary values.
```

---

## 14. Machine-Readable Starter Assumptions

These rows are not a final database. They are starter rows for `equipment-data/assumptions.csv` or equivalent.

| equipment_type | data_area | metric_name | value_type | value_low | value_mid | value_high | unit | currency | recommended_use | confidence | source_id | notes |
|---|---|---|---|---:|---:|---:|---|---|---|---|---|---|
| MRI | acquisition_cost | new_mri_machine_cost | range | 2 |  | 14 | crore | INR | benchmark_tooltip | Medium | S1 | Branded new MRI scanner, specification dependent |
| MRI | acquisition_cost | new_3t_mri_cost | range | 12 |  | 14 | crore | INR | benchmark_tooltip | Medium | S1 | Stakeholder-reported cue for 3T MRI |
| MRI | maintenance | annual_cmc_percent_equipment_value | range | 5 |  | 15 | percent |  | sensitivity_range | Medium | S1 | Shared CT/MRI CMC cue |
| MRI | maintenance | helium_refill_cost | range | 20 |  | 30 | lakh | INR | warning_only | Low-Medium | S1 | Frequency not fixed |
| CT Scan | acquisition_cost | new_ct_machine_cost | range | 1.5 |  | 7 | crore | INR | benchmark_tooltip | Medium | S1 | Branded new CT scanner, specification dependent |
| CT Scan | acquisition_cost | ct_16_slice_cost | range | 1 |  | 2 | crore | INR | benchmark_tooltip | Medium | S1 | Stakeholder-reported cue |
| CT Scan | acquisition_cost | ct_128_slice_cost | range | 4 |  | 7 | crore | INR | benchmark_tooltip | Medium | S1 | Stakeholder-reported cue |
| CT Scan | maintenance | ct_tube_replacement_cost | single |  |  | 30 | lakh | INR | warning_only | Low-Medium | S1 | "Up to" amount, workload dependent |
| Cath Lab | acquisition_cost | cath_lab_project_cost_example | single |  | 9 |  | crore | INR | benchmark_tooltip | Low | S13 | Single BEL government hospital project estimate, 2022 |
| Dialysis unit | acquisition_cost | hemodialysis_machine_cost_single_procurement | single |  | 12 |  | lakh | INR | benchmark_tooltip | Low | S15 | One GeM procurement estimate only |
| Dialysis unit | utilization | national_additional_dialysis_demand | single |  | 3.4 |  | crore sessions/year |  | benchmark_tooltip | High | S6 | PMNDP demand context, not facility utilization |
| Ultrasound | acquisition_cost | ultrasound_machine_cost | unavailable |  |  |  |  | INR | user_input_required | Unavailable |  | Too configuration/vendor dependent for safe default |
| Common | financing | equipment_finance_tenure_hdfc | range | 12 |  | 84 | months |  | benchmark_tooltip | Medium | S10 | HDFC healthcare finance page |
| Common | financing | equipment_finance_tenure_bajaj | range | 3 |  | 120 | months |  | benchmark_tooltip | Medium | S11 | Bajaj medical equipment finance page |
| Common | financing | medical_equipment_finance_rate | range | 8 |  | 15 | percent p.a. |  | sensitivity_range | Low | S11,S12 | Actual quoted lender terms required |
| Common | accounting | companies_act_useful_life_diagnostic_equipment | single |  | 13 |  | years |  | default_assumption | High | S8 | Cat-scan, ultrasound, ECG monitor examples |
| Common | accounting | other_medical_equipment_useful_life | single |  | 15 |  | years |  | default_assumption | High | S8 | Other medical/surgical equipment |

---

## 15. Research Gaps Still Open

The following should remain user-entered or explicitly low-confidence until a deeper source pass finds better evidence:

```text
Hospital-specific utilization by bed size and city tier
Payer-wise realization percentage
Payer-wise DSO / collection delay
Private insurance / TPA deductions
Corporate credit realization
Specialist professional/reporting fee by equipment and city
Actual vendor quotations by brand/model/configuration
Actual AMC/CMC quote by vendor
Cath lab procedure mix and consumables/stent inclusion
Ultrasound private scan mix and sonologist payout
Dialysis consumable cost per session by procurement channel
Loan interest rate, margin, moratorium, collateral, and fees for a specific borrower
State-specific regulatory costs and timelines
Referring-doctor commission/"cut" — unconfirmed whether this is a cost distinct from
  the professional/reporting fee field already in SPEC.md §10.2; if distinct, typical
  commission % by equipment type is unresearched (see ISSUES.md ISS-11)
Warranty period by equipment category — RESOLVED 2026-07-07 by a third research pass,
  see §18.1. Genuine tender-to-tender variation for CT/Cath Lab/Dialysis (not a data
  problem); Ultrasound and MRI's figures rest on fewer independent tenders.
Salvage value assumption by equipment category — RESOLVED 2026-07-07, see §18.2 (5% of
  original cost, all categories, Companies Act Schedule II). Citation corrected from the
  research pass's own mismatched source; full independent verification of the exact
  statutory clause was not completed this session — flagged, not blocking.
Installation/ancillary cost as a percentage of equipment cost — RESOLVED 2026-07-07, see
  §18.3. MRI/CT figures are tender-mandated bid-allocation minimums, not measured actual
  spend; Cath Lab/Dialysis/Ultrasound figures are inferences, not stated percentages —
  all below High confidence.
AMC/CMC annual cost and CMC coverage duration by equipment category — RESOLVED 2026-07-07
  for 4 of 5 equipment types via a generic proxy (not equipment-specific — same number
  applied across MRI/CT/Dialysis/Ultrasound), see §18.4. Cath Lab has a genuinely
  equipment-specific figure. MRI has an unresolved contradiction between the generic
  tender-ceiling range and one real hospital's much lower observed cost — needs a human
  call, see §18.4 and equipment-data/mri.json.
AMC/CMC cost broken out by hospital bed-count or volume tier — NEW GAP, added
  2026-07-11, see §19. Leading hypothesis for the MRI CMC contradiction above is that
  it's really a volume/negotiating-leverage effect, not two competing estimates of the
  same thing; not yet researched, no numeric tiers exist anywhere in this project.
```

UI warning:

```text
Some benchmark data is directional and may not apply to your hospital. Replace these values with your vendor quotation, tariff sheet, payer contracts, and lender sanction terms before using the output for a real investment decision.
```

---

## 16. Next Research Pass — Priority Brief (added 2026-07-06; resolved 2026-07-07, see §17)

See `ISSUES.md` ISS-9. A build-time pass populated `content/inputs-metadata.json` and
SPEC.md §18.2/§18.3 with several numbers that are **not** in this document — most
seriously, a discount-rate/target-IRR "citation" to §12.3 that doesn't exist. Those
were stripped back to `null`/`"Unavailable"` in `equipment-data/common-assumptions.json`
and `equipment-data/*.json`. This section named the priority list handed to a research
agent; §17 records what came back on 2026-07-07.

Priority order as originally briefed, with resolution status:

```text
1. Discount rate (cost of capital) benchmark for Indian private-hospital capex
   — RESOLVED (Medium confidence, proxy-based). See §17.1.
2. Target IRR / hurdle rate benchmark for Indian private-hospital equity/capex decisions
   — STILL UNAVAILABLE. Confirmed by a second pass, not just missed by the first. See §17.2.
3. Usage-per-day / utilization by equipment type, hospital bed-size bucket, and city tier
   — PARTIALLY RESOLVED. Real single-study data for MRI and an official design-capacity
   figure for Dialysis; weak/proxy-only for CT; vendor-guidance-only for Cath Lab;
   still unavailable for Ultrasound. See §17.3.
4. Average billed tariff per use, by equipment type — PARTIALLY RESOLVED. CGHS
   reimbursement-ceiling tariffs now exist for CT/MRI/Ultrasound/Dialysis (Medium
   confidence, but these are government-scheme ceilings, not private cash tariffs —
   see the caveat in §17.4). Still no tariff data at all for Cath Lab. See §17.4.
5. Launch delay / time-to-first-revenue by equipment type — PARTIALLY RESOLVED for MRI,
   CT, and Cath Lab (Low-Medium confidence, vendor/consultant sources). Still
   unavailable for Dialysis; Ultrasound has only an informal "near-immediate" claim
   with no formal timeline source. See §17.5.
6. Re-confirm cath lab and dialysis acquisition cost with more than one source each —
   RESOLVED for Dialysis (a real government tender gives a Medium-confidence per-machine
   figure). Cath Lab still has only one Indian data point (S13, Low confidence), though
   international USD pricing now provides supplementary (not INR-converted) context.
   See §17.6.
```

This list is intentionally the same shape as §14's table — a completed pass should
extend `equipment-data/*.json` and `equipment-data/common-assumptions.json` directly,
row by row, not require reformatting.

---

## 17. Second Research Pass Findings (2026-07-07)

Full findings below; source IDs S22-S36 are registered in §12.2. This section follows
the same confidence-labeling discipline as §12-13 — nothing here should be read as more
certain than its stated confidence level.

### 17.1 Discount rate (cost of capital)

No official benchmark exists for Indian private-hospital cost of capital specifically,
but company-level WACC for six listed Indian hospital chains (calculated by a
financial-modeling site from market-implied beta, risk-free rate, and cost of debt)
gives: HCG 12.2%, KMC Speciality 12.1%, Apollo 12.4%, Fortis 14.1%, Narayana
Hrudayalaya 12.4%, Max Healthcare 13.5% (all S22). A separate 2021 Edelweiss/Nuvama DCF
report used 11.1% for Max Healthcare (risk-free 10%, market risk premium 4%, cost of
equity 12.5%, cost of debt 8%) (S23).

**Range: 11.1%-14.1%, clustering 12-13%.** Note: the source PDF's own machine-readable
table separately states a "range summary" of 11.1-12.8%, which is inconsistent with its
own individual data points (Fortis 14.1%, Max 13.5% both exceed 12.8%) — treating this
as a transcription error in the research output and using the actual individual values
above as ground truth.

**Recommended use:** `sensitivity_range`, confidence **Medium** — this is public-company
WACC used as a proxy for a project-level equipment discount rate, not a
hospital-capex-project-specific figure, and the Edelweiss number is one analyst's DCF
assumption, not the hospital's own stated cost of capital. Set
`equipment-data/common-assumptions.json#discountRate` to low=11.1, typical=12.5 (rounded
midpoint of the 12-13% cluster), high=14.1, sourceId="S22,S23".

### 17.2 Target IRR / hurdle rate

No credible public or academic source reports a target IRR or hurdle rate used by
Indian hospitals or healthcare investors for equipment-capex approval. Industry/PE
commentary discusses financing trends but never discloses numerical hurdle rates.
**Confirmed unavailable** — this would require access to hospital finance-committee
policy, PE fund disclosures, or lender credit memoranda, none of which are public.
`recommended_use`: `user_input_required`, confidence **Unavailable**. Suggested UI
guidance (a methodology, not a benchmark): a common capital-budgeting heuristic is
target IRR = discount rate + a risk premium (commonly 300-500 bps for equipment-level
projects) — offer this as a starting-point suggestion the user can override, clearly
labeled as a suggested approach rather than a researched number.

### 17.3 Usage-per-day (utilization)

| Equipment | Finding | Confidence | Source |
|---|---|---|---|
| MRI | NIMS (tertiary teaching hospital) study: 14h/day operation, mean **23 scans/day**, ~31min average scan time, 48.54% use coefficient. | Medium (single Indian study, busy referral hospital — may run higher than a typical smaller private setup) | S24 |
| MRI | Global context: most MRI scanners worldwide perform 20-40 scans/day (long scan times are the constraint). | Medium (global, not India-specific) | S25 |
| CT Scan | AIIMS Delhi PET/CT cost analysis: ~30 PET/CT scans/day across two scanners = ~15/scanner. | Low-Medium (PET/CT ≠ standard CT throughput; proxy only) | S26 |
| CT Scan | No Indian standalone-CT utilization study found. An unsourced "engineering guide" estimate suggests 20-30/day globally. | Low | — |
| Cath Lab | Vendor guidance: 4-6 diagnostic catheterizations/day, or 2-4 PCI/interventional procedures/day; high-volume centres do 1,000-2,000 procedures/year. | Low (vendor guidance, not empirical; blends two different procedure types — consistent with §13.3's existing caution against a single blended cath lab average) | S27 |
| Dialysis unit | MoHFW/NITI planning guideline: three 4-hour shifts/machine/day = **3 sessions/machine/day** design capacity. | Medium (official planning norm, but a design-capacity figure — real-world utilization "may be lower in smaller facilities" per the same source) | S28 |
| Ultrasound | No published Indian data. Unsourced international inference (15-30min/exam → 16-32 scans/day) explicitly lacks an authoritative India source. | Unavailable | — |

### 17.4 Average billed tariff per use

CGHS's October 2025 rate list (S29) gives reimbursement ceilings (non-NABH / NABH) for
imaging and dialysis. **Important caveat, repeated from §12.3's general framing:**
these are government-scheme reimbursement ceilings, not private cash tariffs — private
hospitals typically charge more, and this data should be used as a directional
tariff *floor*, not a "typical" private billed-revenue default.

```text
CT head/brain (plain):        ₹880 / ₹1,035
CT head with contrast:        ₹1,870 / ₹2,200
CT chest or HRCT chest:       ₹1,700 / ₹2,000
CT whole abdomen w/ contrast: ₹4,399 / ₹5,175
MRI head/brain (plain):       ₹2,338 / ₹2,750
MRI head with contrast:       ₹4,250 / ₹5,000
MRI knee (example, other body part): ₹2,380 / ₹2,800
Ultrasound whole abdomen:     ₹680 / ₹800
Ultrasound pelvis:            ₹425 / ₹500
Ultrasound small parts:       ₹655 / ₹770
```

Dialysis tariffs come from a separate, older CGHS package-rate document (S30, nominally
2014, "updated" 2024-02-05 — a different vintage than S29's Oct-2025 imaging rates,
worth noting as a freshness mismatch between the two CGHS documents):

```text
Hemodialysis (seronegative):           ₹1,400 / ₹1,610 per session
Hemodialysis (seropositive):           ₹1,650 / ₹1,898 per session
Sustained low-efficiency hemodialysis: ₹1,250 / ₹1,438 per session
```

**Note on internal inconsistency:** the research output's own machine-readable table
gives different (lower) NABH-side values for several of these rows than its own prose
text states (e.g., CT head/brain plain: prose says ₹1,035, that pass's table says
957.5). The prose figures above are used as ground truth since they're stated as direct
quotes with clear citations; the table appears to have a transcription error.

A single stale (2013) private-hospital data point exists for context only (S31,
**13 years old, do not use as a current default**): CT head ₹900, CT chest/abdomen
₹1,200, MRI ₹2,500 — all below current CGHS rates, consistent with inflation over the
intervening period.

**Recommended use:** `benchmark_tooltip`, confidence **Medium**, with each equipment's
`equipment-data/<type>.json#billedTariffPerUse` anchored to one representative baseline
procedure (plain/whole-organ study) since a single field can't hold every procedure
variant — see the per-file notes for which variant was chosen and why. **Cath Lab had
zero tariff data through this point** — resolved by a third research pass, see §18.5
(diagnostic catheterization, ₹11,920-₹15,000, High confidence). The original finding that
cath lab needs procedure-mix modeling rather than one blended average (§13.3) still
stands — the resolved figure covers diagnostic catheterization only, not the full
procedure mix (PCI/interventional pricing remains unresearched).

### 17.5 Launch delay / time-to-first-revenue

| Equipment | Finding | Confidence | Source |
|---|---|---|---|
| MRI | Installation (civil work, RF shielding, magnet commissioning): 6-10 weeks. No AERB licensing needed (non-ionizing). | Low-Medium (single vendor/supplier blog) | S32 |
| CT Scan | Delivery-to-first-scan once site is ready: 3-5 days. Separately, AERB radiation approval: qualitatively "a few weeks to a couple of months" (no exact source figure — approximated here as 3-6 weeks). These are largely sequential, not additive with civil work time, which isn't covered by either source. | Low (vague qualitative source language for the AERB component; no official SLA found) | S33, S34 |
| Cath Lab | Elesonic vendor guide: 3-6 months room construction + 2-4 weeks equipment delivery + 2-4 weeks installation/calibration + 1-2 weeks commissioning/training = **4-8 months total** project timeline. | Low-Medium (vendor guide, but a detailed, plausible breakdown) | S27 |
| Dialysis unit | No credible source found for purchase-to-first-revenue duration. Installation is mainly plumbing/water-treatment/staff training. | Unavailable | — |
| Ultrasound | Portable units need minimal site work and are "usually usable immediately" — informal claim only, no formal timeline study found. | Unavailable (as a number); informal qualitative claim only | — |

### 17.6 Cath lab and dialysis acquisition cost — strengthened

**Cath Lab:** international (non-India, USD, not converted per this file's own rule
against silent currency conversion) pricing: new single-plane $1-2M, new biplane
$2-4M; refurbished single-plane $250k-600k, refurbished biplane $400k-1.2M (S27);
refurbished GE/Philips $200k-600k (S35). These are supplementary global context only —
Indian landed cost includes import duty, GST, and logistics not reflected in these
figures, and configuration (single-plane vs. biplane) for the existing Indian data
point (S13, ₹9 crore) is unspecified. The single Indian data point remains the primary
INR anchor; confidence stays **Low**.

**Dialysis unit:** a 2022 government tender (Indian Embassy, Nepal) for 200
hemodialysis machines plus 60 RO systems gives a total cost of ₹23.49 crore, implying
**₹11.5 lakh per machine** (S36). This is a real, dated, officially-documented
per-machine estimate — meaningfully stronger than the prior single procurement-estimate
data point. Caveats: (1) it's a bulk-procurement price (200 units) — a private hospital
buying one or two units may pay more; (2) the total bundles 60 RO/water-treatment
systems across 200 machines, so the per-machine figure likely includes some pro-rata
site/RO cost, not a bare machine-only price. `recommended_use`: `benchmark_tooltip`,
confidence **Medium**.

### 17.7 New machine-readable rows (extends §14's table)

| equipment_type | data_area | metric_name | value_type | value_low | value_mid | value_high | unit | recommended_use | confidence | source_id | notes |
|---|---|---|---|---:|---:|---:|---|---|---|---|---|
| Common | financial_model | discount_rate_wacc_proxy | range | 11.1 | 12.5 | 14.1 | percent p.a. | sensitivity_range | Medium | S22,S23 | Listed-hospital-chain WACC as proxy; not equipment-project-specific |
| Common | financial_model | target_irr_hurdle_rate | unavailable | | | | percent p.a. | user_input_required | Unavailable | — | Confirmed unresearchable in 2 passes; suggest discount rate + 300-500bps as a heuristic, not a benchmark |
| MRI | utilization | scans_per_day_nims_study | single | | 23 | | scans/day | benchmark_tooltip | Medium | S24 | Tertiary teaching hospital, 14h/day operation |
| MRI | utilization | scans_per_day_global_range | range | 20 | | 40 | scans/day | sensitivity_range | Medium | S25 | Global, not India-specific |
| CT Scan | utilization | pet_ct_scans_per_day_aiims | single | | 15 | | scans/day/scanner | warning_only | Low-Medium | S26 | PET/CT proxy, not standard CT |
| Cath Lab | utilization | diagnostic_procedures_per_day | range | 4 | | 6 | procedures/day | benchmark_tooltip | Low | S27 | Vendor guidance |
| Cath Lab | utilization | interventional_pci_per_day | range | 2 | | 4 | procedures/day | benchmark_tooltip | Low | S27 | Vendor guidance |
| Dialysis unit | utilization | sessions_per_machine_per_day | single | | 3 | | sessions/day | default_assumption | Medium | S28 | Design-capacity norm, not necessarily real-world |
| CT Scan | tariff | ct_head_brain_plain | range | 880 | | 1035 | INR | benchmark_tooltip | Medium | S29 | CGHS reimbursement ceiling, not private cash tariff |
| MRI | tariff | mri_head_brain_plain | range | 2338 | | 2750 | INR | benchmark_tooltip | Medium | S29 | CGHS reimbursement ceiling, not private cash tariff |
| Ultrasound | tariff | ultrasound_whole_abdomen | range | 680 | | 800 | INR | benchmark_tooltip | Medium | S29 | CGHS reimbursement ceiling, not private cash tariff |
| Dialysis unit | tariff | hemodialysis_seronegative | range | 1400 | | 1610 | INR/session | benchmark_tooltip | Medium | S30 | CGHS reimbursement ceiling, different vintage than S29 |
| MRI | installation_timeline | mri_installation_weeks | range | 6 | | 10 | weeks | benchmark_tooltip | Low-Medium | S32 | No AERB needed for MRI |
| CT Scan | installation_timeline | ct_aerb_approval_weeks | range | 3 | | 6 | weeks | warning_only | Low | S33,S34 | Qualitative source language, approximated |
| Cath Lab | installation_timeline | cath_lab_total_project_months | range | 4 | | 8 | months | benchmark_tooltip | Low-Medium | S27 | Construction + delivery + install + commissioning |
| Dialysis unit | acquisition_cost | hemodialysis_machine_cost_tender | range | 10 | 11.5 | 11.5 | lakh INR | benchmark_tooltip | Medium | S36 | Bulk govt tender, may include pro-rata RO/site cost |

---

## 18. Third Research Pass Findings (2026-07-07)

A third, narrowly-scoped research pass (ChatGPT Deep Research) targeted exactly the six
gaps §15 flagged as having zero coverage after two passes: warranty period, salvage/
residual value, installation/ancillary cost %, AMC/CMC annual cost + duration, Cath Lab
tariff, and Dialysis/Ultrasound launch delay, plus one stretch goal (a stronger CT
utilization source). Source: primarily Indian government e-procurement (GeM) tenders and
hospital-specific tender documents (AIIMS Rishikesh/Patna, NEIGRIHMS, J&K Medical
Supplies Corp, West Bengal Medical Services Corp), plus CGHS/PM-JAY official rate lists.
Two claims were independently spot-checked this session via a second, different source
(not just re-reading the pass's own citation) — see §18.9.

### 18.1 Warranty period

| Equipment | Finding | Confidence | Source |
|---|---|---|---|
| MRI | Two independent government tenders (Shirdi Saibaba Sansthan Trust 3T MRI; NEIGRIHMS 1.5T MRI) both specify 5-year comprehensive warranty. | **High** — two independent official tenders converge | S37, S38 |
| CT Scan | Karnataka KKRDB tender specifies 3-year warranty; NEIGRIHMS 128-slice CT tender specifies 5-year warranty (+5yr CMC). Genuine variation across tenders, not a data-quality problem. | Medium | S39, S40 |
| Cath Lab | AIIMS Rishikesh and J&K MSCL tenders both specify 5-year warranty + 5-year CMC; West Bengal's tender specifies only 2-year warranty + 8-year CMC. Real variation — West Bengal's structure trades a shorter warranty for a longer/detailed CMC schedule. | Medium | S41, S42, S43 |
| Dialysis | MEA/Nepal tender: 2-year warranty on the dialysis machine itself (parts+consumables). NHM Odisha pre-bid clarification: 3-year comprehensive warranty. A separate GeM spec gives 5-year warranty **on the RO water-treatment system specifically**, not the dialysis machine — these are two different equipment items bundled in one tender, not a contradiction. | Medium | S44, S45, S46 |
| Ultrasound | AIIMS Patna tender: 5-year comprehensive warranty + 5-year CMC. Single source — no corroborating tender found, so this is Medium confidence (single-tender), not High, despite being the only figure found. | Medium | S47 |

### 18.2 Salvage / residual value

Schedule II of the Companies Act 2013 caps residual value at 5% of original cost unless a
higher value is separately justified and disclosed — this is a general corporate-accounting
default, not medical-equipment-specific, and no source was found suggesting medical
equipment gets a different treatment. **Recommended: 5% for all five equipment
categories.**

**Citation caveat (important):** the research pass cited an Income Tax Department
depreciation-rates page (S48) for this claim, which covers Income Tax Act depreciation
blocks — a different regime from the Companies Act Schedule II residual-value rule being
described. This looks like a citation mismatch, not a wrong number — the 5% figure itself
is well-established and widely cited in Indian corporate accounting practice. This session
attempted to independently verify the exact Schedule II clause against three sources
(India Code's own Schedule II file, MCA's Schedule II PDF, and a secondary CA-focused
summary); the first was inconclusive due to PDF text-extraction issues, the second
returned HTTP 403, and the third 404'd. **Full independent verification was not
completed.** Source is recorded as **S8** (Companies Act Schedule II, India Code — the
same document already used in this file for useful-life figures, and the correct legal
source for a residual-value provision within the same schedule) rather than S48, since S8
is the document that actually contains this rule if the widely-cited figure is accurate.
**Confidence: Medium-High** — reflects "well-established and highly likely correct" but
not "independently confirmed against primary text this session."

### 18.3 Installation / ancillary cost as % of equipment cost

| Equipment | Finding | Confidence | Source |
|---|---|---|---|
| MRI & CT | NEIGRIHMS tenders (both 1.5T MRI and 128-slice CT) require **at least 10%** of product cost allocated to installation/commissioning/testing (ICT); a Dr. Bhubaneswar Borooah Cancer Institute MRI tender sets the ICT minimum at **30%**. Range: 10-30%. | Medium — these are tender-mandated *minimum bid allocations*, not measured actual average spend; a bid-structuring floor, not empirical cost data | S38, S40, S49 |
| Cath Lab | No tender states a fixed percentage; J&K tender requires turnkey installation + lab/waiting-area renovation within 180 days, evaluated as part of the bid but not broken out as a %. 20-30% is the pass's own inference from the scope of turnkey work described, not a stated figure. | Medium (pass's own caveat: "indirect evidence") | S42 |
| Dialysis | GeM spec requires turnkey RO-plant installation; no cost % stated. 5-10% is an inference from unnamed "anecdotal project reports," not a citable source. | Low | — (uncited in pass) |
| Ultrasound | A buying-guide site notes ultrasound site prep is light (power, storage, network) vs. heavy civil work for imaging equipment. 0-5% is a reasonable inference, not a measured figure. | Low | S50 |

### 18.4 AMC / CMC annual cost and coverage duration

**Important finding — read before using these numbers as defaults:** AMC and CMC are
genuinely different things in Indian medical-equipment service contracts and this pass
correctly separated them: **AMC** (Annual Maintenance Contract) is typically labour-only,
consumer/hospital supplies parts; **CMC** (Comprehensive Maintenance Contract) includes
parts and is priced higher. Two new fields are needed in the equipment-data schema to
hold both — see §18.10.

**AMC (labour-only) — identical 2-2.5% figure applied to all 5 equipment types.** This is
**not 5 independent findings** — it's a single generic tender clause (SCTIMST's 2.5%
labour-only AMC cap, S52) used as a fallback proxy everywhere the pass couldn't find
equipment-specific AMC data, which was everywhere. Treat as **Low confidence,
sensitivity_range only**, identical across MRI/CT/Cath Lab/Dialysis/Ultrasound — do not
present this as if it were researched per equipment.

**CMC (comprehensive) — mostly generic, with two real exceptions:**
- **Cath Lab is genuinely equipment-specific and stronger:** West Bengal's tender gives
  actual year-wise CMC rates, 6% in year 1 rising 0.1pp/year to 6.7% in year 8 — a real,
  detailed, single-source schedule. Medium-High confidence. (S43)
- **MRI has a direct contradiction that needed a call, not a silent pick:** a
  peer-reviewed life-cycle-costing study of one MRI at an unnamed tertiary-care
  teaching hospital (S53 — the paper's authors were affiliated with AIIMS New Delhi,
  but author affiliation is not proof of which hospital owned the scanner, and the
  paper itself never names the hospital) found *actual* post-warranty CMC cost was
  only ~0.23-0.28% of equipment value per year (₹9.7 lakh total over 5 years on a
  ~₹7.5 crore machine) — **roughly 25-30x lower** than the generic 3-10% tender-ceiling
  range the pass otherwise applies to MRI. These measure different things: the tender
  range is a contractual **ceiling** vendors are allowed to bid up to; the S53 figure is
  **one unnamed hospital's actual realized cost**. **Resolved 2026-07-11 (a fourth,
  targeted research pass) — see §19.5:** the working theory that this gap reflects
  hospital scale/negotiating volume was tested directly and is **not verified**; no
  bed-count or scan-volume MRI maintenance-pricing schedule exists in any source found.
  Both figures stay recorded separately in `equipment-data/mri.json`, neither
  presented as the default, per the product decision in §19.5.
- **CT, Dialysis, Ultrasound:** all fall back to the same generic ranges — CT/Dialysis use
  the general GeM 3-10% CMC range (S51); Ultrasound uses SCTIMST's tighter 3-5% CAMC cap
  (S52) since that's what the pass happened to apply there. Low-Medium confidence, not
  equipment-specific.

**CMC duration:** MRI/CT/Dialysis/Ultrasound cluster around 5 years (matches their 5-year
warranty + 5-year CMC tender pattern). Cath Lab ranges 5-8 years across tenders (West
Bengal's 8yr vs. AIIMS/J&K's 5yr).

### 18.5 Cath Lab diagnostic-catheterization tariff — previously zero data, now resolved

CGHS's October 2025 rate list (Procedure Code CI017) and PM-JAY's Health Benefit Package
master list both give cardiac-catheterization package rates, and they closely agree:

| Source | Tier 1/Metro | Tier 2 | Tier 3/District |
|---|---|---|---|
| CGHS (NABH), Oct 2025 | ₹14,900 | ₹13,410 | ₹11,920 |
| PM-JAY HBP | ₹15,000 | ₹14,200 | ₹12,500 |

**Independently verified this session** (not just re-reading the pass's citation): fetched
`cghshospitals.com`'s cardiac-catheterization rate page directly — a different site than
the pass's own csir.res.in PDF citation — and it returned the identical ₹14,900/₹13,410/
₹11,920 figures with the same effective date (2025-10-13) and procedure code (CI017).
**Confidence: High** — two independent official schemes agree closely, and one was
independently re-fetched from a second site. **Recommended value: ₹11,920-₹15,000 per
procedure**, `benchmark_tooltip`. This resolves the "Cath Lab has zero tariff data" gap
noted in §17.4 and ISS-9/ISS-3.

### 18.6 Launch delay — Dialysis and Ultrasound

Neither figure is equipment-specific or strongly sourced — both are informal/adjacent
inferences, kept for completeness but clearly labeled Low confidence:

- **Dialysis:** a general (non-dialysis-specific) RO-plant installation FAQ states small/
  medium RO systems commission "within days to a few weeks." Pass's inference: 2-4 weeks
  (~0.5-1 month). Confidence Low. (S56)
- **Ultrasound:** a buying-guide site claims ultrasound units are "usable almost
  immediately" given minimal site needs. Pass's inference: 0-2 weeks (~0-0.5 month).
  Confidence Low, informal claim only, no timeline study. (S50)

### 18.7 CT utilization — new source found, does not strengthen existing confidence

IPHS (Indian Public Health Standards) district-hospital guidelines describe a
radiologist's *combined* workload as 20-30 imaging examinations/day across X-ray, CT, and
ultrasound together (S57) — not CT alone. This happens to produce a similar 15-30
scans/day range to the existing `equipment-data/ct.json` entry, but it's **not a stronger
source** than what's already cited there (a dedicated, if imperfect, AIIMS PET/CT
throughput study, S26) — it's a more blended, multi-modality proxy. **No change made to
`ct.json`'s existing values or confidence level**; this is recorded here as a corroborating
data point only. Standalone CT utilization remains a genuine open gap.

### 18.8 New machine-readable rows

| equipment_type | data_area | metric_name | value_type | value_low | value_mid | value_high | unit | recommended_use | confidence | source_id | notes |
|---|---|---|---|---:|---:|---:|---|---|---|---|---|
| MRI | maintenance | warranty_years | single | | 5 | | years | default_assumption | High | S37,S38 | Two independent tenders converge |
| CT Scan | maintenance | warranty_years | range | 3 | 4 | 5 | years | benchmark_tooltip | Medium | S39,S40 | Genuine tender-to-tender variation |
| Cath Lab | maintenance | warranty_years | range | 2 | 4 | 5 | years | benchmark_tooltip | Medium | S41,S42,S43 | Genuine tender-to-tender variation |
| Dialysis unit | maintenance | warranty_years_machine | range | 2 | 3 | 3 | years | benchmark_tooltip | Medium | S44,S45 | Machine only, excludes RO plant |
| Dialysis unit | maintenance | warranty_years_ro_plant | single | | 5 | | years | benchmark_tooltip | Medium | S46 | RO water-treatment system, not the dialysis machine itself |
| Ultrasound | maintenance | warranty_years | single | | 5 | | years | benchmark_tooltip | Medium | S47 | Single tender, no corroboration |
| Common | accounting | residual_value_percent | single | | 5 | | percent | default_assumption | Medium-High | S8 | Companies Act Schedule II general rule; citation corrected from pass's own (mismatched) S48, not independently re-verified against primary text this session |
| MRI | installation | installation_cost_percent | range | 10 | 20 | 30 | percent of equipment cost | sensitivity_range | Medium | S38,S40,S49 | Tender-mandated minimum bid allocation, not measured actual spend |
| CT Scan | installation | installation_cost_percent | single | | 10 | | percent of equipment cost | sensitivity_range | Medium | S40 | Tender-mandated minimum |
| Cath Lab | installation | installation_cost_percent | range | 20 | 25 | 30 | percent of equipment cost | sensitivity_range | Medium | S42 | Inferred from turnkey scope, not a stated %; pass's own caveat |
| Dialysis unit | installation | installation_cost_percent | range | 5 | 7.5 | 10 | percent of equipment cost | sensitivity_range | Low | — | Uncited "anecdotal project reports" in the pass |
| Ultrasound | installation | installation_cost_percent | range | 0 | 2.5 | 5 | percent of equipment cost | sensitivity_range | Low | S50 | Inference from light site-prep description |
| MRI | maintenance | amc_cost_percent_labour_only | range | 2 | 2.25 | 2.5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy, identical across all 5 equipment types, not equipment-specific |
| CT Scan | maintenance | amc_cost_percent_labour_only | range | 2 | 2.25 | 2.5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy — see MRI row note |
| Cath Lab | maintenance | amc_cost_percent_labour_only | range | 2 | 2.25 | 2.5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy — see MRI row note |
| Dialysis unit | maintenance | amc_cost_percent_labour_only | range | 2 | 2.25 | 2.5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy — see MRI row note |
| Ultrasound | maintenance | amc_cost_percent_labour_only | range | 2 | 2.25 | 2.5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy — see MRI row note |
| MRI | maintenance | cmc_cost_percent_tender_ceiling | range | 3 | 6.5 | 10 | percent of equipment cost/yr | sensitivity_range | Low-Medium | S51,S52 | Generic tender-ceiling range — CONTRADICTS a real single-hospital observed cost of 0.23-0.28%/yr, see §18.4 and S53; do not use as sole default |
| MRI | maintenance | cmc_cost_percent_observed_actual | single | | 0.25 | | percent of equipment cost/yr | warning_only | Medium | S53 | One AIIMS hospital's real life-cycle-costing study; may be unusually low/negotiated, see §18.4 |
| CT Scan | maintenance | cmc_cost_percent | range | 3 | 6.5 | 10 | percent of equipment cost/yr | sensitivity_range | Low-Medium | S51,S52 | Generic proxy, not equipment-specific |
| Cath Lab | maintenance | cmc_cost_percent | range | 6 | 6.35 | 6.7 | percent of equipment+turnkey cost/yr | benchmark_tooltip | Medium-High | S43 | Real year-wise tender schedule — the strongest CMC figure of the five |
| Dialysis unit | maintenance | cmc_cost_percent | range | 3 | 6.5 | 10 | percent of equipment cost/yr | sensitivity_range | Low | S51,S52 | Generic proxy, not equipment-specific |
| Ultrasound | maintenance | cmc_cost_percent | range | 3 | 4 | 5 | percent of equipment cost/yr | sensitivity_range | Low | S52 | Generic proxy (tighter SCTIMST CAMC range) |
| MRI | maintenance | cmc_duration_years | single | | 5 | | years | benchmark_tooltip | Medium | S38 | Follows 5yr warranty |
| CT Scan | maintenance | cmc_duration_years | single | | 5 | | years | benchmark_tooltip | Medium | S40 | Follows 5yr-warranty tender |
| Cath Lab | maintenance | cmc_duration_years | range | 5 | 6.5 | 8 | years | benchmark_tooltip | Medium | S42,S43 | Genuine tender-to-tender variation |
| Dialysis unit | maintenance | cmc_duration_years | single | | 5 | | years | benchmark_tooltip | Medium | S46 | RO plant CMC |
| Ultrasound | maintenance | cmc_duration_years | single | | 5 | | years | benchmark_tooltip | Medium | S47 | Single tender |
| Cath Lab | tariff | diagnostic_catheterization | range | 11920 | 13410 | 15000 | INR | benchmark_tooltip | High | S39cghs,S54,S55 | Two official schemes converge; independently re-verified this session against a second site |
| Dialysis unit | installation_timeline | ro_plant_commissioning | range | 0.5 | 0.75 | 1 | months | warning_only | Low | S56 | Not dialysis-specific; general RO-plant FAQ |
| Ultrasound | installation_timeline | usable_after_delivery | range | 0 | 0.25 | 0.5 | months | warning_only | Low | S50 | Informal claim, no timeline study |

### 18.9 Source register additions (S37-S57)

| ID | Source | Type | URL | Covers | Confidence |
|---|---|---|---|---|---|
| S37 | Shri Saibaba Sansthan Trust, Shirdi — 3T MRI tender | Government trust tender | https://www.sai.org.in/sites/default/files/Tender%20A%20-MRI.pdf | MRI 5yr warranty | Medium |
| S38 | NEIGRIHMS GeM tender — 1.5T MRI with workstations | Government hospital tender | https://neigrihms.gov.in/tender/TenderStore/2023/September/GeM-Bidding-4945299-SITC%20of%20MRI%20system(1.5T)%20with%20Additional%20Workstations%20on%20buy%20back%20basis.pdf | MRI 5yr warranty+CMC; 10% ICT minimum | Medium |
| S39 | Karnataka KKRDB medical equipment quotation | State government tender | https://dme.karnataka.gov.in/storage/pdf-files/KKRDB%20QUOTATION%20FOR%20MEDICAL%20EQUIPMENTS.pdf | CT 3yr warranty | Medium |
| S40 | NEIGRIHMS GeM tender — 128-slice CT with turnkey works | Government hospital tender | https://neigrihms.gov.in/tender/TenderStore/2024/March/GeM-Bidding-4343183-CT%20SCANNER%20UNIT%20with%20Detailed%20Turnkey%20Works.pdf | CT 5yr warranty+CMC; 10% ICT minimum | Medium |
| S41 | AIIMS Rishikesh — new cath lab tender | Government hospital tender | https://aiimsrishikesh.edu.in/tenders/212%20new%20cath%20lab%20tender.pdf | Cath Lab 5yr warranty+CMC | Medium |
| S42 | J&K Medical Supplies Corp — cath lab NIT 2026 | State government tender | https://www.jkmsclbusiness.com/pdf/sbd689.pdf | Cath Lab 5yr warranty+CMC, turnkey installation, 180-day timeline, 20-30% installation inference | Medium |
| S43 | West Bengal Medical Services Corp — cath lab tender notice | State government tender | https://www.wbmsc.gov.in/notice/wbmsc-notice-5303.pdf | Cath Lab 2yr warranty, 8yr CMC at 6-6.7%/yr, 180-day installation | Medium |
| S44 | MEA tender — 200 dialysis machines + 60 RO systems, Nepal embassy | Government tender | https://www.mea.gov.in/Portal/Tender/5056_1/1_Etenderdocument-1.pdf | Dialysis machine 2yr warranty | Medium |
| S45 | NHM Odisha — dialysis tender pre-bid clarification | State health mission document | https://nhmodisha.gov.in/wp-content/uploads/2023/06/Pre-bid-Clarification-Amendments-Dialysis-Tender-SDH-for-web.pdf | Dialysis machine 3yr warranty | Medium |
| S46 | GeM specification document — hemodialysis machine with RO system | Government e-marketplace spec | https://mkp.gem.gov.in/catalog_data/catalog_support_document/buyer_documents/6488347/54/78/703/CatalogAttrs/SpecificationDocument/2022/11/14/hemodialysis-machine-along-with-reverse-osmosiswat_2022-11-14-11-33-01_95732bf4fceef0e609c1636ddac608a5.pdf | RO plant 5yr warranty+CMC, turnkey installation | Medium |
| S47 | AIIMS Patna — portable colour-Doppler ultrasound tender | Government hospital tender | https://aiimspatna.edu.in/advertisement/6t176_ultraound_obs.pdf | Ultrasound 5yr warranty+CMC | Medium |
| S48 | Income Tax Dept — depreciation rates page | Government tax page | https://www.incometaxindia.gov.in/w/depreciation-rates | Cited by the pass for the 5% residual-value claim; likely a citation mismatch (Income Tax Act depreciation ≠ Companies Act Schedule II residual value) — see §18.2. Not used as the recorded source; S8 used instead. | Low (citation questioned) |
| S49 | Dr. Bhubaneswar Borooah Cancer Institute — MRI tender | Government hospital tender | https://bbci.in/Content/uploads/tender/nit_mri-machine.pdf | 30% ICT minimum for MRI | Medium |
| S50 | MedEquipGuide — Ultrasound System Buying Guide | Industry/vendor guide site | https://www.medequipguide.org/equipment/radiology-imaging/ultrasound | Ultrasound light site-prep, near-immediate usability | Low |
| S51 | GeM bidding document (general medical equipment) | Government e-marketplace tender | https://asmchardoi.org/wp-content/uploads/2021/09/GeM-Bidding-2634772.pdf | General CMC 3-10%/yr range | Medium |
| S52 | SCTIMST tender B_2022-23_2701 | Government institute tender | https://tenders.sctimst.ac.in/resources/B_2022-23_2701.pdf | CAMC 3-5%, labour-only AMC 2.5% caps | Medium |
| S53 | "Life cycle costing of MRI machine at a tertiary care teaching hospital", PMC | Peer-reviewed article | https://pmc.ncbi.nlm.nih.gov/articles/PMC7546299/ | Real observed MRI CMC cost ~0.23-0.28%/yr — contradicts S51/S52's generic ceiling for MRI, see §18.4 | Medium |
| S54 | cghshospitals.com — Cardiac Catheterization (CATH) rate page | Rate-lookup site (CGHS-derived) | https://cghshospitals.com/rates/cardiac-catheterization-cath-1202 | Cath Lab tariff — independently re-fetched this session, matches S29 exactly | Medium-High |
| S55 | PM-JAY Health Benefit Package master list (HBP 2022) | Official government scheme document | https://ayushmanup.in/assets/doc/HBP-2022.pdf | Cath Lab (Right/Left Heart Catheterization) package rates | Medium-High |
| S56 | Advance Engineers — RO plant installation & commissioning FAQ | Vendor/industry FAQ page | https://advancees.com/services/ro-plant-start-up-installation-commissioning/ | Generic (non-dialysis-specific) RO commissioning timeline | Low |
| S57 | NHSRC — Indian Public Health Standards, Vol.1 (SDH/DH) | Government health-standards document | https://nhsrcindia.org/sites/default/files/Volume%201_SDH-DH_0.pdf | Combined imaging-modality workload norm, not CT-specific | Medium |
| S58 | AIIMS New Delhi — Annual Report 2014-15 | Official government institute annual report | https://www.aiims.edu/aiims%20old/annual-report/AIIMS%20Report%20English%202014-15.pdf | Records 1,147 beds (Main Hospital) + 412 beds (Cardiothoracic and Neurosciences Centre) = 1,559 across those two named facilities; used to test (not confirm) the ISS-12 bed/volume-tiering hypothesis — this is AIIMS New Delhi's general bed count, not the S53 study site's, which the paper doesn't name — see §19.5 | High for the bed figures themselves; Unavailable as evidence about S53's study site |
| S59 | Sunrays Image Technology — Siemens MRI AMC vs. CMC cost analysis | Vendor/promotional newsroom page | https://sunraysmedical.com/newsroom/siemens-mri-amc-vs-cmc-cost-analysis-india | Recommends AMC below ~15 scans/day and CMC above ~20 scans/day; prices vary by MRI model, not by volume/bed count — supports coverage-type guidance, not a volume-based price discount | Low (promotional vendor material, no underlying contracts) |
| S60 | Competition Commission of India — Order dated 16 June 2022 | Official regulatory order | https://www.cci.gov.in/images/antitrustorder/en/0620221655379346.pdf | Portable CT AMC/CMC terms discounted for an expected multi-machine purchase (five-year CAMC ₹15 lakh/yr +2%/yr escalation; later quotes ₹65L→₹58.5L with X-ray tube, ₹35L→₹31.5L without, after negotiation). Shows fleet size/negotiation can affect imaging-maintenance terms in principle; doesn't quantify a clean fleet discount, establish a bed-count effect, or apply directly to MRI — some figures are disputed parties' own submissions | Medium |
| S61 | HIMSR — CMC tender notice for 7 Fresenius dialysis machines (25 June 2026) | Government hospital tender notice | https://www.himsr.co.in/tenders/invitation-of-quotations-for-comprehensive-maintenance-contract-cmc-of-fresenius-dialysis-machines-07-units/ | Confirms bundled multi-machine CMC procurement happens; publishes no price and no single-machine comparator, so establishes bundling only, not a discount magnitude | Medium for bundling; Unavailable for any discount figure |

Note: S29 and S30 (CGHS rate lists) were already in this file's source register from the
second pass — this pass cited the same two documents again for cardiology/dialysis
sections of those same rate lists, so no new number was assigned; see §18.5's table.

### 18.10 Schema note for `equipment-data/*.json`

The existing schema has one field for comprehensive-maintenance duration (`cmcYears`)
and one for annual maintenance cost (`amcAnnualCostPercentage`), but no field for CMC's
own annual cost — AMC and CMC are priced differently (labour-only vs. parts-included) and
this pass found real, distinct numbers for both. Added a new field,
`cmcAnnualCostPercentage`, alongside the existing `amcAnnualCostPercentage`, in all five
equipment files.

---

## 19. Volume / Bed-Size Tiering for Maintenance Contracts (added 2026-07-11)

**Resolved 2026-07-11, same day, via a fourth targeted research pass — see §19.5 for
the findings and product decision.** §19.1-§19.4 below are kept as the historical
record of the original hypothesis; the hypothesis was tested and **not verified** — do
not build bed-count-tiered CMC/AMC defaults from this section.

### 19.1 The hypothesis

Jay's read on ISS-12 (the MRI CMC contradiction, §18.4): S51/S52's 3-10% generic
tender-ceiling range and S53's ~0.23-0.28% AIIMS-observed actual cost may not really be
two competing estimates of the same thing. AIIMS is, by public reputation, a very
large, very high-volume referral institute — plausibly on the order of 2,000+ beds —
and a hospital operating at that scale and negotiating leverage would be expected to
land a materially better CMC/AMC rate than a smaller private hospital paying close to
the tender ceiling. If so, the "contradiction" is really two different points on a
volume/bed-count curve, and the fix isn't to pick one number, it's to make the default
bed-count-dependent.

**Caveat, not yet cleared:** AIIMS's exact bed count was not independently verified or
cited in S53 or anywhere else in this document's source register — the ~2,000+ figure
above is public general knowledge, not a sourced data point, and must not be presented
as one. Verifying it (or finding a source that states the bed count of the specific
AIIMS institution S53's study was conducted at) is the first thing a follow-up pass
should do, before the volume theory can be treated as more than a plausible hypothesis.

### 19.2 Proposed structure

Reuse the bed-size buckets already suggested in §2.3 rather than invent a new
bucketing scheme (`<50`, `50-100`, `101-250`, `251-500`, `>500` beds, plus standalone
diagnostic center) — those were defined for utilization tagging but the same buckets
should work for maintenance-contract tiering. One likely adjustment: the open-ended
`>500` bucket probably needs splitting further (e.g. `501-1000`, `>1000`), since a
600-bed private hospital and a 2,000+-bed referral institute like AIIMS are not the
same negotiating tier and currently fall in the same bucket.

This generalizes beyond MRI's CMC field — the same volume-leverage logic plausibly
applies to AMC for every equipment type (all five currently share one identical
generic proxy, §18.4/§18.9), and potentially to other volume-sensitive contract terms
Jay flagged in conversation (e.g. consumable/reagent supply agreements for Cath
Lab/Dialysis), though those are a distinct question from CMC/AMC and not scoped here.

A scaffold for this has been added to `equipment-data/mri.json`'s
`cmcAnnualCostPercentage._bedVolumeTierHypothesis` — explicitly marked
"hypothesis, not yet researched, do not use for defaults." No numeric bed-tier values
exist yet anywhere in this project; per this project's own no-invented-numbers rule
(§3, ISSUES.md ISS-9), they should come from a targeted research pass, not be guessed.

### 19.3 Product implication

If bed-count-tiered defaults are built, `Hospital bed size` (already listed as a Basic
Mode input, SPEC.md §10.1) stops being optional context and becomes a required lookup
key — see SPEC.md §36.1 Q6, resolved 2026-07-11 on this basis.

### 19.4 Next action

Added to §15's gap list. Candidate brief for a fourth targeted research pass: find
Indian hospital tenders, case studies, or vendor pricing schedules that break out
CMC/AMC cost (or discount off the standard rate) by hospital bed count or annual scan
volume, for MRI at minimum and ideally CT/Cath Lab/Dialysis/Ultrasound too; separately,
verify AIIMS's actual bed count at the specific institution S53 studied. Not
commissioned yet — Jay's call on timing.

### 19.5 Fourth research pass (2026-07-11) — findings and resolution

The research above was commissioned the same day (§19.4) and returned findings the
same day. Full write-up was delivered as `mri-maintenance-contract-scaling-findings.md`
(extracted into this document, then removed per this project's convention of not
keeping a second copy of a research artifact once its findings are captured here).

**What the evidence establishes:**

1. **S53's study hospital is not confirmed to be AIIMS.** The paper describes an
   unnamed "tertiary care teaching hospital"; its authors were affiliated with AIIMS
   New Delhi, but author affiliation is not proof the studied scanner was installed
   there. §18.4 above has been corrected accordingly — this document must not describe
   S53 as an AIIMS case study.
2. **AIIMS New Delhi's own bed count is now sourced (S58: 1,147 Main Hospital + 412
   Cardiothoracic/Neurosciences Centre = 1,559 across those two named facilities,
   High confidence) — but it's context, not evidence about S53's actual study site**,
   since that site was never confirmed to be AIIMS New Delhi at all. The ~2,000+ figure
   §19.1 used is retired; it was never sourced and should not be cited going forward.
3. **No Indian MRI bed-count or scan-volume price schedule was found** (S59 is a
   vendor's model-based coverage-type recommendation, not a volume-based price
   schedule; Low confidence, promotional material). **No bed-count or scan-volume
   maintenance-cost multiplier is supported by any source located.**
4. **CT and Dialysis provide limited, non-MRI evidence that fleet size/negotiation can
   matter** (S60: a CCI order showing multi-machine CT AMC/CMC terms were discounted
   for an expected fleet purchase, Medium confidence, doesn't quantify a clean
   discount or establish a bed-count effect; S61: a bundled 7-machine dialysis CMC
   tender, Medium confidence for bundling, no price published). Neither transfers to
   MRI or establishes a usable pricing rule.
5. **No usable scale-linked pricing evidence exists for Cath Lab or Ultrasound.**

**Product decision (resolves ISS-12):**

1. **Do not build bed-count-tiered AMC/CMC defaults.** The `_bedVolumeTierHypothesis`
   scaffold in `equipment-data/mri.json` is removed — the proposed lookup curve is
   unsupported by evidence and must not be populated.
2. **Keep the actual vendor quote as the primary maintenance input**, not a benchmark
   default — this was already this tool's stated preference (§3.2's source hierarchy)
   and remains so.
3. **Keep the two MRI figures (3-10% tender ceiling, 0.224-0.285% single unnamed
   hospital's observed cost) separate**, as §18.4 already does — never averaged, never
   silently picked as the sole default.
4. **Captured for later, not built now (Phase 4/5 territory, still paused):** a set of
   quote-context fields an Advanced Mode maintenance section could collect without
   applying any automatic discount — hospital bed count (already collected), expected
   scans/procedures per year, number of same-OEM machines under one contract,
   equipment model and age, warranty status, uptime SLA, and coverage of coils/helium/
   tube/detector/other major parts. These would help a user document and sanity-check
   their own vendor quote, not compute a tiered default. Whoever resumes Phase 4/5
   should treat this as a candidate addition to SPEC.md §11's maintenance group (E),
   not as a new open research gap.
5. **Scan volume may inform a coverage-type warning** (e.g. "high utilization makes
   CMC's parts coverage more valuable than AMC's labour-only coverage" — S59's own
   framing), but the evidence does not support letting volume move the quoted price up
   or down.
6. **Reopen tiering only when stronger evidence appears:** an OEM rate card, an awarded
   contract with comparable single- and multi-unit prices, or several matched hospital
   contracts (same model, age, scope, utilization) showing a consistent scale effect.

**Resolution of the original hypothesis:** the scale-negotiation theory is plausible
but not verified. Other explanations for S53's unusually low observed CMC remain
viable — government procurement terms, a legacy contract, limited coverage scope,
scanner-specific factors, exceptional negotiation, or a source-data/unit issue. This
tool should model the resulting uncertainty (§18.4's "keep both figures separate, flag
the discrepancy" approach) rather than convert an unverified theory into a product
default.

---

## 20. Fifth research pass (2026-07-12) — target IRR/hurdle rate and standalone CT utilization, live web search

Jay asked whether ISS-9's last two genuinely-unavailable fields (target IRR/hurdle
rate, §17.2; standalone CT utilization, §18.7) could now be resolved using Claude
Code's own `WebSearch`/`WebFetch` tools, rather than another externally-run ChatGPT
Deep Research pass. **Result: neither is resolved. Both remain `Unavailable`, now
after five research passes total, four of them targeted specifically at gaps
including these two.** Documented in full below because the pass surfaced a real
process finding, not just a null result.

### 20.1 A live-search-specific risk: the search tool's own summarization hallucinated twice

Two claims surfaced by `WebSearch`'s built-in result summary, on direct verification
against the actual source page via `WebFetch`, **did not exist in the cited source at
all**:

1. A synthesized claim that a Substack article (`abhaysahukar.substack.com`) stated a
   "14-18% IRR" benchmark for Indian hospital capex. Fetching the article directly
   found no such figure anywhere in it — its only IRR-adjacent content is an
   unsourced illustrative 12% WACC used in an unrelated worked example, and ROCE
   figures for listed hospital chains (a different metric).
2. A synthesized claim that an Indian CT-utilization study reported "5-15 scans/day,
   8/day average" for the private sector. Fetching the actual article
   (`ijop.net`/DOI `10.37506/mlu.v21i2.2861`) directly found no such figure — the
   paper's only India-relevant data point is CT scans **per million population** by
   World Bank income group (14.7 High-Income / 7.3 Upper-Middle / 3.7 Lower-Middle),
   an epidemiological rate, not a per-scanner daily-throughput figure, and not
   equivalent to what `equipment-data/ct.json`'s `typicalUtilization` field needs.

Neither fabricated figure was used anywhere in this project — both were caught by this
pass's own verification step, per this document's standing rule (§3, `ISSUES.md`
ISS-9) to check a claim against its actual cited source before recording it. Recorded
here as a **process finding for future live-search-based research passes on this
project**: treat a search tool's synthesized answer as a lead to verify via direct
fetch, never as the citation itself — the failure mode is the same one this whole
document exists to prevent, just introduced by tooling instead of an unsupervised
agent session this time.

### 20.2 Target IRR / hurdle rate — sources checked, none qualify

| Source checked | Type/tier | Why it doesn't qualify |
|---|---|---|
| S62: ICRA, "Indian Hospital Sector" sector report (2019) | Credit-rating-agency industry report (§3.1 tier 7) | Read in full (9 pages). Covers occupancy, ARPOB, EBITDA margin, and debt-protection ratios (interest coverage, net debt/EBITDA) for listed hospital chains — real, relevant financial context, but **contains no IRR or hurdle-rate figure anywhere.** |
| S63: `abhaysahukar.substack.com` hospital-sector analysis | Independent analyst newsletter (§3.1 tier 9, weak supporting context only) | The "14-18% IRR" figure attributed to it by search summarization does not appear in the actual article — see §20.1. Contains only an unsourced illustrative 12% WACC and listed-company ROCE figures, neither a hurdle-rate benchmark. |
| S64: Dept. of Economic Affairs, "Guide for Practitioners for PPP in Diagnostic Centre" (`pppinindia.gov.in`) | Indian government PPP-guidance document (§3.1 tier 1) | Read in full (32 pages) via direct text extraction. This is a **procedural/template guide** for structuring diagnostic-center PPP concession agreements (what a DPR's financial section *should contain*, e.g. "the IRR" as a line item to fill in) — it does not itself state a target IRR or hurdle-rate number anywhere. |
| financialmodelslab.com "7 KPIs for Diagnostic Imaging Centers" (18% IRR claim) | Financial-model-template SaaS content-marketing blog (§3.1 tier 9) | Not fetched/cited — this is exactly the "unsourced blog claims" category §3.1 explicitly says not to use as a benchmark value. Noted here only so a future pass doesn't re-surface it as if new. |

**Conclusion, unchanged from §17.2:** no credible source discloses a target IRR or
hurdle rate used by Indian hospitals/healthcare investors for equipment-capex
approval, after five research passes across two different research methods (ChatGPT
Deep Research, live `WebSearch`/`WebFetch`). `recommended_use`: `user_input_required`,
confidence **Unavailable**, unchanged. §17.2's suggested heuristic (target IRR =
discount rate + 300-500bps risk premium, offered as a labeled starting-point
suggestion, not a researched number) still stands as the only usable UI guidance.

### 20.3 Standalone (non-PET) CT utilization — sources checked, none qualify

| Source checked | Type/tier | Why it doesn't qualify |
|---|---|---|
| S65: "Study of utilisation of CT scan machine at a tertiary care teaching hospital," *Clinical Medicine Insights* Vol 4 No 4 (2023), SKIMS | Peer-reviewed article, single Indian hospital (§3.1 tier 7) | Reports a **60% "utilization coefficient"** for the studied CT machine — a percentage-of-capacity metric, not scans/day, and not directly convertible to one without the paper's own capacity-denominator assumption (not obtained). Different metric type from what `ct.json` already carries (S26's ~15 scans/scanner/day PET/CT proxy), so it can't replace or strengthen that figure, only sit alongside it as a differently-shaped data point. Single-hospital, Kashmir tertiary teaching hospital — not obviously generalizable to a private standalone CT setup either. |
| S66: "Utilization Review of Imaging Equipment: An insight into CT Scanning," *Medico-Legal Update* Vol 21 No 2 (2021) | Literature-review article (§3.1 tier 7) | Its only India-relevant figure is CT scans **per million population** by income group (see §20.1) — an epidemiological/demand-side metric, not a per-scanner throughput figure. Wrong metric type; does not help. |
| S1 (already in this document's register — CCI/Deloitte market study) | Government market study (§3.1 tier 1) | Re-checked specifically for utilization content this pass (full-text search of the downloaded PDF for "utili[sz]ation"): **zero matches.** S1 covers equipment cost, refurbished-market discount, warranty, and CMC pricing context — confirmed it has never covered utilization, so no re-reading is needed on future passes either. |
| CT market-research reports (Mordor Intelligence, IMARC, etc.) | Paid market-research firm reports (§3.1 tier 7, but only free previews accessible) | Public preview content covers installed-base density (80-100 CT scanners/million population in India vs. 300-400/million in high-income countries) and qualitative utilization *constraints* (radiologist shortage limiting after-hours coverage, service-technician scarcity outside metros) — real context, but no numeric scans/day figure in the free preview. Full reports are paywalled; not purchased for a single benchmark field. |

**Conclusion, unchanged from §18.7:** standalone CT utilization remains a genuine open
gap after five research passes. `equipment-data/ct.json`'s existing figure (derived
from S26's AIIMS PET/CT throughput proxy, Low-Medium confidence, already flagged as
imperfect) is unchanged — nothing found this pass is a stronger source than what's
already there.

### 20.4 Source register additions (S62-S66)

| Source ID | Source name | Type | URL | What it covers | Confidence |
|---|---|---|---|---|---|
| S62 | ICRA, "Indian Hospital Sector: Despite the regulatory headwinds, outlook on the sector remains stable" (2019) | Credit-rating-agency industry report | https://www.icra.in/Rating/DownloadResearchSummaryReport/2397 | Sector-level occupancy/ARPOB/EBITDA/debt-coverage trends for listed hospital chains; no IRR/hurdle-rate figure | Medium (real, relevant financial data; doesn't answer the target-IRR question it was checked against) |
| S63 | Abhay Sahukar, "Understanding the Hospital Sector (Part 8)" | Independent analyst newsletter (Substack) | https://abhaysahukar.substack.com/p/understanding-the-hospital-sector-c88 | An illustrative, unsourced 12% WACC in a worked example, and listed-company ROCE figures; **not** the "14-18% IRR" figure a search-tool summary incorrectly attributed to it — see §20.1 | Low (independent commentary, illustrative figure explicitly not sourced by the author) |
| S64 | Dept. of Economic Affairs, "Guide for Practitioners for PPP in Diagnostic Centre" | Indian government PPP-guidance document | https://www.pppinindia.gov.in/report/Guide%20for%20Practitioners%20for%20Diagnostic%20Centre.pdf_1685171743.pdf | Procedural guidance for structuring diagnostic-center PPP concession agreements; names "the IRR" as a DPR line item without stating one | Medium (genuine government source; contains no numeric benchmark) |
| S65 | "Study of utilisation of CT scan machine at a tertiary care teaching hospital", *Clinical Medicine Insights* Vol 4 No 4 (2023), SKIMS | Peer-reviewed article, single hospital | https://medicineinsights.info/index.php/cmi/article/view/76 | 60% CT "utilization coefficient" at one Kashmir tertiary teaching hospital — a capacity-percentage metric, not scans/day | Low-Medium (single hospital, different metric type than needed) |
| S66 | "Utilization Review of Imaging Equipment: An insight into CT Scanning", *Medico-Legal Update* Vol 21 No 2 (2021) | Literature-review article | https://ijop.net/index.php/mlu/article/view/2861 (DOI 10.37506/mlu.v21i2.2861) | CT scans per million population by World Bank income group (14.7 HI / 7.3 UMI / 3.7 LMI) — epidemiological demand-side rate, not per-scanner throughput | Low (wrong metric type for the utilization field this project needs) |

### 20.5 Process note for future passes

Both gaps have now had a dedicated, methodologically different fourth/fifth attempt
each (external Deep Research, then direct live search) return the same negative
result. Per this document's own §3.3 guidance ("Unavailable = no responsible value
found"), further passes on these exact two fields should wait for a **qualitatively
different lead** (e.g. a leaked/published lender credit memorandum, a hospital
finance-committee policy document, or a dedicated India CT-utilization field study —
not another general web search using the same query shapes already tried across two
passes now).
