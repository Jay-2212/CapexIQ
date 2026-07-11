// Scenario / sensitivity analysis — SPEC.md §28

import { irr } from "./irr";
import { npv } from "./npv";
import { monthlyRealizedRevenue } from "./revenue";
import { paybackPeriodFromCashFlows, roi } from "./roi";

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
