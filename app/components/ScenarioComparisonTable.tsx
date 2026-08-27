"use client";

// Phase 9's discrete scenario comparison — SPEC.md §28. The base column is the
// exact current assessment. The two named presets are deliberately small and
// explicit: Jay approved a lower case at -20% billed tariff and usage, and a
// higher case at +20% for those same two drivers. A Custom option preserves the
// original user-entered scenario workflow.

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { computeAssessment, type AssessmentInputs } from "@/formulas/computeAssessment";
import {
  applyAssessmentOverrides,
  applyScenarioPreset,
  SCENARIO_PRESET_MULTIPLIER,
  weightedAverageBilledTariff,
  type ScenarioPreset,
} from "@/formulas/assessmentOverrides";
import { formatInr, formatPercent, formatYears, formatNumber } from "./formatting";

const CRORE = 10_000_000;
const PURCHASE_COST_MIN_CR = 0;
const PURCHASE_COST_MAX_CR = 100;
const TARIFF_MIN = 500;
const TARIFF_MAX = 25000;
const USAGE_MIN = 0;
const USAGE_MAX = 50;

type ScenarioMode = ScenarioPreset | "custom";

interface ScenarioDraft {
  id: string;
  mode: ScenarioMode;
  name: string;
  purchaseCostCr: number;
  billedTariffPerUse: number;
  usagePerDay: number;
}

const PRESET_LABELS: Record<ScenarioPreset, string> = {
  lower: "Lower assumption",
  higher: "Higher assumption",
};

function effectiveDraft(base: ScenarioDraft, draft: ScenarioDraft): ScenarioDraft {
  if (draft.mode === "custom") return draft;
  const multiplier = SCENARIO_PRESET_MULTIPLIER[draft.mode];
  return {
    ...draft,
    name: PRESET_LABELS[draft.mode],
    purchaseCostCr: base.purchaseCostCr,
    billedTariffPerUse: base.billedTariffPerUse * multiplier,
    usagePerDay: base.usagePerDay * multiplier,
  };
}

function scenarioResultFor(inputs: AssessmentInputs, draft: ScenarioDraft) {
  if (draft.mode !== "custom") {
    return computeAssessment(applyScenarioPreset(inputs, draft.mode));
  }

  return computeAssessment(
    applyAssessmentOverrides(inputs, {
      purchaseCost: draft.purchaseCostCr * CRORE,
      billedTariffPerUse: draft.billedTariffPerUse,
      usagePerDay: draft.usagePerDay,
    })
  );
}

export function ScenarioComparisonTable({ inputs }: { inputs: AssessmentInputs }) {
  const baseDraft: ScenarioDraft = {
    id: "base",
    mode: "custom",
    name: "Base case",
    purchaseCostCr: inputs.purchaseCost / CRORE,
    billedTariffPerUse: weightedAverageBilledTariff(inputs),
    usagePerDay: inputs.usagePerDay,
  };
  const [scenarios, setScenarios] = useState<ScenarioDraft[]>([]);

  const addScenario = () => {
    setScenarios((current) => [
      ...current,
      {
        id: `scenario-${Date.now()}-${current.length}`,
        mode: "lower",
        name: PRESET_LABELS.lower,
        purchaseCostCr: baseDraft.purchaseCostCr,
        billedTariffPerUse: baseDraft.billedTariffPerUse,
        usagePerDay: baseDraft.usagePerDay,
      },
    ]);
  };

  const chooseScenarioMode = (id: string, mode: ScenarioMode) => {
    setScenarios((current) =>
      current.map((scenario) => {
        if (scenario.id !== id) return scenario;
        const scenarioNumber = current.findIndex((item) => item.id === id) + 2;
        return {
          ...scenario,
          mode,
          name:
            mode === "custom"
              ? scenario.mode === "custom"
                ? scenario.name
                : `Scenario ${scenarioNumber}`
              : PRESET_LABELS[mode],
        };
      })
    );
  };

  const updateCustomScenario = (
    id: string,
    patch: Partial<Pick<ScenarioDraft, "name" | "purchaseCostCr" | "billedTariffPerUse" | "usagePerDay">>
  ) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === id ? { ...scenario, mode: "custom", ...patch } : scenario
      )
    );
  };

  const removeScenario = (id: string) => {
    setScenarios((current) => current.filter((scenario) => scenario.id !== id));
  };

  const columns = [
    {
      draft: baseDraft,
      display: baseDraft,
      result: computeAssessment(inputs),
      scenarioNumber: null,
    },
    ...scenarios.map((draft, index) => ({
      draft,
      display: effectiveDraft(baseDraft, draft),
      result: scenarioResultFor(inputs, draft),
      scenarioNumber: index + 2,
    })),
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
        <button type="button" className="button button--secondary" onClick={addScenario}>
          <Plus aria-hidden="true" size={16} /> Add scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <p className="scenario-table__empty">
          Add a scenario to compare the current assessment with the approved lower
          or higher assumption.
        </p>
      ) : (
        <div className="scenario-table__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Assumption</th>
                {columns.map(({ draft, scenarioNumber }) => (
                  <th key={draft.id} scope="col">
                    {scenarioNumber === null ? (
                      <div className="scenario-table__base-head">
                        <strong>{draft.name}</strong>
                        <small>Current assessment</small>
                      </div>
                    ) : (
                      <div className="scenario-table__scenario-head">
                        <label className="visually-hidden" htmlFor={`scenario-mode-${draft.id}`}>
                          Scenario {scenarioNumber} assumption
                        </label>
                        <select
                          id={`scenario-mode-${draft.id}`}
                          value={draft.mode}
                          aria-label={`Scenario ${scenarioNumber} assumption`}
                          onChange={(event) =>
                            chooseScenarioMode(draft.id, event.target.value as ScenarioMode)
                          }
                        >
                          <option value="lower">Lower assumption (−20%)</option>
                          <option value="higher">Higher assumption (+20%)</option>
                          <option value="custom">Custom scenario</option>
                        </select>
                        {draft.mode === "custom" && (
                          <input
                            type="text"
                            value={draft.name}
                            aria-label={`Scenario ${scenarioNumber} name`}
                            onChange={(event) =>
                              updateCustomScenario(draft.id, { name: event.target.value })
                            }
                          />
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${effectiveDraft(baseDraft, draft).name}`}
                          onClick={() => removeScenario(draft.id)}
                        >
                          <Trash2 aria-hidden="true" size={14} />
                        </button>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Purchase cost (Cr)</th>
                {columns.map(({ draft, display }) => (
                  <td key={draft.id}>
                    {draft.mode === "custom" && draft.id !== "base" ? (
                      <input
                        type="number"
                        min={PURCHASE_COST_MIN_CR}
                        max={PURCHASE_COST_MAX_CR}
                        step={0.1}
                        value={display.purchaseCostCr}
                        aria-label={`Purchase cost in Crore for ${display.name}`}
                        onChange={(event) =>
                          updateCustomScenario(draft.id, {
                            purchaseCostCr: Number(event.target.value),
                          })
                        }
                      />
                    ) : (
                      formatNumber(display.purchaseCostCr, 2)
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Billed tariff per use</th>
                {columns.map(({ draft, display }) => (
                  <td key={draft.id}>
                    {draft.mode === "custom" && draft.id !== "base" ? (
                      <input
                        type="number"
                        min={TARIFF_MIN}
                        max={TARIFF_MAX}
                        step={100}
                        value={display.billedTariffPerUse}
                        aria-label={`Billed tariff per use for ${display.name}`}
                        onChange={(event) =>
                          updateCustomScenario(draft.id, {
                            billedTariffPerUse: Number(event.target.value),
                          })
                        }
                      />
                    ) : (
                      formatInr(display.billedTariffPerUse)
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Usage per day</th>
                {columns.map(({ draft, display }) => (
                  <td key={draft.id}>
                    {draft.mode === "custom" && draft.id !== "base" ? (
                      <input
                        type="number"
                        min={USAGE_MIN}
                        max={USAGE_MAX}
                        step={1}
                        value={display.usagePerDay}
                        aria-label={`Usage per day for ${display.name}`}
                        onChange={(event) =>
                          updateCustomScenario(draft.id, {
                            usagePerDay: Number(event.target.value),
                          })
                        }
                      />
                    ) : (
                      formatNumber(display.usagePerDay, 1)
                    )}
                  </td>
                ))}
              </tr>

              <tr className="scenario-table__divider">
                <th scope="row">Capex</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.initialInvestment)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly billed revenue</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.monthlyBilledRevenue)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly realized revenue</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.monthlyRealizedRevenue)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly operating surplus</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.annualOperatingSurplus / 12)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Cash flow after EMI (monthly)</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {formatInr((result.annualNetCashFlowsAfterFinancing[0] ?? 0) / 12)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Payback</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatYears(result.paybackYearsFromCashFlows)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">ROI</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatPercent(result.roiCashFlow)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">NPV</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.npv)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">IRR</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {result.irr === null ? "Undefined" : formatPercent(result.irr)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Break-even usage</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {result.breakEvenUsagePerDay === null
                      ? "Not achievable"
                      : `${formatNumber(result.breakEvenUsagePerDay, 1)} / day`}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Working capital gap</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.workingCapitalPeakGap)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Risk level</th>
                {columns.map(({ draft, result }) => (
                  <td key={draft.id}>
                    <span className="scenario-table__band" data-band={result.investmentOutlook.band}>
                      {result.investmentOutlook.band}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
