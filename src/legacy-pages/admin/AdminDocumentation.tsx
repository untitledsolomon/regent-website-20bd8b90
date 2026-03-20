'use client';

import { useState } from "react";
import { BookOpen, Globe, Server, Database, UserCog, ExternalLink } from "lucide-react";

const tabs = [
  { id: "overview", label: "Site Overview", icon: Globe },
  { id: "api", label: "API Endpoints", icon: Server },
  { id: "schema", label: "Database Schema", icon: Database },
  { id: "guide", label: "Admin Guide", icon: UserCog },
] as const;

type TabId = (typeof tabs)[number]["id"];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted text-foreground text-xs p-3 rounded-lg overflow-x-auto font-mono leading-relaxed border border-border">
      {children}
    </pre>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h4 className="font-heading text-sm font-semibold text-foreground mt-6 mb-2">{children}</h4>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

function Badge({ variant, children }: { variant: "get" | "post" | "delete"; children: string }) {
  const colors = {
    get: "bg-emerald-50 text-emerald-700 border-emerald-200",
    post: "bg-primary/10 text-primary border-primary/20",
    delete: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${colors[variant]}`}>
      {children}
    </span>
  );
}

function EndpointCard({ method, path, auth, description, body, response }: {
  method: "GET" | "POST" | "DELETE";
  path: string;
  auth: string;
  description: string;
  body?: string;
  response?: string;
}) {
  const variant = method.toLowerCase() as "get" | "post" | "delete";
  return (
    <div className="border border-border rounded-lg p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={variant}>{method}</Badge>
        <code className="text-xs font-mono text-foreground">{path}</code>
      </div>
      <P>{description}</P>
      <div className="text-xs text-muted-foreground mb-2">
        <strong>Auth:</strong> {auth}
      </div>
      {body && (
        <>
          <div className="text-xs font-medium text-foreground mb-1">Request Body:</div>
          <CodeBlock>{body}</CodeBlock>
        </>
      )}
      {response && (
        <>
          <div className="text-xs font-medium text-foreground mb-1 mt-2">Response:</div>
          <CodeBlock>{response}</CodeBlock>
        </>
      )}
    </div>
  );
}

function OverviewTab() {
  const routes = [
    { path: "/", name: "Home", description: "Landing page with hero, features, testimonials, CTA" },
    { path: "/platform", name: "Platform", description: "Platform overview with module cards" },
    { path: "/platform/:moduleSlug", name: "Module Detail", description: "Individual platform module details" },
    { path: "/capabilities", name: "Capabilities", description: "Full capabilities showcase" },
    { path: "/industries", name: "Industries", description: "Industry-specific solutions" },
    { path: "/resources", name: "Resources", description: "Whitepapers, research, documentation (from DB)" },
    { path: "/blog", name: "Blog", description: "Published blog posts list (from DB)" },
    { path: "/blog/:slug", name: "Blog Post", description: "Individual blog post (from DB)" },
    { path: "/case-studies", name: "Case Studies", description: "Published case studies (from DB)" },
    { path: "/case-studies/:slug", name: "Case Study Detail", description: "Individual case study (from DB)" },
    { path: "/careers", name: "Careers", description: "Published job openings (from DB)" },
    { path: "/about", name: "About", description: "Company information" },
    { path: "/demo", name: "Demo", description: "Consultation request form → DB + email notification" },
    { path: "/privacy", name: "Privacy Policy", description: "Privacy policy page" },
    { path: "/terms", name: "Terms of Service", description: "Terms of service page" },
    { path: "/unsubscribe", name: "Unsubscribe", description: "Newsletter unsubscribe handler" },
  ];

  return (
    <>
      <Heading>Public Routes</Heading>
      <P>All public-facing pages and their data sources.</P>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Route</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Page</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2 hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(r => (
              <tr key={r.path} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs text-primary">{r.path}</td>
                <td className="px-4 py-2 text-foreground font-medium">{r.name}</td>
                <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading>Admin Routes</Heading>
      <P>All admin routes require authentication. Access is restricted to users with the <code className="text-xs bg-muted px-1 py-0.5 rounded">admin</code> role.</P>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Route</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Function</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["/admin", "Dashboard with KPIs and analytics"],
              ["/admin/posts", "Blog post management"],
              ["/admin/case-studies", "Case study management"],
              ["/admin/resources", "Resource management"],
              ["/admin/careers", "Career listing management"],
              ["/admin/subscribers", "Newsletter subscriber list"],
              ["/admin/newsletter/compose", "Compose and send newsletter"],
              ["/admin/inquiries", "Consultation request management"],
              ["/admin/settings", "Account and app settings"],
              ["/admin/documentation", "This documentation page"],
            ].map(([path, desc]) => (
              <tr key={path} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs text-primary">{path}</td>
                <td className="px-4 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ApiTab() {
  return (
    <>
      <P>All backend functions are invoked via the client SDK. Authentication is handled via Bearer token in the Authorization header.</P>

      <Heading>notify-consultation</Heading>
      <EndpointCard
        method="POST"
        path="/functions/v1/notify-consultation"
        auth="None (called on form submit)"
        description="Sends an email notification to the admin when a new consultation request is submitted via the Demo page."
        body={`{
  "name": "John Doe",
  "company": "Acme Inc",
  "email": "john@acme.com",
  "industry": "Finance",
  "size": "100-500",
  "budget": "$50k-$100k",
  "message": "We need help with..."
}`}
        response={`{ "success": true }`}
      />

      <Heading>reply-consultation</Heading>
      <EndpointCard
        method="POST"
        path="/functions/v1/reply-consultation"
        auth="Bearer token (admin only)"
        description="Sends a reply email to a consultation requester and updates the consultation status to 'replied'."
        body={`{
  "consultation_id": "uuid",
  "to_email": "client@example.com",
  "to_name": "John",
  "subject": "Re: Your consultation",
  "body": "Thank you for reaching out..."
}`}
        response={`{ "success": true }`}
      />

      <Heading>send-newsletter</Heading>
      <EndpointCard
        method="POST"
        path="/functions/v1/send-newsletter"
        auth="Bearer token (admin only, verified via auth claims)"
        description="Sends a newsletter to all subscribers. Emails are sent individually in batches of 10 with personalized unsubscribe links."
        body={`{
  "subject": "Monthly Update",
  "html": "<h1>Hello</h1><p>Newsletter content...</p>"
}`}
        response={`{ "sent": 45, "failed": 2, "total": 47 }`}
      />

      <Heading>newsletter-welcome</Heading>
      <EndpointCard
        method="POST"
        path="/functions/v1/newsletter-welcome"
        auth="None (triggered on subscribe)"
        description="Sends a branded welcome email when a user subscribes to the newsletter."
        body={`{ "email": "subscriber@example.com" }`}
        response={`{ "success": true }`}
      />

      <Heading>unsubscribe</Heading>
      <EndpointCard
        method="POST"
        path="/functions/v1/unsubscribe"
        auth="None (public)"
        description="Removes a subscriber from the newsletter_subscribers table by email. Used by the /unsubscribe page."
        body={`{ "email": "subscriber@example.com" }`}
        response={`{ "success": true }`}
      />
    </>
  );
}

function SchemaTab() {
  const tables = [
    {
      name: "blog_posts",
      columns: "id, title, slug, content, excerpt, author, category, date, read_time, image_url, published, created_at, updated_at",
      rls: "Public: SELECT published=true. Admin: full CRUD.",
    },
    {
      name: "case_studies",
      columns: "id, title, slug, industry, summary, challenge, solution, results[], metrics (jsonb), image_url, published, created_at, updated_at",
      rls: "Public: SELECT published=true. Admin: full CRUD.",
    },
    {
      name: "resources",
      columns: "id, title, slug, description, type (enum), file_url, featured, published, created_at, updated_at",
      rls: "Public: SELECT published=true. Admin: full CRUD.",
    },
    {
      name: "careers",
      columns: "id, title, department, location, type, description, published, created_at, updated_at",
      rls: "Public: SELECT published=true. Admin: full CRUD.",
    },
    {
      name: "consultation_requests",
      columns: "id, name, company, email, phone, industry, size, budget, message, status (enum), admin_notes, replied_at, replied_by, created_at",
      rls: "Public: INSERT only. No public reads. Admin: SELECT, UPDATE, DELETE.",
    },
    {
      name: "newsletter_subscribers",
      columns: "id, email, source, created_at",
      rls: "Public: INSERT only. No public reads. Admin: SELECT, DELETE.",
    },
    {
      name: "newsletter_sends",
      columns: "id, subject, html_preview, sent_count, failed_count, sent_at",
      rls: "No public access. Admin: SELECT, INSERT.",
    },
    {
      name: "user_roles",
      columns: "id, user_id, role (enum: admin|moderator|user)",
      rls: "Users: SELECT own roles. Admin: full CRUD.",
    },
  ];

  return (
    <>
      <P>All tables have Row-Level Security (RLS) enabled. Write operations require the admin role, verified via the <code className="text-xs bg-muted px-1 py-0.5 rounded">has_role()</code> security-definer function.</P>

      <Heading>Enums</Heading>
      <CodeBlock>{`app_role: admin | moderator | user
consultation_request_status: new | viewed | replied | closed
resource_type: Whitepaper | Research | Documentation | Case Study`}</CodeBlock>

      <Heading>Tables</Heading>
      <div className="space-y-3">
        {tables.map(t => (
          <div key={t.name} className="border border-border rounded-lg p-4">
            <div className="font-mono text-xs font-bold text-primary mb-2">{t.name}</div>
            <div className="text-xs text-muted-foreground mb-2"><strong>Columns:</strong> {t.columns}</div>
            <div className="text-xs text-muted-foreground"><strong>RLS:</strong> {t.rls}</div>
          </div>
        ))}
      </div>

      <Heading>Security Functions</Heading>
      <CodeBlock>{`has_role(_user_id uuid, _role app_role) → boolean
-- SECURITY DEFINER function that checks user_roles table
-- Used in all RLS policies to verify admin access
-- Bypasses RLS to prevent recursive checks`}</CodeBlock>

      <Heading>Storage Buckets</Heading>
      <div className="border border-border rounded-lg p-4">
        <div className="font-mono text-xs font-bold text-primary mb-1">resource-files</div>
        <div className="text-xs text-muted-foreground">Public bucket for uploaded resource documents (whitepapers, PDFs, etc.)</div>
      </div>
    </>
  );
}

function GuideTab() {
  return (
    <>
      <Heading>Creating Blog Posts</Heading>
      <P>Navigate to <strong>Blog Posts → New Blog Post</strong>. Fill in the title, slug (URL-friendly identifier), excerpt, content (rich text editor with image support), category, author, and read time. Toggle <strong>Published</strong> to make it visible on the public blog.</P>

      <Heading>Managing Case Studies</Heading>
      <P>Go to <strong>Case Studies → New Case Study</strong>. Provide the title, slug, industry, summary, challenge, solution, and results (one per line). Add metrics as JSON objects. Upload a cover image. Publish when ready.</P>

      <Heading>Uploading Resources</Heading>
      <P>Navigate to <strong>Resources → New Resource</strong>. Set the title, slug, description, and resource type (Whitepaper, Research, Documentation, or Case Study). Upload the file — it will be stored in the resource-files bucket. Mark as featured to highlight on the Resources page.</P>

      <Heading>Managing Job Listings</Heading>
      <P>Go to <strong>Careers → New Career</strong>. Enter the title, department, location, employment type, and description. Published listings appear on the public Careers page.</P>

      <Heading>Handling Consultation Inquiries</Heading>
      <P>Consultation requests arrive when visitors submit the Demo page form. View them under <strong>Inquiries</strong>. Click any inquiry to see details, add internal notes, and send a reply email directly from the admin panel. The status automatically updates to "replied" when you respond.</P>

      <Heading>Sending Newsletters</Heading>
      <P>Go to <strong>Subscribers</strong> to view your subscriber list. Navigate to <strong>Newsletter → Compose</strong> to create and send a newsletter. The system sends individually to each subscriber with personalized unsubscribe links. Sent/failed counts are tracked.</P>

      <Heading>Security Notes</Heading>
      <P>All admin operations require the <code className="text-xs bg-muted px-1 py-0.5 rounded">admin</code> role in the user_roles table. Public users can only read published content and submit forms. All write, update, and delete operations are restricted to admins via Row-Level Security policies.</P>
    </>
  );
}

export default function AdminDocumentation() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabContent: Record<TabId, React.ReactNode> = {
    overview: <OverviewTab />,
    api: <ApiTab />,
    schema: <SchemaTab />,
    guide: <GuideTab />,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px]">
      <div className="mb-8">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen size={22} className="text-primary" /> Documentation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Complete reference for site structure, API endpoints, database schema, and admin workflows.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
