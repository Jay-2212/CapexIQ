Equipment assumption data files — CapexIQ (per SPEC.md §32.1: "equipment assumptions
should live in editable data files").

Status: schema-shaped placeholders only, not real data. See ISSUES.md ISS-3.

Each file should be populated from data-requirements.md §14's starter assumptions
table (equipment_type / metric / value range / unit / confidence / source_id) — don't
invent numbers, and don't treat §14 values as final without checking their confidence
column.

Files: mri.json, ct.json, cath-lab.json, dialysis.json, ultrasound.json, custom.json
(matches SPEC.md §9's v1 equipment scope).
