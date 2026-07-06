Equipment assumption data files — CapexIQ (per SPEC.md §32.1: "equipment assumptions
should live in editable data files").

Status: schema-shaped placeholders only, not real data. See ISSUES.md ISS-3.

Each file should be populated from data-requirements.md §14's starter assumptions
table (equipment_type / metric / value range / unit / confidence / source_id) — don't
invent numbers, and don't treat §14 values as final without checking their confidence
column.

Files: mri.json, ct.json, cath-lab.json, dialysis.json, ultrasound.json, custom.json
(matches SPEC.md §9's v1 equipment scope). Each also carries `billedTariffPerUse` and
`launchDelayMonths` fields (added 2026-07-06, see ISSUES.md ISS-9) — these were
previously invented as fake defaults in `content/inputs-metadata.json` instead of
living here; that file no longer holds any numbers, only UI/control schema.

`common-assumptions.json` (new, 2026-07-06) holds financial-model assumptions that are
NOT equipment-specific (discount rate, target IRR, loan interest rate/tenure, working
days per month) — one value, not repeated per equipment. See its own `_note` field and
ISSUES.md ISS-9 for what's still unsourced.
