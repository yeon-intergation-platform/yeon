import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/__tests__/**",
        "e2e/**",
        ".next/**",
        "scripts/**",
        "**/*.d.ts",
        "next-env.d.ts",
        "node_modules/**",
        "**/*.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
