// Scenario / sensitivity analysis — SPEC.md §28

import { irr } from "./irr";
import { npv } from "./npv";
import { monthlyRealizedRevenue } from "./revenue";
import { paybackPeriodFromCashFlows, roi } from "./roi";
import type { AssessmentInputs, AssessmentResult } from "./computeAssessment";
import {
  weightedAverageBilledTariff,
  weightedAverageRealization,
} from "./assessmentOverrides";

export interface ScenarioAssumptions {
  usagePerDay: number;
  realizationPercentage: number;
  financingType: "cash" | "loan" | "lease";
  billedTariffPerUse: number;
  workingDaysPerMonth: number;
  annualOperatingCost: number;
  annualFinancingCost: number;
  initialInvestment: number;
  discountRate: number;
  projectionYears: number;
  tariffIncreasePercentage?: number;
  tariffIncreaseStartYear?: number;
}

export interface ScenarioResult {
  roi: number;
  paybackYears: number;
  npv: number;
  irr: number | null;
  annualNetCashFlows: number[];
}

export function runScenario(assumptions: ScenarioAssumptions): ScenarioResult {
  const annualNetCashFlows = Array.from(
    { length: assumptions.projectionYears },
    (_, yearIndex) => {
      const yearNumber = yearIndex + 1;
      const tariffIncreaseApplies =
        assumptions.tariffIncreasePercentage !== undefined &&
        assumptions.tariffIncreaseStartYear !== undefined &&
        yearNumber >= assumptions.tariffIncreaseStartYear;
      const tariffMultiplier = tariffIncreaseApplies
        ? 1 + assumptions.tariffIncreasePercentage! / 100
        : 1;
      const realizedRevenuePerUse =
        assumptions.billedTariffPerUse *
        tariffMultiplier *
        (assumptions.realizationPercentage / 100);
      const annualRevenue =
        monthlyRealizedRevenue(
          assumptions.usagePerDay,
          realizedRevenuePerUse,
          assumptions.workingDaysPerMonth
        ) * 12;
      const financingCost =
        assumptions.financingType === "cash"
          ? 0
          : assumptions.annualFinancingCost;

      return annualRevenue - assumptions.annualOperatingCost - financingCost;
    }
  );
  const firstYearNetCashFlow = annualNetCashFlows[0] ?? 0;
  let scenarioIrr: number | null = null;

  try {
    scenarioIrr = irr(assumptions.initialInvestment, annualNetCashFlows);
  } catch {
    scenarioIrr = null;
  }

  return {
    roi: roi(firstYearNetCashFlow, assumptions.initialInvestment, "cash-flow"),
    paybackYears: paybackPeriodFromCashFlows(
      assumptions.initialInvestment,
      annualNetCashFlows
    ),
    npv: npv(
      assumptions.discountRate,
      assumptions.initialInvestment,
      annualNetCashFlows
    ),
    irr: scenarioIrr,
    annualNetCashFlows,
  };
}

/** Derives a runScenario baseline from the canonical AssessmentInputs/AssessmentResult
 *  pair — never invents its own assumptions, just reshapes already-computed canonical
 *  values into ScenarioAssumptions' flatter shape. Used by both the continuous
 *  sensitivity slider's tariff/payback context and the automatic actionable insight
 *  (financial-model-spec.md §4), so the two features' "no tariff increase" baseline
 *  agree with each other even though they're not compared against the dashboard's own
 *  computeAssessment figures byte-for-byte (this simplified model has no utilization
 *  ramp, per-year maintenance schedule, or payer-mix granularity — an accepted,
 *  Jay-approved tradeoff for this passive/interactive-only surface, not a bug). */
export function deriveScenarioAssumptions(
  inputs: AssessmentInputs,
  result: AssessmentResult
): ScenarioAssumptions {
  const annualRealizedRevenue = result.monthlyRealizedRevenue * 12;
  const annualOperatingCost = annualRealizedRevenue - result.annualOperatingSurplus;
  const annualFinancingCost = result.monthlyEmiOrLease
    ? result.monthlyEmiOrLease * 12
    : 0;

  return {
    usagePerDay: inputs.usagePerDay,
    realizationPercentage: weightedAverageRealization(inputs),
    financingType: inputs.financing.type,
    billedTariffPerUse: weightedAverageBilledTariff(inputs),
    workingDaysPerMonth: inputs.workingDaysPerMonth,
    annualOperatingCost,
    annualFinancingCost,
    initialInvestment: result.initialInvestment,
    discountRate: inputs.discountRate,
    projectionYears: inputs.usefulLifeYears,
  };
}
