import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Mirrors tsconfig.json's "paths" so app/ code can import equipment-data/content/
// formulas via the @/ aliases under both `next build` and `vitest run`. The react
// plugin is needed for .tsx test files (tsconfig's jsx: "preserve", Next.js's own
// setting, isn't a mode Vite's default esbuild JSX transform understands).
export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ["**/node_modules/**", "**/.claude/worktrees/**"],
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@/formulas": path.resolve(__dirname, "formulas"),
      "@/equipment-data": path.resolve(__dirname, "equipment-data"),
      "@/content": path.resolve(__dirname, "content"),
      "@/exports": path.resolve(__dirname, "exports"),
    },
  },
});
