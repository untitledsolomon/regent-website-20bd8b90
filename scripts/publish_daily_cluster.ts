
import { dailyContent } from "./daily_content_data";
import { createServiceClient } from "../src/lib/supabase/service";

async function publish() {
  const supabase = createServiceClient();
  const dateStr = new Date().toISOString();

  async function upsertBySlug(table: string, content: any) {
    const { data: existing } = await supabase.from(table).select("id").eq("slug", content.slug).single();
    if (existing) {
      const { data, error } = await supabase.from(table).update(content).eq("id", existing.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase.from(table).insert([content]).select();
      if (error) throw error;
      return data[0];
    }
  }

  try {
    console.log("Publishing Blog Post...");
    const blog = await upsertBySlug("blog_posts", {
      title: dailyContent.blog.title,
      slug: dailyContent.blog.slug,
      excerpt: dailyContent.blog.excerpt,
      content: dailyContent.blog.content,
      category: dailyContent.blog.category,
      author: dailyContent.blog.author,
      read_time: dailyContent.blog.read_time,
      date: dailyContent.date,
      published: true,
      meta_title: dailyContent.blog.seo.meta_title,
      meta_description: dailyContent.blog.seo.meta_description,
      updated_at: dateStr
    });
    console.log("Blog post published/updated:", blog.id);

    console.log("Publishing Resource...");
    const res = await upsertBySlug("resources", {
      title: dailyContent.resource.title,
      slug: dailyContent.resource.slug,
      type: dailyContent.resource.type,
      description: dailyContent.resource.description,
      published: true,
      updated_at: dateStr
    });
    console.log("Resource published/updated:", res.id);

    console.log("Publishing Case Study...");
    const cs = await upsertBySlug("case_studies", {
      title: dailyContent.case_study.title,
      slug: dailyContent.case_study.slug,
      industry: dailyContent.case_study.industry,
      summary: dailyContent.case_study.summary,
      challenge: dailyContent.case_study.challenge,
      solution: dailyContent.case_study.solution,
      results: dailyContent.case_study.results,
      metrics: dailyContent.case_study.metrics,
      published: true,
      meta_title: dailyContent.case_study.seo.meta_title,
      meta_description: dailyContent.case_study.seo.meta_description,
      updated_at: dateStr
    });
    console.log("Case study published/updated:", cs.id);

    // Idempotent Backlinking to old posts
    const oldPostSlugs = ["why-most-businesses-fail-to-scale", "global-media-network"];
    for (const slug of oldPostSlugs) {
      console.log(`Checking backlink for ${slug}...`);
      const { data: oldPost } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .single();

      if (oldPost && !oldPost.content.includes(dailyContent.blog.slug)) {
        const updatedContent = oldPost.content + `
<p><em>Update: For a deeper look at the architectural side of scaling, read our latest piece on <a href="/blog/${dailyContent.blog.slug}">${dailyContent.blog.title}</a>.</em></p>
        `;
        await supabase
          .from("blog_posts")
          .update({ content: updatedContent })
          .eq("slug", slug);
        console.log(`Added backlink to ${slug}.`);
      } else {
        console.log(`Backlink already exists or post not found for ${slug}.`);
      }
    }
  } catch (err) {
    console.error("Error during publishing:", err);
  }
}

publish();
