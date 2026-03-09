

## Rewrite Platform/Solutions Page + Fix Homepage Metric

### Problem
The Platform page reads like a SaaS product page — "184+ Active Connectors", `platform.config.yml` code blocks, throughput metrics, connector counts. The homepage also has "180+ Pre-built Connectors" which is product language. These need to match the consultancy tone used elsewhere.

### Changes

#### 1. `src/pages/Index.tsx` (line 21)
- Change `{ n: "180+", l: "Pre-built Connectors" }` → `{ n: "50+", l: "Enterprise Clients" }` (or similar service metric)

#### 2. `src/pages/Platform.tsx` — Full rewrite to consultancy tone

**Hero stats** (lines 13-18): Replace product metrics with service metrics:
- "400+ Systems Delivered", "12+ Industries Served", "99.99% Uptime SLA", "50+ Enterprise Clients"

**Overview section** (lines 194-232): Replace the `platform.config.yml` code block with a service methodology visual — e.g., a styled card showing the four phases: Assess → Design → Build → Optimize, with brief descriptions. Keep the left-side overview text but clean up any remaining product references.

**Architecture Explorer** (lines 266-278): Reframe from product architecture to "How We Build" — rewrite the four steps (Ingestion → Processing → Storage → Delivery) as service phases:
- **Assessment**: We audit your existing systems, data flows, and integration points
- **Architecture**: We design the target-state infrastructure with security and scale in mind
- **Implementation**: We build and deploy using proven patterns — APIs, event streams, data pipelines
- **Optimization**: We monitor, tune, and evolve the system as your needs change

Remove the code-block panels showing throughput/connector metrics. Replace with outcome-focused bullet points.

**Deployment Options** (lines 237-262): Keep as-is — these are legitimately about how Regent deploys client infrastructure. Minor wording tweaks to say "we deploy" rather than implying a product.

**Performance section** (lines 298-321): Reframe as "What We Deliver" — keep the metrics but frame them as outcomes delivered to clients, not product specs. E.g., "Sustained throughput we've achieved across client deployments" instead of "across distributed nodes."

**Security section** (lines 341-360): Keep mostly as-is — these are valid consultancy capabilities. Remove "SOC 2 Type II Certified" if Regent doesn't have this certification, or keep if accurate. Change "platform activity" → "system activity."

### Files to Edit
- `src/pages/Platform.tsx` — major rewrite
- `src/pages/Index.tsx` — single metric fix (line 21)

