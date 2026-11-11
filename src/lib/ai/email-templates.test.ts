import { describe, it, expect } from "vitest";

import {
  renderEmailTemplate,
  resolveTemplateFor,
  applyTemplateToHtml,
  makePreheader,
  DEFAULT_SHELL,
  REGENT_LOGO,
} from "./email-templates";

const SHELL = `<!DOCTYPE html><body>
<div>{{preheader}}</div>
<header>{{logo}} {{subject}}</header>
<main>{{content}}</main>
<footer>{{year}} {{unsubscribe}}</footer>
</body></html>`;

const settings: any = {
  weekly_template_id: "11111111-1111-4111-8111-111111111111",
  daily_template_id: null,
  newsletter_template_id: null,
};

const templates: any[] = [
  { id: settings.weekly_template_id, name: "Signal", kind: "any", html: SHELL, is_preset: true },
];

describe("renderEmailTemplate", () => {
  it("fills every placeholder and escapes text fields", () => {
    const html = renderEmailTemplate(SHELL, {
      content: "<p>Hello <b>world</b></p>",
      subject: "Regent & Co",
      year: 2026,
      unsubscribe: '<a href="/x">Unsub</a>',
    });
    expect(html).toContain('<main><p>Hello <b>world</b></p></main>');
    expect(html).toContain("Regent &amp; Co");
    expect(html).toContain("<footer>2026 <a href=\"/x\">Unsub</a></footer>");
    expect(html).not.toContain("{{");
  });

  it("injects the base64 logo element", () => {
    const html = renderEmailTemplate(SHELL, { content: "" });
    expect(html).toContain(REGENT_LOGO);
    expect(REGENT_LOGO).toMatch(/^<img src="data:image\/png;base64,/);
  });

  it("defaults year and leaves missing tokens empty", () => {
    const html = renderEmailTemplate(SHELL, { content: "x" });
    expect(html).toContain(`<footer>${new Date().getFullYear()} </footer>`);
  });
});

describe("resolveTemplateFor", () => {
  it("returns the configured shell by settings id", () => {
    expect(resolveTemplateFor("weekly", settings, templates)).toBe(SHELL);
  });

  it("falls back to DEFAULT_SHELL when unset or missing", () => {
    expect(resolveTemplateFor("daily", settings, templates)).toBe(DEFAULT_SHELL);
    expect(resolveTemplateFor("newsletter", null, null)).toBe(DEFAULT_SHELL);
  });
});

describe("applyTemplateToHtml", () => {
  it("wraps content in the selected shell with no unsubscribe for digests", () => {
    const html = applyTemplateToHtml("weekly", "<p>Report</p>", settings, templates, { subject: "Weekly" });
    expect(html).toContain("<main><p>Report</p></main>");
    expect(html).toContain("<footer>");
    expect(html).not.toContain("{{unsubscribe}}");
  });
});

describe("makePreheader", () => {
  it("strips tags and clamps to ~100 chars", () => {
    expect(makePreheader("<h1>Hello</h1> <p>world</p>")).toBe("Hello world");
    expect(makePreheader("a".repeat(200)).length).toBeLessThanOrEqual(100 + 1);
  });

  it("falls back to a subject-derived preheader", () => {
    expect(makePreheader("")).toBe("");
  });
});
