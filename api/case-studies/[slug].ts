import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { slug } = req.query

  if (!slug || typeof slug !== "string") {
    return res.status(400).send("Invalid slug")
  }

  const userAgent = req.headers["user-agent"] || ""
  const isRealBrowser = /mozilla|chrome|safari|firefox|edge|opera/i.test(userAgent)
    && !/bot|crawler|spider|chatgpt|gptbot|openai|anthropic|claude|facebookexternalhit|twitterbot|linkedinbot|slurp|baiduspider|yandex/i.test(userAgent)

  if (isRealBrowser) {
    return res.status(200).send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="refresh" content="0;url=/case-studies/${slug}">
    <title>Redirecting...</title>
  </head>
  <body></body>
  </html>
    `)
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send("Missing Supabase environment variables")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return res.status(404).send("Post not found")
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${data.meta_title || data.title}</title>
    <meta name="description" content="${data.meta_description || data.summary || ""}">
  </head>
  <body>
    <article>
      <h1>${data.title}</h1>
      <p>${data.summary || ""}</p>
      <h2>Challenge</h2>
      ${data.challenge || ""}
      <h2>Solution</h2>
      ${data.solution || ""}
      <h2>Results</h2>
      <ul>
        ${(data.results || []).map((r: string) => `<li>${r}</li>`).join("")}
      </ul>
      <h2>Metrics</h2>
      <ul>
        ${(data.metrics || []).map((m: { value: string, label: string }) => `<li>${m.value} — ${m.label}</li>`).join("")}
      </ul>
    </article>
  </body>
  </html>
  `

  res.setHeader("Content-Type", "text/html")
  res.status(200).send(html)
}