import { describe, expect, it } from "vitest";

import { npv } from "../../formulas/npv";

describe("npv", () => {
  it("calculates NPV for a clean round-number case", () => {
    expect(npv(10, 1000, [500, 500, 500])).toBeCloseTo(
      243.42599549211104,
      8
    );
  });

  it("calculates NPV for a realistic messy-number case", () => {
    expect(
      npv(12, 5750000, [
        860000, 930000, 1015000, 1110000, 1235000, 1380000, 1495000,
      ])
    ).toBeCloseTo(-736685.341494605, 8);
  });

  it("does not discount cash flows when discount rate is zero", () => {
    expect(npv(0, 1000, [400, 400, 400])).toBe(200);
  });
});
