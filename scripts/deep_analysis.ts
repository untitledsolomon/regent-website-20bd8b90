
import { createServiceClient } from "../src/lib/supabase/service";

async function analyze() {
  const supabase = createServiceClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!posts) return;

  const analysis = {
    total_posts: posts.length,
    title_structures: [] as string[],
    avg_word_count: 0,
    heading_patterns: {} as Record<string, number>,
    linking_styles: [] as string[],
    categories: {} as Record<string, number>,
  };

  let totalWords = 0;

  posts.forEach(post => {
    // Title Analysis
    if (post.title.startsWith("Why")) analysis.title_structures.push("Why...");
    else if (post.title.startsWith("How")) analysis.title_structures.push("How to...");
    else if (post.title.includes(":")) analysis.title_structures.push("X: Y");
    else analysis.title_structures.push("Generic");

    // Word Count (rough estimate from HTML)
    const words = post.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    totalWords += words;

    // Headings
    const h2s = (post.content.match(/<h2/g) || []).length;
    const h3s = (post.content.match(/<h3/g) || []).length;
    analysis.heading_patterns[`H2s: ${h2s}, H3s: ${h3s}`] = (analysis.heading_patterns[`H2s: ${h2s}, H3s: ${h3s}`] || 0) + 1;

    // Categories
    analysis.categories[post.category] = (analysis.categories[post.category] || 0) + 1;
  });

  analysis.avg_word_count = Math.round(totalWords / posts.length);

  console.log(JSON.stringify(analysis, null, 2));
}

analyze();
