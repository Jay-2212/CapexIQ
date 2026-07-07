// Net present value — SPEC.md §31.14, §18

export function npv(
  discountRate: number,
  initialInvestment: number,
  cashFlowsByPeriod: number[]
): number {
  const discountRateDecimal = discountRate / 100;
  const discountedCashFlows = cashFlowsByPeriod.reduce(
    (totalDiscountedCashFlow, cashFlow, periodIndex) =>
      totalDiscountedCashFlow +
      cashFlow / (1 + discountRateDecimal) ** (periodIndex + 1),
    0
  );

  return discountedCashFlows - initialInvestment;
}
