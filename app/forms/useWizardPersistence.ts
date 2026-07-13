"use client";

// Wires draftStorage.ts's pure functions into React lifecycle per wizard-state.md §7:
// load-on-mount, ~500ms debounced save on every change + immediate save on step/
// advancedOpen transitions, the cross-tab conflict banner (§7.3 point 1), and the
// write-failure notice (§7.3 point 3). "Start over"'s own double-click-to-confirm UI
// state lives in the component that renders it, not here — this hook only exposes
// clearDraft() for that component to call.

import { useEffect, useRef, useState, type Dispatch } from "react";
import {
  clearDraftFromStorage,
  readDraftFromStorage,
  writeDraftToStorage,
  STORAGE_KEY,
} from "./draftStorage";
import type { WizardAction } from "./wizardReducer";
import type { WizardState } from "./wizardTypes";

const SAVE_DEBOUNCE_MS = 500;

export interface WizardPersistence {
  /** Another tab saved a newer draft than the one this tab loaded. */
  conflictBannerVisible: boolean;
  dismissConflictBanner: () => void;
  /** The most recent localStorage.setItem threw (quota, or Safari private mode). */
  writeFailureNoticeVisible: boolean;
  clearDraft: () => void;
}

export function useWizardPersistence(
  state: WizardState,
  dispatch: Dispatch<WizardAction>
): WizardPersistence {
  const lastLoadedSavedAt = useRef<string | null>(null);
  const previousStep = useRef(state.currentStep);
  const previousAdvancedOpen = useRef(state.advancedOpen);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);
  const [conflictBannerVisible, setConflictBannerVisible] = useState(false);
  const [writeFailureNoticeVisible, setWriteFailureNoticeVisible] = useState(false);

  // Load once on mount. Always dispatches — RESTORE_DRAFT if a draft exists,
  // MARK_HYDRATED otherwise — so RouteGuard (which gates on state.hasHydrated) has a
  // signal to wait for either way, rather than only on the "draft exists" branch.
  useEffect(() => {
    const draft = readDraftFromStorage();
    if (draft) {
      lastLoadedSavedAt.current = draft.savedAt;
      dispatch({ type: "RESTORE_DRAFT", state: draft.state, savedAt: draft.savedAt });
    } else {
      dispatch({ type: "MARK_HYDRATED" });
    }
    hasLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (immediate: boolean) => {
    const run = () => {
      const savedAt = new Date().toISOString();
      const succeeded = writeDraftToStorage(state, savedAt);
      if (succeeded) {
        lastLoadedSavedAt.current = savedAt;
        setWriteFailureNoticeVisible(false);
      } else {
        setWriteFailureNoticeVisible(true);
      }
    };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (immediate) {
      run();
    } else {
      debounceTimer.current = setTimeout(run, SAVE_DEBOUNCE_MS);
    }
  };

  // Save on every state change, once the initial load has happened (never save an
  // empty/default state over a not-yet-read draft).
  useEffect(() => {
    if (!hasLoaded.current) return;

    const stepChanged = previousStep.current !== state.currentStep;
    const advancedToggled = previousAdvancedOpen.current !== state.advancedOpen;
    previousStep.current = state.currentStep;
    previousAdvancedOpen.current = state.advancedOpen;

    persist(stepChanged || advancedToggled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Cross-tab conflict detection (wizard-state.md §7.3 point 1).
  useEffect(() => {
    function handleStorageEvent(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const parsed = JSON.parse(event.newValue) as { savedAt?: string };
        if (
          parsed.savedAt &&
          lastLoadedSavedAt.current &&
          parsed.savedAt > lastLoadedSavedAt.current
        ) {
          setConflictBannerVisible(true);
        }
      } catch {
        // Malformed write from another tab — nothing actionable here, ignore.
      }
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  return {
    conflictBannerVisible,
    dismissConflictBanner: () => setConflictBannerVisible(false),
    writeFailureNoticeVisible,
    clearDraft: () => {
      clearDraftFromStorage();
      lastLoadedSavedAt.current = null;
    },
  };
}
