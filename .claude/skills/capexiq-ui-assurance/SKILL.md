---
name: capexiq-ui-assurance
description: Audit CapexIQ UI and UX planning or implementation for technical completeness without changing its established visual direction. Use for Phase 4-5 design and state reviews, Phase 6-7 UI implementation reviews, pre-release UI QA, accessibility checks, responsive and mobile checks, form and wizard behavior, charts and financial-data presentation, React/Next.js performance, or requests to find UI engineering gaps and update the build plan.
---

# CapexIQ UI Assurance

Audit whether CapexIQ's intended interface is technically sound. Preserve the product's design; test its completeness.

## Authority and boundaries

Read `INTRODUCTION.md`, then the project files it mandates. For UI work, always read:

- `design/ux-product-spec.md`
- `design/tokens.css` and `design/colors.md`
- `app/forms/wizard-state.md`
- `content/inputs-metadata.json`
- relevant sections of `SPEC.md`, `agent-build-plan.md`, and `financial-model-spec.md`

Treat those files as product requirements. Do not propose a new theme, palette, typography system, icon family, aesthetic, page hierarchy, or interaction model merely because a generic guideline prefers one. Do not generate a replacement design system.

Recommend a design change only when evidence shows an accessibility, usability, platform, correctness, or performance failure. Preserve the intended appearance when offering a compliant implementation.

Default to an audit only. Do not edit implementation, specifications, `ISSUES.md`, or `agent-build-plan.md` unless the user explicitly asks for changes.

## Select the audit mode

- **Planning audit:** Review specifications and transition contracts before implementation. Identify missing decisions, contradictions, and untestable requirements. Never claim runtime verification.
- **Implementation audit:** Inspect code and run proportionate automated checks. Report exact files and lines.
- **Browser audit:** Test the running UI at real viewport sizes and with keyboard/touch-equivalent interaction. Browser evidence supplements code review; it does not replace assistive-technology testing.
- **Release audit:** Combine all three, including a manual test matrix and residual-risk statement.

For a Phase 4-5 request, use planning audit mode unless a runnable UI exists.

## Audit workflow

1. Establish scope and evidence available. Infer it from the request and repository; ask only if the answer would materially change the audit.
2. Build a traceability map from intended user flow to specification, state transition, validation rule, accessibility behavior, responsive behavior, and test obligation.
3. Read [technical-audit-matrix.md](references/technical-audit-matrix.md) completely and apply every relevant section.
4. For implementation work, read [react-next-performance.md](references/react-next-performance.md) and apply only rules relevant to the actual code path.
5. For browser or release work, read [runtime-test-matrix.md](references/runtime-test-matrix.md) and execute every feasible test. State which tests require a human or unavailable assistive technology.
6. Separate confirmed defects from missing specifications, implementation risks, and optional improvements.
7. Map each finding to its source requirement or standard. Never inflate heuristic advice into a WCAG failure.
8. Check whether existing project requirements already resolve the finding before recommending new work.

## Evidence rules

- Prefer W3C WCAG 2.2 and WAI-ARIA Authoring Practices for accessibility claims.
- Prefer semantic HTML over ARIA. Do not recommend ARIA when a native element provides the required behavior.
- Automated accessibility tools detect only a subset of problems. Never declare WCAG conformance from axe or Lighthouse alone.
- Do not call a planning document compliant or noncompliant when the result depends on implementation. Label it `implementation gate`.
- Do not claim screen-reader, mobile-device, browser, zoom, forced-colors, or performance testing unless it was actually executed.
- Keep visual preference separate from technical risk.

## Severity and disposition

Assign one severity:

- **P0 Blocker:** prevents task completion, corrupts financial meaning, loses user work, or creates a critical accessibility barrier.
- **P1 Major:** WCAG 2.2 A/AA failure, inaccessible core flow, material calculation/presentation ambiguity, or high-likelihood mobile/runtime failure.
- **P2 Moderate:** meaningful friction or resilience/performance gap with a workaround.
- **P3 Minor:** low-impact polish or maintainability issue.

Assign one disposition:

- `fix specification before build`
- `add implementation requirement`
- `add automated test`
- `add manual QA case`
- `defer with rationale`
- `no change`

## Output contract

Lead with the audit verdict and distinguish what is already strong from what is missing.

For every finding include:

- ID and concise title
- severity and confidence
- evidence with exact file/line or runtime reproduction
- affected user and consequence
- applicable project requirement and, when relevant, WCAG criterion
- smallest recommendation that preserves the existing design
- disposition and exact destination in the build plan or specification
- verification method and acceptance criterion

End with:

1. a deduplicated build-plan change list ordered by dependency;
2. a test matrix divided into automated, browser-manual, and assistive-technology/manual checks;
3. unresolved questions only where the repository cannot answer them;
4. a residual-risk statement.

Do not use an arbitrary design score. A count of findings by severity is acceptable.

## Attribution

The implementation checklist was informed by Vercel's MIT-licensed `web-design-guidelines` and `react-best-practices` skills, then narrowed for CapexIQ. Normative accessibility requirements remain sourced to W3C, not Vercel. See [sources.md](references/sources.md).
