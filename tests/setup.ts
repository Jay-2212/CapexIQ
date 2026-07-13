// Vitest global setup. Provides a minimal, deterministic in-memory localStorage
// polyfill: this environment's jsdom + Node combination leaves `window.localStorage`
// undefined for reasons unrelated to product code (verified against a raw `new
// JSDOM()` instantiation outside vitest, which works fine — this is specific to how
// vitest's jsdom-environment pool wires globals under the Node version this repo
// currently runs on). A real browser always has a working localStorage; this shim
// only needs to be correct enough to exercise app/forms/draftStorage.ts's own
// try/catch and round-trip behavior.

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

if (typeof window !== "undefined" && !window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}

// jsdom doesn't implement scrollIntoView (it does no layout) — every real browser
// does, so this is a test-environment gap, not a product bug.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  window.localStorage?.clear();
  // No render() call in this suite was unmounting between tests (React Testing
  // Library's auto-cleanup needs an explicit afterEach under vitest, unlike Jest) —
  // harmless while every test file rendered only one component per file, but a real
  // bug once a file needs more than one render() (see routeGuardAndPersistence.test.tsx).
  cleanup();
});
