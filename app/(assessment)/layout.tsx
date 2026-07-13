"use client";

// The layout-level provider above every /assess/* route and /results (wizard-state.md
// §6) — a route group so both share one WizardProvider/persistence/route-guard
// instance despite /results not being nested under /assess in the URL.

import type { ReactNode } from "react";
import Link from "next/link";
import { WizardProvider, useWizard } from "../forms/WizardContext";
import { useWizardPersistence } from "../forms/useWizardPersistence";
import { RouteGuard } from "../forms/RouteGuard";
import { LiveRegion } from "../components/LiveRegion";
import { StartOver } from "../components/StartOver";

function AssessmentShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useWizard();
  const persistence = useWizardPersistence(state, dispatch);

  return (
    <>
      <LiveRegion />
      <RouteGuard />
      <header className="assessment-header">
        <Link href="/" className="assessment-header__brand">CapexIQ</Link>
        {state.preStep.equipmentCategory && (
          <span className="assessment-header__context">
            {state.preStep.hospitalName || "New hospital"} · {state.preStep.equipmentCategory}
          </span>
        )}
        <div className="assessment-header__actions">
          <StartOver clearDraft={persistence.clearDraft} />
        {/* Shared-device disclosure (wizard-state.md §7.3 point 2). */}
          <p className="assessment-header__privacy-note">Saved in this browser</p>
        </div>
      </header>
      {persistence.conflictBannerVisible && (
        <div role="alert" className="banner banner--info">
          This assessment was updated in another tab —{" "}
          <button type="button" onClick={() => window.location.reload()}>
            reload to see the latest version
          </button>
          .
        </div>
      )}
      {persistence.writeFailureNoticeVisible && (
        <div role="alert" className="banner banner--warning">
          Your progress isn&apos;t being saved automatically in this browser — you
          can still finish and export, but a refresh will lose it.
        </div>
      )}
      <main className="assessment-main">{children}</main>
    </>
  );
}

export default function AssessmentLayout({ children }: { children: ReactNode }) {
  return (
    <WizardProvider>
      <AssessmentShell>{children}</AssessmentShell>
    </WizardProvider>
  );
}
