import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  envDir: resolve(".."),
  base: process.env.VITE_BASE || "/",
  plugins: [
    react(),
    {
      name: "spa-fallback",
      closeBundle() {
        const index = resolve("dist/index.html");
        if (existsSync(index)) copyFileSync(index, resolve("dist/404.html"));
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
