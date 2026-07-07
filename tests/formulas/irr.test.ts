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
});
