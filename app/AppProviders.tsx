"use client";

// App-wide client providers. Keeping the wizard context and WebMCP registry here
// makes the agent surface available from the landing page and preserves the same
// assessment state when a tool routes the user into the wizard.

import type { ReactNode } from "react";
import { WizardProvider } from "./forms/WizardContext";
import { WebMCPProvider } from "./webmcp/WebMCPProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WizardProvider>
      <WebMCPProvider>{children}</WebMCPProvider>
    </WizardProvider>
  );
}
