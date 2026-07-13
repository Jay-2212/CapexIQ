"use client";

import { useId, useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { useWizard } from "../forms/WizardContext";
import { GroupA } from "./GroupA";
import { GroupB } from "./GroupB";
import { GroupC } from "./GroupC";
import { GroupD } from "./GroupD";
import { GroupE } from "./GroupE";
import { GroupF } from "./GroupF";

const TOPICS = [
  { id: "A", label: "Payers & collection", note: "Realization, deductions and payment delays", component: GroupA },
  { id: "B", label: "Demand ramp-up", note: "A more realistic first year", component: GroupB },
  { id: "C", label: "Financing", note: "Loan or lease structure", component: GroupC },
  { id: "D", label: "Before opening", note: "Civil work, approvals and buffer", component: GroupD },
  { id: "E", label: "Lifecycle", note: "Maintenance and major replacements", component: GroupE },
  { id: "F", label: "Finance assumptions", note: "Discount rate, life and escalation", component: GroupF },
] as const;

export function AdvancedPanel() {
  const { state, dispatch } = useWizard();
  const [activeTopic, setActiveTopic] = useState<(typeof TOPICS)[number]["id"]>("A");
  const panelId = useId();
  const active = TOPICS.find((topic) => topic.id === activeTopic) ?? TOPICS[0];
  const ActiveGroup = active.component;

  return (
    <section className="advanced-panel">
      <div className="mode-choice">
        <div className="mode-choice__icon"><SlidersHorizontal aria-hidden="true" size={24} /></div>
        <div>
          <span className="narrative-intro__eyebrow">Want a more precise answer?</span>
          <h2>Refine the assessment in Advanced Mode.</h2>
          <p>Your Basic assessment is already complete. Advanced Mode lets you add payer mix, financing, launch timing and lifecycle detail—one topic at a time.</p>
        </div>
        <button
          type="button"
          className="advanced-panel__toggle"
          aria-expanded={state.advancedOpen}
          aria-controls={panelId}
          onClick={() => dispatch({ type: "TOGGLE_ADVANCED" })}
        >
          {state.advancedOpen ? "Close Advanced Mode" : "Enter Advanced Mode"}
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      {state.advancedOpen && (
        <div id={panelId} className="advanced-workspace">
          <nav className="advanced-workspace__topics" aria-label="Advanced topics">
            {TOPICS.map((topic, index) => (
              <button key={topic.id} type="button" data-active={topic.id === activeTopic} onClick={() => setActiveTopic(topic.id)}>
                <span className="advanced-workspace__number">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{topic.label}</strong><small>{topic.note}</small></span>
              </button>
            ))}
          </nav>
          <div className="advanced-workspace__content" key={active.id}>
            <div className="advanced-workspace__heading">
              <span className="narrative-intro__eyebrow">Advanced · {active.id}</span>
              <h2>{active.label}</h2>
              <p>{active.note}. Use your own figures where available; otherwise the Basic assumption stays in place.</p>
            </div>
            <ActiveGroup />
          </div>
        </div>
      )}
    </section>
  );
}
