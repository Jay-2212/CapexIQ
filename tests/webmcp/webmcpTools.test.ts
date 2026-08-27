import { describe, expect, it, vi } from "vitest";
import { wizardReducer } from "../../app/forms/wizardReducer";
import { emptyWizardState } from "../../app/forms/initialState";
import { handleGetPresets } from "../../app/webmcp/handlers/handleGetPresets";
import { handleGetWizardForm } from "../../app/webmcp/handlers/handleGetWizardForm";
import { handleSimulate } from "../../app/webmcp/handlers/handleSimulate";
import { handleApplyInputs } from "../../app/webmcp/handlers/handleApplyInputs";
import { handleExport } from "../../app/webmcp/handlers/handleExport";
import { handleGetMetricGuide } from "../../app/webmcp/handlers/handleGetMetricGuide";
import {
  registerWebMCPTools,
  createWebMCPTools,
  isWebMCPAvailable,
} from "../../app/webmcp/registry";
import type { EquipmentCategory, FieldValue, WizardState } from "../../app/forms/wizardTypes";
import type {
  GetMetricGuideInput,
  ModelContextHost,
  ModelContextTool,
  WebMCPContextAccessor,
} from "../../app/webmcp/types";

function createPopulatedWizardState(): WizardState {
  let state = wizardReducer(emptyWizardState(), {
    type: "SELECT_EQUIPMENT_CATEGORY",
    category: "MRI",
  });
  const set = (path: string, value: FieldValue) => {
    state = wizardReducer(state, { type: "SET_FIELD", path, value });
  };
  set("preStep.hospitalName", "Apollo Speciality");
  set("preStep.hospitalBedSize", 350);
  set("preStep.cityTier", "Tier 1");
  set("preStep.hospitalType", "Corporate");
  set("preStep.equipmentNameModel", "Signa Pioneer 3.0T");

  set("basic.purchaseCost", 4.5);
  set("basic.installationCost", 0.45);
  set("basic.launchDelayMonths", 3);
  set("basic.acquisitionMode", "Cash");
  set("basic.usagePerDay", 15);
  set("basic.billedTariffPerUse", 3500);
  set("basic.workingDaysPerMonth", 25);

  set("basic.consumableCostPerUse", 250);
  set("basic.professionalFeePerUse", 400);
  set("basic.otherVariableCostPerUse", 50);
  set("basic.staffCostPerMonth", 150000);
  set("basic.electricityCostPerMonth", 45000);
  set("basic.otherFixedCostPerMonth", 20000);
  set("basic.warrantyYears", 5);
  set("basic.amcCmcCostPostWarranty", 3.5);

  set("advanced.F.discountRate", 12.5);
  set("advanced.F.targetIrr", 16.5);
  set("advanced.F.usefulLifeYears", 13);
  set("advanced.F.salvageValuePercentage", 5);

  return state;
}

describe("WebMCP Tool Suite", () => {
  // -------------------------------------------------------------
  // Tool 1: get_presets
  // -------------------------------------------------------------
  describe("handleGetPresets", () => {
    it("returns benchmark presets for a specific valid category", () => {
      const res = handleGetPresets({ category: "MRI" });
      expect(res.success).toBe(true);
      expect(res.data?.presets.MRI).toBeDefined();
      expect(res.data?.presets.MRI.category).toBe("MRI");
      expect(res.data?.presets.MRI.usefulLifeYears).toBe(13);
      expect(res.data?.presets.MRI.salvageValuePercentage).toBe(5);
      expect(res.data?.commonAssumptions.workingDaysPerMonth.value).toBe(25);
    });

    it("returns all presets when category is omitted", () => {
      const res = handleGetPresets({});
      expect(res.success).toBe(true);
      expect(res.data?.presets.MRI).toBeDefined();
      expect(res.data?.presets.CT).toBeDefined();
      expect(res.data?.presets["Cath Lab"]).toBeDefined();
      expect(res.data?.presets.Dialysis).toBeDefined();
      expect(res.data?.presets.Ultrasound).toBeDefined();
      expect(res.data?.presets.Custom).toBeDefined();
    });

    it("returns standard error envelope when invalid category is requested", () => {
      const res = handleGetPresets({ category: "NonExistent" as EquipmentCategory });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.error?.error_code).toBe("INVALID_EQUIPMENT_CATEGORY");
      expect(res.error?.message).toContain("not recognized");
      expect(res.error?.suggested_fix).toContain("supported categories");
    });
  });

  // -------------------------------------------------------------
  // Tool 2: get_wizard_form
  // -------------------------------------------------------------
  describe("handleGetWizardForm", () => {
    it("returns complete wizard snapshot and live computed KPIs", () => {
      const state = createPopulatedWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const res = handleGetWizardForm({}, context);
      expect(res.success).toBe(true);
      expect(res.data?.preStep.hospitalName).toBe("Apollo Speciality");
      expect(res.data?.basic.purchaseCost).toBe(4.5);
      expect(res.data?.isFresh).toBe(true);
      expect(res.data?.isComplete).toBe(true);
      expect(res.data?.computedKPIs).not.toBeNull();
      expect(res.data?.computedKPIs?.initialInvestment).toBe(49500000); // 4.5 + 0.45 Cr
      expect(res.data?.computedKPIs?.contributionPerUse).toBeGreaterThan(0);
      expect(res.data?.computedKPIs?.npv).toBeDefined();
      expect(res.data?.computedKPIs?.investmentOutlookBand).toBeDefined();
    });

    it("returns error envelope when context is unavailable", () => {
      const res = handleGetWizardForm({});
      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("WIZARD_CONTEXT_UNAVAILABLE");
    });
  });

  // -------------------------------------------------------------
  // Tool 3: simulate
  // -------------------------------------------------------------
  describe("handleSimulate", () => {
    it("executes valid simulation and computes NPV, IRR, payback, outlook", () => {
      const res = handleSimulate({
        category: "MRI",
        purchaseCostCr: 4.0,
        installationCostCr: 0.4,
        usagePerDay: 16,
        billedTariffPerUse: 3200,
        workingDaysPerMonth: 25,
        consumableCostPerUse: 200,
        professionalFeePerUse: 400,
        staffCostPerMonth: 120000,
        electricityCostPerMonth: 40000,
        discountRate: 12.5,
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.summary.initialInvestmentCr).toBe(4.4);
      expect(res.data?.summary.contributionMarginPerUse).toBe(2600); // 3200 - 600
      expect(res.data?.summary.monthlyRealizedRevenueLakh).toBe(12.8); // 16 * 3200 * 25 = 12.8L
      expect(res.data?.summary.npvLakh).toBeGreaterThan(0);
      expect(res.data?.summary.irrPct).toBeGreaterThan(12.5);
      expect(res.data?.summary.paybackYears).toBeGreaterThan(0);
      expect(res.data?.summary.outlookBand).toBeDefined();
    });

    it("simulates Loan financing accurately", () => {
      const res = handleSimulate({
        category: "CT",
        purchaseCostCr: 2.5,
        usagePerDay: 20,
        billedTariffPerUse: 2200,
        acquisitionMode: "Loan",
        downPaymentCr: 0.5,
        loanInterestRate: 10.5,
        loanTenureMonths: 60,
      });

      expect(res.success).toBe(true);
      expect(res.data?.inputs.financing.type).toBe("loan");
      expect(res.data?.result.monthlyEmiOrLease).toBeGreaterThan(0);
    });

    it("simulates Lease financing accurately", () => {
      const res = handleSimulate({
        category: "Ultrasound",
        purchaseCostCr: 0.4,
        usagePerDay: 15,
        billedTariffPerUse: 1200,
        acquisitionMode: "Lease",
        leaseRentalPerMonth: 45000,
        leaseTenureMonths: 48,
      });

      expect(res.success).toBe(true);
      expect(res.data?.inputs.financing.type).toBe("lease");
      expect(res.data?.result.monthlyEmiOrLease).toBe(45000);
    });

    it("returns diagnostic error for negative contribution margin", () => {
      const res = handleSimulate({
        purchaseCostCr: 3.0,
        usagePerDay: 10,
        billedTariffPerUse: 1000,
        consumableCostPerUse: 900,
        professionalFeePerUse: 300, // Total var = 1200 > 1000 tariff
      });

      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("NEGATIVE_CONTRIBUTION_MARGIN");
      expect(res.error?.message).toContain("exceeds or equals realized revenue");
      expect(res.error?.suggested_fix).toContain("Increase the billed tariff");
    });

    it("returns diagnostic error for invalid payer mix total", () => {
      const res = handleSimulate({
        purchaseCostCr: 3.0,
        usagePerDay: 10,
        billedTariffPerUse: 3000,
        payerMix: [
          { payerName: "Private Cash", shareOfVolume: 50, billedTariff: 3000 },
          { payerName: "TPA", shareOfVolume: 30, billedTariff: 2800 }, // Total = 80% != 100%
        ],
      });

      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("INVALID_PAYER_MIX_TOTAL");
      expect(res.error?.message).toContain("sum to 80.0%");
    });

    it("returns diagnostic error for out-of-bounds inputs", () => {
      const res = handleSimulate({
        purchaseCostCr: -2.0,
        usagePerDay: 10,
        billedTariffPerUse: 3000,
      });

      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("INVALID_INPUT_BOUNDS");
      expect(res.error?.message).toContain("must be a positive number");
    });
  });

  // -------------------------------------------------------------
  // Tool 4: apply_inputs
  // -------------------------------------------------------------
  describe("handleApplyInputs", () => {
    it("dispatches field updates, switches equipment category, and toggles Advanced Mode", () => {
      let state = emptyWizardState();
      const dispatch = vi.fn((action) => {
        state = wizardReducer(state, action);
      });
      const navigateTo = vi.fn();

      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch,
        navigateTo,
      };

      const res = handleApplyInputs(
        {
          equipmentCategory: "CT",
          updates: {
            preStep: { hospitalName: "Fortis Healthcare" },
            basic: {
              purchaseCost: 2.8,
              usagePerDay: 22,
              billedTariffPerUse: 2400,
            },
            advancedOpen: true,
          },
          navigateToResults: true,
        },
        context
      );

      expect(res.success).toBe(true);
      expect(dispatch).toHaveBeenCalledWith({
        type: "SELECT_EQUIPMENT_CATEGORY",
        category: "CT",
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: "TOGGLE_ADVANCED",
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_FIELD",
        path: "preStep.hospitalName",
        value: "Fortis Healthcare",
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_FIELD",
        path: "basic.purchaseCost",
        value: 2.8,
      });
      expect(navigateTo).toHaveBeenCalledWith("/results");
      expect(res.data?.navigatedTo).toBe("/results");
      expect(res.data?.currentStateSummary.advancedOpen).toBe(true);
    });

    it("handles step navigation via targetStep parameter", () => {
      let state = createPopulatedWizardState();
      const dispatch = vi.fn((action) => {
        state = wizardReducer(state, action);
      });
      const navigateTo = vi.fn();

      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch,
        navigateTo,
      };

      const res = handleApplyInputs(
        {
          updates: {},
          targetStep: "usage",
        },
        context
      );

      expect(res.success).toBe(true);
      expect(navigateTo).toHaveBeenCalledWith("/assess/usage");
      expect(res.data?.navigatedTo).toBe("/assess/usage");
    });

    it("returns error envelope when payer mix update produces non-100% total", () => {
      let state = createPopulatedWizardState();
      const dispatch = vi.fn((action) => {
        state = wizardReducer(state, action);
      });

      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch,
        navigateTo: vi.fn(),
      };

      const res = handleApplyInputs(
        {
          updates: {
            advanced: {
              A: {
                payerMixSharePct: {
                  privateCash: 40, // default others 0 => total = 40 != 100
                },
              },
            },
          },
        },
        context
      );

      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("INVALID_PAYER_MIX_TOTAL");
      expect(res.error?.suggested_fix).toContain("Adjust payer mix");
    });
  });

  // -------------------------------------------------------------
  // Tool 5: export_assessment
  // -------------------------------------------------------------
  describe("handleExport", () => {
    it("generates Excel export for complete assessment state", async () => {
      const state = createPopulatedWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const res = await handleExport({ format: "excel", download: false }, context);
      expect(res.success).toBe(true);
      expect(res.data?.format).toBe("excel");
      expect(res.data?.fileName).toContain(".xlsx");
      expect(res.data?.byteLength).toBeGreaterThan(1000);
      expect(res.data?.summary.hospitalName).toBe("Apollo Speciality");
    });

    it("generates Word proposal for complete assessment state", async () => {
      const state = createPopulatedWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const res = await handleExport({ format: "word", download: false }, context);
      expect(res.success).toBe(true);
      expect(res.data?.format).toBe("word");
      expect(res.data?.fileName).toContain(".docx");
      expect(res.data?.byteLength).toBeGreaterThan(1000);
    });

    it("generates ZIP package for complete assessment state", async () => {
      const state = createPopulatedWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const res = await handleExport({ format: "zip", download: false }, context);
      expect(res.success).toBe(true);
      expect(res.data?.format).toBe("zip");
      expect(res.data?.fileName).toContain(".zip");
      expect(res.data?.byteLength).toBeGreaterThan(1000);
    });

    it("returns error envelope when wizard state is incomplete", async () => {
      const state = emptyWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const res = await handleExport({ format: "excel" }, context);
      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("INCOMPLETE_ASSESSMENT_STATE");
    });
  });

  // -------------------------------------------------------------
  // Tool 6: get_metric_guide
  // -------------------------------------------------------------
  describe("handleGetMetricGuide", () => {
    it("returns detailed guide and optimization strategies for NPV and IRR", () => {
      const npvRes = handleGetMetricGuide({ metric: "npv" });
      expect(npvRes.success).toBe(true);
      expect(npvRes.data?.guides.npv).toBeDefined();
      expect(npvRes.data?.guides.npv.formula).toContain("NPV");
      expect(npvRes.data?.guides.npv.optimizationStrategies.length).toBeGreaterThan(0);

      const irrRes = handleGetMetricGuide({ metric: "irr" });
      expect(irrRes.success).toBe(true);
      expect(irrRes.data?.guides.irr.indianBenchmark).toContain("hurdle");
    });

    it("returns all guides when metric is 'all' or omitted", () => {
      const res = handleGetMetricGuide({});
      expect(res.success).toBe(true);
      expect(res.data?.guides.npv).toBeDefined();
      expect(res.data?.guides.irr).toBeDefined();
      expect(res.data?.guides.payback).toBeDefined();
      expect(res.data?.guides.break_even).toBeDefined();
      expect(res.data?.guides.working_capital).toBeDefined();
      expect(res.data?.guides.payer_mix).toBeDefined();
      expect(res.data?.guides.investment_outlook).toBeDefined();
    });

    it("returns error envelope for invalid metric query", () => {
      const res = handleGetMetricGuide({ metric: "invalid_metric" as GetMetricGuideInput["metric"] });
      expect(res.success).toBe(false);
      expect(res.error?.error_code).toBe("INVALID_METRIC_NAME");
    });
  });

  // -------------------------------------------------------------
  // Registry & Host Feature Detection
  // -------------------------------------------------------------
  describe("Registry & Host Integration", () => {
    it("createWebMCPTools returns all 6 tools with definitions and shielded handlers", () => {
      const tools = createWebMCPTools();
      expect(tools.length).toBe(6);
      const names = tools.map((t) => t.name);
      expect(names).toEqual([
        "get_presets",
        "get_wizard_form",
        "simulate",
        "apply_inputs",
        "export_assessment",
        "get_metric_guide",
      ]);
    });

    it("isWebMCPAvailable returns false without a model-context host", () => {
      expect(isWebMCPAvailable()).toBe(false);
    });

    it("registers tools asynchronously and aborts them on cleanup", () => {
      const registeredTools: ModelContextTool<unknown, unknown>[] = [];
      const registrationSignals: AbortSignal[] = [];

      const mockHost: ModelContextHost = {
        registerTool: vi.fn(async (tool: ModelContextTool<unknown, unknown>, options) => {
          registeredTools.push(tool);
          if (options?.signal) {
            registrationSignals.push(options.signal);
          }
        }),
      };

      document.modelContext = mockHost;
      expect(isWebMCPAvailable()).toBe(true);

      const state = createPopulatedWizardState();
      const context: WebMCPContextAccessor = {
        getState: () => state,
        dispatch: vi.fn(),
        navigateTo: vi.fn(),
      };

      const unregister = registerWebMCPTools(context);

      expect(mockHost.registerTool).toHaveBeenCalledTimes(6);
      expect(registeredTools.length).toBe(6);

      // Abort the browser registrations on cleanup
      unregister();
      expect(mockHost.registerTool).toHaveBeenCalledTimes(6);
      expect(registrationSignals).toHaveLength(6);
      expect(registrationSignals.every((signal) => signal.aborted)).toBe(true);

      // Clean up mock
      delete document.modelContext;
      expect(isWebMCPAvailable()).toBe(false);
    });

    it("supports the deprecated navigator.modelContext host as a compatibility fallback", () => {
      const mockHost: ModelContextHost = {
        registerTool: vi.fn(async () => {}),
      };

      navigator.modelContext = mockHost;
      expect(isWebMCPAvailable()).toBe(true);

      const unregister = registerWebMCPTools();
      expect(mockHost.registerTool).toHaveBeenCalledTimes(6);

      unregister();
      delete navigator.modelContext;
      expect(isWebMCPAvailable()).toBe(false);
    });

    it("prefers document.modelContext when both namespaces are available", () => {
      const documentHost: ModelContextHost = {
        registerTool: vi.fn(async () => {}),
      };
      const navigatorHost: ModelContextHost = {
        registerTool: vi.fn(async () => {}),
      };

      document.modelContext = documentHost;
      navigator.modelContext = navigatorHost;

      const unregister = registerWebMCPTools();
      expect(documentHost.registerTool).toHaveBeenCalledTimes(6);
      expect(navigatorHost.registerTool).not.toHaveBeenCalled();

      unregister();
      delete document.modelContext;
      delete navigator.modelContext;
    });
  });
});
