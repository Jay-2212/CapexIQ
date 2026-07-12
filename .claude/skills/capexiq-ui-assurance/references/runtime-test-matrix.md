# Runtime test matrix

Record pass, fail, blocked, or not applicable with evidence. Do not collapse unexecuted checks into a pass.

## Viewports and input

- 320x568, 375x667, 768x1024, 1024x768, and 1440x900
- phone landscape with virtual-keyboard-sensitive form fields
- keyboard only from page load through results and back
- mouse, coarse-pointer/touch emulation, and slider drag cancellation
- 200% text resize, 400% zoom/reflow, and increased text spacing

## Preferences and platform modes

- reduced motion
- forced colors/high contrast where supported
- light scheme (the specified v1 theme); ensure browser chrome/native controls remain legible
- browser Back/Forward, refresh on each step, direct URL entry, background/foreground tab
- storage unavailable, quota/write failure where simulatable, corrupt and obsolete stored payload

## Core journeys

- landing to entry pre-step to every Basic step to results
- Advanced Mode open/edit/close/reopen without data loss
- edit defaults, return to default value, and verify edited-state semantics
- invalid input causing stale preview, correction restoring fresh output
- payer-mix and repeating year-group validation
- acquisition-mode branch changes and financing fields
- clear/reset confirmation and cancel path
- restore draft and discard restored draft

## Data stress cases

- blank optional values and missing benchmark
- all allowed zero values
- min/max plus decimal precision boundaries
- pasted `₹`, commas, spaces, Indian grouping, Western grouping, negative sign, and percent characters
- very large acquisition/revenue values and narrow viewport
- useful life 1 and 30 years
- no break-even, immediate break-even, negative NPV/IRR edge, and every Investment Outlook band

## Accessibility execution

- run axe on every distinct route/state, but treat results as partial
- verify landmarks, heading outline, accessible names/descriptions, error associations, and live regions in the accessibility tree
- verify focus order, focus visibility, focus restoration, no obscured focus, and no keyboard trap
- verify charts have equivalent structured values and do not require hover
- test VoiceOver/Safari manually when available; record exact platform and browser versions

## Performance evidence

- measure typing and slider interaction with maximum-horizon charts visible
- inspect React commits/rerenders for a single field change
- inspect layout shifts and long tasks
- compare initial route bundle with chart/export libraries deferred vs. loaded

## Reporting

For each failure capture route, viewport, input method, starting state, reproduction steps, expected result, observed result, evidence, severity, and proposed acceptance test.
