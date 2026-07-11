import { describe, expect, it } from "vitest";

import { workingCapitalGap } from "../../formulas/workingCapital";

describe("workingCapitalGap", () => {
  it("calculates a clean round-number collection gap", () => {
    expect(workingCapitalGap(1000000, 750000)).toBe(250000);
  });

  it("calculates a realistic messy-number collection gap", () => {
    expect(workingCapitalGap(3297033.45, 2717457.6)).toBeCloseTo(579575.85, 8);
  });

  it("preserves a negative gap when cash receipts exceed recognized revenue", () => {
    expect(workingCapitalGap(500000, 550000)).toBe(-50000);
  });
});
