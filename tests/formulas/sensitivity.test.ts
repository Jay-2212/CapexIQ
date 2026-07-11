import { describe, expect, it } from "vitest";

import { runScenario, ScenarioAssumptions } from "../../formulas/sensitivity";

const baseAssumptions: ScenarioAssumptions = {
  usagePerDay: 10,
  realizationPercentage: 80,
  financingType: "cash",
  billedTariffPerUse: 1000,
  workingDaysPerMonth: 25,
  annualOperatingCost: 1200000,
  annualFinancingCost: 0,
  initialInvestment: 1800000,
  discountRate: 10,
  projectionYears: 5,
};

describe("runScenario", () => {
  it("wires revenue, ROI, payback, NPV, and IRR for a clean scenario", () => {
    const result = runScenario(baseAssumptions);

    expect(result.annualNetCashFlows).toEqual([1200000, 1200000, 1200000, 1200000, 1200000]);
    expect(result.roi).toBeCloseTo(66.66666666666666, 8);
    expect(result.paybackYears).toBe(1.5);
    expect(result.irr).not.toBeNull();
  });

  it("applies financing cost and a future tariff increase in a messy scenario", () => {
    const result = runScenario({
      ...baseAssumptions,
      usagePerDay: 18.5,
      realizationPercentage: 87.25,
      financingType: "loan",
      billedTariffPerUse: 7425.75,
      workingDaysPerMonth: 24,
      annualOperatingCost: 11250000.5,
      annualFinancingCost: 318450.75,
      initialInvestment: 5750000,
      discountRate: 12.5,
      tariffIncreasePercentage: 5,
      tariffIncreaseStartYear: 2,
    });

    expect(result.annualNetCashFlows[1]).toBeGreaterThan(result.annualNetCashFlows[0]);
    expect(result.npv).toBeTypeOf("number");
  });

  it("returns null IRR and infinite payback when cash flows never become positive", () => {
    const result = runScenario({ ...baseAssumptions, usagePerDay: 0 });

    expect(result.irr).toBeNull();
    expect(result.paybackYears).toBe(Infinity);
  });
});
