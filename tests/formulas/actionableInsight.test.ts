import { describe, expect, it } from "vitest";

import { actionablePriceIncreaseInsight } from "../../formulas/actionableInsight";
import { ScenarioAssumptions } from "../../formulas/sensitivity";

const assumptions: ScenarioAssumptions = {
  usagePerDay: 10,
  realizationPercentage: 100,
  financingType: "cash",
  billedTariffPerUse: 1000,
  workingDaysPerMonth: 25,
  annualOperatingCost: 1800000,
  annualFinancingCost: 0,
  initialInvestment: 4000000,
  discountRate: 10,
  projectionYears: 10,
};

describe("actionablePriceIncreaseInsight", () => {
  it("selects the smallest qualifying increase and earliest start year", () => {
    const result = actionablePriceIncreaseInsight({ assumptions, usefulLifeYears: 10 });

    expect(result).not.toBeNull();
    expect(result?.priceIncreasePercentage).toBe(8);
    expect(result?.startYear).toBe(1);
  });

  it("returns the same messy-number suggestion on repeated runs", () => {
    const inputs = {
      assumptions: {
        ...assumptions,
        usagePerDay: 13.75,
        billedTariffPerUse: 1477.5,
        realizationPercentage: 87.5,
        annualOperatingCost: 2654321.25,
        initialInvestment: 5750000,
      },
      usefulLifeYears: 13,
    };

    expect(actionablePriceIncreaseInsight(inputs)).toEqual(
      actionablePriceIncreaseInsight(inputs)
    );
  });

  it("returns null when no price increase improves payback by six months", () => {
    expect(
      actionablePriceIncreaseInsight({
        assumptions: { ...assumptions, initialInvestment: 100000 },
        usefulLifeYears: 10,
      })
    ).toBeNull();
  });
});
