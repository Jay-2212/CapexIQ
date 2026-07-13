import { describe, expect, it } from "vitest";

import {
  cumulativeCashFlowSeries,
  paybackPeriod,
  paybackPeriodFromCashFlows,
  roi,
} from "../../formulas/roi";

describe("roi", () => {
  it("returns ROI as a percentage for a clean round-number case", () => {
    expect(roi(200000, 1000000, "billed")).toBe(20);
  });

  it("calculates a realistic messy-number ROI independently of its label", () => {
    expect(roi(386425.75, 2375000, "realized")).toBeCloseTo(16.27055789473684, 8);
  });

  it("preserves a negative cash-flow ROI", () => {
    expect(roi(-50000, 1000000, "cash-flow")).toBe(-5);
  });
});

describe("paybackPeriod", () => {
  it("calculates simple payback for a clean round-number case", () => {
    expect(paybackPeriod(1000000, 250000)).toBe(4);
  });

  it("calculates a realistic messy-number payback", () => {
    expect(paybackPeriod(2375000, 386425.75)).toBeCloseTo(6.146070752272591, 8);
  });

  it("returns Infinity when annual cash flow is zero or negative", () => {
    expect(paybackPeriod(1000000, 0)).toBe(Infinity);
    expect(paybackPeriod(1000000, -1)).toBe(Infinity);
  });
});

describe("paybackPeriodFromCashFlows", () => {
  it("interpolates within the year that cumulative cash flow repays investment", () => {
    expect(paybackPeriodFromCashFlows(1000, [200, 400, 800])).toBe(2.5);
  });

  it("handles a realistic uneven cash-flow series", () => {
    expect(paybackPeriodFromCashFlows(2375000, [386425.75, 510000.5, 625500.25, 910000])).toBeCloseTo(3.9374434065934065, 8);
  });

  it("returns Infinity when payback does not occur in the horizon", () => {
    expect(paybackPeriodFromCashFlows(1000, [100, -50, 200])).toBe(Infinity);
  });
});

describe("cumulativeCashFlowSeries", () => {
  it("returns one running-total entry per year, starting below zero by the initial investment", () => {
    expect(cumulativeCashFlowSeries(1000, [200, 400, 800])).toEqual([-800, -400, 400]);
  });

  it("matches paybackPeriodFromCashFlows's crossing year for a realistic uneven series", () => {
    const initialInvestment = 2375000;
    const cashFlows = [386425.75, 510000.5, 625500.25, 910000];
    const series = cumulativeCashFlowSeries(initialInvestment, cashFlows);
    expect(series).toHaveLength(4);
    expect(series[2]).toBeLessThan(0);
    expect(series[3]).toBeGreaterThan(0);
    expect(paybackPeriodFromCashFlows(initialInvestment, cashFlows)).toBeCloseTo(3.9374434065934065, 8);
  });

  it("stays negative throughout when cash flow never recovers the investment", () => {
    expect(cumulativeCashFlowSeries(1000, [100, -50, 200])).toEqual([-900, -950, -750]);
  });
});
