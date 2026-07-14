"use client";

// Phase 9's discrete scenario comparison — SPEC.md §28. SPEC.md §28.1 offers two
// scenario-naming schemes: auto Conservative/Base/Optimistic presets, or user-created
// named scenarios ("MRI Option A" vs "MRI Option B"). This build deliberately only
// implements the second: there is no researched or Jay-approved definition anywhere in
// data-requirements.md/financial-model-spec.md for what "Conservative" or "Optimistic"
// mean numerically, and inventing a delta (e.g. "-10% usage") would be exactly the
// kind of unsourced product constant CLAUDE.md's escalation rule reserves for Jay. The
// three names remain available as suggestions (the <datalist> below) for whatever
// scenario a user builds — the numbers are always theirs, never auto-generated.
//
// Every scenario (including the Base row) runs through the same computeAssessment()
// used everywhere else (CONVENTIONS.md §3) — purchaseCost/billedTariffPerUse/
// usagePerDay overrides are the only three fields varied, matching SPEC §28's
// "comparing vendor quotes or different equipment options" use case (Capex is the
// column that makes this table distinct from the sensitivity strip above it, which
// only varies usage/realization). Scenarios are ephemeral component state, not wizard
// state — they never dispatch through the reducer and are lost on reload, same as the
// sensitivity strip.

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { computeAssessment, type AssessmentInputs } from "@/formulas/computeAssessment";
import {
  applyAssessmentOverrides,
  weightedAverageBilledTariff,
} from "@/formulas/assessmentOverrides";
import { formatInr, formatPercent, formatYears, formatNumber } from "./formatting";

const CRORE = 10_000_000;
const PURCHASE_COST_MIN_CR = 0;
const PURCHASE_COST_MAX_CR = 100;
const TARIFF_MIN = 500;
const TARIFF_MAX = 25000;
const USAGE_MIN = 0;
const USAGE_MAX = 50;

interface ScenarioDraft {
  id: string;
  name: string;
  purchaseCostCr: number;
  billedTariffPerUse: number;
  usagePerDay: number;
}

function scenarioResultFor(inputs: AssessmentInputs, draft: ScenarioDraft) {
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
    name: "Current assessment",
    purchaseCostCr: inputs.purchaseCost / CRORE,
    billedTariffPerUse: weightedAverageBilledTariff(inputs),
    usagePerDay: inputs.usagePerDay,
  };
  const [scenarios, setScenarios] = useState<ScenarioDraft[]>([]);

  const addScenario = () => {
    setScenarios((current) => [
      ...current,
      {
        id: `scenario-${Date.now()}`,
        name: `Scenario ${current.length + 2}`,
        purchaseCostCr: baseDraft.purchaseCostCr,
        billedTariffPerUse: baseDraft.billedTariffPerUse,
        usagePerDay: baseDraft.usagePerDay,
      },
    ]);
  };

  const updateScenario = (id: string, patch: Partial<ScenarioDraft>) => {
    setScenarios((current) =>
      current.map((scenario) => (scenario.id === id ? { ...scenario, ...patch } : scenario))
    );
  };

  const removeScenario = (id: string) => {
    setScenarios((current) => current.filter((scenario) => scenario.id !== id));
  };

  const allDrafts = [baseDraft, ...scenarios];
  const allResults = allDrafts.map((draft) => ({
    draft,
    result: scenarioResultFor(inputs, draft),
  }));

  return (
    <section className="scenario-table" aria-label="Scenario comparison">
      <datalist id="scenario-name-suggestions">
        <option value="Conservative" />
        <option value="Base case" />
        <option value="Optimistic" />
      </datalist>

      <div className="scenario-table__heading">
        <div>
          <span className="narrative-intro__eyebrow">Compare options</span>
          <h2>Add a scenario to compare vendor quotes or assumptions side by side</h2>
        </div>
        <button type="button" className="button button--secondary" onClick={addScenario}>
          <Plus aria-hidden="true" size={16} /> Add scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <p className="scenario-table__empty">
          Only the current assessment is shown. Add a scenario to compare a different
          purchase price, tariff, or expected usage.
        </p>
      ) : (
        <div className="scenario-table__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Assumption</th>
                {allResults.map(({ draft }) => (
                  <th key={draft.id} scope="col">
                    {draft.id === "base" ? (
                      draft.name
                    ) : (
                      <div className="scenario-table__scenario-head">
                        <input
                          type="text"
                          list="scenario-name-suggestions"
                          value={draft.name}
                          aria-label="Scenario name"
                          onChange={(event) =>
                            updateScenario(draft.id, { name: event.target.value })
                          }
                        />
                        <button
                          type="button"
                          aria-label={`Remove ${draft.name}`}
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
                {allResults.map(({ draft }) =>
                  draft.id === "base" ? (
                    <td key={draft.id}>{formatNumber(draft.purchaseCostCr, 2)}</td>
                  ) : (
                    <td key={draft.id}>
                      <input
                        type="number"
                        min={PURCHASE_COST_MIN_CR}
                        max={PURCHASE_COST_MAX_CR}
                        step={0.1}
                        value={draft.purchaseCostCr}
                        aria-label="Purchase cost in Crore"
                        onChange={(event) =>
                          updateScenario(draft.id, {
                            purchaseCostCr: Number(event.target.value),
                          })
                        }
                      />
                    </td>
                  )
                )}
              </tr>
              <tr>
                <th scope="row">Billed tariff per use</th>
                {allResults.map(({ draft }) =>
                  draft.id === "base" ? (
                    <td key={draft.id}>{formatInr(draft.billedTariffPerUse)}</td>
                  ) : (
                    <td key={draft.id}>
                      <input
                        type="number"
                        min={TARIFF_MIN}
                        max={TARIFF_MAX}
                        step={100}
                        value={draft.billedTariffPerUse}
                        aria-label="Billed tariff per use"
                        onChange={(event) =>
                          updateScenario(draft.id, {
                            billedTariffPerUse: Number(event.target.value),
                          })
                        }
                      />
                    </td>
                  )
                )}
              </tr>
              <tr>
                <th scope="row">Usage per day</th>
                {allResults.map(({ draft }) =>
                  draft.id === "base" ? (
                    <td key={draft.id}>{formatNumber(draft.usagePerDay, 1)}</td>
                  ) : (
                    <td key={draft.id}>
                      <input
                        type="number"
                        min={USAGE_MIN}
                        max={USAGE_MAX}
                        step={1}
                        value={draft.usagePerDay}
                        aria-label="Usage per day"
                        onChange={(event) =>
                          updateScenario(draft.id, {
                            usagePerDay: Number(event.target.value),
                          })
                        }
                      />
                    </td>
                  )
                )}
              </tr>

              <tr className="scenario-table__divider">
                <th scope="row">Capex</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.initialInvestment)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly billed revenue</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.monthlyBilledRevenue)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly realized revenue</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.monthlyRealizedRevenue)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Monthly operating surplus</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.annualOperatingSurplus / 12)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Cash flow after EMI (monthly)</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {formatInr((result.annualNetCashFlowsAfterFinancing[0] ?? 0) / 12)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Payback</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatYears(result.paybackYearsFromCashFlows)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">ROI</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatPercent(result.roiCashFlow)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">NPV</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.npv)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">IRR</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {result.irr === null ? "Undefined" : formatPercent(result.irr)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Break-even usage</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>
                    {result.breakEvenUsagePerDay === null
                      ? "Not achievable"
                      : `${formatNumber(result.breakEvenUsagePerDay, 1)} / day`}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Working capital gap</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>{formatInr(result.workingCapitalPeakGap)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Risk level</th>
                {allResults.map(({ draft, result }) => (
                  <td key={draft.id}>
                    <span
                      className="scenario-table__band"
                      data-band={result.investmentOutlook.band}
                    >
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
