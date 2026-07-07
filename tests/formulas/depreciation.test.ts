import { describe, expect, it } from "vitest";

import { annualStraightLineDepreciation } from "../../formulas/depreciation";

describe("annualStraightLineDepreciation", () => {
  it("calculates annual depreciation for a clean round-number case", () => {
    expect(annualStraightLineDepreciation(100000, 10000, 5)).toBe(18000);
  });

  it("calculates annual depreciation for a realistic messy-number case", () => {
    expect(
      annualStraightLineDepreciation(1837500, 125000, 13)
    ).toBeCloseTo(131730.76923076922, 8);
  });

  it("returns zero depreciation when purchase cost equals salvage value", () => {
    expect(annualStraightLineDepreciation(750000, 750000, 10)).toBe(0);
  });
});
