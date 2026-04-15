
import { createServiceClient } from "../src/lib/supabase/service";

async function analyzeContent() {
  const supabase = createServiceClient();

  console.log("--- Fetching Blog Posts ---");
  const { data: blogPosts, error: blogError } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (blogError) console.error("Error fetching blog posts:", blogError);
  else console.log(`Fetched ${blogPosts?.length} blog posts`);

  console.log("--- Fetching Case Studies ---");
  const { data: caseStudies, error: csError } = await supabase
    .from("case_studies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (csError) console.error("Error fetching case studies:", csError);
  else console.log(`Fetched ${caseStudies?.length} case studies`);

  console.log("--- Fetching Resources ---");
  const { data: resources, error: resError } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (resError) console.error("Error fetching resources:", resError);
  else console.log(`Fetched ${resources?.length} resources`);

  return { blogPosts, caseStudies, resources };
}

analyzeContent().then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(err => {
  console.error(err);
});
