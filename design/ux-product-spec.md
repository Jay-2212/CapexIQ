# design/ux-product-spec.md — CapexIQ UX/UI Product Spec (v0.5)

This is the `design/ux-product-spec.md` artifact `agent-build-plan.md` Phase 4 and
SPEC.md §38 have named since 2026-07-07 but never produced. It resolves Phase 4-A
through Phase 4-H, plus three product questions SPEC.md §36.1 left open (Q9, Q14, and
the landing-page CTA wording in §26.1). Written directly with Jay, 2026-07-11, after
Phase 4's design pause was lifted.

**How to use this doc:** it's the single source of truth for design *mechanism* and
*token* decisions — what a color/spacing/type value is and when a UI pattern applies.
It does not re-litigate anything already decided in `design/colors.md`/`tokens.css`
(the neutral palette and green/amber/red status triad, built 2026-07-05, stay as-is) —
it extends them. Where this doc and an older SPEC.md suggestion disagree (e.g. §26.1's
"Start Evaluation" CTA), this doc wins and SPEC.md gets a "Resolved — see here"
annotation, per this project's standing cross-reference discipline (the ISS-7/ISS-9
doc-drift failure class).

Phase 5 (`wizard-state.md`) and Phase 6/7 (implementation) consume this doc directly —
they should not re-decide anything settled here.

## 2026-07-13 direction amendment — calm clinical intelligence

Jay's live review supersedes v0.4's white/slate presentation where the two conflict.
The product now uses a warm beige editorial canvas, deep ink typography, restrained
clinical green, quiet borders, generous radii, and very limited shadow. The desired
character is premium and human, not ornamental: strong type hierarchy, asymmetrical
composition, contextual medical imagery, and calm motion do the work.

The assessment is a narrated sequence of **grouped questions**, normally 2–4 related
inputs in one card. It must not become either a one-question-per-screen marathon or a
long form exposing every field at once. Each chapter opens with plain-language context
(`What are you considering?`, `What will it take to open?`, `What does a normal month
look like?`) and moves from hospital identity → investment → demand/revenue → costs.

Equipment selection uses a gentle lift/scale/fade and then carries the chosen image
into the hospital-profile area. Respect `prefers-reduced-motion`; there is no looping
decorative movement. Basic completion is a deliberate decision point with two clear
actions: see the result now, or enter Advanced Mode for payer, ramp-up, financing,
opening, lifecycle, and finance detail. Advanced is a topic workspace with a persistent
six-item navigator and one active topic, not six stacked groups.

Help is progressive disclosure behind `Need help answering this?`. It contains only
human guidance: how to estimate, why it matters, its likely effect, and a readable
source label. Repository paths, internal IDs, formula code, and audit commentary never
appear in public UI. Methodology follows the same rule.

Financial inputs use a local Lakh/Crore segmented control when scale varies in Indian
practice. The chosen display unit never changes formula contracts; values are converted
to the canonical unit at the input boundary. Errors wait until touch or a blocked
continue action. Results lead with a plain-language outlook and the three decision
metrics, then progressively disclose supporting detail.

---

## 1. Theme: "Signal"

Three theme directions were discussed; Jay picked **Signal**: the existing neutral
base and green/amber/red status triad (`design/colors.md`, unchanged) stay exactly as
built, and the existing `--status-neutral` slate-blue (`#3E5C76`) — previously used
only for neutral/informational status callouts — is promoted to double as the
product's primary interactive color (buttons, links, the CTA, active slider fill).
`--accent-navy` (`#1E2A3A`) stays reserved for the header bar, logo, and other dark
surfaces, not clickable elements. No new hues are introduced — this keeps every color
on the page traceable to the same eight-color system, which is what makes the product
read as *designed* rather than assembled from a template.

New tokens (added to `tokens.css` — see §1.4 below for the literal diff):

| Token                      | Value                        | Use                                   |
|-----------------------------|-------------------------------|----------------------------------------|
| `--accent-interactive`      | `#3E5C76` (= `--status-neutral`) | Primary buttons, links, active slider fill, focus accents |
| `--accent-interactive-hover`| `#354E64`                     | Hover/active state for the above       |
| `--accent-interactive-bg`   | `#EAF0F5` (= `--status-neutral-bg`) | Selected-state backgrounds, subtle highlight fills |

`--accent-interactive`/`-bg` are literal aliases of existing tokens, kept as separate
names on purpose: components should reference the *interactive* token, not
`--status-neutral` directly, so a future change to how "neutral status" reads doesn't
accidentally recolor every button.

### 1.1 Typography scale (resolves Phase 4-A)

Font families are unchanged from `tokens.css`: **IBM Plex Sans** for all UI (labels,
body, headings), **IBM Plex Mono** with tabular numerals for every numeric/financial
value anywhere in the product — wizard inputs, dashboard metrics, chart axis labels,
Excel export previews, not just "financial outputs" in the abstract. Inter is the
fallback in the stack, not a second live typeface in active use — this keeps the type
system to two families, not three, which reads calmer.

| Token         | Size  | Line-height | Typical weight | Role                                              |
|----------------|-------|-------------|------------------|-----------------------------------------------------|
| `--text-xs`    | 12px  | 1.5         | 400              | Helper text, source notes, wizard field explanations, chart footnotes |
| `--text-sm`    | 14px  | 1.5         | 400 / 500        | Body copy in dense contexts (tables, cards), field labels |
| `--text-base`  | 16px  | 1.5         | 400              | Default body text (landing page, methodology page long-form prose) |
| `--text-md`    | 18px  | 1.4         | 500              | Wizard field labels, sub-headings |
| `--text-lg`    | 20px  | 1.3         | 600              | Card/section headings, metric card labels |
| `--text-xl`    | 24px  | 1.3         | 600              | Dashboard section headings ("Investment Outlook," "Cash Flow") |
| `--text-2xl`   | 32px  | 1.2         | 600 / 700        | Landing-page section titles |
| `--text-3xl`   | 40px  | 1.15        | 700              | Hero headline only |

Numeric/financial values always use `--font-mono` at whatever size/weight the
surrounding context calls for (e.g. a `--text-3xl` mono metric callout on a dashboard
card, a `--text-sm` mono figure in a table row) — the scale above governs size, not
which font family a number uses.

### 1.2 Spacing scale (resolves Phase 4-B)

4px base unit, matching the existing `--radius-sm`/`--radius-md` scale's grain:

| Token        | Value | Applies to                                                  |
|---------------|-------|----------------------------------------------------------------|
| `--space-1`   | 4px   | Icon-to-label gaps, tight inline spacing                       |
| `--space-2`   | 8px   | Field label-to-input gap, inline chip/tag padding               |
| `--space-3`   | 12px  | Form field internal padding, tooltip popover padding (matches SPEC.md §25.5's existing `12px`) |
| `--space-4`   | 16px  | Field-to-field gap within a form group                          |
| `--space-5`   | 24px  | Card padding, group-to-group gap within a form                  |
| `--space-6`   | 32px  | Section gap within a page, wizard-step gap                      |
| `--space-7`   | 48px  | Major section breaks on the landing page                        |
| `--space-8`   | 64px  | Hero-to-content gap, page-level top/bottom padding on the landing page |

### 1.3 Why this avoids the "AI-generated" look

Jay flagged this explicitly as a design goal, not a vibe check — concretely, this spec
avoids: gradient/mesh backgrounds (none anywhere — background stays white/off-white
per `colors.md`'s existing rule), glassmorphism/blur panels, generic centered-hero-with
-gradient-text layouts, emoji-as-icons (use the already-sourced Lucide icon set
instead), and stacked/glow shadows (only the single soft `--shadow-card` /
`--shadow-modal` pair already defined). The two-typeface system (Plex Sans + Plex
Mono, both distinctive relative to the ubiquitous Inter-only look) and the editorial
grid described in §5 below do the opposite work deliberately.

### 1.4 `tokens.css` diff

The three new interactive tokens plus the spacing and type scale above are added to
`design/tokens.css` directly (see that file — this doc doesn't duplicate the literal
CSS, to avoid two copies drifting).

---

## 2. Chart color system — fixed vs. conditional (resolves Phase 4-C)

The existing 5-color chart series in `tokens.css` (`--chart-1`…`--chart-5`) stays
**fixed** for series identity — billed revenue, realized revenue, cash received,
cost/EMI, and benchmark/reference always keep their assigned color across every chart
in the product, so a user can track "realized revenue" by color alone from one chart
to the next.

**Conditional** color (changes based on the computed value, not series identity)
applies only to:
- The cumulative cash-flow line: `--status-strong` (green) while cumulative cash flow
  is positive, `--status-risk` (red) once it dips below zero. The line's color is the
  *only* conditional one — the fill-under-line, if used, stays a light tint of
  whichever color the line currently is, never a third color.
- The break-even marker: `--status-caution` (amber) when actual usage sits within a
  defined risk band of the break-even point (reuse `financial-model-spec.md`'s
  Moderate band threshold, 55–74, as the risk-band definition — usage within that
  percentile range of break-even), `--status-strong` outside it on the safe side,
  `--status-risk` outside it on the unsafe side.
- The Investment Outlook gauge and any score-driven badge: mapped directly to
  `financial-model-spec.md` §1.4's Strong/Moderate/Caution/Weak bands
  (75–100 / 55–74 / 35–54 / 0–34) using the matching `--status-*` token. This is the
  concrete tie-in Phase 2's build note called for — the score and the charts can never
  tell contradictory stories about the same numbers, because both read the same bands.

Everything else (metric cards, table rows, non-conditional chart series) stays fixed
per its role, never value-driven.

---

## 3. Chart label, contrast & legibility (resolves Phase 4-D)

- Minimum contrast ratio: **4.5:1** (WCAG AA for normal text) for every data label
  against both `--bg-secondary` and any colored fill sitting behind it. Verify this in
  Phase 7's visual QA pass and again in Phase 10's live-site QA, not just once at
  design time.
- Value labels/callouts never sit directly on top of a line or bar fill — offset with
  a leader line, or use an adjacent legend/card instead. Text-on-line at chart-label
  sizes (12–14px) is illegible and is not used anywhere in this product.
- Extending `DIRECTORY.md`'s existing colorblindness note beyond just the Investment
  Outlook gauge: **every** conditional-color chart element (the cash-flow line, the
  break-even marker, any status badge) pairs with a shape, icon, or text label too —
  color is never the only signal. E.g. the cumulative cash-flow line gets a small
  "turns negative" marker/annotation at the crossing point, not just a color change.

---

## 4. Tooltip UI mechanics (resolves Phase 4-E)

Two distinct mechanisms, for two distinct contexts — this is the one place this spec
adds real nuance beyond what `agent-build-plan.md`'s original Phase 4-E draft said, and
it **corrects a contradiction**: that draft suggested hover-to-open on desktop, which
directly contradicts SPEC.md §23.4's explicit, reasoned rejection of hover ("poor
touch-screen and mobile support"). SPEC.md §23.4 wins — click-to-open only, everywhere,
no hover trigger on any device. `agent-build-plan.md` Phase 4-E is corrected to match
(see that file).

### 4.A Dashboard / results / anywhere outside the wizard

Click-to-open popover, exactly as SPEC.md §25.5 already specifies precisely — this
doc doesn't restate those pixel values, just confirms them as final:
- Max width 280px (320px on larger screens), white background, `--border-default`
  1px border, `--radius-sm`, `--shadow-modal`.
- Dismiss on click-outside, the `×` icon, or clicking the trigger again.
- Full 7-slot content (§4.C below) — this context has room for all of it.

### 4.B Wizard fields — no popover at all

Jay's explicit call: while entering data, the user should never have to click to see
what a field means — that information should already be on the page. So wizard fields
do **not** use the click-popover pattern at all. Instead:
- **Always visible**, directly below the field, in `--text-xs` / `--text-secondary`:
  two lines — slot 1 (plain-language definition) and slot 2 (direction: "Higher is
  better" / "Lower is better" / "Context-dependent — see note below"). No click
  required to see these.
- **Optional inline expand** — a small "More info" text link (in
  `--accent-interactive`, `--text-xs`) below the two lines. Clicking it expands the
  remaining 5 slots (default/typical value + confidence, source note, how-to-estimate,
  why-it-matters) **inline in the page flow**, pushing content below it down — not a
  floating popover. This keeps the wizard's "properly visible without clicking"
  principle intact even for the deeper content: nothing ever covers other content or
  requires a hover.
- This inline-expand block is collapsed by default per field and its state doesn't
  persist across fields (opening one doesn't open others) — Phase 5's
  `wizard-state.md` should enumerate this as an explicit per-field UI state, not a
  global one.

### 4.C The 7-slot content structure (unchanged, confirmed)

Already fully specified and fully written (`content/tooltip-copy.md`, Phase 3,
complete): definition, direction, default/typical value with confidence, source note,
how-to-estimate, why-it-matters. §4.A/4.B above only decide *how* this content
surfaces in each context, not what it contains.

---

## 5. Landing page & entry flow (new — resolves SPEC.md §36.1 Q9, Q14, and §26.1)

### 5.1 Structure

Single-scroll landing page, not a multi-page marketing site — this audience (hospital
finance/ops people evaluating a specific purchase) arrives with intent, not to browse.

1. **Header** — logo lockup (existing asset), a "Methodology" link, and the primary
   CTA button, top-right. No heavy nav.
2. **Hero** — existing tagline (`design/hero-lockup.svg`, "Know if it pays for itself,
   before you buy it."), one-line explanation of what CapexIQ is, and the primary CTA.
   The CTA is a normal-sized, clearly-placed button — not an oversized centered
   gradient block. This is a deliberate reaction against the generic-SaaS-hero look
   §1.3 names.
3. **How it works** — a plain 3-step visual (select equipment → enter details → see if
   it pays for itself), using the existing equipment-images assets. No sales language
   ("nothing like this in the market" was explicitly rejected by Jay) — factual only.
4. **Who it's for** — hospital administrators, CFOs, biomedical/procurement teams
   evaluating an equipment purchase, using the existing persona photos.
5. **Depth** — a short, factual section naming what the tool actually does: Basic
   and Advanced modes, live sensitivity, an Investment Outlook score, Excel export
   with live embedded formulas. States capability, doesn't sell it.
6. **Footer** — link to the Methodology page (see 5.3), the disclaimer, the GitHub
   repo link.

### 5.2 Entry flow (resolves §36.1 Q14, finalized)

Hero → primary CTA → a dedicated **equipment + bed-count pre-step** (not the full
wizard yet): the user picks equipment type (with imagery) and enters hospital bed
size. This is not a throwaway screen — bed size is a required Basic Mode input
(SPEC.md §36.1 Q6, resolved) used for utilization/tariff benchmarking, so this
pre-step is real data collection, not just an interstitial. Only after this does the
user land on the wizard proper. Phase 5's `wizard-state.md` needs to design its entry
transition against this flow, not a "lands straight on step 1" assumption.

**Equipment-tile imagery, decided 2026-07-11:** 5 of 6 equipment types
(MRI/CT/Dialysis/Ultrasound + Cath Lab) use the existing sourced stock photos in
`equipment-images/`. Cath Lab's photo is a known approximation (`ISSUES.md` ISS-6,
accepted) — kept as-is, not worth new sourcing effort for a pre-step tile. **Custom**
has no equipment to photograph by definition, so it uses an icon-based tile instead
(from the already-sourced Lucide set) rather than a stock photo or a placeholder
image — consistent with the rest of the product's restraint around imagery, and
avoids the awkwardness of a generic/unrelated photo standing in for "something else."

**CTA wording, finalized: "Start Assessment."** Three phrasings existed across the
docs (SPEC.md §26.1's original "Start Evaluation," §36.1 Q14's "Start Assessment,"
and "Start Analysis" floated in the same conversation as this doc) — "Start
Assessment" is correct because the tool assesses whether a purchase is viable, it
doesn't perform open-ended "analysis." §26.1's "Explore Methodology" secondary-CTA
idea is *not* used as a second hero button (Jay wants one clear primary action in the
hero) — instead it becomes the header/footer "Methodology" link per §5.1/§5.3.

### 5.3 Methodology page (resolves §36.1 Q9)

**Yes, a separate page**, not embedded in the single-scroll landing page. Linked from
the header and footer. Content is already fully written and ready to use:
`report-templates/methodology.md` (plain-language calculation walkthrough) and
`report-templates/formula-appendix.md` (exact formulas). This page exists for
credibility/transparency, not as a marketing surface — no persuasive copy, just the
real math, consistent with §5.1's "no sales language" rule.

---

## 6. Default-value visual treatment (new)

Every wizard field is pre-filled with its default/typical value where one exists
(sourced, per `data-requirements.md` — never invented). Two visual states:

| State | Text color/weight | Extra element |
|---|---|---|
| Untouched (still showing the default) | `--text-secondary`, regular weight | A small "Typical" tag/pill next to the field, using `--accent-interactive-bg` background and `--accent-interactive` text — reuses existing tokens, no new color |
| Edited (user has typed or dragged) | `--text-primary`, normal input styling | Tag removed |

entered — the muted styling and tag make the field's state legible at a glance.

**Correction (2026-07-12/13) — this paragraph previously grouped discount rate and
target IRR together as both having "no sourced default," which was wrong for discount
rate; found independently by two parallel audits (`capexiq-ui-assurance`'s F1 and
`capexiq-prebuild-assurance`'s PBA-6) run the same week, the same false-"unresearched"
-claim failure class ISS-9 already caught once in a different file.** Discount rate has
a real sourced default (`typical: 12.5%`, Medium confidence, S22/S23,
`equipment-data/common-assumptions.json`) and is pre-filled exactly like any other
sourced field, above. **Target IRR is the one field with no sourced benchmark**
(confirmed unresearchable, `Unavailable` per `common-assumptions.json`) —
**resolved (audit F1, Jay's decision):** rather than showing empty and blocking the
Basic-Mode step gate (see `agent-build-plan.md` Phase 5's F1 note), it is auto-filled
with a computed heuristic (`discountRate + 400bps`) using the exact same "Typical" tag
treatment above, with its tooltip explicit that this is a suggested starting point, not
a researched number — distinguishing a labeled heuristic from a fabricated benchmark.
The user can edit or accept it in Advanced Mode; Phase 7's Advanced settings pane shows
it the same way. No field in this product ever shows a blank pre-fill that could look
authoritative, and no field's default is ever silently presented as sourced when it
isn't — target IRR's tag and tooltip make its provisional nature explicit, and this is
the *only* field in the product using a computed (rather than directly sourced) value
as its "Typical" default.

**This pattern isn't unique to target IRR (capexiq-prebuild-assurance PBA-6 addendum):**
`purchase cost` has no typical value at all for MRI/CT/Ultrasound, and `usage per
day`/`billed tariff (typical)`/`launch delay (typical)` are null for several equipment
types too (`equipment-data/<type>.json` — see each file's own confidence notes). Unlike
target IRR, none of these has a defensible computed heuristic (there's no
"discountRate + Xbps"-style proxy for a purchase price), so they don't get the
auto-fill treatment above — they stay genuinely empty with the same visible-prompt
styling (not a blank that looks authoritative), and `required: true` correctly gates
progression on the user actually entering them, since there is nothing to protect
Basic Mode from here except real data.

---

## 7. Basic → Advanced surfacing (resolves Phase 4-F — unchanged, confirmed)

Already correctly decided 2026-07-07: an inline, collapsible panel directly below
Basic Mode fields on the same screen — not a separate wizard step, modal, or tab.
Collapsed by default. A persistent preview banner above the toggle names all six
Advanced field groups (§11.1 A–F) — copy already written in
`content/field-explanations.md`. Toggling never discards already-entered Advanced
values. No changes from this discussion; restated here only so this doc is a complete
single reference for Phase 5/6.

---

## 8. Live/dynamic recalculation (resolves Phase 4-G — unchanged, confirmed)

Already correctly decided 2026-07-07: every input (typed or slider-dragged)
recalculates the dashboard/chart preview immediately — no debounce on typed fields,
~100–150ms debounce on slider drag. Sliders pair a draggable thumb with a synced
numeric input (either can drive the value). While a field is invalid, the last valid
result stays visible with a reduced-opacity "stale" indicator — charts never blank on
a partial/invalid input. No changes; restated here for completeness.

---

## 9. Excel export formula strategy (resolves Phase 4-H — unchanged, confirmed)

Already correctly decided 2026-07-07: live, embedded Excel formulas (e.g.
`=Assumptions!B4*Assumptions!B7`), not static pasted values — every downstream sheet
traces back to a clearly separated Assumptions sheet. Requires a formula-capable
export library (`exceljs`). No changes; restated here for completeness.

---

## 10. Micro-interaction principles (new)

Jay's brief: "thoughtful in every corner," Google-product-caliber polish, without
gimmicks. Concrete rules for Phase 6/7 implementation:

- **Click feedback**: primary buttons get a subtle radial ripple on click (a low-opacity
  `--accent-interactive` circle expanding from the click point, fading over ~400ms) —
  this is the one deliberately decorative motion in the product, used only on primary
  actions (CTA, "Next" in the wizard, export buttons), not on every clickable element.
- **Transitions**: hover/focus state changes use a 150ms ease-out transition
  (background, border, and the slider thumb's 18px→22px scale already specified in
  SPEC.md §25.5). Section-to-section navigation (hero → pre-step → wizard →
  dashboard) uses a simple fade/slide, never an abrupt hard-cut reload feel, even
  though the app is a static export.
- **Focus states are always visible** — every interactive element gets a focus ring
  (reuse the slider's existing formula: `0 0 0 3px` of the element's accent color at
  15% opacity), never `outline: none` without a replacement. This is both an
  accessibility requirement and part of "thoughtful in every corner."
- **One motion per interaction** — never stack multiple simultaneous animations on a
  single user action (e.g. a button that ripples *and* bounces *and* changes color all
  at once reads as noisy, not thoughtful). Pick the single most legible motion for
  each interaction.
- **`prefers-reduced-motion` (added — UI assurance audit F3, 2026-07-12):** every
  decorative motion above (the click ripple, section fade/slide, hover/focus 150ms
  transitions) is suppressed under `@media (prefers-reduced-motion: reduce)` — ripple
  and fade/slide become an instant cut, hover/focus transitions become immediate
  (0ms) state changes. State changes themselves (a field turning invalid, a step
  advancing) must remain fully understandable with zero motion; nothing here is
  load-bearing information, all of it is optional polish. This doesn't change any
  visual design, only removes motion under the OS-level preference.

---

## 10.5 Number formatting (added — UI assurance audit F9, 2026-07-12)

No prior version of this doc fixed a display-formatting rule for INR values, despite
the product being explicitly India-first (`INTRODUCTION.md`). Without one, an
implementer could default to US-style grouping, which would look wrong to the exact
CFO/administrator audience this product targets. Fixed here, once:

- **Digit grouping:** Indian convention (lakh/crore grouping — `12,34,567`, not
  `1,234,567`) everywhere an INR value renders — wizard fields, dashboard metric
  cards, chart labels, tables, and export previews. Use `Intl.NumberFormat('en-IN')`
  (or an equivalent grouping implementation) rather than hand-rolled comma insertion,
  so edge cases (negative values, decimals) stay correct without custom logic.
- **Negative values (e.g. cash flow before break-even):** a leading minus sign,
  `-₹12,34,567` — not accounting-style parentheses. Matches this product's plain-
  language tone (§5.1's "no sales language" restraint extends to not adopting
  finance-jargon formatting conventions where a simpler one reads just as clearly).
- **Compact vs. full figure:** dashboard metric cards may use a compact lakh/crore
  form (e.g. "₹1.2 Cr") only where §1.1's type scale already calls for a large mono
  metric callout; tables, wizard inputs, chart axis labels, and every export always
  show the full figure — a visual abbreviation never hides the exact value a CFO
  would need to check.
- **Currency symbol:** `₹` prefix, no space, consistent with `content/inputs-metadata.json`'s
  existing `unit: "INR"` fields — this doesn't change any existing field's unit, only
  fixes how the number renders around it.

---

## 11. Cross-references / what this doc resolves

| Item | Resolved here | Also update |
|---|---|---|
| Phase 4-A Typography scale | §1.1 | `tokens.css` |
| Phase 4-B Spacing scale | §1.2 | `tokens.css` |
| Phase 4-C Chart color fixed/conditional | §2 | — |
| Phase 4-D Chart label/contrast | §3 | — |
| Phase 4-E Tooltip mechanics | §4 | `agent-build-plan.md` Phase 4-E (hover/click correction) |
| Phase 4-F Basic/Advanced surfacing | §7 | — (unchanged) |
| Phase 4-G Live recalculation | §8 | — (unchanged) |
| Phase 4-H Excel export | §9 | — (unchanged) |
| SPEC.md §36.1 Q9 (methodology page) | §5.3 | SPEC.md |
| SPEC.md §36.1 Q14 (entry flow) | §5.2 | SPEC.md |
| SPEC.md §26.1 (CTA wording) | §5.2 | SPEC.md |
| Theme / accent color | §1 | `tokens.css` |
| Default-value treatment | §6 | — |
| Micro-interactions | §10 | — |
| Reduced motion (audit F3) | §10 | — |
| Number formatting (audit F9) | §10.5 | — |

**Definition of Done for Phase 4, per `agent-build-plan.md`:** this doc exists and
gives a concrete answer to A–H (done, above); `tokens.css` has spacing/type-scale
tokens added (done, see that file); `content/inputs-metadata.json`'s per-field
validation contract is **not** written by this doc — that's a separate, still-open
Phase 4 deliverable (the per-field `min`/`max`/`decimalPlaces`/`errorMessage` schema),
left for Phase 5 to produce alongside `wizard-state.md` since it needs the same
field-by-field pass. Flagging this so Phase 4 isn't marked fully closed on a false
premise.
