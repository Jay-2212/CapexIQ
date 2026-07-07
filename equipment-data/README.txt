Equipment assumption data files — CapexIQ (per SPEC.md §32.1: "equipment assumptions
should live in editable data files").

Status: partially populated as of 2026-07-07 — purchaseCost/usefulLifeYears/salvage/
installation/warranty/cmc/amc/financing fields are still schema-shaped placeholders
(the original §14 starter pass hasn't been fully applied yet, see ISSUES.md ISS-3);
typicalUtilization.usagePerDay, billedTariffPerUse, and launchDelayMonths were
populated from a second research pass (data-requirements.md §17) and cath-lab/dialysis
purchaseCost were also updated from that pass. Several fields remain deliberately null
where two research passes confirmed no real data exists (see each file's own field
notes and ISSUES.md ISS-9) — don't fill those with an invented number.

Each file should be populated from data-requirements.md §14's starter assumptions
table plus §17's second-pass findings (equipment_type / metric / value range / unit /
confidence / source_id) — don't invent numbers, and don't treat any value as final
without checking its confidence column.

Files: mri.json, ct.json, cath-lab.json, dialysis.json, ultrasound.json, custom.json
(matches SPEC.md §9's v1 equipment scope). Each also carries `billedTariffPerUse` and
`launchDelayMonths` fields (added 2026-07-06, see ISSUES.md ISS-9) — these were
previously invented as fake defaults in `content/inputs-metadata.json` instead of
living here; that file no longer holds any numbers, only UI/control schema.

`common-assumptions.json` (new, 2026-07-06) holds financial-model assumptions that are
NOT equipment-specific (discount rate, target IRR, loan interest rate/tenure, working
days per month) — one value, not repeated per equipment. See its own `_note` field and
ISSUES.md ISS-9 for what's still unsourced.
