import { createServiceClient } from "../src/lib/supabase/service";
async function run() {
  const supabase = createServiceClient();
  const { data: blog } = await supabase.from('blog_posts').select('title, slug').eq('slug', 'engineering-of-durability-self-healing-infrastructure').single();
  const { data: res } = await supabase.from('resources').select('title, slug').eq('slug', 'infrastructure-resilience-audit-checklist').single();
  const { data: cs } = await supabase.from('case_studies').select('title, slug').eq('slug', 'project-ironclad-energy-grid-reliability').single();

  console.log("Verification Result:");
  console.log("Blog:", blog?.title === "The Engineering of Durability: Why Modern Enterprise Infrastructure Must Be Self-Healing" ? "OK" : "FAILED");
  console.log("Resource:", res?.title === "Infrastructure Resilience Audit Checklist: A 30-Point Framework for CTOs" ? "OK" : "FAILED");
  console.log("Case Study:", cs?.title === "Project Ironclad: Scaling a Legacy Energy Grid for 99.999% Reliability" ? "OK" : "FAILED");
}
run();
