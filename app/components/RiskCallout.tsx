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
import { deriveRiskNotes } from "./riskNotes";

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
  const notes = deriveRiskNotes({
    outlook,
    usagePerDay,
    breakEvenUsagePerDay,
    workingCapitalPeakGap,
    workingCapitalPeakGapMonth,
  });

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
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
