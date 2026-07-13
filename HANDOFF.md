# HANDOFF.md — current state + change log

This is the in-house log book. Two parts: **Current State** (always overwritten, never
appended — reflects right now) and the **Change Log** below it (append-only, most recent
entry first).

If you only read one section, read Current State. Read the log if you want the history
of *how* we got here.

---

## Current State

*(Last updated: 2026-07-13)*

**Planning is done, and now doubly audited. Phases 1-5 of `agent-build-plan.md` are
complete; two independent audits both ran against them this week —
`$capexiq-ui-assurance` (Phases 4-5, nine findings) and `$capexiq-prebuild-assurance`
(whole-model/schema/security, thirteen findings) — and every finding from both is
resolved. Phase 6 (wizard UI implementation) is next, and is pure build from here —
`/app` is still skeleton (`layout.tsx`/`page.tsx`/empty-scaffold READMEs), no real UI
exists yet.**

- **Phases 1-5:** complete, merged into `main` as of 2026-07-12 (equipment data,
  formula engine, content/copy, design/UX, wizard-state). See prior Change Log entries
  for detail — unchanged this session except where noted below.
- **`$capexiq-ui-assurance` planning audit run and resolved, 2026-07-12** — nine
  findings against Phases 4-5, seven fixed directly, two (`targetIrr`'s required flag,
  `localStorage` multi-tab/shared-device behavior) decided by Jay with an Opus-advisor
  second opinion first. See the Change Log entry below.
- **`$capexiq-prebuild-assurance` audit run 2026-07-13, then acted on in full the same
  session** — thirteen findings (PBA-1 through PBA-13), all fixed; the one genuine
  product-judgment call (Basic Mode's AMC/CMC default-source formula, ISS-16) was
  confirmed by Jay same session and is closed. **This session also discovered, at
  merge time, that the two audits' branches had run in parallel and collided on
  overlapping findings** (both independently caught the `targetIrr`-blocks-Basic-Mode
  defect and the false discount-rate-`Unavailable` claim) — reconciled by hand,
  deferring to whichever session's resolution was more complete rather than keeping
  both; see the Change Log entry below for the full reconciliation record.
- **Both project-local audit skills remain available** for Phase 6-implementation/
  browser/release QA.

**Repo hygiene, 2026-07-12 (unchanged, kept for continuity):** all stray git worktrees
and fully-merged branches removed; `npm test` corrected to 65/65 (now 109/109 after
this session's golden-scenario additions — see below); `ISSUES.md`/`DIRECTORY.md`
brought current.

**Open product idea, not built:** an onboarding-flow concept (hero page → "Start
Assessment" CTA → equipment/bed-count pre-step → wizard) is already designed into
`design/ux-product-spec.md` and `app/forms/wizard-state.md` — this is now a Phase 6
build target, not an open question.

**Nothing open going into Phase 6.** `ISSUES.md`'s Open section is empty — every
finding from both audits (including the ISS-16 renumbering from the merge
reconciliation above) is Accepted or Resolved.

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

### 2026-07-13 — Pre-build audit run, all 13 findings fixed, then reconciled against a parallel UI-assurance audit session at merge time
**What changed:** Jay asked to run `$capexiq-prebuild-assurance` (audit-only), then —
after reviewing the resulting 13 findings — asked to fix all of them in one session,
using a three-layer decision process: small judgment calls decided directly, bigger
ones sanity-checked by an Opus advisor sub-agent, and anything the advisor flagged as a
genuine product-judgment call escalated to Jay with concrete options.
1. **Audit findings (PBA-1 through PBA-13):** whole-model/schema-contract correctness,
   golden scenarios, browser storage/privacy, and static-host deployment gaps — full
   detail in the audit conversation, not duplicated here. Two confirmed schema-shape
   defects stood out: `warrantyYears`/`cmcYears`/`installationAndAncillaryCostPercentage`
   used inconsistent `{value}` vs. `{low,typical,high}` shapes across the 5 real
   equipment files (PBA-1), and `equipment-data/custom.json` stored several fields as
   bare `null` instead of the same nested-object shape as the other 5 files — which
   would throw a TypeError the first time generic tooltip/default-population code
   touched Custom equipment (PBA-2).
2. **7 findings fixed directly** (no advisor needed — mechanical, one clear answer):
   normalized equipment-data shapes (PBA-1); reshaped `custom.json` + removed dead
   `financingNorms`/`workingDaysPerMonth` fields the ISS-13 cleanup had missed (PBA-2);
   corrected a false claim in `design/ux-product-spec.md` §6 that discount rate was
   `Unavailable` (only target IRR is — the same false-"unresearched" failure class
   ISS-9 already caught once, in a different file) (PBA-6); added the missing
   response-header/CSP/HSTS/source-map checklist to `agent-build-plan.md` Phase 10,
   which previously had zero security verification items (PBA-9); documented
   `localStorage` quota/private-mode-failure behavior in `wizard-state.md` §7.3,
   previously unspecified (PBA-13); flagged `targetIrr`'s `required: true` with no
   sourced default as a real defect (PBA-5) — **superseded at merge time, see item 6.**
3. **Opus advisor consulted on 5 items** (PBA-3, PBA-4, PBA-7, PBA-8, and golden-scenario
   scope) — 4 of 5 resolvable by engineering reasoning alone, implemented directly:
   - **PBA-3 (DSO-extended cash-received array):** confirmed by direct computation
     (not just code-reading) that `cashReceivedByMonth()`'s output must never be
     truncated to the original projection-horizon length before summing into NPV/
     working capital — doing so silently turns a temporary collection delay into what
     looks like a permanent revenue loss (measured ₹15,00,000 phantom loss in a test
     scenario). Documented as a hard contract in `SPEC.md` §14.4 and
     `report-templates/formula-appendix.md` §1.4.
   - **PBA-7 (Infinity vs. null "no payback" sentinels):** advisor initially suggested
     unifying `paybackPeriod()`'s `Infinity` and `discountedPaybackPeriod()`'s `null`
     into one sentinel — checked this against `formulas/actionableInsight.ts`'s actual
     arithmetic (`baselinePaybackYears − scenarioPaybackYears`) and found unifying to
     `null` would silently break it (`null` coerces to `0` in JS arithmetic, producing
     false-positive tariff-increase suggestions) — **overrode the advisor's specific
     suggestion** and kept both sentinels, documenting the divergence and the
     `JSON.stringify(Infinity) === "null"` serialization hazard instead
     (`formula-appendix.md` §4.6, `agent-build-plan.md` Phase 6).
   - **PBA-8 (localStorage privacy disclosure):** added the advisor-drafted copy to
     `content/field-explanations.md`, distinct from the export-facing
     `report-templates/disclaimer.md` — **wording later reconciled to the
     `$capexiq-ui-assurance` audit's own copy at merge time, see item 6.**
   - **Golden scenarios (PBA-10/11):** built 4 scenarios (not the audit's originally-
     suggested 8), each engineered to multiplex several requirements at once per the
     advisor's suggestion — see item 4 below.
4. **PBA-4 (Basic Mode AMC/CMC + missing `cmcYears` field) — architecture implemented
   directly, one number left open for Jay.** Added `cmcYears` as an Advanced Group E
   field (was a required `formulas/maintenance.ts` parameter with no wizard field
   anywhere). Basic Mode now explicitly documented as collapsing the CMC-then-AMC
   schedule into one flat post-warranty rate. The advisor flagged the *default-source
   formula* for that flat rate as a genuine product call (CMC is pricier than AMC, so
   defaulting from AMC alone would systematically understate cost) — implemented
   Option A (a duration-weighted blend) as the working default, marked
   `"PROVISIONAL pending confirmation"` in `content/inputs-metadata.json`. **Jay
   confirmed Option A directly after the PR opened** — `PROVISIONAL` language removed,
   logged as `ISSUES.md` ISS-16 (see item 6 for the renumbering).
5. **Built `tests/scenarios/`** (previously an empty scaffold) — 5 files, 44 new tests,
   independently hand/Python-derived (never from `/formulas` itself): a simple cash
   purchase crossing the warranty→CMC→AMC transition; a financed purchase with a 3-way
   payer mix and DSO (doubles as the PBA-3 regression test, including the exact
   ₹32,04,000 truncation-hazard number, and the PBA-11 three-ROI-views test); a
   non-viable case at the minimum 1-year useful-life horizon (undefined IRR, `Infinity`
   payback) plus a standalone negative-contribution-margin edge case; a Custom-equipment
   regression test for PBA-2's schema fix; and exact Investment Outlook band-boundary
   tests (75/55/35) plus `financial-model-spec.md` §1.7's worked example reproduced
   exactly. One arithmetic error caught and fixed mid-session by re-deriving in Python
   before trusting a hand-computed number.
6. **Merge-time discovery: this branch and PR #13's `$capexiq-ui-assurance` audit
   branch had run in parallel and collided.** Rebasing onto `main` after PR #13 merged
   surfaced real conflicts, not just git mechanics — both sessions independently found
   and fixed the *same* `targetIrr`-blocks-Basic-Mode defect (this session's PBA-5 vs.
   their F1/ISS-14) and the *same* false discount-rate-`Unavailable` doc claim (PBA-6
   vs. their bonus doc-drift catch), and both used "ISS-14" for their own next-available
   issue number. Reconciled by hand rather than blindly keeping one side: deferred to
   PR #13's `targetIrr` resolution (an auto-filled, labeled heuristic default — more
   complete than this session's simpler `required: false`, since it keeps the field
   semantically meaningful instead of just giving up on requiring it) and to a merged
   discount-rate correction combining both write-ups (PR #13's fix plus this session's
   additional finding that `purchaseCost`/`usagePerDay`/`billedTariff`/`launchDelay`
   have the identical null-default gap for several equipment types, which PR #13 didn't
   cover). PR #13's `wizard-state.md` §7.3 (multi-tab conflict banner + shared-device
   disclosure) and this session's §7.3 (storage-write-failure handling) covered
   genuinely different parts of the same gap — merged into one three-part section
   rather than picking one. This session's `ISSUES.md` ISS-14 (AMC/CMC default-source)
   renumbered to **ISS-16** to stop colliding with PR #13's already-published ISS-14/
   ISS-15. `content/field-explanations.md`'s independently-drafted privacy-disclosure
   copy reconciled to PR #13's exact wording (one source of truth, not two drafts of
   the same sentence).
**Files touched:** `equipment-data/mri.json`/`ct.json`/`dialysis.json`/`ultrasound.json`/
`custom.json`, `content/inputs-metadata.json`, `content/field-explanations.md`,
`content/tooltip-copy.md`, `design/ux-product-spec.md`, `SPEC.md`,
`report-templates/formula-appendix.md`, `agent-build-plan.md`, `app/forms/wizard-state.md`,
`ISSUES.md` (ISS-16 added/resolved, ISS-14/ISS-15 cross-referenced), `tests/scenarios/*`
(5 new files + README), `HANDOFF.md`, `DIRECTORY.md`, `INTRODUCTION.md` (reading-order
clarification, unrelated to the audit — see the pointer below). No `/formulas` file
touched — every fix was a data/contract/doc correction or a new test, never a change to
already-tested calculation logic.
`npm test` 109/109 (65 original + 44 new), `npx tsc --noEmit` clean, `npm run build`
clean — re-verified after the audit fixes and again after the merge reconciliation.
**Also this session, unrelated to the audit:** Jay asked to relax `INTRODUCTION.md`'s
reading order to keep the project genuinely context-efficient — only `INTRODUCTION.md`
and `CONVENTIONS.md` stay a hard mandate every session; `HANDOFF.md` must still be
*updated* before finishing but reading it is now framed as strongly recommended, not a
mandate on par with the first two; `DIRECTORY.md`/`ISSUES.md`/`agent-build-plan.md`/
`SPEC.md` are explicitly reference docs to consult when a task needs them, not a
checklist every session has to clear first.
**What's next:** Phase 6 (wizard UI implementation) — pure build from here. `ISSUES.md`'s
Open section is empty; every finding from both this audit and PR #13's is Accepted or
Resolved.

### 2026-07-12 — Ran `$capexiq-ui-assurance` planning audit against Phases 4-5; all nine findings resolved before Phase 6
**What changed:** Jay asked to run the newly-added UI assurance skill against Phases
4-5 as a planning audit (no runtime yet, so pure doc/spec review), then implement
every fix the audit could make on its own judgment, and for anything requiring a real
product decision: draft options, get an independent second opinion from a stronger
model first (Opus, used as an "advisor" layer), then bring simplified options to Jay
as the final decision-maker — a three-layer process (Claude's judgment → advisor
model → Jay) Jay specified explicitly for this session.
1. **Audit produced 9 evidence-backed findings**, one P0 and four P1s, none of them
   requiring any change to the Signal visual design — full report given in the
   conversation this session came from (not persisted as a separate file, per this
   project's "don't duplicate content" rule; `agent-build-plan.md`'s Phase 4/5 DoD
   sections and `ISSUES.md` now carry the durable record instead).
2. **Seven findings fixed directly**, no product decision needed: F2 (no accessible
   data-table equivalent for charts — added to Phase 7's "Do" list), F3 (no
   `prefers-reduced-motion` handling for the micro-interaction spec — `ux-product-
   spec.md` §10), F4 (slider thumb below WCAG 2.5.8's touch-target minimum — added to
   Phase 6's "Do" list, visual size unchanged, only the hit-target padded), F6 (no
   focus-management rule for step change/route-guard redirect/draft restore-or-
   discard/inline tooltip expansion — new `wizard-state.md` §6.5), F7 (a disabled
   "Next" gave no clue which field was blocking it — `wizard-state.md` §2, now moves
   focus to the first invalid field on click), F8 (payer-mix group-sum errors weren't
   programmatically wired to the individual sliders — `wizard-state.md` §2, `aria-
   describedby`), F9 (no Indian number-formatting rule despite the explicit India-first
   premise — new `ux-product-spec.md` §10.5, `Intl.NumberFormat('en-IN')`, lakh/crore
   grouping, `-₹` for negatives, full-figure-in-exports rule).
3. **Two findings were genuine judgment calls, resolved with Jay directly after an
   Opus advisor pass:**
   - **F1/ISS-14 — `targetIrr` (Group F) was `required: true` with no sourced default,
     sitting inside the Advanced Mode panel that's collapsed by default.** Per
     `wizard-state.md` §2's own step-gate rule, this meant a Basic-Mode-only user
     could never reach `/results` without opening a panel they don't know exists and
     entering a number that, per two research passes, doesn't publicly exist anywhere
     for Indian hospitals — directly contradicting the product's Basic/Advanced
     premise. **Resolved:** auto-fill `targetIrr` with a computed `discountRate +
     400bps` heuristic (the midpoint of the range `common-assumptions.json` already
     suggested for exactly this case), shown with the same "Typical" tag every sourced
     default uses and a tooltip explicit that it's a suggestion, not research — the
     Investment Outlook score itself never consumed this field directly
     (`financial-model-spec.md` §1.6 uses `discountRate` as the hurdle), so nothing
     about the scoring model changed. Jay chose this over (a) the same auto-fill plus
     an extra one-click confirmation step on the results page, and (b) leaving it
     required-but-deferred to a prompt on `/results` instead of the wizard step.
   - **F5/ISS-15 — no multi-tab or shared-device behavior was defined for the wizard's
     `localStorage` draft.** Two tabs open on the same draft would each independently
     debounce-save to the same key with no cross-tab awareness — last save silently
     wins, the other tab's edits vanish with no warning; also nothing disclosed that
     the draft (hospital name, bed count, cost figures) persists indefinitely on a
     possibly-shared device. **Resolved:** a `storage`-event conflict banner ("updated
     in another tab — reload to see the latest version") plus explicit shared-device
     copy next to the existing "Start over" control. Jay chose this over (a) full
     real-time cross-tab sync via `BroadcastChannel` (both Claude and the Opus advisor
     flagged this as disproportionate engineering for a single-user v1 tool with no
     other client-side sync surface), and (b) a text-only warning with no actual
     conflict detection (flagged as too easy to miss to prevent real data loss).
4. **Bonus doc-drift catch, found while investigating F1:** `agent-build-plan.md`
   Phase 7 and `design/ux-product-spec.md` §6 both incorrectly grouped Discount Rate
   with Target IRR as "no sourced default, must visibly prompt" — Discount Rate
   actually has a real one (`typical: 12.5%`, Medium confidence, S22/S23, already in
   `common-assumptions.json`). Corrected in both places, plus the same stale pairing
   in `SPEC.md` §18.3 and §23.4, and `content/benchmark-notes.md`'s "why some fields
   show no default" example (swapped its Target-IRR example for inflation rate, which
   genuinely is still left blank, and added the Target-IRR heuristic exception
   underneath).
**Files touched:** `design/ux-product-spec.md`, `app/forms/wizard-state.md`,
`agent-build-plan.md`, `content/inputs-metadata.json`,
`equipment-data/common-assumptions.json`, `SPEC.md` (§18.3, §23.4),
`financial-model-spec.md` (§1.6), `content/benchmark-notes.md`, `ISSUES.md` (ISS-14,
ISS-15 added, both Resolved), `HANDOFF.md` (this entry + Current State). No `/app`,
`/formulas`, or equipment-specific `equipment-data/*.json` files touched — this was a
planning/spec-layer pass, consistent with Phase 6 not having started yet.
**What's next:** Phase 6 (wizard UI implementation) — pure build from here, against a
now-audited Phase 4/5 spec set. No open planning items remain blocking it.

### 2026-07-13 — Added project-local pre-build assurance skill
**What changed:** Created `.claude/skills/capexiq-prebuild-assurance/` after the UI
audit and its fixes were completed. The skill combines the remaining pre-build audit
surfaces into one disciplined pass: input/schema/formula/output traceability,
independently calculated golden scenarios, conditional model invariants, explicit
unit/time-basis checks, canonical-result consumption, browser-storage trust and
privacy, DOM/filename injection, spreadsheet/Word/ZIP export threats, dependencies,
and Cloudflare/static-host security controls. It distinguishes confirmed defects from
specification gaps, test gaps, future implementation gates, and accepted risks; it
does not edit files during the audit. Detailed matrices live in three progressive
references, with primary-source provenance in a fourth.

**Sources:** CapexIQ's current specs/contracts; OWASP HTML5/XSS/CSP/third-party-script
and spreadsheet-formula-injection guidance; official Next.js static-export and
Cloudflare Pages header documentation.

**Files touched:** `.claude/skills/capexiq-prebuild-assurance/` (new), `DIRECTORY.md`,
`HANDOFF.md`.

**What's next:** Run `$capexiq-prebuild-assurance` in audit-only mode, review and
accept/reject its evidence-backed findings, then consolidate accepted checklist edits
into `agent-build-plan.md` before Phase 6.

See handoff-archive/2026-Q3.md for entries before 2026-07-13.
