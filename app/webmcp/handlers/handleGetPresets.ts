// Handler for WebMCP tool: get_presets
// Sourced directly from Indian market benchmark research in equipment-data/*.json.

import mri from "@/equipment-data/mri.json";
import ct from "@/equipment-data/ct.json";
import cathLab from "@/equipment-data/cath-lab.json";
import dialysis from "@/equipment-data/dialysis.json";
import ultrasound from "@/equipment-data/ultrasound.json";
import custom from "@/equipment-data/custom.json";
import commonAssumptions from "@/equipment-data/common-assumptions.json";
import { equipmentDefaults } from "../../forms/equipmentDefaults";
import type { EquipmentCategory } from "../../forms/wizardTypes";
import type {
  GetPresetsInput,
  GetPresetsOutput,
  EquipmentPresetData,
  PresetBenchmarkRange,
  WebMCPResult,
} from "../types";

interface SingleValueField {
  value: number | null;
}

interface EquipmentDataFile {
  purchaseCost: PresetBenchmarkRange;
  usefulLifeYears: SingleValueField;
  salvageValuePercentage: SingleValueField;
  installationAndAncillaryCostPercentage: PresetBenchmarkRange;
  warrantyYears: PresetBenchmarkRange;
  cmcYears: PresetBenchmarkRange;
  amcAnnualCostPercentage: PresetBenchmarkRange;
  cmcAnnualCostPercentage: PresetBenchmarkRange;
  typicalUtilization: { usagePerDay: number | null };
  billedTariffPerUse: PresetBenchmarkRange;
  launchDelayMonths: PresetBenchmarkRange;
}

const CATEGORY_MAP: Record<EquipmentCategory, EquipmentDataFile> = {
  MRI: mri as EquipmentDataFile,
  CT: ct as EquipmentDataFile,
  "Cath Lab": cathLab as EquipmentDataFile,
  Dialysis: dialysis as EquipmentDataFile,
  Ultrasound: ultrasound as EquipmentDataFile,
  Custom: custom as EquipmentDataFile,
};

const VALID_CATEGORIES: EquipmentCategory[] = [
  "MRI",
  "CT",
  "Cath Lab",
  "Dialysis",
  "Ultrasound",
  "Custom",
];

function buildPresetData(category: EquipmentCategory): EquipmentPresetData {
  const data = CATEGORY_MAP[category];
  const defaults = equipmentDefaults(category);

  return {
    category,
    purchaseCost: {
      low: data.purchaseCost.low,
      typical: data.purchaseCost.typical,
      high: data.purchaseCost.high,
      unit: data.purchaseCost.unit,
    },
    usefulLifeYears: data.usefulLifeYears.value,
    salvageValuePercentage: data.salvageValuePercentage.value,
    installationCostPct: {
      low: data.installationAndAncillaryCostPercentage.low,
      typical: data.installationAndAncillaryCostPercentage.typical,
      high: data.installationAndAncillaryCostPercentage.high,
      unit: data.installationAndAncillaryCostPercentage.unit,
    },
    warrantyYears: {
      low: data.warrantyYears.low,
      typical: data.warrantyYears.typical,
      high: data.warrantyYears.high,
      unit: data.warrantyYears.unit,
    },
    cmcYears: {
      low: data.cmcYears.low,
      typical: data.cmcYears.typical,
      high: data.cmcYears.high,
      unit: data.cmcYears.unit,
    },
    amcAnnualCostPct: {
      low: data.amcAnnualCostPercentage.low,
      typical: data.amcAnnualCostPercentage.typical,
      high: data.amcAnnualCostPercentage.high,
      unit: data.amcAnnualCostPercentage.unit,
    },
    cmcAnnualCostPct: {
      low: data.cmcAnnualCostPercentage.low,
      typical: data.cmcAnnualCostPercentage.typical,
      high: data.cmcAnnualCostPercentage.high,
      unit: data.cmcAnnualCostPercentage.unit,
    },
    typicalUsagePerDay: data.typicalUtilization.usagePerDay,
    billedTariffPerUse: {
      low: data.billedTariffPerUse.low,
      typical: data.billedTariffPerUse.typical,
      high: data.billedTariffPerUse.high,
      unit: data.billedTariffPerUse.unit,
    },
    launchDelayMonths: {
      low: data.launchDelayMonths.low,
      typical: data.launchDelayMonths.typical,
      high: data.launchDelayMonths.high,
      unit: data.launchDelayMonths.unit,
    },
    defaultsCrore: {
      purchaseCostCr: defaults.purchaseCost,
      installationCostCr: defaults.installationCost,
      discountRatePct: defaults.discountRate,
      loanInterestRatePct: defaults.loanInterestRate,
      loanTenureMonths: defaults.loanTenureMonths,
      workingDaysPerMonth: defaults.workingDaysPerMonth,
    },
  };
}

export function handleGetPresets(
  input: GetPresetsInput = {}
): WebMCPResult<GetPresetsOutput> {
  try {
    const { category } = input;

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return {
          success: false,
          error: {
            error_code: "INVALID_EQUIPMENT_CATEGORY",
            message: `Equipment category '${category}' is not recognized.`,
            suggested_fix: `Select one of the supported categories: ${VALID_CATEGORIES.join(", ")}.`,
          },
        };
      }

      return {
        success: true,
        data: {
          presets: {
            [category]: buildPresetData(category),
          },
          commonAssumptions: {
            discountRate: commonAssumptions.discountRate,
            loanInterestRate: commonAssumptions.loanInterestRate,
            loanTenureMonths: commonAssumptions.loanTenureMonths,
            workingDaysPerMonth: commonAssumptions.workingDaysPerMonth,
          },
        },
      };
    }

    // Return all presets
    const allPresets: Record<string, EquipmentPresetData> = {};
    for (const cat of VALID_CATEGORIES) {
      allPresets[cat] = buildPresetData(cat);
    }

    return {
      success: true,
      data: {
        presets: allPresets,
        commonAssumptions: {
          discountRate: commonAssumptions.discountRate,
          loanInterestRate: commonAssumptions.loanInterestRate,
          loanTenureMonths: commonAssumptions.loanTenureMonths,
          workingDaysPerMonth: commonAssumptions.workingDaysPerMonth,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        error_code: "PRESET_LOOKUP_FAILED",
        message: err instanceof Error ? err.message : "Failed to load preset benchmarks.",
        suggested_fix: "Verify the equipment category and try again.",
      },
    };
  }
}
