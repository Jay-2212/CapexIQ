# CapexIQ frontend experience audit — 2026-07-13

This is a live-browser review of the Phase 6 frontend at `localhost:3000`, requested
by Jay after using the product himself. It records the product/design problems found
and the redesign direction to pursue before treating the frontend as presentation-
ready. It does not change calculation logic, data contracts, or formula behavior.

## Verdict

The application is functionally credible but visually and experientially still feels
like an internal form/documentation prototype. The problem is not simply that it is
minimal. Good minimalism creates focus, rhythm, confidence, and a distinctive point of
view; the current UI mostly removes decoration without adding those qualities.

The strongest underlying assets are the calculation model, clear language, and honest
source discipline. The redesign should reveal that quality through a guided,
high-confidence assessment experience rather than presenting the schema almost
directly to the user.

## Browser evidence

The following routes and interactions were reviewed in the live app:

- `/`: landing page, header/footer links, hero, How it works, personas, and feature
  summary.
- `/methodology`: methodology narrative and formula appendix presentation.
- `/assess`: every equipment tile, the selected CT state, hospital context fields,
  validation, and an expanded More info section.
- `/assess/investment`: purchase/civil cost units, launch delay, acquisition mode,
  validation, and expanded source help.
- `/assess/usage`: utilization, tariff, and working-day controls.
- `/assess/costs`: all Basic operating-cost inputs, the Basic/Advanced transition,
  and all six Advanced groups.
- `/results`: a completed illustrative CT assessment and the current result summary.

## What is not working

### 1. The visual system is restrained but not elegant

- The landing page has large areas of uncomposed white space and little visual tension
  or depth. It reads as stacked content sections rather than one authored experience.
- The hero does not use equipment imagery meaningfully, so the first impression does
  not communicate the physical, high-stakes purchase the product helps evaluate.
- Repeated white panels, thin grey borders, small text, and the same slate action color
  make every element feel equally important.
- The current typography is serviceable but the layouts do not use scale, alignment,
  contrast, or editorial composition strongly enough to create character.
- The landing-page “What’s in the tool” section reads like implementation/release
  notes, including a promise about a later phase, rather than polished product copy.

### 2. The imagery does not build trust or identity

- Hospital Administrator and Operations Head / COO use different files but visibly
  show the same person. That makes the persona set look accidental.
- The How it works row uses a photo only for step 1; steps 2 and 3 are generic icon
  panels, which visually reads as missing imagery.
- The Cath Lab image is already documented as an approximation. Custom is correctly
  icon-only because no single photograph can represent it, but the icon treatment
  needs to look intentional rather than like a fallback.
- Browser inspection found no failed image requests. The issue is asset selection and
  art direction, not broken file loading.

### 3. The assessment mirrors a data schema instead of guiding a decision

- Required errors appear immediately on untouched fields, making a fresh assessment
  feel as if the user has already done something wrong.
- The equipment selection is a static card border change. CT does not enter the next
  scene, establish a visual context, or create a sense of progress.
- Hospital name is not collected. The opening context fields begin with bed count and
  city tier, so the assessment never feels personalized to the hospital.
- The wizard labels three broad steps, but each step is still a conventional vertical
  form. Operating Costs contains eight Basic fields before the Basic/Advanced choice.
- Sliders are paired with empty numeric inputs and error text, which makes the interface
  look unfinished rather than helpful when a value has no trusted default.
- The always-visible definition and “higher/lower is better” paragraphs add significant
  scroll length and make every question feel heavier than it is.

### 4. Money input is wrong for the India-first context

- Purchase cost and installation/civil cost are both forced into `INR (Crore)`.
- Civil/site-preparation work is often naturally estimated in lakhs, and even purchase
  quotes may be easier to enter in lakhs for smaller equipment.
- Users should be able to enter an amount with an adjacent Lakh/Crore unit selector.
  The application should normalize internally to one canonical unit so no formula
  signature needs to change.
- Currency inputs should format using Indian grouping while typing or on blur, while
  preserving an exact editable numeric value.

### 5. Help content exposes the repository

- Expanded More info content displays strings such as
  `equipment-data/<type>.json#purchaseCost`, `data-requirements.md §19`, and
  `capexiq-prebuild-assurance PBA-4`.
- The methodology page also mentions repository files, TypeScript functions, internal
  audit notes, sentinel behavior, and implementation history.
- This is useful developer documentation but poor product copy. It undermines the
  product’s authority by revealing scaffolding instead of translating provenance into
  a user-facing citation (“CGHS rate schedule”, “vendor quotation”, “your hospital’s
  registered bed count”).
- Field help should answer three questions in plain language: what to enter, how to
  estimate it, and why it matters. Detailed source provenance belongs in a compact
  source drawer or methodology reference, never as a repo path.

### 6. Advanced Mode is structurally overwhelming

- Opening Advanced Mode expands six full groups on the same already-long Operating
  Costs page.
- Payer mix alone repeats five controls for each of five payer types. This is a small
  spreadsheet embedded vertically in a form.
- Financing fields remain visible even for a Cash purchase, accompanied by explanatory
  copy saying they do not apply.
- Several advanced controls have unset sliders at their minimum visual position, which
  is ambiguous even though the underlying value is null.
- The mode transition is framed as “Open Advanced Mode” after a dense block rather than
  as a confident choice between a complete Basic result and optional refinement.

### 7. Methodology and Results are not product surfaces yet

- Methodology is a long article followed by an enormous formula appendix. Code blocks
  overflow horizontally and internal file/function names are shown to end users.
- Results is currently a technically correct list of metrics. The driver text exposes
  an internal identifier (`speedToPayback`) and there is no visual explanation,
  prioritization, or next action.
- Phase 7 will add dashboard content, but it should be designed against the same new
  experience language rather than layered onto the present form styling.

## Redesign direction: “Calm clinical intelligence”

The product should feel like a premium decision room for hospital operators: warm,
quiet, exact, and modern. Minimal, but not empty.

- Use a warm bone/beige page field, deep ink typography, and a restrained clinical
  blue-green accent. White becomes a deliberate raised surface, not the default for
  every region.
- Introduce one strong editorial composition per screen: a bold question, a focused
  input area, a relevant equipment visual, and a quiet live financial signal.
- Retain Indian financial clarity: lakh/crore controls, Indian digit grouping, plain
  explanations, and sources translated into recognizable names.
- Use motion to preserve context, not decorate it. Selecting CT should move or crop the
  CT image into the assessment shell while the next question fades/slides into place.
  Respect `prefers-reduced-motion`.
- Make the selected equipment and hospital identity persist subtly throughout the
  flow so the product feels like “Apollo Hospital’s CT assessment,” not a generic
  calculator.

## Proposed assessment architecture

Use one assessment shell that normally fits within a desktop viewport. Show one
decision, or at most two tightly related decisions, at a time. Preserve all existing
state and formulas behind the presentation layer.

1. **Choose equipment** — large visual selector. Selection animates the chosen asset
   into the shell and establishes the warm contextual background.
2. **Name the assessment** — “Which hospital is this for?” in large type; Hospital
   name, then Bed count + City/tier as one related pair. Hospital type can remain
   optional and secondary.
3. **Investment** — Purchase price with Lakh/Crore selector; Installation/civil cost
   with its own Lakh/Crore selector.
4. **Readiness** — Months before revenue + acquisition mode. Reveal loan/lease basics
   only when relevant.
5. **Demand** — Expected usage/day + billed revenue/use. Working days appears as a
   clearly marked suggested value that can be adjusted.
6. **Cost of delivery** — Consumables + professional fee, followed by staff + utility
   overhead. Optional “other” fields live behind an Add another cost action rather
   than occupying the main path by default.
7. **Maintenance** — Warranty and post-warranty maintenance, with the blended Basic
   assumption summarized in human language.
8. **Decision gate** — two explicit routes:
   - **Continue with Basic and see my result** — makes it clear that the assessment is
     complete and usable now.
   - **Refine in Advanced Mode** — explains the extra precision available and an
     estimated effort before entering it.

Advanced Mode should use a dedicated guided workspace, not expand under Basic fields:

- Overview cards for Payer mix, Ramp-up, Financing, Launch, Lifecycle, and Financial
  assumptions, each showing Complete / Suggested / Needs attention.
- Open one group at a time. Use branching so Cash hides loan/lease inputs entirely.
- Render payer mix as an editable table or allocation composer with a 100% total,
  instead of 25 repeated vertical fields.
- Keep a compact sticky summary showing the few assumptions that materially changed
  from Basic.
- Provide “Use Basic assumption” and “Reset this section” at group level.

## Help and validation pattern

- Do not show red validation on initial render. Show a neutral prompt first; validate
  after the field is touched or the user attempts to continue.
- Keep one short line below a field only when it genuinely helps answer it.
- Replace the repeated More info paragraphs with a small info action that opens a
  concise side sheet or anchored panel. Recommended sections: How to estimate, Why it
  matters, Source.
- Convert repo paths and audit history into user-facing source names. Keep technical
  traceability available only in a clearly separate expert/methodology layer.
- Avoid sliders when the range is extremely wide, precision matters, or no default is
  available. Use a formatted numeric input plus suggested-value chips/range context.

## Asset plan

- Replace either the Administrator or COO image with a clearly different subject and
  role-appropriate setting.
- Establish one consistent treatment for all five equipment visuals: similar crop,
  lighting, warmth, background behavior, and subject scale.
- Replace the Cath Lab approximation if a credible asset becomes available.
- Create a deliberate Custom illustration/icon tile using the same framing as the
  equipment set.
- Consider the `imagegen` skill for coherent, rights-safe persona/equipment-supporting
  visuals and background-safe cutouts. It should not decide page architecture; the
  React/CSS product design still needs to be authored in the repo.

## Implementation plan

### Phase A — Reframe before styling

- Update the UX product spec and wizard transition/state documentation for the new
  guided sequence, unit selectors, validation timing, Basic/Advanced decision gate,
  and hospital name.
- Define the canonical Lakh/Crore conversion boundary and tests before changing inputs.
- Produce desktop and mobile wireframes for the landing page, guided Basic flow,
  Advanced workspace, and results shell.

### Phase B — Build the new visual foundation

- Revise tokens for the warm surface palette, type hierarchy, larger spacing rhythm,
  elevation, and motion.
- Build reusable assessment-shell, question-stage, currency-input, contextual-help,
  and mode-choice components.
- Replace/sanitize persona and equipment assets.

### Phase C — Recompose the Basic experience

- Implement the new opening scene and hospital identity step.
- Split existing Basic fields across the guided stages without altering calculation
  inputs or formula signatures.
- Add Lakh/Crore unit selectors and Indian numeric formatting.
- Change validation to touched/continue-attempt timing and add transition tests.

### Phase D — Redesign Advanced Mode

- Move Advanced into its own structured workspace.
- Add group status, conditional financing fields, payer allocation UI, Basic-assumption
  fallbacks, and a changed-assumptions summary.

### Phase E — Make supporting surfaces coherent

- Redesign/sanitize Methodology into progressive disclosure: plain-language overview,
  calculation topics, and an optional formula/source reference.
- Build Phase 7 results/dashboard using the same visual language; translate internal
  driver IDs into human language and make the primary decision legible first.
- Rewrite landing-page depth copy as user benefit/capability, removing build-phase
  language.

### Phase F — Verify quality

- Browser-test the complete flow at desktop and mobile widths, with keyboard-only and
  reduced-motion settings.
- Test unit conversion, persisted drafts, Basic/Advanced transitions, conditional
  branches, touched validation, and refresh/deep-link behavior.
- Run the full test suite, typecheck, and production build, then perform a second live
  visual QA pass before calling the redesign complete.

## Priority order

1. Guided flow architecture and Lakh/Crore inputs.
2. Advanced Mode restructuring and user-facing help sanitation.
3. Landing-page art direction and asset replacement.
4. Methodology progressive disclosure.
5. Results dashboard visual build on the new foundation.

Do not spend time polishing the current long-form CSS before Phase A. Its information
architecture is the main source of the problem; styling the same structure more richly
would only make a better-looking long form.
