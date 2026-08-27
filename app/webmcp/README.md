# app/webmcp — Web Model Context Protocol (WebMCP) Integration

This folder contains CapexIQ's WebMCP support for exposing interactive clinical and financial modeling capabilities directly to LLM agents via Chrome's `document.modelContext` standard.

## Structure
- `types.ts`: Core TypeScript types, JSON schema interfaces, error recovery envelopes (`error_code`, `message`, `suggested_fix`).
- `toolDefinitions.ts`: Strict schema definitions and character budgets for all 6 tools.
- `registry.ts`: Safe browser/SSR feature detection and error-shielded registration wrapper.
- `WebMCPProvider.tsx`: Client-side React component mounted inside `app/(assessment)/layout.tsx` to bind live wizard state and Next.js routing.
- `handlers/`: Individual handlers for the 6 tools:
  - `handleGetPresets.ts`: Sourced Indian medical equipment benchmark ranges.
  - `handleGetWizardForm.ts`: Reads 4-step wizard snapshot and computed KPIs.
  - `handleSimulate.ts`: In-memory sandbox execution without touching browser state.
  - `handleApplyInputs.ts`: Updates wizard inputs, supports Basic vs. Advanced mode, and handles routing.
  - `handleExport.ts`: Integrates with Excel, Word, and ZIP generators.
  - `handleGetMetricGuide.ts`: Reference manual lookup for financial metrics and optimization strategies.
