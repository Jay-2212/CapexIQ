import { describe, expect, it } from "vitest";

import {
  breakEvenUsagePerDay,
  contributionPerUse,
} from "../../formulas/breakEven";

describe("contributionPerUse", () => {
  it("calculates contribution per use for a clean round-number case", () => {
    expect(contributionPerUse(5000, 1500)).toBe(3500);
  });

  it("calculates contribution per use for a realistic messy-number case", () => {
    expect(contributionPerUse(6120.4, 1835.25)).toBeCloseTo(4285.15, 8);
  });

  it("returns a negative contribution when variable cost exceeds realized revenue", () => {
    expect(contributionPerUse(1200, 1500)).toBe(-300);
  });
});

describe("breakEvenUsagePerDay", () => {
  it("calculates break-even usage per day for a clean round-number case", () => {
    expect(breakEvenUsagePerDay(350000, 3500, 25)).toBe(4);
  });

  it("calculates break-even usage per day for a realistic messy-number case", () => {
    expect(breakEvenUsagePerDay(875000, 4285.15, 24)).toBeCloseTo(
      8.508064672959717,
      8
    );
  });

  it("returns an Infinity-safe error when contribution margin is zero", () => {
    expect(() => breakEvenUsagePerDay(350000, 0, 25)).toThrow(
      /contribution per use is zero or negative/
    );
  });

  it("returns an Infinity-safe error when contribution margin is negative", () => {
    expect(() => breakEvenUsagePerDay(350000, -300, 25)).toThrow(
      /contribution per use is zero or negative/
    );
  });
});
