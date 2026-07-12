# React and Next.js performance priorities

Apply these selectively to CapexIQ's actual implementation. Do not recommend dependencies or complexity without measured benefit.

## Highest relevance

- Keep formula results derived once from the canonical wizard state; pass the result to preview, cards, charts, narrative, and exports.
- Avoid effects for derived state. Compute during render or in the state transition/calculation boundary.
- Narrow subscriptions so a single keystroke does not rerender the entire wizard and every hidden step.
- Use refs for transient slider-drag values and transitions/deferred values only where measurement shows expensive non-urgent rendering.
- Keep controlled financial inputs cheap per keystroke and preserve selection/caret behavior.
- Version, validate, minimize, and cache reads from local/session storage.
- Dynamically load heavy chart/export libraries when the feature is approached or used; do not ship them in the initial landing/wizard bundle without need.
- Import modules directly when barrel imports materially broaden bundles.
- Avoid layout reads during render and interleaved DOM reads/writes.
- Reserve media dimensions and avoid hydration-dependent number/date rendering that flickers or mismatches.
- Do not define components inside components; keep effect dependencies primitive and intentional.

## Evidence gate

Before proposing memoization, virtualization, Suspense, dynamic imports, `useTransition`, `useDeferredValue`, or a new caching library, identify the expensive path or bundle and describe how the change will be verified. Prefer React Profiler, browser Performance traces, bundle analysis, and interaction latency over intuition.

## Upstream

Adapted from Vercel Engineering's MIT-licensed `vercel-react-best-practices` skill, version observed 1.0.0 in July 2026. Consult the current upstream skill when exact framework-version guidance matters.
