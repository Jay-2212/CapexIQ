// Scenario / sensitivity analysis across utilization, realization, and financing
// assumptions — SPEC.md §28

export interface ScenarioAssumptions {
  usagePerDay: number;
  realizationPercentage: number;
  financingType: "cash" | "loan" | "lease";
}

export interface ScenarioResult {
  roi: number;
  paybackYears: number;
  npv: number;
  irr: number;
}

export function runScenario(assumptions: ScenarioAssumptions): ScenarioResult {
  throw new Error("not implemented");
}
