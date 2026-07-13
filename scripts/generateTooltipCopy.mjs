// Regenerates content/tooltip-copy.generated.json from content/tooltip-copy.md.
// content/tooltip-copy.md stays the authoritative, human-edited source (Phase 3); this
// script is the one place that content gets parsed into the structured 7-slot shape
// the wizard's tooltip component reads at runtime — re-run it any time tooltip-copy.md
// changes: `node scripts/generateTooltipCopy.mjs`.

import { readFileSync, writeFileSync } from "node:fs";

const SLOT_KEYS = {
  Definition: "definition",
  Direction: "direction",
  "Default/typical value": "defaultValue",
  Confidence: "confidence",
  "Source note": "sourceNote",
  "How to estimate": "howToEstimate",
  "Why it matters": "whyItMatters",
};

const source = readFileSync(
  new URL("../content/tooltip-copy.md", import.meta.url),
  "utf-8"
);
const lines = source.split("\n");
const entries = {};
let currentKey = null;
let currentEntry = null;

for (const line of lines) {
  const headingMatch = /^(###|####) (.+)$/.exec(line);
  if (headingMatch) {
    currentKey = headingMatch[2].trim();
    currentEntry = {
      definition: "",
      direction: "",
      defaultValue: "",
      confidence: "",
      sourceNote: "",
      howToEstimate: "",
      whyItMatters: "",
    };
    entries[currentKey] = currentEntry;
    continue;
  }

  if (!currentEntry) continue;
  const slotMatch = /^- \*\*(.+?):\*\* (.+)$/.exec(line);
  if (slotMatch) {
    const slotKey = SLOT_KEYS[slotMatch[1].trim()];
    if (slotKey) currentEntry[slotKey] = slotMatch[2].trim();
  }
}

const outputPath = new URL(
  "../content/tooltip-copy.generated.json",
  import.meta.url
);
writeFileSync(outputPath, JSON.stringify(entries, null, 2) + "\n");
console.log(
  `Wrote ${Object.keys(entries).length} tooltip entries to content/tooltip-copy.generated.json`
);
