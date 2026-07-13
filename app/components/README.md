Shared UI components (Phase 6, 2026-07-13) — built for the wizard; Phase 7's dashboard
will add cards/charts here too. `FieldShell`/`NumberField`/`SliderField`/
`SelectField`/`TextField`/`FieldRenderer` are the field-control system (bounds/
validation/tooltip come from `app/forms/fieldSchema.ts`, never hardcoded here, per
CONVENTIONS.md §3). `WizardFieldTooltip` is the wizard-only 2-line + "More info"
pattern (ux-product-spec.md §4.B) — the click-to-open popover for outside-the-wizard
contexts (§4.A) isn't built yet, that's Phase 7. `ProgressStepper`, `PreviewStrip`,
`StepNav`, `StartOver`, `LiveRegion`, `Button` (with the ripple + focus-ring +
`prefers-reduced-motion` handling from ux-product-spec.md §10) round out the wizard
shell. `formatting.ts` is the Indian digit-grouping/currency formatting (§10.5),
already shared by `PreviewStrip` and the `/results` page.
