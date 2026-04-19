import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log("--- Verifying Blog Post ---");
  const { data: blog, error: blogError } = await supabase.from('blog_posts').select('*').eq('slug', 'autonomous-core-ai-self-healing');
  if (blogError) console.error("Blog Error:", blogError);
  console.log("Count:", blog?.length);
  if (blog && blog.length > 0) {
    console.log("Title:", blog[0].title);
    console.log("Published:", blog[0].published);
    console.log("SVG present:", blog[0].content?.includes('<svg'));
  }

  console.log("\n--- Verifying Resource ---");
  const { data: resource, error: resError } = await supabase.from('resources').select('*').eq('slug', 'ai-ready-infrastructure-audit');
  if (resError) console.error("Resource Error:", resError);
  console.log("Count:", resource?.length);
  if (resource && resource.length > 0) {
    console.log("Title:", resource[0].title);
    console.log("Published:", resource[0].published);
    console.log("SVG present:", resource[0].description?.includes('<svg'));
  }

  console.log("\n--- Verifying Case Study ---");
  const { data: caseStudy, error: csError } = await supabase.from('case_studies').select('*').eq('slug', 'project-helios-predictive-fault-tolerance');
  if (csError) console.error("Case Study Error:", csError);
  console.log("Count:", caseStudy?.length);
  if (caseStudy && caseStudy.length > 0) {
    console.log("Title:", caseStudy[0].title);
    console.log("Published:", caseStudy[0].published);
    console.log("Results count:", caseStudy[0].results?.length);
    console.log("SVG present:", caseStudy[0].challenge?.includes('<svg'));
  }

  console.log("\n--- Verifying Backlinks ---");
  const { data: post1 } = await supabase.from('blog_posts').select('content').eq('slug', 'engineering-of-durability-self-healing-infrastructure').single();
  console.log("Post 1 backlink:", post1?.content?.includes('autonomous-core-ai-self-healing'));

  const { data: case1 } = await supabase.from('case_studies').select('solution').eq('slug', 'project-ironclad-energy-grid-reliability').single();
  console.log("Case 1 backlink:", case1?.solution?.includes('project-helios-predictive-fault-tolerance'));
}

verify();
