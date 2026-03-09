import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://regent.systems";

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about", priority: "0.8", changefreq: "monthly" },
  { loc: "/platform", priority: "0.8", changefreq: "monthly" },
  { loc: "/capabilities", priority: "0.8", changefreq: "monthly" },
  { loc: "/industries", priority: "0.7", changefreq: "monthly" },
  { loc: "/case-studies", priority: "0.8", changefreq: "weekly" },
  { loc: "/blog", priority: "0.9", changefreq: "daily" },
  { loc: "/resources", priority: "0.7", changefreq: "weekly" },
  { loc: "/careers", priority: "0.6", changefreq: "weekly" },
  { loc: "/demo", priority: "0.7", changefreq: "monthly" },
  { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [blogRes, caseRes, resourceRes] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at").eq("published", true),
      supabase.from("case_studies").select("slug, updated_at").eq("published", true),
      supabase.from("resources").select("slug, updated_at").eq("published", true),
    ]);

    const urls: string[] = [];

    for (const page of staticPages) {
      urls.push(`  <url>
    <loc>${SITE}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    for (const post of blogRes.data || []) {
      urls.push(`  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    for (const cs of caseRes.data || []) {
      urls.push(`  <url>
    <loc>${SITE}/case-studies/${cs.slug}</loc>
    <lastmod>${new Date(cs.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    for (const r of resourceRes.data || []) {
      urls.push(`  <url>
    <loc>${SITE}/resources/${r.slug}</loc>
    <lastmod>${new Date(r.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8", ...corsHeaders },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
