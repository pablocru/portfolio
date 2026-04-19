// @ts-check
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      GITHUB_USERNAME: envField.string({ context: "server", access: "public" }),
    },
    validateSecrets: true,
  },
});
