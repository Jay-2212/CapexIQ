// Wizard state shape — a direct implementation of app/forms/wizard-state.md §7.1's
// localStorage schema (the reducer's in-memory shape and the persisted draft shape are
// the same object on purpose, so persistence never needs a second, divergent mapping).

export type EquipmentCategory =
  | "MRI"
  | "CT"
  | "Cath Lab"
  | "Dialysis"
  | "Ultrasound"
  | "Custom";

export type WizardStep = "preStep" | "investment" | "usage" | "costs" | "results";

export type FieldValue = number | string | null;

export interface PreStepFields {
  equipmentCategory: EquipmentCategory | null;
  hospitalName: string;
  hospitalBedSize: number | null;
  cityTier: "Tier 1" | "Tier 2" | "Tier 3" | null;
  hospitalType: "Private" | "Charitable / Trust" | "Corporate" | "Government" | null;
  equipmentNameModel: string;
}

export interface BasicFields {
  purchaseCost: number | null;
  installationCost: number | null;
  launchDelayMonths: number | null;
  acquisitionMode: "Cash" | "Loan" | "Lease";
  usagePerDay: number | null;
  billedTariffPerUse: number | null;
  workingDaysPerMonth: number | null;
  consumableCostPerUse: number | null;
  professionalFeePerUse: number | null;
  otherVariableCostPerUse: number | null;
  staffCostPerMonth: number | null;
  electricityCostPerMonth: number | null;
  otherFixedCostPerMonth: number | null;
  warrantyYears: number | null;
  amcCmcCostPostWarranty: number | null;
}

/** One entry per PAYER_TYPES suffix, keyed dynamically — see resolvePayerMix.ts. */
export type PayerKeyedFields = Record<string, number | null>;

export interface AdvancedGroupA {
  payerMixSharePct: PayerKeyedFields;
  billedTariffByPayerType: PayerKeyedFields;
  realizationPctByPayerType: PayerKeyedFields;
  claimDeductionPctByPayerType: PayerKeyedFields;
  collectionDelayDaysByPayerType: PayerKeyedFields;
}

export interface AdvancedGroupB {
  utilizationRampPct: PayerKeyedFields; // keyed by ramp-period suffix
  expectedMatureUtilization: number | null;
}

export interface AdvancedGroupC {
  downPayment: number | null;
  loanInterestRate: number | null;
  loanTenureMonths: number | null;
  processingChargesPct: number | null;
  emiStartMonth: number | null;
  moratoriumPeriodMonths: number | null;
  leaseRentalPerMonth: number | null;
  leaseTenureMonths: number | null;
}

export interface AdvancedGroupD {
  civilWorkDurationMonths: number | null;
  installationDurationMonths: number | null;
  licensingApprovalDurationMonths: number | null;
  trainingCommissioningDurationMonths: number | null;
  preOpeningFixedCosts: number | null;
  workingCapitalBufferAmount: number | null;
}

export interface AdvancedGroupE {
  cmcYears: number | null;
  /** Length always equals advanced.F.usefulLifeYears — see wizard-state.md §5's
   *  truncate/extend rule, applied by the WIZARD_RESIZE_MAINTENANCE_ARRAY action. */
  maintenanceCostByYearPct: (number | null)[];
  maintenanceInflationPct: number | null;
  majorReplacementCost: number | null;
}

export interface AdvancedGroupF {
  discountRate: number | null;
  targetIrr: number | null;
  inflationRate: number | null;
  usefulLifeYears: number | null;
  salvageValuePercentage: number | null;
  depreciationMethod: "Straight-line";
  priceEscalationPct: number | null;
  costEscalationPct: number | null;
}

export interface AdvancedFields {
  A: AdvancedGroupA;
  B: AdvancedGroupB;
  C: AdvancedGroupC;
  D: AdvancedGroupD;
  E: AdvancedGroupE;
  F: AdvancedGroupF;
}

/** Which fields were auto-filled with a "Typical" default and never edited since —
 *  §6 of design/ux-product-spec.md's default-value visual treatment. Keyed by the
 *  same dotted path used elsewhere (see fieldPath.ts). */
export type TouchedFieldMap = Record<string, boolean>;
export type CurrencyUnit = "Lakh" | "Crore";

/** True once the user has clicked "Next" while a given step was incomplete —
 *  reveals every blocked field's error on that step at once (wizard-state.md §2's
 *  Next-click reveal, ISS-25). Deliberately separate from TouchedFieldMap: writing
 *  to `touched` for this would incorrectly clear the "Typical" pill (§6) on every
 *  still-default, still-valid field on the step. Ephemeral UI state, reset on
 *  RESTORE_DRAFT/START_OVER like hasHydrated/transitionInFlight. */
export type AttemptedStepMap = Partial<Record<Exclude<WizardStep, "results">, boolean>>;

export interface WizardState {
  schemaVersion: 1;
  savedAt: string | null;
  currentStep: WizardStep;
  preStep: PreStepFields;
  basic: BasicFields;
  advancedOpen: boolean;
  advanced: AdvancedFields;
  currencyUnits: {
    purchaseCost: CurrencyUnit;
    installationCost: CurrencyUnit;
  };
  /** true once a field has been edited by the user — drives the "Typical" tag and
   *  the untouched/edited visual states (ux-product-spec.md §6). Defaults (once
   *  applied) are NOT in this map, so they render muted until first edited. */
  touched: TouchedFieldMap;
  /** See AttemptedStepMap doc comment. Drives error-display reveal only — never
   *  validation truth (isStepComplete/firstInvalidFieldOnStep/RouteGuard don't read
   *  this; they must keep working identically whether or not the user has clicked
   *  Next yet). */
  attemptedSteps: AttemptedStepMap;
  /** True for the single step-advance/step-submission in flight — the idempotency
   *  guard from wizard-state.md §9. */
  transitionInFlight: boolean;
  /** Set once on mount if a draft was restored, cleared after the announcement is
   *  read — wizard-state.md §6.5. */
  restoredDraftSavedAt: string | null;
  /** False until useWizardPersistence's mount-load effect has run once (whether or
   *  not a draft existed to restore). RouteGuard must not evaluate step-completeness
   *  before this flips true, or it redirects on the pre-restore blank state. */
  hasHydrated: boolean;
}
