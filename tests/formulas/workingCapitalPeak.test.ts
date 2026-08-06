// formulas/workingCapitalPeak.ts had no dedicated unit test before this file — it was
// only exercised indirectly through tests/formulas/computeAssessment.test.ts's golden
// scenarios. Fixtures below are hand-derived (arithmetic shown in each test's comment,
// not copied from a run of the code under test) — see cashReceivedByMonth's own
// contract (formulas/dso.ts): a payer's collection delay shifts by
// ceil(daysToCollect / 30) whole months.

import { describe, expect, it } from "vitest";

import { peakWorkingCapitalGap } from "../../formulas/workingCapitalPeak";

describe("peakWorkingCapitalGap", () => {
  // Two payers, 3 months of flat INR 1,000 realized revenue: Payer A (60% share,
  // 0-day delay, collected same month), Payer B (40% share, 45-day delay -> ceil(45/30)
  // = 2-month offset).
  //
  // Cash received by month (hand-derived):
  //   month0's 1000: A pays 600 in month0; B pays 400 in month2
  //   month1's 1000: A pays 600 in month1; B pays 400 in month3
  //   month2's 1000: A pays 600 in month2; B pays 400 in month4
  //   cashReceived = [600, 600, 1000, 400, 400]
  //
  // Cumulative realized vs. cumulative cash, month by month:
  //   month0: realized 1000, cash  600, gap  400
  //   month1: realized 2000, cash 1200, gap  800   <- peak (first time gap hits 800)
  //   month2: realized 3000, cash 2200, gap  800   <- ties the peak, doesn't overtake it
  //   month3: realized 3000, cash 2600, gap  400
  //   month4: realized 3000, cash 3000, gap    0
  const monthlyRealized = [1000, 1000, 1000];
  const payers = [
    { payerName: "Cash", shareOfVolume: 60, daysToCollect: 0 },
    { payerName: "TPA", shareOfVolume: 40, daysToCollect: 45 },
  ];

  it("finds the peak gap and the first month it's reached, not a later tie", () => {
    const { peakGap, peakMonthIndex } = peakWorkingCapitalGap(monthlyRealized, payers);
    expect(peakGap).toBe(800);
    expect(peakMonthIndex).toBe(1);
  });

  it("has zero peak gap when every payer collects with no delay", () => {
    const { peakGap, peakMonthIndex } = peakWorkingCapitalGap(monthlyRealized, [
      { payerName: "Cash", shareOfVolume: 100, daysToCollect: 0 },
    ]);
    expect(peakGap).toBe(0);
    expect(peakMonthIndex).toBe(0);
  });

  it("returns zero gap for an empty revenue horizon (no months to accumulate a gap over)", () => {
    const { peakGap, peakMonthIndex } = peakWorkingCapitalGap([], payers);
    expect(peakGap).toBe(0);
    expect(peakMonthIndex).toBe(0);
  });

  it("grows the gap every month for a single payer with a delay longer than the input revenue horizon", () => {
    // 3 months of 1000 revenue, one payer, 500-day delay (ceil(500/30) = 17 months) —
    // cash IS eventually received (at months 17-19 of the resulting 20-month array),
    // but only after month 2, the last month with any revenue to accumulate a gap
    // from. So the gap grows every month through month 2 (nothing has been collected
    // yet) and the peak — reached at month 2, before any collection occurs — is the
    // full 3-month realized total; the later collection months only shrink the gap
    // back down, they don't change where the peak already landed.
    const { peakGap, peakMonthIndex } = peakWorkingCapitalGap(monthlyRealized, [
      { payerName: "SlowPayer", shareOfVolume: 100, daysToCollect: 500 },
    ]);
    expect(peakGap).toBe(3000);
    expect(peakMonthIndex).toBe(2);
  });
});
