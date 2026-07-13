// Golden scenario C — a genuinely non-viable purchase (negative operating cash flow
// every year, undefined IRR, no payback) at the minimum allowed useful-life horizon
// (1 year, per content/inputs-metadata.json's usefulLifeYears min:1), plus a
// standalone negative-contribution-margin edge case (capexiq-prebuild-assurance
// PBA-10). Expected values independently derived via a standalone Python script — see
// /Users/jay/.claude/jobs/d6da810d/tmp/scenario_c.py.
//
//   purchaseCost = INR 50,00,000, installationCost = INR 5,00,000
//   usagePerDay = 2 (far below break-even), billedTariffPerUse = INR 1,000, realization 90%
//   consumableCostPerUse = INR 400, staffCostPerMonth = INR 2,00,000 (disproportionate
//   to volume, deliberately), electricityCostPerMonth = INR 20,000
//   usefulLifeYears = 1, discountRate = 12.5%

import { describe, expect, it } from "vitest";

import { realizedRevenuePerUse } from "../../formulas/realization";
import { monthlyRealizedRevenue } from "../../formulas/revenue";
import { contributionPerUse, breakEvenUsagePerDay } from "../../formulas/breakEven";
import { npv } from "../../formulas/npv";
import { irr } from "../../formulas/irr";
import { roi, paybackPeriod } from "../../formulas/roi";
import { discountedPaybackPeriod } from "../../formulas/discountedPayback";

const INITIAL_INVESTMENT = 5_000_000 + 500_000;
const USAGE_PER_DAY = 2;
const WORKING_DAYS_PER_MONTH = 25;
const DISCOUNT_RATE = 12.5;

describe("golden scenario C — non-viable purchase at the minimum useful-life horizon (1 year)", () => {
  const payerMix = [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 1000, realizationPercentage: 90 },
  ];
  const realizedPerUse = realizedRevenuePerUse(payerMix);
  const variableCostPerUse = 400;
  const monthlyRealized = monthlyRealizedRevenue(USAGE_PER_DAY, realizedPerUse, WORKING_DAYS_PER_MONTH);
  const annualRealized = monthlyRealized * 12;
  const annualVariableCost = USAGE_PER_DAY * variableCostPerUse * WORKING_DAYS_PER_MONTH * 12;
  const annualFixedCost = (200_000 + 20_000) * 12;
  const annualOperatingSurplus = annualRealized - annualVariableCost - annualFixedCost;

  it("computes a negative annual operating surplus", () => {
    expect(realizedPerUse).toBe(900);
    expect(annualRealized).toBe(540_000);
    expect(annualVariableCost).toBe(240_000);
    expect(annualFixedCost).toBe(2_640_000);
    expect(annualOperatingSurplus).toBe(-2_340_000);
  });

  it("break-even usage per day is well above actual usage (contribution margin is still positive here — this is an insufficient-volume case, not a negative-contribution case)", () => {
    const contribution = contributionPerUse(realizedPerUse, variableCostPerUse);
    expect(contribution).toBe(500);
    const breakEven = breakEvenUsagePerDay(annualFixedCost / 12, contribution, WORKING_DAYS_PER_MONTH);
    expect(breakEven).toBeCloseTo(17.6, 8);
    expect(breakEven).toBeGreaterThan(USAGE_PER_DAY);
  });

  it("NPV over the 1-year (minimum) horizon is deeply negative", () => {
    const result = npv(DISCOUNT_RATE, INITIAL_INVESTMENT, [annualOperatingSurplus]);
    expect(result).toBeCloseTo(-7_580_000, 0);
  });

  it("IRR is undefined (all cash flows, including the initial investment, are negative — no sign change exists)", () => {
    expect(() => irr(INITIAL_INVESTMENT, [annualOperatingSurplus])).toThrow(
      /IRR is undefined/
    );
  });

  it("simple payback is Infinity (annual net cash flow is negative)", () => {
    expect(paybackPeriod(INITIAL_INVESTMENT, annualOperatingSurplus)).toBe(Infinity);
  });

  it("discounted payback is null (never crosses the initial investment) — the DIFFERENT sentinel from simple payback's Infinity, per formula-appendix.md §4.6/PBA-7, and both are correctly \"no payback\" despite the different representations", () => {
    const result = discountedPaybackPeriod(INITIAL_INVESTMENT, [annualOperatingSurplus], DISCOUNT_RATE);
    expect(result).toBeNull();
  });

  it("ROI (cash-flow view) is negative", () => {
    const result = roi(annualOperatingSurplus, INITIAL_INVESTMENT, "cash-flow");
    expect(result).toBeCloseTo(-42.5455, 3);
  });
});

describe("edge case — negative contribution margin (variable cost exceeds realized revenue per use)", () => {
  it("breakEvenUsagePerDay throws when contribution per use is negative (financial-model-spec.md §1.6: the Investment Outlook score treats this as Operational Margin of Safety = 0, not an error to hide)", () => {
    const contribution = contributionPerUse(900, 1200); // realized 900, variable cost 1200
    expect(contribution).toBe(-300);
    expect(() => breakEvenUsagePerDay(100_000, contribution, 25)).toThrow(
      /Break-even usage is undefined/
    );
  });

  it("breakEvenUsagePerDay also throws at exactly zero contribution (the boundary, not just negative)", () => {
    expect(() => breakEvenUsagePerDay(100_000, 0, 25)).toThrow(
      /Break-even usage is undefined/
    );
  });
});
