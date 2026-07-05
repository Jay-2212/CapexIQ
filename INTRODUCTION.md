# INTRODUCTION.md — start here

Welcome. If you're an agent (or human) picking this project up, this file is your
briefing. Read it once, in full — it's short on purpose.

---

## What this project is

**CapexIQ** ("Know if it pays for itself, before you buy it.") — a web tool at
`capexiq.jaybharti.me` that helps Indian hospital owners, administrators, COOs, and
CFOs decide whether buying a piece of equipment (MRI, CT, Cath Lab, dialysis unit,
ultrasound, or custom equipment) is financially viable. It's simple enough for an
administrator, deep enough for a CFO: ROI, payback, NPV, IRR, break-even usage,
cash-flow timing, revenue realization, working capital gaps, and export-ready
Excel/Word proposals.

Renamed from the placeholder "Healthcare Capex Decision Support Tool" on 2026-07-05.
It lives as its own subdomain (linked from the portfolio), not a path inside it — see
`HANDOFF.md`'s 2026-07-05 entry for the full rebrand rationale.

For anything about *what the product does or why* — go to `SPEC.md`. Don't ask "what is
this project" again once you've read this file; the answer lives there in full, with an
index at the top so you can jump to the section you need.

---

## Reading order (do this before doing anything else)

1. **INTRODUCTION.md** — this file. What the project is, and the rules below.
2. **HANDOFF.md** — where things currently stand, and what the last agent did.
3. **DIRECTORY.md** — the map of the codebase: what exists, where, and what it's for.
4. **ISSUES.md** — open problems/gaps being tracked. Check before assuming something's
   fine; add to it the moment you spot something wrong, even if you don't fix it now.
5. **SPEC.md** — the full product spec, only when you need the detail behind a decision.

You don't need to read SPEC.md front-to-back. Use its index. You *do* need to read
HANDOFF.md, DIRECTORY.md, and ISSUES.md every time — they're short by design.

---

## Rules for working in this project

1. **Update HANDOFF.md before you finish.** Every session, no exceptions. Overwrite the
   "Current State" block at the top, add one dated entry to the log below it. If you
   didn't update it, the next agent starts blind — that's the one thing that breaks this
   whole system.

2. **If you create a new folder, put an info file in it.** A `README.txt` or
   `sources.txt` — whatever fits — following the pattern already used throughout this
   project (see `equipment-images/sources.txt`, `people-personas/sources.txt`,
   `design/README.txt`, `icons/README.txt`, `fonts/README.txt`). State what's in the
   folder, where it came from, and any license/attribution or known quirks. The next
   agent should never have to guess.

3. **Don't duplicate content across files.** DIRECTORY.md points to README/sources files
   rather than copying their contents. SPEC.md is the one source of product truth. If
   you're about to paste the same paragraph into two files, add a pointer instead.

4. **Keep it context-friendly.** Context is limited and expensive. Prefer short files
   that point to the right place over long files that repeat everything. If a file is
   growing past its purpose (see HANDOFF.md's archive rule), prune it rather than let it
   bloat.

5. **Don't invent data.** Per SPEC.md §24 and §36 — no fabricated benchmarks, pricing,
   or utilization ranges. If something's unresearched, say so and flag it, don't guess a
   plausible-sounding number.

6. **Files in the user's Documents folder can't be deleted or renamed without asking.**
   If you need to remove or rename something here, request permission first.

7. **Track problems in ISSUES.md as you find them.** Don't let a known bug, gap, or
   quirk live only in your own head or a chat transcript. Log it — even a one-line entry
   — the moment you notice it, whether or not you fix it in the same session.

---

## What's already done vs. what's next

Visual/design assets (equipment photos, persona photos + transparent cutouts, icons,
fonts, color system, dashboard mockup, logo, favicon, hero background, OG image, PWA
manifest), `data-requirements.md` (research brief + first-pass findings on real Indian
healthcare-equipment data), the rebrand to CapexIQ, and a skeletal Next.js code
structure are complete — see DIRECTORY.md for the map.

Not yet built: real equipment data filled into the JSON files (skeleton has placeholders
only), content/copy files (methodology, disclaimer, glossary, tooltip copy), report
templates, formula implementations, and UI components. Check HANDOFF.md's Current State
block — it will say exactly what's next and why.

---

That's the whole briefing. Go read HANDOFF.md next.
