import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
  eslintPluginPrettier,
  {
    ignores: [".astro", "**/*.d.ts", "dist", "node_modules"],
  },
]);
