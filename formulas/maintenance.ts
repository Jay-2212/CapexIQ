// Warranty / AMC / CMC maintenance-cliff schedule — SPEC.md §20

export interface MaintenanceScheduleEntry {
  yearNumber: number;
  coverageType: "warranty" | "cmc" | "amc" | "none";
  annualCost: number;
}

export function maintenanceScheduleForYears(
  warrantyYears: number,
  cmcYears: number,
  amcAnnualCost: number,
  totalYears: number
): MaintenanceScheduleEntry[] {
  throw new Error("not implemented");
}
