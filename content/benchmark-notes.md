# Benchmark Notes — how to read a benchmark shown in this tool

Every default value or suggested range in this tool (in a tooltip, a slider's starting
position, or a report footnote) traces back to `data-requirements.md` — a single
internal source-of-truth file that records where every number came from, how strong
the evidence is, and where it doesn't apply. This page explains that system in plain
language, for anyone reading a report or using the tool who isn't going to go read that
file directly.

---

## 1. What "confidence" means

Every benchmark is tagged with exactly one of four confidence levels. These describe
**how strong the evidence is**, not how big or small the number is:

- **High** — an official, current source: a government tariff schedule, a statutory
  rule (e.g. the Companies Act's useful-life table), a direct vendor quote, or multiple
  independent strong sources that agree with each other.
- **Medium** — a credible source, but narrower than ideal: local rather than
  nationwide, a bit dated, based on one hospital's or one tender's experience rather
  than a broad survey, or a figure that needs some judgment to apply to your situation.
- **Low** — a weak source: a broad market claim without clear methodology, an
  inference drawn from adjacent information rather than a direct statement, or only
  one indirect source.
- **Unavailable** — no responsible source was found at all. In the underlying data
  (`data-requirements.md`, `equipment-data/*.json`), the value stays `null` rather than
  a guess. In most cases the wizard field itself is then also left blank for you to
  fill in — with one deliberate exception, target IRR/hurdle rate, noted below.

**A number with High confidence is still a general pattern, not your hospital's
number.** Even a well-sourced benchmark (say, a government CGHS reimbursement rate)
describes what applies broadly — it doesn't know your city, your payer mix, your
vendor's actual quote, or your negotiating position. Always prefer your own primary
data (a vendor quotation, your tariff sheet, your lender's actual sanction terms, your
own utilization history) over any benchmark shown here, at any confidence level.

## 2. Why some fields show no default at all

Several fields in this tool are intentionally left blank rather than filled with a
plausible-looking guess — inflation rate is one example (not yet consumed by any
formula in this version, and collected only for future use). This is a deliberate
choice, not a gap someone forgot to fill: a field with no evidence behind it is more
honest left blank than papered over with an invented number that merely looks
authoritative. See `ISSUES.md` for the running list of what's currently unresearched
and why.

**One exception, deliberately not left blank: target IRR/hurdle rate.** No Indian
hospital/investor benchmark for this is publicly disclosed anywhere, even after
multiple dedicated research passes — the underlying data stays `Unavailable`, same as
any other unresearched field. But because this field is required to move past the
Investment step and sits inside the optional Advanced Mode panel, leaving it truly
blank would stop a casual (Basic Mode) user from ever reaching a result. **Resolved
2026-07-12:** the wizard instead pre-fills it with a plainly-labeled *heuristic*
(your discount rate plus roughly 4 percentage points) — never presented as a
benchmark, always tagged "Typical" and editable, and different in kind from every
other default in this tool, which is a cited number. If you know your institution's
actual hurdle rate, replace it in Advanced Mode.

## 3. Why one number sometimes looks "generic" across several equipment types

A few benchmarks (most notably AMC labour-only maintenance cost) are the same figure
repeated across multiple equipment types. That's not an oversight — it means the
underlying research found one generic source (e.g. a single tender clause) that
applied broadly, rather than five independent equipment-specific figures. Where this
is the case, the field's own note says so explicitly. Treat a shared generic figure as
weaker evidence for your specific equipment than a figure that was researched
specifically for that equipment type — even if both happen to carry the same
confidence label.

## 4. Why a benchmark sometimes looks like a range, not one number

Where research found multiple sources that disagreed, or a single source that gave a
range rather than one figure, the tool shows low/typical/high rather than a single
default — and, where a real unresolved contradiction exists between sources (rather
than just a normal range), both figures are shown side by side with an explanation,
not silently averaged into one number. Averaging two genuinely different things (for
example, a contractual ceiling vendors are allowed to charge, versus one hospital's
actual negotiated cost) would hide the disagreement instead of informing your decision.

## 5. What to actually do with a benchmark

1. Read the field's tooltip for its specific confidence level and source.
2. If you have your own data (a vendor quote, your tariff sheet, your own utilization
   numbers, your lender's actual terms) — use that instead. It always beats a
   benchmark, regardless of confidence level.
3. If you don't have your own data yet, the benchmark is a reasonable starting point
   for exploring the model — not a number to lock in before making a real capital
   decision. Treat Low-confidence and Unavailable fields with particular caution;
   consider running the sensitivity analysis with a range around them rather than
   trusting a single point estimate.
4. Before using this tool's output to support an actual investment decision, loan
   application, or board presentation, replace benchmark-sourced figures with your own
   primary data wherever you can get it — see `report-templates/disclaimer.md`.
