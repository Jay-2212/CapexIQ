# Technical audit matrix

Apply each relevant section. A planning audit determines whether the requirement and its acceptance test exist; an implementation audit verifies behavior.

## 1. Structure and navigation

- Use semantic landmarks, one meaningful page `h1`, hierarchical headings, useful page titles, and a skip link.
- Ensure link vs. button semantics match navigation vs. action.
- Define focus placement on route/step change, failed submission, popover open/close, inline expansion, reset confirmation, and restoration.
- Preserve logical tab order; avoid positive `tabindex` and keyboard traps.
- Ensure browser Back/Forward, refresh, deep entry, and mobile back-swipe have defined outcomes consistent with `wizard-state.md`.

## 2. Forms and financial error prevention

- Associate every input with a visible label, instructions, units, required/optional state, and specific error using native semantics plus `aria-describedby`/`aria-errormessage` where appropriate.
- Specify error timing, error summary, first-error focus, correction behavior, and preservation of valid values.
- Use meaningful `name`, appropriate `type`, `inputmode`, `step`, and autocomplete behavior. Never block paste.
- Verify defaults are distinguishable from user-edited values without relying on color.
- Prevent silent coercion, locale parsing mistakes, unit confusion, accidental value loss, and impossible payer-mix or by-year groups.
- Because this is financial decision support, provide review/correction before any consequential export or finalization; do not overstate certainty.
- Test empty, zero, negative where allowed, min/max, decimal precision, pasted formatted numbers, very large INR values, and 30-year series.

## 3. Sliders and alternative input

- Keep the native range-input behavior or fully implement the applicable ARIA slider pattern.
- Provide keyboard arrows and documented larger-step keys where useful; expose name, current value, bounds, and units.
- Provide a non-dragging alternative for every drag interaction (WCAG 2.5.7).
- Ensure pointer cancellation and touch behavior do not commit accidental values.
- Meet WCAG 2.2 target-size minimum and project touch-size requirements; do not disable browser zoom.
- Keep typed input and slider synchronized without cursor jumps, lost keystrokes, or duplicate announcements.

## 4. Dynamic calculations and state communication

- Derive preview, metric cards, charts, narrative, and export data from one calculation result.
- Define loading, empty, invalid, stale, unavailable, success, restore, corruption, and reset states.
- Keep last-valid output clearly marked stale during invalid input, as specified.
- Announce validation and meaningful status changes accessibly, but do not make every keystroke or slider tick a noisy live-region announcement.
- Define an announcement strategy for recalculation completion, stale state, step changes, restored sessions, and errors.
- Ensure hidden/collapsed/advanced content is removed from the accessibility tree when unavailable and retains intended data lifecycle.

## 5. Charts and financial data

- Give every chart an accessible name and concise takeaway.
- Provide the underlying values in an accessible table or equivalent structured text; canvas/SVG pixels and hover tooltips are insufficient.
- Preserve series identity, units, time period, sign, scale, and exact value outside color alone.
- Make chart tooltips keyboard/touch reachable if they contain information not available elsewhere.
- Test no break-even, immediate break-even, negative cash flow, line crossings, all score bands, zero/flat series, missing benchmark, long horizon, and extreme outliers.
- Verify axis/legend truncation, data-label collision, screen magnification, print, and exported interpretation.
- Do not use ARIA roles that imply an interactive chart unless the full keyboard interaction model exists.

## 6. Responsive, zoom, and content resilience

- Test at 320, 375, 768, 1024, and 1440 CSS px plus relevant landscape layouts.
- Verify 200% text resize and WCAG reflow at 320 CSS px equivalent/400% zoom without two-dimensional scrolling except genuinely two-dimensional data.
- Test increased text spacing, long English labels, long error/help copy, and large formatted numbers.
- Handle virtual keyboards, sticky controls, safe areas, fixed headers, and focus not obscured.
- Avoid horizontal clipping masked by `overflow-x: hidden`; fix the overflowing content.
- Test coarse pointer, touch, mouse, and keyboard without assuming hover.

## 7. Visual accessibility and motion

- Verify text contrast, non-text contrast, focus appearance, disabled-state legibility, and status differentiation against actual rendered backgrounds.
- Never rely on color, position, shape, or motion alone.
- Honor `prefers-reduced-motion`; remove nonessential motion while keeping state changes understandable.
- Use interruptible `transform`/`opacity` animation where possible; never use `transition: all`.
- Test forced-colors/high-contrast mode and browser default focus behavior.

## 8. Localization and numerical integrity

- Use `Intl.NumberFormat` for INR and Indian grouping; keep machine calculation values numeric and formatting at presentation boundaries.
- Define rounding, negative-sign, percent, zero, lakh/crore, compact vs. full-number, and export formatting consistently.
- Do not infer locale from IP. Set page language and prevent inappropriate translation of identifiers where needed.
- Ensure visual abbreviation never hides the exact financial value.

## 9. Persistence, privacy, and recovery

- Version and validate persisted state; reject corrupt or incompatible payloads safely.
- Minimize stored data and document that browser-local drafts can remain on shared devices.
- Define multi-tab behavior, quota/write failures, private browsing restrictions, and clearing/reset behavior.
- Ensure restoration communicates what was restored and lets users discard it.
- Do not persist transient UI state or validation announcements unless explicitly required.

## 10. Performance and stability

- Keep typing responsive and slider dragging smooth while charts recalculate.
- Measure rather than assume. Test representative low-end throttling and the maximum useful-life horizon.
- Avoid duplicated formula runs, unnecessary component-wide subscriptions, chart-library over-bundling, layout thrashing, hydration mismatch, and cumulative layout shift.
- Reserve image dimensions, load critical assets intentionally, and lazy-load below-fold imagery.
- Verify reduced motion and accessibility behavior remain correct after optimization.

## 11. Testing gates

- Static: TypeScript, lint rules, semantic/code review, unit tests for state transitions and formatting.
- Automated browser: core wizard journey, every validation class, keyboard path, persistence recovery, viewport matrix, no horizontal overflow, and axe scans.
- Manual browser: zoom/reflow, text spacing, touch/coarse pointer, forced colors, reduced motion, virtual keyboard, print, and browser navigation.
- Assistive technology: VoiceOver plus Safari on macOS/iOS at minimum; add NVDA plus Chrome/Firefox on Windows when available.
- User validation: at least one representative hospital finance/operations user for terminology, cognitive load, defaults, and decision interpretation before release.

Automated results never substitute for manual keyboard, screen-reader, zoom, or comprehension testing.
