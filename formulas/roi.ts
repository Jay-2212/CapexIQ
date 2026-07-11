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
