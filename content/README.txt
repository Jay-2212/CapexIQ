User-facing copy for CapexIQ (field explanations, benchmark notes, glossary, tooltip
copy) — SPEC.md §23, §32. **Complete as of 2026-07-11 (Phase 3)** — real content in
every file, no placeholders:

- `field-explanations.md` — plain-language field definitions + Advanced Mode preview
  banner copy
- `benchmark-notes.md` — sourced context for benchmark ranges shown in the UI
- `glossary.md` — financial/medical term definitions
- `tooltip-copy.md` — full 7-slot popover copy (definition, direction, default/typical
  value, confidence, source note, how-to-estimate, why-it-matters) for every field,
  keyed by readable field name — `app/forms/wizard-state.md` defines the final machine
  keys; re-keying is mechanical, not a content rewrite
- `inputs-metadata.json` — UI/control schema only (control type, slider bounds,
  validation rules, `tooltipKey` pointer into `tooltip-copy.md`) — **zero numeric
  defaults**, by design, see ISSUES.md ISS-9/ISS-4
- `tooltip-copy.generated.json` — added Phase 6 (2026-07-13). A machine-readable parse
  of `tooltip-copy.md`'s 7-slot entries, keyed by the same string as `tooltipKey`,
  consumed by `app/forms/tooltipCopy.ts` at runtime. `tooltip-copy.md` stays the
  authoritative, human-edited source — re-run `node scripts/generateTooltipCopy.mjs`
  any time it changes; the generated file is not hand-edited.
