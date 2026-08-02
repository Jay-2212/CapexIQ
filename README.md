# CapexIQ

[![Code licence: MIT](https://img.shields.io/badge/code%20licence-MIT-blue.svg)](LICENSE-CODE)
[![Live demo](https://img.shields.io/badge/live%20demo-capexiq.jaybharti.me-6f42c1.svg)](https://capexiq.jaybharti.me/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

CapexIQ is a browser-based decision-support tool for evaluating hospital
capital-equipment assumptions before a purchase decision. It turns an
equipment, utilization, pricing, collection, cost, financing, and lifecycle
scenario into transparent operating and investment calculations.

- **Live application:** [capexiq.jaybharti.me](https://capexiq.jaybharti.me/)
- **Methodology:** [capexiq.jaybharti.me/methodology](https://capexiq.jaybharti.me/methodology)

## Status

The repository contains the current working application and a static-export
deployment. The README that described an early scaffold was stale; the
implementation now includes the assessment flow, results dashboard, export
generators, methodology page, sensitivity view, scenario comparison, and
actionable insight component. This is a decision-support prototype/application,
not a verified financial model, professional advisory service, or claim of
production readiness.

> **Important disclaimer:** CapexIQ is for informational decision support. It is
> not financial, investment, tax, accounting, medical, or legal advice. Validate
> every assumption with qualified professionals, current vendor quotations,
> hospital operating data, applicable regulations, and your own finance team
> before making a capital decision.

## What it covers

The guided assessment currently supports:

- MRI, CT, Cath Lab, Dialysis, Ultrasound, and Custom equipment categories;
- purchase and setup costs, utilization, price, and operating assumptions;
- billed versus realized revenue;
- payer mix, collection assumptions, delays, and DSO;
- working-capital gap and peak working-capital need;
- variable and fixed costs, maintenance, warranty/CMC/AMC-style lifecycle
  inputs, and maintenance inflation;
- financing, interest/EMI, launch delay, pre-operative interest, and
  depreciation inputs;
- monthly and annual cash-flow views;
- break-even usage, ROI, NPV, IRR, payback, and equivalent-annual-cost views;
- user-added scenario comparison rows;
- a sensitivity strip for usage and realization assumptions;
- risk callouts and a price-change actionable insight when the model supports
  one;
- locally generated Excel, Word, and ZIP exports; and
- a methodology page that explains the model's calculation sequence and
  limitations.

The application does not supply a national benchmark database. Defaults and
example values are illustrative starting points; users should replace them with
their own quotes, tariffs, utilization data, payer mix, collection behavior,
costs, and financing terms.

## How it works

CapexIQ is a client-side Next.js application configured for a static export.
The assessment state is held in the browser and draft progress is persisted to
`localStorage`; this repository contains no login, account system, or application
backend. Excel, Word, and ZIP files are generated in the browser from the same
assessment state used by the results dashboard.

The calculation path is intentionally visible in the repository:

```text
Assessment inputs
  → usage and billed/realized revenue
  → payer collections and working-capital timing
  → variable/fixed/maintenance/financing/depreciation costs
  → monthly cash flows
  → break-even, ROI, NPV, IRR, payback, scenarios, sensitivity
  → dashboard and local exports
```

The [methodology page](https://capexiq.jaybharti.me/methodology) is the best
starting point for reviewing formulas and assumptions. It describes an
illustrative hypothetical MRI example, not a real hospital benchmark or
recommendation.

## Requirements

- Node.js compatible with the versions in `package-lock.json`.
- npm.
- A modern browser for the interactive assessment and local file exports.

## Development setup

```bash
git clone https://github.com/Jay-2212/CapexIQ.git
cd CapexIQ
npm ci
npm run dev
```

Useful checks:

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

`npm run build` creates the static export configured by `next.config.ts`. The
repository's `lint` script currently calls `next lint`; check the installed
Next.js version before relying on it because that command has changed across
Next.js releases.

## Deployment

The application is configured with `output: "export"`. Deploy the generated
static output using a static host such as Cloudflare Pages or another provider
that supports the output directory. The repository does not contain a
deployment secret, API route, or server-side credential flow.

## Privacy and security

- Draft assessment state is stored in the browser's `localStorage`.
- There is no account system or server-side persistence in this repository.
- Exports may contain sensitive operating and financial assumptions; treat them
  as confidential and remove them from shared machines when appropriate.
- The application does not establish that a value is accurate merely because
  it is displayed or exported.
- The stock photos, fonts, icons, dependencies, and other non-original
  materials are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Licence scope

[LICENSE-CODE](LICENSE-CODE) applies only to the original CapexIQ source code
and original documentation that Jay owns. It does not grant a project-wide
licence to the stock images, font files, icon files, third-party dependencies,
trademarks, or external source material listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Review those notices before
redistributing a complete copy or a deployment bundle.

## Contributing

Issues and pull requests are welcome for reproducible calculation defects,
accessibility improvements, documentation corrections, and export regressions.
When reporting a calculation issue, include the equipment category and a
minimal synthetic input set; do not upload patient data, confidential quotes,
or real hospital financial records.
