"use client";

// The one shared aria-live="polite" region every silent-state-change event
// (wizard-state.md §6.5) announces through — route-guard redirects, restored-draft
// notices, version-mismatch resets. Visually hidden, always present once mounted.

import { useWizard } from "../forms/WizardContext";

export function LiveRegion() {
  const { announcement } = useWizard();

  return (
    <div aria-live="polite" role="status" className="visually-hidden">
      {announcement}
    </div>
  );
}
