// Resolves WizardState's Advanced Group A payer-mix fields into the AssessmentPayer[]
// shape formulas/computeAssessment.ts expects — SPEC.md §14.3's "Basic Mode calculates
// first-pass billed revenue; Advanced Mode models net realization and collection
// timing." advanced.A is always populated with a valid default (100% private cash,
// see initialState.ts's defaultPayerMixShare) whether or not the Advanced panel has
// ever been opened, so this function never branches on advancedOpen — one code path,
// same as every other field.
//
// Realization/claim-deduction combination rule (flagged for Jay's confirmation — see
// HANDOFF.md 2026-07-13 Phase 6 entry): content/tooltip-copy.md keeps "realization %"
// and "claim deduction / disallowance %" as two separately-estimated user inputs "so
// the two effects aren't conflated," but formulas/realization.ts's actual
// realizedRevenuePerUse() only accepts one realizationPercentage per payer. No golden
// scenario test exercises claim deduction, so this composition is an engineering
// interpretation, not a verified contract: effective realization = realization% x
// (1 - claimDeduction% / 100), i.e. two independent multiplicative haircuts on the
// billed tariff.

import { PAYER_TYPES } from "./payerAndRampKeys";
import type { AssessmentPayer } from "@/formulas/computeAssessment";
import type { WizardState } from "./wizardTypes";

export function resolvePayerMix(state: WizardState): AssessmentPayer[] {
  return PAYER_TYPES.map((payer) => {
    const share = state.advanced.A.payerMixSharePct[payer.suffix] ?? 0;
    const billedTariff =
      state.advanced.A.billedTariffByPayerType[payer.suffix] ??
      state.basic.billedTariffPerUse ??
      0;
    const realizationPct =
      state.advanced.A.realizationPctByPayerType[payer.suffix] ?? 100;
    const claimDeductionPct =
      state.advanced.A.claimDeductionPctByPayerType[payer.suffix] ?? 0;
    const collectionDelayDays =
      state.advanced.A.collectionDelayDaysByPayerType[payer.suffix] ?? 0;

    return {
      payerName: payer.suffix,
      shareOfVolume: share,
      billedTariff,
      realizationPercentage: realizationPct * (1 - claimDeductionPct / 100),
      collectionDelayDays,
    };
  });
}
