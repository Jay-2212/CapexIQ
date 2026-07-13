// Resolves sourced default/"Typical" values for a chosen equipment category, per
// CONVENTIONS.md §3: app/ reads equipment-data/*.json read-only, never invents a
// number itself. Every value here traces to a defaultSource already recorded in
// content/inputs-metadata.json — see that file's per-field defaultSource note for the
// citation. Fields with no sourced default (e.g. MRI's billedTariffPerUse.typical is
// null) resolve to null here too — ux-product-spec.md §6 requires those stay visibly
// empty, never silently filled with an invented midpoint.

import mri from "@/equipment-data/mri.json";
import ct from "@/equipment-data/ct.json";
import cathLab from "@/equipment-data/cath-lab.json";
import dialysis from "@/equipment-data/dialysis.json";
import ultrasound from "@/equipment-data/ultrasound.json";
import custom from "@/equipment-data/custom.json";
import commonAssumptions from "@/equipment-data/common-assumptions.json";
import type { EquipmentCategory } from "./wizardTypes";

const CRORE = 10_000_000;

// Every equipment-data/*.json file shares this shape (verified 2026-07-13 — all six
// files have identical top-level keys); each file's literal JSON type differs slightly
// (which fields happen to be null vs. populated, cmcAnnualCostPercentage's optional
// _observedActualAlternative on mri.json only), so a shared structural interface is
// used here instead of `typeof mri`, which would only accept mri.json's exact shape.
interface RangeField {
  low: number | null;
  typical: number | null;
  high: number | null;
}
interface SingleValueField {
  value: number | null;
}
interface EquipmentDataFile {
  purchaseCost: RangeField;
  usefulLifeYears: SingleValueField;
  salvageValuePercentage: SingleValueField;
  installationAndAncillaryCostPercentage: RangeField;
  warrantyYears: RangeField;
  cmcYears: RangeField;
  amcAnnualCostPercentage: RangeField;
  cmcAnnualCostPercentage: RangeField;
  typicalUtilization: { usagePerDay: number | null };
  billedTariffPerUse: RangeField;
  launchDelayMonths: RangeField;
}

const EQUIPMENT_DATA_BY_CATEGORY: Record<EquipmentCategory, EquipmentDataFile> = {
  MRI: mri,
  CT: ct,
  "Cath Lab": cathLab,
  Dialysis: dialysis,
  Ultrasound: ultrasound,
  Custom: custom,
};

export interface EquipmentDefaults {
  purchaseCost: number | null; // Crore
  installationCost: number | null; // Crore
  launchDelayMonths: number | null;
  usagePerDay: number | null;
  billedTariffPerUse: number | null;
  workingDaysPerMonth: number | null;
  warrantyYears: number | null;
  amcCmcCostPostWarranty: number | null;
  cmcYears: number | null;
  usefulLifeYears: number | null;
  salvageValuePercentage: number | null;
  discountRate: number | null;
  loanInterestRate: number | null;
  loanTenureMonths: number | null;
  expectedMatureUtilization: number | null;
  /** Sourced CMC/AMC annual rates (% of purchase cost/year) — used by the canonical
   *  pipeline's Advanced-Mode maintenance path (cmcYears is user-editable there, but
   *  the rate itself stays research-sourced, unlike Basic Mode's single blended
   *  amcCmcCostPostWarranty rate, which the user can edit directly). */
  cmcAnnualCostPercentage: number | null;
  amcAnnualCostPercentage: number | null;
}

export function equipmentDefaults(
  category: EquipmentCategory
): EquipmentDefaults {
  const data = EQUIPMENT_DATA_BY_CATEGORY[category];
  const purchaseCostInr = data.purchaseCost.typical;
  const installationPct = data.installationAndAncillaryCostPercentage.typical;
  const warrantyYears = data.warrantyYears.typical;
  const usefulLifeYears = data.usefulLifeYears.value;
  const cmcYears = data.cmcYears.typical;
  const cmcAnnualPct = data.cmcAnnualCostPercentage.typical;
  const amcAnnualPct = data.amcAnnualCostPercentage.typical;
  const discountRate = commonAssumptions.discountRate.typical;

  let amcCmcCostPostWarranty: number | null = null;
  if (
    warrantyYears !== null &&
    usefulLifeYears !== null &&
    cmcYears !== null &&
    cmcAnnualPct !== null &&
    amcAnnualPct !== null &&
    usefulLifeYears - warrantyYears > 0
  ) {
    const postWarrantyYears = usefulLifeYears - warrantyYears;
    const cmcPortionYears = Math.min(cmcYears, postWarrantyYears);
    const amcPortionYears = postWarrantyYears - cmcPortionYears;
    amcCmcCostPostWarranty =
      (cmcPortionYears * cmcAnnualPct + amcPortionYears * amcAnnualPct) /
      postWarrantyYears;
  }

  return {
    purchaseCost: purchaseCostInr !== null ? purchaseCostInr / CRORE : null,
    installationCost:
      purchaseCostInr !== null && installationPct !== null
        ? (purchaseCostInr * (installationPct / 100)) / CRORE
        : null,
    launchDelayMonths: data.launchDelayMonths.typical,
    usagePerDay: data.typicalUtilization.usagePerDay,
    billedTariffPerUse: data.billedTariffPerUse.typical,
    workingDaysPerMonth: commonAssumptions.workingDaysPerMonth.value,
    warrantyYears,
    amcCmcCostPostWarranty,
    cmcYears,
    usefulLifeYears,
    salvageValuePercentage: data.salvageValuePercentage.value,
    discountRate,
    loanInterestRate: commonAssumptions.loanInterestRate.typical,
    loanTenureMonths: commonAssumptions.loanTenureMonths.typical,
    expectedMatureUtilization: data.typicalUtilization.usagePerDay,
    cmcAnnualCostPercentage: cmcAnnualPct,
    amcAnnualCostPercentage: amcAnnualPct,
  };
}

/** targetIrr has NO sourced benchmark (common-assumptions.json keeps it honestly
 *  "Unavailable") — this is the one field in the product whose "Typical" value is a
 *  computed heuristic rather than a citation, per the UI assurance audit's resolution
 *  (F1) and ux-product-spec.md §6. Always applied, never left blank, so it can never
 *  block Basic Mode's step gate. */
export function targetIrrHeuristic(discountRate: number): number {
  return discountRate + 4;
}
