import { describe, expect, it } from "vitest";

import { discountedPaybackPeriod } from "../../formulas/discountedPayback";

describe("discountedPaybackPeriod", () => {
  it("interpolates a clean round-number zero-discount case", () => {
    expect(discountedPaybackPeriod(1000, [400, 400, 400], 0)).toBe(2.5);
  });

  it("calculates a realistic messy discounted payback", () => {
    expect(discountedPaybackPeriod(2375000, [700000, 800000, 900000, 1000000], 11.5)).toBeCloseTo(3.7024028389843746, 8);
  });

  it("returns null when discounted cash flows never repay the investment", () => {
    expect(discountedPaybackPeriod(1000, [200, 200, 200], 10)).toBeNull();
  });
});
