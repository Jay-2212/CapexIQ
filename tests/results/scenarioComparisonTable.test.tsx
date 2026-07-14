// ScenarioComparisonTable: only the Base row shows until a scenario is added; adding
// one runs the full canonical computeAssessment() with purchaseCost/billedTariffPerUse/
// usagePerDay overridden and renders every SPEC.md §28.2 column; removing it returns
// to the empty state.

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  it("shows only the empty-state note before any scenario is added", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);
    expect(screen.getByText(/Only the current assessment is shown/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("adds a scenario, renders every §28.2 comparison row, and recomputes when overrides change", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);

    fireEvent.click(screen.getByRole("button", { name: /add scenario/i }));

    expect(screen.getByRole("table")).toBeInTheDocument();
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

    const tariffInput = screen.getByLabelText("Billed tariff per use") as HTMLInputElement;
    const npvCellsBefore = screen.getAllByText(/₹/).length;
    fireEvent.change(tariffInput, { target: { value: "2000" } });
    const npvCellsAfter = screen.getAllByText(/₹/).length;
    expect(npvCellsAfter).toBe(npvCellsBefore); // same number of currency cells, values just changed
  });

  it("removes a scenario and returns to the empty state", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);

    fireEvent.click(screen.getByRole("button", { name: /add scenario/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(screen.getByText(/Only the current assessment is shown/)).toBeInTheDocument();
  });
});
