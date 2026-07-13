# Verification design

## Tests possible before Phase 6

- Run the existing formula suite, type check, and static-export build.
- Add or propose schema validation for every project-owned JSON contract.
- Add independently calculated golden model scenarios.
- Add conditional invariant/property tests with explicit valid domains.
- Add cross-file contract tests proving every wizard metadata key maps to the intended formula input and no required formula input is orphaned.
- Add tests for `0` vs. `null` vs. unavailable vs. not-applicable semantics.

For an audit-only request, report the exact test additions; do not create them.

## Phase 6-7 implementation gates

- Prove the canonical calculation pipeline runs once per committed input transition and all visible consumers share its result.
- Test parsing/formatting boundaries, stale-result behavior, restoration/recalculation, multi-tab changes, corrupted/obsolete drafts, and storage failure.
- Test user-controlled strings against DOM injection and unsafe URL/filename behavior.
- Measure rapid typing/slider interaction with maximum-horizon data.

## Phase 8 export gates

- Open generated XLSX in current Microsoft Excel and Google Sheets and compare every output with the canonical browser result before display rounding.
- Inspect cell types and formulas, external links, names, hidden sheets/data, relationships, and macro absence.
- Test hostile text in every exported free-text field.
- Open Word output and inspect narrative/value parity plus relationships.
- Inspect ZIP entry names and contents; test traversal-like and oversized names.
- Confirm backgrounding, cancel/retry, and double-click do not create corrupt or duplicate outcomes.

## Phase 10/deployment gates

- Fetch the live site's response headers and compare with the approved policy.
- Verify CSP without relying only on console silence; exercise every route, font, image, chart, and download.
- Confirm no unexpected network request carries user inputs.
- Inspect production bundles and source-map availability.
- Run dependency audit against the production dependency graph and document accepted dev-only findings separately.

## Evidence format

For each test specify fixture/input, independent oracle, expected result, tolerance, environment, and failure message. A green implementation-derived snapshot is not an independent financial oracle.
