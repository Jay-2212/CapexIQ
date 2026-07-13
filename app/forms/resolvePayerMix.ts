// Resolves WizardState's Advanced Group A payer-mix fields into the AssessmentPayer[]
// shape formulas/computeAssessment.ts expects — SPEC.md §14.3's "Basic Mode calculates
// first-pass billed revenue; Advanced Mode models net realization and collection
// timing." advanced.A is always populated with a valid default (100% private cash,
// see initialState.ts's defaultPayerMixShare) whether or not the Advanced panel has
// ever been opened, so this function never branches on advancedOpen — one code path,
// same as every other field.
//
// Realization/claim-deduction combination rule (ISS-17, resolved 2026-07-13 — Opus
// advisor pass, no product decision needed): this is a standard healthcare
// revenue-cycle waterfall, not an arbitrary interpretation — billed tariff is first
// reduced by claim deduction/disallowance (the formally rejected portion), then
// realization % is applied to what's left (collection shortfall on the approved
// amount). effectiveRealization = realizationPct x (1 - claimDeductionPct / 100) is
// therefore two sequential, non-overlapping haircuts, not a double-count — see
// content/tooltip-copy.md's "Realization % by payer type" entry, corrected in the same
// pass to define realization % against the post-deduction amount (it previously said
// "billed tariff", which would make this formula double-count).

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
