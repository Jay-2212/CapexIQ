// Pure read/write/parse helpers for the localStorage draft — wizard-state.md §7.1's
// "capexiq.wizardDraft.v1" schema. Kept side-effect-light and framework-free so they're
// unit-testable without mounting a component; app/forms/useWizardPersistence.ts wires
// these into React's lifecycle (debounce, the storage event, effect timing).

import type { WizardState } from "./wizardTypes";

export const STORAGE_KEY = "capexiq.wizardDraft.v1";
export const SCHEMA_VERSION = 1;

export interface StoredDraft {
  schemaVersion: number;
  savedAt: string;
  state: WizardState;
}

export function serializeDraft(state: WizardState, savedAt: string): string {
  const draft: StoredDraft = { schemaVersion: SCHEMA_VERSION, savedAt, state };
  return JSON.stringify(draft);
}

/** Returns null for anything that isn't a current-schema, well-formed draft — the
 *  caller's job is to discard silently on null, never to attempt a migration
 *  (wizard-state.md §7.2: "a version bump is a clean break, not a migration
 *  project"). */
export function deserializeDraft(raw: string): StoredDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (
      parsed.schemaVersion !== SCHEMA_VERSION ||
      typeof parsed.savedAt !== "string" ||
      typeof parsed.state !== "object" ||
      parsed.state === null
    ) {
      return null;
    }
    return parsed as StoredDraft;
  } catch {
    return null;
  }
}

export function readDraftFromStorage(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  return deserializeDraft(raw);
}

/** Returns false on any write failure (quota exceeded, Safari private-browsing mode,
 *  which throws on every localStorage call) — wizard-state.md §7.3 point 3: the
 *  caller must degrade to in-memory-only, never crash the wizard over a failed save. */
export function writeDraftToStorage(state: WizardState, savedAt: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(state, savedAt));
    return true;
  } catch {
    return false;
  }
}

export function clearDraftFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if even removal fails (e.g. private-browsing mode) — there's
    // no user-facing consequence since the in-memory state is cleared regardless.
  }
}
