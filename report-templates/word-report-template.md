# Word report template — Proposal Report.docx

Phase 8 (`agent-build-plan.md`), per SPEC.md §29.4. Section-by-section structure for
`exports/word-generator.ts`, written before that generator per Phase 5's "doc before
code" pattern. Every number in every section below is read directly off the one
`AssessmentResult` (`formulas/computeAssessment.ts`) / `MonthlySeries`
(`formulas/monthlySeries.ts`) the caller already computed — the generator takes those
objects as parameters, it never calls `computeAssessment`/`buildMonthlySeries` itself
and never re-derives a number a different way than the dashboard already did
(CONVENTIONS.md §3; this is also how the DoD's "must reflect the exact same numbers
shown on the dashboard" gets satisfied by construction rather than by a side-by-side
check after the fact).

| # | Section | Source |
|---|---|---|
| 1 | **Executive summary** | The narrative sentence pattern from SPEC.md §30, built from `result.paybackYearsFromCashFlows`, `result.roiRealized`, `result.workingCapitalPeakGap`/`workingCapitalPeakGapMonth`, and the Investment Outlook band/driver (`result.investmentOutlook`) — the same fields `app/(assessment)/results/page.tsx` already renders, phrased as prose instead of cards. |
| 2 | **Investment overview** | Hospital name / equipment category (from the wizard's pre-step, passed in as plain strings — never re-derived), `result.initialInvestment`, useful life, financing type in plain words ("purchased outright" / "financed via loan" / "leased"). |
| 3 | **Key assumptions** | A table mirroring the Excel Assumptions tab's rows (usage/day, working days/month, payer mix, cost, maintenance, discount rate) — same labels, same values, so a reader cross-referencing the two documents sees identical numbers. |
| 4 | **Financial results** | A table: NPV, IRR (or "Undefined" when `result.irr === null`), simple payback, discounted payback (or "Beyond useful life" when `null`), ROI (billed/realized/cash-flow views), EAC, Investment Outlook score and band. |
| 5 | **Billed vs. realized revenue note** | One paragraph contrasting `result.monthlyBilledRevenue` and `result.monthlyRealizedRevenue` (×12 for annual) — explains the payer-mix/realization haircut in plain language, referencing `report-templates/methodology.md`'s existing explanation rather than re-authoring it. |
| 6 | **Cash-flow and working-capital note** | `result.workingCapitalPeakGap`/`workingCapitalPeakGapMonth` in a sentence, plus the cumulative cash-flow chart image (§8). |
| 7 | **Financing summary** | `result.monthlyEmiOrLease` and the financing type's own terms (down payment / interest rate / tenure for a loan; rental for a lease); omitted entirely for a cash purchase rather than shown as a zero. |
| 8 | **Charts** | **Deferred, not silently dropped (2026-07-13 scoping call, see `ISSUES.md`)** — rasterized chart images are a fast-follow, for the same reason given in `excel-sheet-structure.md`'s Tab 6 (this phase's DoD is about live formulas, not images; no headless Excel/renderer verification is available in this environment). In their place: the same cumulative cash-flow and break-even comparison figures as a plain table, matching the Excel Charts tab exactly. |
| 9 | **Risk notes** | `app/components/riskNotes.ts`'s `deriveRiskNotes()` — the exact same plain-language risk notes the Results page's `RiskCallout` renders, reused directly (extracted from that component during this phase specifically so this section isn't a second copy of that logic). |
| 10 | **Methodology** | A condensed version of `report-templates/methodology.md` — its section headers and one-paragraph summaries, not the full worked example (keeps the standalone document a reasonable length; the live site's `/methodology` page remains the full version, linked by URL in the doc's footer). |
| 11 | **Formula appendix** | The same formula-notes content object the Excel "Formula Notes" tab uses (see `excel-sheet-structure.md` Tab 7) — one shared source, rendered as Word paragraphs instead of a sheet. |
| 12 | **Disclaimer** | `report-templates/disclaimer.md`'s full text, verbatim — never paraphrased, since this is the actual legal/financial disclaimer, not descriptive copy. |

## Structural notes

- **Heading styles:** use `docx`'s built-in heading levels (`HeadingLevel.HEADING_1`
  for each numbered section above, `HEADING_2` for sub-points) rather than manually
  bolded/sized paragraphs, so the result has a real, navigable Word outline.
- **Numbers:** every currency/percentage/year figure uses the same
  `app/components/formatting.ts` functions (`formatInr`, `formatPercent`,
  `formatYears`) the dashboard uses — not a separate Word-only number formatter that
  could silently format the same number differently.
- **Fonts/colors:** body text in a standard serif/sans document font (Word's own
  default, "Aptos"/"Calibri") rather than importing `IBM Plex Sans`/`Mono` — those are
  web fonts with no guarantee of being installed on the reader's machine, and `docx`
  can't embed a `.woff2`. Chart images (§8) keep the app's own chart colors
  (`design/tokens.css`'s `--chart-*` hex values) since those are baked into the image,
  not live text.
- **No internal identifiers:** matching `ux-product-spec.md`'s public-voice rule
  already enforced on the live site, this document never prints a `/formulas` file
  name, a driver ID, or an audit note — only the same plain-language copy the
  dashboard itself shows.
