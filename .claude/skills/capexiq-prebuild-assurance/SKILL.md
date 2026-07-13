---
name: capexiq-prebuild-assurance
description: Audit CapexIQ before implementation for whole-model correctness, schema and contract consistency, browser-only security and privacy, export safety, and deployment requirements. Use after planning/UI audits and before Phase 6, or when reviewing formula integration, canonical scenarios, invariants, input-to-output traceability, localStorage risks, untrusted text, spreadsheet/Word/ZIP export threats, dependency exposure, static-host security headers, and exact build-plan gates. Produce findings and proposed plan changes without editing files unless explicitly requested.
---

# CapexIQ Pre-Build Assurance

Determine whether CapexIQ's non-visual technical contracts are safe and complete enough to begin Phase 6. Audit; do not redesign or build.

## Boundaries

Read `INTRODUCTION.md` and every file it mandates before auditing. Also read the completed UI assurance findings or resulting Phase 4-5 amendments when present. Treat accepted UI decisions as settled; do not repeat the UI/accessibility audit unless a model or security finding directly intersects them.

Default to findings only. Do not edit `agent-build-plan.md`, specifications, code, tests, `ISSUES.md`, or `HANDOFF.md` unless the user separately authorizes consolidation or implementation.

Do not claim that an unbuilt component, exporter, or deployed control passes. Record its requirement as a future implementation gate with a testable acceptance criterion.

## Audit sequence

1. Establish the repository's current phase and distinguish implemented, specified, placeholder, and unavailable behavior.
2. Read [model-and-contract-audit.md](references/model-and-contract-audit.md) completely. Trace each relevant input through metadata, wizard state, formula parameters, canonical calculated result, dashboard/chart/narrative consumers, and export destination.
3. Read [browser-security-audit.md](references/browser-security-audit.md) completely. Build a browser-only threat model for stored drafts, user-controlled text, third-party code/assets, generated files, and static hosting.
4. Read [verification-design.md](references/verification-design.md) completely. Inspect existing tests, run safe read-only verification, and identify missing golden scenarios, invariants, schema tests, and future runtime/export checks.
5. Read [sources.md](references/sources.md) when making security or platform claims. Prefer project specifications for business meaning and primary standards for technical controls.
6. Deduplicate overlaps. One root cause with several consumers is one finding with multiple affected surfaces.
7. Check each proposed change against the existing build plan. Preserve correct existing requirements and add only missing, contradictory, or untestable obligations.

## Evidence discipline

- Separate `confirmed defect`, `specification gap`, `implementation gate`, `test gap`, and `accepted risk`.
- Cite exact project files and lines. Cite the relevant primary external source for security/platform claims.
- Independently derive expected financial results for golden scenarios; never use the implementation under test to generate its own expected values.
- Treat model monotonicity as conditional. State the assumptions held constant before asserting an invariant.
- Do not confuse display rounding with calculation precision.
- Treat `localStorage`, URL data, imported/restored JSON, and user-entered text as untrusted.
- Do not prescribe server controls to a static browser-only app. Place response-header controls in Cloudflare/static-host configuration.
- Do not label generic hardening advice P0/P1 without an exploitable path or material correctness impact.

## Severity and disposition

Use:

- **P0 Blocker:** can materially invert/corrupt a financial result, enable dangerous generated-file behavior, or prevent the core assessment from functioning.
- **P1 Major:** high-likelihood model inconsistency, data loss/privacy failure, exploitable client-side issue, or missing contract likely to cause rework across phases.
- **P2 Moderate:** bounded correctness, resilience, compatibility, or maintainability risk with a workaround.
- **P3 Minor:** low-impact hardening or clarity improvement.

Assign one primary disposition:

- `fix before Phase 6`
- `add to Phase 6`
- `add to Phase 7`
- `add to Phase 8`
- `add to Phase 9`
- `add to Phase 10/deployment`
- `accept with rationale`
- `no change`

## Output contract

Lead with one verdict: `ready`, `ready after targeted amendments`, or `not ready`.

For each finding include:

- ID, category, severity, confidence, and finding type
- exact evidence and affected data path or threat path
- user/business consequence
- smallest compatible correction
- disposition and precise target phase/section
- acceptance criterion and verification method

Then provide:

1. **Existing strengths:** requirements that already address major risks; do not rewrite them.
2. **Consolidated build-plan patch list:** ordered by phase and dependency, written as proposed checklist language but not applied.
3. **Verification backlog:** divide into tests possible now, implementation tests, export interoperability tests, and deployment checks.
4. **Residual risks and accepted assumptions.**
5. **Go/no-go recommendation for Phase 6.**

Avoid arbitrary scores and generic best-practice dumps. Every recommendation must connect to a CapexIQ path, failure mode, and acceptance test.
