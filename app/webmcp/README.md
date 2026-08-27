# app/webmcp — Web Model Context Protocol (WebMCP) Integration

This folder contains CapexIQ's WebMCP support for exposing interactive clinical and financial modeling capabilities directly to LLM agents. It prefers the current `document.modelContext` API and retains `navigator.modelContext` as a compatibility fallback for older hosts and validators.

## Structure
- `types.ts`: Core TypeScript types, JSON schema interfaces, error recovery envelopes (`error_code`, `message`, `suggested_fix`).
- `toolDefinitions.ts`: Strict schema definitions and character budgets for all 6 tools.
- `registry.ts`: Safe browser/SSR feature detection and error-shielded registration wrapper.
- `WebMCPProvider.tsx`: Client-side React component mounted through `app/AppProviders.tsx` to bind live wizard state and Next.js routing. This exposes the same six tools on the landing page and throughout the assessment flow.
- `handlers/`: Individual handlers for the 6 tools:
  - `handleGetPresets.ts`: Sourced Indian medical equipment benchmark ranges.
  - `handleGetWizardForm.ts`: Reads 4-step wizard snapshot and computed KPIs.
  - `handleSimulate.ts`: In-memory sandbox execution without touching browser state.
  - `handleApplyInputs.ts`: Updates wizard inputs, supports Basic vs. Advanced mode, and handles routing.
  - `handleExport.ts`: Integrates with Excel, Word, and ZIP generators.
  - `handleGetMetricGuide.ts`: Reference manual lookup for financial metrics and optimization strategies.
