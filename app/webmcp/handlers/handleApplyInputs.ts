// Handler for WebMCP tool: apply_inputs
// Applies context and parameter updates to the active WizardContext and can trigger navigation.

import type { FieldValue } from "../../forms/wizardTypes";
import { wizardReducer, type WizardAction } from "../../forms/wizardReducer";
import { isResultStateFresh, earliestIncompleteStep, payerMixGroupError } from "../../forms/wizardValidation";
import { toAssessmentInputs } from "../../forms/toAssessmentInputs";
import { computeAssessment } from "@/formulas/computeAssessment";
import type {
  ApplyInputsInput,
  ApplyInputsOutput,
  WebMCPContextAccessor,
  WebMCPResult,
} from "../types";

export function handleApplyInputs(
  input: ApplyInputsInput,
  context?: WebMCPContextAccessor
): WebMCPResult<ApplyInputsOutput> {
  try {
    if (!context || !context.getState || !context.dispatch) {
      return {
        success: false,
        error: {
          error_code: "WIZARD_CONTEXT_UNAVAILABLE",
          message: "Wizard session context is not available to apply inputs.",
          suggested_fix: "Ensure the CapexIQ wizard is open and loaded in the browser.",
        },
      };
    }

    const { equipmentCategory, updates = {}, navigateToResults, targetStep } = input;
    const { dispatch } = context;
    let nextState = context.getState();

    // React dispatch updates the provider state after this callback returns. Mirror
    // each reducer transition locally so the tool response describes the applied
    // state immediately instead of returning the pre-update snapshot.
    const applyAction = (action: WizardAction) => {
      nextState = wizardReducer(nextState, action);
      dispatch(action);
    };

    // 1. Select equipment category if supplied
    if (equipmentCategory) {
      applyAction({ type: "SELECT_EQUIPMENT_CATEGORY", category: equipmentCategory });
    }

    // 2. Toggle advanced mode if requested
    if (
      typeof updates.advancedOpen === "boolean" &&
      updates.advancedOpen !== nextState.advancedOpen
    ) {
      applyAction({ type: "TOGGLE_ADVANCED" });
    }

    // 3. Apply currency units if supplied
    if (updates.currencyUnits) {
      if (updates.currencyUnits.purchaseCost) {
        applyAction({
          type: "SET_CURRENCY_UNIT",
          field: "purchaseCost",
          unit: updates.currencyUnits.purchaseCost,
        });
      }
      if (updates.currencyUnits.installationCost) {
        applyAction({
          type: "SET_CURRENCY_UNIT",
          field: "installationCost",
          unit: updates.currencyUnits.installationCost,
        });
      }
    }

    // 4. Apply preStep updates
    if (updates.preStep) {
      for (const [key, value] of Object.entries(updates.preStep)) {
        applyAction({
          type: "SET_FIELD",
          path: `preStep.${key}`,
          value: value ?? null,
        });
      }
    }

    // 5. Apply basic updates
    if (updates.basic) {
      for (const [key, value] of Object.entries(updates.basic)) {
        applyAction({
          type: "SET_FIELD",
          path: `basic.${key}`,
          value: value ?? null,
        });
      }
    }

    // 6. Apply advanced updates
    if (updates.advanced) {
      for (const [groupKey, groupFields] of Object.entries(updates.advanced)) {
        if (groupFields && typeof groupFields === "object") {
          for (const [fieldKey, val] of Object.entries(groupFields)) {
            if (val && typeof val === "object" && !Array.isArray(val)) {
              // Sub-fields like payerMixSharePct.privateCash
              for (const [subKey, subVal] of Object.entries(val)) {
                applyAction({
                  type: "SET_FIELD",
                  path: `advanced.${groupKey}.${fieldKey}.${subKey}`,
                  value: subVal as FieldValue,
                });
              }
            } else {
              applyAction({
                type: "SET_FIELD",
                path: `advanced.${groupKey}.${fieldKey}`,
                value: val as FieldValue,
              });
            }
          }
        }
      }
    }

    // Check payer mix validity if advanced A was touched
    const payerMixError = payerMixGroupError(nextState);
    if (payerMixError) {
      return {
        success: false,
        error: {
          error_code: "INVALID_PAYER_MIX_TOTAL",
          message: payerMixError,
          suggested_fix: "Adjust payer mix percentage shares so they total 100%.",
        },
      };
    }

    const fresh = isResultStateFresh(nextState);
    const incompleteStep = earliestIncompleteStep(nextState);
    const isComplete = incompleteStep === null;

    let navigatedTo: string | null = null;

    if (navigateToResults) {
      if (context.navigateTo) {
        context.navigateTo("/results");
        navigatedTo = "/results";
      }
    } else if (targetStep) {
      const stepRoutes: Record<string, string> = {
        preStep: "/assess",
        investment: "/assess/investment",
        usage: "/assess/usage",
        costs: "/assess/costs",
        results: "/results",
      };
      const route = stepRoutes[targetStep];
      if (route && context.navigateTo) {
        context.navigateTo(route);
        navigatedTo = route;
      }
    }

    let computedKPIs: ApplyInputsOutput["computedKPIs"] = null;
    if (fresh) {
      try {
        const assessmentInputs = toAssessmentInputs(nextState);
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

    return {
      success: true,
      data: {
        applied: true,
        navigatedTo,
        isComplete,
        isFresh: fresh,
        currentStateSummary: {
          equipmentCategory: nextState.preStep.equipmentCategory,
          hospitalName: nextState.preStep.hospitalName,
          purchaseCostCr: nextState.basic.purchaseCost,
          usagePerDay: nextState.basic.usagePerDay,
          billedTariffPerUse: nextState.basic.billedTariffPerUse,
          acquisitionMode: nextState.basic.acquisitionMode,
          advancedOpen: nextState.advancedOpen,
        },
        computedKPIs,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "APPLY_INPUTS_FAILED",
        message: err instanceof Error ? err.message : "Failed to apply inputs to the wizard.",
        suggested_fix: "Check input structure and field values.",
      },
    };
  }
}
