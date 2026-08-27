// TypeScript interfaces for WebMCP (Web Model Context Protocol) support in CapexIQ
// Provides standard tool payloads, diagnostic error envelopes, and browser modelContext interfaces.

import type { EquipmentCategory, WizardState, WizardStep } from "../forms/wizardTypes";
import type { WizardAction } from "../forms/wizardReducer";
import type { AssessmentInputs, AssessmentResult, UtilizationRampUp } from "@/formulas/computeAssessment";

export interface WebMCPErrorEnvelope {
  error_code: string;
  message: string;
  suggested_fix: string;
}

export interface WebMCPResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: WebMCPErrorEnvelope;
}

export interface ModelContextToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

export interface ModelContextTool<TInput = unknown, TOutput = unknown> extends ModelContextToolDefinition {
  handler: (params: TInput) => Promise<WebMCPResult<TOutput>> | WebMCPResult<TOutput>;
  execute?: (params: TInput) => Promise<WebMCPResult<TOutput>> | WebMCPResult<TOutput>;
}

export interface ModelContextHost {
  registerTool: (tool: ModelContextTool<unknown, unknown>) => void;
  unregisterTool: (name: string) => void;
  getTools?: () => ModelContextToolDefinition[];
  [key: string]: unknown;
}

declare global {
  interface Document {
    modelContext?: ModelContextHost;
  }
}

/** Runtime context provided to handlers when interacting with the active Wizard session */
export interface WebMCPContextAccessor {
  getState: () => WizardState;
  dispatch: (action: WizardAction) => void;
  navigateTo?: (path: string) => void;
}

// -------------------------------------------------------------
// Tool 1: get_presets
// -------------------------------------------------------------
export interface GetPresetsInput {
  category?: EquipmentCategory;
}

export interface PresetBenchmarkRange {
  low: number | null;
  typical: number | null;
  high: number | null;
  unit?: string;
}

export interface EquipmentPresetData {
  category: EquipmentCategory;
  purchaseCost: PresetBenchmarkRange;
  usefulLifeYears: number | null;
  salvageValuePercentage: number | null;
  installationCostPct: PresetBenchmarkRange;
  warrantyYears: PresetBenchmarkRange;
  cmcYears: PresetBenchmarkRange;
  amcAnnualCostPct: PresetBenchmarkRange;
  cmcAnnualCostPct: PresetBenchmarkRange;
  typicalUsagePerDay: number | null;
  billedTariffPerUse: PresetBenchmarkRange;
  launchDelayMonths: PresetBenchmarkRange;
  defaultsCrore: {
    purchaseCostCr: number | null;
    installationCostCr: number | null;
    discountRatePct: number | null;
    loanInterestRatePct: number | null;
    loanTenureMonths: number | null;
    workingDaysPerMonth: number | null;
  };
}

export interface GetPresetsOutput {
  presets: Record<string, EquipmentPresetData>;
  commonAssumptions: {
    discountRate: PresetBenchmarkRange;
    loanInterestRate: PresetBenchmarkRange;
    loanTenureMonths: PresetBenchmarkRange;
    workingDaysPerMonth: { value: number; unit: string };
  };
}

// -------------------------------------------------------------
// Tool 2: get_wizard_form
// -------------------------------------------------------------
export interface GetWizardFormInput {
  step?: WizardStep | "all";
}

export interface GetWizardFormOutput {
  currentStep: WizardStep;
  advancedOpen: boolean;
  isComplete: boolean;
  isFresh: boolean;
  preStep: WizardState["preStep"];
  basic: WizardState["basic"];
  advanced: WizardState["advanced"];
  currencyUnits: WizardState["currencyUnits"];
  computedKPIs: {
    initialInvestment: number;
    contributionPerUse: number;
    breakEvenUsagePerDay: number | null;
    monthlyRealizedRevenue: number;
    monthlyBilledRevenue: number;
    annualOperatingSurplus: number;
    npv: number;
    irr: number | null;
    roiRealized: number;
    paybackYears: number;
    discountedPaybackYears: number | null;
    workingCapitalPeakGap: number;
    investmentOutlookScore: number;
    investmentOutlookBand: string;
  } | null;
}

// -------------------------------------------------------------
// Tool 3: simulate
// -------------------------------------------------------------
export interface SimulatePayerInput {
  payerName: string;
  shareOfVolume: number;
  billedTariff: number;
  realizationPercentage?: number;
  collectionDelayDays?: number;
}

export interface SimulateInput {
  category?: EquipmentCategory;
  purchaseCostCr: number;
  installationCostCr?: number;
  usagePerDay: number;
  billedTariffPerUse: number;
  workingDaysPerMonth?: number;
  consumableCostPerUse?: number;
  professionalFeePerUse?: number;
  otherVariableCostPerUse?: number;
  staffCostPerMonth?: number;
  electricityCostPerMonth?: number;
  otherFixedCostPerMonth?: number;
  warrantyYears?: number;
  amcCmcCostPostWarrantyPct?: number;
  acquisitionMode?: "Cash" | "Loan" | "Lease";
  downPaymentCr?: number;
  loanInterestRate?: number;
  loanTenureMonths?: number;
  leaseRentalPerMonth?: number;
  leaseTenureMonths?: number;
  usefulLifeYears?: number;
  discountRate?: number;
  salvageValuePercentage?: number;
  payerMix?: SimulatePayerInput[];
  utilizationRamp?: UtilizationRampUp;
}

export interface SimulateOutput {
  inputs: AssessmentInputs;
  result: AssessmentResult;
  summary: {
    initialInvestmentCr: number;
    contributionMarginPerUse: number;
    breakEvenUsagePerDay: number | null;
    monthlyRealizedRevenueLakh: number;
    annualOperatingSurplusLakh: number;
    npvLakh: number;
    irrPct: number | null;
    roiRealizedPct: number;
    paybackYears: number;
    discountedPaybackYears: number | null;
    outlookScore: number;
    outlookBand: string;
    outlookDriver: string;
  };
}

// -------------------------------------------------------------
// Tool 4: apply_inputs
// -------------------------------------------------------------
export interface ApplyInputsUpdates {
  preStep?: Partial<WizardState["preStep"]>;
  basic?: Partial<WizardState["basic"]>;
  advanced?: {
    A?: {
      payerMixSharePct?: Record<string, number | null>;
      billedTariffByPayerType?: Record<string, number | null>;
      realizationPctByPayerType?: Record<string, number | null>;
      claimDeductionPctByPayerType?: Record<string, number | null>;
      collectionDelayDaysByPayerType?: Record<string, number | null>;
    };
    B?: Partial<WizardState["advanced"]["B"]>;
    C?: Partial<WizardState["advanced"]["C"]>;
    D?: Partial<WizardState["advanced"]["D"]>;
    E?: Partial<WizardState["advanced"]["E"]>;
    F?: Partial<WizardState["advanced"]["F"]>;
  };
  advancedOpen?: boolean;
  currencyUnits?: Partial<WizardState["currencyUnits"]>;
}

export interface ApplyInputsInput {
  updates: ApplyInputsUpdates;
  equipmentCategory?: EquipmentCategory;
  navigateToResults?: boolean;
  targetStep?: WizardStep;
}

export interface ApplyInputsOutput {
  applied: boolean;
  navigatedTo: string | null;
  isComplete: boolean;
  isFresh: boolean;
  currentStateSummary: {
    equipmentCategory: EquipmentCategory | null;
    hospitalName: string;
    purchaseCostCr: number | null;
    usagePerDay: number | null;
    billedTariffPerUse: number | null;
    acquisitionMode: "Cash" | "Loan" | "Lease";
    advancedOpen: boolean;
  };
  computedKPIs: GetWizardFormOutput["computedKPIs"];
}

// -------------------------------------------------------------
// Tool 5: export_assessment
// -------------------------------------------------------------
export interface ExportAssessmentInput {
  format: "excel" | "word" | "zip" | "all";
  download?: boolean;
}

export interface ExportAssessmentOutput {
  format: "excel" | "word" | "zip";
  fileName: string;
  mimeType: string;
  byteLength: number;
  downloadTriggered: boolean;
  summary: {
    hospitalName: string;
    equipmentCategory: string;
    initialInvestmentCr: number;
    paybackYears: number;
    npvLakh: number;
    irrPct: number | null;
  };
}

// -------------------------------------------------------------
// Tool 6: get_metric_guide
// -------------------------------------------------------------
export interface GetMetricGuideInput {
  metric?: "npv" | "irr" | "payback" | "break_even" | "roi" | "eac" | "working_capital" | "payer_mix" | "investment_outlook" | "all";
  category?: EquipmentCategory;
}

export interface MetricGuideEntry {
  metricName: string;
  definition: string;
  formula: string;
  indianBenchmark: string;
  interpretation: string;
  optimizationStrategies: string[];
}

export interface GetMetricGuideOutput {
  guides: Record<string, MetricGuideEntry>;
}
