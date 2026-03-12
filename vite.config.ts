import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import sitemap from "vite-plugin-sitemap";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function getDynamicRoutes() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  )

  const [{ data: posts }, { data: caseStudies }] = await Promise.all([
    supabase.from("blog_posts").select("slug"),
    supabase.from("case_studies").select("slug"),
  ])

  const blogRoutes = (posts || []).map((p: { slug: string }) => `/api/blog/${p.slug}`)
  const caseRoutes = (caseStudies || []).map((c: { slug: string }) => `/api/case-studies/${c.slug}`)

  return [...blogRoutes, ...caseRoutes]
}

export default defineConfig(async ({ mode }) => {
  const dynamicRoutes = await getDynamicRoutes()

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "ensure-dist",
        buildStart() {
          if (!fs.existsSync("dist")) fs.mkdirSync("dist");
        },
      },
      sitemap({
        hostname: "https://www.regentplatform.com",
        outDir: "dist",
        dynamicRoutes,
        robots: [{ userAgent: "*", allow: "/" }],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})