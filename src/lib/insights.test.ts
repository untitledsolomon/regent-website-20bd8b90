import { describe, it, expect, vi } from "vitest";

// The generator imports the supabase server client at module scope; it is never
// used by the pure functions under test, so mock it to avoid pulling Next.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { markdownToHtml, parseInsightResponse } from "./ai/insights";

const library = [
  { type: "post" as const, id: "p1", slug: "real-post", title: "Real Post", has_meta: true },
  { type: "case_study" as const, id: "c1", slug: "customer-story", title: "Customer Story", has_meta: false },
  { type: "resource" as const, id: "r1", slug: "whitepaper-2026", title: "Whitepaper 2026", has_meta: true },
];

describe("markdownToHtml", () => {
  it("converts headings, bullets and paragraphs and escapes inline HTML", () => {
    const html = markdownToHtml("# Hello\n\n- a\n- b\n\nplain <b>bold</b>");
    expect(html).toBe(
      "<h1>Hello</h1>\n<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n<p>plain &lt;b&gt;bold&lt;/b&gt;</p>"
    );
  });

  it("keeps unterminated lists from leaking across blocks", () => {
    const html = markdownToHtml("- one\n- two\n\nNext para\n- three");
    expect(html).toBe("<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n<p>Next para</p>\n<ul>\n<li>three</li>\n</ul>");
  });
});

describe("parseInsightResponse slug validation", () => {
  it("resolves a real library slug to the admin editor url", () => {
    const rows = parseInsightResponse(
      JSON.stringify([
        { title: "T", body: "b", severity: "medium", category: "content", target_slug: "real-post", target_type: "post", action: "open_editor", actionable: true },
      ]),
      library
    );
    expect(rows[0].target_url).toBe("/admin/posts/p1");
    expect(rows[0].target_id).toBe("p1");
    expect(rows[0].action).toBe("open_editor");
  });

  it("drops a model-invented slug — no url, action demoted", () => {
    const rows = parseInsightResponse(
      JSON.stringify([
        { title: "T", body: "b", severity: "medium", category: "content", target_slug: "made-up-slug", target_type: "post", action: "open_editor", actionable: true },
      ]),
      library
    );
    expect(rows[0].target_url).toBeNull();
    expect(rows[0].target_id).toBeNull();
    expect(rows[0].action).toBeNull();
  });

  it("keeps create_post_draft with no target", () => {
    const rows = parseInsightResponse(
      JSON.stringify([
        { title: "New idea", body: "b", severity: "low", category: "content", action: "create_post_draft", actionable: true },
      ]),
      library
    );
    expect(rows[0].action).toBe("create_post_draft");
    expect(rows[0].target_url).toBeNull();
  });

  it("maps page type to the analytics route", () => {
    const rows = parseInsightResponse(
      JSON.stringify([
        { title: "T", body: "b", severity: "high", category: "content", target_type: "page", action: "view_analytics", actionable: true },
      ]),
      library
    );
    expect(rows[0].target_url).toBe("/admin/analytics");
    expect(rows[0].action).toBe("view_analytics");
  });

  it("returns an empty array for garbage output", () => {
    expect(parseInsightResponse("not json at all", library)).toEqual([]);
  });
});
