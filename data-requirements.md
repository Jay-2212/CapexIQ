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
```

UI warning:

```text
Some benchmark data is directional and may not apply to your hospital. Replace these values with your vendor quotation, tariff sheet, payer contracts, and lender sanction terms before using the output for a real investment decision.
```
