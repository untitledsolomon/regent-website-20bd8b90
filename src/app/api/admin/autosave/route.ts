import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createServiceClient();

  // Verify the requester is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, type, content } = await req.json();

  if (!id || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // If it's a new post (no ID yet or ID is 'new'), we don't necessarily want to create a DB entry every minute
    // unless the user has at least provided a title and slug.
    // For existing posts, we update the record but keep published: false if it was already a draft.

    let table = "";
    if (type === "blog_post") table = "blog_posts";
    else if (type === "case_study") table = "case_studies";
    else if (type === "resource") table = "resources";

    if (!table) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // For simplicity in this implementation, if it's an existing item, we update it.
    // We only update the content/fields provided in the 'content' object.
    if (id && id !== "new") {
      const { error } = await supabase
        .from(table)
        .update({
          ...content,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        console.error("Autosave update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // For 'new' items, we could create a draft record if enough info exists
      if (content.title && content.slug) {
         // Check if a draft already exists for this slug to avoid duplicates
         const { data: existing } = await supabase
           .from(table)
           .select("id")
           .eq("slug", content.slug)
           .single();

         if (existing) {
            await supabase.from(table).update(content).eq("id", existing.id);
         } else {
            // Only insert if it doesn't exist
            await supabase.from(table).insert({
              ...content,
              published: false // Ensure it's saved as a draft
            });
         }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in autosave:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
