import { describe, expect, it } from "vitest";

import { realizedRevenuePerUse } from "../../formulas/realization";

describe("realizedRevenuePerUse", () => {
  it("calculates payer-weighted realization for a clean round-number case", () => {
    expect(
      realizedRevenuePerUse([
        { payerName: "Cash", shareOfVolume: 60, billedTariff: 1000, realizationPercentage: 100 },
        { payerName: "Credit", shareOfVolume: 40, billedTariff: 1000, realizationPercentage: 50 },
      ])
    ).toBe(800);
  });

  it("calculates payer-weighted realization for a realistic messy-number case", () => {
    expect(
      realizedRevenuePerUse([
        { payerName: "Cash", shareOfVolume: 57.5, billedTariff: 7425.75, realizationPercentage: 98.5 },
        { payerName: "TPA", shareOfVolume: 42.5, billedTariff: 6810.4, realizationPercentage: 86.25 },
      ])
    ).toBeCloseTo(6702.19640625, 8);
  });

  it("returns zero for an empty payer mix", () => {
    expect(realizedRevenuePerUse([])).toBe(0);
  });
});
