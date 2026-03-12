// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment:    "node",
    includeSource:  ["lib/**/*.ts"],
    globals:        true,
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
