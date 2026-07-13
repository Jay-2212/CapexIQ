// Financing-mode mapping (WizardState -> AssessmentInputs) — the piece that's hardest
// to get right silently wrong, since it's a direct translation of user-entered
// financial figures into the pipeline. Cash/Loan verified against golden scenarios
// A/B already (tests/formulas/computeAssessment.test.ts); this file covers Lease
// (no golden test exists for it — see toAssessmentInputs.ts's own comment on the
// leaseRentalPerMonth-for-the-full-horizon assumption) and the Basic/Advanced
// maintenance-path switch (PBA-4).

import { describe, expect, it } from "vitest";
import { wizardReducer } from "../../app/forms/wizardReducer";
import { emptyWizardState } from "../../app/forms/initialState";
import { toAssessmentInputs } from "../../app/forms/toAssessmentInputs";
import { computeAssessment } from "../../formulas/computeAssessment";

function baseMriState() {
  let state = wizardReducer(emptyWizardState(), {
    type: "SELECT_EQUIPMENT_CATEGORY",
    category: "MRI",
  });
  const set = (path: string, value: number | string) => {
    state = wizardReducer(state, { type: "SET_FIELD", path, value });
  };
  set("basic.purchaseCost", 3);
  set("basic.installationCost", 0.3);
  set("basic.billedTariffPerUse", 2500);
  set("basic.consumableCostPerUse", 100);
  set("basic.staffCostPerMonth", 100000);
  set("basic.electricityCostPerMonth", 20000);
  return state;
}

describe("toAssessmentInputs — financing mode mapping", () => {
  it("Cash: no financing cost applied to any year", () => {
    const inputs = toAssessmentInputs(baseMriState());
    expect(inputs.financing).toEqual({ type: "cash" });
    const result = computeAssessment(inputs);
    expect(result.monthlyEmiOrLease).toBeNull();
    expect(result.annualNetCashFlowsAfterFinancing).toEqual(
      result.annualNetCashFlowsBeforeFinancing
    );
  });

  it("Loan: EMI is computed from the financed principal (purchase+installation minus down payment)", () => {
    let state = baseMriState();
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "basic.acquisitionMode",
      value: "Loan",
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "advanced.C.downPayment",
      value: 0.66,
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "advanced.C.loanInterestRate",
      value: 11.5,
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "advanced.C.loanTenureMonths",
      value: 60,
    });

    const inputs = toAssessmentInputs(state);
    expect(inputs.financing).toMatchObject({ type: "loan", tenureMonths: 60 });
    const result = computeAssessment(inputs);
    expect(result.monthlyEmiOrLease).toBeGreaterThan(0);
    // First-year cash flow is reduced by 12 months of EMI relative to the
    // pre-financing figure.
    expect(result.annualNetCashFlowsAfterFinancing[0]).toBeLessThan(
      result.annualNetCashFlowsBeforeFinancing[0]
    );
  });

  it("Lease: monthly rental applied as an annual cost across the full useful-life horizon (documented assumption — no leaseTenureMonths field exists in the schema)", () => {
    let state = baseMriState();
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "basic.acquisitionMode",
      value: "Lease",
    });
    state = wizardReducer(state, {
      type: "SET_FIELD",
      path: "advanced.C.leaseRentalPerMonth",
      value: 50000,
    });

    const inputs = toAssessmentInputs(state);
    expect(inputs.financing).toEqual({ type: "lease", rentalPerMonth: 50000 });
    const result = computeAssessment(inputs);
    expect(result.monthlyEmiOrLease).toBe(50000);
    const lastYearIndex = result.annualNetCashFlowsAfterFinancing.length - 1;
    // Unlike a loan (which pays off), the lease deduction applies to every year,
    // including the last year of the useful-life horizon.
    expect(result.annualNetCashFlowsAfterFinancing[lastYearIndex]).toBe(
      result.annualNetCashFlowsBeforeFinancing[lastYearIndex] - 50000 * 12
    );
  });
});

describe("toAssessmentInputs — Basic vs Advanced maintenance path (PBA-4)", () => {
  it("Basic Mode (Advanced closed) uses one flat blended rate for the whole post-warranty period", () => {
    const state = baseMriState();
    expect(state.advancedOpen).toBe(false);
    const inputs = toAssessmentInputs(state);
    expect(inputs.maintenance.cmcYears).toBe(0);
    expect(inputs.maintenance.cmcAnnualCost).toBe(0);
    expect(inputs.maintenance.amcAnnualCost).toBeGreaterThan(0);
  });

  it("Advanced Mode (opened) uses cmcYears + equipment-sourced CMC/AMC rates instead of the flat blend", () => {
    let state = baseMriState();
    state = wizardReducer(state, { type: "TOGGLE_ADVANCED" });
    const inputs = toAssessmentInputs(state);
    expect(inputs.maintenance.cmcYears).toBeGreaterThan(0);
    expect(inputs.maintenance.cmcAnnualCost).toBeGreaterThan(0);
    expect(inputs.maintenance.amcAnnualCost).toBeGreaterThan(0);
  });
});
