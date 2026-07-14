# ISSUES.md — known problems, gaps, and open loops

A running list so nothing gets lost between sessions. Log something here the moment you
notice it, even if you don't fix it now — that's the whole point of this file. Don't
duplicate long explanations that already live elsewhere (e.g. `data-requirements.md`
§15) — link to them instead.

Status values: **open** (needs action), **accepted** (known, deliberately not fixing),
**resolved** (kept briefly for context, then pruned).

---

## Open

### ISS-28 — Live deploy (`capexiq.jaybharti.me`) is badly stale
**Area:** deployment
**What was found:** 2026-07-13, during Phase 7 browser QA. The live Cloudflare Pages
site still serves the pre-Phase-6 scaffold placeholder ("This is a scaffold...") —
none of Phase 6's wizard, Phase 4-13's redesign, or Phase 7's dashboard are live.
`/assess` 404s directly (static-export routing not configured for direct navigation,
separate from the staleness). Likely Cloudflare Pages isn't auto-deploying from
`origin/main` pushes, or the last successful deploy predates Phase 6 entirely.
**Not fixed this session:** deployment configuration is outside this session's scope
and may be an intentional pause — flagged for Jay to decide, not silently changed.

No other open issues from the 2026-07-13 visual audit. Phase 7 formula/export items
remain tracked below under their existing IDs.

---

## Accepted (known, not being fixed)

### ISS-9 — Invented benchmark numbers from an unsupervised Gemini pass; cleaned up, final two gaps confirmed unresearchable after five passes
**Area:** data / docs
**Status:** accepted
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
replacing the `null`s.
**Update (2026-07-12, doc-accuracy correction):** this entry's "still genuinely
unavailable" list was stale — a third research pass (2026-07-07, see `ISSUES.md` ISS-3,
resolved) already filled Cath Lab tariff (₹11,920-₹15,000/procedure, High confidence)
and Dialysis/Ultrasound launch delay (Low confidence) after this entry was last written.
Corrected list of what's **actually still unavailable after three research passes:**
target IRR/hurdle rate (confirmed unresearchable, no public source exists — see §17.2)
and standalone (non-PET) CT utilization (only a weak proxy exists, see §18.7). Both
remain `null`/`"Unavailable"` deliberately, not from oversight.
**Update (2026-07-12, fifth pass — live web search):** Jay asked whether Claude Code's
own `WebSearch`/`WebFetch` access (not available to earlier passes, which went through
externally-run ChatGPT Deep Research) could close these last two fields. It didn't —
see `data-requirements.md` §20 for the full write-up. Checked and rejected: an ICRA
hospital-sector credit-rating report (real, but no IRR/hurdle-rate figure), a
government PPP practitioner's guide for diagnostic centers (procedural, names "the
IRR" as a DPR line item without stating one), two more Indian CT-utilization studies
(wrong metric type — a single-hospital capacity-percentage figure and a
per-million-population epidemiological rate, neither is per-scanner scans/day), and a
re-check of the CCI market study already in this project's register (confirmed, via
full-text search, that it has never covered utilization). **Notable side-finding:**
`WebSearch`'s own result-summarization hallucinated two figures that don't exist in
their cited sources (a "14-18% IRR" claim and a "5-15 scans/day" claim) — caught by
verifying each against the primary source directly before recording anything, per this
issue's own standing lesson. See §20.1 for detail; flagged as a process note for any
future live-search research pass on this project, not just this one.
**Status:** **accepted** for every field now populated (the large majority — unchanged).
**Accepted, not open, for the two remaining fields** (target IRR/hurdle rate, standalone
CT utilization) — five research passes across two different methods (external Deep
Research, direct live web search) found nothing usable. Per `data-requirements.md`
§20.5: don't re-run the same kind of general search a sixth time; only revisit if a
qualitatively different lead surfaces (a leaked lender credit memorandum, a hospital
finance-committee policy document, or a dedicated India CT-utilization field study).
**Process note:** this is the second time a parallel/unsupervised agent session
introduced an inconsistency this project's own docs were built to prevent (see ISS-7
for the first). Per user direction (2026-07-06): going forward, build-plan and
spec-level documents get one primary agent, not parallel multi-agent editing;
independent, well-bounded, already-specified tasks (e.g. implementing a single pure
formula file against an exact SPEC.md formula) may still be delegated to a second agent
(Codex) when explicitly scoped by the primary agent first.

### ISS-8 — Dev-dependency audit warnings (moderate, dev-only)
**Area:** code / tooling
**What was flagged:** `npm install` reported 7 vulnerabilities: `esbuild<=0.24.2` (dev
server can be sent arbitrary requests — GHSA-67mh-4wv8-2f99), pulled in transitively
through `vite`/`vitest`; and `postcss<8.5.10` (XSS in CSS stringify —
GHSA-qx2v-qp2m-jg93), pulled in transitively through `next`. Both are dev/build-tooling
paths, not runtime code shipped to users, and neither is exploitable in a static-export
production build.
**Resolution (2026-07-12):** the `esbuild`/`vite` chain is fixed — bumped
`vitest` `^2.1.0` → `^4.1.10` directly (not via `npm audit fix --force`, which was
proposing a bad resolution, see below). `npm audit` confirms that chain is clean; all
65 tests, `npx tsc --noEmit`, and `npm run build` pass unchanged on the new version — no
test-file changes needed. **The `postcss`/`next` chain has no viable fix and stays
accepted:** `next` is already pinned to its latest 15.x release (15.5.20); Next.js
bundles its own `postcss@8.4.31` internally regardless of app-level `postcss` version,
so there is no way to get the fixed `postcss@>=8.5.10` without jumping to `next@16`
(a real breaking major-version migration, not warranted for a dev-only XSS-in-
CSS-stringify issue that doesn't reach the static-export production build).
`npm audit fix --force`'s own suggested "fix" is actually to **downgrade** `next` to
`9.3.3` — a severe regression, not a fix; confirms forcing it is the wrong move, as
originally assessed.
**Next action:** revisit the `postcss`/`next` half next time a `next@16` migration is
independently warranted; don't force it just for this.

### ISS-4 — Hospital-specific figures correctly stay user-entered, not a research gap to close
**Area:** data
**What was flagged:** payer-wise realization %, DSO by payer, specialist fees, and
actual vendor quotes have no benchmark default anywhere in this project.
**Why accepted, not open (corrected 2026-07-12):** these were previously logged as an
open research gap implying a future research pass could eventually supply defaults.
That's not accurate — `data-requirements.md` §7.3 already classifies exactly this list
(hospital-specific utilization, hospital-specific payer mix, negotiated insurance
realization, actual vendor quotation, actual professional payout agreement) as
**"highly local, commercially sensitive, or too variable"** to ever have a single
correct benchmark value: every hospital's payer mix, negotiated insurer rates, and
vendor quote genuinely differs, so a "sourced default" for these would be actively
misleading, not just low-confidence. This is a permanent design decision, not a
temporary data gap — no amount of research closes it, by the nature of the fields
themselves. (A future research pass could still add *benchmark tooltip ranges*, per
§7.2, alongside the required user-entered field — that's a real, still-open
possibility, just not "resolving" ISS-4 as originally framed.)
**Next action:** none required. If a future session wants supplementary benchmark
tooltip ranges for these fields (not replacement defaults), that's new scope, not this
issue reopening.

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

### ISS-29 — `computeAssessment.ts` ramped realized revenue and variable cost by `utilizationRamp` but never ramped billed revenue
**Resolved:** 2026-07-14. Surfaced during Phase 8's Excel export monthly-breakdown work
(`formulas/monthlySeries.ts`): realized revenue/variable cost ramped month to month
under Advanced Group B's utilization ramp, but billed revenue was a flat, unramped
scalar — a monthly Billed Revenue column that never moved next to a Realized Revenue
column that visibly did, in the same workbook. Jay's decision, after an advisor pass
weighing three options (ramp billed to match realized; ramp everywhere including the
dashboard headline ROI figures; leave flat and just document it): **ramp billed
revenue the same way realized revenue already is.** Both figures are usagePerDay-
driven, differing only in per-use rate, so a volume ramp affects both identically —
you can't bill for a procedure you didn't perform. Fixed in `formulas/monthlySeries.ts`
(`monthlyBilledRevenue` now applies the same `utilizationFractionForMonth()` curve) and
`exports/workbookPlan.ts`'s Monthly-sheet Billed Revenue formula; reuses the existing
ramp fractions, no new numbers invented. Deliberately **not** touched:
`computeAssessment.ts`'s headline `monthlyBilledRevenue`/`roiBilled` fields stay flat,
exactly mirroring how `monthlyRealizedRevenue`/`roiRealized`/`annualOperatingSurplus`
already use flat, unramped annual figures too — those headline dashboard numbers are
unaffected. Verified: `tests/formulas/monthlySeries.test.ts` now asserts billed revenue
ramps identically to realized revenue; a HyperFormula-oracle spot-check plus (this
session) an actual LibreOffice headless recalculation of the Excel workbook both
confirmed the IRR cell to ~13 significant digits against `computeAssessment()`'s own
IRR, independent of this fix.

### Phase 7 build + reconciliation of two divergent design efforts
**Resolved:** 2026-07-13. Jay's local `main` checkout had a large uncommitted diff (the
full warm-beige redesign) while `origin/main` was one commit ahead with an
independently-merged PR (#17) that fixed the same validation-reveal bug and rebuilt
Methodology, using different code touching the same 11 files. Reconciled by keeping
`origin/main`'s more robust validation-gating and Methodology-page implementations
while layering the uncommitted diff's actual new scope (hospital name, Lakh/Crore
`CurrencyUnitField`, landing rebuild, equipment-image motion) on top — see HANDOFF.md's
2026-07-13 "Phase 7 results dashboard built" entry for the full mechanism. Built Phase
7's break-even bar, cumulative cash-flow chart, and risk callout on the reconciled
foundation; found and fixed one real chart-label-density bug and one real Phase 4-D
contrast failure via live browser QA. Confirmed the red-validation-before-touch bug
Jay asked to fix was already resolved by the touched/attempted-step gating — could not
reproduce it anywhere after reconciliation, verified via a direct `data-invalid` DOM
check (extension-proof, not a screenshot-only claim).

### ISS-27 / ISS-24 / ISS-25 — Frontend experience, Methodology design, and early errors
**Resolved:** 2026-07-13. Implemented the warm-beige narrated grouped-question
experience documented in `design/frontend-experience-audit-2026-07-13.md`: distinct
persona imagery, generated CT hero, hospital name, contextual equipment motion,
Lakh/Crore input choices, Basic/Advanced branching, one-topic Advanced workspace,
humanized help/Methodology, decision-led Results, and touch/attempt-gated validation.
Verified with the in-app browser plus root tests, typecheck, and static build. Phase 7
charts/exports are deliberately separate scope, not a reopening of this design issue.

### ISS-26 — First manual browser QA of Phase 6: 3 real bugs found and fixed, landing page built
**Area:** UI / state management / new feature
**What happened:** 2026-07-13, Jay asked for the first interactive browser QA pass of
Phase 6 (the prior implementation session had no working `claude-in-chrome`
connection — see ISS-21). Found and fixed, with an Opus advisor pass sanity-checking
both the diagnosis and the fix approach before implementation:
1. **`app/globals.css` had zero CSS for most component class families** actually
   used in markup — `assess-page`, `assessment-header*`, `equipment-tile*`,
   `advanced-panel*`, `advanced-group*`, `banner*`, `maintenance-schedule*`,
   `payer-row*`, `results-*`, `step-nav`, `start-over` all rendered unstyled (the
   pre-step's equipment images rendered at raw multi-thousand-pixel resolution, the
   `/results` page was a flat unstyled text list). Fixed by writing the missing CSS,
   token-based, matching the existing "Signal" theme conventions — no new visual
   language invented. Also fixed a related, only-found-while-doing-this bug: the
   `.equipment-tile__icon`/`.landing-how__icon` pattern of `aspect-ratio` + `padding`
   applied directly to a raw Lucide `<svg>` icon rendered the icon completely
   invisible (a replaced-element sizing quirk); fixed by wrapping icons in a
   flex-centered container `<div>` instead and sizing the icon itself via its own
   `size` prop.
2. **A hard reload/deep-link to any wizard step always bounced the user back to the
   pre-step**, silently resetting `currentStep` (though the underlying answers
   survived in `localStorage`). Root cause: `app/forms/RouteGuard.tsx`'s
   pathname-effect ran on first mount against the still-default
   `emptyWizardState()`, before `app/forms/useWizardPersistence.ts`'s mount-load
   effect's `RESTORE_DRAFT` dispatch had landed — a child-effect-before-parent-effect
   race. Fixed with a `state.hasHydrated` gate: a new `MARK_HYDRATED` action fires
   from the persistence hook's load effect on every mount (draft-found or
   draft-absent), and `RouteGuard` skips its redirect logic entirely until that flag
   is true. Regression test added in `tests/wizard/routeGuardAndPersistence.test.tsx`.
3. **`app/components/SliderField.tsx` showed a fake value for genuinely-unset
   required fields** — e.g. MRI's `basic.billedTariffPerUse` has no sourced default,
   so the real value is `null`, but the slider and its paired number input both
   displayed `def.min` (500) as though answered, while the field was still flagged
   invalid underneath. Fixed by tracking `localValue: number | null` end to end: the
   number input shows empty when null, the range thumb still gets a visual position
   from `def.min` without that fake value ever being written to state, and clearing
   the number input now sets the field back to `null` (previously snapped back to
   `def.min`). Regression test added in `tests/wizard/components.test.tsx`.
4. **Built the landing page** (`app/page.tsx`) per `design/ux-product-spec.md` §5 —
   header, hero, "how it works," "who it's for," a "what's in the tool" section, and
   a footer — plus a minimal Methodology page (`app/methodology/page.tsx`, see
   ISS-24) so the footer/header link isn't dead. This had fallen through the cracks
   between phases: no phase's "Do" checklist in `agent-build-plan.md` explicitly
   listed it, even though the entry flow was finalized back in Phase 5. Root `/` had
   shown the original pre-Phase-6 scaffold placeholder text until this fix.
**Files touched:** `app/globals.css`, `app/forms/wizardTypes.ts`, `app/forms/
initialState.ts`, `app/forms/wizardReducer.ts`, `app/forms/useWizardPersistence.ts`,
`app/forms/RouteGuard.tsx`, `app/components/SliderField.tsx`, `app/(assessment)/
assess/page.tsx`, `app/page.tsx` (new), `app/methodology/page.tsx` (new),
`app/methodology/renderSimpleMarkdown.tsx` (new), `public/people-personas/*`,
`public/design/hero-background.svg`, `public/README.md`, plus new/updated tests in
`tests/wizard/routeGuardAndPersistence.test.tsx` and `tests/wizard/components.test.tsx`
(175 passing, up from 173 — 2 new regression tests, plus 1 existing test updated to
mount `useWizardPersistence` alongside `RouteGuard` so hydration actually completes,
matching real app composition). `npx tsc --noEmit` and `npm run build` both clean.
**See also:** ISS-24 (Methodology page's own design polish, deferred) and ISS-25
(the eager-validation question, flagged for Jay, not changed).

### ISS-17 — Realization % / claim-deduction % combination is an engineering interpretation, not a verified contract
**Area:** formulas / financial model
**What was flagged:** `content/tooltip-copy.md` kept "Realization % by payer type" and
"Claim deduction / disallowance % by payer type" as two separately-estimated Advanced
Mode inputs ("kept separate... so the two effects aren't conflated"), but
`app/forms/resolvePayerMix.ts`'s `effectiveRealization = realization% × (1 −
claimDeduction% / 100)` composition was Claude's engineering judgment, not something
traced to a spec or test.
**Resolution (2026-07-13, Opus advisor pass, no product decision needed):** the
multiplicative composition is correct and standard for healthcare revenue-cycle
modeling — billed tariff is reduced by claim deduction (the formally rejected portion)
first, then realization % applies to what survives (collection shortfall on the
*approved* amount), i.e. two sequential, non-overlapping haircuts, not a double-count.
The advisor did find a real defect, though: `tooltip-copy.md`'s "Realization %"
definition said "share of billed tariff actually collected" — if taken literally, that
already includes the deduction loss, so multiplying by `(1 − claimDeduction%)` again
would double-count. Fixed by correcting the tooltip copy to define realization %
against the post-deduction/approved amount instead of billed tariff directly — the
formula itself needed no change. See `content/tooltip-copy.md`'s "Realization %" and
"Claim deduction" entries and `app/forms/resolvePayerMix.ts`'s updated comment.

### ISS-18 — Lease acquisition mode had no bounded term; rental applied for the full useful-life horizon
**Area:** formulas / financial model
**What was flagged:** `app/forms/toAssessmentInputs.ts` applied `leaseRentalPerMonth ×
12` as an annual financing cost for every year of `usefulLifeYears`, with no
`leaseTenureMonths` field (unlike Loan's `loanTenureMonths`) — a lease never stopped
costing, unlike a loan, which pays off.
**Resolution (2026-07-13):** an Opus advisor pass concluded this was a real
comparison-distorting bug, not an acceptable simplification — it systematically
understates Lease's attractiveness relative to Loan in the financing-mode comparison
this tool exists to support. Jay confirmed the advisor's recommended fix (a three-way
choice presented via `AskUserQuestion`): added a `leaseTenureMonths` field (mirrors
`loanTenureMonths`) — after this many months the rental stops and the equipment is
modeled as owned outright for the rest of `usefulLifeYears` (a finance/capital-lease
treatment), making Lease and Loan directly comparable over the same ownership horizon.
`formulas/computeAssessment.ts`'s `AssessmentFinancing`'s lease variant now carries
`tenureMonths` just like loan, and `financingCostForYear()` no longer special-cases
lease at all — both branches now share the same tenure-capping logic. See
`content/inputs-metadata.json#leaseTenureMonths`, `content/tooltip-copy.md`, `SPEC.md`
§11.1 C, `app/advanced/GroupC.tsx`, and `tests/wizard/toAssessmentInputs.test.ts`'s
updated Lease test.

### ISS-19 — Advanced Mode Group B (utilization ramp-up) and Group E's per-year maintenance override were collected but not consumed by the canonical pipeline
**Area:** formulas / wizard
**What was flagged:** `formulas/computeAssessment.ts` assumed flat mature usage from
day one — the 4 ramp-up percentages (Month 1-3/4-6/7-12/Year 2+) and
`expectedMatureUtilization` were captured in wizard state and persisted, but no formula
read them; similarly `maintenanceCostByYearPct`'s per-year stepped override was
collected but `toAssessmentInputs.ts` always built the schedule from the 4-parameter
warranty/CMC/AMC shape, ignoring it.
**Resolution (2026-07-13):** on inspection, both fields' own schema documentation
(`content/inputs-metadata.json`: ramp is "% of mature utilization"; the override is
"% of purchase cost" per year) fully specified the intended behavior — no product
judgment call was actually needed, just implementation. `formulas/computeAssessment.ts`
now builds a month-by-month utilization series (ramp fractions applied per SPEC.md
§13.2's literal month ranges, defaulting to 1 — i.e. unramped — when
`utilizationRamp` is omitted) that feeds both the per-year cash flows and the existing
monthly working-capital calc from one source of truth, and applies
`maintenance.costByYearPct` as a per-year override on top of the warranty/CMC/AMC
schedule wherever a year has a non-null entry. `app/forms/toAssessmentInputs.ts` wires
Advanced Group B into this only once every one of the 4 ramp periods is filled in (a
partially-filled ramp isn't a meaningful schedule) and lets `expectedMatureUtilization`
supersede `basic.usagePerDay` as the ramp's 100% baseline once Advanced Mode is open,
per that field's own `defaultSource` note. Fully backward compatible — every existing
golden-scenario test passed unchanged, since omitting `utilizationRamp`/
`costByYearPct` degenerates to the exact pre-existing flat behavior. New coverage:
`tests/formulas/computeAssessment.rampAndMaintenanceOverride.test.ts` and new cases in
`tests/wizard/toAssessmentInputs.test.ts`.

### ISS-20 — Slider keyboard input shared the pointer-drag debounce instead of firing immediately
**Area:** UI / accessibility polish
**What was flagged:** `app/components/SliderField.tsx` debounced the reducer dispatch
~120ms on every `input` event to smooth pointer drags, but wizard-state.md §5 also
specifies keyboard arrow-key presses should recalculate immediately — the
implementation couldn't distinguish a keyboard-sourced `input` event from a
pointer-drag one.
**Resolution (2026-07-13):** added a `keydown` listener that flags navigation keys
(arrows, Home/End, Page Up/Down) via a ref; the `input` handler checks and consumes
that flag to dispatch immediately for keyboard interactions while pointer drags still
debounce as before. See `app/components/SliderField.tsx`.

### ISS-21 — No interactive browser QA performed for Phase 6 (environment limitation)
**Area:** verification
**What was flagged:** No working Chrome extension connection was available during
Phase 6's own implementation session, so no real click-through, visual/layout check, or
confirmation that the route guard, focus management, or multi-tab conflict banner
behave correctly in an actual browser was possible.
**Follow-up (2026-07-13):** re-checked at the start of this session via the
`claude-in-chrome` skill — the browser connection is still not working in this
environment, so a real click-through remains blocked, same root cause as before, not a
one-off. Narrowed what's testable without one: added
`tests/wizard/routeGuardAndPersistence.test.tsx`, exercising the route guard's actual
redirect (`router.replace` call when landing directly on an incomplete step's URL) and
the cross-tab conflict banner actually firing on a real jsdom `StorageEvent` — both
previously named as untested in this same entry. Also fixed a latent test-infra gap
found while writing these: `tests/setup.ts` had no `afterEach(cleanup)`, so
multi-render test files could see stale DOM from a previous test bleed into the next
one (harmless while every file rendered only one component, a real bug once a file
needs more than one `render()` call). **Still open, and still requires a human or a
working browser-automation session, not further jsdom coverage:** anything visual
(layout, contrast, responsive behavior), a real multi-tab browser session, and slider
drag-timing/exact focus-transition behavior during live pointer interaction.
**Recommend:** a manual click-through pass (`npm run dev`, walk the full pre-step →
Investment → Usage → Costs → Results flow at least once, ideally on a phone-width
viewport too) before treating Phase 6 as fully signed off end-to-end.

### ISS-23 — Slider touch target doesn't meet the audit's full ask (native `<input type="range">` limitation)
**Area:** UI / accessibility
**What was flagged:** UI assurance audit F4 asked for the visible 18-20px thumb
(SPEC.md §25.5) to have a separate, transparent ≥24×24 CSS px touch target, since an
author-styled thumb doesn't get WCAG 2.5.8's user-agent-size exception. A native
`<input type="range">` doesn't expose a way to grow the *thumb's* own hit area
independent of its rendered size across browsers.
**Resolution (2026-07-13, Opus advisor pass):** confirmed this is a legitimate,
already-met conformance path, not a gap — WCAG 2.5.8 has an explicit "Equivalent"
exception for a *different control on the same page* that does meet 24×24, and every
slider in this product is already paired with a same-range, same-precision numeric
text input (native text inputs comfortably exceed 24×24). A fully custom-built slider
(considered and rejected, per the advisor) would trade a conformant native control for
a hand-rolled one at real risk of a subtler accessibility regression (keyboard
semantics, `aria-valuenow`, pointer capture) for no conformance gain over the exception
already in place. The existing row-padding mitigation (`app/globals.css`'s
`.slider-field__range`, added before this session) stays as a cheap, non-conformance-
claiming mis-tap reducer. Comment in `app/globals.css` updated to record the actual
conformance basis instead of describing this as unresolved.

### ISS-22 — Payer-mix group's `required: true` fields had no default, same class of bug as the resolved targetIrr issue (F1) — found and fixed during Phase 6
**Area:** wizard / data
**What was flagged:** Found while implementing the Phase 6 wizard reducer, not by
either prior audit. `content/inputs-metadata.json`'s `payerMixSharePct` (Advanced Group
A) is `required: true` per payer type with a group-sum-to-100% constraint, and — like
`targetIrr` before its F1 fix — has no sourced default and sits inside the collapsed
Advanced panel. Read literally, `wizard-state.md` §2's step-gate rule ("every
`required: true` field on that step... valid") would have blocked every Basic-Mode-only
user from ever reaching `/results`, since the 5 payer shares would sit at `null` forever
unless the user opened Advanced Mode and filled them in by hand.
**Fix:** applied the same pattern as F1's resolution — `app/forms/initialState.ts`
auto-fills an implicit single-payer default (100% private cash, 100% realization, 0
collection delay, matching SPEC.md §14.3's "Basic Mode calculates first-pass billed
revenue") at state initialization, so the group-sum constraint is satisfied by default
and the gate needs no special case. `app/forms/resolvePayerMix.ts` always reads from
this state (no `advancedOpen`-conditional branching) since it's correct in both modes.
**Files touched:** `app/forms/initialState.ts`, `app/forms/resolvePayerMix.ts`, see also
`tests/wizard/wizardReducer.test.ts`'s "payer mix defaults" test.

### ISS-16 — Basic Mode's blended AMC/CMC default-source formula, confirmed by Jay
**Area:** data / product
**What was flagged:** `capexiq-prebuild-assurance`'s pre-build audit (2026-07-13,
finding PBA-4) found `content/inputs-metadata.json`'s Basic Mode `amcCmcCostPostWarranty`
field had no `cmcYears` wizard input anywhere and an ambiguous blended default. Fixed
same session: Basic Mode now explicitly collapses the CMC-then-AMC schedule into one
flat rate for the whole post-warranty period; a new `cmcYears` Advanced Group E field
was added so the underlying `maintenanceScheduleForYears()` formula parameter is no
longer orphaned. One piece was left open pending Jay's confirmation: which formula
populates Basic Mode's default rate, since CMC is typically pricier than AMC and
defaulting from AMC alone would systematically understate early post-warranty cost.
**Resolution (2026-07-13):** Jay confirmed **Option A (duration-weighted blend)**:
`(cmcYears × cmcAnnualCostPercentage.typical + (usefulLifeYears − warrantyYears −
cmcYears) × amcAnnualCostPercentage.typical) ÷ (usefulLifeYears − warrantyYears)` — the
honest central estimate, over a CMC-only conservative default or an AMC-only
optimism-biased one. `content/inputs-metadata.json`'s `PROVISIONAL` language removed.
**Numbering note:** originally logged as ISS-14 in the session that found it, before
discovering (at merge time) that ISS-14 and ISS-15 below had already been assigned by
a parallel `capexiq-ui-assurance` audit session — renumbered to ISS-16 to avoid
colliding with already-published issue numbers, not because anything about the
finding itself changed.

### ISS-15 — No multi-tab or shared-device behavior defined for the wizard's localStorage draft
**Area:** design / product
**What was flagged:** the 2026-07-12 `$capexiq-ui-assurance` planning audit (finding
F5) found that `app/forms/wizard-state.md`'s `localStorage` draft persistence (§7) had
no defined behavior for two tabs open on the same draft at once — each tab
independently debounce-saves to the same key, so the last tab to save silently wins
and the other tab's edits vanish with no warning. Also unaddressed: nothing disclosed
to the user that a draft (hospital name, bed count, cost figures) persists
indefinitely in the browser on a possibly-shared device. A second, independent audit
(`capexiq-prebuild-assurance` PBA-13, 2026-07-13) found the same section also didn't
cover the write itself failing (quota/private-mode) — folded into the same
`wizard-state.md` §7.3 fix, see that section for the full three-part resolution.
**Resolution (2026-07-12, Jay's decision, informed by an independent Opus advisor
opinion):** a two-part fix, chosen over a full real-time cross-tab sync
(`BroadcastChannel` — rejected as disproportionate engineering for a single-user v1
tool) and over doing nothing but adding a warning note (rejected as too easy to miss
to actually prevent silent data loss): (1) a `storage`-event conflict banner — *"This
assessment was updated in another tab — reload to see the latest version"* — the user
chooses when to reload, nothing is silently overwritten; (2) explicit shared-device
copy next to the existing "Start over" control stating the draft is saved in this
browser only. See `app/forms/wizard-state.md` §7.3.

### ISS-14 — Target IRR field's `required` flag would have blocked Basic Mode entirely
**Area:** design / product
**What was flagged:** the 2026-07-12 `$capexiq-ui-assurance` planning audit (finding
F1) found that `content/inputs-metadata.json`'s `targetIrr` field was `required: true`
with no sourced default (confirmed unresearchable, see ISS-9), sitting inside the
Advanced Mode panel that's collapsed by default. Per `app/forms/wizard-state.md` §2's
own step-gate rule ("Next" enabled only when every required field on that step is
valid), this meant a Basic-Mode-only user — the hospital-administrator persona this
product is explicitly built to serve, not just the CFO — could never reach `/results`
without manually opening a panel they don't know exists and entering a number that,
by this project's own research, doesn't publicly exist anywhere for Indian hospitals.
Directly contradicted the product's central Basic/Advanced value proposition. A
second, independent audit (`capexiq-prebuild-assurance` PBA-5, 2026-07-13) found the
exact same defect from a different angle (traceability/schema review rather than
accessibility review) and converged on the same root-cause diagnosis, sanity-checking
that this is real.
**Resolution (2026-07-12, Jay's decision, informed by an independent Opus advisor
opinion):** rather than fabricating a benchmark or leaving the field blocking, the
wizard auto-fills `targetIrr` with a computed heuristic (`discountRate + 400bps`,
the midpoint of the range `equipment-data/common-assumptions.json` already suggested
for exactly this situation), shown with the same "Typical" tag every sourced default
uses, with its tooltip stating explicitly that this is a suggested starting point, not
a researched number — distinct in kind from every other default in this product,
which is a cited figure. The field stays fully user-editable in Advanced Mode; the
Investment Outlook score itself doesn't even consume this field directly
(`financial-model-spec.md` §1.6 uses `discountRate` as the hurdle), so nothing about
the scoring model changed. See `content/inputs-metadata.json#targetIrr`,
`equipment-data/common-assumptions.json#targetIrr`, `design/ux-product-spec.md` §6,
`app/forms/wizard-state.md` §2, `SPEC.md` §18.3, and `content/benchmark-notes.md` §2
for the full mechanism, each updated to match.

### ISS-13 — Equipment-data schema: workingDaysPerMonth/financingNorms per-equipment fields were dead
**Area:** data / schema
**Resolution (2026-07-11):** each equipment file had `typicalUtilization.workingDaysPerMonth`
and `financingNorms.typicalLoanTenureYears`/`typicalInterestRateRange` fields that were
`null` in every equipment file, duplicating `common-assumptions.json`'s shared-level
values (`workingDaysPerMonth`, `loanInterestRate`, `loanTenureMonths`). Confirmed dead —
no per-equipment override was ever populated or flagged as needed by any research pass —
and removed from all five `equipment-data/*.json` files. Single source of truth for
working days/month is now only `common-assumptions.json.workingDaysPerMonth` (flat 25
days/month, a generic Sunday-closure calendar convention, not a calendar-accurate
26/28/26 month-by-month figure — this was already the case before the cleanup, just now
un-duplicated). If an equipment-specific override is ever genuinely needed (e.g. a
lender treats MRI collateral differently from Dialysis), re-add the field then, with a
real sourced value — not as dead scaffolding ahead of time.

### ISS-2 — Cloudflare Pages + DNS not yet wired up for capexiq.jaybharti.me
**Area:** infra
**Resolution (2026-07-07):** Jay confirmed he's done this directly in the Cloudflare
dashboard — `capexiq.jaybharti.me` is live. No agent action was needed or taken; this
was always a dashboard-only task outside this environment's reach.

### ISS-3 — Equipment data files: zero-coverage fields now filled by a third research pass
**Area:** data
**What was flagged:** `usefulLifeYears`, `salvageValuePercentage`,
`installationAndAncillaryCostPercentage`, `warrantyYears`, `cmcYears`, and
`amcAnnualCostPercentage` were `null` in every equipment file, several with zero research
attempted across two prior passes and not even named in `data-requirements.md` §15's gap
list.
**Resolution (2026-07-07, in two steps):**
1. `usefulLifeYears` filled first from data already sitting unused in this doc (Companies
   Act Schedule II, S8): 13yr for MRI/CT/Ultrasound (named directly), 15yr for Cath
   Lab/Dialysis (by elimination — S8's only other category).
2. A third, narrowly-scoped research pass (ChatGPT Deep Research, prompted specifically
   against the remaining gaps) filled `salvageValuePercentage` (5% flat, all equipment,
   Schedule II again — see the citation caveat below), `installationAndAncillaryCostPercentage`,
   `warrantyYears`, `cmcYears`, and `amcAnnualCostPercentage` for all five equipment types,
   plus a new `cmcAnnualCostPercentage` field (added because AMC and CMC turned out to be
   genuinely distinct, differently-priced contracts, not one concept). **Also resolved in
   the same pass: Cath Lab's `billedTariffPerUse`, previously completely empty through two
   prior passes** — ₹11,920-₹15,000 per diagnostic catheterization, High confidence
   (CGHS + PM-JAY converge, independently re-verified this session against a second site).
   Dialysis and Ultrasound `launchDelayMonths` also filled (Low confidence, still weakly
   sourced). See `data-requirements.md` §18 for full findings, per-field confidence
   levels, and the complete new source register (S37-S57).
**Caveats carried forward, not silently swept under this resolution:**
- The AMC figures (2-2.5%, labour-only) are **identical across all 5 equipment types**
  because they all trace to one generic tender clause, not equipment-specific research —
  flagged in every file's notes, Low confidence.
- The Schedule II salvage-value citation was corrected from the pass's own (likely
  mismatched) Income Tax Department source to S8 — the well-known 5% figure itself wasn't
  independently re-verified against primary statutory text this session (3 verification
  attempts were inconclusive/blocked). Medium-High, not High.
- MRI's CMC cost has a real contradiction — see ISS-12 below (resolved 2026-07-11).
- `custom.json` untouched throughout (no equipment type to map), remains a pure
  placeholder by design.

### ISS-12 — MRI CMC cost: generic tender-ceiling range contradicts one real observed-cost study
**Area:** data / product
**What was flagged:** The third research pass (2026-07-07, see `data-requirements.md`
§18.4) found two genuinely conflicting figures for MRI's post-warranty comprehensive-
maintenance (CMC) cost: a generic tender-ceiling range of 3-10% of equipment value/year,
versus a peer-reviewed life-cycle-costing study of one MRI at an unnamed tertiary-care
teaching hospital that found *actual* realized CMC cost was only ~0.23-0.28%/year —
roughly 25-30x lower. Jay's working theory (2026-07-11): this might be a volume/bed-
count effect rather than a true contradiction, since the study's authors were AIIMS
New Delhi-affiliated and a hospital that large would plausibly negotiate a far better
rate than a smaller private hospital. Written up as a hypothesis in
`data-requirements.md` §19 and scaffolded (not populated) in `equipment-data/mri.json`.
**Resolution (2026-07-11, a fourth targeted research pass, same day):** the hypothesis
was tested directly and is **not verified**. Key findings: (1) the study never names
its hospital — author affiliation with AIIMS New Delhi is not proof the scanner was
installed there, so this project must stop describing S53 as an AIIMS case study; (2)
AIIMS New Delhi's own bed count is now sourced (1,559 across two named facilities,
S58) but is irrelevant context, not evidence about the actual study site; (3) no
Indian MRI tender, OEM schedule, or case study varying CMC/AMC price by bed count or
scan volume was found anywhere; (4) CT and Dialysis show limited evidence that fleet
size/negotiation can matter in principle (a CCI order, a bundled tender) but neither
quantifies a usable discount or transfers to MRI. **Decision:** no bed-count-tiered
CMC/AMC defaults will be built; the `_bedVolumeTierHypothesis` scaffold in
`equipment-data/mri.json` has been removed. The two MRI figures stay recorded
separately (never averaged, never silently picked as the sole default), per
`data-requirements.md` §18.4/§19.5. A set of quote-context fields (bed count, annual
scan volume, same-OEM fleet size, model/age, warranty status, uptime SLA, parts
coverage) was captured as a candidate future Advanced Mode addition — not built, since
Phase 4/5 (UI/UX) remains paused; see §19.5 point 4. **Reopen only if:** an OEM rate
card, an awarded contract with comparable single- and multi-unit prices, or several
matched hospital contracts (same model/age/scope/utilization) show a consistent scale
effect.

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
