// Automatic price-increase suggestion — financial-model-spec.md §4

import { runScenario, ScenarioAssumptions } from "./sensitivity";

export interface ActionableInsightInputs {
  assumptions: ScenarioAssumptions;
  usefulLifeYears: number;
}

export interface ActionablePriceInsight {
  priceIncreasePercentage: number;
  priceIncreaseAmount: number;
  startYear: number;
  baselinePaybackYears: number;
  scenarioPaybackYears: number;
  paybackImprovementMonths: number;
}

export function actionablePriceIncreaseInsight(
  inputs: ActionableInsightInputs
): ActionablePriceInsight | null {
  const baselinePaybackYears = runScenario(inputs.assumptions).paybackYears;
  const deltas = [2, 5, 8, 10, 15];
  const maximumStartYear = Math.floor(inputs.usefulLifeYears / 2);
  const startYears = [1, 2, 3].filter(
    (startYear) => startYear <= maximumStartYear
  );
  const qualifying: ActionablePriceInsight[] = [];

  deltas.forEach((priceIncreasePercentage) => {
    startYears.forEach((startYear) => {
      const scenarioPaybackYears = runScenario({
        ...inputs.assumptions,
        tariffIncreasePercentage: priceIncreasePercentage,
        tariffIncreaseStartYear: startYear,
      }).paybackYears;
      const paybackImprovementMonths =
        (baselinePaybackYears - scenarioPaybackYears) * 12;

      if (paybackImprovementMonths >= 6) {
        qualifying.push({
          priceIncreasePercentage,
          priceIncreaseAmount:
            Math.round(
              (inputs.assumptions.billedTariffPerUse *
                (priceIncreasePercentage / 100)) /
                5
            ) * 5,
          startYear,
          baselinePaybackYears,
          scenarioPaybackYears,
          paybackImprovementMonths,
        });
      }
    });
  });

  qualifying.sort(
    (left, right) =>
      left.priceIncreasePercentage - right.priceIncreasePercentage ||
      left.startYear - right.startYear ||
      right.paybackImprovementMonths - left.paybackImprovementMonths
  );

  return qualifying[0] ?? null;
}
