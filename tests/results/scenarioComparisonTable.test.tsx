// ScenarioComparisonTable always shows the approved lower/base/higher cases in a
// stable three-column layout, with every column running through the canonical engine.

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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
  it("renders an editable lower/base/higher summary and hides detail rows until expanded", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);
    expect(screen.getAllByRole("table")[0]).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add scenario/i })).not.toBeInTheDocument();

    const summaryTable = document.querySelector(".scenario-table__summary") as HTMLElement;
    const headings = Array.from(within(summaryTable).getAllByRole("columnheader")).map(
      (heading) => heading.textContent
    );
    expect(headings).toEqual([
      "Metric",
      "Lower assumptionEditable · starts at −20%",
      "Base caseCurrent assessment · read-only",
      "Higher assumptionEditable · starts at +20%",
    ]);

    for (const label of ["Purchase cost (Cr)", "Billed tariff per use", "Usage per day", "Break-even usage", "Risk level"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(document.querySelector(".scenario-table__details")).not.toHaveAttribute("open");
    expect(screen.getByText("₹800")).toBeInTheDocument();
    expect(screen.getByText("10.0")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Lower assumption billed tariff per use" })).toHaveValue(640);
    expect(screen.getByRole("spinbutton", { name: "Higher assumption billed tariff per use" })).toHaveValue(960);
    expect(screen.getByRole("spinbutton", { name: "Lower assumption usage per day" })).toHaveValue(8);
    expect(screen.getByRole("spinbutton", { name: "Higher assumption usage per day" })).toHaveValue(12);
    expect(screen.queryByRole("spinbutton", { name: /Base case/ })).not.toBeInTheDocument();
  });

  it("recalculates an edited alternative and exposes the remaining metrics on demand", () => {
    render(<ScenarioComparisonTable inputs={inputs} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "Lower assumption billed tariff per use" }), {
      target: { value: "700" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Lower assumption usage per day" }), {
      target: { value: "9" },
    });

    expect(screen.getByRole("spinbutton", { name: "Lower assumption billed tariff per use" })).toHaveValue(700);
    expect(screen.getByRole("spinbutton", { name: "Lower assumption usage per day" })).toHaveValue(9);

    fireEvent.click(screen.getByText("Look at all the details"));
    expect(screen.getByText("NPV")).toBeInTheDocument();
    expect(screen.getByText("IRR")).toBeInTheDocument();
    expect(screen.getByText("Working capital gap")).toBeInTheDocument();
  });

  it("cleanly rounds fractional scenario defaults to avoid repeating decimals", () => {
    const fractionalInputs: AssessmentInputs = {
      ...inputs,
      usagePerDay: 3,
      payerMix: [
        { payerName: "cash", shareOfVolume: 100, billedTariff: 2222, realizationPercentage: 100, collectionDelayDays: 0 },
      ],
    };

    render(<ScenarioComparisonTable inputs={fractionalInputs} />);
    expect(screen.getByRole("spinbutton", { name: "Lower assumption billed tariff per use" })).toHaveValue(1777.6);
    expect(screen.getByRole("spinbutton", { name: "Higher assumption billed tariff per use" })).toHaveValue(2666.4);
    expect(screen.getByRole("spinbutton", { name: "Lower assumption usage per day" })).toHaveValue(2.4);
    expect(screen.getByRole("spinbutton", { name: "Higher assumption usage per day" })).toHaveValue(3.6);
  });
});
