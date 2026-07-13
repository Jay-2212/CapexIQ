import { describe, expect, it } from "vitest";
import { wizardReducer } from "../../app/forms/wizardReducer";
import { emptyWizardState } from "../../app/forms/initialState";
import {
  earliestIncompleteStep,
  firstInvalidFieldOnStep,
  isFieldRequired,
  isResultStateFresh,
  isStepComplete,
  payerMixGroupError,
  stepForFieldPath,
  validateFieldValue,
} from "../../app/forms/wizardValidation";
import { getFieldDefinition } from "../../app/forms/fieldSchema";

function completeMri() {
  let state = wizardReducer(emptyWizardState(), {
    type: "SELECT_EQUIPMENT_CATEGORY",
    category: "MRI",
  });
  const set = (path: string, value: number | string) => {
    state = wizardReducer(state, { type: "SET_FIELD", path, value });
  };
  set("preStep.hospitalName", "Lotus Hospital");
  set("preStep.hospitalBedSize", 200);
  set("preStep.cityTier", "Tier 1");
  set("basic.purchaseCost", 3.5);
  set("basic.installationCost", 0.5);
  set("basic.billedTariffPerUse", 2500);
  set("basic.consumableCostPerUse", 100);
  set("basic.staffCostPerMonth", 100000);
  set("basic.electricityCostPerMonth", 20000);
  return state;
}

describe("stepForFieldPath — ISS-25's static field-to-step lookup (deliberately not state.currentStep)", () => {
  it("resolves preStep and basic.* fields via STEP_FIELD_PATHS", () => {
    expect(stepForFieldPath("preStep.hospitalBedSize")).toBe("preStep");
    expect(stepForFieldPath("basic.purchaseCost")).toBe("investment");
    expect(stepForFieldPath("basic.usagePerDay")).toBe("usage");
    expect(stepForFieldPath("basic.staffCostPerMonth")).toBe("costs");
  });

  it("falls back to 'costs' for any advanced.* field not explicitly listed, since AdvancedPanel only mounts there", () => {
    // advanced.B.expectedMatureUtilization isn't one of STEP_FIELD_PATHS' required-
    // gating fields, but still lives inside the Advanced panel on the costs step.
    expect(stepForFieldPath("advanced.B.expectedMatureUtilization")).toBe("costs");
    expect(stepForFieldPath("advanced.F.discountRate")).toBe("costs");
  });
});

describe("isFieldRequired — requiredIf cross-step conditional (wizard-state.md §1.2)", () => {
  it("downPayment is not required for a Cash purchase", () => {
    const state = emptyWizardState();
    const def = getFieldDefinition("advanced.C.downPayment");
    expect(isFieldRequired(def, state)).toBe(false);
  });

  it("downPayment becomes required once acquisitionMode is Loan, even though acquisitionMode lives on a different step", () => {
    const state = wizardReducer(emptyWizardState(), {
      type: "SET_FIELD",
      path: "basic.acquisitionMode",
      value: "Loan",
    });
    const def = getFieldDefinition("advanced.C.downPayment");
    expect(isFieldRequired(def, state)).toBe(true);
  });

  it("leaseRentalPerMonth requires Lease specifically, not Loan", () => {
    const state = wizardReducer(emptyWizardState(), {
      type: "SET_FIELD",
      path: "basic.acquisitionMode",
      value: "Loan",
    });
    const def = getFieldDefinition("advanced.C.leaseRentalPerMonth");
    expect(isFieldRequired(def, state)).toBe(false);
  });
});

describe("validateFieldValue — live, no-debounce timing (wizard-state.md §2)", () => {
  it("returns the field's errorMessage when a required field is empty", () => {
    const def = getFieldDefinition("basic.purchaseCost");
    expect(validateFieldValue(def, null, emptyWizardState())).toBe(def.errorMessage);
  });

  it("returns an error for an out-of-bounds value", () => {
    const def = getFieldDefinition("basic.purchaseCost");
    expect(validateFieldValue(def, 500, emptyWizardState())).not.toBeNull();
  });

  it("clears the instant the value becomes valid", () => {
    const def = getFieldDefinition("basic.purchaseCost");
    expect(validateFieldValue(def, 3.5, emptyWizardState())).toBeNull();
  });

  it("an optional empty field never errors", () => {
    const def = getFieldDefinition("basic.otherFixedCostPerMonth");
    expect(validateFieldValue(def, null, emptyWizardState())).toBeNull();
  });
});

describe("payerMixGroupError (wizard-state.md §2, audit F8)", () => {
  it("no error when the default 100% single-payer mix is unchanged", () => {
    expect(payerMixGroupError(emptyWizardState())).toBeNull();
  });

  it("errors when the group no longer sums to 100%", () => {
    const state = wizardReducer(emptyWizardState(), {
      type: "SET_FIELD",
      path: "advanced.A.payerMixSharePct.privateCash",
      value: 60,
    });
    expect(payerMixGroupError(state)).toMatch(/must sum to 100%/);
  });
});

describe("isStepComplete / firstInvalidFieldOnStep", () => {
  it("preStep is incomplete on a genuinely empty state", () => {
    expect(isStepComplete("preStep", emptyWizardState())).toBe(false);
    expect(firstInvalidFieldOnStep("preStep", emptyWizardState())).toBe(
      "preStep.equipmentCategory"
    );
  });

  it("every step is complete once every required field is filled (golden MRI walkthrough)", () => {
    const state = completeMri();
    expect(isStepComplete("preStep", state)).toBe(true);
    expect(isStepComplete("investment", state)).toBe(true);
    expect(isStepComplete("usage", state)).toBe(true);
    expect(isStepComplete("costs", state)).toBe(true);
    expect(firstInvalidFieldOnStep("costs", state)).toBeNull();
  });

  it("MRI's null billedTariffPerUse default correctly blocks Step 2 until hand-filled", () => {
    let state = wizardReducer(emptyWizardState(), {
      type: "SELECT_EQUIPMENT_CATEGORY",
      category: "MRI",
    });
    expect(state.basic.billedTariffPerUse).toBeNull();
    expect(isStepComplete("usage", state)).toBe(false);
  });
});

describe("earliestIncompleteStep — route guard (wizard-state.md §2)", () => {
  it("landing on /assess/costs with nothing filled redirects to preStep, the earliest incomplete step", () => {
    expect(earliestIncompleteStep(emptyWizardState(), "costs")).toBe("preStep");
  });

  it("returns null once every step up to the target is complete", () => {
    const state = completeMri();
    expect(earliestIncompleteStep(state, "results")).toBeNull();
  });

  it("a step's own incompleteness is not itself flagged when checking prerequisites only up to it", () => {
    // upTo="investment" only checks preStep, not investment itself.
    let state = wizardReducer(emptyWizardState(), {
      type: "SELECT_EQUIPMENT_CATEGORY",
      category: "MRI",
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "preStep.hospitalName",
      value: "Lotus Hospital",
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "preStep.hospitalBedSize",
      value: 200,
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "preStep.cityTier",
      value: "Tier 1",
    });
    expect(earliestIncompleteStep(state, "investment")).toBeNull();
  });
});

describe("isResultStateFresh (wizard-state.md §4)", () => {
  it("false until Investment, Usage, and Costs are all complete", () => {
    expect(isResultStateFresh(emptyWizardState())).toBe(false);
  });

  it("true once the full golden MRI walkthrough is complete", () => {
    expect(isResultStateFresh(completeMri())).toBe(true);
  });
});
