"use client";

// Phase 9's continuous sensitivity view (docs/agent-build-plan.md): drag usage/day
// or realization % and see the canonical NPV/IRR/payback update live. The usage
// control is also rendered as a plotted scenario-consumption marker, so the user
// can read the direction and scale of the change instead of seeing numbers move in
// isolation. All what-if values stay local to this component.

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { computeAssessment, type AssessmentInputs } from "@/formulas/computeAssessment";
import {
  applyAssessmentOverrides,
  weightedAverageRealization,
} from "@/formulas/assessmentOverrides";
import { formatInr, formatInrCompact, formatPercent, formatYears, formatNumber } from "./formatting";

const USAGE_MIN = 0;
const USAGE_MAX = 50;
const REALIZATION_MIN = 0;
const REALIZATION_MAX = 100;
const PLOT_LEFT = 5;
const PLOT_RIGHT = 95;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 82;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
  const plotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setUsagePerDay(baselineUsage);
    setRealizationPercentage(baselineRealization);
  }, [baselineUsage, baselineRealization]);

  const scenarioResult = useMemo(
    () =>
      computeAssessment(
        applyAssessmentOverrides(inputs, { usagePerDay, realizationPercentage })
      ),
    [inputs, usagePerDay, realizationPercentage]
  );

  const usageSeries = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => {
        const usage = index * 5;
        const result = computeAssessment(
          applyAssessmentOverrides(inputs, {
            usagePerDay: usage,
            realizationPercentage,
          })
        );
        return { usage, npv: result.npv };
      }),
    [inputs, realizationPercentage]
  );

  const plot = useMemo(() => {
    const values = usageSeries.map((point) => point.npv);
    const minimum = Math.min(...values, scenarioResult.npv);
    const maximum = Math.max(...values, scenarioResult.npv);
    const spread = Math.max(maximum - minimum, 1);
    const domainMin = minimum - spread * 0.1;
    const domainMax = maximum + spread * 0.1;
    const xForUsage = (usage: number) =>
      PLOT_LEFT + (clamp(usage, USAGE_MIN, USAGE_MAX) / USAGE_MAX) * (PLOT_RIGHT - PLOT_LEFT);
    const yForNpv = (npv: number) =>
      PLOT_BOTTOM -
      ((npv - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP);
    const points = usageSeries.map((point) => ({
      x: xForUsage(point.usage),
      y: yForNpv(point.npv),
    }));
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const zeroY = domainMin <= 0 && domainMax >= 0 ? yForNpv(0) : null;
    return {
      path,
      currentX: xForUsage(usagePerDay),
      currentY: yForNpv(scenarioResult.npv),
      zeroY,
    };
  }, [scenarioResult.npv, usagePerDay, usageSeries]);

  const setUsageFromPointer = (clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setUsagePerDay(Math.round(ratio * (USAGE_MAX - USAGE_MIN) + USAGE_MIN));
  };

  const isAtBaseline =
    usagePerDay === baselineUsage && realizationPercentage === baselineRealization;

  return (
    <section className="sensitivity-strip" aria-label="Sensitivity view">
      <div className="sensitivity-strip__heading">
        <div>
          <span className="narrative-intro__eyebrow">What if?</span>
          <h2>See how demand changes the investment case</h2>
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

      <div className="sensitivity-strip__chart-heading">
        <div>
          <strong>Scenario consumption</strong>
          <span>NPV across usage per day at the selected realization</span>
        </div>
        <output aria-live="polite">
          {formatNumber(usagePerDay, 1)} uses/day · {formatInrCompact(scenarioResult.npv)} NPV
        </output>
      </div>
      <div className="sensitivity-strip__plot-wrap">
        <svg
          ref={plotRef}
          className="sensitivity-strip__plot"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Scenario consumption sensitivity. Current usage is ${formatNumber(usagePerDay, 1)} per day and current NPV is ${formatInr(scenarioResult.npv)}. Click or drag across the chart to change usage.`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setUsageFromPointer(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              setUsageFromPointer(event.clientX);
            }
          }}
        >
          <line x1={PLOT_LEFT} y1="27" x2={PLOT_RIGHT} y2="27" className="sensitivity-strip__grid-line" />
          <line x1={PLOT_LEFT} y1="54" x2={PLOT_RIGHT} y2="54" className="sensitivity-strip__grid-line" />
          {plot.zeroY !== null && (
            <line x1={PLOT_LEFT} y1={plot.zeroY} x2={PLOT_RIGHT} y2={plot.zeroY} className="sensitivity-strip__zero-line" />
          )}
          <path d={plot.path} className="sensitivity-strip__line" />
          <circle
            cx={plot.currentX}
            cy={plot.currentY}
            r="3.2"
            className="sensitivity-strip__marker"
            aria-hidden="true"
          />
        </svg>
        <div className="sensitivity-strip__plot-hint">Click or drag the line to change scenario consumption</div>
      </div>
      <div className="sensitivity-strip__axis" aria-hidden="true">
        <span>0 uses/day</span>
        <span>25 uses/day</span>
        <span>50 uses/day</span>
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
            aria-label="Scenario consumption per day"
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
            aria-label="Revenue realization percentage"
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
