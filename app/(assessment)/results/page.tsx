"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Gauge, IndianRupee, LineChart, TimerReset } from "lucide-react";
import { cumulativeCashFlowSeries } from "@/formulas/roi";
import { useWizard } from "../../forms/WizardContext";
import { useAssessmentResult } from "../../forms/useAssessmentResult";
import { toAssessmentInputs } from "../../forms/toAssessmentInputs";
import { formatInr, formatPercent, formatYears } from "../../components/formatting";
import { BreakEvenBar } from "../../charts/BreakEvenBar";
import { CashFlowChart } from "../../charts/CashFlowChart";
import { RiskCallout } from "../../components/RiskCallout";
import { ResultsQuickSettings } from "../../components/ResultsQuickSettings";
import { ExportPanel } from "../../components/ExportPanel";

const DRIVER_LABELS: Record<string, string> = {
  returnStrength: "the return relative to your cost of capital",
  speedToPayback: "the time required to recover the investment",
  financingResilience: "the cash cushion after financing payments",
  operationalMarginOfSafety: "the distance between expected and break-even demand",
};

export default function ResultsPage() {
  const { state } = useWizard();
  const { result, resultState } = useAssessmentResult(state);

  if (!result) return <div className="assess-page"><h1 tabIndex={-1}>Your assessment is not complete yet.</h1><Link href="/assess">Return to the assessment</Link></div>;

  const outlook = result.investmentOutlook;
  const hospital = state.preStep.hospitalName || "Your hospital";
  const equipment = state.preStep.equipmentCategory || "equipment";
  const driver = DRIVER_LABELS[outlook.driver] ?? "the most sensitive assumption in this assessment";
  const usagePerDay = state.basic.usagePerDay ?? 0;
  const cashFlowSeries = cumulativeCashFlowSeries(
    result.initialInvestment,
    result.annualNetCashFlowsAfterFinancing
  );

  return (
    <div className="assess-page assess-page--results">
      <Link href="/assess/costs" className="results-back"><ArrowLeft aria-hidden="true" size={16} /> Adjust assumptions</Link>
      <section className="results-hero" data-band={outlook.band}>
        <div className="results-hero__copy">
          <span className="narrative-intro__eyebrow">{hospital} · {equipment} assessment</span>
          <h1 tabIndex={-1}>The investment case is <em>{outlook.band.toLowerCase()}</em>.</h1>
          <p>{outlook.driverFraming === "risk" ? "The main point to examine is" : "The strongest part of the case is"} {driver}.</p>
          {resultState === "stale" && <p className="preview-strip__stale-note">Showing the last complete calculation while you fix an input.</p>}
        </div>
        <div className="results-score" style={{ "--score": outlook.score } as CSSProperties}>
          <div><strong>{outlook.score}</strong><span>out of 100</span></div>
          <small>Investment outlook</small>
        </div>
      </section>

      <section className="results-primary-grid">
        <article><IndianRupee aria-hidden="true" /><span>Net present value</span><strong>{formatInr(result.npv)}</strong><p>Value created after discounting future cash flows.</p></article>
        <article><ArrowUpRight aria-hidden="true" /><span>Internal rate of return</span><strong>{result.irr === null ? "Undefined" : formatPercent(result.irr)}</strong><p>The return implied by this cash-flow pattern.</p></article>
        <article><TimerReset aria-hidden="true" /><span>Payback</span><strong>{formatYears(result.paybackYearsFromCashFlows)}</strong><p>Time required to recover the initial commitment.</p></article>
      </section>

      <section className="results-detail">
        <div className="results-detail__heading"><Gauge aria-hidden="true" /><div><span className="narrative-intro__eyebrow">The supporting read</span><h2>What sits behind the outlook</h2></div></div>
        <dl className="results-metric-grid">
          <div><dt>Initial investment</dt><dd>{formatInr(result.initialInvestment)}</dd></div>
          <div><dt>ROI · cash-flow view</dt><dd>{formatPercent(result.roiCashFlow)}</dd></div>
          <div><dt>Discounted payback</dt><dd>{result.discountedPaybackYears === null ? "Beyond useful life" : formatYears(result.discountedPaybackYears)}</dd></div>
          <div><dt>Break-even activity</dt><dd>{result.breakEvenUsagePerDay === null ? "Not achievable" : `${result.breakEvenUsagePerDay.toFixed(1)} / day`}</dd></div>
          <div><dt>Equivalent annual cost</dt><dd>{formatInr(result.eac)}</dd></div>
        </dl>
      </section>

      <section className="results-charts">
        <article className="results-chart-card">
          <div className="results-chart-card__heading">
            <Gauge aria-hidden="true" size={18} />
            <div>
              <span className="narrative-intro__eyebrow">Break-even analysis</span>
              <h2>How close is expected demand to break-even?</h2>
            </div>
          </div>
          <BreakEvenBar usagePerDay={usagePerDay} breakEvenUsagePerDay={result.breakEvenUsagePerDay} />
        </article>

        <article className="results-chart-card">
          <div className="results-chart-card__heading">
            <LineChart aria-hidden="true" size={18} />
            <div>
              <span className="narrative-intro__eyebrow">Cumulative cash flow</span>
              <h2>When does the investment turn positive?</h2>
            </div>
          </div>
          <CashFlowChart series={cashFlowSeries} />
        </article>
      </section>

      <RiskCallout
        outlook={outlook}
        usagePerDay={usagePerDay}
        breakEvenUsagePerDay={result.breakEvenUsagePerDay}
        workingCapitalPeakGap={result.workingCapitalPeakGap}
        workingCapitalPeakGapMonth={result.workingCapitalPeakGapMonth}
      />

      <ResultsQuickSettings />

      <ExportPanel
        inputs={toAssessmentInputs(state)}
        result={result}
        hospitalName={hospital}
        equipmentCategory={equipment}
      />

      <p className="results-disclaimer">
        Indicative only, based on entered assumptions and editable benchmarks — not
        financial advice.
      </p>

      <section className="results-next-step">
        <div><span className="narrative-intro__eyebrow">Need a sharper answer?</span><h2>Refine the assumptions that matter.</h2><p>Return to Advanced Mode to add payer collections, financing, launch timing and lifecycle costs.</p></div>
        <Link href="/assess/costs" className="button button--secondary">Open Advanced Mode</Link>
      </section>
    </div>
  );
}
