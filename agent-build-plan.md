# agent-build-plan.md — phased implementation plan

This is the "v0.6 — Agent Build Spec" artifact SPEC.md §38 already called for: break
implementation into phases with clear scope, dependencies, and a Definition of Done —
so building this doesn't accumulate the kind of silent gap that shipped in an earlier
project (a session timer whose stop/resume didn't actually work across tab switches,
because the states and edge cases were never written down before the UI was built). See
`CONVENTIONS.md` §1 for that full story and the rule it produced.

Read `CONVENTIONS.md` before starting any phase — it defines the Definition of Done
every phase below is held to, and the dependency-direction / testing rules that make
each phase actually verifiable rather than just "looks right."

**2026-07-07 update:** this doc was significantly deepened via a dedicated gap-analysis
pass, before any UI/dashboard code exists, per the project's own "plan before build"
discipline. The pass found that SPEC.md exhaustively lists *fields* but leaves several
*mechanisms* explicitly unresolved (some literally flagged "TBD" in §36.3) — how Advanced
Mode is surfaced, whether charts/dashboards update live as inputs change, tooltip
direction/default-value content, chart color logic, input validation bounds,
typography/spacing, and whether the Excel export contains live formulas. All of those are
now resolved below (new Phase 4) or turned into a concrete task with a named owner-doc,
rather than left to be improvised inside a component later. Phases 4 onward are
renumbered from the prior version of this doc as a result — if you're citing an old phase
number from a stale note, re-check it against this file.

---

## How to use this doc

Work phases roughly in order — later phases depend on earlier ones being real, not
stubs. Within a phase, follow its own notes on what can run in parallel. Don't start a
phase whose "Depends on" isn't satisfied. Mark a phase's checkboxes as you go; when a
phase is fully checked, update `HANDOFF.md` and move to the next.

---

## Phase 1 — Real equipment data

**Goal:** Replace the null placeholders in `/equipment-data/*.json` and
`/equipment-data/common-assumptions.json` with real values, sourced from
`data-requirements.md` §14's starter assumptions table plus whatever the research
passes have returned (see ISSUES.md ISS-9 — a prior pass invented several of these
numbers instead of researching them, and they were stripped back to `null` on
2026-07-06, then partly refilled by two subsequent Deep Research passes).
**Depends on:** nothing to start the already-sourced fields — can begin immediately.
The genuinely-still-unavailable fields (target IRR/hurdle rate, Cath Lab tariff,
Dialysis/Ultrasound launch delay, standalone-CT utilization — see ISS-9) stay
user-entered inputs rather than blocking this phase.
**Parallelizable:** yes, freely — pure data, no shared state, can even split by
equipment type across sessions.
**Do:**
- [x] For each of `mri.json` / `ct.json` / `cath-lab.json` / `dialysis.json` /
      `ultrasound.json` / `custom.json` / `common-assumptions.json`, fill every field
      from §14 and the research passes, keeping the `confidence` / `sourceId` columns
      intact.
- [x] Where no research value exists, leave the field `null` **and** note why in the
      file's own `_status` field — don't invent a number (SPEC.md §24/§36,
      `INTRODUCTION.md` rule 5, ISSUES.md ISS-9).
- [ ] Add a small schema-validation test (or script) so a malformed/missing field fails
      loudly instead of silently reaching the UI later. **Still genuinely open** — no
      such script exists yet as of 2026-07-11; low-risk to defer since Phase 6 will
      exercise every field through the wizard anyway, but flagged here rather than
      silently checked off.
- [x] Reconciliation check: before marking this phase done, confirm
      `content/inputs-metadata.json` still contains zero numeric defaults (it should
      only have `controlType`/`unit`/slider bounds/tooltip copy, per its `_note` field)
      — if a future edit reintroduces a hardcoded default there, that's the same bug
      class as ISS-9 recurring. Confirmed 2026-07-11: still zero numeric defaults.
**Definition of Done:** every field is either populated (with confidence/sourceId) or
explicitly and visibly marked unresearched; nothing is silently null, and no numeric
default has leaked back into `inputs-metadata.json`. **Met** — remaining `null`s
(target IRR/hurdle rate, Cath Lab purchase-cost range, a handful of MRI/CT/Ultrasound
purchase-cost points, `custom.json` in full) are each deliberate and explained in
ISSUES.md ISS-9/ISS-3/ISS-4, not oversights. The schema-validation-test bullet above is
the one genuinely open item; it doesn't block this phase's own Definition of Done since
that's about data completeness, not tooling, but it's real remaining work.

---

## Phase 2 — Formula engine (real math)

**Goal:** Replace every `throw new Error("not implemented")` in `/formulas` with the
real calculation from SPEC.md §31.
**Depends on:** nothing (formulas are pure, per `CONVENTIONS.md` §3) — can start in
parallel with Phase 1.
**Parallelizable:** the best phase to split across agents/sessions — each file below is
independent. Suggested split:
- Group A (no dependencies on each other): `depreciation.ts` (§31.16), `emi.ts` (§19),
  `revenue.ts` (§31.1, §31.3), `breakEven.ts` (§31.13), `npv.ts` (§31.14), `irr.ts`
  (§31.15).
- Group B (has an internal order — do in this sequence, can still be a different
  session than Group A): `realization.ts` (§31.2) → `dso.ts` (§31.4) →
  `workingCapital.ts` (§14) — each consumes the previous one's output shape.
- Group C (depends on Group A + B existing): `roi.ts` (§31.11-12, needs payback +
  return figures), `maintenance.ts` (§20), `launchDelay.ts` (§16), `sensitivity.ts`
  (§28, needs every other formula to run a scenario end to end).
**Do, per file:**
- [x] Implement against the exact formula text in SPEC.md §31 (or the cited section for
      files not in §31, like `emi.ts`/§19, `maintenance.ts`/§20, `launchDelay.ts`/§16).
- [x] Add `/tests/formulas/<name>.test.ts` with 3 cases minimum: a clean round-number
      case, a realistic messy-number case, and one edge case (zero usage, zero discount
      rate, 100% realization, etc. — whatever's the meaningful boundary for that
      formula).
- [x] No `any`, no reimplementing a formula that already exists elsewhere.

**Gap found in the 2026-07-07 pass, resolved same day:** SPEC.md §21/§11.2 name several
outputs — the Investment Outlook 0–100 score and its Strong/Moderate/Caution/Weak
bands, EAC (Equivalent Annual Cost), discounted payback — that had **no corresponding
formula in §31**. `financial-model-spec.md` now exists (reviewed and approved by Jay,
resolves `ISSUES.md` ISS-10) and defines all three:
- [x] Implement the Investment Outlook score exactly per `financial-model-spec.md` §1 —
      four weighted sub-scores (Return Strength 35%, Speed to Payback 25%, Financing
      Resilience/DSCR 20%, Operational Margin of Safety 20%), each with its own
      normalization formula and edge cases already defined there. Don't re-derive or
      adjust the weighting inline — if it needs to change, that's an edit to
      `financial-model-spec.md` first, not a silent divergence in `roi.ts`.
- [x] Implement EAC and discounted payback per `financial-model-spec.md` §2 (standard
      finance formulas, not a designed methodology — no further review needed).
- [x] Tie the score bands (§1.4: Strong 75–100 / Moderate 55–74 / Caution 35–54 / Weak
      0–34) into Phase 4-C's chart conditional-coloring thresholds exactly, so the score
      and the charts never tell contradictory stories about the same numbers. Done via
      `design/ux-product-spec.md` §2, which maps the gauge/badge directly to these bands.
- [x] DSCR (`financial-model-spec.md` §1.2.3) is the answer to the open question below —
      add a one-line "Resolved — see financial-model-spec.md §1.2.3" annotation to
      SPEC.md §36.2 rather than leaving it silently open: DSCR is never mentioned
      anywhere in SPEC.md despite Advanced Mode's financing section (§11.C) covering
      loan terms in detail, and lenders commonly require it.

**Status, confirmed 2026-07-11:** all of Group A/B/C plus the score/EAC/discounted-
payback/actionable-insight quartet are implemented and merged (`128a929`, `#8`; see
`HANDOFF.md`'s 2026-07-11 entries) — this section's checkboxes were simply never ticked
off after the work landed, corrected here. `npm test` passes (65 unique tests across 17
formula files; the run shows 130 because a stale leftover worktree,
`.claude/worktrees/phase2-formulas-groups-bcd`, is still sitting in the repo and vitest
is picking up its duplicate copies — worth removing via `git worktree remove`, flagged
here rather than acted on since another session may still be using it).

**Definition of Done:** every function in `/formulas` has real logic and a passing test
file, including the score/EAC/discounted-payback trio (against
`financial-model-spec.md`'s worked examples); `npm test` is green.

---

## Phase 3 — Content and copy

**Goal:** Write the real text for `report-templates/methodology.md`,
`report-templates/disclaimer.md`, `report-templates/formula-appendix.md`,
`content/field-explanations.md`, `content/benchmark-notes.md`, `content/glossary.md`,
`content/tooltip-copy.md`.
**Depends on:** Phase 2 for `formula-appendix.md` (needs the real formulas to document
accurately) and `methodology.md`; Phase 4-E (tooltip content structure) for
`tooltip-copy.md` specifically; the rest can start immediately.
**Parallelizable:** yes, fully — no file overlap with any code phase, safe to run
alongside Phase 1 and Phase 2.
**Do:**
- [x] `disclaimer.md` — real, careful wording that outputs are estimates from
      user-entered assumptions, not financial advice. This blocks launch per
      `DIRECTORY.md`/`ISSUES.md` — don't leave it as a placeholder past this phase.
- [x] `glossary.md` — every term used in `formula-appendix.md` and the tooltip copy
      needs an entry; no orphaned jargon.
- [x] `tooltip-copy.md` — keyed by field name (readable name, not a final machine ID —
      Phase 5's `wizard-state.md` will define those; re-keying is mechanical, not a
      content rewrite). Each entry follows Phase 4-E's 7-slot structure exactly
      (definition, direction, default/typical value, confidence, source note,
      how-to-estimate, why-it-matters) — stricter than SPEC.md §23.4's original 4
      slots; "direction" (higher-is-better / lower-is-better / context-dependent) is a
      new required slot this pass added because SPEC.md never specified it and the
      product needs it (a user glancing at "DSO: 45 days" has no way to know if that's
      good or bad without it). Note: `inputs-metadata.json` still carries an earlier,
      simpler 4-slot tooltip object for 10 fields, predating this structure — whoever
      wires up the popover component should reconcile to this file, not keep both.
- [x] Advanced Mode preview banner copy — written into `content/field-explanations.md`'s
      Advanced Mode section, extending SPEC.md §10.4's original soft-note string to
      name all six §11 field groups by label so nothing Advanced unlocks is invisible
      to a Basic-only user.
- [x] The "professional/reporting fee" tooltip explicitly states what it does and
      doesn't cover (the doctor's own fee for performing/reporting the procedure),
      without assuming an answer to the separate "doctor's cut" referral/commission
      question — that's resolved as out of scope per `ISSUES.md` ISS-11, and the copy
      reflects that.
**Definition of Done:** no file in `/content` or `/report-templates` still says
"placeholder, not yet written." **Met 2026-07-11** — all 7 files written
(`disclaimer.md`, `glossary.md`, `benchmark-notes.md`, `field-explanations.md`,
`methodology.md`, `formula-appendix.md`, `tooltip-copy.md`).

---

## Phase 4 — Design system, interaction & validation contract

**Goal:** Resolve every design mechanism SPEC.md leaves open — several literally
flagged "TBD" in §36.3 — plus the input-validation rules SPEC.md never addresses at
all, by writing them into one prose spec (`design/ux-product-spec.md`, the v0.4 artifact
SPEC.md §38 already named but never produced) and one machine-readable per-field
contract (`content/inputs-metadata.json`), before any wizard or dashboard component is
built. This phase exists for the same reason Phase 5 (wizard-state) exists: an
undocumented interaction rule becomes an inconsistent implementation you debug into
consistency later, instead of a decision you get right once.
**Depends on:** Phase 3's tooltip-copy structure decision (already folded in above,
since it's needed to shape the per-field contract) — otherwise independent of Phase 1/2.
**Parallelizable:** no — like `wizard-state.md`, this needs to be one coherent pass so
token names, thresholds, and mechanism choices stay internally consistent. Splitting it
across sessions risks the same kind of drift `ISSUES.md` ISS-7/ISS-9 already logged once
for this project.

**Must resolve, explicitly, in `design/ux-product-spec.md`:**

**A. Typography scale.** SPEC.md §36.3.1 flags this open; §25.4 only suggests font
families. Define a concrete type scale (e.g. 12/14/16/20/24/32px, or a ratio-based
scale), a line-height per size, and which of the four downloaded weights (400/500/600/
700) maps to which UI role (body copy / field labels / headings / metric figures).
Confirm IBM Plex Mono + tabular numerals for *every* numeric/financial value across the
whole product (wizard inputs, dashboard metrics, chart axis labels, export previews) —
not just "financial outputs" in the abstract.

**B. Spacing scale.** SPEC.md only says "calm spacing" (§25.2) with no system. Define a
base-unit spacing scale (e.g. 4px base: 4/8/12/16/24/32/48/64) and where each step
applies (field-to-field gap, card padding, section gap, wizard-step gap). Add these as
new custom properties in `design/tokens.css` — it currently has zero spacing tokens,
only color/shadow/radius/font-family.

**C. Chart color system — fixed vs. conditional.** `design/colors.md` and
`tokens.css` already define a fixed 5-color chart series (`--chart-1`…`--chart-5`:
billed revenue / realized revenue / cash received / cost-EMI / benchmark) and a
green/amber/red status triad. What's missing: which chart elements use *conditional*
color (changes based on the computed value — e.g. a cumulative cash-flow line turning
red once it dips below zero, a break-even marker turning amber inside a defined risk
band) versus which stay a *fixed* series color regardless of value (billed vs. realized
vs. cash always keep their assigned color so a user can track a series across charts).
Tie every conditional threshold to the same Strong/Moderate/Caution/Weak bands Phase
2's `financial-model-spec.md` defines, so the score and the charts are never in tension
over the same numbers.

**D. Chart label, contrast & legibility rules.** SPEC.md has zero coverage here.
Define: a minimum WCAG AA contrast ratio (4.5:1 for text) for data labels against both
`--bg-secondary` and any colored fill behind them; a rule that value labels/callouts
never sit directly on top of a line or bar (offset the label with a leader line, or use
an adjacent legend — never text-on-line, which is illegible at small sizes); and — per
`DIRECTORY.md`'s existing colorblindness note about the Investment Outlook gauge —
extend "never rely on color alone" explicitly to every chart, not just the gauge: every
conditional-color chart element pairs with a shape/icon or text label too.

**E. Tooltip UI mechanics.** SPEC.md §23.4 defines tooltip *content* (6 slots) but not
the interaction. **Resolved 2026-07-11, see `design/ux-product-spec.md` §4** — this
entry originally said "hover-to-open on a mouse/trackpad pointer, tap-to-open on
touch," which directly contradicted SPEC.md §23.4's explicit, reasoned rejection of
hover ("poor touch-screen and mobile support"). That was wrong and is corrected here:
**click-to-open only, on every device, no hover trigger anywhere** — matching §23.4.
`design/ux-product-spec.md` §4 also adds a second mechanism for wizard fields
specifically (always-visible inline text, no popover at all — no click needed to see
the basics). A max tooltip width (280/320px) so long source notes don't stretch
off-screen was already specified precisely in SPEC.md §25.5. The exact, required
content order remains 7 slots, one more than SPEC.md's original 6:
1. Plain-language definition ("What does this mean?")
2. **Direction** — "Higher is better" / "Lower is better" / "Context-dependent — see
   note below" (new: SPEC.md never specifies this; it's necessary for a user to
   interpret any number without external context)
3. Default/typical value **with its confidence label**, pulled live from
   `data-requirements.md` — never hand-restated in `tooltip-copy.md`, to avoid the
   exact "false citation" failure class `ISSUES.md` ISS-9 already caught once
4. Source note
5. How to estimate this if unknown
6. Why this assumption matters

**F. Basic → Advanced surfacing mechanism.** SPEC.md §36.3.6 explicitly leaves this
open ("drawer, accordion, or separate tab?"). **Decision:** Advanced Mode is an inline,
collapsible panel directly below the Basic Mode fields on the same screen — not a
separate wizard step, not a modal, not a tab. Collapsed by default. A persistent
preview banner sits above the collapse toggle, always visible even when collapsed,
naming the six field groups it unlocks (Phase 3's banner copy). Toggling it open/closed
must never discard already-entered Advanced values — this was already decided in
`wizard-state.md` (Phase 5); this doc and that one must agree, and whichever is written
second should cross-reference the first rather than re-decide it.

**G. Live/dynamic recalculation contract.** SPEC.md never mentions live updates,
sliders, or real-time recalculation anywhere. **Decision:** every numeric input —
typed or slider-dragged — recalculates the visible dashboard/chart preview
immediately, with no debounce on typed fields (formulas are pure and cheap per
`CONVENTIONS.md` §3) but a short debounce (~100–150ms) specifically on continuous
slider drag, so a fast drag doesn't fire dozens of recalculations a second. While a
field is in an invalid state (per the validation contract below), the *last valid*
computed result stays visible with a visual "stale" indicator (e.g. reduced opacity) —
the chart must never blank out or render off a partial/invalid input.

**H. Excel export formula strategy.** SPEC.md §29.5 asserts a philosophy ("transparent
enough that a finance person can inspect and challenge it") without stating the
technical requirement. **Resolved 2026-07-07: live, embedded Excel formulas**, not
static computed values. Every input lives on a clearly separated Assumptions sheet;
every downstream sheet (revenue, cash flow, NPV/IRR, break-even) references those cells
with real formulas (e.g. `=Assumptions!B4*Assumptions!B7`), not pasted-in numbers — so a
CFO can click any cell and trace it back to an assumption. This raises Phase 8's
implementation bar: the export generator needs a library that can write real formula
strings into cells (e.g. `exceljs`), not a plain data-dump library — deciding this now
avoids discovering the constraint mid-Phase-8 after a simpler library's already wired
up.

**Also produce, in this same phase — the per-field validation contract,
`content/inputs-metadata.json`:**

One entry per wizard field (Basic + Advanced), each with:
- `type`: `currency` | `percentage` | `integer-count` | `decimal` | `select` | `text`
- `min` / `max` — explicit numeric bounds (e.g. usage/day ≥ 0 and ≤ a sane physical
  ceiling like 200; a payer-mix percentage group summing to 100; interest/discount
  rates 0–100%)
- `decimalPlaces` — currency fields: 0 or 2 (matching how ₹ amounts are actually
  entered); percentages: 1
- `allowNegative` — `false` for every cost/revenue/count field in this product. Stated
  explicitly because an unvalidated numeric `<input>` accepts a leading `-` by default
  — this has to be turned off deliberately, not assumed.
- `maxLength` — a character cap on free-text fields (equipment name/model, scenario
  name — e.g. 80 chars), so a pasted paragraph can't blow out the wizard layout or an
  exported report table.
- `required` — matches SPEC.md §10/§11's Basic/Advanced grouping.
- `errorMessage` — a specific sentence per rule ("Usage per day can't be negative." /
  "Enter a value between 0% and 100%.") — never a generic "invalid input."

This file is the single source of truth consumed by three places that must never
independently diverge: the wizard's validation logic, the tooltip's default/typical
value display, and the Excel export's Assumptions-sheet number formatting (currency vs.
percentage cell format). This is `CONVENTIONS.md` §3's dependency-direction rule
(formulas have exactly one implementation, called everywhere) extended from formulas to
input metadata — the concrete fix for "the wizard, the tooltip, and the export
disagreeing about what a field's bounds are."

Worked example (this **shape** is the Phase 4 deliverable — the full file, one entry
per field, is populated as part of this phase, not left as a 1-entry stub):

```json
{
  "usagePerDay": {
    "label": "Expected usage per day",
    "type": "decimal",
    "min": 0,
    "max": 200,
    "decimalPlaces": 1,
    "allowNegative": false,
    "required": true,
    "step": "basic",
    "errorMessage": "Enter a number between 0 and 200 scans/procedures per day.",
    "tooltip": {
      "definition": "How many times per day you expect this equipment to be used.",
      "direction": "Higher is better — usage drives revenue.",
      "default": { "value": null, "confidenceLabel": "See data-requirements.md §14" },
      "sourceNote": "Pulled live from data-requirements.md — never hardcode a number here.",
      "howToEstimate": "Start from your current similar-equipment usage, or ask 2-3 vendors for a realistic range.",
      "whyItMatters": "This is the single input break-even usage is measured against."
    }
  }
}
```

**Definition of Done:**
- [x] `design/ux-product-spec.md` exists and gives a concrete answer (not "TBD") to
      A–H above. **Done 2026-07-11** — written directly with Jay, also resolves
      SPEC.md §36.1 Q9/Q14 and §26.1's CTA wording, corrects the Phase 4-E hover/click
      contradiction above, and adds a "Signal" theme (accent color), default-value
      visual treatment, landing-page structure, and micro-interaction principles that
      weren't in this phase's original A–H scope.
- [x] `design/tokens.css` has spacing and type-scale tokens added alongside the
      existing color/shadow/radius/font-family tokens. **Done 2026-07-11** — also
      added `--accent-interactive`/`-hover`/`-bg` for the Signal theme.
- [x] `content/inputs-metadata.json`'s schema is defined and populated for every Basic
      and Advanced field, matching the worked example's shape. **Done 2026-07-11** —
      restructured under `basic`/`advanced` (grouped A-F per SPEC.md §11.1), old
      per-field 4-slot tooltip objects removed in favor of a `tooltipKey` pointer into
      `content/tooltip-copy.md` (the reconciliation that file's own header flagged as
      outstanding). Payer-mix/ramp-up/by-year fields are written once as templates
      (repeat dimension named explicitly) rather than enumerated per instance —
      Phase 5/6 expand these into concrete machine keys.
- [x] Every SPEC.md §36.3 bullet this phase resolves has a one-line "Resolved — see
      agent-build-plan.md Phase 4-X" annotation added directly in SPEC.md, so the two
      docs can't silently disagree the way ISS-7/ISS-9 already happened once (items 1,
      6, and the §29.5 export-philosophy line were annotated in the 2026-07-07 pass;
      items 2-5, 7-8 remain genuinely open and unrelated to this phase). §36.1 Q9/Q14
      also annotated as part of the 2026-07-11 pass, though those are product
      questions, not §36.3 design questions.
- [x] **2026-07-12 UI assurance planning audit (`.claude/skills/capexiq-ui-assurance/`)
      applied.** Found and fixed: no `prefers-reduced-motion` handling for §10's
      micro-interactions (F3, fixed in `ux-product-spec.md` §10); no Indian number-
      formatting rule despite the India-first premise (F9, fixed in `ux-product-spec.md`
      §10.5). One finding (F4, slider touch-target size) routed to Phase 6's "Do" list
      instead, since it's an implementation detail, not a design-mechanism decision.
      Full findings: see the audit conversation or re-run
      `$capexiq-ui-assurance` for the complete report.

---

## Phase 5 — Wizard state design (do not skip; do not start Phase 6 without this)

**Goal:** Write `app/forms/wizard-state.md` — the explicit transition table for the
7-step wizard (SPEC.md §7) — *before* writing any form component. This is the phase that
exists specifically to prevent the extension-timer bug class (see `CONVENTIONS.md` §1).
**Depends on:** SPEC.md §7/§10/§11 (already written); Phase 4's validation contract
(`content/inputs-metadata.json`) and live-recalculation contract (Phase 4-G) — the
transition table needs both to enumerate invalid-state transitions correctly, not just
happy-path steps. Doesn't depend on Phase 1-3.
**Parallelizable:** no — this is a single coherent design; one session should own it
start to finish so the table stays internally consistent.
**Entry point, finalized:** SPEC.md §36.1 Q14, resolved 2026-07-11 (see
`design/ux-product-spec.md` §5.2) — hero page → "Start Assessment" CTA → a dedicated
equipment + bed-count pre-step (real data collection, not a throwaway interstitial) →
the wizard proper. Not a direct-to-dashboard entry, and not "lands on step 1 of 7"
without that pre-step. This phase's transition table must design its entry transition
against this flow.
**Must enumerate, explicitly, in the doc:**
- [x] Every step, every field in that step, and its validation rule (pulled from
      `content/inputs-metadata.json`, not re-invented here).
- [x] What Basic → Advanced → Basic toggling does to already-entered Advanced-only
      values (decision: they persist in memory even while hidden, never silently
      dropped) — this must match Phase 4-F exactly; whichever doc is written second
      should cross-reference the first rather than re-decide it.
- [x] What the dashboard/chart preview does while a field is in an invalid state (per
      Phase 4-G: the last valid computed result stays visible with a "stale" visual
      indicator; the chart never blanks or renders off a partial/invalid input) and the
      transition back to a valid, fresh state once the field is corrected.
- [x] Slider-specific transitions: drag-start, drag-in-progress (debounced per Phase
      4-G), drag-end, and keyboard-arrow-key increments (sliders must be operable
      without a mouse — this is an accessibility requirement, not optional polish).
- [x] What happens on browser back/forward through wizard steps.
- [x] What happens on refresh mid-wizard (is there draft persistence? If yes to
      `localStorage`, define the schema and a version field so a future format change
      doesn't crash on old saved drafts).
- [x] What happens if the tab is backgrounded and returned to mid-calculation or
      mid-export — nothing should silently stop, double-fire, or desync (this is the
      exact class of bug that shipped before).
- [x] Whether step submission is idempotent (double-click "Next" doesn't double-submit
      or skip a step).
**Definition of Done:** the doc exists, covers every bullet above with a concrete
answer (not "TBD"). **Done 2026-07-11** — `app/forms/wizard-state.md` written. Three
genuine architecture forks not safely inferable from Phase 4 alone (wizard shape —
Advanced Mode as one panel on the last Basic step, not a separate step per a literal
reading of SPEC.md §7; per-step URL routing so browser back/forward works; and
`localStorage` draft persistence) were decided directly with Jay before writing, the
same way Phase 4 itself was. Still to happen: a read-back by whoever implements Phase 6
(procedural — flag any objection found during Phase 6 build as a doc amendment, not a
silent divergence).

**2026-07-12 UI assurance planning audit applied — seven concrete rules added, all
resolved (two via Jay's direct decision, informed by an independent Opus advisor
opinion):**
- [x] Focus management for step change, route-guard redirect, draft restore/discard,
      and inline tooltip expansion (F6) — `wizard-state.md` §6.5.
- [x] Disabled-"Next" first-invalid-field focus, so a blocked step tells the user which
      field is the problem (F7) — `wizard-state.md` §2.
- [x] Group-constraint `aria-describedby` wiring for the payer-mix sliders (F8) —
      `wizard-state.md` §2, cross-referenced from Phase 6's "Do" list above.
- [x] **F1, resolved:** `targetIrr`'s `required: true` with no sourced default, sitting
      inside the collapsed-by-default Advanced panel, would have blocked Step 3's
      "Next" for any Basic-Mode-only user — contradicting the product's Basic/Advanced
      premise. **Decision:** auto-fill `targetIrr` with a computed `discountRate +
      400bps` heuristic, shown with the standard "Typical" tag and a tooltip stating
      it's a suggestion, not a benchmark — never blocks the gate, never silently
      claims to be sourced. See `wizard-state.md` §2, `design/ux-product-spec.md` §6,
      `content/inputs-metadata.json`, `equipment-data/common-assumptions.json`, and
      `SPEC.md` §18.3.
- [x] **F5, resolved:** no multi-tab or shared-device-privacy behavior was defined for
      the `localStorage` draft — two tabs open on the same draft could silently lose
      edits. **Decision:** a `storage`-event conflict banner ("updated in another tab
      — reload to see the latest version") plus explicit shared-device copy next to
      the existing "Start over" control ("Your progress is saved in this browser
      only."). A full real-time cross-tab sync (`BroadcastChannel`) was considered and
      rejected as disproportionate engineering for a single-user v1 tool. See
      `wizard-state.md` §7.3.

---

## Phase 6 — Wizard UI implementation

**Goal:** Build `app/forms/`, `app/advanced/`, and the step-navigation shell in
`app/components/`, implementing exactly what Phase 5's `wizard-state.md` specifies.
**Also built here, added 2026-07-13 (first manual browser QA session):** the landing
page (`app/page.tsx`) and a minimal Methodology page (`app/methodology/page.tsx`),
per `design/ux-product-spec.md` §5/§5.3 — the entry flow these depend on was
finalized back in Phase 5, but no phase's own "Do" list ever explicitly named
building the landing page itself, so it went unbuilt through the rest of Phase 6
until this session caught root `/` still showing the pre-Phase-6 scaffold
placeholder. Retroactively scoped into this phase rather than treated as a new
phase, since it's pure UI work with no new formula/schema dependencies. See
`ISSUES.md` ISS-26 and `HANDOFF.md`'s matching Change Log entry for the full detail.
**Depends on:** Phase 5 (the doc must exist first), Phase 4 (`content/inputs-metadata.json`
and `design/ux-product-spec.md`), Phase 2 (forms need real formulas to preview live
results against, per Phase 4-G's live-recalculation contract).
**Parallelizable:** no — single reducer, single source of truth for wizard state; two
agents editing it at once is exactly the coordination failure `CONVENTIONS.md` §7 warns
about.
**Do:**
- [x] One `useReducer` (or equivalent single state container) for all wizard state — no
      parallel `useState` calls for the same data scattered across step components.
      `app/forms/wizardReducer.ts`.
- [x] Every field's control type, numeric bounds, and error copy come from
      `content/inputs-metadata.json` (Phase 4) — no ad hoc validation logic duplicated
      inside a component; if a field needs a rule that file doesn't have, add it there
      first, don't hardcode it in the component. `app/forms/fieldSchema.ts`.
- [x] The Basic → Advanced panel implements Phase 4-F exactly: collapsed by default,
      preview banner always visible above the toggle, entered Advanced values persist
      across collapse/expand. `app/advanced/AdvancedPanel.tsx`.
- [x] Slider components pair a draggable slider with a synced numeric text input
      (either can drive the value, they stay in sync) — a slider alone isn't precise
      enough for financial figures a CFO will scrutinize; it's an input aid, not a
      replacement for a typed number. `app/components/SliderField.tsx`.
- [~] A test file that runs every transition in `wizard-state.md`'s table, with test
      names matching the plain-language scenario (e.g. `"back button after a validation
      error does not clear other steps"`). **Partially done** — `tests/wizard/
      wizardReducer.test.ts`/`wizardValidation.test.ts`/`components.test.tsx` cover the
      core reducer transitions, validation, and 2 interactive behaviors (161 tests
      total), but not every single §5/§6/§7 timing/focus/multi-tab bullet has its own
      dedicated test. See `ISSUES.md` ISS-21.
- [~] Every edge case bullet from Phase 5 has a corresponding passing test — this is the
      concrete, checkable fix for "stop button didn't stop, resume didn't work." Same
      caveat as above — see `ISSUES.md` ISS-21.
- [ ] **Slider touch target (added — UI assurance audit F4, 2026-07-12):** SPEC.md
      §25.5's 18-20px visible thumb is an author-styled control, not the browser's
      native rendering, so it doesn't get WCAG 2.5.8's user-agent-size exception. Keep
      the visible diameter exactly as specced, but give the actual hit-target a
      transparent ≥24×24 CSS px touch area centered on the thumb (a standard native-
      range-input styling technique) — no visual change, only the tappable area grows.
      **Not achieved as specced** — `app/components/SliderField.tsx` uses a native
      `<input type="range">`, which doesn't expose a way to grow the thumb's own hit
      area independent of its rendered size. See `ISSUES.md` ISS-23.
- [x] **Group-constraint `aria-describedby` wiring (added — UI assurance audit F8,
      2026-07-12):** `wizard-state.md` §2's payer-mix group-sum error is one message
      anchored to the group heading — wire each of the 5 payer-mix sliders'
      `aria-describedby` to that shared message's id whenever the group is in
      violation, so a screen-reader user tabbing through the sliders individually is
      told about the group-level problem too. `app/advanced/GroupA.tsx`.
- [x] **Prerequisite, before wiring the canonical pipeline (added 2026-07-13,
      capexiq-prebuild-assurance PBA-10):** the golden end-to-end scenario suite in
      `tests/scenarios/` (see `tests/scenarios/README.md` for the current set and what's
      still logged as follow-up) must exist and pass before dashboard/preview-strip code
      is built against the pipeline — these are independently-hand-derived regression
      scenarios, distinct from Phase 9's user-facing scenario-comparison feature.
      Already merged (PR #14); `formulas/computeAssessment.ts` validated against it
      exactly (`tests/formulas/computeAssessment.test.ts`).
- [x] **Canonical NPV/IRR/working-capital calculations must use the full DSO-extended
      `cashReceivedByMonth()` array, never a truncated original-horizon slice** (added
      2026-07-13, PBA-3) — see `SPEC.md` §14.4 and `report-templates/formula-appendix.md`
      §1.4 for the full contract. `formulas/workingCapitalPeak.ts` always uses the full
      extended array; golden scenario B's own truncation-hazard test
      (`tests/scenarios/financed-payer-mix-dso.test.ts`) already regression-guards the
      underlying formulas. Headline NPV/IRR use the accrual (realized-revenue) annual
      series, matching golden scenario B's own worked NPV/IRR computation exactly — the
      DSO-extended array feeds the separate working-capital-gap metric only, per that
      scenario's own structure.
- [x] **No formula-output value that can be `Infinity` (`paybackPeriod`,
      `paybackPeriodFromCashFlows`) may be passed to `JSON.stringify` anywhere in the
      pipeline** (added 2026-07-13, PBA-7) — `JSON.stringify(Infinity)` silently becomes
      `"null"`, colliding with `discountedPaybackPeriod`'s genuine `null` sentinel. See
      `report-templates/formula-appendix.md` §4.6 for the full contract and why the two
      sentinels are deliberately different, not to be unified. Satisfied by
      construction — the wizard only ever `JSON.stringify`s the raw `WizardState`
      draft (`app/forms/draftStorage.ts`), never a computed `AssessmentResult`.
- [x] The pre-step or an early wizard screen shows the localStorage privacy disclosure
      copy from `content/field-explanations.md` (added 2026-07-13, PBA-8) near the
      "Start over" control. `app/(assessment)/layout.tsx`'s header, exact wording.
- [x] **Landing page and Methodology page (added 2026-07-13, first manual browser QA
      session):** `app/page.tsx` — header, hero, "how it works," "who it's for,"
      "what's in the tool," footer, per `design/ux-product-spec.md` §5 — and
      `app/methodology/page.tsx` rendering `report-templates/methodology.md`/
      `formula-appendix.md` (§5.3). **Methodology page given a full design pass
      (2026-07-13, follow-up session)** — a two-column documentation layout with a
      sticky in-page table of contents, reusing the landing page's header/footer; see
      `ISSUES.md` ISS-24 (Resolved) for full detail.
- [x] **First interactive browser QA of Phase 6 (added 2026-07-13), closing ISS-21's
      "no browser QA possible" gap:** found and fixed 3 real bugs — `app/globals.css`
      missing CSS for most component class families (pre-step/results/Advanced-panel/
      banners/step-nav all rendered unstyled), a `RouteGuard`-vs-`useWizardPersistence`
      mount-order race that bounced every hard reload/deep-link back to the pre-step,
      and `SliderField` masking a genuinely-unset required field's value as `def.min`.
      See `ISSUES.md` ISS-26 for full detail.
- [x] **Validation display gated by touch/attempt, not shown before interaction (added
      2026-07-13, follow-up session):** `wizard-state.md` §2 revised — validation
      *truth* is still always computed live with zero debounce and still solely
      drives the step-gate/route guard, but a field's red error only *displays* once
      the user has touched that field or attempted to advance past its (incomplete)
      step. See `ISSUES.md` ISS-25 (Resolved) for full detail, including why this
      needed a separate `attemptedSteps` map rather than reusing `touched`.
**Definition of Done:** every Phase-5-enumerated edge case has a named, passing test —
**not fully met**; core transitions/validation/2 interactive behaviors are tested (183
tests, build/typecheck both clean), but see `ISSUES.md` ISS-21/ISS-23 for the specific
gaps against the letter of this bullet. **Manual browser QA has now happened** (see
above) — the DoD's remaining gap is test-coverage completeness against every §5/§6/§7
edge case, not "was this ever run in a real browser."

---

## Phase 7 — Results dashboard and charts

> **Mandatory 2026-07-13 design gate:** Before changing Phase 7 UI, read
> `HANDOFF.md` Current State and `design/ux-product-spec.md`'s
> **“2026-07-13 direction amendment — calm clinical intelligence.”** The implemented
> warm-beige landing, assessment, Advanced workspace, and decision-led `/results`
> surface are the visual and interaction source of truth. Preserve their typography,
> palette, spacing, radii, narrative voice, progressive disclosure, and grouped-flow
> behavior. `design/dashboard-mockup.svg` remains useful only for dashboard information
> architecture (gauge, metric hierarchy, charts, risk callout); its older styling must
> not replace or create a parallel design system. Extend the current Results page and
> existing CSS; do not rebuild it from or revive the stopped
> `.claude/worktrees/phase7-results-dashboard` worktree.

**Goal:** Build `app/results/` and `app/charts/` — Investment Outlook score, metric
cards, break-even chart, cumulative cash-flow chart, risk callouts, narrative summary
(SPEC.md §21, §27, §30) — plus an Advanced settings pane, implementing exactly what
Phase 4-G's live-recalculation contract specifies (this phase does not invent its own
live-recalculation behavior; Phase 4 is where that got decided).
**Depends on:** Phase 2 (formulas), Phase 6 (wizard output to render), Phase 4-C/D
(chart color and label/contrast rules), Phase 4-G (live-recalculation contract).
**Parallelizable:** yes, alongside Phase 8 — disjoint files, both just consume
`/formulas` output.
**Do:**
- [x] Start from the existing decision-led `app/(assessment)/results/page.tsx`; retain
      its human outlook, score, NPV/IRR/payback hierarchy, supporting read, and route
      back to Advanced Mode. Add Phase 7 depth rather than replacing it with a generic
      dashboard shell.
- [x] Match the existing warm beige / deep ink / restrained clinical-green system.
      Charts should feel editorial and calm: light plot surfaces, restrained grid
      lines, direct labels where practical, no gradients, glass, neon, or unrelated
      accent palette. **Verified 2026-07-13** with a `<meta name="darkreader-lock">`
      injection to get an un-inverted screenshot (the automation browser had Dark
      Reader active, which was silently repainting every earlier screenshot dark).
- [x] Keep narrative copy public and human. Never render internal driver IDs, source
      file paths, formula module names, audit notes, or code snippets.
- [x] Pure presentational components driven by formula output — no calculation logic
      inline here (per `CONVENTIONS.md` §3). **2026-07-13:** new
      `cumulativeCashFlowSeries` lives in `formulas/roi.ts`, not the chart component.
- [x] Charts subscribe to the same single computed-results object the dashboard already
      derives (e.g. via `useMemo`) from formula output — never a second, independently
      recalculated copy of the same numbers inside a chart component. This is the
      concrete mechanism that makes Phase 4-G's live-recalculation contract hold: the
      metric cards and the chart can never show numbers that briefly disagree.
- [x] Apply Phase 4-C's conditional-color thresholds (tied to `financial-model-spec.md`'s
      Strong/Moderate/Caution/Weak bands) and Phase 4-D's label placement/contrast/
      legibility rules during this phase's build, not bolted on afterward. **2026-07-13:**
      Phase 4-D's contrast rule was verified by computing actual WCAG ratios via
      `getComputedStyle` (not eyeballing) — found and fixed one real failure (chart
      year labels, 3.29:1 → 5.91:1). Phase 4-C's coloring is satisfied in spirit for
      the new charts (green/red cash-flow bars, clear/caution break-even fill) rather
      than literally re-deriving the 4-band Strong/Moderate/Caution/Weak palette per
      data point — the existing `results-hero[data-band]` coloring (untouched by this
      session) remains the one place the literal 4-band system applies.
- [x] Chart-level hover tooltips (a data point's exact value on hover) are a distinct,
      simpler UI element from field-help tooltips (Phase 4-E's 7-slot structure) — don't
      conflate the two. A chart tooltip needs only value + series label + period.
      **Built 2026-07-14** — `CashFlowChart`/`BreakEvenBar` bars are focusable/hoverable
      marks showing a floating `.chart-tooltip` (exact `formatInr` value + series label
      + period) on both mouse hover and keyboard focus, per `$dataviz`'s interaction
      rules (mark is the hit target, same detail on focus as hover, values lead labels).
      The existing accessible `<table>`/visible labels remain the non-hover path — the
      tooltip enhances, never gates. Live-verified in a real browser (MRI scenario):
      hovering the last cash-flow bar showed "₹16,80,50,000 / Year 13 · cumulative
      position"; hovering the break-even fill/threshold showed "23.0 / day / Expected
      usage" and "6.0 / day / Break-even threshold." 7 new tests in
      `tests/results/charts.test.tsx`.
- [x] Include an **Advanced settings pane** (accordion or drawer) allowing users to edit
      Discount Rate, Target Hurdle IRR, and Financing Interest Rate — using the same
      slider/recompute-trigger mechanism Phase 4-G defines, not a separately invented
      one. **Built 2026-07-13** as `app/components/ResultsQuickSettings.tsx` — collapsed
      by default, reuses `NumberField` (dispatches through the one wizard reducer),
      shows the financing field matching the active acquisition mode (Loan interest
      rate / Lease rental / a plain note for Cash). Live-verified: editing Discount
      Rate moved the score and NPV instantly.
- [x] **Corrected 2026-07-12 (doc-drift fix, found during the UI assurance audit):**
      this bullet previously said Discount Rate *and* Target Hurdle IRR both "have no
      sourced default" — false for Discount Rate, which `equipment-data/common-
      assumptions.json` gives a real `typical: 12.5%` (Medium confidence, S22/S23).
      Only **Target Hurdle IRR** is genuinely `Unavailable` (confirmed unresearchable,
      `ISSUES.md` ISS-9/`data-requirements.md` §17.2). **Resolved (audit finding F1,
      Jay's decision):** rather than a blank prompt, the pane shows Target Hurdle IRR
      pre-filled with a computed `discountRate + 400bps` heuristic under the same
      "Typical" tag treatment as any sourced default, with its tooltip stating plainly
      that it's a suggestion, not a researched number — never blank, never silently
      presented as sourced. This also resolved a Phase 5/6 step-gate contradiction (an
      unresourced required field inside the collapsed Advanced panel would otherwise
      have blocked Basic-Mode-only users from ever reaching this pane) — see
      `wizard-state.md` §2.
- [x] **Accessible chart data (added — UI assurance audit F2, 2026-07-12):** every
      chart (break-even, cumulative cash-flow, sensitivity) renders — or discloses via
      a "View as table" toggle — an accessible table/structured-text equivalent of the
      exact same values, sourced from the same single computed-results object the
      chart itself renders from (never a second, independently-derived copy). Canvas/
      SVG pixels and hover-only tooltips are not sufficient on their own for a
      screen-reader or low-vision user to get the same payback/break-even/cash-flow
      numbers a sighted user gets — a real gap for a financial-decision tool, not a
      cosmetic one. **2026-07-13:** met for the two Phase 7 charts — the cash-flow
      chart has a `visually-hidden` `<table>` with the same per-year figures, and the
      break-even bar's two numbers are already plain visible text (no hidden
      alternative needed). Sensitivity is Phase 9 scope, not built here.
- [ ] Visual QA pass across at least 3 equipment types spanning strong/moderate/risky
      outcomes — dashboards are easy to get "technically correct but visually broken"
      for edge values (very large/very small numbers, 0% and 100% cases). Include a
      contrast check per Phase 4-D as part of this pass, not deferred to Phase 10.
      **Not fully done 2026-07-13** — this session's live QA used one equipment type
      (MRI) across a Caution and a Moderate outcome (via a discount-rate edit); a
      Strong-band outcome and other equipment types are still untested live. The
      contrast check itself (Phase 4-D) was done and is not equipment-dependent.
- [x] Run the app locally and visually QA Phase 7 in a real browser at desktop and a
      narrow/mobile viewport. Verify the existing Basic and Advanced flows still look
      and behave as documented; Phase 7 must not regress the grouped-question design.
      **2026-07-13:** desktop (1440px, with Dark Reader locked for color accuracy) and
      mobile (390px) both verified; full Basic flow (equipment → hospital profile →
      investment → usage → costs → decision gate → Advanced Mode → results) re-walked
      end to end with no regression.
**Definition of Done:** dashboard renders correctly (numbers and layout both) for the
full range of Investment Outlook outcomes, not just one happy-path example; every chart
data label passes Phase 4-D's contrast rule; every chart has a working accessible-table
equivalent. **Status 2026-07-13: contrast rule and accessible-table equivalents are
both met. The "full range of outcomes" clause is partially met** — verified Caution and
Moderate bands live in the browser on one equipment type (MRI); Strong, Weak, and other
equipment types (CT, Cath Lab, Dialysis, Ultrasound, Custom) remain untested live.
`tests/results/charts.test.tsx` (added same day) closes the sharpest edge of this gap
at the unit level — `BreakEvenBar`'s unreachable-break-even branch and `CashFlowChart`
on an all-negative (losing-investment) series are now both rendered and asserted on,
which they weren't before — but a live-browser pass across equipment types and the
Strong/Weak bands is still outstanding. **Chart-level hover tooltips were built
2026-07-14** (see the Do-list bullet above); the multi-equipment/multi-band visual QA
pass remains the one concrete item left for a follow-up session before Phase 7 can be
called fully closed.

---

## Phase 8 — Exports (Excel / Word / ZIP)

**Goal:** Implement `exports/excel-generator.ts`, `exports/word-generator.ts`,
`exports/zip-generator.ts` per SPEC.md §29, using `report-templates/` content and the
`/formulas` engine — never a second copy of any formula.
**Depends on:** Phase 2 (formulas), Phase 3 (report-templates content), Phase 4-H (the
live-formula decision).
**Parallelizable:** yes, alongside Phase 7.
**Do:**
- [x] Write `report-templates/excel-sheet-structure.md` for real before writing
      `excel-generator.ts` — it's currently a placeholder that just points back to
      SPEC.md §29. Define it tab-by-tab: which cells are user-editable inputs
      (Assumptions sheet) vs. which are live formulas (every other sheet), matching
      Phase 4-H's decision. Same "doc before code" pattern as Phase 5's
      `wizard-state.md`. **Done 2026-07-14** — 7 tabs (Assumptions, Monthly, Annual
      Summary, Break-even Analysis, Maintenance Schedule, Charts, Formula Notes),
      direct-cell-address formulas (not Excel defined names — see the doc's own
      rationale), and an explicit note on the flat-billed/ramped-realized asymmetry
      (`ISSUES.md` ISS-29) rather than papering over it.
- [x] Choose and wire up a formula-capable export library (e.g. `exceljs`) — per Phase
      4-H, a plain data-dump library isn't sufficient once formulas must be live and
      embedded. **Done 2026-07-14** — `exceljs` (Excel), `docx` (Word), `jszip` (ZIP),
      all dynamically imported inside each download handler so the heavy libraries
      never enter the initial page bundle (confirmed via `npm run build`: `/results`
      grew ~1KB, not the ~1MB+ these libraries would add if bundled eagerly).
- [x] **`formulas/monthlySeries.ts` (added 2026-07-14, prerequisite discovered mid-
      phase):** `computeAssessment.ts` never returned a monthly breakdown, only annual
      figures — SPEC.md §29.3's Excel model needs Monthly billed/realized revenue, cash
      received, EMI, and net cash flow. Rather than reimplement that math a second time
      inside the export layer, the existing inline ramp-fraction/monthly-array logic was
      *extracted* from `computeAssessment.ts` into this new file (a byte-identical
      refactor — all 203 pre-existing tests passed unchanged immediately after) and
      extended with `monthlyCashReceived` (reusing `formulas/dso.ts`'s
      `cashReceivedByMonth()`) and `monthlyEmiOrLease`. Billed revenue is deliberately
      left flat/unramped, matching `computeAssessment.ts`'s own (surprising, now-
      flagged) behavior — see `ISSUES.md` ISS-29.
- [x] **`exports/workbookPlan.ts` (added 2026-07-14):** a pure, exceljs-independent
      function producing every cell/formula as data, so the plan itself — not just the
      shipped `.xlsx` — can be evaluated by a real formula engine in tests. Direct cell
      references throughout (`Assumptions!$B$4`), not Excel defined names: a defined-
      name resolution failure shows as a silent `#NAME?` across the workbook with
      nothing in this headless pipeline able to catch it, whereas a direct reference
      round-trips provably (see the DoD note below) and still lets Excel's own "trace
      precedents" reach the Assumptions sheet.
- [x] **`exports/excel-generator.ts`, `exports/word-generator.ts`,
      `exports/zip-generator.ts` (added 2026-07-14):** thin writers consuming the plan
      (Excel) or `AssessmentInputs`/`AssessmentResult`/`app/components/riskNotes.ts`
      (Word, extracted from `RiskCallout.tsx` during this phase so both the dashboard
      and the export share one risk-note derivation) directly — no formula or number is
      ever re-derived in the export layer. `zip-generator.ts` bundles
      `Financial Model.xlsx` + `Proposal Report.docx` per SPEC.md §29.2 (no
      `Assumptions Summary.pdf` — SPEC marks that "optional later").
- [x] **`app/components/ExportPanel.tsx` (added 2026-07-14):** the three SPEC.md
      §29.1 buttons ("Download Excel Model" / "Download Word Proposal" / "Download ZIP
      Package") on the Results page, each lazy-loading its generator on click and
      triggering a browser download via `Blob`/anchor. Live-verified in a real browser
      (MRI scenario, `Apex Test Hospital`): all three downloads produced correctly
      MIME-typed, non-trivial-sized blobs (39KB xlsx / 11KB docx / 51KB zip) with zero
      console errors.
- [ ] **Chart images (Excel "Charts" tab, Word §8) — deferred, not built this phase.**
      Scoped out 2026-07-14 alongside the harder live-formula requirement, which is the
      phase's actual DoD; no headless Excel/LibreOffice is available in this
      environment to verify a rasterized image round-trips correctly, so an
      unverifiable image felt like the wrong tradeoff against the formula-correctness
      work. Both `report-templates/excel-sheet-structure.md` Tab 6 and
      `word-report-template.md` §8 carry this as an explicit note (a data table stands
      in for now), not a silent gap. Flagged as a fast-follow.
**Definition of Done:** an exported Excel file, opened in Excel/Sheets, shows real
formulas (not pasted values) in every downstream cell, each one traceable back to the
Assumptions sheet — verify this by actually opening the file and clicking cells, not by
checking the numbers match. The Word/ZIP export must reflect the exact same numbers
shown on the dashboard for the same inputs — verify this explicitly, side by side, not
just "it exports without an error."

**Status 2026-07-14 — the letter of "open in Excel and click cells" is honestly
unmet; the substance of what that check is *for* is met by a different, verified
route, documented here rather than let the two be confused:**
- No Excel or LibreOffice is installed in this headless environment, so a literal
  "open the file" pass could not happen. Asserting a formula *string* is present
  (`cell.formula` round-trips through a real `exceljs` write/read —
  `tests/exports/excel-generator.test.ts`, 4 tests) proves live formulas shipped, but
  — flagged directly by an advisor review before this was built — does **not** prove
  those formulas *evaluate to the right number*, which is the actual failure mode
  this DoD clause exists to catch (a wrong cell reference is a plausible-but-wrong
  formula string that a presence check passes clean).
- The real oracle: `tests/exports/workbookPlan.test.ts` feeds the exact cell plan
  `exports/excel-generator.ts` writes into **HyperFormula** (a real, independent
  formula-evaluation engine — not a second implementation of `/formulas`'s math) and
  asserts every formula cell's *evaluated result* — NPV, IRR, break-even usage/day,
  every monthly and annual net-cash-flow cell, cumulative cash position, cash-received
  totals — matches `computeAssessment()`/`buildMonthlySeries()`'s own numbers, across
  **four** structurally different golden scenarios (simple cash purchase; financed +
  ramped + multi-payer DSO; a per-year maintenance override, ISS-19; lease financing,
  ISS-18's tenure-cutoff semantics). 23 tests, all passing. This oracle caught three
  real bugs before they shipped: an unquoted space-containing sheet-name reference
  (`#ERROR!` on every Break-even Analysis formula); a missing upper-bound guard on the
  DSO cash-received `INDEX()` lookup (`#NUM!` on every "tail" row past the useful-life
  horizon for a short-collection-delay payer); and — caught by an advisor review
  specifically because neither of the first two golden scenarios exercised it — the
  Excel model's maintenance-cost formulas silently ignoring `costByYearPct`, a real,
  UI-reachable Advanced-mode override (`app/advanced/MaintenanceScheduleFields.tsx`)
  that `computeAssessment.ts`/`monthlySeries.ts` both apply. That third one would have
  meant the Excel export's headline NPV/IRR quietly disagreed with the dashboard for
  any user who sets a per-year override — fixed by adding a "Maintenance overrides"
  block to the Assumptions sheet and checking it first in both the Monthly and
  Maintenance Schedule tabs' formulas (see `excel-sheet-structure.md`'s corrected Tab
  1/2/5 notes). All three are exactly the class of formula-transcription bug a
  presence-only check would have shipped silently.
- **Recommendation for whoever next has GUI Excel or LibreOffice available:** open one
  generated `Financial Model.xlsx`, click through a handful of downstream cells, and
  confirm Excel's own precedent-tracing/recalculation agrees. That single manual pass
  is the one piece of verification this session could not perform itself, and it's the
  only thing standing between "very likely correct" and "confirmed correct." **Point
  that check at the IRR cell specifically** — Excel's `IRR()` is guess-seeded and can
  return `#NUM!` in cases where HyperFormula's own solver still converges (this
  project's numbers run 66-80% IRR, an unusually high range), so it's the single
  highest real-Excel-vs-HyperFormula divergence risk in this workbook. NPV/PMT/
  SUMPRODUCT/INDEX/CEILING/ROUNDUP are far more likely to already agree.
- Word/ZIP: verified by construction (every number comes from the same
  `AssessmentInputs`/`AssessmentResult` object the Results page renders — never
  re-derived — see `exports/word-generator.ts`'s header comment) and by 6 tests
  (`tests/exports/word-generator.test.ts`) that unzip the generated `.docx` and check
  `word/document.xml` directly for the exact NPV/IRR/payback figures
  `computeAssessment()` produced, plus the verbatim disclaimer text. `zip-generator.ts`
  verified by unzipping and checking both files round-trip byte-for-byte
  (`tests/exports/zip-generator.test.ts`). All three downloads were also live-verified
  in a real browser against a real MRI scenario (see the Do-list `ExportPanel.tsx`
  bullet above) — correctly MIME-typed, non-trivial-sized blobs, zero console errors.
- **Not done this phase:** chart images (see the Do-list note above) remain deferred.
  `ISSUES.md` ISS-29 (the flat-billed/ramped-realized asymmetry this phase's own
  monthly-series work surfaced) was **resolved same-day** in a follow-up session —
  Jay decided to ramp billed revenue to match realized; see `HANDOFF.md`'s 2026-07-14
  "Phase 8 follow-up" change-log entry and `ISSUES.md`'s Resolved section.

---

## Phase 9 — Scenario comparison / sensitivity

**Goal:** Real implementation of `formulas/sensitivity.ts` plus whatever UI SPEC.md §28
calls for to compare scenarios side by side.
**Depends on:** Phase 2, Phase 6, Phase 4-G (live-recalculation contract).

SPEC.md §28 only describes *discrete* named-scenario comparison (a table); it never
describes a *continuous*, slider-driven sensitivity view, even though "Sensitivity
chart" is named as an output in §11.2/§27. These are two different features — build
both, don't conflate them:
- [ ] Discrete scenario comparison (SPEC.md §28, already spec'd): a table comparing
      named scenarios (Conservative/Base/Optimistic, or user-named — "MRI Option A" vs.
      "MRI Option B").
- [ ] Continuous sensitivity view (implied but never UX-spec'd): pick the 1-2 highest-
      leverage drivers (usage/day, realization %) and let the user drag a slider to see
      NPV/IRR/payback update live in a small comparison strip next to the main chart —
      reuses Phase 4-G's live-recalculation contract and `formulas/sensitivity.ts`'s
      existing `runScenario` stub.
- [ ] **Automatic actionable insights** (added 2026-07-07, approved by Jay — see
      `financial-model-spec.md` §4): a passive, threshold-gated price-increase
      suggestion, distinct from the two user-driven features above — the user never
      requests this, it either appears or it doesn't. Implement exactly per
      `financial-model-spec.md` §4: a grid of test tariff increases (2/5/8/10/15% of
      current `billedTariffPerUse`) × test start years (Year 1/2/3, capped at
      `floor(usefulLifeYears / 2)`), re-running the payback formula for each
      combination; a materiality gate (only surface if payback improves by ≥6 months);
      a "cheapest win" selection rule (smallest qualifying price increase, earliest
      qualifying start year); and a null case (show nothing if no combination clears the
      gate — this is the expected, common result, not an empty state to fill in). Reuses
      `formulas/sensitivity.ts`'s `runScenario`, does not need a new formula file.
      Because the underlying formulas are pure and cheap, this runs silently as part of
      the same live-recalculation pass Phase 4-G already does — no separate loading
      state, no user-visible "extra calculation."

**Definition of Done:** running the same scenario twice with identical inputs produces
identical output (determinism check) — sensitivity/scenario code is the most likely
place for an accidental hidden-state bug to hide. The automatic-insight grid search must
pass the same determinism check (same inputs → same insight, or the same `null`, every
time).

---

## Phase 10 — Deploy and go-live QA

**Goal:** Once Cloudflare Pages + DNS is wired up (see the Cloudflare setup steps given
separately — this is infra, not code, so it's not a numbered code phase, but it gates
this one), do a final manual pass **on the actual deployed site**, not just localhost.
**Do:**
- [ ] Re-run every edge case from Phase 5's `wizard-state.md` manually in a real
      browser against the live `capexiq.jaybharti.me` URL — unit tests don't catch
      everything real tab-switching/refresh/mobile-viewport behavior can.
- [ ] Exercise every `content/inputs-metadata.json` validation rule manually on the
      live site — paste a very long string into a text field, type a negative number
      into a cost field, type letters into a numeric field, drag a slider to its
      min/max. Confirm the specific error copy shows and nothing crashes the chart
      (per Phase 4-G's "last valid result stays visible" rule).
- [ ] Run a contrast check (browser devtools or a WCAG checker) on chart data labels
      against both light-mode card backgrounds and any colored fills, per Phase 4-D.
- [ ] Confirm the OG image renders correctly when the URL is shared (paste the link
      into a chat app or use a link-preview debugger).
- [ ] Confirm favicon shows correctly across at least two browsers.
- [ ] Mobile viewport pass — the wizard is the highest-risk surface for this, and
      specifically confirm tooltips work via tap (per Phase 4-E) and sliders are usable
      by touch drag.
- [ ] **Security/response-header pass (added 2026-07-13, capexiq-prebuild-assurance
      PBA-9 — this whole bullet was previously missing from Phase 10 entirely, so
      nothing forced anyone to actually check headers before calling go-live QA done):**
      create a Cloudflare Pages `_headers` file (or equivalent dashboard config) and
      fetch the live site's actual response headers, confirming:
      - a `Content-Security-Policy` tailored to the app's real script/style/font/
        image/connect needs (built from the actual Phase 7/8 dependency list — chart
        library, export libraries — not written blind ahead of time);
      - `frame-ancestors` (or an equivalent legacy `X-Frame-Options`) for clickjacking
        protection;
      - `X-Content-Type-Options: nosniff`;
      - a deliberate `Referrer-Policy` (not the browser default);
      - a least-privilege `Permissions-Policy`;
      - HTTPS/HSTS enforced at the domain level;
      - a sane cache policy distinguishing HTML (short/no-cache) from hashed static
        assets (long-cache, immutable);
      - no production source maps exposed (check `/_next/` for `.map` files after a
        production build).
      Verify by fetching headers directly (e.g. `curl -I`), not by console silence —
      a missing header doesn't throw a console error.
**Definition of Done:** the edge-case list has been exercised on the real deployed URL,
not just asserted by unit tests, and the security/response-header pass above shows a
deliberately configured policy, not host defaults.

---

## Not yet in this plan (flagged, not forgotten)

SPEC.md §38 named two artifacts this build plan didn't originally replace:
`ux-product-spec.md` (v0.4) and `financial-model-spec.md` (v0.5). Both are now written
and approved by Jay — `financial-model-spec.md` on 2026-07-07 (see Phase 2/Phase 9
above), `ux-product-spec.md` on 2026-07-11 (see Phase 4 above). Neither is missing any
longer. `content/inputs-metadata.json`'s per-field validation contract, initially
deferred to Phase 5, was also completed 2026-07-11 (same session) — **Phase 4 is now
fully closed**, all four Definition of Done items checked.

Resolved since the 2026-07-07 gap-analysis pass: the "doctor's cut" question
(`ISSUES.md` ISS-11) — confirmed with Jay it's the existing professional/reporting fee
field, no new field needed, no Phase 3/4 copy or validation-metadata work required for
it. Also resolved 2026-07-11: SPEC.md §36.1 Q9 (methodology page — yes, separate page)
and Q14 (entry flow, finalized), and §26.1's CTA wording ("Start Assessment"). **Note:**
the previous version of this line claimed Q5/Q7/Q11/Q13 were still open — checked
against SPEC.md §36.1 directly during the Phase 5 pass (2026-07-11) and all four are
already annotated "Resolved" there; this was itself stale doc drift, corrected here.
Still genuinely open, confirmed against SPEC.md §36.1 directly: **Q1** (login or fully
open — v1 has no login, this doc's own Phase 5 draft-persistence design at
`app/forms/wizard-state.md` §7 assumes no accounts), **Q2** (save scenarios locally or
in a DB — same assumption), **Q3** (shareable scenario link), **Q8** (multi-equipment
packages, explicitly v2 scope per SPEC.md §9). §36.2's remaining data questions other
than DSCR/discount rate are untouched by this pass, same as before.
