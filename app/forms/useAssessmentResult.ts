"use client";

// The invalid/stale contract, wizard-state.md §4: fresh once every currently-relevant
// field is valid; otherwise the last successfully computed result stays rendered
// (reduced opacity, "based on your last valid entries") — it never blanks. The
// preview strip and the results page both call this single hook, never a second,
// independently-recalculated copy (CONVENTIONS.md §3).

import { useMemo, useRef } from "react";
import { computeAssessment, type AssessmentResult } from "@/formulas/computeAssessment";
import { toAssessmentInputs } from "./toAssessmentInputs";
import { isResultStateFresh } from "./wizardValidation";
import type { WizardState } from "./wizardTypes";

export interface AssessmentResultState {
  result: AssessmentResult | null;
  resultState: "fresh" | "stale" | "empty";
}

export function useAssessmentResult(state: WizardState): AssessmentResultState {
  const lastValidResult = useRef<AssessmentResult | null>(null);
  const fresh = isResultStateFresh(state);

  const freshResult = useMemo(() => {
    if (!fresh) return null;
    return computeAssessment(toAssessmentInputs(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh, state]);

  if (freshResult) {
    lastValidResult.current = freshResult;
    return { result: freshResult, resultState: "fresh" };
  }

  if (lastValidResult.current) {
    return { result: lastValidResult.current, resultState: "stale" };
  }

  return { result: null, resultState: "empty" };
}
