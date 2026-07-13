// wizard-state.md §7.2's save/load rules — the schemaVersion-mismatch-discards-
// silently contract and the write-failure-returns-false contract, both exercised
// directly against a stubbed localStorage rather than a full component mount.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraftFromStorage,
  deserializeDraft,
  readDraftFromStorage,
  writeDraftToStorage,
  STORAGE_KEY,
} from "../../app/forms/draftStorage";
import { emptyWizardState } from "../../app/forms/initialState";

describe("deserializeDraft", () => {
  it("returns null for malformed JSON, not a thrown error", () => {
    expect(deserializeDraft("{not valid json")).toBeNull();
  });

  it("returns null for a schemaVersion mismatch (clean break, no migration attempt)", () => {
    const raw = JSON.stringify({ schemaVersion: 999, savedAt: "x", state: {} });
    expect(deserializeDraft(raw)).toBeNull();
  });

  it("parses a well-formed, current-schema draft", () => {
    const state = emptyWizardState();
    const raw = JSON.stringify({ schemaVersion: 1, savedAt: "2026-07-13T00:00:00.000Z", state });
    const result = deserializeDraft(raw);
    expect(result).not.toBeNull();
    expect(result?.state.schemaVersion).toBe(1);
  });
});

describe("writeDraftToStorage / readDraftFromStorage round-trip", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("writes and reads back an identical state", () => {
    const state = emptyWizardState();
    const succeeded = writeDraftToStorage(state, "2026-07-13T00:00:00.000Z");
    expect(succeeded).toBe(true);

    const draft = readDraftFromStorage();
    expect(draft).not.toBeNull();
    expect(draft?.state.currentStep).toBe("preStep");
  });

  it("clearDraftFromStorage removes the key", () => {
    writeDraftToStorage(emptyWizardState(), "2026-07-13T00:00:00.000Z");
    clearDraftFromStorage();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("writeDraftToStorage failure handling (quota / private-browsing mode)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false instead of throwing when localStorage.setItem throws", () => {
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const succeeded = writeDraftToStorage(emptyWizardState(), "2026-07-13T00:00:00.000Z");
    expect(succeeded).toBe(false);
  });
});
