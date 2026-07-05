# Rebrand brief — CapexIQ (was "Healthcare Capex Decision Support Tool")

Handed to whoever produced the original design system, so they can update it. Not a
request for new design work — the visual language is staying, only the identity layer
changes.

---

## What changed

- **Name:** CapexIQ (was the placeholder "Healthcare Capex Decision Support Tool")
- **Tagline:** "Know if it pays for itself, before you buy it."
- **URL:** `capexiq.jaybharti.me` (a subdomain, linked from the portfolio — was
  `jaybharti.me/roi`, a path)

Nothing about the product changed. Still a decision-support tool for Indian hospital
administrators, COOs, and CFOs deciding whether to buy equipment (MRI, CT, Cath Lab,
dialysis, ultrasound). Same serious/professional tone, same audience, same green/amber/
red Investment Outlook status system. The name was deliberately picked to be plain and
safe — "sounds like a product," not clever — so don't over-design around it; a small
amount of "intelligence/analysis" flavor in the mark is welcome but not required.

## What needs a pass

1. **`logo-lockup.svg`** — wordmark currently reads the old full name. Needs to become
   "CapexIQ" as the primary wordmark. The existing icon mark (pulse line → ascending
   bars) is fine to keep as-is; only change it if you think it should lean slightly more
   "analysis/intelligence" to match the "IQ" in the name — your call, but flag it if you
   do, since the favicon and OG image both derive from this mark.
2. **`favicon-mark.svg` + `favicon-exports/`** — same mark; if you change it in #1,
   re-export all sizes (16/32/48/180/512px). If you don't change the mark, no action
   needed here.
3. **`og-image.svg` / `og-image.png`** (1200×630) — currently built around the old name;
   swap in "CapexIQ" + the tagline above (shorten the tagline if it doesn't fit the
   layout at that size).
4. **`site.webmanifest`** — update `name` / `short_name` fields to CapexIQ.
5. **`head-tags-snippet.html`** — update the `<title>` and any OG/Twitter meta text that
   references the old name.
6. **`dashboard-mockup.svg`** — check for literal text referencing the old name; the
   dashboard layout/content itself (Investment Outlook gauge, metric cards, charts)
   doesn't need to change.

## What does NOT need to change

Colors (`tokens.css`, `colors.md`), equipment photography, persona photography, icons,
fonts, `hero-background.svg`. This is a naming/identity pass, not a new design system.

## Optional, nice-to-have

A small lockup variant — icon + "CapexIQ" + tagline in small type underneath — for use
in the landing page hero, if it's easy to produce alongside the header logo. Skip it if
it adds real time; the header lockup is the one that's actually required.
