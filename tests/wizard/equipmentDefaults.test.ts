import { describe, expect, it } from "vitest";
import { equipmentDefaults } from "../../app/forms/equipmentDefaults";

describe("equipmentDefaults", () => {
  it("converts a Crore-denominated purchaseCost.typical as-is (Cath Lab: 9 => 9 Cr)", () => {
    const defaults = equipmentDefaults("Cath Lab");
    expect(defaults.purchaseCost).toBe(9);
    // installationAndAncillaryCostPercentage.typical is 25% => 9 * 0.25
    expect(defaults.installationCost).toBeCloseTo(2.25, 10);
  });

  it("converts a Lakh-denominated purchaseCost.typical by dividing by 100 (Dialysis: 11.5 => 0.115 Cr)", () => {
    const defaults = equipmentDefaults("Dialysis");
    expect(defaults.purchaseCost).toBeCloseTo(0.115, 10);
    // installationAndAncillaryCostPercentage.typical is 7.5% => 0.115 * 0.075
    expect(defaults.installationCost).toBeCloseTo(0.008625, 10);
  });

  it("stays null when purchaseCost.typical is unresearched (MRI)", () => {
    const defaults = equipmentDefaults("MRI");
    expect(defaults.purchaseCost).toBeNull();
    expect(defaults.installationCost).toBeNull();
  });

  it("rounds amcCmcCostPostWarranty to at most 2 decimal places for all equipment categories", () => {
    const cathLabDefaults = equipmentDefaults("Cath Lab");
    expect(cathLabDefaults.amcCmcCostPostWarranty).toBe(4.67);

    const ctDefaults = equipmentDefaults("CT");
    expect(ctDefaults.amcCmcCostPostWarranty).toBe(4.61);

    const mriDefaults = equipmentDefaults("MRI");
    expect(mriDefaults.amcCmcCostPostWarranty).toBe(4.91);

    const dialysisDefaults = equipmentDefaults("Dialysis");
    expect(dialysisDefaults.amcCmcCostPostWarranty).toBe(4.02);

    const ultrasoundDefaults = equipmentDefaults("Ultrasound");
    expect(ultrasoundDefaults.amcCmcCostPostWarranty).toBe(3.34);
  });
});
