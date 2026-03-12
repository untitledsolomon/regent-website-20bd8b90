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
  const isBrowser = /mozilla|chrome|safari|firefox|edge|opera/i.test(userAgent)

  if (isBrowser) {
    return res.redirect(302, `/case-studies/${slug}`)
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
  <title>${data.title}</title>
  <meta name="description" content="${data.excerpt ?? ""}">
</head>
<body>
  <article>
    <h1>${data.title}</h1>
    ${data.content}
  </article>
</body>
</html>
`

  res.setHeader("Content-Type", "text/html")
  res.status(200).send(html)
}