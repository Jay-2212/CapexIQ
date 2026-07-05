# ISSUES.md — known problems, gaps, and open loops

A running list so nothing gets lost between sessions. Log something here the moment you
notice it, even if you don't fix it now — that's the whole point of this file. Don't
duplicate long explanations that already live elsewhere (e.g. `data-requirements.md`
§15) — link to them instead.

Status values: **open** (needs action), **accepted** (known, deliberately not fixing),
**resolved** (kept briefly for context, then pruned).

---

## Open

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
