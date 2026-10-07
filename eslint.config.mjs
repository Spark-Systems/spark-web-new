import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design reference for the admin (its own app with its own dependencies); not part of this build.
    "reference-admin/**",
    // The backend's build output and dependencies (its source in backend/src is linted).
    "backend/dist/**",
    "backend/node_modules/**",
  ]),
]);

export default eslintConfig;
