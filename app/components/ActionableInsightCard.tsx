"use client";

// Phase 9's automatic actionable insight — financial-model-spec.md §4 (Jay-approved
// 2026-07-07). Passive: renders nothing when actionablePriceIncreaseInsight() returns
// null, which is the expected, common result, not a fallback state to fill in.
// Reuses the existing formulas/actionableInsight.ts (built ahead of this phase) and
// formulas/sensitivity.ts's deriveScenarioAssumptions — never a second calculation
// path for the numbers it quotes.

import { Lightbulb } from "lucide-react";
import type { AssessmentInputs, AssessmentResult } from "@/formulas/computeAssessment";
import { deriveScenarioAssumptions } from "@/formulas/sensitivity";
import { actionablePriceIncreaseInsight } from "@/formulas/actionableInsight";
import { formatInr, formatPercent, formatYears } from "./formatting";

export function ActionableInsightCard({
  inputs,
  result,
}: {
  inputs: AssessmentInputs;
  result: AssessmentResult;
}) {
  const assumptions = deriveScenarioAssumptions(inputs, result);
  const insight = actionablePriceIncreaseInsight({
    assumptions,
    usefulLifeYears: inputs.usefulLifeYears,
  });

  if (!insight) return null;

  return (
    <section className="actionable-insight" aria-label="Actionable pricing insight">
      <Lightbulb aria-hidden="true" />
      <div>
        <h3>A pricing change could shorten payback</h3>
        <p>
          Increasing your per-scan charge by {formatInr(insight.priceIncreaseAmount)}{" "}
          ({formatPercent(insight.priceIncreasePercentage, 0)}) starting Year{" "}
          {insight.startYear} would improve your payback period by about{" "}
          {Math.round(insight.paybackImprovementMonths)} months (from{" "}
          {formatYears(insight.baselinePaybackYears)} to{" "}
          {formatYears(insight.scenarioPaybackYears)}).
        </p>
        <p className="actionable-insight__note">
          Estimated from a simplified scenario model — see the sensitivity view below
          for a live, adjustable comparison.
        </p>
      </div>
    </section>
  );
}
