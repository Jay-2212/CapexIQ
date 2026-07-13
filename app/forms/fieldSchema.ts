// Expands content/inputs-metadata.json's template fields (payer-mix x5, ramp x4) into
// concrete FieldDefinitions keyed by dotted path, using the final suffixes wizard-
// state.md §7.1 fixed. This is the ONLY place that expansion happens — every UI
// component and the reducer's validator both read from getFieldDefinition(), never
// from inputs-metadata.json directly (CONVENTIONS.md §3: one source of truth,
// consumed read-only).

import inputsMetadata from "@/content/inputs-metadata.json";
import { PAYER_TYPES, RAMP_PERIODS } from "./payerAndRampKeys";

export interface FieldDefinition {
  path: string;
  label: string;
  controlType: "select" | "text" | "input" | "slider" | "reserved" | "structural";
  min?: number;
  max?: number;
  decimalPlaces?: number;
  sliderStep?: number;
  maxLength?: number;
  options?: string[];
  required: boolean;
  requiredIf?: string;
  groupConstraint?: string;
  errorMessage?: string;
  tooltipKey: string | null;
  unit?: string;
  defaultValue?: string;
}

// Minimal shape of one raw entry in inputs-metadata.json — every field this project's
// schema actually populates; unrecognized keys are ignored, not an error.
interface RawFieldEntry {
  label: string;
  controlType: FieldDefinition["controlType"];
  min?: number;
  max?: number;
  decimalPlaces?: number;
  sliderStep?: number;
  maxLength?: number;
  options?: string[];
  required?: boolean;
  requiredIf?: string;
  groupConstraint?: string;
  errorMessage?: string;
  tooltipKey?: string | null;
  unit?: string;
  default?: string;
  template?: string;
}

function toFieldDefinition(path: string, raw: RawFieldEntry): FieldDefinition {
  return {
    path,
    label: raw.label,
    controlType: raw.controlType,
    min: raw.min,
    max: raw.max,
    decimalPlaces: raw.decimalPlaces,
    sliderStep: raw.sliderStep,
    maxLength: raw.maxLength,
    options: raw.options,
    required: raw.required ?? false,
    requiredIf: raw.requiredIf,
    groupConstraint: raw.groupConstraint,
    errorMessage: raw.errorMessage,
    tooltipKey: raw.tooltipKey ?? null,
    unit: raw.unit,
    defaultValue: raw.default,
  };
}

function buildRegistry(): Map<string, FieldDefinition> {
  const registry = new Map<string, FieldDefinition>();
  const basic = inputsMetadata.basic as Record<string, RawFieldEntry>;

  const preStepKeys = new Set([
    "equipmentCategory",
    "hospitalName",
    "hospitalBedSize",
    "cityTier",
    "hospitalType",
    "equipmentNameModel",
  ]);

  for (const [key, raw] of Object.entries(basic)) {
    const prefix = preStepKeys.has(key) ? "preStep" : "basic";
    registry.set(`${prefix}.${key}`, toFieldDefinition(`${prefix}.${key}`, raw));
  }

  const advanced = inputsMetadata.advanced as Record<
    string,
    Record<string, RawFieldEntry | string> & { _group?: string }
  >;
  const groupLetterByFolder: Record<string, string> = {
    A_revenueRealizationAndPayerMix: "A",
    B_utilizationRampUp: "B",
    C_financing: "C",
    D_launchDelayAndPreOpeningCost: "D",
    E_maintenanceAndLifecycleCost: "E",
    F_financialModelAssumptions: "F",
  };
  const payerTemplateFields = new Set([
    "payerMixSharePct",
    "billedTariffByPayerType",
    "realizationPctByPayerType",
    "claimDeductionPctByPayerType",
    "collectionDelayDaysByPayerType",
  ]);
  const rampTemplateFields = new Set(["utilizationRampPct"]);

  for (const [folderKey, group] of Object.entries(advanced)) {
    const letter = groupLetterByFolder[folderKey];
    if (!letter) continue;

    for (const [fieldKey, raw] of Object.entries(group)) {
      if (fieldKey === "_group" || typeof raw === "string") continue;
      const entry = raw as RawFieldEntry;

      if (payerTemplateFields.has(fieldKey)) {
        for (const payer of PAYER_TYPES) {
          const path = `advanced.${letter}.${fieldKey}.${payer.suffix}`;
          registry.set(path, {
            ...toFieldDefinition(path, entry),
            label: `${entry.label} — ${payer.label}`,
          });
        }
      } else if (rampTemplateFields.has(fieldKey)) {
        for (const ramp of RAMP_PERIODS) {
          const path = `advanced.${letter}.${fieldKey}.${ramp.suffix}`;
          registry.set(path, {
            ...toFieldDefinition(path, entry),
            label: `${entry.label} — ${ramp.label}`,
          });
        }
      } else if (fieldKey === "maintenanceCostByYearPct") {
        // Dynamic length (= usefulLifeYears); each year gets the same definition at
        // render time — see MaintenancePerYearField in app/advanced/.
        registry.set(`advanced.${letter}.${fieldKey}`, toFieldDefinition(`advanced.${letter}.${fieldKey}`, entry));
      } else {
        const path = `advanced.${letter}.${fieldKey}`;
        registry.set(path, toFieldDefinition(path, entry));
      }
    }
  }

  return registry;
}

let registryCache: Map<string, FieldDefinition> | null = null;

function registry(): Map<string, FieldDefinition> {
  if (!registryCache) registryCache = buildRegistry();
  return registryCache;
}

export function getFieldDefinition(path: string): FieldDefinition {
  const def = registry().get(path);
  if (!def) {
    throw new Error(`No field definition registered for path "${path}".`);
  }
  return def;
}

export function allFieldDefinitions(): FieldDefinition[] {
  return Array.from(registry().values());
}
