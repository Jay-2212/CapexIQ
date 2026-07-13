// Golden scenario A — simple cash purchase, no financing, no payer mix, crosses the
// warranty -> CMC -> AMC maintenance transition (capexiq-prebuild-assurance PBA-10).
//
// Expected values below are independently derived (hand arithmetic + a standalone
// Python script re-implementing NPV/IRR/EAC/payback from first principles, NOT by
// importing or reading /formulas) — never taken from a run of the code under test.
// Ultrasound-like, deliberately round inputs so every intermediate figure is checkable
// by hand:
//
//   purchaseCost = INR 20,00,000, installationCost = INR 1,00,000
//   usagePerDay = 10, billedTariffPerUse = INR 800, workingDaysPerMonth = 25
//   realization = 100% (single cash payer, no DSO)
//   consumableCostPerUse = INR 50, staffCostPerMonth = INR 40,000,
//   electricityCostPerMonth = INR 5,000
//   warrantyYears = 5, cmcYears = 2 (INR 60,000/yr), then AMC (INR 40,000/yr)
//   usefulLifeYears = 8, discountRate = 12.5%
//
// See /Users/jay/.claude/jobs/d6da810d/tmp/scenario_a.py for the full independent
// derivation this file's expectations were copied from.

import { describe, expect, it } from "vitest";

import { billedMonthlyRevenue, monthlyRealizedRevenue } from "../../formulas/revenue";
import { realizedRevenuePerUse } from "../../formulas/realization";
import { contributionPerUse, breakEvenUsagePerDay } from "../../formulas/breakEven";
import { maintenanceScheduleForYears } from "../../formulas/maintenance";
import { npv } from "../../formulas/npv";
import { irr } from "../../formulas/irr";
import { roi, paybackPeriod, paybackPeriodFromCashFlows } from "../../formulas/roi";
import { equivalentAnnualCost } from "../../formulas/eac";
import { discountedPaybackPeriod } from "../../formulas/discountedPayback";

const INITIAL_INVESTMENT = 2_000_000 + 100_000; // purchase + installation
const USAGE_PER_DAY = 10;
const WORKING_DAYS_PER_MONTH = 25;
const DISCOUNT_RATE = 12.5;
const USEFUL_LIFE_YEARS = 8;

describe("golden scenario A — simple cash purchase (warranty -> CMC -> AMC transition)", () => {
  const payerMix = [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100 },
  ];
  const realizedPerUse = realizedRevenuePerUse(payerMix);
  const variableCostPerUse = 50;

  it("computes realized revenue per use as the full billed tariff (100% realization)", () => {
    expect(realizedPerUse).toBe(800);
  });

  it("computes monthly and annual realized revenue", () => {
    const monthly = monthlyRealizedRevenue(USAGE_PER_DAY, realizedPerUse, WORKING_DAYS_PER_MONTH);
    expect(monthly).toBe(200_000);
    expect(monthly * 12).toBe(2_400_000);
  });

  it("billed revenue equals realized revenue at 100% realization", () => {
    expect(billedMonthlyRevenue(USAGE_PER_DAY, 800, WORKING_DAYS_PER_MONTH)).toBe(200_000);
  });

  const annualVariableCost = USAGE_PER_DAY * variableCostPerUse * WORKING_DAYS_PER_MONTH * 12;
  const annualFixedCost = (40_000 + 5_000) * 12;
  const annualOperatingSurplus = 2_400_000 - annualVariableCost - annualFixedCost;

  it("computes annual operating surplus", () => {
    expect(annualVariableCost).toBe(150_000);
    expect(annualFixedCost).toBe(540_000);
    expect(annualOperatingSurplus).toBe(1_710_000);
  });

  it("computes contribution per use and break-even usage per day", () => {
    const contribution = contributionPerUse(realizedPerUse, variableCostPerUse);
    expect(contribution).toBe(750);
    const breakEven = breakEvenUsagePerDay(annualFixedCost / 12, contribution, WORKING_DAYS_PER_MONTH);
    expect(breakEven).toBeCloseTo(2.4, 8);
  });

  const schedule = maintenanceScheduleForYears(5, 2, 60_000, 40_000, USEFUL_LIFE_YEARS);
  const annualNetCashFlows = schedule.map((entry) => annualOperatingSurplus - entry.annualCost);

  it("builds the maintenance schedule crossing warranty -> CMC -> AMC", () => {
    expect(schedule.map((e) => e.coverageType)).toEqual([
      "warranty", "warranty", "warranty", "warranty", "warranty", "cmc", "cmc", "amc",
    ]);
    expect(annualNetCashFlows).toEqual([
      1_710_000, 1_710_000, 1_710_000, 1_710_000, 1_710_000, 1_650_000, 1_650_000, 1_670_000,
    ]);
  });

  it("computes NPV at the 12.5% discount rate", () => {
    const result = npv(DISCOUNT_RATE, INITIAL_INVESTMENT, annualNetCashFlows);
    expect(result).toBeCloseTo(6_176_803.66, 0);
  });

  it("computes IRR", () => {
    const result = irr(INITIAL_INVESTMENT, annualNetCashFlows);
    expect(result).toBeCloseTo(80.5921, 3);
  });

  it("computes simple payback (flat annual surplus) and cash-flow payback (maintenance-adjusted) — both land in year 2", () => {
    expect(paybackPeriod(INITIAL_INVESTMENT, annualOperatingSurplus)).toBeCloseTo(1.22807, 4);
    expect(paybackPeriodFromCashFlows(INITIAL_INVESTMENT, annualNetCashFlows)).toBeCloseTo(1.22807, 4);
  });

  it("computes discounted payback (longer than simple payback, per formula-appendix.md §4.6)", () => {
    const result = discountedPaybackPeriod(INITIAL_INVESTMENT, annualNetCashFlows, DISCOUNT_RATE);
    expect(result).not.toBeNull();
    expect(result as number).toBeCloseTo(1.42928, 4);
    expect(result as number).toBeGreaterThan(1.22807); // always >= simple payback
  });

  it("computes EAC (costs-only, no revenue)", () => {
    const annualCosts = schedule.map((entry) => annualVariableCost + annualFixedCost + entry.annualCost);
    const result = equivalentAnnualCost(INITIAL_INVESTMENT, annualCosts, DISCOUNT_RATE, USEFUL_LIFE_YEARS);
    expect(result).toBeCloseTo(1_134_791.81, 0);
  });

  it("ROI is identical across billed/realized/cash-flow views when realization is 100% and there is no financing (the view label doesn't change the math — formula-appendix.md §4.3)", () => {
    const roiRealized = roi(annualOperatingSurplus, INITIAL_INVESTMENT, "realized");
    const roiCashFlow = roi(annualNetCashFlows[0], INITIAL_INVESTMENT, "cash-flow");
    expect(roiRealized).toBeCloseTo(81.42857, 4);
    expect(roiCashFlow).toBeCloseTo(81.42857, 4);
    expect(roiRealized).toBe(roiCashFlow);
  });

  it("running the same scenario twice produces identical results (determinism)", () => {
    const scheduleAgain = maintenanceScheduleForYears(5, 2, 60_000, 40_000, USEFUL_LIFE_YEARS);
    const cashFlowsAgain = scheduleAgain.map((entry) => annualOperatingSurplus - entry.annualCost);
    expect(npv(DISCOUNT_RATE, INITIAL_INVESTMENT, cashFlowsAgain)).toBe(
      npv(DISCOUNT_RATE, INITIAL_INVESTMENT, annualNetCashFlows)
    );
  });
});
