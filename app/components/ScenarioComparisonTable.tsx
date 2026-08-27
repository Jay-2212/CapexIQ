"use client";

// Phase 9's discrete scenario comparison — SPEC.md §28. The three columns are
// intentionally fixed and readable: lower assumptions on the left, the current
// assessment in the middle, and higher assumptions on the right. Both alternatives
// use the approved ±20% change to billed tariff and usage, then run through the same
// canonical assessment engine as the main results page.

import type { ReactNode } from "react";
import { computeAssessment, type AssessmentInputs, type AssessmentResult } from "@/formulas/computeAssessment";
import {
  applyScenarioPreset,
  SCENARIO_PRESET_MULTIPLIER,
  weightedAverageBilledTariff,
  type ScenarioPreset,
} from "@/formulas/assessmentOverrides";
import { formatInr, formatPercent, formatYears, formatNumber } from "./formatting";

const CRORE = 10_000_000;

interface ScenarioDisplay {
  purchaseCostCr: number;
  billedTariffPerUse: number;
  usagePerDay: number;
}

interface ScenarioColumn {
  id: ScenarioPreset | "base";
  name: string;
  note: string;
  display: ScenarioDisplay;
  result: AssessmentResult;
}

function displayFor(inputs: AssessmentInputs, preset?: ScenarioPreset): ScenarioDisplay {
  const multiplier = preset ? SCENARIO_PRESET_MULTIPLIER[preset] : 1;
  return {
    purchaseCostCr: inputs.purchaseCost / CRORE,
    billedTariffPerUse: weightedAverageBilledTariff(inputs) * multiplier,
    usagePerDay: inputs.usagePerDay * multiplier,
  };
}

export function ScenarioComparisonTable({ inputs }: { inputs: AssessmentInputs }) {
  const columns: ScenarioColumn[] = [
    {
      id: "lower",
      name: "Lower assumption",
      note: "−20% tariff + usage",
      display: displayFor(inputs, "lower"),
      result: computeAssessment(applyScenarioPreset(inputs, "lower")),
    },
    {
      id: "base",
      name: "Base case",
      note: "Current assessment",
      display: displayFor(inputs),
      result: computeAssessment(inputs),
    },
    {
      id: "higher",
      name: "Higher assumption",
      note: "+20% tariff + usage",
      display: displayFor(inputs, "higher"),
      result: computeAssessment(applyScenarioPreset(inputs, "higher")),
    },
  ];

  const rows: Array<{
    label: string;
    divider?: boolean;
    value: (column: ScenarioColumn) => ReactNode;
  }> = [
    {
      label: "Purchase cost (Cr)",
      value: (column) => formatNumber(column.display.purchaseCostCr, 2),
    },
    {
      label: "Billed tariff per use",
      value: (column) => formatInr(column.display.billedTariffPerUse),
    },
    {
      label: "Usage per day",
      value: (column) => formatNumber(column.display.usagePerDay, 1),
    },
    {
      label: "Capex",
      divider: true,
      value: (column) => formatInr(column.result.initialInvestment),
    },
    {
      label: "Monthly billed revenue",
      value: (column) => formatInr(column.result.monthlyBilledRevenue),
    },
    {
      label: "Monthly realized revenue",
      value: (column) => formatInr(column.result.monthlyRealizedRevenue),
    },
    {
      label: "Monthly operating surplus",
      value: (column) => formatInr(column.result.annualOperatingSurplus / 12),
    },
    {
      label: "Cash flow after EMI (monthly)",
      value: (column) =>
        formatInr((column.result.annualNetCashFlowsAfterFinancing[0] ?? 0) / 12),
    },
    {
      label: "Payback",
      value: (column) => formatYears(column.result.paybackYearsFromCashFlows),
    },
    {
      label: "ROI",
      value: (column) => formatPercent(column.result.roiCashFlow),
    },
    {
      label: "NPV",
      value: (column) => formatInr(column.result.npv),
    },
    {
      label: "IRR",
      value: (column) =>
        column.result.irr === null ? "Undefined" : formatPercent(column.result.irr),
    },
    {
      label: "Break-even usage",
      value: (column) =>
        column.result.breakEvenUsagePerDay === null
          ? "Not achievable"
          : `${formatNumber(column.result.breakEvenUsagePerDay, 1)} / day`,
    },
    {
      label: "Working capital gap",
      value: (column) => formatInr(column.result.workingCapitalPeakGap),
    },
    {
      label: "Risk level",
      value: (column) => (
        <span
          className="scenario-table__band"
          data-band={column.result.investmentOutlook.band}
        >
          {column.result.investmentOutlook.band}
        </span>
      ),
    },
  ];

  return (
    <section className="scenario-table" aria-label="Scenario comparison">
      <div className="scenario-table__heading">
        <div>
          <span className="narrative-intro__eyebrow">Compare options</span>
          <h2>Compare the base case with lower or higher demand assumptions</h2>
          <p className="scenario-table__explanation">
            Lower and higher assumptions change billed tariff and usage per day by
            20%. Together, that moves revenue to roughly 64% or 144% of the base
            case before costs.
          </p>
        </div>
      </div>

      <div className="scenario-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Assumption</th>
              {columns.map((column) => (
                <th key={column.id} scope="col">
                  <div className="scenario-table__column-head" data-scenario={column.id}>
                    <strong>{column.name}</strong>
                    <small>{column.note}</small>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.divider ? "scenario-table__divider" : undefined}>
                <th scope="row">{row.label}</th>
                {columns.map((column) => (
                  <td key={column.id}>{row.value(column)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
