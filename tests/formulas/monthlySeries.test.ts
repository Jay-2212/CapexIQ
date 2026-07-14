// formulas/monthlySeries.ts — the Phase 8 monthly breakdown feeding the Excel export.
// The strongest correctness check available: every monthly series must sum, year by
// year, to the figure computeAssessment.ts's annual pipeline already produces and
// tests/formulas/computeAssessment.test.ts already golden-tests. If these ever
// disagree, the Excel export would show numbers that don't match the dashboard —
// exactly the failure Phase 8's DoD is designed to catch.

import { describe, expect, it } from "vitest";
import { computeAssessment, AssessmentInputs } from "../../formulas/computeAssessment";
import { buildMonthlySeries } from "../../formulas/monthlySeries";

function sumMonthsInYear(series: number[], yearIndex: number): number {
  return series.slice(yearIndex * 12, yearIndex * 12 + 12).reduce((total, value) => total + value, 0);
}

describe("buildMonthlySeries — reconciliation against computeAssessment's golden scenario A (simple cash)", () => {
  const inputs: AssessmentInputs = {
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
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);

  it("has one entry per month of the useful life for every series", () => {
    const totalMonths = inputs.usefulLifeYears * 12;
    expect(monthly.monthlyBilledRevenue).toHaveLength(totalMonths);
    expect(monthly.monthlyRealizedRevenue).toHaveLength(totalMonths);
    expect(monthly.monthlyVariableCost).toHaveLength(totalMonths);
    expect(monthly.monthlyFixedCost).toHaveLength(totalMonths);
    expect(monthly.monthlyMaintenanceCost).toHaveLength(totalMonths);
    expect(monthly.monthlyEmiOrLease).toHaveLength(totalMonths);
    expect(monthly.monthlyNetCashFlowAfterFinancing).toHaveLength(totalMonths);
  });

  it("matches computeAssessment's flat monthlyRealizedRevenue/monthlyBilledRevenue (no ramp on golden scenario A)", () => {
    expect(monthly.monthlyRealizedRevenue[0]).toBeCloseTo(result.monthlyRealizedRevenue, 6);
    expect(monthly.monthlyRealizedRevenue.every((v) => Math.abs(v - result.monthlyRealizedRevenue) < 1e-6)).toBe(true);
    expect(monthly.monthlyBilledRevenue.every((v) => Math.abs(v - result.monthlyBilledRevenue) < 1e-6)).toBe(true);
  });

  it("every year's summed net cash flow (before financing, since this scenario is cash) matches annualNetCashFlowsBeforeFinancing", () => {
    for (let yearIndex = 0; yearIndex < inputs.usefulLifeYears; yearIndex += 1) {
      const revenue = sumMonthsInYear(monthly.monthlyRealizedRevenue, yearIndex);
      const variableCost = sumMonthsInYear(monthly.monthlyVariableCost, yearIndex);
      const fixedCost = sumMonthsInYear(monthly.monthlyFixedCost, yearIndex);
      const maintenanceCost = sumMonthsInYear(monthly.monthlyMaintenanceCost, yearIndex);
      const summedNet = revenue - variableCost - fixedCost - maintenanceCost;
      expect(summedNet).toBeCloseTo(result.annualNetCashFlowsBeforeFinancing[yearIndex], 4);
      // Cash financing → monthlyNetCashFlowAfterFinancing should equal the same total.
      expect(sumMonthsInYear(monthly.monthlyNetCashFlowAfterFinancing, yearIndex)).toBeCloseTo(
        result.annualNetCashFlowsBeforeFinancing[yearIndex],
        4
      );
    }
  });

  it("monthlyEmiOrLease is all zero for a cash purchase", () => {
    expect(monthly.monthlyEmiOrLease.every((v) => v === 0)).toBe(true);
  });

  it("monthlyCashReceived with a 0-day DSO reconciles to monthlyRealizedRevenue month for month", () => {
    for (let i = 0; i < monthly.monthlyRealizedRevenue.length; i += 1) {
      expect(monthly.monthlyCashReceived[i]).toBeCloseTo(monthly.monthlyRealizedRevenue[i], 6);
    }
  });
});

describe("buildMonthlySeries — financed (loan) scenario", () => {
  const inputs: AssessmentInputs = {
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
    financing: { type: "loan", downPayment: 0.2 * 33_000_000, interestRate: 11.5, tenureMonths: 60 },
    maintenance: { warrantyYears: 5, cmcYears: 5, cmcAnnualCost: 0.065 * 30_000_000, amcAnnualCost: 0 },
    usefulLifeYears: 10,
    discountRate: 12.5,
    salvageValuePercentage: 5,
  };
  const result = computeAssessment(inputs);
  const monthly = buildMonthlySeries(inputs);

  it("every year's summed monthly EMI matches the annual financing cost implied by annualNetCashFlowsBeforeFinancing minus AfterFinancing", () => {
    for (let yearIndex = 0; yearIndex < 5; yearIndex += 1) {
      const impliedAnnualFinancingCost =
        result.annualNetCashFlowsBeforeFinancing[yearIndex] - result.annualNetCashFlowsAfterFinancing[yearIndex];
      const summedEmi = sumMonthsInYear(monthly.monthlyEmiOrLease, yearIndex);
      expect(summedEmi).toBeCloseTo(impliedAnnualFinancingCost, 2);
    }
  });

  it("EMI stops after the 60-month tenure", () => {
    expect(monthly.monthlyEmiOrLease.slice(60).every((v) => v === 0)).toBe(true);
    expect(monthly.monthlyEmiOrLease[59]).toBeGreaterThan(0);
  });

  it("monthlyCashReceived total for the full DSO-extended horizon equals total realized revenue (cash conservation)", () => {
    const totalRealized = monthly.monthlyRealizedRevenue.reduce((t, v) => t + v, 0);
    const totalReceived = monthly.monthlyCashReceived.reduce((t, v) => t + v, 0);
    expect(totalReceived).toBeCloseTo(totalRealized, 4);
  });
});

describe("buildMonthlySeries — utilization ramp is applied to billed revenue, realized revenue, and variable cost alike (ISS-29)", () => {
  const inputs: AssessmentInputs = {
    purchaseCost: 1_000_000,
    installationCost: 0,
    usagePerDay: 10,
    workingDaysPerMonth: 25,
    payerMix: [
      { payerName: "cash", shareOfVolume: 100, billedTariff: 1000, realizationPercentage: 100, collectionDelayDays: 0 },
    ],
    variableCostPerUse: 100,
    fixedCostPerMonth: 10_000,
    financing: { type: "cash" },
    maintenance: { warrantyYears: 2, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 20_000 },
    usefulLifeYears: 3,
    discountRate: 10,
    salvageValuePercentage: 0,
    utilizationRamp: { month1to3Pct: 50, month4to6Pct: 75, month7to12Pct: 90, year2PlusPct: 100 },
  };
  const monthly = buildMonthlySeries(inputs);
  const result = computeAssessment(inputs);

  it("reconciles every ramped year's summed monthly net cash flow against computeAssessment's annual figure (the off-by-one risk spot)", () => {
    for (let yearIndex = 0; yearIndex < inputs.usefulLifeYears; yearIndex += 1) {
      expect(sumMonthsInYear(monthly.monthlyNetCashFlowAfterFinancing, yearIndex)).toBeCloseTo(
        result.annualNetCashFlowsBeforeFinancing[yearIndex],
        4
      );
    }
  });

  it("ramps month 1 realized revenue and variable cost to 50% of mature", () => {
    const matureRealized = monthly.monthlyRealizedRevenue[24]; // year 3, fully ramped
    expect(monthly.monthlyRealizedRevenue[0]).toBeCloseTo(matureRealized * 0.5, 4);
    const matureVariable = monthly.monthlyVariableCost[24];
    expect(monthly.monthlyVariableCost[0]).toBeCloseTo(matureVariable * 0.5, 4);
  });

  it("ramps month 1 billed revenue to 50% of mature, same curve as realized revenue", () => {
    const matureBilled = monthly.monthlyBilledRevenue[24]; // year 3, fully ramped
    expect(monthly.monthlyBilledRevenue[0]).toBeCloseTo(matureBilled * 0.5, 4);
    expect(monthly.monthlyBilledRevenue[3]).toBeCloseTo(matureBilled * 0.75, 4); // months 4-6
    expect(monthly.monthlyBilledRevenue[6]).toBeCloseTo(matureBilled * 0.9, 4); // months 7-12
  });

  it("computeAssessment's own (flat, unramped) monthlyBilledRevenue headline field is unaffected by the ramp — it already equals the mature, fully-ramped-up figure", () => {
    expect(result.monthlyBilledRevenue).toBeCloseTo(monthly.monthlyBilledRevenue[24], 6);
  });
});
