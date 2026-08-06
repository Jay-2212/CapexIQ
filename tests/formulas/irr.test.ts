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
  // +25,000 in year 1, then -25,000 in year 2 (e.g. a mid-project decommissioning
  // cost). Hand-verifiable: NPV(25%) = 25000/1.25 - 25000/1.5625 - 4000
  //   = 20,000 - 16,000 - 4,000 = 0, and NPV(400%) = 25000/5 - 25000/25 - 4000
  //   = 5,000 - 1,000 - 4,000 = 0 — two distinct real IRRs (25% and 400%). At both
  // bracket endpoints (-99% and 1000%) NPV is negative (same sign), so the current
  // same-sign bisection guard throws rather than picking either root — a defensible
  // behavior (which root is "the" IRR is a methodology call, not implemented here),
  // pinned so a future change doesn't silently start returning one root without that
  // decision being made deliberately. See ISSUES.md.
  it("throws (rather than silently picking a root) for a classic multiple-IRR cash flow stream", () => {
    expect(() => irr(4000, [25000, -25000])).toThrow(/multiple possible IRRs/);
  });
});
