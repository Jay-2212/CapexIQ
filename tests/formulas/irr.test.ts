import { describe, expect, it } from "vitest";

import { irr } from "../../formulas/irr";

describe("irr", () => {
  it("calculates IRR for a clean round-number case", () => {
    expect(irr(1000, [600, 600])).toBeCloseTo(13.066238629173057, 6);
  });

  it("calculates IRR for a realistic messy-number case", () => {
    expect(
      irr(5750000, [
        860000, 930000, 1015000, 1110000, 1235000, 1380000, 1495000,
      ])
    ).toBeCloseTo(8.219727290761313, 6);
  });

  it("returns a near-zero IRR when undiscounted payback exactly equals investment", () => {
    expect(irr(1000, [1000])).toBeCloseTo(0, 6);
  });

  it("throws a clear error when cash flows have no valid IRR", () => {
    expect(() => irr(1000, [-100, -200])).toThrow(
      /do not include both positive and negative values/
    );
  });

  // Classic textbook double-sign-change cash flow (Brealey-Myers): -4,000 upfront,
  // +25,000 in year 1, then -25,000 in year 2. It has two valid roots (25% and
  // 400%); the product deliberately reports the smallest non-negative root so a
  // decision report remains stable instead of falling back to "Undefined".
  it("selects the smallest non-negative root when a cash-flow stream has multiple IRRs", () => {
    expect(irr(4000, [25000, -25000])).toBeCloseTo(25, 6);
  });
});
