// ROI, payback period, break-even usage — SPEC.md §31.11-31.13

export type FinancialView = "billed" | "realized" | "cash-flow";

export function roi(
  annualNetReturn: number,
  initialInvestment: number,
  view: FinancialView
): number {
  void view;
  return (annualNetReturn / initialInvestment) * 100;
}

export function paybackPeriod(
  initialInvestment: number,
  annualNetCashFlow: number
): number {
  if (annualNetCashFlow <= 0) {
    return Infinity;
  }

  return initialInvestment / annualNetCashFlow;
}

export function paybackPeriodFromCashFlows(
  initialInvestment: number,
  annualNetCashFlows: number[]
): number {
  let cumulativeCashFlow = 0;

  for (let yearIndex = 0; yearIndex < annualNetCashFlows.length; yearIndex += 1) {
    const annualCashFlow = annualNetCashFlows[yearIndex];

    if (
      annualCashFlow > 0 &&
      cumulativeCashFlow + annualCashFlow >= initialInvestment
    ) {
      return yearIndex + (initialInvestment - cumulativeCashFlow) / annualCashFlow;
    }

    cumulativeCashFlow += annualCashFlow;
  }

  return Infinity;
}

/** Running investment position by year-end, starting from -initialInvestment —
 *  the same crossing-point logic paybackPeriodFromCashFlows uses, but returning the
 *  full trajectory (one entry per year of annualNetCashFlows) instead of just the
 *  crossing year. Feeds the Results cumulative cash-flow chart (Phase 7) — the chart
 *  must never re-derive this itself (CONVENTIONS.md §3: one engine for dashboard and
 *  exports alike). */
export function cumulativeCashFlowSeries(
  initialInvestment: number,
  annualNetCashFlows: number[]
): number[] {
  let running = -initialInvestment;
  return annualNetCashFlows.map((cashFlow) => {
    running += cashFlow;
    return running;
  });
}
