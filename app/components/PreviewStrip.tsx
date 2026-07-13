"use client";

// The persistent compact preview bar on /assess/investment, /assess/usage, and
// /assess/costs (wizard-state.md §4) — not shown on the pre-step (no cost/revenue
// data exists yet). Visible once Step 1's required fields are valid; shows a dash
// state before that, never a stale zero that looks like a real answer.

import { useWizard } from "../forms/WizardContext";
import { useAssessmentResult } from "../forms/useAssessmentResult";
import { isStepComplete } from "../forms/wizardValidation";
import { formatYears } from "./formatting";

export function PreviewStrip() {
  const { state } = useWizard();
  const { result, resultState } = useAssessmentResult(state);

  if (!isStepComplete("investment", state)) {
    return (
      <aside className="preview-strip" data-state="empty" aria-live="off">
        <span className="preview-strip__placeholder">
          Fill in Investment to see a live preview.
        </span>
      </aside>
    );
  }

  if (!result) return null;

  const band = result.investmentOutlook.band;

  return (
    <aside className="preview-strip" data-state={resultState}>
      <div className="preview-strip__metric">
        <span className="preview-strip__metric-label">Payback</span>
        <span className="preview-strip__metric-value">
          {formatYears(result.paybackYearsFromCashFlows)}
        </span>
      </div>
      <div className="preview-strip__badge" data-band={band}>
        {band} · {result.investmentOutlook.score}
      </div>
      {resultState === "stale" && (
        <span className="preview-strip__stale-note">Based on your last valid entries</span>
      )}
      {band === "Weak" || band === "Caution" ? (
        <span className="preview-strip__risk-note">
          {result.investmentOutlook.driverFraming === "risk"
            ? `Watch: ${result.investmentOutlook.driver}`
            : null}
        </span>
      ) : null}
    </aside>
  );
}
