import { describe, expect, it } from "vitest";

import { maintenanceScheduleForYears } from "../../formulas/maintenance";

describe("maintenanceScheduleForYears", () => {
  it("builds warranty, CMC, and AMC periods with separate costs", () => {
    expect(maintenanceScheduleForYears(2, 2, 200000, 75000, 5)).toEqual([
      { yearNumber: 1, coverageType: "warranty", annualCost: 0 },
      { yearNumber: 2, coverageType: "warranty", annualCost: 0 },
      { yearNumber: 3, coverageType: "cmc", annualCost: 200000 },
      { yearNumber: 4, coverageType: "cmc", annualCost: 200000 },
      { yearNumber: 5, coverageType: "amc", annualCost: 75000 },
    ]);
  });

  it("preserves realistic messy annual costs", () => {
    expect(maintenanceScheduleForYears(1, 1, 183750.5, 82499.25, 3)[2]).toEqual({
      yearNumber: 3,
      coverageType: "amc",
      annualCost: 82499.25,
    });
  });

  it("keeps a horizon shorter than the warranty entirely under warranty", () => {
    expect(maintenanceScheduleForYears(3, 2, 200000, 75000, 1)).toEqual([
      { yearNumber: 1, coverageType: "warranty", annualCost: 0 },
    ]);
  });
});
