// Safe registry wrapper for WebMCP tools. The current API lives on
// document.modelContext; navigator.modelContext is a legacy compatibility path.

import type {
  GetPresetsInput,
  GetWizardFormInput,
  SimulateInput,
  ApplyInputsInput,
  ExportAssessmentInput,
  GetMetricGuideInput,
  ModelContextHost,
  ModelContextTool,
  WebMCPContextAccessor,
  WebMCPResult,
} from "./types";
import {
  GET_PRESETS_TOOL_DEF,
  GET_WIZARD_FORM_TOOL_DEF,
  SIMULATE_TOOL_DEF,
  APPLY_INPUTS_TOOL_DEF,
  EXPORT_ASSESSMENT_TOOL_DEF,
  GET_METRIC_GUIDE_TOOL_DEF,
} from "./toolDefinitions";
import {
  handleGetPresets,
  handleGetWizardForm,
  handleSimulate,
  handleApplyInputs,
  handleExport,
  handleGetMetricGuide,
} from "./handlers";

/** Resolve the current WebMCP host, preferring the standards-track namespace. */
function getModelContextHost(): ModelContextHost | undefined {
  if (typeof document !== "undefined" && document.modelContext) {
    return document.modelContext;
  }

  if (typeof navigator !== "undefined" && navigator.modelContext) {
    return navigator.modelContext;
  }

  return undefined;
}

/** Safe check for WebMCP support in the current runtime environment. */
export function isWebMCPAvailable(): boolean {
  const host = getModelContextHost();
  return typeof host?.registerTool === "function";
}

/** Error-shielded tool wrapper */
function shieldHandler<TInput, TOutput>(
  toolName: string,
  handler: (input: TInput) => Promise<WebMCPResult<TOutput>> | WebMCPResult<TOutput>
): (input: TInput) => Promise<WebMCPResult<TOutput>> {
  return async (input: TInput): Promise<WebMCPResult<TOutput>> => {
    try {
      const result = await handler(input);
      return result;
    } catch (err) {
      return {
        success: false,
        error: {
          error_code: "INTERNAL_TOOL_ERROR",
          message:
            err instanceof Error
              ? err.message
              : `Unhandled error executing WebMCP tool '${toolName}'.`,
          suggested_fix: "Verify input arguments and ensure the page is in a valid state.",
        },
      };
    }
  };
}

/** Builds the full array of CapexIQ WebMCP tools wired to a live context accessor */
export function createWebMCPTools(
  context?: WebMCPContextAccessor
): ModelContextTool<unknown, unknown>[] {
  const getPresetsHandler = shieldHandler("get_presets", (params: GetPresetsInput) =>
    handleGetPresets(params)
  );

  const getWizardFormHandler = shieldHandler("get_wizard_form", (params: GetWizardFormInput) =>
    handleGetWizardForm(params, context)
  );

  const simulateHandler = shieldHandler("simulate", (params: SimulateInput) =>
    handleSimulate(params)
  );

  const applyInputsHandler = shieldHandler("apply_inputs", (params: ApplyInputsInput) =>
    handleApplyInputs(params, context)
  );

  const exportAssessmentHandler = shieldHandler(
    "export_assessment",
    (params: ExportAssessmentInput) => handleExport(params, context)
  );

  const getMetricGuideHandler = shieldHandler(
    "get_metric_guide",
    (params: GetMetricGuideInput) => handleGetMetricGuide(params)
  );

  return [
    {
      ...GET_PRESETS_TOOL_DEF,
      execute: getPresetsHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
    {
      ...GET_WIZARD_FORM_TOOL_DEF,
      execute: getWizardFormHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
    {
      ...SIMULATE_TOOL_DEF,
      execute: simulateHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
    {
      ...APPLY_INPUTS_TOOL_DEF,
      execute: applyInputsHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
    {
      ...EXPORT_ASSESSMENT_TOOL_DEF,
      execute: exportAssessmentHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
    {
      ...GET_METRIC_GUIDE_TOOL_DEF,
      execute: getMetricGuideHandler as (params: unknown) => Promise<WebMCPResult<unknown>>,
    },
  ];
}

/**
 * Registers all CapexIQ WebMCP tools on the available model-context host.
 * Returns an unregister cleanup function for React useEffect unmount.
 */
export function registerWebMCPTools(
  context?: WebMCPContextAccessor
): () => void {
  if (!isWebMCPAvailable()) {
    // Graceful no-op in standard browsers or SSR
    return () => {};
  }

  const host = getModelContextHost();
  if (!host || typeof host.registerTool !== "function") {
    return () => {};
  }

  const tools = createWebMCPTools(context);
  const controller = new AbortController();

  // The browser API is asynchronous. Keep every rejection contained because
  // unsupported/blocked hosts must degrade to a no-op without an unhandled
  // promise rejection. The signal also gives React a reliable teardown path.
  void Promise.all(
    tools.map((tool) => host.registerTool(tool, { signal: controller.signal }))
  ).catch(() => {});

  return () => {
    controller.abort();
  };
}
