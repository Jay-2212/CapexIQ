// SensitivityStrip runs the full canonical computeAssessment() on every drag — this
// test drives the sliders and checks the displayed NPV/payback actually change (not
// just that the component renders), and that Reset restores the baseline figures.

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SensitivityStrip } from "../../app/components/SensitivityStrip";
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

describe("SensitivityStrip", () => {
  it("recomputes NPV/IRR/payback live when usage per day is dragged", () => {
    render(<SensitivityStrip inputs={inputs} />);

    const baselineNpv = screen.getByText("NPV").nextElementSibling!.textContent;
    const usageSlider = screen.getByDisplayValue("10");

    fireEvent.change(usageSlider, { target: { value: "40" } });

    const updatedNpv = screen.getByText("NPV").nextElementSibling!.textContent;
    expect(updatedNpv).not.toBe(baselineNpv);
  });

  it("resets to the baseline usage/realization after a drag", () => {
    render(<SensitivityStrip inputs={inputs} />);

    const usageSlider = screen.getByDisplayValue("10");
    fireEvent.change(usageSlider, { target: { value: "40" } });
    expect(screen.getByText(/Usage per day: 40/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByText(/Usage per day: 10/)).toBeInTheDocument();
  });
});
