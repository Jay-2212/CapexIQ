// Handler for WebMCP tool: get_wizard_form
// Reads active 4-step wizard state snapshot, validation status, and live computed KPIs.

import { isResultStateFresh, earliestIncompleteStep } from "../../forms/wizardValidation";
import { toAssessmentInputs } from "../../forms/toAssessmentInputs";
import { computeAssessment } from "@/formulas/computeAssessment";
import type {
  GetWizardFormInput,
  GetWizardFormOutput,
  WebMCPContextAccessor,
  WebMCPResult,
} from "../types";

export function handleGetWizardForm(
  input: GetWizardFormInput = {},
  context?: WebMCPContextAccessor
): WebMCPResult<GetWizardFormOutput> {
  try {
    if (!context || !context.getState) {
      return {
        success: false,
        error: {
          error_code: "WIZARD_CONTEXT_UNAVAILABLE",
          message: "Wizard session context is not available.",
          suggested_fix: "Ensure the tool is invoked while the CapexIQ wizard is active in the browser.",
        },
      };
    }

    const state = context.getState();
    const fresh = isResultStateFresh(state);
    const incompleteStep = earliestIncompleteStep(state);
    const isComplete = incompleteStep === null;

    let computedKPIs: GetWizardFormOutput["computedKPIs"] = null;
    if (fresh) {
      try {
        const assessmentInputs = toAssessmentInputs(state);
        const result = computeAssessment(assessmentInputs);
        computedKPIs = {
          initialInvestment: result.initialInvestment,
          contributionPerUse: result.contributionPerUse,
          breakEvenUsagePerDay: result.breakEvenUsagePerDay,
          monthlyRealizedRevenue: result.monthlyRealizedRevenue,
          monthlyBilledRevenue: result.monthlyBilledRevenue,
          annualOperatingSurplus: result.annualOperatingSurplus,
          npv: result.npv,
          irr: result.irr,
          roiRealized: result.roiRealized,
          paybackYears: result.paybackYears,
          discountedPaybackYears: result.discountedPaybackYears,
          workingCapitalPeakGap: result.workingCapitalPeakGap,
          investmentOutlookScore: result.investmentOutlook.score,
          investmentOutlookBand: result.investmentOutlook.band,
        };
      } catch {
        computedKPIs = null;
      }
    }

    // Acknowledge step filter if specified (e.g. "all", "investment", etc.)
    const activeStep = input.step && input.step !== "all" ? input.step : state.currentStep;

    const output: GetWizardFormOutput = {
      currentStep: activeStep,
      advancedOpen: state.advancedOpen,
      isComplete,
      isFresh: fresh,
      preStep: state.preStep,
      basic: state.basic,
      advanced: state.advanced,
      currencyUnits: state.currencyUnits,
      computedKPIs,
    };

    return {
      success: true,
      data: output,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "GET_WIZARD_FORM_FAILED",
        message: err instanceof Error ? err.message : "Failed to retrieve wizard form state.",
        suggested_fix: "Reload the page or verify the wizard state.",
      },
    };
  }
}
