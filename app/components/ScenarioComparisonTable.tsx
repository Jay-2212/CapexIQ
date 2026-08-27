"use client";

// Phase 9's discrete scenario comparison — SPEC.md §28. The three columns are
// intentionally fixed and readable: lower assumptions on the left, the current
// assessment in the middle, and higher assumptions on the right. The alternatives
// start at the approved ±20% preset, but their demand assumptions can be edited
// without changing the base assessment.

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { computeAssessment, type AssessmentInputs, type AssessmentResult } from "@/formulas/computeAssessment";
import {
  applyAssessmentOverrides,
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

interface EditableScenario {
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

function defaultEditableScenarios(
  baseTariff: number,
  baseUsage: number
): Record<ScenarioPreset, EditableScenario> {
  return {
    lower: {
      billedTariffPerUse: baseTariff * SCENARIO_PRESET_MULTIPLIER.lower,
      usagePerDay: baseUsage * SCENARIO_PRESET_MULTIPLIER.lower,
    },
    higher: {
      billedTariffPerUse: baseTariff * SCENARIO_PRESET_MULTIPLIER.higher,
      usagePerDay: baseUsage * SCENARIO_PRESET_MULTIPLIER.higher,
    },
  };
}

function editableNote(id: ScenarioPreset | "base"): string {
  if (id === "base") return "Current assessment · read-only";
  const percentage = Math.round(Math.abs(SCENARIO_PRESET_MULTIPLIER[id] - 1) * 100);
  return `Editable · starts at ${id === "lower" ? "−" : "+"}${percentage}%`;
}

function ScenarioEditor({
  ariaLabel,
  value,
  suffix,
  step,
  onChange,
}: {
  ariaLabel: string;
  value: number;
  suffix: string;
  step: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="scenario-table__editor">
      <span className="visually-hidden">{ariaLabel}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={onChange}
      />
      <small>{suffix}</small>
    </label>
  );
}

export function ScenarioComparisonTable({ inputs }: { inputs: AssessmentInputs }) {
  const baseTariff = weightedAverageBilledTariff(inputs);
  const baseUsage = inputs.usagePerDay;
  const defaults = useMemo(
    () => defaultEditableScenarios(baseTariff, baseUsage),
    [baseTariff, baseUsage]
  );
  const [editableScenarios, setEditableScenarios] = useState(defaults);

  useEffect(() => {
    setEditableScenarios(defaults);
  }, [defaults]);

  const updateScenario = (
    id: ScenarioPreset,
    field: keyof EditableScenario,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.valueAsNumber;
    if (!Number.isFinite(value)) return;
    setEditableScenarios((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: Math.max(0, value),
      },
    }));
  };

  const baseDisplay = useMemo(
    () => ({
      purchaseCostCr: inputs.purchaseCost / CRORE,
      billedTariffPerUse: baseTariff,
      usagePerDay: baseUsage,
    }),
    [baseTariff, baseUsage, inputs.purchaseCost]
  );
  const columns = useMemo<ScenarioColumn[]>(() => {
    const lowerInputs = applyAssessmentOverrides(inputs, editableScenarios.lower);
    const higherInputs = applyAssessmentOverrides(inputs, editableScenarios.higher);
    return [
      {
        id: "lower",
        name: "Lower assumption",
        note: editableNote("lower"),
        display: { ...baseDisplay, ...editableScenarios.lower },
        result: computeAssessment(lowerInputs),
      },
      {
        id: "base",
        name: "Base case",
        note: editableNote("base"),
        display: baseDisplay,
        result: computeAssessment(inputs),
      },
      {
        id: "higher",
        name: "Higher assumption",
        note: editableNote("higher"),
        display: { ...baseDisplay, ...editableScenarios.higher },
        result: computeAssessment(higherInputs),
      },
    ];
  }, [baseDisplay, editableScenarios, inputs]);

  const summaryRows: Array<{
    label: string;
    value: (column: ScenarioColumn) => ReactNode;
  }> = [
    {
      label: "Purchase cost (Cr)",
      value: (column) => formatNumber(column.display.purchaseCostCr, 2),
    },
    {
      label: "Billed tariff per use",
      value: (column) =>
        column.id === "base" ? (
          formatInr(column.display.billedTariffPerUse)
        ) : (
          <ScenarioEditor
            ariaLabel={`${column.name} billed tariff per use`}
            value={column.display.billedTariffPerUse}
            suffix="₹ / use"
            step={1}
            onChange={(event) => updateScenario(column.id as ScenarioPreset, "billedTariffPerUse", event)}
          />
        ),
    },
    {
      label: "Usage per day",
      value: (column) =>
        column.id === "base" ? (
          formatNumber(column.display.usagePerDay, 1)
        ) : (
          <ScenarioEditor
            ariaLabel={`${column.name} usage per day`}
            value={column.display.usagePerDay}
            suffix="uses / day"
            step={0.1}
            onChange={(event) => updateScenario(column.id as ScenarioPreset, "usagePerDay", event)}
          />
        ),
    },
    {
      label: "Break-even usage",
      value: (column) =>
        column.result.breakEvenUsagePerDay === null
          ? "Not achievable"
          : `${formatNumber(column.result.breakEvenUsagePerDay, 1)} / day`,
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

  const detailRows: Array<{
    label: string;
    divider?: boolean;
    value: (column: ScenarioColumn) => ReactNode;
  }> = [
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
      label: "Working capital gap",
      value: (column) => formatInr(column.result.workingCapitalPeakGap),
    },
  ];

  const renderTable = (
    rows: Array<{ label: string; divider?: boolean; value: (column: ScenarioColumn) => ReactNode }>,
    className: string
  ) => (
    <table className={className}>
      <thead>
        <tr>
          <th scope="col">Metric</th>
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
  );

  return (
    <section className="scenario-table" aria-label="Scenario comparison">
      <div className="scenario-table__heading">
        <div>
          <span className="narrative-intro__eyebrow">Compare options</span>
          <h2>Compare the base case with lower or higher demand assumptions</h2>
          <p className="scenario-table__explanation">
            Lower and higher assumptions start at ±20% on billed tariff and usage.
            Edit those two demand drivers directly; the base case stays read-only.
          </p>
        </div>
      </div>

      <div className="scenario-table__scroll">
        {renderTable(summaryRows, "scenario-table__summary")}
      </div>

      <details className="scenario-table__details">
        <summary>Look at all the details</summary>
        <p>Every additional result below is recalculated from the edited assumptions.</p>
        <div className="scenario-table__scroll">
          {renderTable(detailRows, "scenario-table__detail-table")}
        </div>
      </details>
    </section>
  );
}
