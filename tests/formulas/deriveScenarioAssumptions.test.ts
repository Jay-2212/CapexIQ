// deriveScenarioAssumptions bridges the canonical computeAssessment()
// AssessmentInputs/AssessmentResult pair into runScenario's flatter ScenarioAssumptions
// shape — used by both the continuous sensitivity strip's baseline and the automatic
// actionable insight (financial-model-spec.md §4). This test checks the derivation
// itself is faithful to the canonical inputs, not that runScenario's own numbers match
// computeAssessment's (they deliberately don't, for a cash + no-ramp + no-maintenance
// scenario the two models agree closely, which this test also spot-checks).

import { describe, expect, it } from "vitest";

import { computeAssessment } from "../../formulas/computeAssessment";
import type { AssessmentInputs } from "../../formulas/computeAssessment";
import { deriveScenarioAssumptions, runScenario } from "../../formulas/sensitivity";

const cashNoRampInputs: AssessmentInputs = {
  purchaseCost: 2_000_000,
  installationCost: 100_000,
  usagePerDay: 10,
  workingDaysPerMonth: 25,
  payerMix: [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
  ],
  variableCostPerUse: 50,
  fixedCostPerMonth: 45_000,
  financing: { type: "cash" },
  maintenance: { warrantyYears: 8, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 0 },
  usefulLifeYears: 8,
  discountRate: 12.5,
  salvageValuePercentage: 5,
};

describe("deriveScenarioAssumptions", () => {
  it("carries usage, tariff, discount rate, and horizon straight from the canonical inputs", () => {
    const result = computeAssessment(cashNoRampInputs);
    const assumptions = deriveScenarioAssumptions(cashNoRampInputs, result);

    expect(assumptions.usagePerDay).toBe(10);
    expect(assumptions.billedTariffPerUse).toBe(800);
    expect(assumptions.realizationPercentage).toBe(100);
    expect(assumptions.financingType).toBe("cash");
    expect(assumptions.workingDaysPerMonth).toBe(25);
    expect(assumptions.discountRate).toBe(12.5);
    expect(assumptions.projectionYears).toBe(8);
    expect(assumptions.initialInvestment).toBe(result.initialInvestment);
  });

  it("produces a runScenario baseline that closely matches computeAssessment for a flat, unramped, no-maintenance scenario", () => {
    const result = computeAssessment(cashNoRampInputs);
    const assumptions = deriveScenarioAssumptions(cashNoRampInputs, result);
    const scenarioResult = runScenario(assumptions);

    expect(scenarioResult.npv).toBeCloseTo(result.npv, 0);
    expect(scenarioResult.paybackYears).toBeCloseTo(result.paybackYearsFromCashFlows, 4);
  });
});
