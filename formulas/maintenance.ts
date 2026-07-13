// Warranty / AMC / CMC maintenance-cliff schedule — SPEC.md §20

export interface MaintenanceScheduleEntry {
  yearNumber: number;
  coverageType: "warranty" | "cmc" | "amc" | "none" | "override";
  annualCost: number;
}

export function maintenanceScheduleForYears(
  warrantyYears: number,
  cmcYears: number,
  cmcAnnualCost: number,
  amcAnnualCost: number,
  totalYears: number
): MaintenanceScheduleEntry[] {
  return Array.from({ length: totalYears }, (_, yearIndex) => {
    const yearNumber = yearIndex + 1;

    if (yearNumber <= warrantyYears) {
      return { yearNumber, coverageType: "warranty", annualCost: 0 };
    }

    if (yearNumber <= warrantyYears + cmcYears) {
      return { yearNumber, coverageType: "cmc", annualCost: cmcAnnualCost };
    }

    return { yearNumber, coverageType: "amc", annualCost: amcAnnualCost };
  });
}
