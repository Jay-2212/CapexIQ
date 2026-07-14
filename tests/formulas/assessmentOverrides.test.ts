import { describe, expect, it } from "vitest";

import {
  applyAssessmentOverrides,
  weightedAverageBilledTariff,
  weightedAverageRealization,
} from "../../formulas/assessmentOverrides";
import type { AssessmentInputs } from "../../formulas/computeAssessment";

const baseInputs: AssessmentInputs = {
  purchaseCost: 2_000_000,
  installationCost: 100_000,
  usagePerDay: 10,
  workingDaysPerMonth: 25,
  payerMix: [
    { payerName: "cash", shareOfVolume: 60, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
    { payerName: "insurance", shareOfVolume: 40, billedTariff: 1000, realizationPercentage: 80, collectionDelayDays: 30 },
  ],
  variableCostPerUse: 50,
  fixedCostPerMonth: 45_000,
  financing: { type: "cash" },
  maintenance: { warrantyYears: 5, cmcYears: 2, cmcAnnualCost: 60_000, amcAnnualCost: 40_000 },
  usefulLifeYears: 8,
  discountRate: 12.5,
  salvageValuePercentage: 5,
};

describe("weightedAverageRealization", () => {
  it("weights each payer's realization % by its share of volume", () => {
    expect(weightedAverageRealization(baseInputs)).toBeCloseTo(60 * 1 + 40 * 0.8, 6); // 92
  });

  it("returns 0 for an empty payer mix instead of dividing by zero", () => {
    expect(weightedAverageRealization({ ...baseInputs, payerMix: [] })).toBe(0);
  });
});

describe("weightedAverageBilledTariff", () => {
  it("weights each payer's billed tariff by its share of volume", () => {
    expect(weightedAverageBilledTariff(baseInputs)).toBeCloseTo(0.6 * 800 + 0.4 * 1000, 6); // 880
  });
});

describe("applyAssessmentOverrides", () => {
  it("overrides purchaseCost and usagePerDay while leaving everything else untouched", () => {
    const overridden = applyAssessmentOverrides(baseInputs, {
      purchaseCost: 3_000_000,
      usagePerDay: 15,
    });

    expect(overridden.purchaseCost).toBe(3_000_000);
    expect(overridden.usagePerDay).toBe(15);
    expect(overridden.installationCost).toBe(baseInputs.installationCost);
    expect(overridden.payerMix).toEqual(baseInputs.payerMix);
  });

  it("applies billedTariffPerUse and realizationPercentage uniformly across every payer", () => {
    const overridden = applyAssessmentOverrides(baseInputs, {
      billedTariffPerUse: 1200,
      realizationPercentage: 90,
    });

    expect(overridden.payerMix.every((payer) => payer.billedTariff === 1200)).toBe(true);
    expect(overridden.payerMix.every((payer) => payer.realizationPercentage === 90)).toBe(true);
    // shareOfVolume/collectionDelayDays are untouched by this override
    expect(overridden.payerMix.map((payer) => payer.shareOfVolume)).toEqual([60, 40]);
  });

  it("returns inputs unchanged in value (new object) when no overrides are given", () => {
    const overridden = applyAssessmentOverrides(baseInputs, {});
    expect(overridden).toEqual(baseInputs);
    expect(overridden).not.toBe(baseInputs);
  });
});
