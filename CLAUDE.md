# CapexIQ project instructions

See `~/.claude/CLAUDE.md` for the advisor-triage workflow (form a read → sanity-check
with the `advisor` tool → resolve and keep moving, escalate rarely) and the
Claude-in-Chrome preload habit. Both apply here.

## Escalation carve-outs for this project

Never resolve these with the advisor alone — always bring them to Jay:

- Anything methodology- or benchmark-related. Every number must trace to
  `data-requirements.md`; never invent or approximate one.
- Scoring weights, thresholds, or other product-judgment constants.
- Anything flagged in project memory as a standing pause (e.g. a UI/UX design
  freeze) unless Jay has explicitly lifted it.

## Mechanical follow-through

Once Jay has agreed to a direction in conversation, proceed straight through
write → commit → push → open/merge PR without re-asking at each git step.
