"use client";

// Phase 7's "Advanced settings pane" goal line (agent-build-plan.md): lets a user
// nudge the handful of assumptions that most directly move the outlook — Discount
// Rate, Target Hurdle IRR, and the financing rate/rental for whichever acquisition
// mode is active — without leaving /results. Reuses NumberField (the same control
// Advanced Mode uses) so editing here dispatches through the one wizard reducer;
// useAssessmentResult already recomputes from state on every change, so there is no
// separate recompute-trigger to wire (Phase 4-G's live-recalculation contract holds
// for free). Collapsed by default, matching the rest of the product's progressive-
// disclosure convention (Advanced Mode, field help) rather than competing with the
// decision-led hero above it.

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useWizard } from "../forms/WizardContext";
import { NumberField } from "./NumberField";

export function ResultsQuickSettings() {
  const [open, setOpen] = useState(false);
  const { state } = useWizard();
  const acquisitionMode = state.basic.acquisitionMode;

  return (
    <section className="results-quick-settings" data-open={open}>
      <button
        type="button"
        className="results-quick-settings__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal aria-hidden="true" size={16} />
        <span>Adjust the assumptions that move this the most</span>
      </button>
      {open && (
        <div className="results-quick-settings__fields">
          <NumberField path="advanced.F.discountRate" />
          <NumberField path="advanced.F.targetIrr" />
          {acquisitionMode === "Loan" && <NumberField path="advanced.C.loanInterestRate" />}
          {acquisitionMode === "Lease" && <NumberField path="advanced.C.leaseRentalPerMonth" />}
          {acquisitionMode === "Cash" && (
            <p className="results-quick-settings__note">
              This is a cash purchase, so there's no financing rate to adjust here.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
