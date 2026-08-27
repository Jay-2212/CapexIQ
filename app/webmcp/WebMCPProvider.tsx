"use client";

// WebMCP Provider for CapexIQ
// Mounts inside app/(assessment)/layout.tsx to wire live Wizard state and Next.js router
// to the available WebMCP host in a supported browser environment.

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "../forms/WizardContext";
import { registerWebMCPTools } from "./registry";

export function WebMCPProvider({ children }: { children?: ReactNode }) {
  const { state, dispatch } = useWizard();
  const router = useRouter();

  // Keep a mutable ref so tool handlers always read latest state synchronously
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const unregister = registerWebMCPTools({
      getState: () => stateRef.current,
      dispatch,
      navigateTo: (path: string) => {
        router.push(path);
      },
    });

    return () => {
      unregister();
    };
  }, [dispatch, router]);

  return <>{children}</>;
}
