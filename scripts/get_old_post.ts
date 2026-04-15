import { createServiceClient } from "../src/lib/supabase/service";
async function run() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', 'why-most-businesses-fail-to-scale').single();
  console.log(JSON.stringify(data, null, 2));
}
run();
