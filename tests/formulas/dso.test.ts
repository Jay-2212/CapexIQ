import { describe, expect, it } from "vitest";

import { cashReceivedByMonth } from "../../formulas/dso";

describe("cashReceivedByMonth", () => {
  it("shifts payer shares by whole 30-day month offsets", () => {
    expect(
      cashReceivedByMonth([1000, 1000], [
        { payerName: "Cash", shareOfVolume: 60, daysToCollect: 0 },
        { payerName: "TPA", shareOfVolume: 40, daysToCollect: 30 },
      ])
    ).toEqual([600, 1000, 400]);
  });

  it("rounds a partial collection month up and sums messy payer shares", () => {
    const result = cashReceivedByMonth([1234.5, 987.65], [
        { payerName: "Cash", shareOfVolume: 57.5, daysToCollect: 0 },
        { payerName: "TPA", shareOfVolume: 42.5, daysToCollect: 45 },
      ]);

    expect(result[0]).toBeCloseTo(709.8375, 8);
    expect(result[1]).toBeCloseTo(567.89875, 8);
    expect(result[2]).toBeCloseTo(524.6625, 8);
    expect(result[3]).toBeCloseTo(419.75125, 8);
  });

  it("returns an empty series when there is no revenue horizon", () => {
    expect(cashReceivedByMonth([], [{ payerName: "TPA", shareOfVolume: 100, daysToCollect: 90 }])).toEqual([]);
  });
});
