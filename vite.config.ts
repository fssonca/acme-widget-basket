import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist/web" },
  server: { proxy: { "/api": "http://localhost:3000" } },
  test: { include: ["src/**/*.test.ts"], passWithNoTests: true },
});
