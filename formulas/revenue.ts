// Billed and realized revenue — SPEC.md §31.1-31.3

export function billedMonthlyRevenue(
  usagePerDay: number,
  averageBilledRevenuePerUse: number,
  workingDaysPerMonth: number
): number {
  return usagePerDay * averageBilledRevenuePerUse * workingDaysPerMonth;
}

export function monthlyRealizedRevenue(
  usagePerDay: number,
  realizedRevenuePerUse: number,
  workingDaysPerMonth: number
): number {
  return usagePerDay * realizedRevenuePerUse * workingDaysPerMonth;
}
