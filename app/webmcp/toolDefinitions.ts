// Strict JSON schema definitions and descriptions for CapexIQ WebMCP tools.
// Adheres to concise token/character budgets while providing exact parameter expectations.

import type { ModelContextToolDefinition } from "./types";

export const GET_PRESETS_TOOL_DEF: ModelContextToolDefinition = {
  name: "get_presets",
  description:
    "Fetch Indian healthcare equipment benchmarks and default scenario values for MRI, CT, Cath Lab, Dialysis, Ultrasound, or Custom.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["MRI", "CT", "Cath Lab", "Dialysis", "Ultrasound", "Custom"],
        description:
          "Equipment category to retrieve benchmarks for. If omitted, returns all categories.",
      },
    },
    additionalProperties: false,
  },
};

export const GET_WIZARD_FORM_TOOL_DEF: ModelContextToolDefinition = {
  name: "get_wizard_form",
  description:
    "Inspect the full CapexIQ 4-step wizard snapshot (hospital context, investment, usage, operating costs, advanced settings) and live computed KPIs.",
  inputSchema: {
    type: "object",
    properties: {
      step: {
        type: "string",
        enum: ["preStep", "investment", "usage", "costs", "results", "all"],
        description: "Specific step to inspect, or 'all' for complete snapshot.",
      },
    },
    additionalProperties: false,
  },
};

export const SIMULATE_TOOL_DEF: ModelContextToolDefinition = {
  name: "simulate",
  description:
    "Run an in-memory what-if on the current scenario and return CapexIQ metrics (NPV, IRR, Payback, Break-even, cash timing, outlook) without changing the page.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["MRI", "CT", "Cath Lab", "Dialysis", "Ultrasound", "Custom"],
        description: "Equipment category.",
      },
      purchaseCostCr: {
        type: "number",
        description: "Equipment purchase cost in INR Crore (e.g. 5.5 for ₹5.5 Cr).",
      },
      installationCostCr: {
        type: "number",
        description: "Site prep / installation cost in INR Crore.",
      },
      usagePerDay: {
        type: "number",
        description: "Expected daily scan/procedure volume.",
      },
      billedTariffPerUse: {
        type: "number",
        description: "Average gross billed charge per scan/procedure in INR.",
      },
      workingDaysPerMonth: {
        type: "number",
        description: "Operating days per month (typically 25).",
      },
      consumableCostPerUse: {
        type: "number",
        description: "Consumables & contrast cost per scan in INR.",
      },
      professionalFeePerUse: {
        type: "number",
        description: "Doctor / radiologist fee per scan in INR.",
      },
      otherVariableCostPerUse: {
        type: "number",
        description: "Other variable cost per scan in INR.",
      },
      staffCostPerMonth: {
        type: "number",
        description: "Monthly staff/technician salary in INR.",
      },
      electricityCostPerMonth: {
        type: "number",
        description: "Monthly electricity and utility cost in INR.",
      },
      otherFixedCostPerMonth: {
        type: "number",
        description: "Other monthly fixed overhead in INR.",
      },
      warrantyYears: {
        type: "number",
        description: "OEM warranty period in years.",
      },
      amcCmcCostPostWarrantyPct: {
        type: "number",
        description: "Post-warranty annual maintenance contract rate as % of purchase cost.",
      },
      acquisitionMode: {
        type: "string",
        enum: ["Cash", "Loan", "Lease"],
        description: "Financing method.",
      },
      downPaymentCr: {
        type: "number",
        description: "Loan down payment in INR Crore.",
      },
      loanInterestRate: {
        type: "number",
        description: "Annual loan interest rate %.",
      },
      loanTenureMonths: {
        type: "number",
        description: "Loan tenure in months (e.g. 60).",
      },
      leaseRentalPerMonth: {
        type: "number",
        description: "Monthly lease rental in INR.",
      },
      leaseTenureMonths: {
        type: "number",
        description: "Lease tenure in months.",
      },
      usefulLifeYears: {
        type: "number",
        description: "Useful asset life in years (Companies Act benchmark: 13 for MRI/CT).",
      },
      discountRate: {
        type: "number",
        description: "Annual discount rate / WACC % (default 12.5%).",
      },
      salvageValuePercentage: {
        type: "number",
        description: "Estimated terminal salvage value as % of initial cost (default 5%).",
      },
      payerMix: {
        type: "array",
        items: {
          type: "object",
          properties: {
            payerName: { type: "string" },
            shareOfVolume: { type: "number", description: "% share of total patients" },
            billedTariff: { type: "number", description: "Billed tariff for this payer in INR" },
            realizationPercentage: { type: "number", description: "Net realization % after disallowances" },
            collectionDelayDays: { type: "number", description: "Average DSO in days" },
          },
          required: ["payerName", "shareOfVolume", "billedTariff"],
        },
        description: "Detailed payer breakdown (Private Cash, TPA, CGHS, Ayushman Bharat, ECHS). Must sum to 100%.",
      },
      utilizationRamp: {
        type: "object",
        properties: {
          month1to3Pct: { type: "number" },
          month4to6Pct: { type: "number" },
          month7to12Pct: { type: "number" },
          year2PlusPct: { type: "number" },
        },
        description: "Quarterly utilization ramp-up percentages.",
      },
    },
    required: ["purchaseCostCr", "usagePerDay", "billedTariffPerUse"],
    additionalProperties: false,
  },
};

export const APPLY_INPUTS_TOOL_DEF: ModelContextToolDefinition = {
  name: "apply_inputs",
  description:
    "Note: this is not a payment, bank, or purchase submission. It is a local in-browser calculator. Fills the CapexIQ equipment quote worksheet with hospital and equipment scenario fields for calculation only. Supports Basic/Advanced view and opening the results page.",
  inputSchema: {
    type: "object",
    properties: {
      equipmentCategory: {
        type: "string",
        enum: ["MRI", "CT", "Cath Lab", "Dialysis", "Ultrasound", "Custom"],
        description: "Category to select and apply default benchmarks for.",
      },
      updates: {
        type: "object",
        properties: {
          preStep: {
            type: "object",
            properties: {
              hospitalName: { type: "string" },
              hospitalBedSize: { type: "number" },
              cityTier: { type: "string", enum: ["Tier 1", "Tier 2", "Tier 3"] },
              hospitalType: {
                type: "string",
                enum: ["Private", "Charitable / Trust", "Corporate", "Government"],
              },
              equipmentNameModel: { type: "string" },
            },
          },
          basic: {
            type: "object",
            properties: {
              purchaseCost: { type: "number", description: "Cost in Crore" },
              installationCost: { type: "number", description: "Cost in Crore" },
              launchDelayMonths: { type: "number" },
              acquisitionMode: { type: "string", enum: ["Cash", "Loan", "Lease"] },
              usagePerDay: { type: "number" },
              billedTariffPerUse: { type: "number" },
              workingDaysPerMonth: { type: "number" },
              consumableCostPerUse: { type: "number" },
              professionalFeePerUse: { type: "number" },
              otherVariableCostPerUse: { type: "number" },
              staffCostPerMonth: { type: "number" },
              electricityCostPerMonth: { type: "number" },
              otherFixedCostPerMonth: { type: "number" },
              warrantyYears: { type: "number" },
              amcCmcCostPostWarranty: { type: "number" },
            },
          },
          advanced: {
            type: "object",
            properties: {
              A: { type: "object" },
              B: { type: "object" },
              C: { type: "object" },
              D: { type: "object" },
              E: { type: "object" },
              F: { type: "object" },
            },
          },
          advancedOpen: { type: "boolean", description: "Toggle Advanced Mode" },
          currencyUnits: {
            type: "object",
            properties: {
              purchaseCost: { type: "string", enum: ["Crore", "Lakh"] },
              installationCost: { type: "string", enum: ["Crore", "Lakh"] },
            },
          },
        },
      },
      navigateToResults: {
        type: "boolean",
        description: "Automatically transition the browser to the /results dashboard once inputs are applied.",
      },
      targetStep: {
        type: "string",
        enum: ["preStep", "investment", "usage", "costs", "results"],
        description: "Navigate to a specific wizard step.",
      },
    },
    additionalProperties: false,
  },
};

export const EXPORT_ASSESSMENT_TOOL_DEF: ModelContextToolDefinition = {
  name: "export_assessment",
  description:
    "Generate audit-grade financial exports (.xlsx Excel model with live formulas, .docx Word board proposal, or bundled .zip) from the current assessment.",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["excel", "word", "zip"],
        description: "Target file format: excel (Excel model), word (Board proposal), or zip (both packaged).",
      },
      download: {
        type: "boolean",
        description: "Whether to trigger browser file download.",
      },
    },
    required: ["format"],
    additionalProperties: false,
  },
};

export const GET_METRIC_GUIDE_TOOL_DEF: ModelContextToolDefinition = {
  name: "get_metric_guide",
  description:
    "Access CapexIQ's financial reference manual for healthcare capital investments (NPV, IRR, Payback, Break-even, EAC, Working Capital, Payer Mix optimization).",
  inputSchema: {
    type: "object",
    properties: {
      metric: {
        type: "string",
        enum: [
          "npv",
          "irr",
          "payback",
          "break_even",
          "roi",
          "eac",
          "working_capital",
          "payer_mix",
          "investment_outlook",
          "all",
        ],
        description: "Financial metric or topic to look up. If omitted or 'all', returns full guide.",
      },
      category: {
        type: "string",
        enum: ["MRI", "CT", "Cath Lab", "Dialysis", "Ultrasound", "Custom"],
        description: "Optional equipment category to customize rules of thumb.",
      },
    },
    additionalProperties: false,
  },
};

export const ALL_WEBMCP_TOOL_DEFS: ModelContextToolDefinition[] = [
  GET_PRESETS_TOOL_DEF,
  GET_WIZARD_FORM_TOOL_DEF,
  SIMULATE_TOOL_DEF,
  APPLY_INPUTS_TOOL_DEF,
  EXPORT_ASSESSMENT_TOOL_DEF,
  GET_METRIC_GUIDE_TOOL_DEF,
];
