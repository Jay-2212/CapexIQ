// Loads content/tooltip-copy.generated.json (see scripts/generateTooltipCopy.mjs) —
// the 7-slot tooltip content, keyed by the same string content/inputs-metadata.json's
// tooltipKey points to.

import generated from "@/content/tooltip-copy.generated.json";

export interface TooltipContent {
  definition: string;
  direction: string;
  defaultValue: string;
  confidence: string;
  sourceNote: string;
  howToEstimate: string;
  whyItMatters: string;
}

const entries = generated as Record<string, TooltipContent>;

export function getTooltipContent(key: string | null): TooltipContent | null {
  if (!key) return null;
  return entries[key] ?? null;
}
