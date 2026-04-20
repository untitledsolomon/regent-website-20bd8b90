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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function verify() {
  const blogs = await api('blog_posts?slug=eq.visibility-gap-dashboarding-not-intelligence');
  const resources = await api('resources?slug=eq.operational-visibility-audit-infrastructure-map');
  const cases = await api('case_studies?slug=eq.project-clearsight-supply-chain-telemetry');

  console.log("Blog exists:", blogs.length > 0);
  console.log("Resource exists:", resources.length > 0);
  console.log("Case Study exists:", cases.length > 0);

  if (blogs[0]) console.log("Blog Content Length:", blogs[0].content.length);
  if (resources[0]) console.log("Resource Content Length:", resources[0].description.length);
  if (cases[0]) console.log("Case Study Results Count:", cases[0].results.length);
}

verify().catch(console.error);
