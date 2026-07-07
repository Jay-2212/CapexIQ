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
`data-requirements.md` §14's starter assumptions table plus whatever the next research
pass returns (see ISSUES.md ISS-9 — a prior pass invented several of these numbers
instead of researching them, and they were stripped back to `null` on 2026-07-06).
**Depends on:** nothing to start the already-sourced fields — can begin immediately.
The genuinely-gap fields (usage/day, billed tariff, launch delay, discount rate, target
IRR — see ISS-9) depend on the next deep-research pass landing in
`data-requirements.md` before they can be filled without inventing numbers again.
**Parallelizable:** yes, freely — pure data, no shared state, can even split by
equipment type across sessions.
**Do:**
- [ ] For each of `mri.json` / `ct.json` / `cath-lab.json` / `dialysis.json` /
      `ultrasound.json` / `custom.json` / `common-assumptions.json`, fill every field
      from §14 (and the next research pass once it lands), keeping the `confidence` /
      `sourceId` columns intact.
- [ ] Where no research value exists, leave the field `null` **and** note why in the
      file's own `_status` field — don't invent a number (SPEC.md §24/§36,
      `INTRODUCTION.md` rule 5, ISSUES.md ISS-9).
- [ ] Reconciliation check: before marking this phase done, confirm
      `content/inputs-metadata.json` still contains zero numeric defaults (it should
      only have `controlType`/`unit`/slider bounds/tooltip copy, per its `_note` field)
      — if a future edit reintroduces a hardcoded default there, that's the same bug
      class as ISS-9 recurring.
- [ ] Add a small schema-validation test (or script) so a malformed/missing field fails
      loudly instead of silently reaching the UI later.
**Definition of Done:** every field is either populated (with confidence/sourceId) or
explicitly and visibly marked unresearched; nothing is silently null, and no numeric
default has leaked back into `inputs-metadata.json`.

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
- [ ] Implement against the exact formula text in SPEC.md §31 (or the cited section for
      files not in §31, like `emi.ts`/§19, `maintenance.ts`/§20, `launchDelay.ts`/§16).
- [ ] Add `/tests/formulas/<name>.test.ts` with 3 cases minimum: a clean round-number
      case, a realistic messy-number case, and one edge case (zero usage, zero discount
      rate, 100% realization, etc. — whatever's the meaningful boundary for that
      formula).
- [ ] No `any`, no reimplementing a formula that already exists elsewhere.
**Definition of Done:** every function in `/formulas` has real logic and a passing test
file; `npm test` is green.

---

## Phase 3 — Content and copy

**Goal:** Write the real text for `report-templates/methodology.md`,
`report-templates/disclaimer.md`, `report-templates/formula-appendix.md`,
`content/field-explanations.md`, `content/benchmark-notes.md`, `content/glossary.md`,
`content/tooltip-copy.md`.
**Depends on:** Phase 2 for `formula-appendix.md` (needs the real formulas to document
accurately) and `methodology.md`; the rest can start immediately.
**Parallelizable:** yes, fully — no file overlap with any code phase, safe to run
alongside Phase 1 and Phase 2.
**Do:**
- [ ] `disclaimer.md` — real, careful wording that outputs are estimates from
      user-entered assumptions, not financial advice. This blocks launch per
      `DIRECTORY.md`/`ISSUES.md` — don't leave it as a placeholder past this phase.
- [ ] `glossary.md` — every term used in `formula-appendix.md` and the tooltip copy
      needs an entry; no orphaned jargon.
- [ ] `tooltip-copy.md` — keyed by field name, matching whatever fields Phase 5's
      wizard-state.md ends up defining (coordinate, or do this after Phase 4).
**Definition of Done:** no file in `/content` or `/report-templates` still says
"placeholder, not yet written."

---

## Phase 4 — Interactive state design (do not skip; do not start Phase 5/6 without this)

**Goal:** Write `app/forms/wizard-state.md` — *before* writing any form or dashboard
component — covering **two coupled state machines** that both drive the same
sliders/charts/tooltips UX (the thing actually asked for: sliders that auto-update
charts in real time, plus click-to-open tooltips):

- **Part A — the 7-step wizard flow** (SPEC.md §7): step navigation, validation,
  persistence.
- **Part B — live-recalculation state**: every slider (in the wizard *and* in Phase 6's
  dashboard Advanced settings pane) triggers a formula re-run and a chart/gauge
  re-render. An earlier version of this plan split Part B's concerns into Phase 6 as a
  freeform bullet list, which silently exempted it from the rule below — consolidated
  here instead so one design covers both.

This is the phase that exists specifically to prevent the extension-timer bug class
(see `CONVENTIONS.md` §1) — Part B matters just as much as Part A here, since
click-drag-recompute is exactly the kind of stateful flow that rule is about.
**Depends on:** SPEC.md §7/§10/§11 (wizard) and §21/§25.5 (dashboard live-editing) —
already written. Also depends on `content/inputs-metadata.json` (post ISS-9 cleanup)
being the settled UI/control schema, since it defines which fields are sliders vs.
input boxes — do not start this phase while that file is still in flux.
**Parallelizable:** no — this is a single coherent design; one session should own it
start to finish so both tables stay internally consistent with each other (they share
state, per the bullet below on write-back).
**Must enumerate, explicitly, in the doc — Part A (wizard):**
- [ ] Every step, every field in that step, its validation rule, and its control type (sliders vs. static input boxes) referencing [inputs-metadata.json](file:///Users/jay/Documents/Roi_Calculator/content/inputs-metadata.json).
- [ ] What Basic → Advanced → Basic toggling does to already-entered Advanced-only
      values (decision: they persist in memory even while hidden, never silently
      dropped).
- [ ] What happens on browser back/forward through wizard steps.
- [ ] What happens on refresh mid-wizard (is there draft persistence? If yes to
      `localStorage`, define the schema and a version field so a future format change
      doesn't crash on old saved drafts).
- [ ] What happens if the tab is backgrounded and returned to mid-calculation or
      mid-export — nothing should silently stop, double-fire, or desync (this is the
      exact class of bug that shipped before).
- [ ] Whether step submission is idempotent (double-click "Next" doesn't double-submit
      or skip a step).
**Must enumerate, explicitly, in the doc — Part B (sliders → live recalculation → charts):**
- [ ] Recompute trigger: fire on every slider `input` event (recomputes while dragging)
      or only on release/`change`? If drag-live, specify a debounce/throttle interval —
      state explicitly why, since this is a real perf-vs-snappiness tradeoff, not a
      default to leave implicit.
- [ ] Which fields recompute inline during the wizard (live preview of a step's impact)
      vs. which only exist on the Phase 6 results dashboard's Advanced settings pane
      (Discount Rate, Target Hurdle IRR, Financing Interest Rate) — list both sets.
- [ ] Whether editing a value in the dashboard's Advanced settings pane writes back into
      the same wizard-state store the user came from (so reopening the wizard shows the
      edited value) or is separate dashboard-only state — decide one, explicitly, and
      say why (recommendation: same store, consistent with the Basic/Advanced
      never-silently-drop rule above).
- [ ] Determinism: rapid, out-of-order slider moves cannot produce a stale or
      inconsistent chart — name the mechanism that prevents it (e.g. always recompute
      from the latest full state snapshot, never from a captured closure).
- [ ] Tooltip popover state: exactly one popover open at a time; opening a new one
      closes the previous; outside-click/Escape/re-clicking the same trigger closes it.
      Name the single source of truth (e.g. `openTooltipId: string | null`) so Phase 5
      and Phase 6 don't each invent separate tooltip-visibility state.
**Definition of Done:** the doc exists, both Part A and Part B are covered with a
concrete answer for every bullet above (not "TBD"), and has been read back by whoever
will implement Phase 5 and Phase 6.

---

## Phase 5 — Wizard UI implementation

**Goal:** Build `app/forms/`, `app/advanced/`, and the step-navigation shell in
`app/components/`, implementing exactly what Phase 4 Part A specifies, and using the central input registry in [inputs-metadata.json](file:///Users/jay/Documents/Roi_Calculator/content/inputs-metadata.json).
**Depends on:** Phase 4 (both parts must exist first — Part B's slider/recompute
mechanism is shared code the wizard's live preview also uses), Phase 2 (forms need real
formulas to validate against/preview live results).
**Parallelizable:** no — single reducer, single source of truth for wizard state; two
agents editing it at once is exactly the coordination failure `CONVENTIONS.md` §7 warns
about.
**Do:**
- [ ] One `useReducer` (or equivalent single state container) for all wizard state — no
      parallel `useState` calls for the same data scattered across step components.
- [ ] Render input elements dynamically using the metadata in `inputs-metadata.json` (rendering range sliders for operational values and input boxes for precise figures). Pull the actual default *value* for each field from `equipment-data/<type>.json` or `equipment-data/common-assumptions.json` per that field's `defaultSource` — never hardcode a number in the component.
- [ ] Implement custom-styled range sliders using the design variables specified in SPEC.md §25.5.A, wired to the recompute trigger/debounce mechanism Phase 4 Part B specifies.
- [ ] Implement click-to-open tooltip callouts (using CSS Popover API or relative dialog absolute rendering) containing the professional definition, default value (or an explicit "no benchmark available" note where `equipment-data` has `confidence: "Unavailable"`), and higher/lower impact, based on `inputs-metadata.json` tooltip schemas and the single `openTooltipId`-style state Phase 4 Part B defines. Hover behavior is disallowed.
- [ ] A test file that runs every transition in `wizard-state.md`'s table (Part A and
      Part B), with test names matching the plain-language scenario (e.g. `"back button
      after a validation error does not clear other steps"`, `"dragging the usage-per-day
      slider updates the break-even chart without a stale value"`).
- [ ] Every edge case bullet from Phase 4 has a corresponding passing test — this is the
      concrete, checkable fix for "stop button didn't stop, resume didn't work."
**Definition of Done:** every Phase-4-enumerated edge case (both parts) has a named, passing test.

---

## Phase 6 — Results dashboard and charts

**Goal:** Build `app/results/` and `app/charts/` — Investment Outlook score, metric
cards, break-even chart, cumulative cash-flow chart, risk callouts, narrative summary
(SPEC.md §21, §27, §30) — plus the Advanced settings pane, implementing exactly what
Phase 4 Part B specifies (this phase no longer invents its own live-recalculation
behavior; Phase 4 is where that got decided).
**Depends on:** Phase 2 (formulas), Phase 4 Part B (live-recalculation state design),
and Phase 5 (wizard output to render).
**Parallelizable:** yes, alongside Phase 7 — disjoint files, both just consume
`/formulas` output.
**Do:**
- [ ] Pure presentational components driven by formula output — no calculation logic
      inline here (per `CONVENTIONS.md` §3).
- [ ] Include an **Advanced settings pane** (accordion or drawer) allowing users to edit
      Discount Rate, Target Hurdle IRR, and Financing Interest Rate — using the same
      slider/recompute-trigger mechanism and write-back decision Phase 4 Part B defines,
      not a separately invented one.
- [ ] Since Discount Rate and Target Hurdle IRR currently have no sourced default
      (`equipment-data/common-assumptions.json`, confidence `Unavailable` — see ISSUES.md
      ISS-9), the pane must visibly prompt the user to set these rather than silently
      showing a blank or a number that looks authoritative.
- [ ] Visual QA pass across at least 3 equipment types spanning strong/moderate/risky
      outcomes — dashboards are easy to get "technically correct but visually broken"
      for edge values (very large/very small numbers, 0% and 100% cases).
**Definition of Done:** dashboard renders correctly (numbers and layout both) for the
full range of Investment Outlook outcomes, and every edge case from Phase 4 Part B that
applies to the dashboard (recompute determinism, tooltip state) has a named passing
test — not just "dynamic parameter edits trigger real-time recalculations" asserted
informally.

---

## Phase 7 — Exports (Excel / Word / ZIP)

**Goal:** Implement `exports/excel-generator.ts`, `exports/word-generator.ts`,
`exports/zip-generator.ts` per SPEC.md §29, using `report-templates/` content and the
`/formulas` engine — never a second copy of any formula.
**Depends on:** Phase 2 (formulas), Phase 3 (report-templates content).
**Parallelizable:** yes, alongside Phase 6.
**Definition of Done:** an exported Excel/Word file reflects the exact same numbers
shown on the dashboard for the same inputs — verify this explicitly, side by side, not
just "it exports without an error."

---

## Phase 8 — Scenario comparison / sensitivity

**Goal:** Real implementation of `formulas/sensitivity.ts` plus whatever UI SPEC.md §28
calls for to compare scenarios side by side.
**Depends on:** Phase 2, Phase 5.
**Definition of Done:** running the same scenario twice with identical inputs produces
identical output (determinism check) — sensitivity/scenario code is the most likely
place for an accidental hidden-state bug to hide.

---

## Phase 9 — Deploy and go-live QA

**Goal:** Once Cloudflare Pages + DNS is wired up (see the Cloudflare setup steps given
separately — this is infra, not code, so it's not a numbered code phase, but it gates
this one), do a final manual pass **on the actual deployed site**, not just localhost.
**Do:**
- [ ] Re-run every edge case from Phase 4's `wizard-state.md` manually in a real
      browser against the live `capexiq.jaybharti.me` URL — unit tests don't catch
      everything real tab-switching/refresh/mobile-viewport behavior can.
- [ ] Confirm the OG image renders correctly when the URL is shared (paste the link
      into a chat app or use a link-preview debugger).
- [ ] Confirm favicon shows correctly across at least two browsers.
- [ ] Mobile viewport pass — the wizard is the highest-risk surface for this.
**Definition of Done:** the edge-case list has been exercised on the real deployed URL,
not just asserted by unit tests.

---

## Not yet in this plan (flagged, not forgotten)

SPEC.md §38 also names two artifacts this build plan doesn't replace:
`ux-product-spec.md` (v0.4 — detailed screens/IA/field labels beyond what SPEC.md §10-11
already gives) and `financial-model-spec.md` (v0.5 — a fuller formula/test-case spec
than SPEC.md §31 alone). Neither has blocked any phase above since SPEC.md already has
enough detail to start, but write one if a phase's SPEC.md section turns out to be too
thin to implement against directly.
