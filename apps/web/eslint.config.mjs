import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["components/AccessibilityToggle.tsx", "components/AdminPanel.tsx", "components/ContactsMapLeaflet.tsx", "components/PsychologicalTestRunner.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" }
  },
  {
    files: ["components/PsychologicalTestRunner.tsx"],
    rules: { "@next/next/no-img-element": "off" }
  },
  globalIgnores([".next/**", "assets/**", ".verification/**", "playwright-report/**", "test-results/**", "next-env.d.ts"])
]);
