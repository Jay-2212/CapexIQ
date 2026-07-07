import { describe, expect, it } from "vitest";

import { monthlyEmi } from "../../formulas/emi";

describe("monthlyEmi", () => {
  it("calculates monthly EMI for a clean round-number loan", () => {
    expect(monthlyEmi(120000, 12, 12)).toBeCloseTo(10661.854641401, 8);
  });

  it("calculates monthly EMI for a realistic messy-number loan", () => {
    expect(monthlyEmi(2375000, 11.5, 84)).toBeCloseTo(41292.84444807047, 8);
  });

  it("splits principal evenly when annual interest rate is zero", () => {
    expect(monthlyEmi(360000, 0, 24)).toBe(15000);
  });
});
