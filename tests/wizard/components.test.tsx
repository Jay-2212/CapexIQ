// Component-level coverage for interactive behaviors this session couldn't verify in
// a real browser (no working Chrome extension connection — see ISSUES.md ISS-21).
// Exercises actual DOM events (click, type) against real rendered components, not
// just the underlying reducer/validation functions.

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { WizardProvider, useWizard } from "../../app/forms/WizardContext";
import { NumberField } from "../../app/components/NumberField";
import { StepNav } from "../../app/components/StepNav";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function SelectMri() {
  const { dispatch } = useWizard();
  return (
    <button onClick={() => dispatch({ type: "SELECT_EQUIPMENT_CATEGORY", category: "MRI" })}>
      select mri
    </button>
  );
}

describe("NumberField — the 'Typical' tag (ux-product-spec.md §6)", () => {
  it("shows the Typical tag for a sourced-default value until the user edits it, then hides it", () => {
    render(
      <WizardProvider>
        <SelectMri />
        <NumberField path="basic.warrantyYears" />
      </WizardProvider>
    );

    fireEvent.click(screen.getByText("select mri"));
    // MRI's warrantyYears default (5) is sourced -> shown as "Typical" until edited.
    expect(screen.getByText("Typical")).toBeInTheDocument();
    expect(screen.getByLabelText(/Warranty period/)).toHaveValue(5);

    fireEvent.change(screen.getByLabelText(/Warranty period/), { target: { value: "6" } });
    expect(screen.queryByText("Typical")).not.toBeInTheDocument();
  });
});

describe("StepNav — disabled-\"Next\" moves focus to the first invalid field (audit F7)", () => {
  it("clicking Next on an incomplete step focuses the first missing required field instead of navigating", () => {
    render(
      <WizardProvider>
        <NumberField path="basic.purchaseCost" />
        <NumberField path="basic.installationCost" />
        <StepNav step="investment" complete={false} backHref={null} nextHref="/assess/usage" />
      </WizardProvider>
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(nextButton);

    const purchaseCostInput = screen.getByLabelText(/Purchase cost/);
    expect(purchaseCostInput).toHaveFocus();
  });
});
