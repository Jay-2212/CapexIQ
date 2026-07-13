"use client";

// Phase 7 — break-even comparison bar. computeAssessment.ts already resolves the
// break-even usage threshold (formulas/breakEven.ts); this only lays out the two
// already-computed numbers (expected usage vs. the break-even threshold) as a bullet
// comparison, never re-deriving the threshold itself (CONVENTIONS.md §3).

import { formatNumber } from "../components/formatting";

export function BreakEvenBar({
  usagePerDay,
  breakEvenUsagePerDay,
}: {
  usagePerDay: number;
  breakEvenUsagePerDay: number | null;
}) {
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

  const scaleMax = Math.max(usagePerDay, breakEvenUsagePerDay) * 1.2;
  const usagePct = Math.min(100, (usagePerDay / scaleMax) * 100);
  const breakEvenPct = Math.min(100, (breakEvenUsagePerDay / scaleMax) * 100);
  const clearsBreakEven = usagePerDay >= breakEvenUsagePerDay;

  return (
    <div className="break-even-bar" data-clears={clearsBreakEven}>
      <div className="break-even-bar__track">
        <div className="break-even-bar__fill" style={{ width: `${usagePct}%` }} />
        <div
          className="break-even-bar__threshold"
          style={{ left: `${breakEvenPct}%` }}
          aria-hidden="true"
        />
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
