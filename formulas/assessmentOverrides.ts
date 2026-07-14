// Ephemeral "what-if" overrides for the canonical AssessmentInputs — Phase 9 (SPEC.md
// §28 scenario comparison, continuous sensitivity slider). These never replace
// computeAssessment(); every caller still runs the overridden inputs back through it
// (CONVENTIONS.md §3 — one engine, no parallel formula path). Overrides apply
// uniformly across the payer mix (billed tariff / realization %) rather than
// per-payer — neither the slider nor the scenario table exposes per-payer editing;
// Advanced Mode's own payer-mix table remains the only place for that level of detail.

import type { AssessmentInputs } from "./computeAssessment";

export interface AssessmentOverrides {
  purchaseCost?: number;
  usagePerDay?: number;
  billedTariffPerUse?: number;
  /** Uniform effective realization % applied to every payer (post claim-deduction,
   *  matching the field's meaning by the time it reaches AssessmentInputs.payerMix —
   *  see resolvePayerMix.ts). */
  realizationPercentage?: number;
}

export function applyAssessmentOverrides(
  inputs: AssessmentInputs,
  overrides: AssessmentOverrides
): AssessmentInputs {
  return {
    ...inputs,
    purchaseCost: overrides.purchaseCost ?? inputs.purchaseCost,
    usagePerDay: overrides.usagePerDay ?? inputs.usagePerDay,
    payerMix: inputs.payerMix.map((payer) => ({
      ...payer,
      billedTariff: overrides.billedTariffPerUse ?? payer.billedTariff,
      realizationPercentage:
        overrides.realizationPercentage ?? payer.realizationPercentage,
    })),
  };
}

export function weightedAverageRealization(inputs: AssessmentInputs): number {
  const totalShare = inputs.payerMix.reduce((sum, payer) => sum + payer.shareOfVolume, 0);
  if (totalShare <= 0) return 0;
  return (
    inputs.payerMix.reduce(
      (sum, payer) => sum + payer.shareOfVolume * payer.realizationPercentage,
      0
    ) / totalShare
  );
}

export function weightedAverageBilledTariff(inputs: AssessmentInputs): number {
  const totalShare = inputs.payerMix.reduce((sum, payer) => sum + payer.shareOfVolume, 0);
  if (totalShare <= 0) return 0;
  return (
    inputs.payerMix.reduce(
      (sum, payer) => sum + payer.shareOfVolume * payer.billedTariff,
      0
    ) / totalShare
  );
}
