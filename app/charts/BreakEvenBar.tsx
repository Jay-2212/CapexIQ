"use client";

// Phase 7 — break-even comparison bar. computeAssessment.ts already resolves the
// break-even usage threshold (formulas/breakEven.ts); this only lays out the two
// already-computed numbers (expected usage vs. the break-even threshold) as a bullet
// comparison, never re-deriving the threshold itself (CONVENTIONS.md §3).

import { useState } from "react";
import { formatNumber } from "../components/formatting";
import { clampTooltipPercent } from "./chartTooltipUtils";

export function BreakEvenBar({
  usagePerDay,
  breakEvenUsagePerDay,
}: {
  usagePerDay: number;
  breakEvenUsagePerDay: number | null;
}) {
  const [activeMark, setActiveMark] = useState<"usage" | "break-even" | null>(null);

  if (breakEvenUsagePerDay === null) {
    return (
      <div className="break-even-bar break-even-bar--unreachable">
        <p>
          At the entered cost and revenue assumptions, this equipment does not reach
          break-even at any usage level.
        </p>
      </div>
    );
  }

  const scaleMax = Math.max(Math.max(usagePerDay, breakEvenUsagePerDay) * 1.2, 1);
  const usagePct = Math.min(100, (usagePerDay / scaleMax) * 100);
  const breakEvenPct = Math.min(100, (breakEvenUsagePerDay / scaleMax) * 100);
  const clearsBreakEven = usagePerDay >= breakEvenUsagePerDay;
  const scaleTicks = [0, scaleMax / 2, scaleMax];

  return (
    <div
      className="break-even-bar"
      data-clears={clearsBreakEven}
      aria-label={`Expected usage ${formatNumber(usagePerDay, 1)} per day compared with break-even usage ${formatNumber(breakEvenUsagePerDay, 1)} per day`}
    >
      <div className="break-even-bar__track">
        <div
          className="break-even-bar__fill"
          style={{ width: `${usagePct}%` }}
          tabIndex={0}
          onMouseEnter={() => setActiveMark("usage")}
          onMouseLeave={() => setActiveMark((current) => (current === "usage" ? null : current))}
          onFocus={() => setActiveMark("usage")}
          onBlur={() => setActiveMark((current) => (current === "usage" ? null : current))}
        />
        <div
          className="break-even-bar__threshold"
          style={{ left: `${breakEvenPct}%` }}
          tabIndex={0}
          onMouseEnter={() => setActiveMark("break-even")}
          onMouseLeave={() => setActiveMark((current) => (current === "break-even" ? null : current))}
          onFocus={() => setActiveMark("break-even")}
          onBlur={() => setActiveMark((current) => (current === "break-even" ? null : current))}
        />
        {activeMark === "usage" && (
          <div className="chart-tooltip" data-visible="true" style={{ left: `${clampTooltipPercent(usagePct)}%`, top: 0 }}>
            <strong>{formatNumber(usagePerDay, 1)} / day</strong>
            <span>Expected usage</span>
          </div>
        )}
        {activeMark === "break-even" && (
          <div className="chart-tooltip" data-visible="true" style={{ left: `${clampTooltipPercent(breakEvenPct)}%`, top: 0 }}>
            <strong>{formatNumber(breakEvenUsagePerDay, 1)} / day</strong>
            <span>Break-even threshold</span>
          </div>
        )}
      </div>
      <div className="break-even-bar__scale" aria-hidden="true">
        {scaleTicks.map((tick) => (
          <span key={tick}>{formatNumber(tick, 1)}</span>
        ))}
      </div>
      <div className="break-even-bar__legend">
        <span>
          <strong>{formatNumber(usagePerDay, 1)}</strong> expected uses/day
        </span>
        <span>
          <strong>{formatNumber(breakEvenUsagePerDay, 1)}</strong> uses/day to break even
        </span>
      </div>
    </div>
  );
}
