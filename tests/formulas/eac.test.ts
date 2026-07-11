import { describe, expect, it } from "vitest";

import { equivalentAnnualCost } from "../../formulas/eac";

describe("equivalentAnnualCost", () => {
  it("calculates EAC for a clean round-number case", () => {
    expect(equivalentAnnualCost(1000, [100, 100, 100], 10, 3)).toBeCloseTo(502.1148036253776, 8);
  });

  it("calculates EAC for realistic messy annual costs", () => {
    expect(equivalentAnnualCost(2375000, [185000.5, 192500.25, 310000.75, 325000], 11.5, 4)).toBeCloseTo(1019563.6029051836, 8);
  });

  it("uses useful life as the annuity factor at a zero discount rate", () => {
    expect(equivalentAnnualCost(1000, [100, 100, 100], 0, 3)).toBeCloseTo(433.3333333333333, 8);
  });
});
