const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function analyze() {
  console.log("Fetching blogs...");
  const blogs = await api('blog_posts?select=title,content,excerpt,category&order=date.desc&limit=50').catch(e => { console.error(e); return []; });
  console.log("Fetching resources...");
  const resources = await api('resources?select=title,description,type&limit=50').catch(e => { console.error(e); return []; });
  console.log("Fetching cases...");
  const cases = await api('case_studies?select=title,challenge,solution,summary,industry&limit=50').catch(e => { console.error(e); return []; });

  console.log(`Found ${blogs.length} blogs, ${resources.length} resources, ${cases.length} case studies.`);

  if (blogs.length > 0) {
    const titles = blogs.map(b => b.title);
    const wordCounts = blogs.map(b => b.content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0);

    console.log("\nTitle Samples:");
    titles.slice(0, 10).forEach(t => console.log(`- ${t}`));

    const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    console.log(`\nAverage Blog Word Count: ${avgWordCount.toFixed(0)}`);

    const headings = blogs[0].content.match(/<h[1-3]>.*?<\/h[1-3]>/g);
    console.log("\nHeading Hierarchy Sample (Blog 0):");
    headings?.forEach(h => console.log(`  ${h}`));

    const links = blogs[0].content.match(/href="\/.*?"/g);
    console.log("\nInternal Links Sample (Blog 0):");
    links?.forEach(l => console.log(`  ${l}`));
  }
}

analyze().catch(console.error);
