// Maps between wizard-state.md §1.1's route map and WizardStep — the one place that
// mapping is written down, so the route guard and the step-navigation buttons agree.

import type { WizardStep } from "./wizardTypes";

export const STEP_PATH: Record<WizardStep, string> = {
  preStep: "/assess",
  investment: "/assess/investment",
  usage: "/assess/usage",
  costs: "/assess/costs",
  results: "/results",
};

export function stepForPath(pathname: string): WizardStep | null {
  const entry = Object.entries(STEP_PATH).find(([, path]) => path === pathname);
  return entry ? (entry[0] as WizardStep) : null;
}
