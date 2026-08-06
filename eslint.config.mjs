// Flat ESLint config (ESLint 9), replacing the interactive `next lint` prompt that
// `npm run lint` used to hang on — this repo never had an eslint config committed, so
// `next lint` fell back to an interactive "how would you like to configure ESLint?"
// wizard, which is unusable in CI or a non-interactive session. `eslint-config-next`
// is pinned to the exact installed `next` version (15.5.22) in package.json.

import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      ".claude/worktrees/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
