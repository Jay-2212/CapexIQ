# app/forms/wizard-state.md — wizard state & transition table (Phase 5)

This is the doc `agent-build-plan.md` Phase 5 requires before any wizard component gets
written — "do not skip; do not start Phase 6 without this." It exists for the same
reason `CONVENTIONS.md` §1 exists: an undocumented interaction rule becomes an
inconsistent implementation you debug into consistency later, instead of a decision you
get right once. Phase 6 (wizard UI), Phase 7 (results dashboard), and Phase 9
(sensitivity UI) all consume this doc directly — they should not re-decide anything
settled here.

**Decided directly with Jay, 2026-07-11** (three architecture forks that this doc's
first draft could not safely infer from existing docs alone — see each section below
for why): the wizard shape, step-routing strategy, and draft-persistence approach. Every
other transition rule below was inferable from Phase 4 (`design/ux-product-spec.md`,
`agent-build-plan.md` Phase 4) and is stated here as a direct consequence, not a new
decision — cross-referenced rather than re-argued.

### 2026-07-13 experience amendment

Jay replaced the original long-form presentation with a narrated, grouped-question
experience. The route map and canonical calculation values do not change, but these
interaction rules now supersede older presentation language below:

- Each route is one chapter in the assessment story and shows **2–4 closely related
  questions per visual group**. It is not a one-field-per-page wizard and not one
  undifferentiated schema scroll.
- `/assess` also collects the required `hospitalName`. Equipment selection remains on
  that route and visually carries the selected equipment into the hospital profile
  group before the user continues.
- `purchaseCost` and `installationCost` stay canonical Crore values in persisted and
  formula state. Independent `currencyUnits` view state lets the user enter and see
  either Lakh or Crore; conversion happens only at the field boundary.
- Validation still recalculates on change, but an error is rendered only after that
  field has been touched or the user tries to continue from its step. The attempted
  step is recorded in `attemptedSteps`.
- Completing Basic presents two explicit paths: **Continue with Basic and see my
  result** or **Enter Advanced Mode**. Advanced remains on `/assess/costs`, but is now
  a six-topic workspace showing one topic at a time instead of six continuous groups.
  Its selected topic is local, non-durable UI state; `advancedOpen` remains persisted.

---

## 1. The wizard shape

**Resolved fork:** SPEC.md §7's "possible wizard-style layout" suggested 7 discrete
steps including "Step 6: Advanced Model" as its own step. `agent-build-plan.md` Phase
4-F decided Advanced Mode is "an inline, collapsible panel directly below the Basic
Mode fields on the same screen — not a separate wizard step" — which contradicts a
literal reading of SPEC.md §7. This doc resolves it: **Advanced Mode is not a step; it's
a single collapsible panel attached to the last Basic Mode step**, matching the banner
copy already written in `content/field-explanations.md` ("you can leave it as cash and
skip straight to results, or open Advanced Mode for the full detail" — phrased as one
consolidated action, not per-step toggles).

### 1.1 Route map

```
/                    Landing page (not a wizard step)
/assess              Pre-step — equipment + identity/context fields
/assess/investment   Step 1 — Investment
/assess/usage        Step 2 — Usage & Revenue
/assess/costs        Step 3 — Operating Costs + Advanced Mode panel
/results             Results Dashboard (Phase 7) — not a wizard step; the
                     destination after the wizard. Export actions live here
                     (SPEC.md §7's "Step 7: Export" is a set of buttons on this
                     page, not a separate route).
/methodology         Separate page (SPEC.md §36.1 Q9, resolved) — not part of
                     the wizard flow, reachable from header/footer at any time.
```

Five routes carry wizard state, not seven — SPEC.md §7's "Results" (step 5) and
"Export" (step 7) collapse into the one `/results` destination per Phase 4-G (results
are live/immediate, never a separately-submitted step) and Phase 7's own scope (the
results dashboard is where export buttons live). "Step 6: Advanced Model" is not a
route at all, per the resolution above.

### 1.2 Field-to-step assignment

Mechanical assignment, pulled from `content/inputs-metadata.json` — not re-deriving
bounds/validation here, only which screen each field lives on.

**`/assess` (pre-step)** — identity/context fields, not "how much will this cost"
fields. `cityTier` and `hospitalType` are grouped here (not Step 1) because they share
`hospitalBedSize`'s benchmarking-lookup role (SPEC.md §36.1 Q5/Q7) rather than being
investment figures; `equipmentNameModel` joins them as "name this specific unit," also
identity, not cost:
- `equipmentCategory`, `hospitalBedSize`, `cityTier`, `hospitalType`,
  `hospitalName`, `equipmentCategory`, `hospitalBedSize`, `cityTier`, `hospitalType`,
  `equipmentNameModel`

**`/assess/investment` (Step 1)**
- `purchaseCost`, `installationCost`, `launchDelayMonths`, `acquisitionMode`

**`/assess/usage` (Step 2)**
- `usagePerDay`, `billedTariffPerUse`, `workingDaysPerMonth`

**`/assess/costs` (Step 3)**
- `consumableCostPerUse`, `professionalFeePerUse`, `otherVariableCostPerUse`,
  `staffCostPerMonth`, `electricityCostPerMonth`, `otherFixedCostPerMonth`,
  `warrantyYears`, `amcCmcCostPostWarranty`
- **+ Advanced Mode workspace** (collapsed by default, choice banner always visible
  above it): opening it reveals a topic navigator and one active
  `content/inputs-metadata.json#advanced` group at a time. Group order is A→F,
  matching SPEC.md §11.1's own lettering:
  - A. Revenue realization and payer mix
  - B. Utilization ramp-up
  - C. Financing (fields under `requiredIf: acquisitionMode = Loan` or `= Lease` read
    `acquisitionMode` from `/assess/investment`'s state regardless of which step set
    it — cross-step conditional requiredness, not re-asked here)
  - D. Launch delay and pre-opening cost
  - E. Maintenance and lifecycle cost (`maintenanceCostByYearPct` is an array whose
    length equals Group F's `usefulLifeYears` — see §5 below for how a mid-array
    length change is handled)
  - F. Financial model assumptions

**`/results`** — no input fields of its own from the main wizard, but Phase 7 adds a
**separate, narrower** "Advanced settings pane": just `discountRate`, `targetIrr`, and
`loanInterestRate` (financing rate), exposed as quick-tweak sliders for sensitivity
exploration without leaving the dashboard. This is not the same UI element as the
Step 3 Advanced Mode panel — it's a second, smaller surface for the same three
underlying values (editing one updates the other's state; there's only one source of
truth per field, never two independently-tracked copies of `discountRate`).

### 1.3 Why 3 Basic steps instead of 1 long screen

Keeps each screen short (SPEC.md Risk 1: "Keep Basic Mode short," "Use progressive
disclosure") rather than a ~19-field single scroll, and matches SPEC.md §7's original
Investment / Usage & Revenue / Operating Costs grouping, which already reads as a
sensible three-part story (what it costs → what it earns → what it costs to run).

---

## 2. Per-step validation

Every field's control type, bounds, decimal places, required-ness, and error copy come
from `content/inputs-metadata.json` — this doc does not restate or re-derive any of
that (`CONVENTIONS.md` §3's single-source-of-truth rule, extended from formulas to
input metadata by `agent-build-plan.md` Phase 4). What this doc adds is the **timing**
of validation, which `inputs-metadata.json` doesn't cover:

- **Validate on every change, not on blur or submit — but only *display* the error
  once the field has been revealed (ISS-25, revised 2026-07-13).** Validation truth
  (is this value actually invalid right now) is always computed live, on every change,
  and always drives the step-gate and route guard below — that part is unchanged and
  still has zero debounce, consistent with Phase 4-G's "no debounce on typed fields."
  What changed is *when a computed invalid state is shown as red*: a field's
  `errorMessage` (in `--text-xs`, `--status-risk` color) is suppressed until that field
  is **revealed**, which happens the moment either is true:
  1. **Touched** — the user has edited that specific field (`wizardTypes.ts`'s
     `TouchedFieldMap`, the same map that drives the "Typical" tag, §6). The instant a
     field is touched, its error tracks live exactly as before (shows the moment it's
     invalid, clears the moment it's valid — no debounce, no re-hiding once revealed).
  2. **Attempted** — the user clicked (or keyboard-activated) "Next" while the
     containing step was incomplete (`AttemptedStepMap`, a separate, deliberately
     ephemeral per-step flag — see the Disabled-"Next" bullet below). This reveals
     every blocked field on that step at once, not just the one that gets focus.
  A completely fresh, untouched page load therefore shows **no red anywhere**, even
  though every empty required field is already invalid underneath — this is the fix
  for the original defect (red state before any interaction). `AttemptedStepMap` is
  never written to `touched`, and vice versa: marking a step attempted must not clear
  any field's "Typical" pill, since an untouched, still-default, still-valid field on
  the same step has nothing wrong with it — it's simply now visible alongside whatever
  actually is invalid. **Group constraints** (below) use the same two-trigger rule,
  keyed off whether any field in the group has been touched, or the step attempted.
  `app/forms/useFieldController.ts` is the single place this gating logic lives (per
  `CONVENTIONS.md` §3) — no field component re-derives it.
- **Step-level "can I proceed" gate:** a step's "Next" button is enabled only when every
  `required: true` field on that step (and every `requiredIf`-triggered field, e.g.
  Group C financing fields when `acquisitionMode` ≠ Cash) is both filled and valid.
  Optional fields never block progression regardless of their content. **Resolved (UI
  assurance audit F1, 2026-07-12, Jay's decision):** `targetIrr` (Group F) would
  otherwise block Step 3's "Next" for any Basic-Mode-only user, since it's
  `required: true` with no sourced default and sits inside the collapsed Advanced
  panel — contradicting the product's Basic-Mode-standalone premise. Fixed at the
  data layer, not the gate: the wizard reducer auto-fills `targetIrr` on
  initialization with `discountRate + 400bps`, shown with the standard "Typical" tag
  (`design/ux-product-spec.md` §6) and a tooltip stating it's a suggested starting
  point, not a researched number. Because it's always populated, the gate rule above
  needs no special case — `targetIrr` is simply valid by default like any other
  sourced field, and a Basic-only user reaches `/results` without ever knowing the
  panel exists. See `equipment-data/common-assumptions.json#targetIrr` and
  `content/inputs-metadata.json#targetIrr` for the full mechanism.
- **Disabled-"Next" discoverability (added — UI assurance audit F7, 2026-07-12; revised
  2026-07-13, ISS-25):** a disabled "Next" gives no clue *which* field is still
  blocking it, which is real friction on Step 3's 8-field form. Clicking (or
  activating via keyboard) a disabled "Next" moves focus to the first invalid/missing
  required field on the step (unchanged from the original F7 fix) **and dispatches
  `ATTEMPT_STEP` for that step**, which reveals *every* blocked field's existing
  `errorMessage` from `content/inputs-metadata.json` at once (no new copy needed) —
  not just the one that gets focus. This is the mechanism that answers "why can't I
  proceed," a step up from the original F7 fix's "here's the first thing." Same
  native-`reportValidity()`-equivalent intent as before, made explicit since this is a
  custom-built wizard, not a native `<form>` submit.
- **Group constraints** (e.g. `payerMixSharePct`'s "5 payer shares must sum to 100%")
  are evaluated across the whole group, not per-field — showing one error message
  anchored to the group heading, not duplicated on all 5 sliders. **Programmatic
  association (added — UI assurance audit F8, 2026-07-12):** each of the grouped
  sliders' `aria-describedby` includes that shared group-error element's id whenever
  the group is in violation, so a screen-reader user tabbing through the 5 payer-mix
  sliders one at a time is told about the group-level problem too, not just each
  slider's own name/value/bounds — still one message, referenced by all 5 controls,
  not duplicated text.
- **Route guard:** landing directly on a step's URL (via back/forward, a bookmark, or a
  fresh tab with an incompatible/absent draft — see §6) without its prerequisite steps
  complete redirects to the earliest incomplete step. `/results` carries the same guard
  against every Basic-required field across all three steps. This prevents computing
  (or displaying stale placeholder numbers for) a result from partial input. **Not
  silent (added — UI assurance audit F6, 2026-07-12):** see §6.5 for the focus/
  announcement this redirect (and every other step-change event) must produce.

---

## 3. Basic ↔ Advanced toggle persistence

Already decided, `agent-build-plan.md` Phase 4-F: entered Advanced values persist in
memory even while the panel is collapsed — collapsing never discards them. This doc
adds the concrete mechanism: Advanced field values live in the same top-level wizard
state container as Basic values (§7 below — one reducer, not a second state tree that
gets torn down on collapse). The panel's open/closed boolean is a separate, single piece
of state (`advancedOpen`) that only controls visibility, never data lifecycle.

---

## 4. Live preview during input, and the invalid/stale contract

Phase 4-G ("every numeric input... recalculates the visible dashboard/chart preview
immediately") presupposes a preview is visible during input, not only after reaching
`/results`. This doc makes that concrete:

- A **persistent preview strip** (not the full dashboard — a compact bar: payback
  period, a mini Investment Outlook badge, one headline risk note) is visible on all
  three `/assess/*` steps once enough required fields are filled to compute something
  meaningful (i.e., once `/assess/investment`'s required fields are valid — before that,
  the strip shows an empty/dash state, not a stale zero that looks like a real answer).
  It is **not** shown on `/assess` (the pre-step) since no cost/revenue data exists yet.
- Both the preview strip and the full `/results` dashboard call the **same** computed-
  results derivation from the **same** wizard state — never two independently-run
  copies of the formula pipeline (`CONVENTIONS.md` §3's dependency-direction rule,
  same reasoning `agent-build-plan.md` Phase 7 already applies to the dashboard's
  charts vs. metric cards). Phase 6/7 own the exact function name and shape; this doc's
  requirement is only that there is exactly one.
- **Invalid-state contract** (Phase 4-G, restated precisely as a state machine): each
  field is in exactly one of two states, `valid` or `invalid`. The preview strip and the
  dashboard track a derived `resultState`: `fresh` (every currently-relevant field is
  `valid`) or `stale` (at least one is `invalid` — the last successfully computed result
  stays rendered, at reduced opacity, with a small "based on your last valid entries"
  label; it never blanks, never shows a partial/zeroed calculation). Transition
  `stale → fresh` happens the instant the offending field becomes valid — same
  no-debounce timing as validation itself (§2).

---

## 5. Slider-specific transitions

- **Drag-start (mousedown/touchstart on the thumb):** no recalculation fires yet — the
  value hasn't changed.
- **Drag-in-progress:** the slider's own numeric readout updates in real time (pure
  local UI state, effectively free). The debounced recalculation Phase 4-G specifies
  (~100–150ms) fires only after the drag pauses — a fast drag across the full range
  does not fire dozens of recalculations.
- **Drag-end (mouseup/touchend):** flushes the debounce immediately — the preview is
  guaranteed fresh the moment the user releases, even if release happens inside the
  debounce window.
- **Keyboard arrow keys:** each keypress is a discrete step (native `<input
  type="range" step={sliderStep}>` behavior, using each field's own `sliderStep` from
  `content/inputs-metadata.json` — no new step values invented here) and is treated
  like a typed change: recalculates immediately, no debounce, since a single keypress
  isn't a rapid-fire drag. This is also the accessibility requirement Phase 5 must
  enumerate — sliders are fully operable without a mouse via native range-input
  semantics, nothing custom to build for basic operability.
- **The paired numeric text input** (every slider has one, per Phase 6's "Do" list):
  typing in it follows the plain typed-field rule (§2/§4) — no debounce, immediate
  validation and recalculation, and it updates the slider thumb position live as the
  user types (both controls always agree on one shared value; there is no moment where
  they can disagree).
- **`maintenanceCostByYearPct` array length change:** if the user changes
  `usefulLifeYears` (Group F) after already entering values into the per-year array
  (Group E), the array is truncated (life shortened) or extended with the row(s) left
  empty/optional (life lengthened) — existing entered years are never silently
  discarded or reset to a default. This is the one field whose shape depends on another
  field's value, so it gets an explicit rule rather than falling under the general
  "values persist" statement in §3.

---

## 6. Browser back/forward and step routing

**Resolved fork:** each step is its own route (§1.1's route map), so browser
back/forward moves between wizard steps the way a user expects from any multi-page
form — not out of the assessment flow entirely. This was Jay's call over the simpler
single-route/in-memory-only alternative, because losing the whole flow on one
mis-tapped back button (common on mobile) is a worse experience than the added
routing complexity.

Mechanics:
- Wizard state lives in a single context/reducer above all `/assess/*` routes (a
  layout-level provider, not per-page local state) so navigating between steps via
  the in-app "Next"/"Back" buttons is a normal client-side route change that never
  tears down state.
- A **real** back/forward (browser chrome, not the in-app buttons) is the same
  client-side navigation under the hood (Next.js client routing) — state survives
  identically. It does not trigger a full page reload, so §7's localStorage rehydration
  path isn't invoked on every back/forward — only on an actual reload (§7).
- Navigating back to an earlier step never clears that step's already-entered values,
  and never re-validates/blocks re-entry into a later step you'd already completed —
  you can go back, look, and go forward again without re-doing work.

---

## 6.5 Focus management and silent-state-change announcements (added — UI assurance audit F6, 2026-07-12)

None of the sections above specify where keyboard/screen-reader focus lands after a
state change that isn't a direct result of the user's own keystroke — a real gap for
anyone not visually tracking the page. One rule per event, each reusing the wizard's
existing `aria-live="polite"` region (introduced here, referenced by nothing else yet
built) rather than inventing a separate mechanism per event:

- **In-app "Next"/"Back" step change:** focus moves to the destination step's `h1`.
  No announcement needed beyond the new heading itself being read (normal screen-reader
  behavior on focus move).
- **Route-guard redirect (§2):** focus moves to the redirect destination's `h1`,
  and the live region announces why in one plain sentence, e.g. *"Returned you to
  Investment — Usage & Revenue isn't complete yet."* A silent bounce-back is the
  disorienting case this rule exists to prevent.
- **Draft restored on load (§7.2):** focus stays on the page's own `h1` (nothing extra
  to move to), and the live region announces *"Restored your saved progress from
  <relative time, e.g. '2 hours ago'>."* alongside the existing "Start over" affordance
  (§7.2) so the user can discard it if it's not what they expected.
- **Draft silently discarded on version mismatch (§7.2):** the live region announces
  *"Starting a new assessment."* — brief, since there's nothing to restore or discard
  by choice, but a user who expected their old draft back should not be left wondering
  why the wizard looks empty.
- **Inline "More info" expansion (`design/ux-product-spec.md` §4.B):** focus stays on
  the "More info" toggle itself (content expands below it, nothing forces focus away);
  the toggle carries `aria-expanded` reflecting open/closed state.
- **Disabled-"Next" activation (§2's new bullet, audit F7):** focus moves to the first
  invalid/missing field on the step, per that bullet — not repeated here, cross-
  referenced only.

---

## 7. Refresh, tab close, and draft persistence

**Resolved fork:** yes, persist to `localStorage` — there is no login/accounts system
(SPEC.md §36.1 Q1 is still open, and even if resolved to "yes" later, v1 has none), so
this is the only safety net against losing a half-filled assessment to an accidental
refresh, a mobile back-swipe, or a closed tab. The simpler "refresh just restarts"
alternative was considered and rejected by Jay for the same reason as §6's routing
call — real users will lose real work otherwise.

### 7.1 Storage key and schema

```
localStorage key: "capexiq.wizardDraft.v1"

{
  "schemaVersion": 1,
  "savedAt": "<ISO 8601 timestamp>",
  "currentStep": "preStep" | "investment" | "usage" | "costs" | "results",
  "preStep": { "equipmentCategory": ..., "hospitalBedSize": ..., "cityTier": ...,
               "hospitalType": ..., "equipmentNameModel": ... },
  "basic": { /* every field from content/inputs-metadata.json#basic except the
               preStep ones above */ },
  "advancedOpen": false,
  "advanced": {
    "A": { /* payer-mix template fields, expanded to concrete per-payer-type keys —
             e.g. payerMixSharePct_privateCash, _insuranceTpa, _corporateCredit,
             _pmJayGovt, _other, and the same 4-suffix pattern for
             billedTariffByPayerType / realizationPctByPayerType /
             claimDeductionPctByPayerType / collectionDelayDaysByPayerType */ },
    "B": { /* utilizationRampPct_month1to3 / _month4to6 / _month7to12 / _year2Plus,
             expectedMatureUtilization */ },
    "C": { /* downPayment, loanInterestRate, loanTenureMonths, processingChargesPct,
             emiStartMonth, moratoriumPeriodMonths, leaseRentalPerMonth */ },
    "D": { /* civilWorkDurationMonths, installationDurationMonths,
             licensingApprovalDurationMonths, trainingCommissioningDurationMonths,
             preOpeningFixedCosts, workingCapitalBufferAmount */ },
    "E": { "maintenanceCostByYearPct": [ /* array, length = F.usefulLifeYears */ ],
           "maintenanceInflationPct": ..., "majorReplacementCost": ... },
    "F": { "discountRate": ..., "targetIrr": ..., "inflationRate": ...,
           "usefulLifeYears": ..., "salvageValuePercentage": ...,
           "depreciationMethod": "Straight-line", "priceEscalationPct": ...,
           "costEscalationPct": ... }
  }
}
```

The five fixed payer-type suffixes (`_privateCash`, `_insuranceTpa`,
`_corporateCredit`, `_pmJayGovt`, `_other`) and four ramp-up suffixes
(`_month1to3`, `_month4to6`, `_month7to12`, `_year2Plus`) are this doc's answer to
`content/inputs-metadata.json`'s own note that it left template fields as "provisional
machine IDs" for Phase 5 to fix — **these are now final**, re-keying elsewhere is
mechanical from here. `maintenanceCostByYearPct` stays an array (not per-year suffixed
keys) because its length is variable, driven by `usefulLifeYears` (1–30) — see §5's
truncate/extend rule.

### 7.2 Save/load rules

- **Save triggers:** every field change is saved to `localStorage`, debounced ~500ms
  (a UX-invisible delay, distinct from Phase 4-G's ~100–150ms recalculation debounce —
  this one is about write frequency to storage, not chart freshness) — plus an
  **immediate, un-debounced** save on every step transition (Next/Back) and every
  `advancedOpen` toggle, so a refresh right after clicking "Next" never loses the step
  you just completed.
- **Load:** on mount of any `/assess/*` or `/results` route, read the draft. If
  `schemaVersion` matches the app's current expected version, rehydrate the reducer
  from it and route to `currentStep` (or the URL's own step, if further along and
  still valid per §2's route guard). If `schemaVersion` doesn't match, or the draft is
  malformed/unparseable, **discard it silently and start fresh** — no migration
  attempt, no error shown to the user. This is the "future format change doesn't crash
  on an old saved draft" requirement `agent-build-plan.md` Phase 5 calls for, resolved
  as simply as possible: a version bump is a clean break, not a migration project.
- **Clear:** the draft is deleted from `localStorage` on (a) a successful export
  (Phase 8 — out of scope for this doc to define precisely, since export doesn't exist
  yet; Phase 8 must call whatever "clear the draft" function this phase builds) or (b)
  an explicit **"Start over"** action, which this doc adds as a required affordance
  (a text link, low visual weight, present on every `/assess/*` step and on
  `/results` — e.g. in the header) since there was previously no way to abandon a
  draft and begin again short of manually clearing browser storage. "Start over"
  shows a native `confirm()`-free warning (per this project's "avoid triggering
  browser dialogs" convention — a simple inline confirmation state on the link
  itself, "Click again to confirm," not a modal) before actually clearing.

### 7.3 Multi-tab behavior, shared-device disclosure, and storage-write failure

Merges two independent audits' findings on the same gap: `capexiq-ui-assurance`'s F5
(2026-07-12, resolved by Jay with an Opus-advisor review) covered multi-tab conflict
and shared-device disclosure; `capexiq-prebuild-assurance`'s PBA-13 (2026-07-13) found
the same section didn't cover the write itself failing. Not addressed before either
audit: what happens if the same draft is open in two tabs at once (easy to trigger
accidentally — a middle-click, a mobile "open in new tab"). As originally written,
each tab's reducer independently debounce-saves to the same `capexiq.wizardDraft.v1`
key with no cross-tab awareness — the tab that saves last silently wins, and the
other tab's edits vanish on its own next save or reload with no warning. This is a
real way to lose real data on exactly the shared hospital workstation this feature
exists to protect. Also unaddressed: nothing tells the user this draft — hospital
name, bed count, cost figures — sits in the browser's storage indefinitely on a
possibly-shared device until "Start over" is clicked; and nothing defined what happens
if the write itself throws.

**Resolved, three-part fix (a full live-sync alternative — real-time cross-tab sync
via `BroadcastChannel` — was considered and rejected as disproportionate engineering
for a single-user, single-assessment tool with no other client-side sync surface
anywhere; also rejected: doing nothing beyond a text warning, since a note that's easy
to miss doesn't actually stop silent data loss):**

1. **Conflict warning:** every `/assess/*` and `/results` route listens for the
   browser's native `storage` event on `capexiq.wizardDraft.v1`. If another tab writes
   a draft with a newer `savedAt` than the one this tab last loaded, show a small,
   non-blocking banner: *"This assessment was updated in another tab — reload to see
   the latest version."* The current tab's state is never silently overwritten or
   auto-reloaded out from under the user — they choose when to reload, same principle
   as §6.5's other silent-state-change rules.
2. **Shared-device disclosure:** a small, persistent note near the "Start over" link
   (§7.2) — *"Your progress is saved in this browser only."* — plus "Start over"
   itself already serves as the one-click clear-draft control this needed; no second
   affordance required, just the added copy making its purpose (and the data's
   persistence) explicit. `content/field-explanations.md`'s longer privacy-note draft
   should be reconciled to this exact wording, not kept as a second live copy.
3. **`localStorage.setItem` failure (quota exceeded, or Safari private-browsing mode,
   which throws on every call, not just over quota) — not covered by the two points
   above, since a conflict banner and a disclosure note both assume the write itself
   succeeds:** wrap every write in try/catch. On failure, the wizard continues working
   normally from in-memory reducer state for the rest of the session (nothing about
   data entry or calculation depends on the write succeeding) — only the "your draft
   is saved" safety net is lost. Show a single, low-weight inline notice the first
   time a write fails in a session, next to the same disclosure copy from point 2:
   *"Your progress isn't being saved automatically in this browser — you can still
   finish and export, but a refresh will lose it."* Don't repeat the notice on
   subsequent failed writes in the same session. No browser dialog, per this
   project's own convention.

---

## 8. Backgrounded tab / mid-calculation

Every formula in `/formulas` is synchronous and pure (`CONVENTIONS.md` §3) — there is
no in-flight async calculation for a backgrounded tab to interrupt anywhere in the
wizard or `/results` dashboard as scoped by Phases 5–7. Backgrounding and returning to
the tab has no special-cased behavior to define here: the reducer's state is
untouched by visibility changes, and the next state-changing event (a keystroke, a
slider release) simply recalculates from wherever state already was.

The one genuinely async operation in the product — **export generation** (Phase 8:
Excel/Word/ZIP) — is out of scope for this doc, since it isn't built yet and inventing
its contract here would be exactly the kind of premature, undocumented mechanism this
project's own discipline exists to avoid. Phase 8 must define its own
backgrounded-tab/double-fire contract when it's written (at minimum: disable the export
button for the duration of generation, matching §9's idempotency rule below applied to
that action).

---

## 9. Idempotent step submission

Clicking "Next" (or the equivalent Advanced-panel "Continue to Results" action) is
made idempotent the standard way: the button disables itself the instant it's clicked,
for the duration of the transition, and the reducer's step-advance action is a no-op
if already mid-transition or already on the target step. A double-click cannot
double-submit, skip a step, or fire two route changes. This needed a decision (not
left as "obviously fine") because the debounced slider-drag path (§5) and the
un-debounced step-transition save (§7.2) both touch state near a step change, and
without an explicit guard a double-click could interleave them.

---

## 10. Definition of Done — cross-reference

| Phase 5 requirement (`agent-build-plan.md`) | Resolved here |
|---|---|
| Every step, every field, its validation rule | §1.2 (assignment), §2 (timing) — bounds/errors stay in `content/inputs-metadata.json`, not duplicated |
| Basic↔Advanced toggle effect on entered values | §3 (confirms Phase 4-F, adds the reducer mechanism) |
| Dashboard/chart behavior during invalid state | §4 |
| Slider drag-start/in-progress/end/keyboard transitions | §5 |
| Browser back/forward | §6 |
| Refresh mid-wizard / draft persistence | §7 |
| Backgrounded tab mid-calculation/mid-export | §8 |
| Idempotent step submission | §9 |
| Focus management / silent-state-change announcements (audit F6) | §6.5 |
| Disabled-"Next" first-invalid-field focus (audit F7) | §2 |
| Group-constraint `aria-describedby` wiring (audit F8) | §2 |
| Multi-tab behavior / shared-device disclosure (audit F5) | §7.3 — **resolved** |
| `targetIrr` required/no-default step-gate contradiction (audit F1) | §2 — **resolved** |

All eight original bullets have a concrete answer above — none deferred as "TBD." Three
of them (`wizard shape` §1, `step routing` §6, `draft persistence` §7) were genuine
architecture forks not safely inferable from Phase 4 alone and were decided directly
with Jay before this doc was written, the same way Phase 4 itself was — recorded here,
not re-litigated. Seven more concrete rules (F1, F3, F5, F6, F7, F8, F9) were added and
resolved by the 2026-07-12 UI assurance planning audit, same standard as the original
eight — F1 and F5 were genuine judgment calls, brought to Jay directly (with an
independent second opinion from a stronger model) rather than decided silently; both
are now resolved, see §2 and §7.3.

**Next:** Phase 6 (wizard UI implementation) builds against this doc exactly — a single
`useReducer` for all wizard state (§3, §6), one `<input type="range" step=...>`-backed
slider component reused everywhere (§5), and a test file exercising every transition
named above with a plain-language test name, per `agent-build-plan.md` Phase 6's own
"Do" list.
