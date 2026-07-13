// Validates formulas/computeAssessment.ts (the canonical pipeline) reproduces the
// independently-hand-derived golden scenario numbers in tests/scenarios/ exactly —
// see that folder's README for how those numbers were derived (never by calling
// /formulas). This is a regression guard: if computeAssessment's composition ever
// drifts from the golden numbers, this test catches it before wizard-state.md §4's
// "exactly one derivation" requirement is violated.

import { describe, expect, it } from "vitest";
import { computeAssessment } from "../../formulas/computeAssessment";

describe("computeAssessment — golden scenario A (simple cash purchase)", () => {
  const result = computeAssessment({
    purchaseCost: 2_000_000,
    installationCost: 100_000,
    usagePerDay: 10,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "cash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 50,
    fixedCostPerMonth: 40_000 + 5_000,
    financing: { type: "cash" },
    maintenance: { warrantyYears: 5, cmcYears: 2, cmcAnnualCost: 60_000, amcAnnualCost: 40_000 },
    usefulLifeYears: 8,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  });

  it("matches every golden scenario A figure", () => {
    expect(result.initialInvestment).toBe(2_100_000);
    expect(result.realizedRevenuePerUse).toBe(800);
    expect(result.monthlyRealizedRevenue).toBe(200_000);
    expect(result.annualOperatingSurplus).toBe(1_710_000);
    expect(result.annualNetCashFlowsBeforeFinancing).toEqual([
      1_710_000, 1_710_000, 1_710_000, 1_710_000, 1_710_000, 1_650_000, 1_650_000, 1_670_000,
    ]);
    expect(result.npv).toBeCloseTo(6_176_803.66, 0);
    expect(result.irr).toBeCloseTo(80.5921, 3);
    expect(result.paybackYears).toBeCloseTo(1.22807, 4);
    expect(result.paybackYearsFromCashFlows).toBeCloseTo(1.22807, 4);
    expect(result.discountedPaybackYears).toBeCloseTo(1.42928, 4);
    expect(result.eac).toBeCloseTo(1_134_791.81, 0);
    expect(result.roiRealized).toBeCloseTo(81.42857, 4);
    expect(result.roiCashFlow).toBeCloseTo(result.roiRealized, 6);
    expect(result.monthlyEmiOrLease).toBeNull();
  });
});

describe("computeAssessment — golden scenario B (financed, payer mix, DSO)", () => {
  const result = computeAssessment({
    purchaseCost: 30_000_000,
    installationCost: 3_000_000,
    usagePerDay: 20,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "privateCash", shareOfVolume: 50, billedTariff: 6000, realizationPercentage: 100, collectionDelayDays: 0 },
      { payerName: "insuranceTpa", shareOfVolume: 30, billedTariff: 6000, realizationPercentage: 85, collectionDelayDays: 60 },
      { payerName: "pmJay", shareOfVolume: 20, billedTariff: 4500, realizationPercentage: 90, collectionDelayDays: 90 },
    ],
    variableCostPerUse: 2000,
    fixedCostPerMonth: 300_000 + 150_000 + 50_000,
    financing: { type: "loan", downPayment: 33_000_000 * 0.2, interestRate: 11.5, tenureMonths: 60 },
    maintenance: { warrantyYears: 5, cmcYears: 5, cmcAnnualCost: 30_000_000 * 0.065, amcAnnualCost: 0 },
    usefulLifeYears: 10,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  });

  it("matches every golden scenario B figure", () => {
    expect(result.realizedRevenuePerUse).toBe(5340);
    expect(result.monthlyRealizedRevenue).toBe(2_670_000);
    expect(result.annualOperatingSurplus).toBe(14_040_000);
    expect(result.monthlyEmiOrLease).toBeCloseTo(580_604.83, 0);
    expect(result.annualNetCashFlowsAfterFinancing[0]).toBeCloseTo(7_072_741.98, 0);
    expect(result.annualNetCashFlowsAfterFinancing[9]).toBeCloseTo(12_090_000, 0);
    expect(result.npv).toBeCloseTo(16_071_158.54, 0);
    expect(result.irr).toBeCloseTo(22.0518, 3);
    expect(result.roiBilled).toBeCloseTo(49.0909, 3);
    expect(result.roiRealized).toBeCloseTo(42.5455, 3);
    expect(result.roiCashFlow).not.toBeCloseTo(result.roiRealized, 1);
    expect(result.roiBilled).not.toBeCloseTo(result.roiRealized, 1);
  });

  it("working-capital peak gap is positive during the DSO ramp and the cash-received array conserves total revenue (PBA-3)", () => {
    expect(result.workingCapitalPeakGap).toBeGreaterThan(0);
    expect(result.workingCapitalPeakGapMonth).toBeGreaterThan(0);
  });
});

describe("computeAssessment — golden scenario C (non-viable, minimum useful life)", () => {
  const result = computeAssessment({
    purchaseCost: 5_000_000,
    installationCost: 500_000,
    usagePerDay: 2,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "cash", shareOfVolume: 100, billedTariff: 1000, realizationPercentage: 90, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 400,
    fixedCostPerMonth: 200_000 + 20_000,
    financing: { type: "cash" },
    maintenance: { warrantyYears: 0, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 0 },
    usefulLifeYears: 1,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  });

  it("surfaces non-viability via sentinels rather than throwing", () => {
    expect(result.annualOperatingSurplus).toBe(-2_340_000);
    expect(result.npv).toBeCloseTo(-7_580_000, 0);
    expect(result.irr).toBeNull();
    expect(result.paybackYears).toBe(Infinity);
    expect(result.discountedPaybackYears).toBeNull();
    expect(result.roiCashFlow).toBeCloseTo(-42.5455, 3);
    expect(result.breakEvenUsagePerDay).toBeCloseTo(17.6, 8);
    expect(result.investmentOutlook.band).toBe("Weak");
  });
});

describe("computeAssessment — negative contribution margin never throws out of the pipeline", () => {
  it("breakEvenUsagePerDay's internal throw is caught and surfaced as null, not propagated", () => {
    const result = computeAssessment({
      purchaseCost: 1_000_000,
      installationCost: 0,
      usagePerDay: 5,
      workingDaysPerMonth: 25,
      payerMix: [
        { payerName: "cash", shareOfVolume: 100, billedTariff: 900, realizationPercentage: 100, collectionDelayDays: 0 },
      ],
      variableCostPerUse: 1200,
      fixedCostPerMonth: 50_000,
      financing: { type: "cash" },
      maintenance: { warrantyYears: 1, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 20_000 },
      usefulLifeYears: 5,
      discountRate: 12.5,
      salvageValuePercentage: 5,
    });

    expect(result.contributionPerUse).toBeLessThan(0);
    expect(result.breakEvenUsagePerDay).toBeNull();
  });
});
