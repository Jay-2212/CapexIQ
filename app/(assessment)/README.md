A Next.js route group (parentheses = invisible in the URL) holding every route that
needs the wizard's shared state: `assess/` (the pre-step + 3-step Basic Mode wizard,
`/assess`, `/assess/investment`, `/assess/usage`, `/assess/costs`) and `results/`
(`/results`). `layout.tsx` mounts the one `WizardProvider` (see `app/forms/
WizardContext.tsx`), wires up `localStorage` draft persistence, the route guard, the
shared `aria-live` region, and "Start over" — all defined in `app/forms/`, not
duplicated here. Grouped together because `/results` needs the same wizard state as
`/assess/*` despite not being nested under it in the URL — a plain folder structure
can't do that without changing the actual route path, which the route group avoids.
