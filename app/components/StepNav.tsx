"use client";

// Next/Back buttons shared by the 3 Basic Mode step pages. "Next" uses aria-disabled
// (not the native disabled attribute) so it stays focusable and clickable even when
// the step isn't complete — activating it then moves focus to the first invalid field
// instead of navigating (wizard-state.md §2, audit F7's disabled-"Next"
// discoverability fix), which the native `disabled` attribute would silently prevent
// in some browsers. Idempotent submission (§9): BEGIN_TRANSITION is a no-op if a
// transition is already in flight, and the button that triggered it is inert for the
// remainder of that transition via transitionInFlight.

import { useRouter } from "next/navigation";
import { useWizard } from "../forms/WizardContext";
import { firstInvalidFieldOnStep } from "../forms/wizardValidation";
import { Button } from "./Button";
import type { WizardStep } from "../forms/wizardTypes";

export function StepNav({
  step,
  complete,
  backHref,
  nextHref,
  nextLabel = "Next",
}: {
  step: Exclude<WizardStep, "results">;
  complete: boolean;
  backHref: string | null;
  nextHref: string;
  nextLabel?: string;
}) {
  const { state, dispatch } = useWizard();
  const router = useRouter();

  const goNext = () => {
    if (!complete) {
      // ISS-25: reveal every blocked field's error on this step, not just the one
      // focus lands on — the user asked "why can't I proceed," not "what's the very
      // first thing."
      dispatch({ type: "ATTEMPT_STEP", step });
      const invalidPath = firstInvalidFieldOnStep(step, state);
      const element = invalidPath ? document.getElementById(invalidPath) : null;
      element?.focus();
      element?.scrollIntoView({ block: "center" });
      return;
    }
    if (state.transitionInFlight) return;
    dispatch({ type: "BEGIN_TRANSITION" });
    router.push(nextHref);
  };

  return (
    <div className="step-nav">
      {backHref && (
        <Button variant="secondary" onClick={() => router.push(backHref)}>
          Back
        </Button>
      )}
      <Button
        variant="primary"
        aria-disabled={!complete}
        disabled={state.transitionInFlight}
        onClick={goNext}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
