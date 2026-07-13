// RiskCallout turns already-computed InvestmentOutlookResult sub-scores into plain
// language — these tests cover the 55-point threshold branching (reused from
// investmentOutlookScore.ts's own "Moderate" band floor) since that's real logic this
// component owns, unlike BreakEvenBar/CashFlowChart which just lay out numbers.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { RiskCallout } from "../../app/components/RiskCallout";
import type { InvestmentOutlookResult } from "../../formulas/investmentOutlookScore";

function outlook(subScores: Partial<InvestmentOutlookResult["subScores"]>): InvestmentOutlookResult {
  return {
    score: 70,
    unroundedScore: 70,
    band: "Moderate",
    driver: "returnStrength",
    driverFraming: "strength",
    subScores: {
      returnStrength: 80,
      speedToPayback: 80,
      financingResilience: 80,
      operationalMarginOfSafety: 80,
      ...subScores,
    },
  };
}

describe("RiskCallout", () => {
  it("shows the reassuring 'no major risk flags' state when every sub-score clears the Moderate floor and there's no working-capital gap", () => {
    render(
      <RiskCallout
        outlook={outlook({})}
        usagePerDay={20}
        breakEvenUsagePerDay={10}
        workingCapitalPeakGap={0}
        workingCapitalPeakGapMonth={0}
      />
    );

    expect(screen.getByText("No major risk flags")).toBeInTheDocument();
    expect(screen.queryByText("Key risk notes")).not.toBeInTheDocument();
  });

  it("flags a utilization risk note when operationalMarginOfSafety falls below 55, naming the break-even gap", () => {
    render(
      <RiskCallout
        outlook={outlook({ operationalMarginOfSafety: 40 })}
        usagePerDay={12}
        breakEvenUsagePerDay={11}
        workingCapitalPeakGap={0}
        workingCapitalPeakGapMonth={0}
      />
    );

    expect(screen.getByText("Key risk notes")).toBeInTheDocument();
    expect(screen.getByText(/Utilization risk/)).toBeInTheDocument();
    expect(screen.getByText(/11\.0 uses\/day/)).toBeInTheDocument();
  });

  it("describes an unreachable break-even without a numeric threshold when breakEvenUsagePerDay is null", () => {
    render(
      <RiskCallout
        outlook={outlook({ operationalMarginOfSafety: 0 })}
        usagePerDay={12}
        breakEvenUsagePerDay={null}
        workingCapitalPeakGap={0}
        workingCapitalPeakGapMonth={0}
      />
    );

    expect(screen.getByText(/never reach break-even/)).toBeInTheDocument();
  });

  it("skips the financing note when financingResilience is null (cash purchase, no financing to score)", () => {
    render(
      <RiskCallout
        outlook={outlook({ financingResilience: null })}
        usagePerDay={20}
        breakEvenUsagePerDay={10}
        workingCapitalPeakGap={0}
        workingCapitalPeakGapMonth={0}
      />
    );

    expect(screen.queryByText(/financing risk/)).not.toBeInTheDocument();
    expect(screen.getByText("No major risk flags")).toBeInTheDocument();
  });

  it("adds a cash-flow timing note whenever workingCapitalPeakGap is positive, independent of sub-scores", () => {
    render(
      <RiskCallout
        outlook={outlook({})}
        usagePerDay={20}
        breakEvenUsagePerDay={10}
        workingCapitalPeakGap={1800000}
        workingCapitalPeakGapMonth={3}
      />
    );

    expect(screen.getByText("Key risk notes")).toBeInTheDocument();
    expect(screen.getByText(/cash-flow timing risk/i)).toBeInTheDocument();
    expect(screen.getByText(/month 4/)).toBeInTheDocument();
  });
});
