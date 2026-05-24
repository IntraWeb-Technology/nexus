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
              group: ["./**", "../*"],
              allow: ["./_primitives/**", "./_primitives/*"],
              message:
                "Snapshot files must not import from sibling snapshot files. Only _primitives/ is permitted.",
            },
          ],
        },
      ],
    },
  },
]);
