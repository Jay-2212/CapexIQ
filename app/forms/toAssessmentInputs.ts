// Maps a (valid) WizardState to formulas/computeAssessment.ts's AssessmentInputs — the
// second half of wizard-state.md §4's "exactly one derivation" requirement (the first
// half, resolvePayerMix, is separate because it's independently reusable/testable).
// Callers must only invoke this once every currently-relevant required field is valid
// (see app/forms/wizardValidation.ts's isResultStateFresh) — this function assumes
// non-null inputs and does not itself guard against missing data.

import type { AssessmentInputs } from "@/formulas/computeAssessment";
import { resolvePayerMix } from "./resolvePayerMix";
import { equipmentDefaults } from "./equipmentDefaults";
import type { WizardState } from "./wizardTypes";

const CRORE = 10_000_000;

export function toAssessmentInputs(state: WizardState): AssessmentInputs {
  const { basic, advanced, preStep } = state;
  const purchaseCost = (basic.purchaseCost ?? 0) * CRORE;
  const installationCost = (basic.installationCost ?? 0) * CRORE;
  const usefulLifeYears = advanced.F.usefulLifeYears ?? 1;
  const warrantyYears = basic.warrantyYears ?? 0;

  let cmcYears: number;
  let cmcAnnualCost: number;
  let amcAnnualCost: number;

  if (!state.advancedOpen) {
    // Basic Mode: one flat blended rate for the whole post-warranty period
    // (capexiq-prebuild-assurance PBA-4) — cmcYears is 0 so the schedule goes
    // straight from warranty to a flat "amc" rate equal to the blended figure.
    cmcYears = 0;
    cmcAnnualCost = 0;
    amcAnnualCost = ((basic.amcCmcCostPostWarranty ?? 0) / 100) * purchaseCost;
  } else {
    const defaults = preStep.equipmentCategory
      ? equipmentDefaults(preStep.equipmentCategory)
      : null;
    cmcYears = advanced.E.cmcYears ?? defaults?.cmcYears ?? 0;
    cmcAnnualCost =
      ((defaults?.cmcAnnualCostPercentage ?? 0) / 100) * purchaseCost;
    amcAnnualCost =
      ((defaults?.amcAnnualCostPercentage ?? 0) / 100) * purchaseCost;
  }

  const financing: AssessmentInputs["financing"] =
    basic.acquisitionMode === "Loan"
      ? {
          type: "loan",
          downPayment: (advanced.C.downPayment ?? 0) * CRORE,
          interestRate: advanced.C.loanInterestRate ?? 0,
          tenureMonths: advanced.C.loanTenureMonths ?? 1,
        }
      : basic.acquisitionMode === "Lease"
        ? { type: "lease", rentalPerMonth: advanced.C.leaseRentalPerMonth ?? 0 }
        : { type: "cash" };

  return {
    purchaseCost,
    installationCost,
    usagePerDay: basic.usagePerDay ?? 0,
    workingDaysPerMonth: basic.workingDaysPerMonth ?? 25,
    payerMix: resolvePayerMix(state),
    variableCostPerUse:
      (basic.consumableCostPerUse ?? 0) +
      (basic.professionalFeePerUse ?? 0) +
      (basic.otherVariableCostPerUse ?? 0),
    fixedCostPerMonth:
      (basic.staffCostPerMonth ?? 0) +
      (basic.electricityCostPerMonth ?? 0) +
      (basic.otherFixedCostPerMonth ?? 0),
    financing,
    maintenance: { warrantyYears, cmcYears, cmcAnnualCost, amcAnnualCost },
    usefulLifeYears,
    discountRate: advanced.F.discountRate ?? 12.5,
    salvageValuePercentage: advanced.F.salvageValuePercentage ?? 0,
  };
}
