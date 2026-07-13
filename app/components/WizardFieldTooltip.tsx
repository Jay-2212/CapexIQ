"use client";

// Wizard-field help text — ux-product-spec.md §4.B: no click-to-open popover inside
// the wizard. Definition + direction are always visible (no click needed); the
// remaining 5 slots expand inline below on "More info", collapsed by default and
// independent per field (opening one never opens another).

import { useId, useState } from "react";
import { getTooltipContent } from "../forms/tooltipCopy";

export function WizardFieldTooltip({ tooltipKey }: { tooltipKey: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const content = getTooltipContent(tooltipKey);

  if (!content) return null;

  return (
    <div className="wizard-field-tooltip">
      <p className="wizard-field-tooltip__definition">{content.definition}</p>
      <p className="wizard-field-tooltip__direction">{content.direction}</p>
      <button
        type="button"
        className="wizard-field-tooltip__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Less info" : "More info"}
      </button>
      {expanded && (
        <dl id={panelId} className="wizard-field-tooltip__panel">
          <dt>Typical value</dt>
          <dd>{content.defaultValue}</dd>
          <dt>Confidence</dt>
          <dd>{content.confidence}</dd>
          <dt>Source</dt>
          <dd>{content.sourceNote}</dd>
          <dt>How to estimate</dt>
          <dd>{content.howToEstimate}</dd>
          <dt>Why it matters</dt>
          <dd>{content.whyItMatters}</dd>
        </dl>
      )}
    </div>
  );
}
