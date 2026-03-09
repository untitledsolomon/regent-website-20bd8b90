import type { IconName } from "@/components/Icons";

export interface Capability {
  icon: IconName;
  title: string;
  desc: string;
}

export interface ArchLayer {
  name: string;
  desc: string;
  color: string;
}

export interface ModuleFeature {
  title: string;
  desc: string;
}

export interface ModuleSpec {
  label: string;
  value: string;
}

export interface Module {
  name: string;
  num: string;
  slug: string;
  desc: string;
  longDesc: string;
  features: ModuleFeature[];
  specs: ModuleSpec[];
  useCases: string[];
}

export interface Industry {
  icon: IconName;
  name: string;
  desc: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  content: string;
}

export interface Resource {
  type: string;
  title: string;
  desc: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: { value: string; label: string }[];
}

export interface CareerPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
}

export interface CompanyValue {
  emoji: string;
  title: string;
  desc: string;
}

export interface Benefit {
  emoji: string;
  title: string;
  desc: string;
}

export const capabilities: Capability[] = [
  { icon: 'Integration', title: 'Systems Integration', desc: 'Connect disparate systems, APIs, and data sources into a unified operational fabric. Eliminate data silos and synchronization failures across your organization.' },
  { icon: 'Database', title: 'Data Infrastructure', desc: 'Design and deploy enterprise-grade data pipelines, warehouses, and real-time streaming architectures that scale with organizational complexity.' },
  { icon: 'Workflow', title: 'Workflow Automation', desc: 'Automate complex multi-system workflows with conditional logic, error handling, and audit trails built for institutional-grade reliability.' },
  { icon: 'Intelligence', title: 'Intelligence Systems', desc: 'Embed analytical and predictive capabilities directly into operational workflows, enabling intelligent decision support at every process layer.' },
  { icon: 'Monitor', title: 'Operational Monitoring', desc: 'Real-time visibility across all integrated systems with configurable alerting, anomaly detection, and operational health dashboards.' },
];

export const archLayers: ArchLayer[] = [
  { name: 'Applications', desc: 'End-user interfaces, dashboards, and operational tooling built by Regent for each client', color: '#4f46e5' },
  { name: 'Intelligence Layer', desc: 'Analytics, ML inference, and decision-support services embedded in operational workflows', color: '#6366f1' },
  { name: 'Automation Layer', desc: 'Workflow orchestration, process automation, and event-driven execution engines', color: '#818cf8' },
  { name: 'Data Infrastructure', desc: 'Unified data storage, streaming pipelines, and transformation services', color: '#a5b4fc' },
  { name: 'Integration Layer', desc: 'Protocol adapters, API gateways, and connector frameworks for all system interfaces', color: '#c7d2fe' },
  { name: 'External Systems', desc: 'Third-party platforms, legacy systems, data feeds, and external APIs', color: '#e0e7ff' },
];

export const modules: Module[] = [
  {
    name: 'Regent Integrate', num: '01', slug: 'integrate',
    desc: 'Universal connectivity layer supporting REST, GraphQL, gRPC, SOAP, and event-driven protocols. Deploy connectors in hours, not months.',
    longDesc: 'Regent Integrate is the foundational connectivity layer we deploy when building systems for our clients. It connects any system — regardless of vendor, age, or protocol — into a unified integration fabric. We use it to eliminate the months-long connector development cycles that plague enterprise projects.',
    features: [
      { title: '180+ Pre-Built Connectors', desc: 'Enterprise-grade connectors for Salesforce, SAP, Oracle, Workday, and 170+ more platforms — ready to deploy on day one.' },
      { title: 'Custom Connector SDK', desc: 'For proprietary or legacy systems, our SDK lets us build production-grade connectors in days, not months.' },
      { title: 'Multi-Protocol Support', desc: 'REST, GraphQL, gRPC, SOAP, FTP, JDBC, and event-driven protocols — all supported natively.' },
      { title: 'Real-Time & Batch Modes', desc: 'Choose real-time streaming for live data or batch synchronization for high-volume periodic transfers.' },
      { title: 'Visual Mapping Engine', desc: 'Data transformation and field mapping with a visual interface — reducing integration logic errors by 90%.' },
      { title: 'Connection Health Monitoring', desc: 'Every connector is continuously monitored for latency, error rates, and throughput with automatic alerting.' },
    ],
    specs: [
      { label: 'Protocols', value: 'REST, GraphQL, gRPC, SOAP, FTP, JDBC, AMQP, MQTT' },
      { label: 'Throughput', value: 'Up to 100K events/sec per connector' },
      { label: 'Latency', value: 'Sub-10ms for real-time connectors' },
      { label: 'Pre-Built Connectors', value: '180+' },
      { label: 'Auth Methods', value: 'OAuth 2.0, SAML, API Keys, mTLS, Kerberos' },
      { label: 'Data Formats', value: 'JSON, XML, CSV, Avro, Parquet, Protobuf' },
    ],
    useCases: ['Multi-system CRM unification', 'Legacy mainframe API wrapping', 'Cross-cloud data synchronization', 'ERP migration bridging', 'Real-time event streaming between platforms'],
  },
  {
    name: 'Regent Data', num: '02', slug: 'data',
    desc: 'Managed data infrastructure for storage, transformation, and delivery. Built for reliability at institutional scale.',
    longDesc: 'Regent Data is the data infrastructure layer we architect into every client system. It handles ingestion, storage, transformation, and delivery — ensuring data is always consistent, available, and governed. We build data pipelines that institutions can depend on for decades.',
    features: [
      { title: 'Managed Data Pipelines', desc: 'Guaranteed-delivery pipelines with automatic retry, dead-letter queuing, and exactly-once processing semantics.' },
      { title: 'Real-Time Streaming', desc: 'Event-driven streaming architecture for sub-second data delivery across the entire system landscape.' },
      { title: 'Transformation Engine', desc: 'SQL and code-first transformation with version control, testing, and rollback capabilities.' },
      { title: 'Data Quality Monitoring', desc: 'Automated anomaly detection, schema validation, and data freshness monitoring across all pipelines.' },
      { title: 'Schema Registry', desc: 'Centralized schema management with compatibility checking, versioning, and governance controls.' },
      { title: 'Warehouse Connectors', desc: 'Native integration with Snowflake, BigQuery, Redshift, Databricks, and all major data platforms.' },
    ],
    specs: [
      { label: 'Processing', value: 'Up to 1M records/sec' },
      { label: 'Delivery Guarantee', value: 'Exactly-once semantics' },
      { label: 'Latency', value: 'Sub-second streaming' },
      { label: 'Storage', value: 'Petabyte-scale managed storage' },
      { label: 'Retention', value: 'Configurable, up to indefinite' },
      { label: 'Formats', value: 'JSON, Avro, Parquet, CSV, ORC' },
    ],
    useCases: ['Enterprise data warehouse population', 'Real-time analytics pipelines', 'Cross-system data reconciliation', 'Regulatory data archiving', 'Event-sourced architecture backends'],
  },
  {
    name: 'Regent Automate', num: '03', slug: 'automate',
    desc: 'Visual and code-first workflow automation with enterprise-grade execution guarantees, retry logic, and complete audit trails.',
    longDesc: 'Regent Automate is how we build operational workflows that span multiple systems. It provides both visual and code-first interfaces for designing complex automation with institutional-grade reliability — including retry logic, error handling, human-in-the-loop approvals, and complete audit trails.',
    features: [
      { title: 'Visual Workflow Designer', desc: 'Drag-and-drop workflow builder for designing complex multi-step automations with branching logic.' },
      { title: 'Code-First SDK', desc: 'TypeScript and Python SDKs for engineers who prefer to define workflows as code with full IDE support.' },
      { title: 'Execution Guarantees', desc: 'Enterprise-grade reliability with automatic retry, dead-letter handling, and exactly-once execution.' },
      { title: 'Human-in-the-Loop', desc: 'Approval workflows with configurable escalation, delegation, and timeout policies.' },
      { title: 'Complete Audit Trails', desc: 'Every workflow execution is fully logged — inputs, outputs, decisions, and timing — for compliance.' },
      { title: 'SLA Monitoring', desc: 'Define SLAs for every workflow and get alerted before breaches occur with predictive monitoring.' },
    ],
    specs: [
      { label: 'Execution Modes', value: 'Sync, async, scheduled, event-triggered' },
      { label: 'Max Workflow Steps', value: 'Unlimited' },
      { label: 'Retry Policies', value: 'Exponential backoff, fixed, custom' },
      { label: 'Concurrency', value: 'Up to 10K parallel executions' },
      { label: 'Audit Retention', value: '7 years (configurable)' },
      { label: 'SDK Languages', value: 'TypeScript, Python, Go' },
    ],
    useCases: ['Multi-system onboarding workflows', 'Regulatory compliance automation', 'Incident response orchestration', 'Cross-department approval chains', 'Scheduled reporting pipelines'],
  },
  {
    name: 'Regent Intelligence', num: '04', slug: 'intelligence',
    desc: 'Operational AI layer for embedding analytics, anomaly detection, and predictive models directly into workflows.',
    longDesc: 'Regent Intelligence is the AI and analytics layer we embed into client systems. It enables real-time decision support, anomaly detection, and predictive capabilities — all integrated directly into operational workflows rather than siloed in separate analytics tools.',
    features: [
      { title: 'Operational AI', desc: 'Deploy ML models directly into workflows for real-time classification, prediction, and decision support.' },
      { title: 'Anomaly Detection', desc: 'Automatic detection of unusual patterns across integrated data streams with configurable sensitivity.' },
      { title: 'Predictive Analytics', desc: 'Forecast demand, risk, and operational metrics using historical data and real-time signals.' },
      { title: 'Natural Language Queries', desc: 'Ask questions about operational data in plain English and get instant answers with source citations.' },
      { title: 'Model Management', desc: 'Version, deploy, monitor, and rollback ML models with full lifecycle management infrastructure.' },
      { title: 'Embedded Dashboards', desc: 'Rich analytical dashboards that can be embedded directly into client applications and portals.' },
    ],
    specs: [
      { label: 'Inference Latency', value: 'Sub-50ms for real-time models' },
      { label: 'Model Frameworks', value: 'TensorFlow, PyTorch, ONNX, custom' },
      { label: 'Data Sources', value: 'Any connected system via Regent Integrate' },
      { label: 'Anomaly Detection', value: 'Statistical, ML-based, rule-based' },
      { label: 'Query Language', value: 'SQL, natural language, API' },
      { label: 'Visualization', value: 'Charts, tables, maps, custom components' },
    ],
    useCases: ['Fraud detection in financial transactions', 'Predictive maintenance for industrial assets', 'Demand forecasting for supply chains', 'Risk scoring for compliance workflows', 'Operational health scoring'],
  },
  {
    name: 'Regent Monitor', num: '05', slug: 'monitor',
    desc: 'Full-stack observability platform with real-time metrics, distributed tracing, and configurable alerting across all integrated systems.',
    longDesc: 'Regent Monitor is the observability layer we build into every system we deliver. It provides real-time visibility across all integrated systems — from individual connector health to end-to-end workflow performance — so our clients always know exactly what is happening in their infrastructure.',
    features: [
      { title: 'Full-Stack Observability', desc: 'Metrics, logs, and traces across every layer of the integrated system landscape in a single pane of glass.' },
      { title: 'Distributed Tracing', desc: 'Follow any request or data flow across system boundaries with end-to-end trace visualization.' },
      { title: 'Configurable Alerting', desc: 'Define alert rules on any metric with multiple channels — Slack, email, PagerDuty, webhooks, and more.' },
      { title: 'Health Dashboards', desc: 'Pre-built and customizable dashboards for system health, integration status, and workflow performance.' },
      { title: 'SLA Tracking', desc: 'Track SLA compliance across all systems and predict potential breaches before they occur.' },
      { title: 'Integration Diagnostics', desc: 'Deep diagnostics for every connector — latency breakdown, error classification, and remediation suggestions.' },
    ],
    specs: [
      { label: 'Metric Resolution', value: '1-second granularity' },
      { label: 'Trace Retention', value: '30 days (configurable)' },
      { label: 'Alert Channels', value: 'Slack, email, PagerDuty, webhook, SMS' },
      { label: 'Dashboard Refresh', value: 'Real-time (sub-second)' },
      { label: 'Log Ingestion', value: 'Up to 1TB/day' },
      { label: 'Uptime SLA', value: '99.99%' },
    ],
    useCases: ['Enterprise integration health monitoring', 'SLA compliance tracking and reporting', 'Incident detection and response', 'Capacity planning and forecasting', 'Executive operational dashboards'],
  },
];

export const industries: Industry[] = [
  { icon: 'BarChart', name: 'Finance', desc: 'We integrate trading systems, risk platforms, and regulatory reporting infrastructure — enabling real-time data flows across the most complex financial architectures.' },
  { icon: 'Building', name: 'Government', desc: 'We deliver mission-critical integration engineering for government agencies, connecting legacy systems with modern services while maintaining security and compliance.' },
  { icon: 'Globe', name: 'Infrastructure', desc: 'We build operational technology integration for critical infrastructure operators — connecting OT systems with enterprise platforms and monitoring infrastructure.' },
  { icon: 'Zap', name: 'Enterprise', desc: 'We deliver end-to-end enterprise integration across ERP, CRM, HRMS, and custom systems — eliminating data silos and enabling unified operational intelligence.' },
  { icon: 'Monitor', name: 'Energy', desc: 'We integrate SCADA systems, asset management platforms, and market data feeds into unified operational architectures for energy companies.' },
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'architecture-of-modern-system-platforms',
    title: 'The Architecture of Modern System Platforms',
    excerpt: 'Enterprise systems have grown too complex for point-to-point integration. Platform architecture represents the only viable path to operational coherence at scale.',
    author: 'Regent Editorial',
    date: 'February 28, 2026',
    category: 'Architecture',
    readTime: '8 min',
    content: `<p>Modern enterprise organizations operate dozens—sometimes hundreds—of distinct software systems. Each system was acquired or built to solve a specific operational problem. Taken individually, each makes sense. Taken together, they constitute one of the defining infrastructure challenges of our era.</p><p>The problem is not the existence of multiple systems. The problem is the absence of connective tissue. Without a coherent integration architecture, data becomes inconsistent across systems, workflows fragment at system boundaries, and organizational intelligence—the capacity to understand what is actually happening—degrades to near zero.</p><h2>The Failure of Point-to-Point Integration</h2><p>The traditional response to multi-system complexity has been point-to-point integration: build a direct connection between System A and System B, then another between System B and System C. This approach fails predictably at scale.</p><p>In a network of N systems, point-to-point architecture requires O(N²) connections. Each connection introduces its own failure mode, data transformation logic, and maintenance burden.</p><h2>The Platform Model</h2><p>Platform architecture solves this problem by introducing a mediation layer: a central integration platform through which all system communication flows. Instead of N² connections, you build N connections to the platform. The platform handles translation, transformation, routing, and reliability.</p><p>But platform architecture is more than an integration pattern. Done well, it creates the conditions for a new kind of organizational capability: operational intelligence. When all data flows through a common infrastructure, it becomes possible to observe, analyze, and optimize the entire organization as a system.</p>`,
  },
  {
    slug: 'fragmentation-problem-enterprise-systems',
    title: 'The Fragmentation Problem in Enterprise Systems',
    excerpt: 'Disconnected systems are not just an IT problem—they are an organizational intelligence problem that compounds over time and undermines institutional decision-making.',
    author: 'Regent Editorial',
    date: 'February 14, 2026',
    category: 'Enterprise',
    readTime: '6 min',
    content: `<p>When we speak of enterprise fragmentation, we typically mean technical fragmentation: systems that do not communicate, data that cannot be reconciled, workflows that break at system boundaries. This is real and costly. But it is the downstream effect—organizational intelligence failure—that is the deeper problem.</p><p>An organization that cannot integrate its systems cannot answer fundamental operational questions with confidence. How are we performing? Where are we exposed? What is actually happening?</p><h2>The Compound Effect</h2><p>Fragmentation compounds. Each new system acquired creates new integration requirements. Each unresolved integration creates new data discrepancies. Each data discrepancy erodes trust in organizational data.</p><h2>Integration as Strategic Infrastructure</h2><p>The organizations that treat integration as strategic infrastructure—not as an IT maintenance problem—gain durable competitive advantages. They can deploy new capabilities faster, because they have a platform to build on.</p>`,
  },
  {
    slug: 'designing-infrastructure-institutional-scale',
    title: 'Designing Infrastructure for Institutional Scale',
    excerpt: 'Infrastructure built for startup scale fails silently at institutional scale. The principles that govern reliable, large-scale system design are distinct from those that govern rapid prototyping.',
    author: 'Regent Engineering',
    date: 'January 30, 2026',
    category: 'Infrastructure',
    readTime: '10 min',
    content: `<p>There is a persistent misconception in technology that good engineering is scale-invariant—that a well-designed system at small scale will perform equally well at large scale. This is false.</p><p>Institutional scale introduces failure modes that simply do not exist at startup scale. At small scale, a system that fails can be restarted. At institutional scale, a system that fails may disrupt thousands of users.</p><h2>Reliability Engineering at Institutional Scale</h2><p>Reliable large-scale systems are not simply larger versions of reliable small-scale systems. They require explicit architectural decisions around failure isolation, graceful degradation, and recovery procedures.</p><h2>The Case for Infrastructure Investment</h2><p>Organizations that invest in institutional-grade infrastructure before scaling have substantially better outcomes than those that scale first and retrofit infrastructure later.</p>`,
  },
];

export const resources: Resource[] = [
  { type: 'Whitepaper', title: 'Integration Architecture for Modern Enterprises', desc: 'A technical guide to designing integration infrastructure that scales with organizational complexity.' },
  { type: 'Research', title: 'The State of Enterprise Integration 2026', desc: 'Annual survey of integration practices, maturity levels, and outcomes across 500+ enterprise organizations.' },
  { type: 'Documentation', title: 'Regent Technical Reference', desc: 'Complete technical documentation for the Regent APIs, connectors, and configuration.' },
  { type: 'Case Study', title: 'Global Bank Reduces Data Latency by 94%', desc: 'How a tier-1 financial institution used Regent to unify 23 disparate systems into a real-time operational platform.' },
  { type: 'Whitepaper', title: 'Security Architecture for Integration Platforms', desc: 'Design principles and implementation patterns for securing enterprise integration infrastructure.' },
  { type: 'Case Study', title: 'Government Agency Modernizes Legacy Infrastructure', desc: 'Deploying Regent to connect 40-year-old COBOL systems with modern cloud services without disruption.' },
];

export const team: TeamMember[] = [
  { name: 'Alastair Drummond', role: 'Chief Executive Officer', bio: 'Former CTO at a global financial exchange. Built integration infrastructure for organizations processing trillions in daily volume.' },
  { name: 'Dr. Sarah Chen', role: 'Chief Technology Officer', bio: 'Previously led distributed systems engineering at a major cloud infrastructure provider. PhD in distributed computing from MIT.' },
  { name: 'James Thornton', role: 'Chief Revenue Officer', bio: 'Two decades in enterprise software. Scaled revenue organizations at three enterprise infrastructure companies from Series B through IPO.' },
  { name: 'Elena Vasquez', role: 'VP Engineering', bio: 'Led platform engineering teams at a tier-1 investment bank. Expert in financial systems integration and operational resilience.' },
];

export const detailedCapabilities = [
  {
    icon: 'Integration' as IconName, title: 'Systems Integration', tag: '01',
    desc: 'We connect any system — regardless of age, protocol, or vendor — into a unified integration layer tailored to your organization.',
    points: ['Custom connector engineering for any enterprise system', 'Full protocol support: REST, GraphQL, gRPC, SOAP, event-driven', 'Real-time and batch synchronization architectures', 'Data transformation and mapping designed for your data model', 'Ongoing connector maintenance and evolution'],
  },
  {
    icon: 'Database' as IconName, title: 'Data Infrastructure', tag: '02',
    desc: 'We architect and deploy enterprise-grade data infrastructure — from ingestion pipelines to warehousing and real-time delivery.',
    points: ['Custom data pipeline engineering with guaranteed delivery', 'Real-time streaming architectures for event-driven operations', 'Data quality monitoring and anomaly detection frameworks', 'Schema governance and data lineage tooling', 'Integration with major data platforms and warehouses'],
  },
  {
    icon: 'Workflow' as IconName, title: 'Workflow Automation', tag: '03',
    desc: 'We design and build complex multi-system workflows with institutional-grade reliability, audit trails, and error handling.',
    points: ['Custom workflow design for cross-system processes', 'Conditional logic, branching, and sophisticated error handling', 'Human-in-the-loop approval and escalation workflows', 'Complete audit trails for compliance and governance', 'SLA monitoring and proactive alerting'],
  },
  {
    icon: 'Intelligence' as IconName, title: 'Intelligence Systems', tag: '04',
    desc: 'We embed analytical and predictive capabilities directly into your operational workflows — turning data into actionable intelligence.',
    points: ['Operational AI integration for real-time decision support', 'Anomaly detection across integrated data streams', 'Predictive analytics tailored to your operational context', 'Natural language interfaces for querying operational data', 'Model deployment and lifecycle management'],
  },
  {
    icon: 'Monitor' as IconName, title: 'Risk Monitoring', tag: '05',
    desc: 'We build real-time observability and risk monitoring solutions across all integrated systems and workflows.',
    points: ['Full-stack observability with distributed tracing', 'Custom alerting and incident escalation workflows', 'Operational health dashboards and executive reporting', 'SLA tracking with predictive breach detection', 'Integration health scoring and diagnostics'],
  },
];

export const industriesDetailed = industries.map((ind, i) => ({
  ...ind,
  detail: [
    'Financial institutions operate some of the most complex system landscapes in the world. Our engineers integrate trading platforms, risk systems, regulatory reporting infrastructure, and client management systems into real-time operational architectures — with zero tolerance for data inconsistency.',
    'Government agencies manage vast amounts of sensitive data across systems ranging from modern cloud applications to decades-old mainframe infrastructure. Regent delivers the integration engineering to connect these systems securely and reliably — without disrupting mission-critical services.',
    'Critical infrastructure operators need integration architectures that connect operational technology with enterprise systems — while maintaining the reliability and security standards that critical operations demand. Our team builds exactly that.',
    "Large enterprises typically manage dozens of business applications from different vendors and technology generations. Regent's consulting teams eliminate data silos and deliver a unified operational view across the entire enterprise application landscape.",
    'Energy companies operate at the intersection of operational technology and enterprise systems. Our engineers integrate SCADA systems, energy management platforms, and market data feeds into unified operational architectures designed for resilience.',
  ][i],
  useCases: [
    ['Real-time trading system integration', 'Regulatory reporting automation', 'Risk data aggregation', 'Client data platform unification'],
    ['Legacy system modernization', 'Cross-agency data sharing', 'Citizen service platform integration', 'Compliance reporting automation'],
    ['SCADA system integration', 'Asset management platform connectivity', 'Maintenance workflow automation', 'Operations center data consolidation'],
    ['ERP and CRM unification', 'Supply chain data integration', 'HR system connectivity', 'Business intelligence data consolidation'],
    ['SCADA and EMS integration', 'Market data feed management', 'Asset performance monitoring', 'Trading and scheduling system connectivity'],
  ][i],
}));

// Case Studies
export const caseStudies: CaseStudy[] = [
  {
    id: "global-bank",
    title: "Global Bank Reduces Data Latency by 94%",
    industry: "Finance",
    summary: "A tier-1 financial institution unified 23 disparate systems into a real-time operational platform, eliminating data inconsistencies and reducing reporting latency from hours to minutes.",
    challenge: "The bank operated 23 separate trading, risk, and compliance systems with manual data reconciliation processes. Report generation took 4+ hours daily, and data discrepancies caused regulatory concerns.",
    solution: "Regent deployed a unified integration fabric connecting all 23 systems with real-time data streaming. Automated transformation pipelines replaced manual reconciliation, and a centralized monitoring layer provided full operational visibility.",
    results: [
      "94% reduction in data latency (4 hours → 14 minutes)",
      "23 systems unified into single operational platform",
      "Zero data reconciliation errors in 12 months",
      "$12M annual savings in operational costs",
    ],
    metrics: [{ value: "94%", label: "Latency reduction" }, { value: "23", label: "Systems unified" }, { value: "$12M", label: "Annual savings" }],
  },
  {
    id: "gov-agency",
    title: "Government Agency Modernizes Legacy Infrastructure",
    industry: "Government",
    summary: "A federal agency connected 40-year-old COBOL mainframe systems with modern cloud services without disruption to mission-critical operations serving 50 million citizens.",
    challenge: "The agency's core systems ran on 40-year-old COBOL mainframes. Modernization attempts had failed twice due to the risk of disrupting services for 50M+ citizens. Data was trapped in legacy formats with no API access.",
    solution: "Regent implemented a non-invasive integration layer that wrapped legacy systems with modern API interfaces. A gradual migration strategy allowed new cloud services to coexist with mainframes, with real-time data synchronization between old and new systems.",
    results: [
      "Zero downtime during 18-month migration",
      "40-year-old systems connected to modern cloud",
      "50M+ citizens served without service disruption",
      "60% reduction in legacy maintenance costs",
    ],
    metrics: [{ value: "0", label: "Downtime hours" }, { value: "50M+", label: "Citizens served" }, { value: "60%", label: "Cost reduction" }],
  },
  {
    id: "energy-co",
    title: "Energy Company Unifies Operational Technology",
    industry: "Energy",
    summary: "A major energy company integrated SCADA systems, market data feeds, and enterprise platforms into a unified operational architecture, improving asset performance by 34%.",
    challenge: "Operational technology (SCADA, EMS) and enterprise systems (ERP, trading) operated in complete isolation. Asset performance data was delayed by hours, and manual processes led to missed market opportunities.",
    solution: "Regent bridged the OT/IT gap with secure, real-time data flows between SCADA systems and enterprise platforms. Automated workflows connected asset monitoring to trading and scheduling systems.",
    results: [
      "34% improvement in asset performance",
      "Real-time OT/IT data integration",
      "Automated market response workflows",
      "$8.5M annual revenue uplift from faster market response",
    ],
    metrics: [{ value: "34%", label: "Performance gain" }, { value: "Real-time", label: "OT/IT sync" }, { value: "$8.5M", label: "Revenue uplift" }],
  },
  {
    id: "enterprise-retail",
    title: "Enterprise Retailer Eliminates Data Silos",
    industry: "Enterprise",
    summary: "A Fortune 500 retailer unified ERP, CRM, supply chain, and HR systems across 12 countries, creating a single source of truth for global operations.",
    challenge: "12 country operations each ran different ERP, CRM, and supply chain systems. No single view of inventory, customer data, or financial performance existed. Regional teams made decisions on incomplete data.",
    solution: "Regent designed and built a global integration layer connecting all regional systems into a unified data fabric. Real-time dashboards replaced weekly manual reports, and automated workflows standardized cross-border processes.",
    results: [
      "Single source of truth across 12 countries",
      "87% reduction in report generation time",
      "Unified inventory visibility across all regions",
      "$22M savings from supply chain optimization",
    ],
    metrics: [{ value: "12", label: "Countries unified" }, { value: "87%", label: "Faster reporting" }, { value: "$22M", label: "Cost savings" }],
  },
];

// Careers
export const careers: CareerPosition[] = [
  { id: "se-1", title: "Senior Systems Engineer", department: "Engineering", location: "San Francisco / Remote", type: "Full-time" },
  { id: "se-2", title: "Staff Distributed Systems Engineer", department: "Engineering", location: "New York / Remote", type: "Full-time" },
  { id: "se-3", title: "Senior Frontend Engineer", department: "Engineering", location: "San Francisco / Remote", type: "Full-time" },
  { id: "se-4", title: "Infrastructure Security Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { id: "pm-1", title: "Senior Product Manager", department: "Product", location: "San Francisco", type: "Full-time" },
  { id: "pm-2", title: "Product Designer", department: "Product", location: "San Francisco / Remote", type: "Full-time" },
  { id: "sa-1", title: "Enterprise Solutions Architect", department: "Sales", location: "New York", type: "Full-time" },
  { id: "sa-2", title: "Account Executive, Enterprise", department: "Sales", location: "Chicago / Remote", type: "Full-time" },
  { id: "mk-1", title: "Content Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time" },
];

export const companyValues: CompanyValue[] = [
  { emoji: "⚙️", title: "Engineering Excellence", desc: "We build systems that work at institutional scale. Every architectural decision is deliberate, tested, and designed for reliability." },
  { emoji: "🔬", title: "First Principles Thinking", desc: "We start from fundamentals, not trends. Complex problems deserve rigorous analysis and creative solutions." },
  { emoji: "🤝", title: "Radical Collaboration", desc: "The best infrastructure is built by diverse teams working in concert. We value every perspective and expertise." },
  { emoji: "📐", title: "Precision in Craft", desc: "Details matter at scale. We hold ourselves to the highest standards in code quality, documentation, and communication." },
  { emoji: "🚀", title: "Bias for Impact", desc: "We measure success by outcomes, not activity. Every project ships with a clear understanding of the problem it solves." },
  { emoji: "🌍", title: "Long-term Thinking", desc: "We build for decades, not quarters. Our infrastructure decisions consider the organizations that will depend on them for years." },
];

export const benefits: Benefit[] = [
  { emoji: "💰", title: "Competitive Compensation", desc: "Top-of-market salary, equity, and annual performance bonuses." },
  { emoji: "🏥", title: "Premium Healthcare", desc: "Full medical, dental, and vision coverage for you and your family." },
  { emoji: "🏠", title: "Flexible Work", desc: "Remote-first culture with optional offices in SF and NYC." },
  { emoji: "📚", title: "Learning Budget", desc: "$5,000 annual budget for conferences, courses, and books." },
  { emoji: "🏖️", title: "Unlimited PTO", desc: "Take the time you need. We trust you to manage your schedule." },
  { emoji: "🍼", title: "Parental Leave", desc: "16 weeks paid leave for all new parents, regardless of gender." },
];
