// ActionableInsightCard renders nothing when actionablePriceIncreaseInsight() returns
// null (the common, expected case) and otherwise quotes its own before/after numbers
// verbatim — this component owns no calculation, only presentation.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ActionableInsightCard } from "../../app/components/ActionableInsightCard";
import { computeAssessment } from "../../formulas/computeAssessment";
import type { AssessmentInputs } from "../../formulas/computeAssessment";

const qualifyingInputs: AssessmentInputs = {
  purchaseCost: 4_000_000,
  installationCost: 0,
  usagePerDay: 10,
  workingDaysPerMonth: 25,
  payerMix: [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 1000, realizationPercentage: 100, collectionDelayDays: 0 },
  ],
  variableCostPerUse: 50,
  fixedCostPerMonth: 100_000,
  financing: { type: "cash" },
  maintenance: { warrantyYears: 10, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 0 },
  usefulLifeYears: 10,
  discountRate: 10,
  salvageValuePercentage: 0,
};

describe("ActionableInsightCard", () => {
  it("renders a suggestion when a qualifying price increase exists", () => {
    const result = computeAssessment(qualifyingInputs);
    render(<ActionableInsightCard inputs={qualifyingInputs} result={result} />);

    expect(screen.getByText(/A pricing change could shorten payback/)).toBeInTheDocument();
    expect(screen.getByText(/Increasing your per-scan charge/)).toBeInTheDocument();
  });

  it("renders nothing when no price increase clears the 6-month materiality gate", () => {
    const smallInputs: AssessmentInputs = { ...qualifyingInputs, purchaseCost: 100_000 };
    const result = computeAssessment(smallInputs);
    const { container } = render(<ActionableInsightCard inputs={smallInputs} result={result} />);

    expect(container).toBeEmptyDOMElement();
  });
});
