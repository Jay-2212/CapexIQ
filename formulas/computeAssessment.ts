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
  | { type: "lease"; rentalPerMonth: number };

export interface AssessmentMaintenance {
  warrantyYears: number;
  cmcYears: number;
  cmcAnnualCost: number;
  amcAnnualCost: number;
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
  if (financing.type === "lease") return monthlyPayment * 12;

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

  const maintenanceSchedule = maintenanceScheduleForYears(
    inputs.maintenance.warrantyYears,
    inputs.maintenance.cmcYears,
    inputs.maintenance.cmcAnnualCost,
    inputs.maintenance.amcAnnualCost,
    inputs.usefulLifeYears
  );
  const annualNetCashFlowsBeforeFinancing = maintenanceSchedule.map(
    (entry) => annualOperatingSurplus - entry.annualCost
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
    (entry) => annualVariableCost + annualFixedCost + entry.annualCost
  );
  const monthlyRealizedSeries = Array.from(
    { length: inputs.usefulLifeYears * 12 },
    () => monthlyRealized
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
