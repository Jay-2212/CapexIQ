// Edge-case coverage for the two Phase 7 chart components — the "technically correct
// but visually broken for edge values" risk agent-build-plan.md's Phase 7 DoD calls
// out explicitly. Live browser QA this session only exercised one winning scenario
// (MRI, Caution -> Moderate); these tests cover the losing-scenario branches that
// weren't otherwise rendered anywhere.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BreakEvenBar } from "../../app/charts/BreakEvenBar";
import { CashFlowChart } from "../../app/charts/CashFlowChart";

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
});

describe("CashFlowChart", () => {
  it("renders every bar as negative when the investment never crosses zero (a losing scenario)", () => {
    const series = [-500000, -420000, -350000, -300000, -280000];
    const { container } = render(<CashFlowChart series={series} />);

    const positiveBars = container.querySelectorAll(".cash-flow-chart__bar--positive");
    const negativeBars = container.querySelectorAll(".cash-flow-chart__bar--negative");
    expect(positiveBars).toHaveLength(0);
    expect(negativeBars).toHaveLength(series.length);

    // Accessible table still exposes every year's exact figure even though the
    // per-bar text labels thin out for long series.
    expect(screen.getByText("Cumulative cash flow by year")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(series.length + 1); // + header row
  });

  it("returns null for an empty series instead of rendering a broken zero-bar chart", () => {
    const { container } = render(<CashFlowChart series={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
