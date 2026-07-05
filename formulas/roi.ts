// ROI, payback period, break-even usage — SPEC.md §31.11-31.13

export type FinancialView = "billed" | "realized" | "cash-flow";

export function roi(
  annualNetReturn: number,
  initialInvestment: number,
  view: FinancialView
): number {
  throw new Error("not implemented");
}

export function paybackPeriod(
  initialInvestment: number,
  annualNetCashFlow: number
): number {
  throw new Error("not implemented");
}
