// The single canonical wizard-inputs -> full-result pipeline (app/forms/wizard-state.md
// §4: "there is exactly one" derivation the live preview strip and /results dashboard
// both call). Composition order and which cash-flow basis feeds which output is not
// invented here — it's copied exactly from the independently-hand-derived golden
// scenarios in tests/scenarios/ (A: simple cash purchase, B: financed + payer mix +
// DSO, C: non-viable edge cases, D: Custom equipment with zero benchmark data). See
// tests/formulas/computeAssessment.test.ts, which re-asserts this function reproduces
// every one of those golden numbers.

import { billedMonthlyRevenue, monthlyRealizedRevenue } from "./revenue";
import { realizedRevenuePerUse, PayerMixEntry } from "./realization";
import { contributionPerUse, breakEvenUsagePerDay } from "./breakEven";
import {
  maintenanceScheduleForYears,
  MaintenanceScheduleEntry,
} from "./maintenance";
import { monthlyEmi } from "./emi";
import { npv } from "./npv";
import { irr } from "./irr";
import { roi, paybackPeriod, paybackPeriodFromCashFlows } from "./roi";
import { equivalentAnnualCost } from "./eac";
import { discountedPaybackPeriod } from "./discountedPayback";
import { annualStraightLineDepreciation } from "./depreciation";
import {
  investmentOutlookScore,
  InvestmentOutlookResult,
} from "./investmentOutlookScore";
import { peakWorkingCapitalGap } from "./workingCapitalPeak";
import { utilizationFractionForMonth } from "./monthlySeries";

export interface AssessmentPayer {
  payerName: string;
  shareOfVolume: number;
  billedTariff: number;
  /** Already netted for claim deduction/disallowance by the caller — see
   *  app/forms/wizardFields.ts's resolvePayerMix() for the exact combination rule. */
  realizationPercentage: number;
  collectionDelayDays: number;
}

export type AssessmentFinancing =
  | { type: "cash" }
  | {
      type: "loan";
      downPayment: number;
      interestRate: number;
      tenureMonths: number;
    }
  | {
      type: "lease";
      rentalPerMonth: number;
      /** ISS-18 (Jay's decision, 2026-07-13, after an Opus advisor pass): after this
       *  many months the rental stops and the equipment is treated as owned outright
       *  for the rest of usefulLifeYears — a finance/capital-lease model, mirroring
       *  loan's tenureMonths so Lease and Loan are directly comparable over the same
       *  ownership horizon, rather than the rental running for the entire useful life. */
      tenureMonths: number;
    };

export interface AssessmentMaintenance {
  warrantyYears: number;
  cmcYears: number;
  cmcAnnualCost: number;
  amcAnnualCost: number;
  /** Optional per-year override (ISS-19) — index i is year i+1's cost as % of
   *  purchaseCost, applied instead of the warranty/cmc/amc schedule for that year
   *  when non-null. Missing/shorter-than-usefulLifeYears arrays are fine; unset
   *  indices simply keep the computed warranty/cmc/amc schedule. */
  costByYearPct?: (number | null)[];
}

/** Advanced Group B (SPEC.md §11.1 B / §13.2) — utilization ramp-up, each percentage
 *  is "% of mature utilization" (AssessmentInputs.usagePerDay). Optional (ISS-19):
 *  omitted entirely means flat mature usage from month 1, i.e. every consumer below
 *  degenerates to its pre-ramp behavior. */
export interface UtilizationRampUp {
  month1to3Pct: number;
  month4to6Pct: number;
  month7to12Pct: number;
  year2PlusPct: number;
}

export interface AssessmentInputs {
  purchaseCost: number;
  installationCost: number;
  usagePerDay: number;
  workingDaysPerMonth: number;
  payerMix: AssessmentPayer[];
  variableCostPerUse: number;
  fixedCostPerMonth: number;
  financing: AssessmentFinancing;
  maintenance: AssessmentMaintenance;
  usefulLifeYears: number;
  discountRate: number;
  salvageValuePercentage: number;
  utilizationRamp?: UtilizationRampUp;
}

export interface AssessmentResult {
  initialInvestment: number;
  realizedRevenuePerUse: number;
  monthlyRealizedRevenue: number;
  monthlyBilledRevenue: number;
  annualOperatingSurplus: number;
  annualDepreciation: number;
  contributionPerUse: number;
  breakEvenUsagePerDay: number | null;
  maintenanceSchedule: MaintenanceScheduleEntry[];
  annualNetCashFlowsBeforeFinancing: number[];
  annualNetCashFlowsAfterFinancing: number[];
  monthlyEmiOrLease: number | null;
  npv: number;
  irr: number | null;
  roiBilled: number;
  roiRealized: number;
  roiCashFlow: number;
  paybackYears: number;
  paybackYearsFromCashFlows: number;
  discountedPaybackYears: number | null;
  eac: number;
  workingCapitalPeakGap: number;
  workingCapitalPeakGapMonth: number;
  investmentOutlook: InvestmentOutlookResult;
}

function financingCostForYear(
  financing: AssessmentFinancing,
  monthlyPayment: number,
  yearIndex: number
): number {
  if (financing.type === "cash") return 0;

  const remainingMonths = Math.max(
    0,
    financing.tenureMonths - yearIndex * 12
  );
  return monthlyPayment * Math.min(12, remainingMonths);
}

export function computeAssessment(
  inputs: AssessmentInputs
): AssessmentResult {
  const initialInvestment = inputs.purchaseCost + inputs.installationCost;
  const payerMixEntries: PayerMixEntry[] = inputs.payerMix.map((payer) => ({
    payerName: payer.payerName,
    shareOfVolume: payer.shareOfVolume,
    billedTariff: payer.billedTariff,
    realizationPercentage: payer.realizationPercentage,
  }));
  const realizedPerUse = realizedRevenuePerUse(payerMixEntries);
  const billedPerUseWeighted = inputs.payerMix.reduce(
    (total, payer) => total + (payer.shareOfVolume / 100) * payer.billedTariff,
    0
  );
  const monthlyRealized = monthlyRealizedRevenue(
    inputs.usagePerDay,
    realizedPerUse,
    inputs.workingDaysPerMonth
  );
  const monthlyBilled = billedMonthlyRevenue(
    inputs.usagePerDay,
    billedPerUseWeighted,
    inputs.workingDaysPerMonth
  );
  const annualVariableCost =
    inputs.usagePerDay *
    inputs.variableCostPerUse *
    inputs.workingDaysPerMonth *
    12;
  const annualFixedCost = inputs.fixedCostPerMonth * 12;
  const annualOperatingSurplus =
    monthlyRealized * 12 - annualVariableCost - annualFixedCost;
  const contribution = contributionPerUse(
    realizedPerUse,
    inputs.variableCostPerUse
  );
  let breakEven: number | null;
  try {
    breakEven = breakEvenUsagePerDay(
      annualFixedCost / 12,
      contribution,
      inputs.workingDaysPerMonth
    );
  } catch {
    breakEven = null;
  }

  const baseMaintenanceSchedule = maintenanceScheduleForYears(
    inputs.maintenance.warrantyYears,
    inputs.maintenance.cmcYears,
    inputs.maintenance.cmcAnnualCost,
    inputs.maintenance.amcAnnualCost,
    inputs.usefulLifeYears
  );
  const maintenanceSchedule: MaintenanceScheduleEntry[] = baseMaintenanceSchedule.map(
    (entry, yearIndex) => {
      const overridePct = inputs.maintenance.costByYearPct?.[yearIndex];
      if (overridePct === null || overridePct === undefined) return entry;
      return {
        yearNumber: entry.yearNumber,
        coverageType: "override",
        annualCost: (overridePct / 100) * inputs.purchaseCost,
      };
    }
  );

  // ISS-19: month-by-month utilization ramp (SPEC.md §13.2). Building the monthly
  // series first (rather than approximating an annual weighted average) lets both the
  // per-year cash flows below and the existing monthly working-capital calc share one
  // source of truth. Without inputs.utilizationRamp, every fraction is 1 and every
  // consumer below is byte-for-byte identical to the pre-ramp flat computation.
  const totalMonths = inputs.usefulLifeYears * 12;
  const monthlyRealizedSeries = Array.from({ length: totalMonths }, (_, monthIndex) =>
    monthlyRealized * utilizationFractionForMonth(inputs.utilizationRamp, monthIndex)
  );
  const monthlyVariableCostSeries = Array.from({ length: totalMonths }, (_, monthIndex) =>
    (annualVariableCost / 12) * utilizationFractionForMonth(inputs.utilizationRamp, monthIndex)
  );
  const sumMonthsInYear = (series: number[], yearIndex: number) =>
    series
      .slice(yearIndex * 12, yearIndex * 12 + 12)
      .reduce((total, value) => total + value, 0);
  const annualOperatingSurplusByYear = Array.from(
    { length: inputs.usefulLifeYears },
    (_, yearIndex) =>
      sumMonthsInYear(monthlyRealizedSeries, yearIndex) -
      sumMonthsInYear(monthlyVariableCostSeries, yearIndex) -
      annualFixedCost
  );
  const annualNetCashFlowsBeforeFinancing = maintenanceSchedule.map(
    (entry, yearIndex) => annualOperatingSurplusByYear[yearIndex] - entry.annualCost
  );

  const monthlyPayment =
    inputs.financing.type === "loan"
      ? monthlyEmi(
          initialInvestment - inputs.financing.downPayment,
          inputs.financing.interestRate,
          inputs.financing.tenureMonths
        )
      : inputs.financing.type === "lease"
        ? inputs.financing.rentalPerMonth
        : 0;
  const annualNetCashFlowsAfterFinancing =
    annualNetCashFlowsBeforeFinancing.map(
      (cashFlow, yearIndex) =>
        cashFlow -
        financingCostForYear(inputs.financing, monthlyPayment, yearIndex)
    );

  let irrResult: number | null;
  try {
    irrResult = irr(initialInvestment, annualNetCashFlowsAfterFinancing);
  } catch {
    irrResult = null;
  }

  const annualCostsByYear = maintenanceSchedule.map(
    (entry, yearIndex) =>
      sumMonthsInYear(monthlyVariableCostSeries, yearIndex) +
      annualFixedCost +
      entry.annualCost
  );
  const collectionProfiles = inputs.payerMix.map((payer) => ({
    payerName: payer.payerName,
    shareOfVolume: payer.shareOfVolume,
    daysToCollect: payer.collectionDelayDays,
  }));
  const { peakGap, peakMonthIndex } = peakWorkingCapitalGap(
    monthlyRealizedSeries,
    collectionProfiles
  );

  const discountedPaybackYears = discountedPaybackPeriod(
    initialInvestment,
    annualNetCashFlowsAfterFinancing,
    inputs.discountRate
  );

  return {
    initialInvestment,
    realizedRevenuePerUse: realizedPerUse,
    monthlyRealizedRevenue: monthlyRealized,
    monthlyBilledRevenue: monthlyBilled,
    annualOperatingSurplus,
    annualDepreciation: annualStraightLineDepreciation(
      inputs.purchaseCost,
      inputs.purchaseCost * (inputs.salvageValuePercentage / 100),
      inputs.usefulLifeYears
    ),
    contributionPerUse: contribution,
    breakEvenUsagePerDay: breakEven,
    maintenanceSchedule,
    annualNetCashFlowsBeforeFinancing,
    annualNetCashFlowsAfterFinancing,
    monthlyEmiOrLease: inputs.financing.type === "cash" ? null : monthlyPayment,
    npv: npv(inputs.discountRate, initialInvestment, annualNetCashFlowsAfterFinancing),
    irr: irrResult,
    roiBilled: roi(
      monthlyBilled * 12 - annualVariableCost - annualFixedCost,
      initialInvestment,
      "billed"
    ),
    roiRealized: roi(annualOperatingSurplus, initialInvestment, "realized"),
    roiCashFlow: roi(
      annualNetCashFlowsAfterFinancing[0] ?? 0,
      initialInvestment,
      "cash-flow"
    ),
    paybackYears: paybackPeriod(initialInvestment, annualOperatingSurplus),
    paybackYearsFromCashFlows: paybackPeriodFromCashFlows(
      initialInvestment,
      annualNetCashFlowsAfterFinancing
    ),
    discountedPaybackYears,
    eac: equivalentAnnualCost(
      initialInvestment,
      annualCostsByYear,
      inputs.discountRate,
      inputs.usefulLifeYears
    ),
    workingCapitalPeakGap: peakGap,
    workingCapitalPeakGapMonth: peakMonthIndex,
    investmentOutlook: investmentOutlookScore({
      irr: irrResult,
      discountRate: inputs.discountRate,
      npv: npv(
        inputs.discountRate,
        initialInvestment,
        annualNetCashFlowsAfterFinancing
      ),
      initialInvestment,
      discountedPaybackYears,
      usefulLifeYears: inputs.usefulLifeYears,
      financingType: inputs.financing.type,
      monthlyOperatingCashFlowBeforeEmi: annualOperatingSurplus / 12,
      monthlyEmi: monthlyPayment,
      usagePerDay: inputs.usagePerDay,
      breakEvenUsagePerDay: breakEven,
    }),
  };
}
