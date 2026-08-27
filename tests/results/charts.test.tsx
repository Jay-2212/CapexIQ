// Edge-case coverage for the two Phase 7 chart components — the "technically correct
// but visually broken for edge values" risk docs/agent-build-plan.md's Phase 7 DoD calls
// out explicitly. Live browser QA this session only exercised one winning scenario
// (MRI, Caution -> Moderate); these tests cover the losing-scenario branches that
// weren't otherwise rendered anywhere.

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BreakEvenBar } from "../../app/charts/BreakEvenBar";
import { CashFlowChart } from "../../app/charts/CashFlowChart";
import { SensitivityStrip } from "../../app/components/SensitivityStrip";
import type { AssessmentInputs } from "../../formulas/computeAssessment";

const sensitivityInputs: AssessmentInputs = {
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

describe("BreakEvenBar", () => {
  it("renders the unreachable-break-even message instead of a bar when breakEvenUsagePerDay is null", () => {
    render(<BreakEvenBar usagePerDay={12} breakEvenUsagePerDay={null} />);

    expect(screen.getByText(/does not reach break-even at any usage level/)).toBeInTheDocument();
    expect(screen.queryByText(/uses\/day to break even/)).not.toBeInTheDocument();
  });

  it("marks the fill as not clearing break-even when usage falls short of the threshold", () => {
    const { container } = render(<BreakEvenBar usagePerDay={5} breakEvenUsagePerDay={11} />);

    const bar = container.querySelector(".break-even-bar");
    expect(bar).toHaveAttribute("data-clears", "false");
    expect(screen.getByText(/5\.0/)).toBeInTheDocument();
    expect(screen.getByText(/11\.0/)).toBeInTheDocument();
  });

  it("shows a hover tooltip with the exact value on the usage fill and hides it again on mouse-leave", () => {
    const { container } = render(<BreakEvenBar usagePerDay={5} breakEvenUsagePerDay={11} />);

    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();

    const fill = container.querySelector(".break-even-bar__fill")!;
    fireEvent.mouseEnter(fill);
    expect(screen.getByText("Expected usage")).toBeInTheDocument();
    expect(screen.getByText("5.0 / day")).toBeInTheDocument();

    fireEvent.mouseLeave(fill);
    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
  });

  it("shows the break-even tooltip on keyboard focus of the threshold marker", () => {
    const { container } = render(<BreakEvenBar usagePerDay={5} breakEvenUsagePerDay={11} />);

    const threshold = container.querySelector(".break-even-bar__threshold")!;
    fireEvent.focus(threshold);
    expect(screen.getByText("Break-even threshold")).toBeInTheDocument();
    expect(screen.getByText("11.0 / day")).toBeInTheDocument();

    fireEvent.blur(threshold);
    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
  });
});

describe("CashFlowChart", () => {
  it("renders every bar as negative when the investment never crosses zero (a losing scenario)", () => {
    const series = [-500000, -420000, -350000, -300000, -280000];
    const { container } = render(<CashFlowChart series={series} />);

    const positiveBars = container.querySelectorAll(".cash-flow-chart__bar--positive");
    const negativeBars = container.querySelectorAll(".cash-flow-chart__bar--negative");
    expect(positiveBars).toHaveLength(0);
    expect(negativeBars).toHaveLength(series.length);
    expect(container.querySelectorAll(".cash-flow-chart__axis-label")).toHaveLength(5);
    expect(container.querySelectorAll(".cash-flow-chart__axis-label")[4]).toHaveTextContent("−₹5.00 L");
    expect(container.querySelectorAll(".cash-flow-chart__axis-label")[2]).toHaveTextContent("₹0");

    // Accessible table still exposes every year's exact figure even though the
    // per-bar text labels thin out for long series.
    expect(screen.getByText("Cumulative cash flow by year")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(series.length + 1); // + header row
  });

  it("returns null for an empty series instead of rendering a broken zero-bar chart", () => {
    const { container } = render(<CashFlowChart series={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the exact-value tooltip for a bar on hover and on keyboard focus, and hides it after", () => {
    const series = [-500000, -120000, 260000];
    const { container } = render(<CashFlowChart series={series} />);

    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();

    const bars = container.querySelectorAll("rect.cash-flow-chart__bar--negative, rect.cash-flow-chart__bar--positive");
    expect(bars).toHaveLength(3);

    fireEvent.mouseEnter(bars[2]);
    expect(screen.getByText("Year 3 · cumulative position")).toBeInTheDocument();
    expect(screen.getByText("₹2,60,000")).toBeInTheDocument();
    fireEvent.mouseLeave(bars[2]);
    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();

    fireEvent.focus(bars[0]);
    expect(screen.getByText("Year 1 · cumulative position")).toBeInTheDocument();
    expect(screen.getByText("−₹5,00,000")).toBeInTheDocument();
    fireEvent.blur(bars[0]);
    expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
  });
});

describe("SensitivityStrip", () => {
  it("uses the full responsive plot width instead of letterboxing the SVG into a square", () => {
    const { container } = render(<SensitivityStrip inputs={sensitivityInputs} />);

    expect(container.querySelector(".sensitivity-strip__plot")).toHaveAttribute(
      "preserveAspectRatio",
      "none"
    );
  });
});
