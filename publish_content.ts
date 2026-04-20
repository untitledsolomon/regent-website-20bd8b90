import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path: string, method: string = 'GET', body: any = null) {
  const options: any = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function publish() {
  const today = new Date().toISOString().split('T')[0];
  const blogBody = fs.readFileSync('blog_article.txt', 'utf8');
  const blogCover = fs.readFileSync('blog_cover.svg', 'utf8');
  const resourceBody = fs.readFileSync('resource.txt', 'utf8');
  const resourceCover = fs.readFileSync('resource_cover.svg', 'utf8');
  const caseBody = fs.readFileSync('case_study.txt', 'utf8');
  const caseCover = fs.readFileSync('case_study_cover.svg', 'utf8');

  console.log("Upserting Blog Post...");
  const blogContentWithCover = blogCover + blogBody;
  await api('blog_posts?slug=eq.visibility-gap-dashboarding-not-intelligence', 'PATCH', {
    title: 'The Visibility Gap: Why Dashboarding is Not Intelligence',
    excerpt: 'Most enterprises have high-fidelity telemetry but low-fidelity context. Learn why dashboards are a bottleneck and how to transition to Operational Intelligence.',
    content: blogContentWithCover,
    category: 'Architecture',
    author: 'Regent Engineering',
    date: today,
    read_time: '12 min',
    published: true,
    meta_title: 'Dashboarding is Not Intelligence: Closing the Visibility Gap | Regent',
    meta_description: 'Most enterprises have high-fidelity telemetry but low-fidelity context. Learn why dashboards are a bottleneck and how to transition to Operational Intelligence.',
    image_url: blogCover
  });

  console.log("Upserting Resource...");
  const resourceContentWithCover = resourceCover + resourceBody;
  await api('resources?slug=eq.operational-visibility-audit-infrastructure-map', 'PATCH', {
    title: 'The Operational Visibility Audit: A 15-Point Infrastructure Map',
    description: resourceContentWithCover,
    type: 'Audit Framework',
    published: true
  });

  console.log("Upserting Case Study...");
  const caseContentWithCover = caseCover + caseBody;
  await api('case_studies?slug=eq.project-clearsight-supply-chain-telemetry', 'PATCH', {
    title: 'Project ClearSight: Unifying Global Supply Chain Telemetry for a Fortune 500 Retailer',
    industry: 'Logistics',
    summary: 'Unified 400+ legacy and modern systems into a single operational intelligence layer, reducing MTTI by 98%.',
    challenge: caseCover + 'Fragmented visibility across hundreds of siloed logistics and e-commerce systems, leading to 4-hour identification times for order delays.',
    solution: caseBody,
    results: [
      "98% Reduction in MTTI (4 hours to 4 minutes)",
      "Unified 400+ legacy and modern systems",
      "22% Increase in Delivery SLA Compliance",
      "$3.2M Annual Savings in operational overhead",
      "40% of identified bottlenecks resolved automatically"
    ],
    metrics: [
      { label: "MTTI Reduction", value: "98%" },
      { label: "Systems Unified", value: "400+" },
      { label: "Annual Savings", value: "$3.2M" }
    ],
    published: true,
    image_url: caseCover
  });

  // INTERNAL LINKING UPDATES
  console.log("\nUpdating Internal Links in older posts...");

  // 1. Update 'engineering-of-durability-self-healing-infrastructure' to link forward to the new blog
  const post1Res = await api('blog_posts?slug=eq.engineering-of-durability-self-healing-infrastructure', 'GET');
  const post1 = post1Res[0];
  if (post1) {
    if (!post1.content.includes('visibility-gap-dashboarding-not-intelligence')) {
      const newContent = post1.content + `
<hr/>
<p><em>Update: For a deeper dive into bridging the gap between raw data and actionable intelligence, read our latest analysis on <a href="/blog/visibility-gap-dashboarding-not-intelligence">The Visibility Gap: Why Dashboarding is Not Intelligence</a>.</em></p>`;
      await api(`blog_posts?slug=eq.engineering-of-durability-self-healing-infrastructure`, 'PATCH', { content: newContent });
      console.log("Updated 'engineering-of-durability...'");
    }
  }

  // 2. Update 'infrastructure-resilience-audit-checklist' to link to the new resource
  const res2Res = await api('resources?slug=eq.infrastructure-resilience-audit-checklist', 'GET');
  const res2 = res2Res[0];
  if (res2) {
    if (!res2.description.includes('operational-visibility-audit-infrastructure-map')) {
      const newDesc = res2.description + `
<p><em>New: Complement this checklist with our <a href="/resources/operational-visibility-audit-infrastructure-map">15-Point Operational Visibility Audit</a> for a deep-dive into your telemetry maturity.</em></p>`;
      await api(`resources?slug=eq.infrastructure-resilience-audit-checklist`, 'PATCH', { description: newDesc });
      console.log("Updated 'infrastructure-resilience-audit...'");
    }
  }

  // 3. Update 'project-ironclad-energy-grid-reliability' to link to the new blog
  const case3Res = await api('case_studies?slug=eq.project-ironclad-energy-grid-reliability', 'GET');
  const case3 = case3Res[0];
  if (case3) {
    if (!case3.solution.includes('visibility-gap-dashboarding-not-intelligence')) {
      const newSolution = case3.solution + `
<p><em>This transition from monitoring to intelligence is explored further in <a href="/blog/visibility-gap-dashboarding-not-intelligence">The Visibility Gap</a>.</em></p>`;
      await api(`case_studies?slug=eq.project-ironclad-energy-grid-reliability`, 'PATCH', { solution: newSolution });
      console.log("Updated 'project-ironclad...'");
    }
  }

  console.log("\nAll publishing and linking tasks complete!");
}

publish().catch(console.error);
