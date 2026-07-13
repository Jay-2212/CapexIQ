Tests for `app/forms/` — the wizard reducer, validation, persistence, and the
WizardState-to-AssessmentInputs mapping. Added Phase 6 (2026-07-13):

- `wizardReducer.test.ts` — one test per named transition in `app/forms/wizard-state.md`
  (CONVENTIONS.md §5's rule for stateful flows), plus the payer-mix-default fix
  (`ISSUES.md` ISS-22).
- `wizardValidation.test.ts` — field/step/group validation, the route guard's
  `earliestIncompleteStep()`, the fresh/stale contract, and requiredIf's cross-step
  conditional requiredness.
- `toAssessmentInputs.test.ts` — Cash/Loan/Lease financing mapping and the Basic vs.
  Advanced maintenance-path switch (PBA-4).
- `draftStorage.test.ts` — the `localStorage` schema's save/load/discard rules against
  a stubbed storage (see `tests/setup.ts` for why a stub is needed in this environment).
