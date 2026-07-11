// Discounted payback period — financial-model-spec.md §2.1

export function discountedPaybackPeriod(
  initialInvestment: number,
  cashFlowsByYear: number[],
  discountRate: number
): number | null {
  let cumulativeDiscountedCashFlow = 0;

  for (let yearIndex = 0; yearIndex < cashFlowsByYear.length; yearIndex += 1) {
    const discountedCashFlow =
      cashFlowsByYear[yearIndex] /
      (1 + discountRate / 100) ** (yearIndex + 1);
    const shortfallBeforeYear = initialInvestment - cumulativeDiscountedCashFlow;

    if (
      discountedCashFlow > 0 &&
      cumulativeDiscountedCashFlow + discountedCashFlow >= initialInvestment
    ) {
      return yearIndex + shortfallBeforeYear / discountedCashFlow;
    }

    cumulativeDiscountedCashFlow += discountedCashFlow;
  }

  return null;
}
