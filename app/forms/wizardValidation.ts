// Field-level and step-level validation — wizard-state.md §2's "validate on every
// change, not on blur or submit" timing, evaluated against content/inputs-metadata.json
// via fieldSchema.ts (the single source of bounds/required-ness/error copy).

import { getFieldDefinition, type FieldDefinition } from "./fieldSchema";
import { getFieldValue } from "./fieldPath";
import { PAYER_TYPES } from "./payerAndRampKeys";
import type { FieldValue, WizardState, WizardStep } from "./wizardTypes";

export function isRequiredIfSatisfiedOrNa(
  def: FieldDefinition,
  state: WizardState
): boolean {
  if (!def.requiredIf) return true;
  const match = /^acquisitionMode = (.+)$/.exec(def.requiredIf);
  if (!match) return true;
  return state.basic.acquisitionMode === match[1];
}

export function isFieldRequired(def: FieldDefinition, state: WizardState): boolean {
  if (def.required) return true;
  return def.requiredIf !== undefined && isRequiredIfSatisfiedOrNa(def, state);
}

export function validateFieldValue(
  def: FieldDefinition,
  value: FieldValue,
  state: WizardState
): string | null {
  const required = isFieldRequired(def, state);
  const isEmpty = value === null || value === "" || Number.isNaN(value as number);

  if (isEmpty) {
    return required ? (def.errorMessage ?? "This field is required.") : null;
  }

  if (typeof value === "number") {
    if (def.min !== undefined && value < def.min) return def.errorMessage ?? null;
    if (def.max !== undefined && value > def.max) return def.errorMessage ?? null;
  }

  if (typeof value === "string" && def.maxLength !== undefined) {
    if (value.length > def.maxLength) return def.errorMessage ?? null;
  }

  return null;
}

/** The payer-mix group constraint — one error, anchored to the group heading, shared
 *  by all 5 sliders' aria-describedby (wizard-state.md §2). */
export function payerMixGroupError(state: WizardState): string | null {
  const total = PAYER_TYPES.reduce(
    (sum, payer) => sum + (state.advanced.A.payerMixSharePct[payer.suffix] ?? 0),
    0
  );
  if (Math.abs(total - 100) > 0.05) {
    return `Payer mix shares must sum to 100% (currently ${total.toFixed(1)}%).`;
  }
  return null;
}

const STEP_FIELD_PATHS: Record<Exclude<WizardStep, "results">, string[]> = {
  preStep: [
    "preStep.equipmentCategory",
    "preStep.hospitalName",
    "preStep.hospitalBedSize",
    "preStep.cityTier",
    "preStep.hospitalType",
    "preStep.equipmentNameModel",
  ],
  investment: [
    "basic.purchaseCost",
    "basic.installationCost",
    "basic.launchDelayMonths",
    "basic.acquisitionMode",
  ],
  usage: ["basic.usagePerDay", "basic.billedTariffPerUse", "basic.workingDaysPerMonth"],
  costs: [
    "basic.consumableCostPerUse",
    "basic.professionalFeePerUse",
    "basic.otherVariableCostPerUse",
    "basic.staffCostPerMonth",
    "basic.electricityCostPerMonth",
    "basic.otherFixedCostPerMonth",
    "basic.warrantyYears",
    "basic.amcCmcCostPostWarranty",
    "advanced.F.discountRate",
    "advanced.F.targetIrr",
    "advanced.F.usefulLifeYears",
    "advanced.F.salvageValuePercentage",
    "advanced.C.downPayment",
    "advanced.C.loanInterestRate",
    "advanced.C.loanTenureMonths",
    "advanced.C.leaseRentalPerMonth",
    "advanced.C.leaseTenureMonths",
    ...PAYER_TYPES.map((p) => `advanced.A.payerMixSharePct.${p.suffix}`),
  ],
};

export { STEP_FIELD_PATHS };

/** ISS-25: which step a field's error-reveal gate (touched || attempted[step])
 *  should check. Deliberately NOT derived from `state.currentStep` — that's only
 *  synced by RouteGuard's effect on route change, which lags render by one commit
 *  (the same class of race ISS-26 fixed for hydration) and is unset entirely in any
 *  test/context that renders a field without RouteGuard mounted. A field's step is a
 *  static fact about the field, not something that should depend on which route
 *  happens to be active when it renders.
 *  `preStep.*`/`basic.*` are exhaustively covered by STEP_FIELD_PATHS (6 and 15
 *  fields respectively, matching PreStepFields/BasicFields exactly) — every
 *  `advanced.*` path not explicitly listed there still belongs to "costs", since
 *  AdvancedPanel (all of Groups A-F) only ever mounts on the costs step page. */
export function stepForFieldPath(path: string): Exclude<WizardStep, "results"> | null {
  for (const step of Object.keys(STEP_FIELD_PATHS) as Exclude<WizardStep, "results">[]) {
    if (STEP_FIELD_PATHS[step].includes(path)) return step;
  }
  if (path.startsWith("advanced.")) return "costs";
  return null;
}

/** The first invalid/missing required field on a step, in field order — used both by
 *  the step-gate and by the disabled-"Next" focus behavior (wizard-state.md §2, audit
 *  F7): clicking a disabled Next moves focus here. */
export function firstInvalidFieldOnStep(
  step: Exclude<WizardStep, "results">,
  state: WizardState
): string | null {
  for (const path of STEP_FIELD_PATHS[step]) {
    const def = getFieldDefinition(path);
    if (!isFieldRequired(def, state)) continue;
    const value = getFieldValue(state, path);
    if (validateFieldValue(def, value, state) !== null) return path;
  }
  if (step === "costs" && payerMixGroupError(state) !== null) {
    return "advanced.A.payerMixSharePct.privateCash";
  }
  return null;
}

export function isStepComplete(
  step: Exclude<WizardStep, "results">,
  state: WizardState
): boolean {
  return firstInvalidFieldOnStep(step, state) === null;
}

const STEP_ORDER: WizardStep[] = ["preStep", "investment", "usage", "costs", "results"];

/** wizard-state.md §2's route guard — the earliest step whose prerequisites are not
 *  yet complete, or null if every step up to and including `upTo` is complete. */
export function earliestIncompleteStep(
  state: WizardState,
  upTo: WizardStep = "results"
): WizardStep | null {
  const upToIndex = STEP_ORDER.indexOf(upTo);
  for (let i = 0; i < upToIndex; i += 1) {
    const step = STEP_ORDER[i] as Exclude<WizardStep, "results">;
    if (!isStepComplete(step, state)) return step;
  }
  return null;
}

/** wizard-state.md §4's fresh/stale contract: fresh once every currently-relevant
 *  field up through Step 3 is valid. */
export function isResultStateFresh(state: WizardState): boolean {
  return (
    isStepComplete("investment", state) &&
    isStepComplete("usage", state) &&
    isStepComplete("costs", state)
  );
}
