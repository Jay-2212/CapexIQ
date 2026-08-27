// Handler for WebMCP tool: get_metric_guide
// Reference manual lookup for financial metrics, Indian healthcare benchmarks, and Capex optimization.

import type {
  GetMetricGuideInput,
  GetMetricGuideOutput,
  MetricGuideEntry,
  WebMCPResult,
} from "../types";

const METRIC_GUIDES: Record<string, MetricGuideEntry> = {
  npv: {
    metricName: "Net Present Value (NPV)",
    definition:
      "The sum of all discounted future net cash inflows minus the initial capital investment outlay.",
    formula: "NPV = \\sum_{t=1}^{N} \\frac{CF_t}{(1 + r)^t} - CF_0",
    indianBenchmark:
      "A positive NPV discounted at standard Indian healthcare WACC (12.0% - 14.0%) indicates value accretion above capital hurdle rates.",
    interpretation:
      "NPV > 0: Financially accretive. NPV < 0: Fails to cover cost of capital over the useful asset life.",
    optimizationStrategies: [
      "Accelerate patient onboarding in months 1-6 to shorten ramp-up delay.",
      "Renegotiate post-warranty CMC escalation rates (target <= 4-5% annual rate).",
      "Shift 10-15% of volume from low-realization government schemes to Private/TPA.",
    ],
  },
  irr: {
    metricName: "Internal Rate of Return (IRR)",
    definition:
      "The annualized rate of earnings on the capital invested that equates the project's NPV to exactly zero.",
    formula: "0 = \\sum_{t=0}^{N} \\frac{CF_t}{(1 + IRR)^t}",
    indianBenchmark:
      "Tier 1/2 Indian hospital capex hurdle rates generally require IRR >= 16.5% - 18.0% (Discount Rate + 4.0% to 5.5% margin).",
    interpretation:
      "IRR >= Hurdle: High confidence investment. IRR between Discount Rate and Hurdle: Marginal viability. IRR < Discount Rate: Destroys enterprise value.",
    optimizationStrategies: [
      "Improve billing realization rate on TPAs from typical 82-85% to > 90% via pre-auth automation.",
      "Increase daily operating hours / second-shift technician coverage to increase daily scans.",
      "Structure acquisition via low down payment loan with moratorium to defer early cash outflows.",
    ],
  },
  payback: {
    metricName: "Payback Period & Discounted Payback",
    definition:
      "The exact timeframe (in years/months) required for cumulative operating cash surpluses to fully recover initial cash outlay.",
    formula:
      "Payback = Year before full recovery + (Unrecovered cost at start of year / Cash flow during year)",
    indianBenchmark:
      "Diagnostic equipment (MRI/CT): 3.0 to 4.5 years simple payback, <= 5.5 years discounted payback.",
    interpretation:
      "<= 3.5 yrs: Excellent. 3.5 - 5.0 yrs: Acceptable. > 5.5 yrs: Heightened obsolescence and technology renewal risk.",
    optimizationStrategies: [
      "Negotiate comprehensive 5-year OEM warranty upfront to eliminate maintenance cash drain in early years.",
      "Minimize site installation duration (civil shielding work) to launch revenue operations faster.",
    ],
  },
  break_even: {
    metricName: "Break-Even Utilization Per Day",
    definition:
      "The minimum number of patient scans/procedures needed every operating day to cover all fixed monthly overheads and variable consumables.",
    formula:
      "BreakEven / Day = \\frac{\\text{Monthly Fixed Cost}}{\\text{Working Days} \\times (\\text{Realized Tariff} - \\text{Variable Cost})}",
    indianBenchmark:
      "MRI: 4-7 scans/day. CT: 6-10 scans/day. Cath Lab: 2-4 cases/day. Dialysis: 8-12 sessions/day.",
    interpretation:
      "If actual projected scans exceed break-even by > 40%, the hospital possesses strong operating leverage.",
    optimizationStrategies: [
      "Standardize consumable kits (contrast media, catheters) across vendor tenders to compress variable cost per use.",
      "Expand referring clinician networks across adjacent nursing homes and clinics.",
    ],
  },
  roi: {
    metricName: "Return on Investment (ROI)",
    definition:
      "Cumulative net operating earnings across asset life divided by total initial capex.",
    formula: "ROI = \\frac{\\text{Cumulative Net Cash Flow}}{\\text{Initial Investment}} \\times 100\\%",
    indianBenchmark:
      "Typical 10-year diagnostic imaging lifecycle targets 150% - 250% cumulative cash ROI.",
    interpretation:
      "Measures total wealth creation multiple over the full equipment lifecycle.",
    optimizationStrategies: [
      "Preserve machine uptime through proactive preventive maintenance to extend reliable life to 12-13 years.",
    ],
  },
  eac: {
    metricName: "Equivalent Annual Cost (EAC)",
    definition:
      "The annualized cost of owning, operating, and maintaining an asset over its lifespan.",
    formula: "EAC = \\frac{\\text{NPV of Costs}}{\\text{Annuity Factor}(r, n)}",
    indianBenchmark:
      "Used to compare outright purchase vs. lease options across mismatched useful life horizons.",
    interpretation:
      "Lower EAC represents the more cost-effective equipment procurement mode.",
    optimizationStrategies: [
      "Compare vendor leasing proposals against bank financing using EAC after accounting for tax shields.",
    ],
  },
  working_capital: {
    metricName: "Peak Working Capital Gap & DSO",
    definition:
      "The maximum cumulative cash deficit resulting from credit payment cycles (DSO delay from TPAs, CGHS, Ayushman Bharat) and initial ramp-up.",
    formula:
      "\\Delta WC = \\text{Monthly Operating Expense} + \\text{Uncollected Receivables (DSO)} - \\text{Cash Inflows}",
    indianBenchmark:
      "TPA claims: 45-60 days DSO. CGHS/ECHS: 90-180 days DSO. Ayushman Bharat: 60-120 days DSO.",
    interpretation:
      "Hospitals must maintain adequate liquidity buffer to avoid insolvency before insurance claims clear.",
    optimizationStrategies: [
      "Establish strict 48-hour claim submission protocols following patient discharge.",
      "Cap government scheme quota to <= 25-30% of scan capacity if hospital working capital lines are constrained.",
    ],
  },
  payer_mix: {
    metricName: "Payer Mix & Tariff Realization",
    definition:
      "The proportion of patient volume across payment classes (Private Cash, TPAs/Corporate, CGHS, Ayushman Bharat, ECHS) and their net realization percentages.",
    formula:
      "\\text{Realized Tariff} = \\sum (\\text{Share}_i \\times \\text{Tariff}_i \\times \\text{Realization}_i)",
    indianBenchmark:
      "Private Cash: 100% realization, 0 DSO. TPA: 82-88% realization, 45d DSO. CGHS: 70-80% of private tariff, 80-90% realization, 120d DSO.",
    interpretation:
      "High government scheme mix requires substantially higher volume to overcome discounted reimbursement rates.",
    optimizationStrategies: [
      "Bundle elective imaging with executive health checkups to increase private cash volume.",
      "Establish dedicated desk for TPA queries to minimize deduction rejections.",
    ],
  },
  investment_outlook: {
    metricName: "CapexIQ Investment Outlook Score",
    definition:
      "A holistic 100-point diagnostic rating evaluating Financial Return (40pts), Capital Safety (30pts), and Operating Resilience (30pts).",
    formula:
      "Score = \\text{Return Score (IRR/NPV)} + \\text{Safety Score (Payback/Financing)} + \\text{Resilience Score (Break-even Margin)}",
    indianBenchmark:
      "80-100: Strong / High Viability. 60-79: Moderate / Acceptable. 40-59: Caution / Review Needed. <40: High Risk / Non-viable.",
    interpretation:
      "Provides healthcare executive boards with an immediate go/no-go investment verdict.",
    optimizationStrategies: [
      "Address the lowest component score (e.g. if Safety is low, reduce debt leverage or increase down payment).",
    ],
  },
};

export function handleGetMetricGuide(
  input: GetMetricGuideInput = {}
): WebMCPResult<GetMetricGuideOutput> {
  try {
    const { metric } = input;

    if (metric && metric !== "all") {
      const guide = METRIC_GUIDES[metric.toLowerCase()];
      if (!guide) {
        return {
          success: false,
          error: {
            error_code: "INVALID_METRIC_NAME",
            message: `Metric '${metric}' is not documented in the guide.`,
            suggested_fix: `Select one of: ${Object.keys(METRIC_GUIDES).join(", ")}, or 'all'.`,
          },
        };
      }

      return {
        success: true,
        data: {
          guides: {
            [metric]: guide,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        guides: METRIC_GUIDES,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "GUIDE_LOOKUP_FAILED",
        message: err instanceof Error ? err.message : "Failed to load metric guide.",
        suggested_fix: "Verify query parameters.",
      },
    };
  }
}
