Advanced Mode UI (Phase 6, 2026-07-13) — built. `AdvancedPanel.tsx` is the collapsible
container (Phase 4-F's contract: collapsed by default, preview banner always visible,
entered values persist across collapse/expand); `GroupA.tsx` through `GroupF.tsx` are
SPEC.md §11.1's six groups (payer mix, utilization ramp-up, financing, launch delay,
maintenance/lifecycle, financial model assumptions), each a thin `<fieldset>` over
`app/components/FieldRenderer.tsx`. `MaintenanceScheduleFields.tsx` is the one field
that doesn't fit the generic path-based system (a dynamic-length array, resized when
`usefulLifeYears` changes) — it dispatches its own `SET_MAINTENANCE_SCHEDULE_YEAR`
action instead. See `ISSUES.md` ISS-19 for what Group B/E collect but the canonical
pipeline doesn't consume yet.
