// Builds a fresh WizardState — either genuinely empty (no equipment chosen yet, the
// pre-step's starting point) or pre-filled with sourced defaults once an equipment
// category is known (design/ux-product-spec.md §6's "every wizard field is pre-filled
// with its default/typical value where one exists").

import { PAYER_TYPES, RAMP_PERIODS } from "./payerAndRampKeys";
import { equipmentDefaults, targetIrrHeuristic } from "./equipmentDefaults";
import type { EquipmentCategory, PayerKeyedFields, WizardState } from "./wizardTypes";

function emptyPayerKeyed(): PayerKeyedFields {
  const map: PayerKeyedFields = {};
  for (const payer of PAYER_TYPES) map[payer.suffix] = null;
  return map;
}

/** payerMixSharePct is `required: true` per payer in content/inputs-metadata.json with
 *  a group-sum-to-100 constraint, but — like targetIrr before the F1 fix — it has no
 *  sourced default and sits inside the collapsed Advanced panel; left genuinely empty
 *  it would block every Basic-Mode-only user's Step 3 "Next" exactly the way targetIrr
 *  almost did. Found during Phase 6 implementation (not flagged by either prior audit);
 *  fixed the same way F1 was: auto-fill an implicit single-payer default (100% private
 *  cash, matching Basic Mode's own SPEC.md §14.3 "first-pass billed revenue" premise)
 *  so the group constraint is satisfied by default and the gate needs no special case.
 *  See HANDOFF.md's Phase 6 entry. */
function defaultPayerMixShare(): PayerKeyedFields {
  const map: PayerKeyedFields = {};
  for (const payer of PAYER_TYPES) {
    map[payer.suffix] = payer.suffix === "privateCash" ? 100 : 0;
  }
  return map;
}

function defaultPayerRealization(): PayerKeyedFields {
  const map: PayerKeyedFields = {};
  for (const payer of PAYER_TYPES) map[payer.suffix] = 100;
  return map;
}

function defaultPayerCollectionDelay(): PayerKeyedFields {
  const map: PayerKeyedFields = {};
  for (const payer of PAYER_TYPES) map[payer.suffix] = 0;
  return map;
}

function emptyRampKeyed(): PayerKeyedFields {
  const map: PayerKeyedFields = {};
  for (const ramp of RAMP_PERIODS) map[ramp.suffix] = null;
  return map;
}

export function emptyWizardState(): WizardState {
  return {
    schemaVersion: 1,
    savedAt: null,
    currentStep: "preStep",
    preStep: {
      equipmentCategory: null,
      hospitalName: "",
      hospitalBedSize: null,
      cityTier: null,
      hospitalType: null,
      equipmentNameModel: "",
    },
    basic: {
      purchaseCost: null,
      installationCost: null,
      launchDelayMonths: null,
      acquisitionMode: "Cash",
      usagePerDay: null,
      billedTariffPerUse: null,
      workingDaysPerMonth: null,
      consumableCostPerUse: null,
      professionalFeePerUse: null,
      otherVariableCostPerUse: null,
      staffCostPerMonth: null,
      electricityCostPerMonth: null,
      otherFixedCostPerMonth: null,
      warrantyYears: null,
      amcCmcCostPostWarranty: null,
    },
    advancedOpen: false,
    currencyUnits: {
      purchaseCost: "Crore",
      installationCost: "Lakh",
    },
    advanced: {
      A: {
        payerMixSharePct: defaultPayerMixShare(),
        billedTariffByPayerType: emptyPayerKeyed(),
        realizationPctByPayerType: defaultPayerRealization(),
        claimDeductionPctByPayerType: emptyPayerKeyed(),
        collectionDelayDaysByPayerType: defaultPayerCollectionDelay(),
      },
      B: { utilizationRampPct: emptyRampKeyed(), expectedMatureUtilization: null },
      C: {
        downPayment: null,
        loanInterestRate: null,
        loanTenureMonths: null,
        processingChargesPct: null,
        emiStartMonth: null,
        moratoriumPeriodMonths: null,
        leaseRentalPerMonth: null,
        leaseTenureMonths: null,
      },
      D: {
        civilWorkDurationMonths: null,
        installationDurationMonths: null,
        licensingApprovalDurationMonths: null,
        trainingCommissioningDurationMonths: null,
        preOpeningFixedCosts: null,
        workingCapitalBufferAmount: null,
      },
      E: {
        cmcYears: null,
        maintenanceCostByYearPct: [],
        maintenanceInflationPct: null,
        majorReplacementCost: null,
      },
      F: {
        discountRate: null,
        targetIrr: null,
        inflationRate: null,
        usefulLifeYears: null,
        salvageValuePercentage: null,
        depreciationMethod: "Straight-line",
        priceEscalationPct: null,
        costEscalationPct: null,
      },
    },
    touched: {},
    attemptedSteps: {},
    transitionInFlight: false,
    restoredDraftSavedAt: null,
    hasHydrated: false,
  };
}

/** Applies sourced defaults for the given category on top of an (otherwise empty)
 *  state, matching each field to the "Typical"-tagged, not-yet-touched visual state.
 *  Called once when the pre-step's equipment category is selected/changed. */
export function applyEquipmentDefaults(
  state: WizardState,
  category: EquipmentCategory
): WizardState {
  const defaults = equipmentDefaults(category);
  const discountRate = defaults.discountRate ?? 12.5;

  return {
    ...state,
    preStep: { ...state.preStep, equipmentCategory: category },
    basic: {
      ...state.basic,
      purchaseCost: defaults.purchaseCost,
      installationCost: defaults.installationCost,
      launchDelayMonths: defaults.launchDelayMonths,
      usagePerDay: defaults.usagePerDay,
      billedTariffPerUse: defaults.billedTariffPerUse,
      workingDaysPerMonth: defaults.workingDaysPerMonth,
      warrantyYears: defaults.warrantyYears,
      amcCmcCostPostWarranty: defaults.amcCmcCostPostWarranty,
    },
    advanced: {
      ...state.advanced,
      B: {
        ...state.advanced.B,
        expectedMatureUtilization: defaults.expectedMatureUtilization,
      },
      C: {
        ...state.advanced.C,
        loanInterestRate: defaults.loanInterestRate,
        loanTenureMonths: defaults.loanTenureMonths,
      },
      E: { ...state.advanced.E, cmcYears: defaults.cmcYears },
      F: {
        ...state.advanced.F,
        discountRate,
        targetIrr: targetIrrHeuristic(discountRate),
        usefulLifeYears: defaults.usefulLifeYears,
        salvageValuePercentage: defaults.salvageValuePercentage,
      },
    },
  };
}
