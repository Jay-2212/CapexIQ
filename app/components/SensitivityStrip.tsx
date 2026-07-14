"use client";

// Phase 9's continuous sensitivity view (agent-build-plan.md): drag usage/day or
// realization % and see NPV/IRR/payback update live next to the main charts. Runs the
// full canonical computeAssessment() (CONVENTIONS.md §3 — one engine), never the
// lighter runScenario model, so the strip's resting-position numbers always match the
// dashboard headline above it. Purely a local what-if: overrides live in this
// component's own state, never dispatched through the wizard reducer, so dragging the
// slider can never mutate or persist the user's real assessment (unlike
// ResultsQuickSettings, which intentionally does dispatch through the reducer for its
// own, different, "adjust the real assumption" purpose).
//
// Bounds are pulled straight from content/inputs-metadata.json — basic.usagePerDay
// (0-50) and advanced.A_revenueRealizationAndPayerMix.realizationPctByPayerType
// (0-100) — not invented for this view.

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { computeAssessment, type AssessmentInputs } from "@/formulas/computeAssessment";
import {
  applyAssessmentOverrides,
  weightedAverageRealization,
} from "@/formulas/assessmentOverrides";
import { formatInr, formatPercent, formatYears } from "./formatting";

const USAGE_MIN = 0;
const USAGE_MAX = 50;
const REALIZATION_MIN = 0;
const REALIZATION_MAX = 100;

export function SensitivityStrip({ inputs }: { inputs: AssessmentInputs }) {
  const baselineUsage = inputs.usagePerDay;
  const baselineRealization = useMemo(
    () => weightedAverageRealization(inputs),
    [inputs]
  );

  const [usagePerDay, setUsagePerDay] = useState(baselineUsage);
  const [realizationPercentage, setRealizationPercentage] = useState(
    baselineRealization
  );

  const scenarioResult = useMemo(
    () =>
      computeAssessment(
        applyAssessmentOverrides(inputs, { usagePerDay, realizationPercentage })
      ),
    [inputs, usagePerDay, realizationPercentage]
  );

  const isAtBaseline =
    usagePerDay === baselineUsage && realizationPercentage === baselineRealization;

  return (
    <section className="sensitivity-strip" aria-label="Sensitivity view">
      <div className="sensitivity-strip__heading">
        <div>
          <span className="narrative-intro__eyebrow">What if?</span>
          <h2>Drag the two biggest drivers of this outcome</h2>
        </div>
        <button
          type="button"
          className="sensitivity-strip__reset"
          onClick={() => {
            setUsagePerDay(baselineUsage);
            setRealizationPercentage(baselineRealization);
          }}
          disabled={isAtBaseline}
        >
          <RotateCcw aria-hidden="true" size={14} /> Reset
        </button>
      </div>

      <div className="sensitivity-strip__controls">
        <label className="sensitivity-strip__control">
          <span>Usage per day: {usagePerDay.toFixed(1)}</span>
          <input
            type="range"
            min={USAGE_MIN}
            max={USAGE_MAX}
            step={1}
            value={usagePerDay}
            onChange={(event) => setUsagePerDay(Number(event.target.value))}
          />
        </label>
        <label className="sensitivity-strip__control">
          <span>Realization: {formatPercent(realizationPercentage, 0)}</span>
          <input
            type="range"
            min={REALIZATION_MIN}
            max={REALIZATION_MAX}
            step={1}
            value={realizationPercentage}
            onChange={(event) => setRealizationPercentage(Number(event.target.value))}
          />
        </label>
      </div>

      <dl className="sensitivity-strip__metrics">
        <div>
          <dt>NPV</dt>
          <dd>{formatInr(scenarioResult.npv)}</dd>
        </div>
        <div>
          <dt>IRR</dt>
          <dd>{scenarioResult.irr === null ? "Undefined" : formatPercent(scenarioResult.irr)}</dd>
        </div>
        <div>
          <dt>Payback</dt>
          <dd>{formatYears(scenarioResult.paybackYearsFromCashFlows)}</dd>
        </div>
      </dl>
    </section>
  );
}
