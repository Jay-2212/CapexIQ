"use client";

// "Start over" — wizard-state.md §7.2: a low-weight text link, present on every
// /assess/* step and /results, with an inline "click again to confirm" state instead
// of a native confirm() dialog (this project's own convention against triggering
// browser dialogs).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "../forms/WizardContext";

export function StartOver({ clearDraft }: { clearDraft: () => void }) {
  const { dispatch } = useWizard();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  return (
    <button
      type="button"
      className="start-over"
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          return;
        }
        dispatch({ type: "START_OVER" });
        clearDraft();
        setConfirming(false);
        router.push("/assess");
      }}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? "Click again to confirm — this clears your progress" : "Start over"}
    </button>
  );
}
