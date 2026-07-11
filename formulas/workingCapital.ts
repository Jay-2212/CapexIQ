// Working capital gap between realized revenue and cash received — SPEC.md §14

export function workingCapitalGap(
  cumulativeRealizedRevenue: number,
  cumulativeCashReceived: number
): number {
  return cumulativeRealizedRevenue - cumulativeCashReceived;
}
