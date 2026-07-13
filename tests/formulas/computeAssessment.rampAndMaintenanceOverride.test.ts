// ISS-19 regression coverage: Advanced Group B's utilization ramp-up and Group E's
// per-year maintenanceCostByYearPct override were collected in wizard state but never
// consumed by the canonical pipeline. Hand-derived numbers below (see each test's
// inline arithmetic), never copied from computeAssessment.ts itself.

import { describe, expect, it } from "vitest";
import { computeAssessment } from "../../formulas/computeAssessment";

describe("computeAssessment — utilization ramp-up (ISS-19)", () => {
  const baseInputs = {
    purchaseCost: 1_000_000,
    installationCost: 0,
    usagePerDay: 10,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "cash", shareOfVolume: 100, billedTariff: 1000, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 0,
    fixedCostPerMonth: 0,
    financing: { type: "cash" as const },
    maintenance: { warrantyYears: 0, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 0 },
    usefulLifeYears: 2,
    discountRate: 10,
    salvageValuePercentage: 0,
  };

  it("with no utilizationRamp, behaves exactly as flat mature usage from month 1 (backward compatible)", () => {
    const result = computeAssessment(baseInputs);
    // mature monthly realized = 10 * 1000 * 25 = 250,000; annual = 3,000,000
    expect(result.annualNetCashFlowsBeforeFinancing).toEqual([3_000_000, 3_000_000]);
  });

  it("with a full utilizationRamp, year 1 is the month-weighted blend and year 2+ uses year2PlusPct", () => {
    const result = computeAssessment({
      ...baseInputs,
      utilizationRamp: {
        month1to3Pct: 20,
        month4to6Pct: 50,
        month7to12Pct: 80,
        year2PlusPct: 100,
      },
    });
    // Mature monthly realized = 250,000.
    // Year 1 = 3mo*20% + 3mo*50% + 6mo*80% (of 250,000) = 150,000 + 375,000 + 1,200,000 = 1,725,000
    // Year 2 = 12mo*100% of 250,000 = 3,000,000 (identical to no-ramp mature case)
    expect(result.annualNetCashFlowsBeforeFinancing).toEqual([1_725_000, 3_000_000]);
    // The flat, mature-only display fields are unaffected by ramp — only the
    // year-by-year cash-flow-driving numbers change.
    expect(result.monthlyRealizedRevenue).toBe(250_000);
  });

  it("a lower ramp reduces IRR/NPV relative to the unramped case, rather than silently being ignored", () => {
    const flat = computeAssessment(baseInputs);
    const ramped = computeAssessment({
      ...baseInputs,
      utilizationRamp: {
        month1to3Pct: 10,
        month4to6Pct: 10,
        month7to12Pct: 10,
        year2PlusPct: 10,
      },
    });
    expect(ramped.npv).toBeLessThan(flat.npv);
    expect(ramped.annualNetCashFlowsBeforeFinancing[0]).toBeLessThan(
      flat.annualNetCashFlowsBeforeFinancing[0]
    );
  });
});

describe("computeAssessment — per-year maintenance cost override (ISS-19)", () => {
  const baseInputs = {
    purchaseCost: 1_000_000,
    installationCost: 0,
    usagePerDay: 1,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "cash", shareOfVolume: 100, billedTariff: 0, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 0,
    fixedCostPerMonth: 0,
    financing: { type: "cash" as const },
    usefulLifeYears: 4,
    discountRate: 10,
    salvageValuePercentage: 0,
  };

  it("overrides only the years with a non-null entry, leaving the warranty/CMC/AMC schedule intact elsewhere", () => {
    const result = computeAssessment({
      ...baseInputs,
      maintenance: {
        warrantyYears: 1,
        cmcYears: 1,
        cmcAnnualCost: 10_000,
        amcAnnualCost: 5_000,
        costByYearPct: [null, null, 2, null],
      },
    });

    expect(result.maintenanceSchedule).toEqual([
      { yearNumber: 1, coverageType: "warranty", annualCost: 0 },
      { yearNumber: 2, coverageType: "cmc", annualCost: 10_000 },
      // Year 3 would otherwise be "amc" @ 5,000 — overridden to 2% of purchaseCost.
      { yearNumber: 3, coverageType: "override", annualCost: 20_000 },
      { yearNumber: 4, coverageType: "amc", annualCost: 5_000 },
    ]);
  });

  it("with no costByYearPct at all, behaves exactly as the pre-existing warranty/CMC/AMC schedule", () => {
    const result = computeAssessment({
      ...baseInputs,
      maintenance: { warrantyYears: 1, cmcYears: 1, cmcAnnualCost: 10_000, amcAnnualCost: 5_000 },
    });

    expect(result.maintenanceSchedule.map((entry) => entry.coverageType)).toEqual([
      "warranty",
      "cmc",
      "amc",
      "amc",
    ]);
  });
});
