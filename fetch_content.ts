import { createServiceClient } from "./src/lib/supabase/service";

async function fetchContent() {
  const supabase = createServiceClient();

  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false })
    .limit(20);

  if (blogError) console.error('Error fetching blog posts:', blogError);
  else console.log('Blog Posts Count:', blogPosts.length);

  const { data: resources, error: resourceError } = await supabase
    .from('resources')
    .select('*')
    .order('date', { ascending: false })
    .limit(10);

  if (resourceError) console.error('Error fetching resources:', resourceError);
  else console.log('Resources Count:', resources.length);

  const { data: caseStudies, error: caseStudyError } = await supabase
    .from('case_studies')
    .select('*')
    .order('date', { ascending: false })
    .limit(10);

  if (caseStudyError) console.error('Error fetching case studies:', caseStudyError);
  else console.log('Case Studies Count:', caseStudies.length);

  // Print some samples for analysis
  if (blogPosts && blogPosts.length > 0) {
    console.log('\n--- Blog Post Sample ---');
    console.log('Title:', blogPosts[0].title);
    console.log('Excerpt:', blogPosts[0].excerpt);
    console.log('Content Length:', blogPosts[0].content?.length);
  }

  if (resources && resources.length > 0) {
    console.log('\n--- Resource Sample ---');
    console.log('Title:', resources[0].title);
  }

  if (caseStudies && caseStudies.length > 0) {
    console.log('\n--- Case Study Sample ---');
    console.log('Title:', caseStudies[0].title);
  }
}

fetchContent();
