import { describe, expect, it } from "vitest";

import { investmentOutlookScore } from "../../formulas/investmentOutlookScore";

describe("investmentOutlookScore", () => {
  it("reproduces the financial-model-spec worked example", () => {
    const result = investmentOutlookScore({
      irr: 18.2,
      discountRate: 12.5,
      npv: 0,
      initialInvestment: 1000000,
      discountedPaybackYears: 3.8,
      usefulLifeYears: 10,
      financingType: "loan",
      monthlyOperatingCashFlowBeforeEmi: 450000,
      monthlyEmi: 320000,
      usagePerDay: 25,
      breakEvenUsagePerDay: 20.5,
    });

    expect(result.subScores.returnStrength).toBeCloseTo(78.5, 8);
    expect(result.subScores.speedToPayback).toBeCloseTo(70, 8);
    expect(result.subScores.financingResilience).toBeCloseTo(40.625, 8);
    expect(result.subScores.operationalMarginOfSafety).toBeCloseTo(45, 8);
    expect(result.score).toBe(62);
    expect(result.band).toBe("Moderate");
    expect(result.driver).toBe("financingResilience");
  });

  it("uses the NPV fallback and redistributed cash-purchase weights", () => {
    const result = investmentOutlookScore({
      irr: null,
      discountRate: 12.5,
      npv: 250000,
      initialInvestment: 1000000,
      discountedPaybackYears: 2,
      usefulLifeYears: 10,
      financingType: "cash",
      monthlyOperatingCashFlowBeforeEmi: 0,
      monthlyEmi: 0,
      usagePerDay: 20,
      breakEvenUsagePerDay: 10,
    });

    expect(result.subScores.returnStrength).toBe(75);
    expect(result.subScores.financingResilience).toBeNull();
    expect(result.score).toBe(89);
    expect(result.band).toBe("Strong");
  });

  it("scores undefined payback, zero usage, and break-even failure as zero", () => {
    const result = investmentOutlookScore({
      irr: 0,
      discountRate: 12.5,
      npv: -500000,
      initialInvestment: 1000000,
      discountedPaybackYears: null,
      usefulLifeYears: 10,
      financingType: "loan",
      monthlyOperatingCashFlowBeforeEmi: 100000,
      monthlyEmi: 100000,
      usagePerDay: 0,
      breakEvenUsagePerDay: null,
    });

    expect(result.subScores.speedToPayback).toBe(0);
    expect(result.subScores.financingResilience).toBe(0);
    expect(result.subScores.operationalMarginOfSafety).toBe(0);
    expect(result.band).toBe("Weak");
  });
});
