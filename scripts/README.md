One-off build/content scripts, run manually (not part of `npm run build`).

- `generateTooltipCopy.mjs` — parses `content/tooltip-copy.md` into
  `content/tooltip-copy.generated.json`, the machine-readable shape
  `app/forms/tooltipCopy.ts` reads at runtime. Re-run (`node
  scripts/generateTooltipCopy.mjs`) any time `tooltip-copy.md` changes; the generated
  file is committed but not hand-edited.
