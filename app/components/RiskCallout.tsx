"use client";

// Phase 7 — risk callout. Every number here is read directly off AssessmentResult /
// InvestmentOutlookResult (formulas/investmentOutlookScore.ts, formulas/
// workingCapitalPeak.ts) — this only turns already-computed sub-scores into plain
// language, never a second scoring pass (CONVENTIONS.md §3). The 55-point threshold
// below reuses investmentOutlookScore.ts's own "Moderate" floor rather than inventing
// a separate cutoff, so a sub-score is only called out here when it would itself pull
// the overall band down out of "Strong."

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { InvestmentOutlookResult } from "@/formulas/investmentOutlookScore";
import { formatInrCompact, formatNumber } from "./formatting";

const CAUTION_FLOOR = 55;

function financingNote(financingResilience: number | null): string | null {
  if (financingResilience === null || financingResilience >= CAUTION_FLOOR) return null;
  return "financing risk — the loan or lease payment leaves a thin cash cushion in the months it's due";
}

function utilizationNote(
  operationalMarginOfSafety: number,
  usagePerDay: number,
  breakEvenUsagePerDay: number | null
): string | null {
  if (operationalMarginOfSafety >= CAUTION_FLOOR) return null;
  if (breakEvenUsagePerDay === null) {
    return "utilization risk — the entered cost and revenue assumptions never reach break-even";
  }
  return `utilization risk — profitability is sensitive to daily volume; if usage falls below ${formatNumber(
    breakEvenUsagePerDay,
    1
  )} uses/day (expected: ${formatNumber(usagePerDay, 1)}), the investment may not break even within its useful life`;
}

function returnNote(returnStrength: number): string | null {
  if (returnStrength >= CAUTION_FLOOR) return null;
  return "return risk — the return implied by these cash flows is close to or below the discount rate used to evaluate it";
}

function speedNote(speedToPayback: number): string | null {
  if (speedToPayback >= CAUTION_FLOOR) return null;
  return "payback risk — recovering the initial commitment takes a large share of the equipment's useful life";
}

export function RiskCallout({
  outlook,
  usagePerDay,
  breakEvenUsagePerDay,
  workingCapitalPeakGap,
  workingCapitalPeakGapMonth,
}: {
  outlook: InvestmentOutlookResult;
  usagePerDay: number;
  breakEvenUsagePerDay: number | null;
  workingCapitalPeakGap: number;
  workingCapitalPeakGapMonth: number;
}) {
  const notes = [
    returnNote(outlook.subScores.returnStrength),
    speedNote(outlook.subScores.speedToPayback),
    financingNote(outlook.subScores.financingResilience),
    utilizationNote(outlook.subScores.operationalMarginOfSafety, usagePerDay, breakEvenUsagePerDay),
  ].filter((note): note is string => note !== null);

  if (workingCapitalPeakGap > 0) {
    notes.push(
      `cash-flow timing risk — collections lag enough to create a working-capital gap of approximately ${formatInrCompact(
        workingCapitalPeakGap
      )} around month ${workingCapitalPeakGapMonth + 1}`
    );
  }

  if (notes.length === 0) {
    return (
      <div className="risk-callout risk-callout--clear">
        <CheckCircle2 aria-hidden="true" size={18} />
        <div>
          <h3>No major risk flags</h3>
          <p>Every scored dimension of this assessment sits at or above the "Moderate" floor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-callout">
      <AlertTriangle aria-hidden="true" size={18} />
      <div>
        <h3>Key risk notes</h3>
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{note.charAt(0).toUpperCase() + note.slice(1)}.</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
