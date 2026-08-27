// ScenarioComparisonTable always shows the approved lower/base/higher cases in a
// stable three-column layout, with every column running through the canonical engine.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ScenarioComparisonTable } from "../../app/components/ScenarioComparisonTable";
import type { AssessmentInputs } from "../../formulas/computeAssessment";

const inputs: AssessmentInputs = {
  purchaseCost: 2_000_000,
  installationCost: 100_000,
  usagePerDay: 10,
  workingDaysPerMonth: 25,
  payerMix: [
    { payerName: "cash", shareOfVolume: 100, billedTariff: 800, realizationPercentage: 100, collectionDelayDays: 0 },
  ],
  variableCostPerUse: 50,
  fixedCostPerMonth: 45_000,
  financing: { type: "cash" },
  maintenance: { warrantyYears: 8, cmcYears: 0, cmcAnnualCost: 0, amcAnnualCost: 0 },
  usefulLifeYears: 8,
  discountRate: 12.5,
  salvageValuePercentage: 5,
};

describe("ScenarioComparisonTable", () => {
  it("renders lower, base, and higher assumptions side by side", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add scenario/i })).not.toBeInTheDocument();

    const headings = Array.from(screen.getAllByRole("columnheader")).map(
      (heading) => heading.textContent
    );
    expect(headings).toEqual([
      "Assumption",
      "Lower assumption−20% tariff + usage",
      "Base caseCurrent assessment",
      "Higher assumption+20% tariff + usage",
    ]);

    for (const label of [
      "Capex",
      "Monthly billed revenue",
      "Monthly realized revenue",
      "Monthly operating surplus",
      "Payback",
      "ROI",
      "NPV",
      "IRR",
      "Break-even usage",
      "Working capital gap",
      "Risk level",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("₹640")).toBeInTheDocument();
    expect(screen.getByText("₹800")).toBeInTheDocument();
    expect(screen.getByText("₹960")).toBeInTheDocument();
    expect(screen.getByText("8.0")).toBeInTheDocument();
    expect(screen.getByText("10.0")).toBeInTheDocument();
    expect(screen.getByText("12.0")).toBeInTheDocument();
  });
});
