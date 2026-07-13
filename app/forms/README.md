Wizard state, schema, validation, and persistence logic (Phase 6, 2026-07-13) — the
routed pages themselves live in `app/(assessment)/assess/`, not here; this folder is
the shared logic they and `app/advanced/`/`app/components/` all import. See
`wizard-state.md` for the full route map, field-to-step assignment, and transition
table — every file below implements a specific section of it, cited in its own header
comment.

| File | What it does |
|---|---|
| `wizardTypes.ts` | `WizardState` shape — a direct implementation of `wizard-state.md` §7.1's schema |
| `wizardReducer.ts` | The single `useReducer` — one action per named transition |
| `WizardContext.tsx` | The layout-level provider + the shared `aria-live` region's `announce()` |
| `fieldSchema.ts` | Expands `content/inputs-metadata.json`'s template fields (payer mix, ramp) into concrete `FieldDefinition`s |
| `payerAndRampKeys.ts` | The 5 payer-type / 4 ramp-period suffixes §7.1 declared final |
| `equipmentDefaults.ts` | Resolves sourced defaults from `equipment-data/` for a chosen category |
| `initialState.ts` | Builds empty/defaulted `WizardState` — includes the payer-mix default fix, see `ISSUES.md` ISS-22 |
| `fieldPath.ts` | Generic dotted-path get/set over `WizardState` |
| `wizardValidation.ts` | Field/step/group validation, the route guard's `earliestIncompleteStep()`, the fresh/stale contract |
| `useFieldController.ts` | The hook every field control builds on |
| `resolvePayerMix.ts` | WizardState → `AssessmentPayer[]` — see `ISSUES.md` ISS-17 for the realization/claim-deduction composition caveat |
| `toAssessmentInputs.ts` | WizardState → `formulas/computeAssessment.ts`'s input shape — see `ISSUES.md` ISS-18/ISS-19 for financing/ramp-up caveats |
| `useAssessmentResult.ts` | The fresh/stale result hook the preview strip and `/results` both call |
| `draftStorage.ts` / `useWizardPersistence.ts` | §7's `localStorage` schema and its React wiring (debounce, multi-tab conflict, write-failure handling) |
| `RouteGuard.tsx` | §2's route guard + §6.5's focus/announcement events |
| `stepRouting.ts` | `WizardStep` ↔ route path mapping |
| `tooltipCopy.ts` | Loads `content/tooltip-copy.generated.json` (see `scripts/generateTooltipCopy.mjs`) |

See also SPEC.md §7, §10, §11 and `content/inputs-metadata.json` for field-level detail.
