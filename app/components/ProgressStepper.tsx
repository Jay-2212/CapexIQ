"use client";

import type { WizardStep } from "../forms/wizardTypes";

const STEPS: { step: WizardStep; label: string; href: string }[] = [
  { step: "investment", label: "Investment", href: "/assess/investment" },
  { step: "usage", label: "Usage & Revenue", href: "/assess/usage" },
  { step: "costs", label: "Operating Costs", href: "/assess/costs" },
];

export function ProgressStepper({ current }: { current: WizardStep }) {
  const currentIndex = STEPS.findIndex((s) => s.step === current);

  return (
    <ol className="progress-stepper" aria-label="Assessment steps">
      {STEPS.map((entry, index) => {
        const state =
          index === currentIndex
            ? "current"
            : index < currentIndex
              ? "complete"
              : "upcoming";
        return (
          <li key={entry.step} className="progress-stepper__item" data-state={state}>
            <span className="progress-stepper__index" aria-hidden="true">
              {index + 1}
            </span>
            <span className="progress-stepper__label">{entry.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
