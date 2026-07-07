# CONVENTIONS.md — how code gets written here

`SPEC.md` says *what* the product does. `DIRECTORY.md` says *where* things are. This
file says *how* to write and edit code here so that any agent — or a different agent
than the one who wrote it — can pick up any single file and understand it without
reading the whole app first. If you're about to write a formula, a component, or a
test, read this first. It's short; there's no excuse to skip it.

Core motto: **agent-friendly first.** Every rule below exists because it makes a file
easier for an agent with a limited, resettable context window to read, trust, and edit
correctly — not because it's "best practice" in the abstract.

---

## 1. Why this file exists — the lesson it's built from

A past project (a browser extension with a session timer) shipped with the stop button
not respected, and resume breaking after a tab switch. The root cause wasn't a typo —
it was that the timer's state (running / stopped / paused, and what happens on tab
visibility change) was never written down as an explicit list of states and
transitions before the UI was coded. Each button handler mutated ad-hoc variables
directly, so "what happens if you click stop, then switch tabs, then come back" was
never a question anyone asked until a user hit it.

The rule this produces:

**Any stateful flow (multi-step wizard, anything with start/stop/pause/resume, anything
that persists across a tab switch or a refresh) must have its states and transitions
written down in a plain-language table *before* it's implemented — and every edge case
in that table becomes a test, not an afterthought.** See `agent-build-plan.md` Phase 4
for exactly where this applies in this project (the input wizard) and what the edge-case
list already looks like.

If you're building something stateful and you don't have a transition table yet, stop
and write one first. It's cheaper than debugging it after the fact.

---

## 2. File and folder rules

- **One concern per file.** Each `/formulas/*.ts` file owns one calculation concept
  (revenue, DSO, break-even, etc.) — not a grab-bag `utils.ts`. If you're adding a
  function that doesn't fit an existing file's concept, it gets a new file, not a spot
  in an unrelated one.
- **Keep files short.** If a component or module is pushing past ~150-200 lines,
  that's a signal to split it, not a target to hit. A file an agent can read in one
  pass without truncation is worth more than a "clever" consolidated one.
- **Every folder gets a README** (already the convention — see `equipment-images/
  sources.txt`, `app/forms/README.md`, etc.). State what belongs there and what doesn't.
  If you add a new top-level folder, it needs one before the session ends.
- **Naming:** `.ts`/`.tsx` files and functions are camelCase (`breakEven.ts`,
  `runScenario`), React components are PascalCase, folders are kebab-case, content/data
  files are kebab-case `.md`/`.json`.

---

## 3. Dependency direction (don't violate this)

```text
app/ (UI)  --->  formulas/  --->  (nothing; formulas depend on nothing in this repo)
app/ (UI)  --->  equipment-data/ (read-only data)
app/ (UI)  --->  content/inputs-metadata.json (read-only field contract — see below)
exports/   --->  formulas/  (same engine as the dashboard, never reimplemented)
content/   --->  (nothing; it's copy, not logic)
```

- `/formulas` functions are pure: given the same inputs, always the same output, no
  reading from the DOM, no fetch, no global state, no side effects. This is what makes
  them independently testable and independently readable — an agent can understand
  `npv.ts` without opening any other file.
- The dashboard, the charts, and the Excel/Word exports must all call the *same*
  `/formulas` functions. If you're about to write a calculation inline inside a
  component or an export generator, stop — it belongs in `/formulas`, with a test.
- `/equipment-data` and `/content` are data, not code. Nothing in there should contain
  logic; if you find yourself writing a conditional inside a `.json` consumer that only
  exists to work around a data-shape problem, fix the schema instead.
- `content/inputs-metadata.json` (per `agent-build-plan.md` Phase 4) is the single
  source of truth for every wizard field's type, numeric bounds, and validation error
  copy. It's consumed read-only by the wizard's validation logic, the tooltip display,
  and the Excel export's cell formatting — never let any of those three redefine a
  bound independently; if a bound needs to change, change it there and only there.

---

## 4. Typing rules

- No `any`. Every `/formulas` function has explicit parameter and return types (see the
  existing stubs for the pattern — interfaces like `PayerMixEntry`, `ScenarioResult`
  live next to the function that uses them, not in a shared `types.ts` dumping ground
  unless genuinely shared by 3+ files).
- Prefer a few small named interfaces over one big options object — easier for an agent
  to see which fields a given function actually touches.

---

## 5. Tests

- Every `/formulas` function gets a test file in `/tests/formulas` before it's
  considered done — not "implement now, test eventually." Minimum: one simple
  round-number case, one realistic messy-number case, one edge case (zero, negative
  where relevant, or a boundary value).
- Every stateful UI flow (see §1) gets one test per transition in its transition table,
  named after the scenario in plain language (e.g. `"toggling advanced mode off then on
  preserves entered values"`), so a failing test tells you what broke without needing to
  read the test body first.

---

## 6. Definition of Done (applies to every phase in `agent-build-plan.md`)

A phase isn't done when it compiles. It's done when:

- [ ] `npm run build` succeeds with no type errors.
- [ ] Every new `/formulas` function has a passing test covering the 3 cases in §5.
- [ ] Every new stateful flow's edge cases (from its transition table) have passing
      tests — not just the happy path.
- [ ] No formula logic got duplicated between the dashboard, charts, and exports.
- [ ] `HANDOFF.md`'s Current State is overwritten and a new Change Log entry added.
- [ ] Anything you noticed but didn't fix is logged in `ISSUES.md`.

---

## 7. Working in parallel (multiple agents/sessions at once)

This already happened once in this project (a docs/design session and a code session
ran concurrently and briefly disagreed about whether there were one or two repos — see
`ISSUES.md` ISS-7). To make parallel work safe rather than a source of merge conflicts:

- **Formula files are the safest thing to parallelize** — each one is independent, no
  shared state, disjoint files. Multiple agents can implement different `/formulas/*.ts`
  files simultaneously with no coordination needed.
- **Content/copy (`/content`, `/report-templates`) can always run in parallel with code**
  — no file overlap, no shared state, ever.
- **Don't parallelize within a single stateful flow** (e.g. two agents both editing the
  wizard reducer at once) — that's exactly the kind of thing that produces silent gaps.
  One flow, one agent, start to finish, transition table written first.
- Whichever session finishes last before a shared doc (`HANDOFF.md`, `ISSUES.md`) is
  pushed should re-read it fresh immediately before editing — don't assume it still says
  what it said when your session started.
