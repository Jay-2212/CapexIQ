// Component-level coverage for two behaviors ISS-21 flagged as untested even after
// components.test.tsx was added: the route guard's redirect, and the cross-tab
// conflict banner actually firing end-to-end. Both are exercisable in jsdom (real
// DOM StorageEvent, real React effects) without a working browser connection — this
// narrows, but does not close, ISS-21's remaining gap (still nothing visual/layout,
// still no real multi-tab browser session).

import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { WizardProvider, useWizard } from "../../app/forms/WizardContext";
import { RouteGuard } from "../../app/forms/RouteGuard";
import { useWizardPersistence } from "../../app/forms/useWizardPersistence";
import { STORAGE_KEY, serializeDraft } from "../../app/forms/draftStorage";
import { emptyWizardState } from "../../app/forms/initialState";

let mockPathname = "/assess";
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

describe("RouteGuard — redirects to the earliest incomplete step (wizard-state.md §2)", () => {
  it("landing directly on /assess/usage with nothing filled in redirects to /assess (preStep)", () => {
    mockPathname = "/assess/usage";
    replaceMock.mockClear();

    render(
      <WizardProvider>
        <RouteGuard />
      </WizardProvider>
    );

    expect(replaceMock).toHaveBeenCalledWith("/assess");
  });
});

function PersistenceHarness() {
  const { state, dispatch } = useWizard();
  const persistence = useWizardPersistence(state, dispatch);
  return <div data-testid="conflict-banner">{String(persistence.conflictBannerVisible)}</div>;
}

describe("useWizardPersistence — cross-tab conflict banner (wizard-state.md §7.3 point 1, ISS-15)", () => {
  it("shows the banner when another tab's storage write is newer than the one this tab loaded", () => {
    mockPathname = "/assess";
    const loadedSavedAt = new Date(Date.now() - 60_000).toISOString();
    window.localStorage.setItem(
      STORAGE_KEY,
      serializeDraft(emptyWizardState(), loadedSavedAt)
    );

    render(
      <WizardProvider>
        <PersistenceHarness />
      </WizardProvider>
    );

    expect(screen.getByTestId("conflict-banner")).toHaveTextContent("false");

    const newerSavedAt = new Date().toISOString();
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: serializeDraft(emptyWizardState(), newerSavedAt),
        })
      );
    });

    expect(screen.getByTestId("conflict-banner")).toHaveTextContent("true");

    window.localStorage.removeItem(STORAGE_KEY);
  });

  it("does NOT show the banner for a storage event from an unrelated key", () => {
    mockPathname = "/assess";
    const loadedSavedAt = new Date(Date.now() - 60_000).toISOString();
    window.localStorage.setItem(
      STORAGE_KEY,
      serializeDraft(emptyWizardState(), loadedSavedAt)
    );

    render(
      <WizardProvider>
        <PersistenceHarness />
      </WizardProvider>
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "some-other-app-key", newValue: "irrelevant" })
      );
    });

    expect(screen.getByTestId("conflict-banner")).toHaveTextContent("false");

    window.localStorage.removeItem(STORAGE_KEY);
  });
});
