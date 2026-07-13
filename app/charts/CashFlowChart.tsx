"use client";

// Phase 7 — cumulative cash-flow chart (agent-build-plan.md Phase 7, design/
// dashboard-mockup.svg's information architecture only, not its styling per the
// 2026-07-13 design gate). Pure presentation: the running-total series itself comes
// from formulas/roi.ts's cumulativeCashFlowSeries, never recomputed here
// (CONVENTIONS.md §3 — one engine for the dashboard and exports alike).

import { formatInrCompact } from "../components/formatting";

const CHART_HEIGHT = 200;
const BAR_GAP = 10;

export function CashFlowChart({
  series,
}: {
  /** One entry per year, running total starting from -initialInvestment. */
  series: number[];
}) {
  if (series.length === 0) return null;

  const maxMagnitude = Math.max(...series.map((value) => Math.abs(value)), 1);
  const zeroY = CHART_HEIGHT / 2;
  const scale = (CHART_HEIGHT / 2 - 12) / maxMagnitude;
  const barWidth = 100 / series.length;
  // Every bar always renders — only the text labels below thin out once a long
  // useful-life series (10+ years is common) would otherwise cram illegible text
  // under each bar. The full year-by-year figures stay available in the accessible
  // table below regardless of how many labels are shown here.
  const labelStride = Math.max(1, Math.ceil(series.length / 6));
  const showLabel = (index: number) =>
    index === 0 || index === series.length - 1 || index % labelStride === 0;

  return (
    <div className="cash-flow-chart">
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="cash-flow-chart__plot"
        role="img"
        aria-label="Cumulative cash flow by year, starting below zero at the initial investment and crossing to positive once the investment is recovered."
      >
        <line
          x1="0"
          y1={zeroY}
          x2="100"
          y2={zeroY}
          className="cash-flow-chart__zero-line"
        />
        {series.map((value, index) => {
          const barHeight = Math.abs(value) * scale;
          const x = index * barWidth + BAR_GAP / 4;
          const width = barWidth - BAR_GAP / 2;
          const y = value >= 0 ? zeroY - barHeight : zeroY;
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={Math.max(width, 0)}
              height={Math.max(barHeight, 1)}
              rx="1.2"
              className={value >= 0 ? "cash-flow-chart__bar--positive" : "cash-flow-chart__bar--negative"}
            />
          );
        })}
      </svg>
      <div className="cash-flow-chart__labels">
        {series.map((value, index) => (
          <div key={index} className="cash-flow-chart__label">
            {showLabel(index) && (
              <>
                <span>Y{index + 1}</span>
                <strong>{formatInrCompact(value)}</strong>
              </>
            )}
          </div>
        ))}
      </div>
      <table className="visually-hidden">
        <caption>Cumulative cash flow by year</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Cumulative position</th>
          </tr>
        </thead>
        <tbody>
          {series.map((value, index) => (
            <tr key={index}>
              <td>Year {index + 1}</td>
              <td>{formatInrCompact(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
