"use client";

// Results — deliberately minimal for Phase 6: real numbers from the same canonical
// pipeline the preview strip uses, no charts/gauge/narrative yet (agent-build-plan.md
// Phase 7 owns those, against design/dashboard-mockup.svg). RouteGuard (mounted in
// the shared layout) already redirects here only once every Basic-required field is
// valid, so this page can assume `result` is non-null once resultState is "fresh".

import { useWizard } from "../../forms/WizardContext";
import { useAssessmentResult } from "../../forms/useAssessmentResult";
import { formatInr, formatPercent, formatYears } from "../../components/formatting";

export default function ResultsPage() {
  const { state } = useWizard();
  const { result, resultState } = useAssessmentResult(state);

  if (!result) {
    return (
      <div className="assess-page">
        <h1 tabIndex={-1}>Results</h1>
        <p>Complete the assessment to see your results.</p>
      </div>
    );
  }

  const outlook = result.investmentOutlook;

  return (
    <div className="assess-page">
      <h1 tabIndex={-1}>Results</h1>
      {resultState === "stale" && (
        <p className="preview-strip__stale-note">
          Showing your last valid entries — fix the highlighted field to refresh.
        </p>
      )}

      <section className="results-summary" data-band={outlook.band}>
        <h2>
          Investment Outlook: {outlook.band} ({outlook.score}/100)
        </h2>
        <p>
          {outlook.driverFraming === "risk"
            ? `Main risk driver: ${outlook.driver}.`
            : `Main strength: ${outlook.driver}.`}
        </p>
      </section>

      <dl className="results-metric-grid">
        <div>
          <dt>Initial investment</dt>
          <dd>{formatInr(result.initialInvestment)}</dd>
        </div>
        <div>
          <dt>NPV</dt>
          <dd>{formatInr(result.npv)}</dd>
        </div>
        <div>
          <dt>IRR</dt>
          <dd>{result.irr === null ? "Undefined" : formatPercent(result.irr)}</dd>
        </div>
        <div>
          <dt>Payback period</dt>
          <dd>{formatYears(result.paybackYearsFromCashFlows)}</dd>
        </div>
        <div>
          <dt>Discounted payback</dt>
          <dd>
            {result.discountedPaybackYears === null
              ? "Never (within useful life)"
              : formatYears(result.discountedPaybackYears)}
          </dd>
        </div>
        <div>
          <dt>ROI (cash-flow view)</dt>
          <dd>{formatPercent(result.roiCashFlow)}</dd>
        </div>
        <div>
          <dt>Break-even usage/day</dt>
          <dd>
            {result.breakEvenUsagePerDay === null
              ? "Not achievable at current costs"
              : result.breakEvenUsagePerDay.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt>Equivalent annual cost</dt>
          <dd>{formatInr(result.eac)}</dd>
        </div>
      </dl>

      <p className="results-note">
        Full dashboard with charts, sensitivity, and export is coming in a later
        phase — every number above is already the same live calculation those views
        will use.
      </p>
    </div>
  );
}
