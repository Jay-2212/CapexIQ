// Straight-line depreciation only for v1 — SPEC.md §17, §31.16

export function annualStraightLineDepreciation(
  purchaseCost: number,
  salvageValue: number,
  usefulLifeYears: number
): number {
  return (purchaseCost - salvageValue) / usefulLifeYears;
}
