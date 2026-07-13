// SPEC.md §29 / Phase 8, per report-templates/word-report-template.md's 12-section
// contract. Every number below is read directly off the AssessmentInputs/
// AssessmentResult/MonthlySeries the caller already computed — this module never
// calls computeAssessment()/buildMonthlySeries() itself and never re-derives a figure
// a different way than the dashboard already did (CONVENTIONS.md §3), which is how
// the DoD's "must reflect the exact same numbers shown on the dashboard" is satisfied
// by construction. No chart images this phase — see the template doc's §8 note
// (deferred, not dropped, same reasoning as the Excel export's Charts tab).

import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { AssessmentInputs, AssessmentResult } from "../formulas/computeAssessment";
import { cumulativeCashFlowSeries } from "../formulas/roi";
import { deriveRiskNotes } from "../app/components/riskNotes";
import { formatInr, formatPercent, formatYears } from "../app/components/formatting";

const PAYER_LABELS = ["Private cash", "Insurance / TPA", "Corporate credit", "PM-JAY / government", "Other"];

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}

function para(text: string) {
  return new Paragraph({ children: [new TextRun(text)] });
}

function simpleTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({ children: [para(label)], width: { size: 45, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [para(value)], width: { size: 55, type: WidthType.PERCENTAGE } }),
          ],
        })
    ),
  });
}

function financingSummary(inputs: AssessmentInputs, result: AssessmentResult): [string, string][] {
  if (inputs.financing.type === "cash") return [["Financing", "Purchased outright (cash)"]];
  if (inputs.financing.type === "loan") {
    return [
      ["Financing", "Financed via loan"],
      ["Down payment", formatInr(inputs.financing.downPayment)],
      ["Interest rate", formatPercent(inputs.financing.interestRate)],
      ["Tenure", `${inputs.financing.tenureMonths} months`],
      ["Monthly EMI", formatInr(result.monthlyEmiOrLease ?? 0)],
    ];
  }
  return [
    ["Financing", "Leased"],
    ["Monthly rental", formatInr(inputs.financing.rentalPerMonth)],
    ["Tenure before outright ownership", `${inputs.financing.tenureMonths} months`],
  ];
}

export async function generateWordProposal(
  inputs: AssessmentInputs,
  result: AssessmentResult,
  context: { hospitalName: string; equipmentCategory: string }
): Promise<Uint8Array> {
  const cashFlowSeries = cumulativeCashFlowSeries(result.initialInvestment, result.annualNetCashFlowsAfterFinancing);
  const outlook = result.investmentOutlook;

  const executiveSummary = para(
    `Based on the entered assumptions, the proposed ${context.equipmentCategory} investment shows ` +
      `a simple payback period of ${formatYears(result.paybackYearsFromCashFlows)} and an estimated ROI ` +
      `of ${formatPercent(result.roiRealized)} on the realized-revenue view. The Investment Outlook is ` +
      `${outlook.band} (${outlook.score}/100)${
        result.workingCapitalPeakGap > 0
          ? `; the project may require approximately ${formatInr(result.workingCapitalPeakGap)} of working ` +
            `capital support around month ${result.workingCapitalPeakGapMonth + 1}`
          : ""
      }.`
  );

  const riskNotes = deriveRiskNotes({
    outlook,
    usagePerDay: inputs.usagePerDay,
    breakEvenUsagePerDay: result.breakEvenUsagePerDay,
    workingCapitalPeakGap: result.workingCapitalPeakGap,
    workingCapitalPeakGapMonth: result.workingCapitalPeakGapMonth,
  });

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: `${context.hospitalName} — ${context.equipmentCategory} investment proposal`,
      heading: HeadingLevel.TITLE,
    }),

    heading("1. Executive summary"),
    executiveSummary,

    heading("2. Investment overview"),
    simpleTable([
      ["Hospital", context.hospitalName],
      ["Equipment", context.equipmentCategory],
      ["Initial investment", formatInr(result.initialInvestment)],
      ["Useful life", `${inputs.usefulLifeYears} years`],
      ["Financing", financingSummary(inputs, result)[0][1]],
    ]),

    heading("3. Key assumptions"),
    simpleTable([
      ["Usage per day", `${inputs.usagePerDay}`],
      ["Working days per month", `${inputs.workingDaysPerMonth}`],
      ["Variable cost per use", formatInr(inputs.variableCostPerUse)],
      ["Fixed cost per month", formatInr(inputs.fixedCostPerMonth)],
      ["Discount rate", formatPercent(inputs.discountRate)],
      ["Salvage value", formatPercent(inputs.salvageValuePercentage)],
      ["Warranty years", `${inputs.maintenance.warrantyYears}`],
      ["CMC years / annual cost", `${inputs.maintenance.cmcYears} / ${formatInr(inputs.maintenance.cmcAnnualCost)}`],
      ["AMC annual cost", formatInr(inputs.maintenance.amcAnnualCost)],
    ]),
    para("Payer mix:"),
    simpleTable(
      inputs.payerMix.map((payer, i) => [
        PAYER_LABELS[i] ?? payer.payerName,
        `${payer.shareOfVolume}% share, ${formatInr(payer.billedTariff)} tariff, ${formatPercent(
          payer.realizationPercentage
        )} realization, ${payer.collectionDelayDays}-day collection`,
      ])
    ),

    heading("4. Financial results"),
    simpleTable([
      ["NPV", formatInr(result.npv)],
      ["IRR", result.irr === null ? "Undefined" : formatPercent(result.irr)],
      ["Simple payback", formatYears(result.paybackYearsFromCashFlows)],
      [
        "Discounted payback",
        result.discountedPaybackYears === null ? "Beyond useful life" : formatYears(result.discountedPaybackYears),
      ],
      ["ROI — billed view", formatPercent(result.roiBilled)],
      ["ROI — realized view", formatPercent(result.roiRealized)],
      ["ROI — cash-flow view", formatPercent(result.roiCashFlow)],
      ["Equivalent annual cost", formatInr(result.eac)],
      ["Investment Outlook", `${outlook.band} (${outlook.score}/100)`],
    ]),

    heading("5. Billed vs. realized revenue"),
    para(
      `Billed revenue reflects the full tariff charged (${formatInr(result.monthlyBilledRevenue)}/month); realized ` +
        `revenue (${formatInr(result.monthlyRealizedRevenue)}/month) nets out each payer type's realization % — ` +
        `the portion actually collectible after claim deduction/disallowance. The gap between the two is the ` +
        `payer-mix and realization assumption, not a cost — see the Methodology section for the full waterfall.`
    ),

    heading("6. Cash flow and working capital"),
    para(
      result.workingCapitalPeakGap > 0
        ? `Collection delays across the payer mix create a peak working-capital gap of approximately ` +
          `${formatInr(result.workingCapitalPeakGap)} around month ${result.workingCapitalPeakGapMonth + 1}.`
        : "No material working-capital gap — collections keep pace with realized revenue throughout the projection."
    ),
    para("Cumulative cash position by year (starting at -initial investment):"),
    simpleTable(cashFlowSeries.map((value, i) => [`Year ${i + 1}`, formatInr(value)])),

    heading("7. Financing summary"),
    ...(inputs.financing.type === "cash"
      ? [para("Purchased outright — no financing terms apply.")]
      : [simpleTable(financingSummary(inputs, result))]),

    heading("8. Charts"),
    para(
      "Chart images are deferred to a fast-follow (see report-templates/word-report-template.md §8); the same " +
        "figures are captured as data above (§6) and below."
    ),
    simpleTable([
      ["Expected usage per day", `${inputs.usagePerDay}`],
      [
        "Break-even usage per day",
        result.breakEvenUsagePerDay === null
          ? "Undefined — never breaks even"
          : result.breakEvenUsagePerDay.toFixed(1),
      ],
    ]),

    heading("9. Risk notes"),
    ...(riskNotes.length === 0
      ? [para('No major risk flags — every scored dimension sits at or above the "Moderate" floor.')]
      : riskNotes.map((note) => new Paragraph({ text: note, bullet: { level: 0 } }))),

    heading("10. Methodology"),
    para(
      "Usage per day, working days per month, and payer-mix tariffs first produce billed and realized monthly " +
        "revenue; payer-wise collection delay then shifts realized revenue into cash received by month. " +
        "Variable, fixed, and maintenance (warranty -> CMC -> AMC) costs are subtracted to reach operating " +
        "surplus; financing cost (EMI or lease rental) is subtracted to reach net cash flow after financing. " +
        "NPV, IRR, ROI, payback, and the discounted payback period are computed from that cash-flow series. " +
        "The Investment Outlook score combines four weighted sub-scores (return strength, speed to payback, " +
        "financing resilience, operational margin of safety) into a single 0-100 figure. Full detail: the live " +
        "site's Methodology page."
    ),

    heading("11. Formula appendix"),
    simpleTable([
      ["Billed monthly revenue", "Usage/day x Average billed revenue per use x Working days/month"],
      [
        "Realized revenue per use",
        "Volume-weighted average across payer types of (share % x tariff x realization %)",
      ],
      ["Break-even usage per day", "Fixed monthly cost / Contribution per use / Working days per month"],
      ["NPV", "Sum of discounted cash flows minus the initial investment"],
      ["IRR", "The discount rate at which NPV = 0"],
      ["EMI", "Standard amortizing-loan formula (or straight division at 0% interest)"],
    ]),

    heading("12. Disclaimer"),
    para(
      "This tool is a decision-support calculator, not financial, investment, tax, or legal advice. Every " +
        "figure in this report is calculated from the assumptions entered, combined in some cases with " +
        "directional industry benchmarks — it does not represent a guarantee, forecast, or professional " +
        "appraisal. Replace every benchmark-sourced figure with your own vendor quotation, tariff sheet, payer " +
        "contracts, and lender's actual sanction terms wherever available, and have the resulting model " +
        "reviewed by your organization's finance team, chartered accountant, or financial advisor before using " +
        "it to support an actual capital expenditure decision, loan application, or board presentation. Actual " +
        "utilization, realization, collection timelines, maintenance costs, and financing terms will differ " +
        'from any assumption entered here. This tool and its output are provided "as is," without warranty of ' +
        "any kind, and its creators accept no liability for decisions made on the basis of its output."
    ),
  ];

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}
