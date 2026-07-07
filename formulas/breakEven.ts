// Break-even usage per day — SPEC.md §31.13

export function contributionPerUse(
  realizedRevenuePerUse: number,
  variableCostPerUse: number
): number {
  return realizedRevenuePerUse - variableCostPerUse;
}

export function breakEvenUsagePerDay(
  fixedMonthlyCost: number,
  contributionPerUseValue: number,
  workingDaysPerMonth: number
): number {
  if (contributionPerUseValue <= 0) {
    throw new Error(
      "Break-even usage is undefined when contribution per use is zero or negative."
    );
  }

  return fixedMonthlyCost / contributionPerUseValue / workingDaysPerMonth;
}
