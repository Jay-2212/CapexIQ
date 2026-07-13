"use client";

// wizard-state.md §2's route guard: landing directly on a step's URL without its
// prerequisites complete redirects to the earliest incomplete step, with a focus move
// + live-region announcement (§6.5) — never a silent bounce-back. Also handles the
// "draft restored on load" announcement, the other §6.5 event this layout owns.

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { earliestIncompleteStep } from "./wizardValidation";
import { STEP_PATH, stepForPath } from "./stepRouting";

const STEP_LABEL: Record<string, string> = {
  preStep: "the equipment selection step",
  investment: "Investment",
  usage: "Usage & Revenue",
  costs: "Operating Costs",
};

export function RouteGuard() {
  const { state, dispatch, announce } = useWizard();
  const pathname = usePathname();
  const router = useRouter();
  const hasAnnouncedDraftRestore = useRef(false);

  useEffect(() => {
    // Skip until useWizardPersistence's mount-load effect has resolved (restored a
    // draft or confirmed there isn't one). Without this gate, this effect runs on
    // its first commit against the still-default emptyWizardState() — before that
    // sibling effect's dispatch lands — and wrongly redirects every deep link/reload
    // back to the pre-step, since nothing looks complete yet.
    if (!state.hasHydrated) return;

    const requestedStep = stepForPath(pathname);
    if (!requestedStep) return;

    const incomplete = earliestIncompleteStep(state, requestedStep);
    if (incomplete && STEP_PATH[incomplete] !== pathname) {
      announce(
        `Returned you to ${STEP_LABEL[incomplete] ?? incomplete} — ${STEP_LABEL[requestedStep] ?? requestedStep} isn't complete yet.`
      );
      router.replace(STEP_PATH[incomplete]);
      return;
    }

    if (requestedStep !== state.currentStep) {
      dispatch({ type: "GO_TO_STEP", step: requestedStep });
    }
    // Focus the destination step's own h1 — every step page renders exactly one
    // (wizard-state.md §6.5's in-app Next/Back and route-guard focus rule).
    const heading = document.querySelector<HTMLElement>("h1[tabindex='-1']");
    heading?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, state.hasHydrated]);

  useEffect(() => {
    if (state.restoredDraftSavedAt && !hasAnnouncedDraftRestore.current) {
      hasAnnouncedDraftRestore.current = true;
      const savedAt = new Date(state.restoredDraftSavedAt);
      const minutesAgo = Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 60000));
      announce(
        `Restored your saved progress from ${minutesAgo === 1 ? "1 minute ago" : `${minutesAgo} minutes ago`}.`
      );
      dispatch({ type: "ACKNOWLEDGE_RESTORED_DRAFT" });
    }
  }, [state.restoredDraftSavedAt, announce, dispatch]);

  return null;
}
