Equipment assumption data files — CapexIQ (per SPEC.md §32.1: "equipment assumptions
should live in editable data files").

Status: **effectively complete as of 2026-07-11 (Phase 1 closed)** — five research
passes (data-requirements.md §12-§20) have populated every field that has a
responsible source, with honest confidence/sourceId tracking throughout. Every
remaining `null` is deliberate, not an oversight: target IRR/hurdle rate and standalone
CT utilization are confirmed unresearchable after five passes (see ISSUES.md ISS-9,
data-requirements.md §17.2/§18.7/§20); payer mix, DSO, specialist fees, and vendor
quotes stay permanently user-entered by design, not a research gap (ISSUES.md ISS-4,
data-requirements.md §7.3). Don't fill any of these with an invented number.

Files: mri.json, ct.json, cath-lab.json, dialysis.json, ultrasound.json, custom.json
(matches SPEC.md §9's v1 equipment scope; `custom.json` stays a pure placeholder — no
equipment type to research). Each also carries `billedTariffPerUse` and
`launchDelayMonths` fields — see ISSUES.md ISS-9 for the history of why these live
here and not in `content/inputs-metadata.json` (UI/control schema only, zero numbers).

`common-assumptions.json` holds financial-model assumptions that are NOT
equipment-specific (discount rate, target IRR, loan interest rate/tenure, working days
per month) — one value, not repeated per equipment. See its own `_note` field and
ISSUES.md ISS-9 for what's still `"Unavailable"` and why.
