# ISSUES.md — known problems, gaps, and open loops

A running list so nothing gets lost between sessions. Log something here the moment you
notice it, even if you don't fix it now — that's the whole point of this file. Don't
duplicate long explanations that already live elsewhere (e.g. `data-requirements.md`
§15) — link to them instead.

Status values: **open** (needs action), **accepted** (known, deliberately not fixing),
**resolved** (kept briefly for context, then pruned).

---

## Open

### ISS-1 — Skeleton not build-verified
**Area:** code / tooling
**Status:** open
**What:** Node.js, npm, and wrangler are not installed in the environment this skeleton
was built in, so the Next.js scaffold in `/app` etc. has never been through
`npm install` or `npm run build`. It's structurally right per SPEC.md §32 but unverified.
**Next action:** first agent/session with a working Node environment should run
`npm install && npm run build` and fix whatever breaks before assuming the skeleton
actually compiles.

### ISS-2 — Cloudflare Pages + DNS not yet wired up for capexiq.jaybharti.me
**Area:** infra
**Status:** open
**What:** The repo exists on GitHub, but nothing connects it to Cloudflare Pages, and no
DNS record for the `capexiq` subdomain exists yet. This is a dashboard action (Cloudflare
account access), not something doable from this environment.
**Next action:** in Cloudflare dashboard — create a Pages project connected to the
CapexIQ GitHub repo, then add a CNAME/subdomain record for `capexiq.jaybharti.me`
pointing at that Pages project, same pattern as the main `jaybharti.me` site.

### ISS-3 — Equipment data files are placeholders, not real data
**Area:** data
**Status:** open
**What:** `/equipment-data/*.json` exist as schema-shaped placeholders (see
`equipment-data/README.txt`), not filled in with the real assumptions from
`data-requirements.md` §14.
**Next action:** populate from `data-requirements.md` §14's starter assumptions table,
per SPEC.md §32.1.

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
