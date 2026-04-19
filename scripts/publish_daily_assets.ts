import { createClient } from "@supabase/supabase-js";
import * as fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function publish() {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // 1. Publish Blog Post
  console.log("Publishing Blog Post...");
  const blogFile = fs.readFileSync('blog_article.txt', 'utf8');
  const blogContentMatch = blogFile.match(/## Content\n\n([\s\S]+)$/);
  const blogContent = blogContentMatch ? blogContentMatch[1].trim() : '';
  const blogSvgMatch = blogFile.match(/## SVG Cover Illustration\n\n([\s\S]+?)\n\n---/);
  const blogSvg = blogSvgMatch ? blogSvgMatch[1].trim() : '';

  const { data: blog, error: blogError } = await supabase.from('blog_posts').upsert({
    slug: 'autonomous-core-ai-self-healing',
    title: 'The Autonomous Core: Moving Beyond Observability to AI-Driven Self-Healing',
    excerpt: 'Move beyond static monitoring. Learn how AI-driven orchestration and self-healing architectures are redefining systemic reliability for enterprise infrastructure.',
    content: blogSvg + "\n\n" + blogContent,
    category: 'Systems Architecture',
    author: 'Regent Engineering',
    date: today,
    read_time: '12 min',
    published: true,
    meta_title: 'The Autonomous Core: Moving Beyond Observability | Regent',
    meta_description: 'Move beyond static monitoring. Learn how AI-driven orchestration and self-healing architectures are redefining systemic reliability for enterprise infrastructure.'
  }).select();

  if (blogError) throw blogError;
  console.log("Blog inserted:", blog?.[0]?.id);

  // 2. Publish Resource
  console.log("Publishing Resource...");
  const resourceFile = fs.readFileSync('resource.txt', 'utf8');
  const resourceContentMatch = resourceFile.match(/## Content\n\n([\s\S]+)$/);
  const resourceContent = resourceContentMatch ? resourceContentMatch[1].trim() : '';
  const resourceSvgMatch = resourceFile.match(/## SVG Cover Illustration\n\n([\s\S]+?)\n\n---/);
  const resourceSvg = resourceSvgMatch ? resourceSvgMatch[1].trim() : '';

  const { data: resource, error: resourceError } = await supabase.from('resources').upsert({
    slug: 'ai-ready-infrastructure-audit',
    title: 'The AI-Ready Infrastructure Audit: 40 Benchmarks for Autonomous Operations',
    description: resourceSvg + "\n\n" + resourceContent,
    type: 'Whitepaper',
    published: true
  }).select();

  if (resourceError) throw resourceError;
  console.log("Resource inserted:", resource?.[0]?.id);

  // 3. Publish Case Study
  console.log("Publishing Case Study...");
  const caseStudyFile = fs.readFileSync('case_study.txt', 'utf8');
  const caseStudyContentMatch = caseStudyFile.match(/## Content\n\n([\s\S]+)$/);
  const caseStudyContent = caseStudyContentMatch ? caseStudyContentMatch[1].trim() : '';
  const caseStudySvgMatch = caseStudyFile.match(/## SVG Cover Illustration\n\n([\s\S]+?)\n\n---/);
  const caseStudySvg = caseStudySvgMatch ? caseStudySvgMatch[1].trim() : '';

  // Extract challenge/solution/results from content
  const challengeMatch = caseStudyContent.match(/<h2>The Problem<\/h2>\n([\s\S]+?)\n<h2>The Approach/);
  const solutionMatch = caseStudyContent.match(/<h2>The Approach:[\s\S]+?<\/h2>\n([\s\S]+?)\n<h2>The Execution/);
  const resultsMatch = caseStudyContent.match(/<h2>The Results<\/h2>\n<ul>\n([\s\S]+?)<\/ul>/);

  const resultsList = resultsMatch ? resultsMatch[1].trim().split('<li>').map(s => s.replace('</li>', '').trim()).filter(s => s.length > 0) : [];

  const { data: caseStudy, error: caseStudyError } = await supabase.from('case_studies').upsert({
    slug: 'project-helios-predictive-fault-tolerance',
    title: 'Project Helios: Scaling Predictive Fault-Tolerance for Global Logistics Hubs',
    industry: 'Logistics',
    summary: 'How a global logistics leader achieved 99.99% uptime and reduced manual incident response by 85% using AI-driven self-healing architecture.',
    challenge: caseStudySvg + "\n\n" + (challengeMatch ? challengeMatch[1].trim() : ''),
    solution: solutionMatch ? solutionMatch[1].trim() : '',
    results: resultsList,
    metrics: [
      { label: "Detection & Action Time", value: "400ms" },
      { label: "Manual Incident Volume", value: "-85%" },
      { label: "Annual Cost Avoidance", value: "$2.8M" }
    ],
    published: true
  }).select();

  if (caseStudyError) throw caseStudyError;
  console.log("Case Study inserted:", caseStudy?.[0]?.id);

  // 4. Update Backlinks in older posts
  console.log("Updating Forward-links in existing posts...");

  // Update 'engineering-of-durability-self-healing-infrastructure'
  const { data: post1, error: post1Error } = await supabase.from('blog_posts').select('*').eq('slug', 'engineering-of-durability-self-healing-infrastructure').single();
  if (post1) {
    if (!post1.content.includes('autonomous-core-ai-self-healing')) {
      const updatedContent = post1.content + `
<hr/>
<p><em>Update: For an advanced look at how these principles are evolving, read our latest analysis on <a href="/blog/autonomous-core-ai-self-healing">The Autonomous Core: AI-Driven Self-Healing</a>.</em></p>`;
      await supabase.from('blog_posts').update({ content: updatedContent }).eq('slug', 'engineering-of-durability-self-healing-infrastructure');
      console.log("Updated 'engineering-of-durability...'");
    }
  }

  // Update 'project-ironclad-energy-grid-reliability'
  const { data: case1, error: case1Error } = await supabase.from('case_studies').select('*').eq('slug', 'project-ironclad-energy-grid-reliability').single();
  if (case1) {
    if (!case1.solution.includes('project-helios-predictive-fault-tolerance')) {
      const updatedSolution = case1.solution + `
<p><em>Compare this with our more recent work on <a href="/case-studies/project-helios-predictive-fault-tolerance">Project Helios</a>, where we moved from passive monitoring to full autonomous orchestration.</em></p>`;
      await supabase.from('case_studies').update({ solution: updatedSolution }).eq('slug', 'project-ironclad-energy-grid-reliability');
      console.log("Updated 'project-ironclad...'");
    }
  }

  console.log("All tasks complete!");
}

publish().catch(console.error);
