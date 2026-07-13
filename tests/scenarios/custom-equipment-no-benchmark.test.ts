// Golden scenario D — Custom equipment, which has zero benchmark data by design.
// Regression test for PBA-2 (capexiq-prebuild-assurance): equipment-data/custom.json
// previously stored several fields as bare `null` instead of the same nested-object
// shape (`{value/low/typical/high, unit, confidence, sourceId}`) used by the other 5
// equipment files, which would throw a TypeError the moment generic tooltip/default-
// population code (written against the other 5 files' shape) touched Custom equipment.
// This test proves the reshaped file is safe to read the same way as any other
// equipment file, and that a fully user-entered pipeline (the only way Custom can ever
// work, since there is nothing to default) runs end to end without crashing.

import { describe, expect, it } from "vitest";
import customData from "../../equipment-data/custom.json";

import { realizedRevenuePerUse } from "../../formulas/realization";
import { monthlyRealizedRevenue } from "../../formulas/revenue";
import { contributionPerUse, breakEvenUsagePerDay } from "../../formulas/breakEven";
import { npv } from "../../formulas/npv";
import { annualStraightLineDepreciation } from "../../formulas/depreciation";

describe("golden scenario D — Custom equipment schema shape (PBA-2 regression)", () => {
  it("every benchmark field is an object, never a bare null — safe for generic .value/.low/.typical/.high access", () => {
    const objectFields = [
      customData.purchaseCost,
      customData.usefulLifeYears,
      customData.salvageValuePercentage,
      customData.installationAndAncillaryCostPercentage,
      customData.warrantyYears,
      customData.cmcYears,
      customData.amcAnnualCostPercentage,
      customData.cmcAnnualCostPercentage,
      customData.billedTariffPerUse,
      customData.launchDelayMonths,
    ];
    for (const field of objectFields) {
      expect(field).not.toBeNull();
      expect(typeof field).toBe("object");
    }
  });

  it("accessing .value or .typical on every benchmark field returns null, not a thrown TypeError", () => {
    expect(() => customData.usefulLifeYears.value).not.toThrow();
    expect(customData.usefulLifeYears.value).toBeNull();
    expect(() => customData.warrantyYears.typical).not.toThrow();
    expect(customData.warrantyYears.typical).toBeNull();
    expect(() => customData.cmcYears.typical).not.toThrow();
    expect(customData.cmcYears.typical).toBeNull();
    expect(() => customData.purchaseCost.typical).not.toThrow();
    expect(customData.purchaseCost.typical).toBeNull();
  });

  it("no longer carries the dead financingNorms / typicalUtilization.workingDaysPerMonth fields removed from every other equipment file by ISS-13", () => {
    expect((customData as Record<string, unknown>).financingNorms).toBeUndefined();
    expect(
      (customData.typicalUtilization as Record<string, unknown>).workingDaysPerMonth
    ).toBeUndefined();
  });

  it("has both amcAnnualCostPercentage AND cmcAnnualCostPercentage, matching the other 5 equipment files (previously cmcAnnualCostPercentage was missing entirely)", () => {
    expect(customData.amcAnnualCostPercentage).toBeDefined();
    expect(customData.cmcAnnualCostPercentage).toBeDefined();
  });
});

describe("golden scenario D — full pipeline for Custom equipment using only user-entered values", () => {
  // A user selecting "Custom" must supply every figure themselves — there is nothing
  // to default. This proves the pipeline works with zero equipment-data involvement.
  const purchaseCost = 15_000_000;
  const installationCost = 1_500_000;
  const initialInvestment = purchaseCost + installationCost;
  const usagePerDay = 8;
  const workingDaysPerMonth = 25;
  const payerMix = [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 5000, realizationPercentage: 95 },
  ];
  const realizedPerUse = realizedRevenuePerUse(payerMix);
  const variableCostPerUse = 300;

  it("computes revenue, break-even, and NPV entirely from user input, matching independently hand-derived values", () => {
    expect(realizedPerUse).toBe(4750);

    const monthlyRealized = monthlyRealizedRevenue(usagePerDay, realizedPerUse, workingDaysPerMonth);
    expect(monthlyRealized).toBe(950_000);

    const annualFixedCost = 100_000 * 12;
    const contribution = contributionPerUse(realizedPerUse, variableCostPerUse);
    expect(contribution).toBe(4450);
    const breakEven = breakEvenUsagePerDay(annualFixedCost / 12, contribution, workingDaysPerMonth);
    expect(breakEven).toBeCloseTo(0.898876, 5);

    const annualVariableCost = usagePerDay * variableCostPerUse * workingDaysPerMonth * 12;
    const annualOperatingSurplus = monthlyRealized * 12 - annualVariableCost - annualFixedCost;
    expect(annualOperatingSurplus).toBe(9_480_000);

    const result = npv(12.5, initialInvestment, [annualOperatingSurplus, annualOperatingSurplus, annualOperatingSurplus]);
    expect(result).toBeCloseTo(6_075_144.03, 0);
  });

  it("depreciation works with fully user-supplied useful life / salvage (no equipment-data default exists for Custom)", () => {
    const result = annualStraightLineDepreciation(purchaseCost, purchaseCost * 0.05, 10);
    expect(result).toBeCloseTo(1_425_000, 0);
  });
});
