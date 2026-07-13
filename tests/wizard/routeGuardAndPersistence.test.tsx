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

// RouteGuard gates its redirect on state.hasHydrated (only set once
// useWizardPersistence's mount-load effect resolves — restored or confirmed-absent
// draft) to avoid redirecting against the pre-restore blank state on a real page
// load. Since RouteGuard and useWizardPersistence are mounted as siblings in the
// real app (app/(assessment)/layout.tsx's AssessmentShell), this harness mounts both
// together too, rather than RouteGuard alone, to match that composition.
function RouteGuardHarness() {
  const { state, dispatch } = useWizard();
  useWizardPersistence(state, dispatch);
  return <RouteGuard />;
}

describe("RouteGuard — redirects to the earliest incomplete step (wizard-state.md §2)", () => {
  it("landing directly on /assess/usage with nothing filled in redirects to /assess (preStep)", () => {
    mockPathname = "/assess/usage";
    replaceMock.mockClear();
    window.localStorage.removeItem(STORAGE_KEY);

    render(
      <WizardProvider>
        <RouteGuardHarness />
      </WizardProvider>
    );

    expect(replaceMock).toHaveBeenCalledWith("/assess");
  });

  it("regression: a deep link with a complete saved draft is NOT bounced to preStep (previously always redirected — the mount-order race between this effect and useWizardPersistence's restore)", () => {
    mockPathname = "/assess/investment";
    replaceMock.mockClear();

    const draftState = {
      ...emptyWizardState(),
      currentStep: "investment" as const,
      preStep: {
        equipmentCategory: "MRI" as const,
        hospitalName: "Lotus Hospital",
        hospitalBedSize: 150,
        cityTier: "Tier 1" as const,
        hospitalType: null,
        equipmentNameModel: "",
      },
    };
    window.localStorage.setItem(STORAGE_KEY, serializeDraft(draftState, new Date().toISOString()));

    render(
      <WizardProvider>
        <RouteGuardHarness />
      </WizardProvider>
    );

    expect(replaceMock).not.toHaveBeenCalledWith("/assess");
    window.localStorage.removeItem(STORAGE_KEY);
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
