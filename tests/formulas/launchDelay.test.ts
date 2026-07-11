import { describe, expect, it } from "vitest";

import { preOperativeInterest } from "../../formulas/launchDelay";

describe("preOperativeInterest", () => {
  it("calculates simple interest for a clean round-number delay", () => {
    expect(preOperativeInterest(1200000, 12, 3)).toBe(36000);
  });

  it("calculates simple interest for a realistic messy-number delay", () => {
    expect(preOperativeInterest(2375000, 11.5, 7)).toBeCloseTo(159322.91666666666, 8);
  });

  it("returns zero when launch is not delayed", () => {
    expect(preOperativeInterest(1200000, 12, 0)).toBe(0);
  });
});
