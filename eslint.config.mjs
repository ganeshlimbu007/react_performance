import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

/**
 * Hooks lint, scoped to the Part 3 labs only.
 *
 * app/render-lab is ignored explicitly: Part 1 is a diagnosis exercise and must
 * not be analysed, annotated or reported on here.
 *
 * Findings inside the labs are EXPECTED — they are the teaching material — so
 * `npm run lint:hooks` never fails the shell, and nothing in a lab is
 * suppressed with a disable comment.
 */
const LAB_FILES = [
  "app/shapes-lab/**/*.{ts,tsx}",
  "app/compiler-lab/**/*.{ts,tsx}",
  "app/paint-lab/**/*.{ts,tsx}",
];

export default [
  {
    ignores: [
      "app/render-lab/**",
      ".next/**",
      "node_modules/**",
      "perf/**",
      "scripts/**",
    ],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: LAB_FILES,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
