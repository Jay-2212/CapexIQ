// Golden scenario B — financed (loan) purchase with a 3-way payer mix and per-payer
// DSO, exercising the working-capital-gap / DSO-extended-array contract
// (capexiq-prebuild-assurance PBA-3) and the three distinct ROI views (PBA-11).
//
// Expected values independently derived via a standalone Python script re-implementing
// EMI/NPV/IRR/DSO cash-conservation from first principles, NOT from /formulas — see
// /Users/jay/.claude/jobs/d6da810d/tmp/scenario_b.py for the full derivation.
//
//   purchaseCost = INR 3,00,00,000, installationCost = INR 30,00,000 (MRI-like)
//   Loan: 20% down payment, 11.5% p.a., 60-month tenure
//   usagePerDay = 20, workingDaysPerMonth = 25
//   Payer mix: private cash 50% @ INR 6,000/0-day DSO,
//              insurance/TPA 30% @ INR 6,000 tariff/85% realization/60-day DSO,
//              PM-JAY 20% @ INR 4,500 tariff/90% realization/90-day DSO
//   consumableCostPerUse = 1,500, professionalFeePerUse = 500
//   staffCostPerMonth = 3,00,000, electricityCostPerMonth = 1,50,000, other = 50,000
//   warrantyYears = 5 (matches the 5yr loan tenure), cmcYears = 5 @ 6.5% of purchase cost
//   discountRate = 12.5%, 10-year projection horizon

import { describe, expect, it } from "vitest";

import { realizedRevenuePerUse, PayerMixEntry } from "../../formulas/realization";
import { monthlyRealizedRevenue } from "../../formulas/revenue";
import { cashReceivedByMonth, PayerCollectionProfile } from "../../formulas/dso";
import { workingCapitalGap } from "../../formulas/workingCapital";
import { monthlyEmi } from "../../formulas/emi";
import { npv } from "../../formulas/npv";
import { irr } from "../../formulas/irr";
import { roi } from "../../formulas/roi";
import { maintenanceScheduleForYears } from "../../formulas/maintenance";

const PURCHASE_COST = 30_000_000;
const INSTALLATION_COST = 3_000_000;
const INITIAL_INVESTMENT = PURCHASE_COST + INSTALLATION_COST;
const USAGE_PER_DAY = 20;
const WORKING_DAYS_PER_MONTH = 25;
const DISCOUNT_RATE = 12.5;

const payerMix: PayerMixEntry[] = [
  { payerName: "privateCash", shareOfVolume: 50, billedTariff: 6000, realizationPercentage: 100 },
  { payerName: "insuranceTpa", shareOfVolume: 30, billedTariff: 6000, realizationPercentage: 85 },
  { payerName: "pmJay", shareOfVolume: 20, billedTariff: 4500, realizationPercentage: 90 },
];
const collectionProfiles: PayerCollectionProfile[] = [
  { payerName: "privateCash", shareOfVolume: 50, daysToCollect: 0 },
  { payerName: "insuranceTpa", shareOfVolume: 30, daysToCollect: 60 },
  { payerName: "pmJay", shareOfVolume: 20, daysToCollect: 90 },
];

describe("golden scenario B — financed purchase, payer mix, DSO", () => {
  const realizedPerUse = realizedRevenuePerUse(payerMix);
  const monthlyRealized = monthlyRealizedRevenue(USAGE_PER_DAY, realizedPerUse, WORKING_DAYS_PER_MONTH);

  it("computes payer-mix-weighted realized revenue per use", () => {
    expect(realizedPerUse).toBe(5340);
    expect(monthlyRealized).toBe(2_670_000);
  });

  const annualVariableCost = USAGE_PER_DAY * 2000 * WORKING_DAYS_PER_MONTH * 12; // consumable+prof fee = 2000/use
  const annualFixedCost = (300_000 + 150_000 + 50_000) * 12;
  const monthlyOperatingSurplus = monthlyRealized - USAGE_PER_DAY * 2000 * WORKING_DAYS_PER_MONTH - (300_000 + 150_000 + 50_000);
  const annualOperatingSurplus = monthlyOperatingSurplus * 12;

  it("computes annual operating surplus before financing", () => {
    expect(annualVariableCost).toBe(12_000_000);
    expect(annualFixedCost).toBe(6_000_000);
    expect(annualOperatingSurplus).toBe(14_040_000);
  });

  const principal = INITIAL_INVESTMENT * 0.8; // 20% down payment
  const emi = monthlyEmi(principal, 11.5, 60);

  it("computes monthly EMI on the financed principal", () => {
    expect(principal).toBe(26_400_000);
    expect(emi).toBeCloseTo(580_604.83, 0);
  });

  // -- PBA-3: DSO-extended cash-received array must conserve cash, and must NOT be
  // truncated to the original horizon length before summing into working capital.
  describe("DSO-extended cash-received array (PBA-3 regression)", () => {
    const monthlyRevenueSeries = Array.from({ length: 12 }, () => monthlyRealized);
    const cashReceived = cashReceivedByMonth(monthlyRevenueSeries, collectionProfiles);

    it("extends the output array past the 12-month input by the largest payer's DSO (90 days = 3 months)", () => {
      expect(cashReceived.length).toBe(12 + 3);
    });

    it("conserves total cash over the FULL extended array (never a permanent loss, only delayed)", () => {
      const totalRevenue = monthlyRevenueSeries.reduce((a, b) => a + b, 0);
      const totalCashExtended = cashReceived.reduce((a, b) => a + b, 0);
      expect(totalCashExtended).toBeCloseTo(totalRevenue, 6);
    });

    it("the working-capital gap over the full extended array is ~0 at the end of the horizon (the CORRECT contract per SPEC.md §14.4)", () => {
      const cumRevenue = monthlyRevenueSeries.reduce((a, b) => a + b, 0);
      const cumCashExtended = cashReceived.reduce((a, b) => a + b, 0);
      const gap = workingCapitalGap(cumRevenue, cumCashExtended);
      expect(gap).toBeCloseTo(0, 6);
    });

    it("regression: truncating to the ORIGINAL 12-month horizon before summing produces a materially wrong non-zero gap (INR 32,04,000) — this is the exact hazard PBA-3 flagged; the pipeline must never do this", () => {
      const cumRevenue = monthlyRevenueSeries.reduce((a, b) => a + b, 0);
      const cumCashTruncated = cashReceived.slice(0, 12).reduce((a, b) => a + b, 0);
      const wrongGap = workingCapitalGap(cumRevenue, cumCashTruncated);
      expect(wrongGap).toBeCloseTo(3_204_000, 0);
      expect(wrongGap).not.toBeCloseTo(0, 0);
    });
  });

  it("computes DSCR (monthly operating cash flow before EMI / monthly EMI)", () => {
    const dscr = monthlyOperatingSurplus / emi;
    expect(dscr).toBeCloseTo(2.01514, 4);
  });

  // -- PBA-11: the three ROI views must genuinely differ when billed != realized != cash-flow.
  it("ROI differs meaningfully across billed / realized / cash-flow views (PBA-11)", () => {
    const annualBilled = USAGE_PER_DAY * (0.5 * 6000 + 0.3 * 6000 + 0.2 * 4500) * WORKING_DAYS_PER_MONTH * 12;
    const annualCashFlowAfterEmi = annualOperatingSurplus - emi * 12;

    const roiBilled = roi(annualBilled - annualVariableCost - annualFixedCost, INITIAL_INVESTMENT, "billed");
    const roiRealized = roi(annualOperatingSurplus, INITIAL_INVESTMENT, "realized");
    const roiCashFlow = roi(annualCashFlowAfterEmi, INITIAL_INVESTMENT, "cash-flow");

    expect(roiBilled).toBeCloseTo(49.0909, 3);
    expect(roiRealized).toBeCloseTo(42.5455, 3);
    expect(roiCashFlow).toBeCloseTo(21.4326, 3);
    // The whole point: these must NOT collapse to the same number the way they did
    // in golden scenario A (100% realization, no financing).
    expect(roiBilled).not.toBeCloseTo(roiRealized, 1);
    expect(roiRealized).not.toBeCloseTo(roiCashFlow, 1);
  });

  it("computes a 10-year NPV/IRR/payback across the EMI period (yrs 1-5) into the post-EMI CMC-maintenance period (yrs 6-10)", () => {
    const schedule = maintenanceScheduleForYears(5, 5, PURCHASE_COST * 0.065, 0, 10);
    const cashFlows = schedule.map((entry, index) => {
      const emiCost = index < 5 ? emi * 12 : 0;
      return annualOperatingSurplus - emiCost - entry.annualCost;
    });

    expect(cashFlows[0]).toBeCloseTo(7_072_741.98, 0);
    expect(cashFlows[9]).toBeCloseTo(12_090_000, 0);

    const npvResult = npv(DISCOUNT_RATE, INITIAL_INVESTMENT, cashFlows);
    expect(npvResult).toBeCloseTo(16_071_158.54, 0);

    const irrResult = irr(INITIAL_INVESTMENT, cashFlows);
    expect(irrResult).toBeCloseTo(22.0518, 3);
  });
});
