The results page — Phase 6 built a minimal, real version: Investment Outlook
score/band, NPV/IRR/payback/ROI/break-even/EAC, all from the same
`formulas/computeAssessment.ts` pipeline the preview strip uses (never a second copy).
No charts, gauge, risk callouts, or narrative summary yet — those are Phase 7, built
against `design/dashboard-mockup.svg` and SPEC.md §21/§30. This folder moved here (a
Next.js route group, `app/(assessment)/`) from the old flat `app/results/` so it can
share the wizard's `WizardProvider`/persistence/route-guard layout with `app/assess/`
despite not being nested under `/assess` in the URL — route groups don't affect the
actual path.
