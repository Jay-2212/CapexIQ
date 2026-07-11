// Equivalent Annual Cost — financial-model-spec.md §2.2

export function equivalentAnnualCost(
  initialInvestment: number,
  costsByYear: number[],
  discountRate: number,
  usefulLifeYears: number
): number {
  const rate = discountRate / 100;
  const presentValueOfCosts = costsByYear.reduce(
    (total, cost, yearIndex) =>
      total + cost / (1 + rate) ** (yearIndex + 1),
    initialInvestment
  );
  const annuityFactor =
    rate === 0
      ? usefulLifeYears
      : (1 - (1 + rate) ** -usefulLifeYears) / rate;

  return presentValueOfCosts / annuityFactor;
}
