import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import sitemap from "vite-plugin-sitemap";
import fs from "fs";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Ensure dist exists first
    {
      name: "ensure-dist",
      buildStart() {
        if (!fs.existsSync("dist")) fs.mkdirSync("dist");
      },
    },
    sitemap({
      hostname: "https://www.regentplatform.com",
      outDir: "dist",
      robots: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));