// Golden scenario — Investment Outlook score band boundaries (capexiq-prebuild-
// assurance PBA-10, model-and-contract-audit §4's "boundary cases around every
// Investment Outlook band"). Rather than reverse-engineer a full realistic scenario
// that happens to land on an exact composite score (fragile, hard to verify by hand),
// each case hand-picks the 3 sub-score-driving inputs (spread / discountedPayback
// ratio / cushion) so ALL relevant sub-scores equal the target value directly — for a
// cash purchase, composite = 0.4375*rs + 0.3125*stp + 0.25*om, so if rs = stp = om =
// target, composite = target exactly regardless of the weights (they sum to 1).
//
// Every input below, and the resulting sub-scores, were independently solved and
// verified via a standalone Python re-implementation of financial-model-spec.md §1.2's
// four formulas (NOT by calling investmentOutlookScore() itself) — see
// /Users/jay/.claude/jobs/d6da810d/tmp/boundaries.py.

import { describe, expect, it } from "vitest";
import { investmentOutlookScore, InvestmentOutlookInputs } from "../../formulas/investmentOutlookScore";

const CASH_PURCHASE_BASE: Omit<InvestmentOutlookInputs, "irr" | "discountRate" | "npv" | "initialInvestment" | "discountedPaybackYears" | "usefulLifeYears" | "usagePerDay" | "breakEvenUsagePerDay"> = {
  financingType: "cash",
  monthlyOperatingCashFlowBeforeEmi: 0,
  monthlyEmi: 0, // irrelevant for cash purchases; financingResilience is null
};

describe("golden scenario — Investment Outlook band boundaries (cash purchase)", () => {
  it("composite = 75 exactly lands on the Strong/Moderate boundary (Strong, inclusive)", () => {
    const result = investmentOutlookScore({
      ...CASH_PURCHASE_BASE,
      irr: 17.5,
      discountRate: 12.5, // spread = 5 -> returnStrength = 75
      npv: 1,
      initialInvestment: 1,
      discountedPaybackYears: 7,
      usefulLifeYears: 20, // ratio = 0.35 -> speedToPayback = 75
      usagePerDay: 100,
      breakEvenUsagePerDay: 65, // cushion = 0.35 -> operationalMarginOfSafety = 75
    });
    expect(result.subScores.returnStrength).toBeCloseTo(75, 6);
    expect(result.subScores.speedToPayback).toBeCloseTo(75, 6);
    expect(result.subScores.operationalMarginOfSafety).toBeCloseTo(75, 6);
    expect(result.subScores.financingResilience).toBeNull();
    expect(result.score).toBe(75);
    expect(result.band).toBe("Strong");
  });

  it("composite = 55 exactly lands on the Moderate/Caution boundary (Moderate, inclusive)", () => {
    const result = investmentOutlookScore({
      ...CASH_PURCHASE_BASE,
      irr: 13.5,
      discountRate: 12.5, // spread = 1 -> returnStrength = 55
      npv: 1,
      initialInvestment: 1,
      discountedPaybackYears: 9.4,
      usefulLifeYears: 20, // ratio = 0.47 -> speedToPayback = 55
      usagePerDay: 100,
      breakEvenUsagePerDay: 77, // cushion = 0.23 -> operationalMarginOfSafety = 55
    });
    expect(result.score).toBe(55);
    expect(result.band).toBe("Moderate");
  });

  it("composite = 35 exactly lands on the Caution/Weak boundary (Caution, inclusive)", () => {
    const result = investmentOutlookScore({
      ...CASH_PURCHASE_BASE,
      irr: 11.0,
      discountRate: 12.5, // spread = -1.5 -> returnStrength = 35
      npv: 1,
      initialInvestment: 1,
      discountedPaybackYears: 13,
      usefulLifeYears: 20, // ratio = 0.65 -> speedToPayback = 35
      usagePerDay: 100,
      breakEvenUsagePerDay: 86, // cushion = 0.14 -> operationalMarginOfSafety = 35
    });
    expect(result.score).toBe(35);
    expect(result.band).toBe("Caution");
  });

  it("composite = 34 (just below the Caution boundary) is Weak", () => {
    const result = investmentOutlookScore({
      ...CASH_PURCHASE_BASE,
      irr: 10.9,
      discountRate: 12.5, // spread = -1.6 -> returnStrength ~= 34
      npv: 1,
      initialInvestment: 1,
      discountedPaybackYears: 13.2,
      usefulLifeYears: 20, // ratio = 0.66 -> speedToPayback ~= 34
      usagePerDay: 100,
      breakEvenUsagePerDay: 86.4, // cushion = 0.136 -> operationalMarginOfSafety ~= 34
    });
    expect(result.score).toBe(34);
    expect(result.band).toBe("Weak");
  });

  it("matches financial-model-spec.md §1.7's own worked example exactly (a loan purchase, all four sub-scores active)", () => {
    const result = investmentOutlookScore({
      irr: 18.2,
      discountRate: 12.5,
      npv: 1, // unused when irr is defined
      initialInvestment: 1,
      discountedPaybackYears: 3.8,
      usefulLifeYears: 10,
      financingType: "loan",
      monthlyOperatingCashFlowBeforeEmi: 450_000,
      monthlyEmi: 320_000,
      usagePerDay: 25,
      breakEvenUsagePerDay: 20.5,
    });
    expect(result.subScores.returnStrength).toBeCloseTo(78.5, 6);
    expect(result.subScores.speedToPayback).toBeCloseTo(70, 6);
    expect(result.subScores.financingResilience as number).toBeCloseTo(40.625, 3);
    expect(result.subScores.operationalMarginOfSafety).toBeCloseTo(45, 6);
    expect(result.score).toBe(62);
    expect(result.band).toBe("Moderate");
    expect(result.driver).toBe("financingResilience");
    expect(result.driverFraming).toBe("risk"); // lowest sub-score (40.625) is < 55
  });

  it("running the same inputs twice produces an identical result (determinism, per agent-build-plan.md Phase 9's requirement extended to the score itself)", () => {
    const inputs: InvestmentOutlookInputs = {
      ...CASH_PURCHASE_BASE,
      irr: 17.5,
      discountRate: 12.5,
      npv: 1,
      initialInvestment: 1,
      discountedPaybackYears: 7,
      usefulLifeYears: 20,
      usagePerDay: 100,
      breakEvenUsagePerDay: 65,
    };
    expect(investmentOutlookScore(inputs)).toEqual(investmentOutlookScore({ ...inputs }));
  });
});
