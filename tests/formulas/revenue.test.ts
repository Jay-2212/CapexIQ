import { describe, expect, it } from "vitest";

import {
  billedMonthlyRevenue,
  monthlyRealizedRevenue,
} from "../../formulas/revenue";

describe("billedMonthlyRevenue", () => {
  it("calculates billed monthly revenue for a clean round-number case", () => {
    expect(billedMonthlyRevenue(10, 5000, 25)).toBe(1250000);
  });

  it("calculates billed monthly revenue for a realistic messy-number case", () => {
    expect(billedMonthlyRevenue(18.5, 7425.75, 24)).toBeCloseTo(3297033, 8);
  });

  it("returns zero billed revenue when usage is zero", () => {
    expect(billedMonthlyRevenue(0, 5000, 25)).toBe(0);
  });
});

describe("monthlyRealizedRevenue", () => {
  it("calculates realized monthly revenue for a clean round-number case", () => {
    expect(monthlyRealizedRevenue(10, 4000, 25)).toBe(1000000);
  });

  it("calculates realized monthly revenue for a realistic messy-number case", () => {
    expect(monthlyRealizedRevenue(18.5, 6120.4, 24)).toBeCloseTo(2717457.6, 8);
  });

  it("returns zero realized revenue when working days are zero", () => {
    expect(monthlyRealizedRevenue(10, 4000, 0)).toBe(0);
  });
});
