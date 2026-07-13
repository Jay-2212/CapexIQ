"use client";

// The single context/reducer above all /assess/* and /results routes (wizard-state.md
// §6: "a layout-level provider, not per-page local state") so in-app navigation is a
// normal client-side route change that never tears down state. app/assess/layout.tsx
// is the only place this provider is mounted.

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { wizardReducer, type WizardAction } from "./wizardReducer";
import { emptyWizardState } from "./initialState";
import type { WizardState } from "./wizardTypes";

interface WizardContextValue {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  /** wizard-state.md §6.5: the shared aria-live="polite" region every silent-state-
   *  change event announces through, plus the setter components call to push a
   *  message into it. */
  announce: (message: string) => void;
  announcement: string;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, emptyWizardState);
  const announcementRef = useRef("");
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  const announce = (message: string) => {
    announcementRef.current = message;
    forceRender();
  };

  return (
    <WizardContext.Provider
      value={{ state, dispatch, announce, announcement: announcementRef.current }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard() must be used within a WizardProvider.");
  }
  return context;
}
