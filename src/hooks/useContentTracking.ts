import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTrackView(contentType: string, contentId: string | undefined) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!contentId || tracked.current) return;
    tracked.current = true;

    supabase
      .from("content_views")
      .insert({ content_type: contentType, content_id: contentId })
      .then(() => {});
  }, [contentType, contentId]);
}

export async function trackDownload(contentId: string) {
  await supabase
    .from("content_views")
    .insert({ content_type: "resource_download", content_id: contentId });
}
