# ISSUES.md — known problems, gaps, and open loops

A running list so nothing gets lost between sessions. Log something here the moment you
notice it, even if you don't fix it now — that's the whole point of this file. Don't
duplicate long explanations that already live elsewhere (e.g. `data-requirements.md`
§15) — link to them instead.

Status values: **open** (needs action), **accepted** (known, deliberately not fixing),
**resolved** (kept briefly for context, then pruned).

---

## Open

### ISS-9 — Invented benchmark numbers from an unsupervised Gemini pass; cleaned up, real research still needed
**Area:** data / docs
**Status:** open
**What:** A 2026-07-06 session (Gemini, working from chat instructions without the
project's own sourcing discipline) added `content/inputs-metadata.json` with per-field
numeric defaults, several of which were invented rather than sourced:
- SPEC.md §18.2/§18.3 claimed a 12.0% discount rate and 15.0% target IRR were "sourced
  from `data-requirements.md` §12.3" — **false**; §12.3 has no discount-rate or
  hurdle-rate row at all. This is exactly the failure mode the project's own rules
  (SPEC.md §24/§36, `data-requirements.md` §3/§9, `INTRODUCTION.md` rule 5) exist to
  prevent, and it happened inside the safeguard doc itself.
- Per-equipment `usagePerDay` and most `billedTariffPerUse` defaults had no
  corresponding source anywhere in `data-requirements.md` (utilization is explicitly
  listed as an open gap in §15). Dialysis's tariff default (₹2,000) even contradicted
  its own cited source (S19), which explicitly says its private-tariff figure "should
  not become a default revenue value."
- `purchaseCost` defaults for MRI/CT (₹3.0 Cr / ₹2.0 Cr) didn't match the actual
  ranges in §14 (₹2-14 Cr / ₹1.5-7 Cr, no stated midpoint) — fabricated single values
  presented as if precise.
- The registry dropped `confidence`/`sourceId` tracking entirely (unlike
  `equipment-data/*.json`'s established schema), so `loanInterestRate: 11.5%` was shown
  as a clean default despite `data-requirements.md` explicitly rating it Low-Medium
  confidence and recommending `sensitivity_range` treatment, not `default_assumption` —
  precisely the "hide low confidence behind a clean-looking default" anti-pattern that
  file's own §9 warns against.
**Resolution so far (2026-07-06):** `content/inputs-metadata.json` rewritten to hold
only UI/control schema (control type, slider bounds, tooltip copy) — zero numeric
defaults. All equipment-specific benchmark numbers now live only in
`equipment-data/<type>.json` (added `billedTariffPerUse` and `launchDelayMonths`
fields, both `null`). Non-equipment-specific figures (discount rate, target IRR, loan
interest rate/tenure, working days/month) moved to new
`equipment-data/common-assumptions.json`, each with honest confidence/sourceId — the
false-citation numbers are now `null`/`"Unavailable"` instead of looking sourced.
SPEC.md §18.2/§18.3 and §23.4 corrected to stop asserting the false citation.
**Update (2026-07-07):** a deep-research pass (ChatGPT Deep Research, see
data-requirements.md §17 for full findings) came back and filled most of the null
gaps with real, cited data: discount rate (11.1-14.1% proxy from listed hospital-chain
WACC), MRI/dialysis utilization, CGHS reimbursement-ceiling tariffs for CT/MRI/
Ultrasound/Dialysis, MRI/CT/Cath-Lab launch-delay ranges, and a real per-machine
dialysis acquisition-cost figure from a government tender. All propagated into
`equipment-data/*.json` and `common-assumptions.json` with honest confidence/sourceId,
replacing the `null`s. **Still genuinely unavailable after two research passes:**
target IRR/hurdle rate (confirmed unresearchable, no public source exists — see §17.2),
Cath Lab tariff (no data found at all), Dialysis and Ultrasound launch delay, and
standalone (non-PET) CT utilization (only a weak proxy exists). These remain `null`/
`"Unavailable"` deliberately, not from oversight.
**Status:** downgraded to **accepted** for the fields now populated; **open** only for
the still-genuinely-unavailable fields above, which should stay user-entered per
data-requirements.md §7.3 rather than trigger a third research pass unless a
significantly better source turns up.
**Process note:** this is the second time a parallel/unsupervised agent session
introduced an inconsistency this project's own docs were built to prevent (see ISS-7
for the first). Per user direction (2026-07-06): going forward, build-plan and
spec-level documents get one primary agent, not parallel multi-agent editing;
independent, well-bounded, already-specified tasks (e.g. implementing a single pure
formula file against an exact SPEC.md formula) may still be delegated to a second agent
(Codex) when explicitly scoped by the primary agent first.

### ISS-3 — Equipment data files: several fields have zero research coverage in either pass
**Area:** data
**Status:** open
**What:** `mri.json`/`ct.json`/`cath-lab.json`/`dialysis.json`/`ultrasound.json` are
partially populated (purchase cost, utilization, tariff, launch delay — from the
2026-07-06/07 research passes; see `data-requirements.md` §17). `usefulLifeYears` was
filled in 2026-07-07 (see the Resolved section below). Still `null` with **no research
attempted in either pass, and not even named in `data-requirements.md` §15's gap list**:
`salvageValuePercentage`, `installationAndAncillaryCostPercentage`, `warrantyYears`,
`cmcYears`, `amcAnnualCostPercentage`. `data-requirements.md` §15 has been updated to
list these explicitly so a future research pass doesn't miss them. `custom.json` remains
a pure placeholder by design (user fills in their own equipment's specs), not a gap.
**Also flagged, not yet resolved:** each equipment file has `typicalUtilization.workingDaysPerMonth`
and `financingNorms.typicalLoanTenureYears`/`typicalInterestRateRange` fields that are
`null` in every equipment file — these duplicate values that already live at the shared
level in `common-assumptions.json` (`workingDaysPerMonth`, `loanInterestRate`,
`loanTenureMonths`) and don't appear to need an equipment-specific override per
`data-requirements.md`. Worth confirming whether these per-equipment fields are dead
schema (safe to remove) or intentional future overrides, next time Phase 1 is touched.
**Next action:** a third research pass (or Jay's own domain knowledge) for the five
zero-coverage fields above; otherwise these should be explicit user-entered inputs like
the other `data-requirements.md` §15 items, not silent defaults.

### ISS-8 — Dev-dependency audit warnings (moderate/high/critical, all dev-only)
**Area:** code / tooling
**Status:** open
**What:** `npm install` reports 7 vulnerabilities: `esbuild<=0.24.2` (dev server can be
sent arbitrary requests — GHSA-67mh-4wv8-2f99), pulled in transitively through
`vite`/`vitest`; and `postcss<8.5.10` (XSS in CSS stringify — GHSA-qx2v-qp2m-jg93),
pulled in transitively through `next`. Both are dev/build-tooling paths, not runtime
code shipped to users, and neither is exploitable in a static-export production build.
`npm audit fix --force` would resolve them but pulls in `vitest@4` and `next@9` — both
breaking-change downgrades/upgrades not worth forcing onto an otherwise-fine skeleton.
**Next action:** revisit next time `next`/`vitest` get a routine version bump anyway;
don't force it just for this.

### ISS-4 — Genuinely unresearched benchmark gaps
**Area:** data
**Status:** open
**What:** Payer-wise realization %, DSO by payer, specialist fees, and actual vendor
quotes remain unresearched — see `data-requirements.md` §15 for the full list. These are
correctly left as user-entered inputs for now rather than guessed at.
**Next action:** deepen research if/when better sources surface; not blocking for v1
since these are meant to be user inputs, not hardcoded benchmarks.

---

## Accepted (known, not being fixed)

### ISS-5 — CFO persona cutout retains office chair
**Area:** assets
**What:** `people-personas/transparent/03-cfo-finance-manager-cutout.png` keeps the
office chair behind her silhouette; the other 3 cutouts are clean.
**Why accepted:** cosmetic only, low priority. Manual touch-up needed if a fully isolated
cutout is ever required — not worth blocking on.

### ISS-6 — Two equipment images are approximations
**Area:** assets
**What:** `equipment-images/03-cath-lab-cardiology-equipment.jpg` and
`09-financial-dashboard-mock.jpg` aren't literal matches (no free stock photo exists of
an actual cath lab procedure room or this actual product's dashboard).
**Why accepted:** `design/dashboard-mockup.svg` is the real dashboard reference; image 09
is a placeholder only, safe to replace once real product screenshots exist.

---

## Resolved

### ISS-2 — Cloudflare Pages + DNS not yet wired up for capexiq.jaybharti.me
**Area:** infra
**Resolution (2026-07-07):** Jay confirmed he's done this directly in the Cloudflare
dashboard — `capexiq.jaybharti.me` is live. No agent action was needed or taken; this
was always a dashboard-only task outside this environment's reach.

### ISS-3 (partial) — usefulLifeYears now filled from real research
**Area:** data
**What was flagged:** `usefulLifeYears` was `null` in every equipment file despite
`data-requirements.md` §12.4/§14 already having a real, High-confidence sourced answer
(Companies Act Schedule II, source S8).
**Resolution (2026-07-07):** filled `usefulLifeYears` in `mri.json`/`ct.json`/
`ultrasound.json` (13 years — S8's own wording names "Cat-scan and ultrasound machines"
as the diagnostic-scan category) and `cath-lab.json`/`dialysis.json` (15 years — S8's
"other medical/surgical equipment" category; not individually named by S8, but the only
other category S8 defines, so this mapping is a reasonable direct inference from the
source's own two-category split, not a separate research claim). Confidence High,
sourceId S8 in all five files. `custom.json` untouched (no equipment type to map).
**Still open:** the other five null fields on the same equipment files
(`salvageValuePercentage`, `installationAndAncillaryCostPercentage`, `warrantyYears`,
`cmcYears`, `amcAnnualCostPercentage`) — see the ISS-3 entry above, still open, now also
listed in `data-requirements.md` §15.

### ISS-1 — Skeleton not build-verified
**Area:** code / tooling
**Resolution:** Node.js (v26.4.0) and npm (11.17.0) installed via Homebrew
(`brew install node`), which put both on PATH automatically. `npm install` and
`npm run build` both succeed — Next.js 15.5.20 compiles, type-checks, and produces a
static export in `out/` (confirms `next.config.ts`'s `output: "export"` works end to
end). No test files exist yet under `/tests` (only READMEs), so `npm test` has nothing
to run — that's expected, not a failure; add tests alongside real formula
implementations, not before.
**Note:** `npm install` reported 7 audit vulnerabilities (5 moderate, 1 high, 1
critical), all in dev-only tooling (`esbuild`/`vite` transitively via `vitest`,
`postcss` transitively via `next`) — see ISS-8 below, tracked separately since it's a
dependency-hygiene item, not a build blocker.

### ISS-11 — "Doctor's cut" — unclear if distinct from the professional/reporting fee field
**Area:** data / product
**What was flagged:** Jay flagged "doctor cuts" as something Advanced Mode should
surface. SPEC.md §10.2 already has a Basic Mode field for "professional/reporting fee
per use" (the performing/reporting doctor's own fee). It was unconfirmed whether
"doctor's cut" meant that same field, or a separate referral/commission cost (common in
Indian private healthcare, where a referring doctor gets a cut distinct from the
performing doctor's fee) for referral scans from other hospitals.
**Resolution (2026-07-07):** confirmed with Jay — "doctor's cut" is the existing
professional/reporting fee field, no new field needed. The separate referral/commission
scenario exists but is negligible relative to the scale of this CAPEX ROI tool and is
deliberately out of scope; don't add a field for it.

### ISS-10 — Investment Outlook score, EAC, and discounted payback have no formula
**Area:** data / product
**What was flagged:** SPEC.md §21/§11.2 name the Investment Outlook 0–100 score and its
Strong/Moderate/Caution/Weak bands, EAC (Equivalent Annual Cost), and discounted payback
as required outputs, but §31 (the formula list) had no corresponding entry for any of
the three. Found during the 2026-07-07 gap-analysis pass on `agent-build-plan.md`.
**Resolution (2026-07-07):** wrote `financial-model-spec.md` (SPEC.md §38's
named-but-never-written v0.5 artifact) — Jay reviewed and approved the methodology
directly. It defines: a 4-component weighted Investment Outlook score (Return Strength
35%, Speed to Payback 25%, Financing Resilience/DSCR 20%, Operational Margin of Safety
20%), each with a concrete normalization formula and edge cases; standard EAC and
discounted-payback formulas; confirmation that discount rate (12.5% typical, already
researched) and target IRR (confirmed unresearchable, use discountRate+300-500bps
heuristic) need no further work; and a new automatic actionable-insight feature (a
threshold-gated price-increase suggestion, only surfaced when it improves payback by
≥6 months with a price increase ≤15%, silent otherwise) that Jay specifically requested
during this same discussion. `agent-build-plan.md` Phase 2 and Phase 9 updated to
reference it.

### ISS-7 — "App repo not yet renamed to CapexIQ" (false alarm — one repo, not two)
**Area:** code
**What was flagged:** a session working on `design/` assumed the app code lived in a
separate repo not reachable from that environment, and flagged that it still needed the
CapexIQ rename.
**Resolution:** there is no separate app repo — this project is one folder
(`Roi_Calculator/`, becoming the single `CapexIQ` GitHub repo). The `/app`, `/formulas`,
`/equipment-data` etc. skeleton was built in this same session using "CapexIQ" from the
start (see `package.json`, `app/layout.tsx` metadata) — no old-name strings to fix.
Leaving this entry so the "two repos" assumption doesn't resurface.
