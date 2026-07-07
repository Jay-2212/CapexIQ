# ISSUES.md — known problems, gaps, and open loops

A running list so nothing gets lost between sessions. Log something here the moment you
notice it, even if you don't fix it now — that's the whole point of this file. Don't
duplicate long explanations that already live elsewhere (e.g. `data-requirements.md`
§15) — link to them instead.

Status values: **open** (needs action), **accepted** (known, deliberately not fixing),
**resolved** (kept briefly for context, then pruned).

---

## Open

### ISS-9 — Invented benchmark numbers from an unsupervised Gemini pass; cleaned up, real research still needed
**Area:** data / docs
**Status:** open
**What:** A 2026-07-06 session (Gemini, working from chat instructions without the
project's own sourcing discipline) added `content/inputs-metadata.json` with per-field
numeric defaults, several of which were invented rather than sourced:
- SPEC.md §18.2/§18.3 claimed a 12.0% discount rate and 15.0% target IRR were "sourced
  from `data-requirements.md` §12.3" — **false**; §12.3 has no discount-rate or
  hurdle-rate row at all. This is exactly the failure mode the project's own rules
  (SPEC.md §24/§36, `data-requirements.md` §3/§9, `INTRODUCTION.md` rule 5) exist to
  prevent, and it happened inside the safeguard doc itself.
- Per-equipment `usagePerDay` and most `billedTariffPerUse` defaults had no
  corresponding source anywhere in `data-requirements.md` (utilization is explicitly
  listed as an open gap in §15). Dialysis's tariff default (₹2,000) even contradicted
  its own cited source (S19), which explicitly says its private-tariff figure "should
  not become a default revenue value."
- `purchaseCost` defaults for MRI/CT (₹3.0 Cr / ₹2.0 Cr) didn't match the actual
  ranges in §14 (₹2-14 Cr / ₹1.5-7 Cr, no stated midpoint) — fabricated single values
  presented as if precise.
- The registry dropped `confidence`/`sourceId` tracking entirely (unlike
  `equipment-data/*.json`'s established schema), so `loanInterestRate: 11.5%` was shown
  as a clean default despite `data-requirements.md` explicitly rating it Low-Medium
  confidence and recommending `sensitivity_range` treatment, not `default_assumption` —
  precisely the "hide low confidence behind a clean-looking default" anti-pattern that
  file's own §9 warns against.
**Resolution so far (2026-07-06):** `content/inputs-metadata.json` rewritten to hold
only UI/control schema (control type, slider bounds, tooltip copy) — zero numeric
defaults. All equipment-specific benchmark numbers now live only in
`equipment-data/<type>.json` (added `billedTariffPerUse` and `launchDelayMonths`
fields, both `null`). Non-equipment-specific figures (discount rate, target IRR, loan
interest rate/tenure, working days/month) moved to new
`equipment-data/common-assumptions.json`, each with honest confidence/sourceId — the
false-citation numbers are now `null`/`"Unavailable"` instead of looking sourced.
SPEC.md §18.2/§18.3 and §23.4 corrected to stop asserting the false citation.
**Update (2026-07-07):** a deep-research pass (ChatGPT Deep Research, see
data-requirements.md §17 for full findings) came back and filled most of the null
gaps with real, cited data: discount rate (11.1-14.1% proxy from listed hospital-chain
WACC), MRI/dialysis utilization, CGHS reimbursement-ceiling tariffs for CT/MRI/
Ultrasound/Dialysis, MRI/CT/Cath-Lab launch-delay ranges, and a real per-machine
dialysis acquisition-cost figure from a government tender. All propagated into
`equipment-data/*.json` and `common-assumptions.json` with honest confidence/sourceId,
replacing the `null`s. **Still genuinely unavailable after two research passes:**
target IRR/hurdle rate (confirmed unresearchable, no public source exists — see §17.2),
Cath Lab tariff (no data found at all), Dialysis and Ultrasound launch delay, and
standalone (non-PET) CT utilization (only a weak proxy exists). These remain `null`/
`"Unavailable"` deliberately, not from oversight.
**Status:** downgraded to **accepted** for the fields now populated; **open** only for
the still-genuinely-unavailable fields above, which should stay user-entered per
data-requirements.md §7.3 rather than trigger a third research pass unless a
significantly better source turns up.
**Process note:** this is the second time a parallel/unsupervised agent session
introduced an inconsistency this project's own docs were built to prevent (see ISS-7
for the first). Per user direction (2026-07-06): going forward, build-plan and
spec-level documents get one primary agent, not parallel multi-agent editing;
independent, well-bounded, already-specified tasks (e.g. implementing a single pure
formula file against an exact SPEC.md formula) may still be delegated to a second agent
(Codex) when explicitly scoped by the primary agent first.

### ISS-2 — Cloudflare Pages + DNS not yet wired up for capexiq.jaybharti.me
**Area:** infra
**Status:** open
**What:** The repo now exists on GitHub (`github.com/Jay-2212/CapexIQ`, pushed
2026-07-05), but nothing connects it to Cloudflare Pages, and no DNS record for the
`capexiq` subdomain exists yet. This is a dashboard action (Cloudflare account access),
not something doable from this environment.
**Next action:** in Cloudflare dashboard — create a Pages project connected to
`github.com/Jay-2212/CapexIQ`, then add a CNAME/subdomain record for
`capexiq.jaybharti.me` pointing at that Pages project, same pattern as the main
`jaybharti.me` site. Note `next.config.ts` is set to `output: "export"` (static export)
specifically so this can be a plain Pages static deployment with no Workers/adapter
needed — reconsider that config if the app later needs server-side API routes.

### ISS-3 — Equipment data files are placeholders, not real data
**Area:** data
**Status:** open
**What:** `/equipment-data/*.json` exist as schema-shaped placeholders (see
`equipment-data/README.txt`), not filled in with the real assumptions from
`data-requirements.md` §14.
**Next action:** populate from `data-requirements.md` §14's starter assumptions table,
per SPEC.md §32.1.

### ISS-8 — Dev-dependency audit warnings (moderate/high/critical, all dev-only)
**Area:** code / tooling
**Status:** open
**What:** `npm install` reports 7 vulnerabilities: `esbuild<=0.24.2` (dev server can be
sent arbitrary requests — GHSA-67mh-4wv8-2f99), pulled in transitively through
`vite`/`vitest`; and `postcss<8.5.10` (XSS in CSS stringify — GHSA-qx2v-qp2m-jg93),
pulled in transitively through `next`. Both are dev/build-tooling paths, not runtime
code shipped to users, and neither is exploitable in a static-export production build.
`npm audit fix --force` would resolve them but pulls in `vitest@4` and `next@9` — both
breaking-change downgrades/upgrades not worth forcing onto an otherwise-fine skeleton.
**Next action:** revisit next time `next`/`vitest` get a routine version bump anyway;
don't force it just for this.

### ISS-4 — Genuinely unresearched benchmark gaps
**Area:** data
**Status:** open
**What:** Payer-wise realization %, DSO by payer, specialist fees, and actual vendor
quotes remain unresearched — see `data-requirements.md` §15 for the full list. These are
correctly left as user-entered inputs for now rather than guessed at.
**Next action:** deepen research if/when better sources surface; not blocking for v1
since these are meant to be user inputs, not hardcoded benchmarks.

---

## Accepted (known, not being fixed)

### ISS-5 — CFO persona cutout retains office chair
**Area:** assets
**What:** `people-personas/transparent/03-cfo-finance-manager-cutout.png` keeps the
office chair behind her silhouette; the other 3 cutouts are clean.
**Why accepted:** cosmetic only, low priority. Manual touch-up needed if a fully isolated
cutout is ever required — not worth blocking on.

### ISS-6 — Two equipment images are approximations
**Area:** assets
**What:** `equipment-images/03-cath-lab-cardiology-equipment.jpg` and
`09-financial-dashboard-mock.jpg` aren't literal matches (no free stock photo exists of
an actual cath lab procedure room or this actual product's dashboard).
**Why accepted:** `design/dashboard-mockup.svg` is the real dashboard reference; image 09
is a placeholder only, safe to replace once real product screenshots exist.

---

## Resolved

### ISS-1 — Skeleton not build-verified
**Area:** code / tooling
**Resolution:** Node.js (v26.4.0) and npm (11.17.0) installed via Homebrew
(`brew install node`), which put both on PATH automatically. `npm install` and
`npm run build` both succeed — Next.js 15.5.20 compiles, type-checks, and produces a
static export in `out/` (confirms `next.config.ts`'s `output: "export"` works end to
end). No test files exist yet under `/tests` (only READMEs), so `npm test` has nothing
to run — that's expected, not a failure; add tests alongside real formula
implementations, not before.
**Note:** `npm install` reported 7 audit vulnerabilities (5 moderate, 1 high, 1
critical), all in dev-only tooling (`esbuild`/`vite` transitively via `vitest`,
`postcss` transitively via `next`) — see ISS-8 below, tracked separately since it's a
dependency-hygiene item, not a build blocker.

### ISS-7 — "App repo not yet renamed to CapexIQ" (false alarm — one repo, not two)
**Area:** code
**What was flagged:** a session working on `design/` assumed the app code lived in a
separate repo not reachable from that environment, and flagged that it still needed the
CapexIQ rename.
**Resolution:** there is no separate app repo — this project is one folder
(`Roi_Calculator/`, becoming the single `CapexIQ` GitHub repo). The `/app`, `/formulas`,
`/equipment-data` etc. skeleton was built in this same session using "CapexIQ" from the
start (see `package.json`, `app/layout.tsx` metadata) — no old-name strings to fix.
Leaving this entry so the "two repos" assumption doesn't resurface.
