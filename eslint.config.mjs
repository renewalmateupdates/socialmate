import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Style only: an apostrophe or quote in JSX text renders fine. The guides,
      // terms and privacy pages are long prose and tripped this 541 times.
      "react/no-unescaped-entities": "off",
      // Kept visible as warnings, so `npm run lint` can gate real errors. 354
      // `any` types predate the lint setup; tighten them as files are touched.
      "@typescript-eslint/no-explicit-any": "warn",
      // React Compiler advisories. The compiler is not enabled in next.config.ts,
      // so these describe what it would refuse to optimize, not runtime bugs
      // (each "used before declared" hit was checked: all run inside effects).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      // `let { data, error } = ...` where only `data` is reassigned is fine.
      "prefer-const": ["error", { destructuring: "all" }],
    },
  },
  {
    // Node CLI scripts written as CommonJS.
    files: ["scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not app source: Claude Code worktrees (each holds a full checkout and its
    // own .next build) and the Capacitor Android project with its build output.
    ".claude/**",
    "android/**",
  ]),
]);

export default eslintConfig;
