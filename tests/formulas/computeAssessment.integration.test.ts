import { describe, expect, it } from "vitest";
import { emptyWizardState } from "../../app/forms/initialState";
import { wizardReducer } from "../../app/forms/wizardReducer";
import { toAssessmentInputs } from "../../app/forms/toAssessmentInputs";
import { computeAssessment } from "../../formulas/computeAssessment";
import { isStepComplete, isResultStateFresh } from "../../app/forms/wizardValidation";

describe("smoke: full wizard state -> pipeline", () => {
  it("MRI with defaults + hand-filled unresearched fields completes and produces a sane result", () => {
    let state = wizardReducer(emptyWizardState(), { type: "SELECT_EQUIPMENT_CATEGORY", category: "MRI" });
    const set = (path: string, value: number | string) => {
      state = wizardReducer(state, { type: "SET_FIELD", path, value });
    };
    set("preStep.hospitalBedSize", 200);
    set("preStep.cityTier", "Tier 1");
    // MRI's purchaseCost.typical and billedTariffPerUse.typical are both null
    // (no sourced default) -- must be hand-filled, same as a real Basic-Mode user.
    set("basic.purchaseCost", 3.5);
    set("basic.installationCost", 0.5);
    set("basic.billedTariffPerUse", 2500);
    set("basic.consumableCostPerUse", 100);
    set("basic.staffCostPerMonth", 100000);
    set("basic.electricityCostPerMonth", 20000);

    expect(isStepComplete("investment", state)).toBe(true);
    expect(isStepComplete("usage", state)).toBe(true);
    expect(isStepComplete("costs", state)).toBe(true);
    expect(isResultStateFresh(state)).toBe(true);

    const result = computeAssessment(toAssessmentInputs(state));
    console.log(JSON.stringify({
      initialInvestment: result.initialInvestment,
      npv: result.npv,
      irr: result.irr,
      payback: result.paybackYears,
      score: result.investmentOutlook.score,
      band: result.investmentOutlook.band,
    }, null, 2));

    expect(result.initialInvestment).toBe(40_000_000);
    expect(result.npv).toBeGreaterThan(-40_000_000);
    expect(Number.isFinite(result.investmentOutlook.score)).toBe(true);
  });

  it("Custom equipment (zero benchmark data) still gates correctly and never throws", () => {
    let state = wizardReducer(emptyWizardState(), { type: "SELECT_EQUIPMENT_CATEGORY", category: "Custom" });
    expect(state.basic.purchaseCost).toBeNull();
    expect(isStepComplete("investment", state)).toBe(false);
  });
});
