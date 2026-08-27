// Handler for WebMCP tool: simulate
// In-memory sandbox calculating full assessment without touching browser state.

import { computeAssessment, type AssessmentInputs, type AssessmentPayer } from "@/formulas/computeAssessment";
import { equipmentDefaults } from "../../forms/equipmentDefaults";
import type { SimulateInput, SimulateOutput, WebMCPResult } from "../types";

const CRORE = 10_000_000;
const LAKH = 100_000;

export function handleSimulate(
  input: SimulateInput
): WebMCPResult<SimulateOutput> {
  try {
    // 1. Validation of bounds
    if (typeof input.purchaseCostCr !== "number" || input.purchaseCostCr <= 0) {
      return {
        success: false,
        error: {
          error_code: "INVALID_INPUT_BOUNDS",
          message: "Equipment purchase cost must be a positive number in INR Crore (e.g. 5.5).",
          suggested_fix: "Provide a purchaseCostCr greater than 0.",
        },
      };
    }

    if (typeof input.usagePerDay !== "number" || input.usagePerDay <= 0) {
      return {
        success: false,
        error: {
          error_code: "INVALID_INPUT_BOUNDS",
          message: "Daily scan/procedure usage must be a positive number.",
          suggested_fix: "Provide a usagePerDay greater than 0.",
        },
      };
    }

    if (typeof input.billedTariffPerUse !== "number" || input.billedTariffPerUse <= 0) {
      return {
        success: false,
        error: {
          error_code: "INVALID_INPUT_BOUNDS",
          message: "Billed tariff per scan/procedure must be a positive number in INR.",
          suggested_fix: "Provide a billedTariffPerUse greater than 0.",
        },
      };
    }

    const category = input.category ?? "MRI";
    const defaults = equipmentDefaults(category);

    const purchaseCost = input.purchaseCostCr * CRORE;
    const installationCost =
      (input.installationCostCr !== undefined && input.installationCostCr !== null
        ? input.installationCostCr
        : defaults.installationCost ?? input.purchaseCostCr * 0.15) * CRORE;

    const usefulLifeYears = input.usefulLifeYears ?? defaults.usefulLifeYears ?? 10;
    const warrantyYears = input.warrantyYears ?? defaults.warrantyYears ?? 5;
    const workingDaysPerMonth = input.workingDaysPerMonth ?? defaults.workingDaysPerMonth ?? 25;
    const discountRate = input.discountRate ?? defaults.discountRate ?? 12.5;
    const salvageValuePercentage = input.salvageValuePercentage ?? defaults.salvageValuePercentage ?? 5;

    // 2. Variable & Fixed Costs
    const variableCostPerUse =
      (input.consumableCostPerUse ?? 0) +
      (input.professionalFeePerUse ?? 0) +
      (input.otherVariableCostPerUse ?? 0);

    const fixedCostPerMonth =
      (input.staffCostPerMonth ?? 0) +
      (input.electricityCostPerMonth ?? 0) +
      (input.otherFixedCostPerMonth ?? 0);

    // 3. Payer Mix
    let payers: AssessmentPayer[];
    if (input.payerMix && input.payerMix.length > 0) {
      const totalShare = input.payerMix.reduce((sum, p) => sum + (p.shareOfVolume ?? 0), 0);
      if (Math.abs(totalShare - 100) > 0.5) {
        return {
          success: false,
          error: {
            error_code: "INVALID_PAYER_MIX_TOTAL",
            message: `Payer mix shares sum to ${totalShare.toFixed(1)}%, but must equal exactly 100%.`,
            suggested_fix: "Ensure the shareOfVolume across all payers totals exactly 100%.",
          },
        };
      }

      payers = input.payerMix.map((p) => ({
        payerName: p.payerName,
        shareOfVolume: p.shareOfVolume,
        billedTariff: p.billedTariff ?? input.billedTariffPerUse,
        realizationPercentage: p.realizationPercentage ?? 100,
        collectionDelayDays: p.collectionDelayDays ?? 0,
      }));
    } else {
      // Default 100% private cash at standard tariff
      payers = [
        {
          payerName: "Private Cash",
          shareOfVolume: 100,
          billedTariff: input.billedTariffPerUse,
          realizationPercentage: 100,
          collectionDelayDays: 0,
        },
      ];
    }

    // Check contribution margin
    const weightedRealizedTariff = payers.reduce(
      (sum, p) => sum + (p.shareOfVolume / 100) * p.billedTariff * ((p.realizationPercentage ?? 100) / 100),
      0
    );

    if (variableCostPerUse >= weightedRealizedTariff && variableCostPerUse > 0) {
      return {
        success: false,
        error: {
          error_code: "NEGATIVE_CONTRIBUTION_MARGIN",
          message: `Variable cost per use (₹${variableCostPerUse.toLocaleString("en-IN")}) exceeds or equals realized revenue per use (₹${Math.round(weightedRealizedTariff).toLocaleString("en-IN")}). The procedure loses money on every scan.`,
          suggested_fix: "Increase the billed tariff, improve realization percentages, or reduce consumable/fee costs.",
        },
      };
    }

    // 4. Financing
    const acquisitionMode = input.acquisitionMode ?? "Cash";
    let financing: AssessmentInputs["financing"];
    if (acquisitionMode === "Loan") {
      financing = {
        type: "loan",
        downPayment: (input.downPaymentCr ?? 0) * CRORE,
        interestRate: input.loanInterestRate ?? defaults.loanInterestRate ?? 10.5,
        tenureMonths: input.loanTenureMonths ?? defaults.loanTenureMonths ?? 60,
      };
    } else if (acquisitionMode === "Lease") {
      financing = {
        type: "lease",
        rentalPerMonth: input.leaseRentalPerMonth ?? 0,
        tenureMonths: input.leaseTenureMonths ?? 60,
      };
    } else {
      financing = { type: "cash" };
    }

    // 5. Maintenance
    const amcCmcPct = input.amcCmcCostPostWarrantyPct ?? defaults.amcCmcCostPostWarranty ?? 3.5;
    const amcAnnualCost = (amcCmcPct / 100) * purchaseCost;

    const assessmentInputs: AssessmentInputs = {
      purchaseCost,
      installationCost,
      usagePerDay: input.usagePerDay,
      workingDaysPerMonth,
      payerMix: payers,
      variableCostPerUse,
      fixedCostPerMonth,
      financing,
      maintenance: {
        warrantyYears,
        cmcYears: 0,
        cmcAnnualCost: 0,
        amcAnnualCost,
      },
      usefulLifeYears,
      discountRate,
      salvageValuePercentage,
      utilizationRamp: input.utilizationRamp,
    };

    const result = computeAssessment(assessmentInputs);

    const summary: SimulateOutput["summary"] = {
      initialInvestmentCr: Number((result.initialInvestment / CRORE).toFixed(2)),
      contributionMarginPerUse: Number(result.contributionPerUse.toFixed(2)),
      breakEvenUsagePerDay:
        result.breakEvenUsagePerDay !== null ? Number(result.breakEvenUsagePerDay.toFixed(1)) : null,
      monthlyRealizedRevenueLakh: Number((result.monthlyRealizedRevenue / LAKH).toFixed(2)),
      annualOperatingSurplusLakh: Number((result.annualOperatingSurplus / LAKH).toFixed(2)),
      npvLakh: Number((result.npv / LAKH).toFixed(2)),
      irrPct: result.irr !== null ? Number(result.irr.toFixed(2)) : null,
      roiRealizedPct: Number(result.roiRealized.toFixed(2)),
      paybackYears: Number(result.paybackYears.toFixed(2)),
      discountedPaybackYears:
        result.discountedPaybackYears !== null
          ? Number(result.discountedPaybackYears.toFixed(2))
          : null,
      outlookScore: result.investmentOutlook.score,
      outlookBand: result.investmentOutlook.band,
      outlookDriver: result.investmentOutlook.driver,
    };

    return {
      success: true,
      data: {
        inputs: assessmentInputs,
        result,
        summary,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "SIMULATION_FAILED",
        message: err instanceof Error ? err.message : "Failed to execute simulation.",
        suggested_fix: "Verify input values and formatting.",
      },
    };
  }
}
