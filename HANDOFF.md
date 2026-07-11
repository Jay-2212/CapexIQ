# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-11)*

**Where things stand today:** Phase 1 (equipment data) is effectively complete —
**ISS-12 resolved 2026-07-11** (see below), no open Phase 1 human calls remain.
**Phase 2 (formula engine) is fully implemented:**
Group A (`depreciation`/`emi`/`revenue`/`breakEven`/`npv`/`irr`, merged earlier) plus
Group B (`realization`/`dso`/`workingCapital`), Group C
(`roi`/`maintenance`/`launchDelay`/`sensitivity`), and the Investment Outlook
score/EAC/discounted-payback/actionable-insight quartet from `financial-model-spec.md`
were implemented by Codex, reviewed by Claude, and committed 2026-07-11. **Phase 3
(content/copy) is now also fully complete** — all 7 files written (`disclaimer.md`,
`glossary.md`, `benchmark-notes.md`, `field-explanations.md`, `methodology.md`,
`formula-appendix.md`, `tooltip-copy.md`), including `tooltip-copy.md` (previously
blocked on Phase 4's tooltip-structure decision, which turned out to already be
resolved — see the Change Log entry below for the reasoning and the two follow-ups it
flags for whoever wires up Phase 4/5). `npm test` passes 65 tests across 17 files;
`npm run build` and `npx tsc --noEmit` are clean.

**Phase 4 (design/UX) is now resolved, 2026-07-11** — Jay lifted the 2026-07-07 pause
himself and drove the design discussion directly. `design/ux-product-spec.md` (the
Phase 4 deliverable SPEC.md §38 named since 2026-07-07) is written: resolves Phase
4-A–H, corrects a real hover-vs-click tooltip contradiction between SPEC.md §23.4 and
the original Phase 4-E draft, adds a "Signal" theme (promotes the existing
`--status-neutral` slate-blue to double as the primary interactive/button/link/CTA
color — `tokens.css`/`colors.md` updated), a type scale and 4px spacing scale (also
added to `tokens.css`), landing-page structure and entry flow (resolves SPEC.md §36.1
Q9 and Q14, supersedes §26.1's CTA wording — final CTA is "Start Assessment"), a
default-value visual treatment (muted + "Typical" tag until edited), and
micro-interaction principles. **One Phase 4 piece is still genuinely open, flagged
explicitly rather than falsely closed:** `content/inputs-metadata.json`'s per-field
validation contract (min/max/decimalPlaces/errorMessage per field) — deferred to run
alongside Phase 5's `wizard-state.md`, which needs the same field-by-field pass.
Phase 5 is next.

**ISS-12 resolved 2026-07-11 (a fourth research pass, same day as the reframe below):**
the bed/volume-tiering theory for MRI's CMC contradiction was tested directly and is
**not verified** — no Indian MRI tender, OEM schedule, or case study varying CMC/AMC
price by bed count or scan volume exists anywhere. Also corrected: the study's hospital
was never actually confirmed to be AIIMS (only the paper's authors were AIIMS-
affiliated) — `data-requirements.md` §18.4/§19.5 and `equipment-data/mri.json` no
longer describe it as an AIIMS case study. No bed-count-tiered CMC/AMC defaults will be
built; the `_bedVolumeTierHypothesis` scaffold is removed. See `ISSUES.md` ISS-12 for
the full resolution and reopen conditions.

**ISS-13 resolved 2026-07-11:** the dead `typicalUtilization.workingDaysPerMonth`/
`financingNorms` fields (null in every equipment file, duplicating
`common-assumptions.json`) are removed from all five equipment files. Single source of
truth for working days/month is `common-assumptions.json.workingDaysPerMonth` (flat 25,
a generic calendar convention, not a calendar-accurate 26/28/26 month-by-month figure).

**ISS-12 reframed, still open:** Jay's theory is that the MRI CMC "contradiction"
(generic 3-10% tender ceiling vs. one AIIMS hospital's ~0.25%/yr observed cost) is
really a volume/bed-count effect, not two competing estimates — a very high-volume
referral institute like AIIMS would negotiate a materially better rate than a smaller
private hospital paying near the tender ceiling. Proposal: bed-count-tiered CMC/AMC
defaults, reusing `data-requirements.md` §2.3's existing bed-size buckets (likely
splitting the open-ended `>500` bucket further). Written up in a new
`data-requirements.md` §19 and scaffolded (not populated with numbers) in
`equipment-data/mri.json`. Not resolved — needs (a) independent verification of AIIMS's
actual bed count, which isn't sourced anywhere in this project yet, and (b) a targeted
research pass breaking CMC/AMC out by bed-count/volume tier. Also resolved SPEC.md
§36.1 Q6 on this basis: hospital bed size is now a **required** Basic Mode input (it's
the lookup key), not optional context.

**New product idea captured, not built:** Jay floated an onboarding-flow concept —
land on a hero page with a "Start Assessment" CTA, which opens a dedicated pre-step
(equipment type + bed count, with imagery) before the full wizard, rather than landing
directly on the wizard/dashboard. Logged as SPEC.md §36.1 Q14 and flagged inside
`agent-build-plan.md` Phase 5's intro so it isn't designed against a stale
direct-to-dashboard assumption. **Not started** — still UI/UX work, still paused per
Jay's own call; this is intent-capture only.

---

Full history of how we got here lives in the Change Log below (most recent first) —
not duplicated here per this doc's own "overwrite, don't append" rule for this section.

---

## End-of-session checklist

Before you finish a session, do this:

- [ ] Overwrite the **Current State** block above — don't leave it describing an old session.
- [ ] Add a new entry at the **top** of the Change Log below (most recent first).
- [ ] If you made a new folder, confirm it has a README.txt/sources.txt.
- [ ] If the log below is approaching ~150 lines, archive it (see rule below).

---

## Archive rule

Once the Change Log below exceeds roughly 150 lines, move everything except the most
recent 2-3 entries into `handoff-archive/YYYY-Q#.md` (e.g. `handoff-archive/2026-Q3.md`),
and leave a one-line pointer in its place: `See handoff-archive/2026-Q3.md for entries
before <date>.` This keeps HANDOFF.md fast to read no matter how old the project gets.

---

## Change Log

*(most recent first)*

### 2026-07-11 — Phase 4 (design/UX) resolved: design/ux-product-spec.md written, "Signal" theme picked, tooltip contradiction fixed
**What changed:** Jay lifted the 2026-07-07 UI/UX pause himself, mid-conversation,
by dropping a long-form set of UX/UI thoughts (landing page, onboarding wizard,
default-value handling, basic/advanced mode, sliders, visual tone). Rather than build
anything immediately, did a full cohesion check first — read `HANDOFF.md`/`ISSUES.md`/
`agent-build-plan.md`/`SPEC.md`/`design/colors.md`/`tokens.css` end to end — before
drafting anything, per this project's own "plan before build" and doc-cohesion
discipline. Then wrote `design/ux-product-spec.md`, the Phase 4 deliverable SPEC.md
§38 has named since 2026-07-07.
1. **Found and fixed one real cross-doc contradiction:** SPEC.md §23.4 explicitly
   rejects hover-based tooltips ("poor touch-screen and mobile support") and mandates
   click-to-open only; `agent-build-plan.md`'s original Phase 4-E draft (written one
   day later, in the 2026-07-07 gap-analysis pass) said the opposite — hover-to-open
   on desktop. Resolved in Jay's favor of the original SPEC.md reasoning: click-to-open
   everywhere, no hover trigger on any device. `agent-build-plan.md` Phase 4-E
   corrected in place.
2. **New wizard-specific tooltip mechanism** (refines, doesn't contradict, Phase 4-E):
   while entering data, fields show 2 lines of always-visible lighter text (definition
   + higher/lower-is-better direction) with no click needed, plus a small optional
   "more info" inline expansion (not a popover) for the remaining 5 content slots.
   Outside the wizard, the existing click-to-open popover (SPEC.md §25.5's exact
   280/320px spec) is unchanged.
3. **"Signal" theme picked** (of 3 options presented): the existing
   `--status-neutral` slate-blue (`#3E5C76`) is promoted to also be the primary
   interactive color (buttons/links/CTA/active slider fill), given its own token name
   `--accent-interactive` so it doesn't couple button color to status semantics.
   `--accent-navy` narrows to header/logo/dark-surface use only — no longer the
   primary button/slider-thumb color (SPEC.md §25.5 updated accordingly). Zero new
   hues introduced — the full palette stays traceable to the original 2026-07-05
   hand-built system, deliberately avoiding an AI-generated-website look.
4. **Type scale (12/14/16/18/20/24/32/40px) and 4px-base spacing scale**
   (4/8/12/16/24/32/48/64) added to `design/tokens.css`, resolving Phase 4-A/4-B,
   which had been open since the design system was first built.
5. **Landing page and entry flow finalized**, resolving SPEC.md §36.1 Q9 (yes, a
   separate Methodology page — content already fully written in
   `report-templates/methodology.md`/`formula-appendix.md`) and Q14 (hero → "Start
   Assessment" CTA → equipment + bed-count pre-step → wizard proper). This also
   resolves §26.1's three competing CTA phrasings ("Start Evaluation" in the original
   spec, "Start Assessment" logged 2026-07-11 earlier the same day, "Start Analysis"
   floated in the same conversation as this entry) in favor of "Start Assessment" —
   Jay's own reasoning: the tool assesses viability, it doesn't perform open-ended
   analysis. Explicitly rejected: any "nothing like this in the market" marketing
   language — the landing page states capability, doesn't sell.
6. **Default-value visual treatment** (new): pre-filled wizard fields show the default
   in muted `--text-secondary` styling with a small "Typical" tag until the user edits
   the field, then flip to normal styling — reuses existing tokens, no new colors.
7. **Explicitly flagged as still open, not falsely closed:**
   `content/inputs-metadata.json`'s per-field validation contract (min/max/
   decimalPlaces/errorMessage per field) — deferred to Phase 5, which needs the same
   field-by-field pass for `wizard-state.md` anyway. `agent-build-plan.md` Phase 4's
   Definition of Done updated to show this checkbox still unchecked rather than
   claiming Phase 4 is 100% done.
**Files touched:** `design/ux-product-spec.md` (new), `design/tokens.css`,
`design/colors.md`, `SPEC.md` (§25.5, §23.4, §26.1, §36.1 Q9/Q14), `agent-build-plan.md`
(Phase 4-E correction, Phase 4 DoD, Phase 5 entry-point note, "Not yet in this plan"
section), `HANDOFF.md` (this entry + Current State). No `/app`, `/formulas`,
`/equipment-data`, or `/content` files touched — planning/design-token only, consistent
with "not building yet, finishing UX/UI planning first" per Jay's explicit instruction
this session.
**What's next:** Phase 5 (`wizard-state.md`) — the transition table for the 7-step
wizard, designed against the now-finalized entry flow, plus the deferred
`inputs-metadata.json` per-field contract. Actual UI implementation (Phase 6 onward)
was explicitly deferred by Jay to a future session, not this one.

### 2026-07-11 — ISS-12 resolved: MRI CMC bed/volume-tiering hypothesis tested, not verified
**What changed:** Jay commissioned a fourth, narrowly-scoped research pass (via Codex)
against the bed/volume-tiering hypothesis captured in `data-requirements.md` §19 (see
the "ISS-12 reframed" entry below). Findings, in full: `data-requirements.md` §19.5.
1. **The MRI life-cycle-costing study (S53) never names its hospital.** Its authors
   were affiliated with AIIMS New Delhi, but author affiliation isn't proof of which
   institution owned the studied scanner. Every place this project described it as an
   "AIIMS case study" was a real, if understandable, overreach — corrected in
   `data-requirements.md` §18.4/§19.5 and `equipment-data/mri.json`'s two CMC notes,
   which now say "unnamed tertiary-care teaching hospital."
2. **AIIMS New Delhi's own bed count is now sourced** (S58: 1,559 across two named
   facilities, High confidence) — but since the study site was never confirmed to be
   AIIMS New Delhi, this is context, not evidence. The ~2,000+ bed figure §19.1
   originally used was retired — it was never sourced.
3. **No Indian MRI bed-count or scan-volume maintenance-pricing schedule exists** in
   any source found (one vendor page recommends AMC vs. CMC by scan volume, but prices
   by model, not volume — S59, Low confidence). CT and Dialysis show limited evidence
   that fleet size/negotiation can matter in principle (a CCI order, S60; a bundled
   tender, S61) but neither quantifies a usable discount or transfers to MRI.
4. **Decision: no bed-count-tiered CMC/AMC defaults will be built.** The
   `_bedVolumeTierHypothesis` scaffold in `equipment-data/mri.json` is removed. The two
   MRI figures (3-10% tender ceiling, 0.224-0.285% one hospital's observed cost) stay
   recorded separately, as they already were — never averaged, never silently defaulted.
5. **SPEC.md §36.1 Q6's resolution corrected:** bed size stays a required Basic Mode
   input, but the reasoning is now utilization/tariff benchmarking (§23.3) and
   maintenance-quote context, not a CMC/AMC tiering lookup key.
6. **A set of maintenance quote-context fields was captured for later** (annual scan
   volume, same-OEM fleet size, equipment model/age, warranty status, uptime SLA, parts
   coverage) — logged in `data-requirements.md` §19.5 point 4 as a candidate Advanced
   Mode addition for whoever resumes Phase 4/5, not built now (still paused).
**Files touched:** `data-requirements.md` (§18.4 corrected, new §19.5, source register
S58-S61), `equipment-data/mri.json` (`_bedVolumeTierHypothesis` removed, AIIMS
mislabeling corrected in two notes), `ISSUES.md` (ISS-12 moved to Resolved), `SPEC.md`
(§36.1 Q6 reasoning corrected), `HANDOFF.md`. The source research write-up
(`mri-maintenance-contract-scaling-findings.md`) was removed from the repo root after
its findings were folded into `data-requirements.md`, per this project's standing
practice of not keeping a second copy of an already-extracted research artifact.
`npm test` 65/65, `npm run build` and `npx tsc --noEmit` clean — re-verified after
these changes even though they're data/docs-only, per this project's own verification
discipline.
**What's next:** Phase 1, Phase 2, and Phase 3 are all now complete. The only open item
left from this cluster of work is Phase 4 (design/UX), still deliberately paused —
Phase 5 (`wizard-state.md`) is next once Jay reopens it.

### 2026-07-11 — Phase 3 (content/copy) fully completed
**What changed:** Following the Phase 2 formula review and merge earlier the same day
(see the entry directly below), wrote the 3 remaining Phase 3 files, closing the phase
out completely.
1. **`report-templates/formula-appendix.md`** — the authoritative formula reference,
   one section per `/formulas` file, each formula transcribed exactly from the
   implementation (not just from SPEC.md §31's earlier conceptual list, which predates
   several implementation details like the IRR-undefined fallback and the zero-rate
   EAC edge case).
2. **`report-templates/methodology.md`** — a plain-language walkthrough of the full
   calculation waterfall (usage → billed revenue → realized revenue → cash received →
   costs → surplus → cash flow after EMI → payback/ROI/NPV/IRR → break-even → EAC →
   Investment Outlook score → sensitivity/actionable-insight), for SPEC.md §22's "show
   calculation background" audience, with one continuous illustrative worked example
   threaded through every section.
3. **`content/tooltip-copy.md`** — previously flagged as blocked on Phase 4 (tooltip
   content structure). On inspection, that structure was already resolved: the 7-slot
   format (definition, direction, default/typical value, confidence, source note,
   how-to-estimate, why-it-matters) is fully specified in `agent-build-plan.md`'s own
   Phase 3 task description, left over from the 2026-07-07 gap-analysis pass. Wrote the
   full popover copy for every Basic Mode field and every Advanced Mode group (A-F),
   keyed by readable field name rather than a final machine ID (Phase 5's
   `wizard-state.md`, not yet written, will define those — re-keying is mechanical, not
   a content rewrite). Flagged one real follow-up for whoever wires up the popover
   component: `inputs-metadata.json` already carries an earlier, simpler 4-slot tooltip
   object for 10 fields that predates this structure and should be reconciled to this
   file, not kept as a second live format.
4. Also wrote the Advanced Mode preview banner copy (a smaller Phase 3 "Do" item with
   no prior home) into `content/field-explanations.md`'s Advanced Mode section,
   extending SPEC.md §10.4's original soft-note to name all six §11 field groups by
   label.
**Files touched:** `report-templates/formula-appendix.md`, `report-templates/
methodology.md`, `content/tooltip-copy.md`, `content/field-explanations.md` (banner
copy addition), `agent-build-plan.md` (Phase 3 checklist marked done),
`data-requirements.md`/`ISS-12` unaffected by this entry. `npm test` 65/65, `npx tsc
--noEmit` clean, `npm run build` clean — re-verified after these changes (content-only,
but re-ran the full suite per this project's own verification discipline).
**Also this session:** wrote a small, narrowly-scoped research prompt for ISS-12 (verify
AIIMS's actual bed count; find bed-count/volume-tiered CMC/AMC pricing data for MRI),
handed to Jay to run through ChatGPT Deep Research — not yet commissioned.
**What's next:** Phase 3 is done. Remaining open items: ISS-12 (pending the research
pass above), and Phase 4 (design/UX), still deliberately paused.

### 2026-07-11 — Completed Phase 2 formula engine Groups B/C/D; 4 Phase 3 content files written; PR #7 merged
**What changed:** Three threads from the same day landed together this session.
1. **Phase 2 finished:** Codex implemented all seven remaining stubs in `/formulas`
   (Group B: `realization`/`dso`/`workingCapital`; Group C:
   `roi`/`maintenance`/`launchDelay`/`sensitivity`) plus the four modules required by
   `financial-model-spec.md` (`investmentOutlookScore.ts`, `eac.ts`,
   `discountedPayback.ts`, `actionableInsight.ts`). Design choices: explicit scenario
   inputs instead of financial defaults; a separate CMC annual-cost parameter; payer
   shares modeled as percentages; DSO output extended through the final delayed
   collection; simple monthly pre-operative interest for launch delay; ROI returned as a
   percentage with non-payback as `Infinity`; signed working-capital gaps retained. One
   test file per formula (round-number, messy-number, edge coverage). Claude reviewed
   the implementation against `financial-model-spec.md`/`SPEC.md`/`CONVENTIONS.md`
   before committing, per this project's standing multi-agent workflow (Codex has no
   push access here). **Verification:** `npm test` passes 65 tests across 17 files;
   `npm run build` and `npx tsc --noEmit` both clean.
2. **4 of Phase 3's 7 content files written** (also pending from earlier the same
   session): `content/glossary.md`, `content/benchmark-notes.md`,
   `content/field-explanations.md`, `report-templates/disclaimer.md` — real content, no
   more placeholders. Remaining 3: `methodology.md`/`formula-appendix.md` were blocked
   on Phase 2 being final (now unblocked by this entry); `tooltip-copy.md` stays blocked
   on Phase 4 (paused).
3. **PR #7 merged** (ISS-13 resolved, ISS-12 reframed, onboarding-flow idea captured —
   see the entry directly below, already on `main` before this session's uncommitted
   work was rebased on top). This entry's formula/content work was reconciled against
   PR #7's `HANDOFF.md` rewrite by hand — no content dropped from either side.
**Files touched:** `formulas/*.ts` (7 modified + 4 new), `tests/formulas/*.test.ts` (11
new), `content/glossary.md`, `content/benchmark-notes.md`,
`content/field-explanations.md`, `report-templates/disclaimer.md`, `HANDOFF.md`.
**What's next:** `methodology.md` and `formula-appendix.md` can now be written against
the final, reviewed formula set. `tooltip-copy.md` and all Phase 4 work stay paused.
ISS-12 (MRI CMC bed/volume tiering) still needs a follow-up research pass plus AIIMS
bed-count verification before it resolves.

### 2026-07-11 — ISS-13 resolved (dead schema removed); ISS-12 reframed as bed/volume tiering; onboarding-flow idea captured
**What changed:** Full status review at Jay's request, then three concrete pieces of
follow-up work from that conversation.
1. **ISS-13 resolved:** `typicalUtilization.workingDaysPerMonth` and `financingNorms`
   (both `null` in every equipment file, confirmed dead — duplicates of
   `common-assumptions.json`) removed from all five `equipment-data/*.json` files.
   Single source of truth for working days/month is now unambiguous: flat 25/month, a
   modeling convention, not a calendar-accurate figure — flagged explicitly since Jay
   asked whether it should vary by month (26/28/26); it doesn't currently, this wasn't
   changed, just clarified.
2. **ISS-12 reframed, still open:** Jay's hypothesis is that the MRI CMC "contradiction"
   (§18.4 — generic 3-10% tender ceiling vs. one AIIMS hospital's ~0.25%/yr observed
   cost) is a volume/bed-count effect, not two competing estimates of the same thing.
   Wrote up a bed-count-tiered maintenance-contract design in new `data-requirements.md`
   §19 (reuses §2.3's existing bed-size buckets, proposes splitting the open `>500`
   bucket further) and scaffolded it (not populated with numbers, per this project's
   no-invented-benchmarks rule) in `equipment-data/mri.json`'s
   `cmcAnnualCostPercentage._bedVolumeTierHypothesis`. Needs a follow-up research pass
   plus independent verification of AIIMS's actual bed count before any number ships.
   Also resolved SPEC.md §36.1 Q6 on this basis: hospital bed size becomes a
   **required** Basic Mode input, not optional context.
3. **New onboarding-flow idea captured, not built:** Jay described a hero-page →
   "Start Assessment" CTA → dedicated equipment/bed-count pre-step, before the wizard
   proper (not a direct-to-dashboard landing). Logged as SPEC.md §36.1 Q14 and flagged
   in `agent-build-plan.md` Phase 5's intro so that phase doesn't get designed against a
   stale entry-point assumption. **Not started** — still Phase 4/UI territory, which
   stays paused per Jay's 2026-07-07 call; this is intent-capture only.
4. **Phase 2 remaining formulas handed to Codex:** Group B (`realization`/`dso`/
   `workingCapital`), Group C (`roi`/`maintenance`/`launchDelay`/`sensitivity`), and the
   Investment Outlook score/EAC/discounted-payback trio (`financial-model-spec.md`) are
   still stubs — a bounded implementation prompt was written and handed to Jay to run
   through Codex directly (Codex has no push access here, so Claude will review/test/
   push once Codex's output comes back, per this project's standing multi-agent
   workflow).
**Files touched:** `equipment-data/mri.json` (+ ct/cath-lab/dialysis/ultrasound.json for
the ISS-13 cleanup), `data-requirements.md` (new §19, §15 gap list), `SPEC.md` (§36.1
Q6/Q14), `agent-build-plan.md` (Phase 5 intro note), `ISSUES.md` (ISS-12 updated,
ISS-13 resolved), `HANDOFF.md`. `npm test` verified green (26 passing) after the JSON
edits.

### 2026-07-07 — Third research pass: filled warranty/salvage/installation%/AMC/CMC, resolved Cath Lab tariff
**What changed:** Following the false-claim cleanup earlier the same day, Jay commissioned
a third, narrowly-scoped research pass (ChatGPT Deep Research) using a prompt built
directly from this project's own source-quality/citation/confidence-level conventions
(see `data-requirements.md` §3/§4/§9), targeted at exactly the six gaps §15 flagged as
having zero coverage. Delivered as a 10-page PDF ("Healthcare Capex Benchmarking (third
pass).pdf"), reviewed, cross-checked, and propagated into the docs, then deleted per
Jay's instruction once fully extracted.
**Findings (full detail in `data-requirements.md` §18):**
1. **Warranty period** — filled for all 5 equipment types. Real tender-to-tender
   variation for CT/Cath Lab/Dialysis (not a data-quality issue); MRI backed by two
   independent government tenders (High confidence); Ultrasound rests on a single tender
   (Medium, not High, per this doc's own confidence rules).
2. **Salvage/residual value** — 5% of original cost, all equipment (Companies Act
   Schedule II). Citation corrected: the pass cited an Income Tax depreciation-rates page,
   which looks like a citation mismatch for a Schedule II claim; recorded as S8 (Schedule
   II itself, already used for `usefulLifeYears`) instead. Three independent-verification
   attempts (India Code's Schedule II file, MCA's PDF, a CA-focused secondary source) were
   inconclusive/blocked (PDF extraction issues, HTTP 403, HTTP 404) — the 5% figure is
   well-established in Indian corporate practice but wasn't independently re-confirmed
   against primary text this session. Confidence recorded as Medium-High, not High.
3. **Installation/ancillary cost %** — filled for all 5 (10-30% MRI, 10% CT, 20-30% Cath
   Lab, 5-10% Dialysis, 0-5% Ultrasound). Mostly tender-mandated bid-allocation floors or
   inferences, not measured actual spend — Medium/Low confidence throughout, not High.
4. **AMC/CMC** — the pass correctly identified these as distinct contract types (AMC:
   labour-only; CMC: parts-included) and a new `cmcAnnualCostPercentage` field was added
   to the schema alongside the existing `amcAnnualCostPercentage`/`cmcYears`. AMC figures
   (2-2.5%) are an **identical generic proxy across all 5 equipment types** (one SCTIMST
   tender clause), not equipment-specific — flagged clearly, not presented as 5 separate
   findings. CMC is mostly generic too, except Cath Lab (a real West Bengal tender's
   year-wise schedule, 6-6.7%, Medium-High) and MRI, which has an unresolved contradiction
   between the generic 3-10% tender ceiling and one real AIIMS life-cycle-costing study's
   observed ~0.25%/year — a ~25-30x gap. Both values recorded in `mri.json`, not silently
   picked; logged as new **ISS-12** for Jay's decision.
5. **Cath Lab tariff — the big one, previously completely empty through two prior
   passes:** ₹11,920-₹15,000 per diagnostic catheterization. CGHS (Oct 2025 rate list,
   procedure code CI017) and PM-JAY's Health Benefit Package converge closely.
   **Independently re-verified this session** — fetched `cghshospitals.com` directly (a
   different site than the pass's own citation) and got the identical figures. High
   confidence.
6. **Dialysis/Ultrasound launch delay** — filled, both Low confidence (informal/adjacent
   sources, not dedicated timeline studies).
7. **CT utilization** — a new source was found (IPHS district-hospital workload norms)
   but it's a *combined* X-ray+CT+ultrasound figure, not CT-specific — weaker than the
   existing PET/CT-derived proxy already in `ct.json`. No change made; recorded as
   corroborating context only, standalone CT utilization remains a genuine open gap.
**Also:** new **ISS-13** logged (workingDaysPerMonth/financingNorms per-equipment fields
may be dead schema, duplicating `common-assumptions.json` — neither research pass touched
this, worth a look next time Phase 1 is revisited).
**Files touched:** `data-requirements.md` (§15 updated, new §18), `ISSUES.md` (ISS-3
resolved, ISS-12/ISS-13 opened), `equipment-data/mri.json`, `equipment-data/ct.json`,
`equipment-data/cath-lab.json`, `equipment-data/dialysis.json`,
`equipment-data/ultrasound.json`, `HANDOFF.md`. Source PDF deleted after extraction per
Jay's instruction.

### 2026-07-07 — Fixed a false UX-resolved claim; resolved ISS-2; propagated usefulLifeYears; paused Phase 4
**What changed:** Jay asked to pause all Phase 4 (design/UX) work for now — he'll take
typography/spacing/chart-color/product-feel decisions on directly when he has time — and
to instead scrub any place the docs falsely claim UX work is done, fix `ISSUES.md` ISS-2
(Cloudflare/DNS, which Jay has now done himself — site confirmed live), and cross-check
`data-requirements.md` against the equipment-data files since it was recently updated
with real research.
1. **False claim fixed:** SPEC.md §36.3 item 1 said typography was "Resolved... see
   `design/ux-product-spec.md`" — that file was never written, so nothing was actually
   resolved. Corrected to **Open**, with a note on what's actually pending. Checked the
   rest of §36 and `DIRECTORY.md`/`agent-build-plan.md` for the same failure mode —
   everywhere else correctly says the file doesn't exist yet.
2. **ISS-2 resolved:** Cloudflare Pages + DNS confirmed done by Jay directly;
   `capexiq.jaybharti.me` is live. Moved to Resolved in `ISSUES.md`.
3. **Data cross-check:** read every `equipment-data/*.json` file against
   `data-requirements.md` §12.4/§14/§17. Found `usefulLifeYears` was `null` in all five
   real equipment files despite a real, High-confidence answer already sourced (Companies
   Act Schedule II, S8) — filled in (13yr MRI/CT/Ultrasound — S8 names these directly;
   15yr Cath Lab/Dialysis — S8's only other category, by elimination, noted as an
   inference not a separate citation). Found five fields
   (`salvageValuePercentage`/`installationAndAncillaryCostPercentage`/`warrantyYears`/
   `cmcYears`/`amcAnnualCostPercentage`) with zero research coverage in either pass that
   weren't even in `data-requirements.md` §15's gap list — added them there. Confirmed
   `billedTariffPerUse.typical: null` is correct as-is (low/high are NABH/non-NABH rate
   tiers, not a range to average) — not a gap. `ISSUES.md` ISS-3 rewritten (was stale).
**Files touched:** `SPEC.md`, `ISSUES.md`, `data-requirements.md`,
`equipment-data/mri.json`, `equipment-data/ct.json`, `equipment-data/ultrasound.json`,
`equipment-data/cath-lab.json`, `equipment-data/dialysis.json`, `HANDOFF.md`.

### 2026-07-07 — Wrote financial-model-spec.md; resolved ISS-10; added automatic actionable-insight design
**What changed:** Discussed and wrote `financial-model-spec.md` (SPEC.md §38's
named-but-never-produced v0.5 artifact) directly with Jay, resolving `ISSUES.md` ISS-10.
Defines: (1) the Investment Outlook 0–100 score as four independently-normalized
sub-scores — Return Strength 35% (IRR spread over discount rate, with an NPV-ratio
fallback when IRR is undefined), Speed to Payback 25% (discounted payback ÷ useful
life), Financing Resilience 20% (a DSCR-style ratio — answers SPEC.md §36.2's
long-open "should DSCR be part of the model" question, now annotated resolved),
Operational Margin of Safety 20% (usage cushion above break-even) — plus Strong
75–100/Moderate 55–74/Caution 35–54/Weak 0–34 bands, and a mechanical (not
hand-authored) explainability rule: whichever sub-score is lowest drives the §21.4 risk
callout; (2) standard EAC and discounted-payback formulas; (3) confirmation that
discount rate (12.5% typical, already researched into `common-assumptions.json`) and
target IRR (confirmed unresearchable, `discountRate + 300–500bps` heuristic) need no
further work — no external API dependency. Also designed, at Jay's request, a new
**automatic actionable-insight** feature: a background grid search over realistic
tariff increases (2/5/8/10/15% of current price) × realistic start years (Year 1/2/3,
capped at half the equipment's useful life), surfaced as a single "cheapest win"
suggestion only when it improves payback by **≥6 months** via a price increase **≤15%**
— silent otherwise, so it never nags with trivial suggestions. Confirmed this requires
no separate loading state: the underlying formulas are pure and cheap (26 existing
formula tests run in under a millisecond combined), so ~15 extra scenario evaluations
run silently inside the same live-recalculation pass Phase 4-G already does.
`agent-build-plan.md` Phase 2 updated to implement the score/EAC/payback trio against
this doc; Phase 9 gets a new "automatic actionable insights" sub-section. SPEC.md
§36.1 item 10 and §36.2 item 14 (new) annotated "Resolved," matching this project's
cross-reference discipline so SPEC.md and the build plan can't silently drift apart the
way ISS-7/ISS-9 already did once.
**Files touched:** `financial-model-spec.md` (new), `ISSUES.md` (ISS-10 resolved),
`agent-build-plan.md` (Phase 2, Phase 9, "Not yet in this plan" section),
`SPEC.md` (§36.1 item 10, §36.2 items 7/14 annotated), `DIRECTORY.md` (folder map +
"What's NOT here yet"), `HANDOFF.md` (this entry + Current State).
**What's next:** Phase 2's score/EAC/discounted-payback formulas and Phase 9's
automatic-insight feature can now be implemented directly against
`financial-model-spec.md` — no remaining design blocker. `ux-product-spec.md` (Phase 4)
is the one artifact SPEC.md §38 still names that doesn't exist yet.

### 2026-07-07 — Merged all three open PRs; resolved ISS-11
**What changed:** Merged the three outstanding draft PRs into `main`: #2 (Codex's Phase
2 Group A formulas — code-only, no conflicts), #1 (benchmark cleanup + 2nd research-pass
integration), and #3 (the build-plan gap-analysis pass), in that order. #1 and #3 had
both branched from the same pre-#1 `main` and both edited `DIRECTORY.md`, `HANDOFF.md`,
`ISSUES.md`, and `agent-build-plan.md`, so #3 was rebased onto post-#1 `main` and its
conflicts resolved by hand (both sides' content kept; nothing dropped) before merging.
Also resolved ISS-11, which #3 had left open: confirmed directly with Jay that "doctor's
cut" is the existing professional/reporting fee field, not a separate cost — the
referral/commission scenario for scans referred in from other hospitals is real in
Indian private healthcare but negligible at this tool's CAPEX scale, so no new field is
being added for it. ISS-10 (Investment Outlook scoring methodology) remains open,
pending Jay's input on the actual weighting/methodology for `financial-model-spec.md`.
**Files touched:** `HANDOFF.md` (this entry + Current State, conflict resolution),
`ISSUES.md` (ISS-11 resolved), `DIRECTORY.md`, `agent-build-plan.md` (conflict
resolution only, no content changes beyond merging both PRs' additions).
**What's next:** ISS-10 needs Jay's decision on the Investment Outlook scoring
methodology before `financial-model-spec.md` can be written and Phase 2's
score/EAC/discounted-payback formulas can be implemented.

### 2026-07-07 — Deep Research pass (2nd) integrated into data-requirements.md; equipment-data populated; PDF removed
**What changed:** Read the Deep Research agent's 9-page PDF ("CapexIQ Benchmark
Research", delivered by the user, sourced by a ChatGPT Deep Research agent per the
prompt this project prepared on 2026-07-06) and integrated its findings as the new
`data-requirements.md` §17 (with §12.2's source register extended to S22-S36, and §16's
priority list marked resolved/still-open per item). Findings: discount rate now has a
real proxy benchmark (11.1-14.1%, typical 12.5%, from listed Indian hospital-chain
WACC); MRI utilization (23 scans/day, real single-hospital study) and Dialysis
utilization (3 sessions/machine/day, official MoHFW design-capacity norm); CGHS
Oct-2025 reimbursement-ceiling tariffs for CT/MRI/Ultrasound (explicitly flagged as a
government-scheme floor, not a private cash tariff) and a separate CGHS dialysis tariff
document; MRI/CT/Cath-Lab launch-delay ranges; and a real per-machine dialysis
acquisition cost (₹11.5 lakh, 2022 government tender, meaningfully stronger than the
prior single-procurement estimate). Confirmed still-genuinely-unavailable (not
oversight): target IRR/hurdle rate, Cath Lab tariff (no data found at all in either
pass), Dialysis/Ultrasound launch delay, standalone (non-PET) CT utilization. Two
internal inconsistencies in the research output itself were caught and noted rather
than silently trusted: a "WACC range summary" row that didn't match the individual
data points it was drawn from, and several CGHS NABH-tariff table values that
contradicted the same document's own prose figures (prose used as ground truth).
Propagated all of this into `equipment-data/*.json` (mri/ct/cath-lab/dialysis/
ultrasound) and `common-assumptions.json` with confidence/sourceId intact, refreshed
`content/inputs-metadata.json`'s tooltip copy to match (still zero numbers there, by
design), updated `ISSUES.md` ISS-9's status, and deleted the source PDF from the repo
per the project's single-source-of-truth rule (its content is now fully captured in
`data-requirements.md`, not living alongside it as a second document).
**Files touched:** `data-requirements.md` (§12.2 extended, §16 updated, new §17),
`equipment-data/mri.json`, `equipment-data/ct.json`, `equipment-data/cath-lab.json`,
`equipment-data/dialysis.json`, `equipment-data/ultrasound.json`,
`equipment-data/common-assumptions.json`, `equipment-data/README.txt`,
`content/inputs-metadata.json`, `ISSUES.md`, `HANDOFF.md` (this entry + Current State).
Deleted: `CapexIQ Benchmark Research.pdf`.
**What's next:** apply data-requirements.md §14's original starter-table pass to the
remaining placeholder fields (purchaseCost/usefulLifeYears/salvage/installation/
warranty/cmc/amc) not touched by this second pass. Review and fold in Codex's Phase 2
Group A formula work sitting uncommitted in the main checkout.

### 2026-07-06 — Cleaned up invented benchmark numbers (ISS-9); streamlined build-plan Phase 4/6
**What changed:** Audited the prior session's `content/inputs-metadata.json` and found
several invented numbers, most seriously a false claim that a 12% discount rate / 15%
target IRR were sourced from `data-requirements.md` §12.3 (no such row exists there).
Also found `usagePerDay`/most `billedTariffPerUse` defaults had no source at all
(utilization is an explicit open gap per §15), a dialysis tariff default that
contradicted its own cited source's explicit caution against using it as a default, and
`loanInterestRate` presented as a clean default despite the source rating it
Low-Medium confidence / `sensitivity_range`. Fixed by: rewriting
`content/inputs-metadata.json` to hold only UI/control schema (no numbers); adding
`billedTariffPerUse` and `launchDelayMonths` fields (both null) to every
`equipment-data/<type>.json`; creating `equipment-data/common-assumptions.json` for
non-equipment-specific figures (discount rate, target IRR, loan terms, working
days/month), each with honest confidence/sourceId, with the fabricated ones now
`null`/`"Unavailable"`; correcting SPEC.md §18.2/§18.3/§23.4's false citation and
absolute claims. Separately, restructured `agent-build-plan.md` Phase 4 into
"Interactive state design" (Part A: wizard flow, Part B: slider-driven live
recalculation shared by the wizard and the dashboard's Advanced settings pane) since
Phase 6 had been inventing its own live-recalculation behavior outside the
transition-table discipline `CONVENTIONS.md` §1 requires. Logged the whole episode as
ISSUES.md ISS-9, including a process note (per user direction) that build-plan/spec
docs get one primary agent going forward, not parallel unsupervised editing.
**Files touched:** `content/inputs-metadata.json`, `equipment-data/*.json` (all 6),
`equipment-data/common-assumptions.json` (new), `equipment-data/README.txt`, `SPEC.md`,
`agent-build-plan.md`, `DIRECTORY.md`, `ISSUES.md` (ISS-9 added), `HANDOFF.md` (this
entry + Current State).
**What's next:** hand the prepared deep-research prompt to a research agent to fill the
now-null gaps (usage/day, tariff, discount rate, hurdle rate, launch delay); once real
values land, Phase 1 can complete. Phase 2 Group A formulas can start now, independent
of this.

### 2026-07-06 — Centralized inputs metadata added; UI/UX slider and tooltip specifications plan integrated
**What changed:** Created `content/inputs-metadata.json` as a single, cohesive input registry for the frontend and reports, mapping inputs to control types (sliders for operational inputs vs. input boxes for capital inputs), defaults sourced from `data-requirements.md` benchmarks (e.g., 12% discount rate, 15% target IRR, 11.5% loan rate, 13/15 years useful life), and custom tooltip content schemas. Updated `SPEC.md` §18, §23, and §25 to document click-to-open popover tooltip behavior (rejecting hover actions), slider/popover custom CSS dimensions/borders/shadows matching `tokens.css`, and dynamic recalculation settings. Updated `agent-build-plan.md` Phases 4, 5, and 6 to require integration of the inputs metadata registry, custom sliders, click tooltips, and real-time dashboard default parameter editability. Documented registry under `DIRECTORY.md`.
**Files touched:** `content/inputs-metadata.json` (new), `SPEC.md`, `agent-build-plan.md`, `DIRECTORY.md`, `HANDOFF.md` (this entry + Current State).
**What's next:** Phase 1 (real equipment data) and Phase 2 (real formulas) of the build plan.

### 2026-07-07 — agent-build-plan.md gap-analysis pass; Phase 4 added; no code changed
**What changed:** Per the project's "plan before build" discipline (deepen the phased
plan before implementation ramps up, to catch gaps at design time rather than debug them
after), ran a dedicated gap-analysis pass across SPEC.md, `agent-build-plan.md`,
`design/colors.md`/`tokens.css`, and every `content/`/`report-templates/` file, prompted
by a detailed list of build-time risk areas (dynamic slider-driven charts, tooltip
content structure, Basic/Advanced mode surfacing, chart color behavior, Excel formula
strategy, typography/spacing, input validation strictness, chart label contrast). Found
SPEC.md specifies fields exhaustively but leaves multiple *mechanisms* unresolved — item
1 and item 6 of its own §36.3 "Design questions" list were literally still open, and
input validation, typography/spacing tokens, chart accessibility, and the Excel
live-formula question had zero coverage anywhere in the repo (confirmed via full-text
search, not skimming). Inserted a new **Phase 4 — "Design system, interaction &
validation contract"** into `agent-build-plan.md` between Content (was/is Phase 3) and
Wizard state design (now Phase 5, was Phase 4) resolving all of the above with concrete
decisions or a named follow-up artifact; renumbered every phase from 4 onward (old 4→5,
5→6, 6→7, 7→8, 8→9, 9→10) and threaded cross-references (Phase 4-A through 4-H) through
Phases 2, 3, 5-9 wherever they now depend on a Phase 4 decision. Resolved two decisions
explicitly this session (asked the user directly rather than guessing, since both are
hard-to-reverse effort/positioning tradeoffs): Excel exports will contain live, embedded
formulas (not static values); Advanced Mode is an inline collapsible panel below Basic
Mode with a persistent "what's inside" preview banner (not a drawer/modal/tab). A third
question (whether "doctor's cut" is the same as the existing professional/reporting fee
field or a distinct referral-commission cost) didn't come back with a captured answer,
so it was logged as `ISSUES.md` ISS-11 and left unresolved rather than assumed either
way. Also logged `ISSUES.md` ISS-10: the Investment Outlook 0–100 score, EAC, and
discounted payback are named as required outputs (SPEC.md §21/§11.2) but have **no
formula anywhere in §31** — this blocks part of Phase 2 until `financial-model-spec.md`
(SPEC.md §38's named-but-never-written v0.5 artifact) defines the scoring methodology;
deliberately did not invent weights to fill this gap, since unlike a benchmark it needs
Jay's review, not a citation. Annotated SPEC.md §36.3 items 1/6 and the §29.5
export-philosophy line as "Resolved," each pointing back to the relevant
`agent-build-plan.md` Phase 4 sub-section, so the two docs can't silently disagree the
way ISS-7/ISS-9 already happened once for this project. Added a spacing-tokens/
per-field-validation-contract dependency line to `CONVENTIONS.md` §3's dependency
diagram, and a `data-requirements.md` §15 entry for the doctor's-cut research gap.
**Files touched:** `agent-build-plan.md` (rewritten, Phase 4 added, phases 4-9
renumbered to 4-10), `SPEC.md` (§36.3 items 1/6 and §29.5 annotated), `CONVENTIONS.md`
(§3 dependency diagram), `ISSUES.md` (ISS-10, ISS-11 added), `data-requirements.md`
(§15), `DIRECTORY.md` ("What's NOT here yet"), `HANDOFF.md` (this entry + Current
State). No `/app`, `/formulas`, `/equipment-data`, `/content`, or `/exports` files
touched — this was a planning-only pass.
**What's next:** Phase 1 and Phase 2 (minus the score/EAC/discounted-payback trio) can
start now, in parallel. Phase 4 should happen before Phase 5/6. ISS-10 and ISS-11 need
resolving before their respective downstream phases can fully close. (ISS-11 was
resolved the same day, see the entry above this one.)

### 2026-07-05 — Build verified; phased build plan + code conventions written
**What changed:** Installed Node.js/npm via Homebrew and verified the skeleton for
real: `npm install` then `npm run build` both succeed (Next.js 15.5.20, static export
to `out/`), resolving ISS-1. Added `.gitignore` entries for `next-env.d.ts` and
`*.tsbuildinfo` (standard Next.js generated files) and committed `package-lock.json`
for reproducibility. `npm install` surfaces 7 dev-only audit warnings (esbuild/postcss,
transitive through vite/vitest and next) — logged as ISS-8, not urgent, not a build
blocker. Wrote two new pillar docs: `agent-build-plan.md` (the "v0.6 — Agent Build
Spec" artifact SPEC.md §38 already called for — 9 phases from equipment data through
deploy/go-live QA, each with dependencies, parallelization notes, and a Definition of
Done) and `CONVENTIONS.md` (file/dependency/typing/testing rules, and — directly
addressing user-reported pain from a past project where a browser extension's session
timer shipped with broken stop/resume/tab-switch behavior — a hard rule that any
stateful UI flow gets its states and transitions written down and edge-case-tested
*before* implementation, not after). `agent-build-plan.md` Phase 4 applies this rule
concretely to this project's input wizard. Wired both new docs into `INTRODUCTION.md`'s
reading order and `DIRECTORY.md`'s folder map and quick-lookup table.
**Files touched:** `.gitignore`, `package-lock.json` (new), `ISSUES.md` (ISS-1 resolved,
ISS-2 updated with real repo URL + Cloudflare build settings note, ISS-8 added),
`agent-build-plan.md` (new), `CONVENTIONS.md` (new), `INTRODUCTION.md`, `DIRECTORY.md`,
`HANDOFF.md` (this entry + Current State).
**What's next:** Phase 1 (real equipment data) and Phase 2 (real formulas) per
`agent-build-plan.md` — both can start now, in parallel. Cloudflare Pages + DNS setup
(ISS-2) is being done directly by the project owner, not an agent, using build settings
given in chat (build command `npm run build`, output dir `out`, `NODE_VERSION` pinned).

### 2026-07-05 — Code skeleton built; ISSUES.md created; corrected "two repos" mixup
**What changed:** Built the skeletal Next.js + TypeScript structure per SPEC.md §32:
`/app` (root route, adjusted from the spec's original `/app/roi` nesting since the tool
now lives on its own subdomain rather than a path — noted directly in SPEC.md §32), 13
formula modules under `/formulas` (typed signatures only, each throws "not
implemented"), 6 equipment-data JSON placeholders (schema-shaped, null values, not real
numbers), placeholder `.md` files under `/report-templates` and `/content`, export
generator stubs under `/exports`, and empty test-folder scaffolds under `/tests`. Added
`package.json`/`tsconfig.json`/`next.config.ts`/`.gitignore`, plus a public-facing root
`README.md` (GitHub renders this; `INTRODUCTION.md` stays the agent/dev briefing).
Created `ISSUES.md` as a new top-level tracker (open/accepted/resolved problems) and
migrated `DIRECTORY.md`'s old "Known quirks" section into it rather than keeping two
copies. Also caught and corrected a mixup: a concurrent session's rebrand pass (see the
entry directly below) assumed the app code lived in a separate, unreachable GitHub repo
and left `ISSUES.md`/`HANDOFF.md` saying so — there is no second repo, it's this same
folder, and the skeleton was written using "CapexIQ" from the start with no old-name
strings to fix. Recorded as `ISSUES.md` ISS-7 (resolved) so the assumption doesn't
resurface. Also updated the remaining scattered old-name mentions this session found:
`data-requirements.md`, `equipment-images/sources.txt`, `design/colors.md` headers, plus
INTRODUCTION.md/DIRECTORY.md rename passes and SPEC.md's identity metadata, §1, §26.1,
§32, and §34 (marked "Decided: CapexIQ" with the historical brainstorm kept below it).
**Files touched:** `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`,
`README.md` (new), `app/**`, `formulas/**`, `equipment-data/**`, `report-templates/**`,
`content/**`, `exports/**`, `tests/**` (all new), `ISSUES.md` (new), `HANDOFF.md` (this
entry + Current State), `DIRECTORY.md`, `INTRODUCTION.md`, `SPEC.md`,
`data-requirements.md`, `equipment-images/sources.txt`, `design/colors.md`,
`design/tokens.css` (header comment only).
**What's next:** Also done in this session (after the skeleton above): `git init`,
initial commit, and `gh repo create Jay-2212/CapexIQ --public --push` — repo is now
live at `github.com/Jay-2212/CapexIQ`. Remaining, per `ISSUES.md`: verify the build with
a real Node environment, wire up Cloudflare Pages + DNS, populate real equipment data,
implement formulas, build the UI.

### 2026-07-05 — CapexIQ rebrand: identity layer actioned
**What changed:** Actioned `design/rebrand-brief.md` (product renamed Healthcare Capex
Decision Support Tool → **CapexIQ**, tagline "Know if it pays for itself, before you buy
it.", URL moved from `jaybharti.me/roi` to the subdomain `capexiq.jaybharti.me`).
Updated: `logo-lockup.svg` wordmark (was a two-line "Healthcare Capex / Decision
Support", now a single "CapexIQ"); `og-image.svg`/`.png` (small caps logo label,
headline swapped to the tagline, footer URL updated, PNG re-rendered); `site.webmanifest`
(`name`/`short_name` → "CapexIQ", `start_url`/`scope` → "/" since it's now a subdomain
root, not a path); `head-tags-snippet.html` (added a `<title>`, updated OG/Twitter
title/description/url/image); `dashboard-mockup.svg` (header title text only). Built
the brief's optional deliverable, `hero-lockup.svg` (icon + wordmark + tagline, for the
landing hero). **Deliberately did not change** the icon mark itself (pulse line →
ascending bars) — it already reads as "signal turning into a growth/analysis chart",
which fits "IQ" well enough, and changing it would have cascaded into re-exporting all
5 favicon sizes for a rename brief that explicitly said not to over-design. Flagging
this call per the brief's request. Also caught up this file and `DIRECTORY.md` /
`design/README.txt`, which still had stale old-name references from before this pass.
**Files touched:** `design/logo-lockup.svg`, `design/og-image.svg`, `design/og-image.png`,
`design/site.webmanifest`, `design/head-tags-snippet.html`, `design/dashboard-mockup.svg`,
`design/hero-lockup.svg` (new), `design/README.txt`, `DIRECTORY.md`, `HANDOFF.md` (this
entry). Colors, photography, icons, fonts, and `hero-background.svg` untouched, per the
brief.
**What's next:** The actual app code/repo (separate from this asset folder — see
`ISSUES.md` ISS-1/ISS-2) still carries the old name wherever it appears (page titles,
metadata, package.json, etc.) and needs the same rename pass applied once that repo is
reachable.

### 2026-07-05 — data-requirements.md: research brief + first pass
**What changed:** Built `data-requirements.md` per SPEC.md §24/§39 — defines what real
Indian healthcare-equipment data is needed (source quality rules, required output
format, acceptance criteria), then ran a first research pass against that brief:
findings with source IDs and confidence levels for MRI/CT/Cath Lab/Dialysis/Ultrasound
plus financing and depreciation norms, and a machine-readable starter assumptions table
meant to seed future equipment JSON files. Explicitly flags what's still genuinely
unresearched (payer-wise realization %, DSO by payer, specialist fees, actual vendor
quotes) rather than guessing at those numbers.
**Files touched:** `data-requirements.md` (new, at project root).
**What's next:** Build equipment data files (`mri.json`, etc.) from this file's §14
starter table; deepen research on the §15 open gaps if/when better sources surface.

### 2026-07-05 — Agent-documentation system built
**What changed:** Created the self-governing documentation system: this file
(HANDOFF.md), INTRODUCTION.md, DIRECTORY.md, and SPEC.md (the original spec, moved in
from Documents root with a new index prepended, content otherwise unchanged). Slimmed
AGENTS.md down to a thin pointer at INTRODUCTION.md — its old heavy content (directory
map, lookup tables, known quirks) moved into DIRECTORY.md so it isn't duplicated in two
places.
**Files touched:** `SPEC.md` (new), `INTRODUCTION.md` (new), `HANDOFF.md` (new),
`DIRECTORY.md` (new), `AGENTS.md` (rewritten/slimmed). Deleted
`/Users/jay/Documents/healthcare-capex-decision-support-v0.2.md` (moved into SPEC.md).
**What's next:** Build equipment data files (`mri.json`, etc.) from
`data-requirements.md` §14's starter table, then content/copy files and app scaffolding
per SPEC.md §32.

### 2026-07-05 — Background-removed persona cutouts
**What changed:** Generated transparent (background-removed) versions of all 4 persona
photos using rembg/U2Net, saved alongside the originals in a `transparent/` subfolder so
both versions are available.
**Files touched:** `people-personas/transparent/01–04-*-cutout.png`,
`people-personas/transparent/README.txt`.
**What's next:** CFO cutout (#03) has the office chair retained in her silhouette — flagged, not fixed. Manual touch-up needed if a fully isolated cutout is required.

### 2026-07-05 — Full design system + brand assets
**What changed:** Built the complete visual design system by hand (no stock/AI
generation): color palette + CSS tokens, a full decision-dashboard mockup, a favicon
mark + multi-size exports, a logo lockup, a hero background, an OG/social share image,
a PWA manifest, and a copy-paste `<head>` tags snippet.
**Files touched:** everything under `design/`.
**What's next:** none at the time — this was a complete deliverable for the design system.

### 2026-07-05 — Icon set and fonts sourced
**What changed:** Curated ~60 icons from the Lucide library (MIT/ISC, no attribution
required) into 5 purpose-based folders, and downloaded Inter / IBM Plex Sans / IBM Plex
Mono as self-hostable TTF files (weights 400/500/600/700).
**Files touched:** everything under `icons/`, everything under `fonts/`.
**What's next:** none at the time.

### 2026-07-05 — Equipment and persona stock photography sourced
**What changed:** Sourced and downloaded free, no-watermark, hi-res stock photos: 9
equipment/hero images and 4 persona photos, all from Pexels (free license, no
attribution required). Two equipment images are flagged as approximations (no exact
free stock photo exists for a real cath lab or for this actual product's dashboard).
**Files touched:** everything under `equipment-images/`, everything under
`people-personas/` (originals only, transparent cutouts came later).
**What's next:** background removal for persona photos (done in a later entry above).

---

*(No entries before this point — this is the first Change Log for this project.)*
