import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "intraweb-tech-website/**"]),
  {
    files: ["components/snapshots/**/*.{ts,tsx}"],
    ignores: ["components/snapshots/_primitives/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message:
                "Snapshot files may not import from sibling snapshot files. " +
                "Only ./_primitives/* imports are permitted. " +
                "See QUICK-REFERENCE.md rule C-01.",
            },
          ],
        },
      ],
    },
  },
]);
