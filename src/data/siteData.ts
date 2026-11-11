import type { IconName } from "@/components/Icons";
import {
  Cog,
  Microscope,
  Handshake,
  DraftingCompass,
  Rocket,
  Globe,
  DollarSign,
  HeartPulse,
  Home,
  BookOpen,
  Palmtree,
  Baby,
} from "lucide-react";

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
  detail: string;
  useCases: string[];
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
  image_url?: string | null;
  published?: boolean;
}

export interface Resource {
  type: string;
  title: string;
  slug?: string;
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
    name: 'Systems Integration', num: '01', slug: 'integrate',
    desc: 'Connects separate systems, interfaces, and data sources into one coherent operational layer.',
    longDesc: 'Organizations rarely run on a single system. Integration is the work of making the systems they already depend on behave as one: consistent in what they record, reliable in what they exchange, and clear about where each piece of information comes from.',
    features: [
      { title: 'Interface Design', desc: 'Defined contracts between systems, so a change in one place does not silently break another.' },
      { title: 'Legacy and Modern Together', desc: 'Older systems and current platforms connected without forcing either to be replaced first.' },
      { title: 'Real-Time and Scheduled Exchange', desc: 'Data moves when the work requires it, continuously or in batches.' },
      { title: 'Transformation and Mapping', desc: 'Records translated between systems with the logic made explicit and reviewable.' },
      { title: 'Failure Handling', desc: 'Interruptions are expected, detected, and recovered from without losing data.' },
      { title: 'Observable Connections', desc: 'Every connection reports on its own health.' },
    ],
    specs: [],
    useCases: ['Unifying records held in separate systems', 'Connecting legacy systems to current platforms', 'Synchronizing data across environments', 'Bridging systems during a migration'],
  },
  {
    name: 'Data Infrastructure', num: '02', slug: 'data',
    desc: 'Storage, movement, and transformation of data, built to stay consistent, available, and governed over time.',
    longDesc: 'Data infrastructure determines whether an organization can trust its own numbers. It covers how information is captured, stored, transformed, and delivered, and how that holds as volume and complexity grow.',
    features: [
      { title: 'Reliable Pipelines', desc: 'Data moves between systems with delivery that can be verified and retried.' },
      { title: 'Streaming and Batch', desc: 'Continuous and periodic processing, chosen to fit the work rather than the tooling.' },
      { title: 'Controlled Transformation', desc: 'Changes to data are versioned, tested, and reversible.' },
      { title: 'Quality Monitoring', desc: 'Anomalies, schema drift, and stale data are caught before they reach a decision.' },
      { title: 'Schema and Change Management', desc: 'Structures evolve without breaking the systems that depend on them.' },
      { title: 'Access and Governance', desc: 'Clear rules for who can see, change, and retain what.' },
    ],
    specs: [],
    useCases: ['Consolidating data into a single source of record', 'Reporting and analytics foundations', 'Reconciling records across systems', 'Long-term retention and archiving'],
  },
  {
    name: 'Workflow Automation', num: '03', slug: 'automate',
    desc: 'Multi-step processes that run across systems with defined rules, error handling, and a complete record of what happened.',
    longDesc: 'Most operational work is a sequence of steps passed between people and systems. Automation makes that sequence explicit, runs it reliably, and keeps a record of every decision along the way.',
    features: [
      { title: 'Rule-Based Workflows', desc: 'Branching logic that reflects how the organization actually decides.' },
      { title: 'Approvals and Escalation', desc: 'People stay in the loop where judgment is required, with clear ownership and timeouts.' },
      { title: 'Error Handling and Retries', desc: 'Failures are handled by design instead of discovered after the fact.' },
      { title: 'Complete Audit Trail', desc: 'Inputs, outputs, decisions, and timing recorded for every run.' },
      { title: 'Scheduled and Event-Driven Execution', desc: 'Processes start on a timetable or in response to what happens elsewhere.' },
      { title: 'Process Monitoring', desc: 'Visibility into where work is waiting and where it is stalling.' },
    ],
    specs: [],
    useCases: ['Multi-system onboarding', 'Approval chains across departments', 'Compliance and reporting processes', 'Incident response coordination'],
  },
  {
    name: 'Intelligence Systems', num: '04', slug: 'intelligence',
    desc: 'Analytical and predictive capability placed inside operational workflows, where decisions are made.',
    longDesc: 'Analysis is most useful at the point of decision. Intelligence systems bring models and analytics into the workflows that run the organization, instead of leaving them in separate tools that people have to remember to consult.',
    features: [
      { title: 'Decision Support', desc: 'Relevant signals surfaced at the moment a decision is being made.' },
      { title: 'Anomaly Detection', desc: 'Unusual patterns identified across connected data, with sensitivity tuned to the context.' },
      { title: 'Forecasting', desc: 'Demand, risk, and operating metrics projected from historical and live data.' },
      { title: 'Model Lifecycle', desc: 'Models versioned, monitored, and replaced under control.' },
      { title: 'Embedded Reporting', desc: 'Dashboards and analysis delivered inside the applications people already use.' },
      { title: 'Connected Data', desc: 'Analysis grounded in the same data the rest of the system runs on.' },
    ],
    specs: [],
    useCases: ['Operational health scoring', 'Risk scoring within compliance workflows', 'Demand forecasting', 'Exception detection in transaction flows'],
  },
  {
    name: 'Operational Monitoring', num: '05', slug: 'monitor',
    desc: 'Continuous visibility into the health of integrated systems and the workflows that run across them.',
    longDesc: 'A system that cannot describe its own condition cannot be trusted at scale. Monitoring gives the organization a live view of connections, data flows, and workflows, so problems are seen when they begin rather than when they are reported.',
    features: [
      { title: 'System Health Visibility', desc: 'Metrics, logs, and traces across every layer in one view.' },
      { title: 'End-to-End Tracing', desc: 'Follow a request or data flow across system boundaries.' },
      { title: 'Configurable Alerting', desc: 'Rules on any signal, routed to the people who need to act.' },
      { title: 'Health Dashboards', desc: 'Views for system health, integration status, and workflow performance.' },
      { title: 'Service Level Tracking', desc: 'Commitments measured continuously and flagged as they come under pressure.' },
      { title: 'Integration Diagnostics', desc: 'Connection-level detail on delays, errors, and likely causes.' },
    ],
    specs: [],
    useCases: ['Integration health monitoring', 'Service level tracking and reporting', 'Incident detection and response', 'Executive operational dashboards'],
  },
];

export const industries: Industry[] = [
  {
    icon: 'BarChart',
    name: 'Finance',
    desc: 'We integrate trading systems, risk platforms, and regulatory reporting infrastructure — enabling real-time data flows across the most complex financial architectures.',
    detail: 'Financial institutions operate some of the most complex system landscapes in the world. Our engineers integrate trading platforms, risk systems, regulatory reporting infrastructure, and client management systems into real-time operational architectures — with zero tolerance for data inconsistency.',
    useCases: ['Real-time trading system integration', 'Regulatory reporting automation', 'Risk data aggregation', 'Client data platform unification']
  },
  {
    icon: 'Building',
    name: 'Government',
    desc: 'We deliver mission-critical integration engineering for government agencies, connecting legacy systems with modern services while maintaining security and compliance.',
    detail: 'Government agencies manage vast amounts of sensitive data across systems ranging from modern cloud applications to decades-old mainframe infrastructure. Regent delivers the integration engineering to connect these systems securely and reliably — without disrupting mission-critical services.',
    useCases: ['Legacy system modernization', 'Cross-agency data sharing', 'Citizen service platform integration', 'Compliance reporting automation']
  },
  {
    icon: 'Globe',
    name: 'Infrastructure',
    desc: 'We build operational technology integration for critical infrastructure operators — connecting OT systems with enterprise platforms and monitoring infrastructure.',
    detail: 'Critical infrastructure operators need integration architectures that connect operational technology with enterprise systems — while maintaining the reliability and security standards that critical operations demand. Our team builds exactly that.',
    useCases: ['SCADA system integration', 'Asset management platform connectivity', 'Maintenance workflow automation', 'Operations center data consolidation']
  },
  {
    icon: 'Zap',
    name: 'Enterprise',
    desc: 'We deliver end-to-end enterprise integration across ERP, CRM, HRMS, and custom systems — eliminating data silos and enabling unified operational intelligence.',
    detail: "Large enterprises typically manage dozens of business applications from different vendors and technology generations. Regent's consulting teams eliminate data silos and deliver a unified operational view across the entire enterprise application landscape.",
    useCases: ['ERP and CRM unification', 'Supply chain data integration', 'HR system connectivity', 'Business intelligence data consolidation']
  },
  {
    icon: 'Monitor',
    name: 'Energy',
    desc: 'We integrate SCADA systems, asset management platforms, and market data feeds into unified operational architectures for energy companies.',
    detail: 'Energy companies operate at the intersection of operational technology and enterprise systems. Our engineers integrate SCADA systems, energy management platforms, and market data feeds into unified operational architectures designed for resilience.',
    useCases: ['SCADA and EMS integration', 'Market data feed management', 'Asset performance monitoring', 'Trading and scheduling system connectivity']
  },
  {
    icon: 'BookOpen',
    name: 'Education',
    desc: 'We unify Student Information Systems (SIS) and Learning Management Systems (LMS) into resilient, event-driven architectures for large-scale educational institutions.',
    detail: 'Educational institutions face the challenge of fragmented data across Student Information Systems, Learning Management Systems, and administrative portals. Regent builds unified, event-driven architectures that ensure data consistency and enable real-time student performance insights.',
    useCases: ['SIS and LMS real-time synchronization', 'Unified student performance dashboards', 'Automated course enrollment workflows', 'Educational data warehouse population']
  },
  {
    icon: 'Home',
    name: 'Real Estate',
    desc: 'We bridge the gap between physical property data and digital investment platforms, enabling real-time portfolio analytics and asset tokenization.',
    detail: 'Real estate firms and investment platforms require a seamless bridge between physical asset data and digital portfolio management. We integrate property management ERPs with analytical platforms and blockchain ledgers to enable real-time reporting and asset tokenization.',
    useCases: ['Property management ERP integration', 'Real-time portfolio performance analytics', 'Real estate asset tokenization oracles', 'Automated rent-roll reconciliation']
  },
  {
    icon: 'Zap',
    name: 'Media',
    desc: 'We engineer high-throughput streaming data fabrics and edge-computing microservices for global broadcasters and content distributors.',
    detail: 'Media and entertainment organizations must manage massive data flows and deliver low-latency content globally. We engineer streaming analytics fabrics and edge-computing microservices that optimize content distribution and audience engagement.',
    useCases: ['Multi-CDN streaming analytics', 'Edge-based content personalization', 'Real-time audience engagement telemetry', 'Automated ad-insertion orchestration']
  },
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
  {
    slug: 'decoupled-data-architectures-education',
    title: 'Decoupled Data Architectures in Educational Ecosystems: Bridging LMS and SIS Silos',
    excerpt: 'Why point-to-point integrations fail in modern education and how a decoupled data layer enables real-time student insights.',
    author: 'Regent Engineering',
    date: 'March 10, 2026',
    category: 'Architecture',
    readTime: '7 min',
    content: `<h2>The Silo Problem</h2><p>In large-scale educational institutions, student data is often trapped between Student Information Systems (SIS) and Learning Management Systems (LMS). These systems were designed for administrative efficiency, not data liquidity.</p><h2>The Decoupled Approach</h2><p>By implementing an event-driven data layer between these systems, institutions can move away from brittle nightly batch jobs toward real-time synchronization. This ensures that a student's progress in their LMS is immediately reflected in their academic record, enabling proactive intervention.</p><h2>Institutional Benefits</h2><p>Decoupling allows for the introduction of specialized analytical tools without requiring direct integration with legacy SIS mainframes, reducing risk and accelerating innovation.</p>`,
    published: true
  },
  {
    slug: 'real-estate-tokenization-infrastructure',
    title: 'Real Estate Tokenization and the Infrastructure of Trust',
    excerpt: 'Moving beyond the hype: The technical requirements for bridging physical property assets with digital ledgers.',
    author: 'Regent Editorial',
    date: 'March 10, 2026',
    category: 'Finance',
    readTime: '6 min',
    content: `<h2>The Asset Gap</h2><p>The primary hurdle for real estate tokenization is not the blockchain itself, but the "oracle problem": ensuring the digital token accurately reflects the physical and legal state of the property.</p><h2>Integration as the Solution</h2><p>Successful tokenization requires a deep integration between property management ERPs, legal registries, and the smart contract layer. This data pipeline must be immutable and highly available.</p><h2>The Future of Liquidity</h2><p>When property data is integrated into a unified platform, institutional investors can gain real-time transparency into portfolio performance, drastically reducing the friction of secondary market trading.</p>`,
    published: true
  },
  {
    slug: 'media-distribution-edge-microservices',
    title: 'The Future of Media Distribution: Microservices at the Edge',
    excerpt: 'How global broadcasters are using edge computing to deliver personalized, low-latency content at scale.',
    author: 'Regent Engineering',
    date: 'March 14, 2026',
    category: 'Media',
    readTime: '5 min',
    content: `<h2>The Bandwidth Challenge</h2><p>As content resolution increases, traditional centralized distribution models are reaching their physical limits. The cost of backhauling telemetry data is becoming prohibitive.</p><h2>Edge Intelligence</h2><p>By moving processing logic—such as ad-insertion and personalization oracles—to edge microservices, media companies can reduce latency and improve the viewer experience while lowering infrastructure costs.</p><h2>Regent's Role</h2><p>We build the orchestration layer that manages these distributed services, ensuring consistent state across a global network of edge nodes.</p>`,
    published: true
  }
];

export const resources: Resource[] = [
  { type: 'Whitepaper', title: 'Integration Architecture for Modern Enterprises', desc: 'A technical guide to designing integration infrastructure that scales with organizational complexity.' },
  { type: 'Research', title: 'The State of Enterprise Integration 2026', desc: 'Annual survey of integration practices, maturity levels, and outcomes across 500+ enterprise organizations.' },
  { type: 'Documentation', title: 'Regent Technical Reference', desc: 'Complete technical documentation for the Regent APIs, connectors, and configuration.' },
  { type: 'Case Study', title: 'Global Bank Reduces Data Latency by 94%', desc: 'How a tier-1 financial institution used Regent to unify 23 disparate systems into a real-time operational platform.' },
  { type: 'Whitepaper', title: 'Security Architecture for Integration Platforms', desc: 'Design principles and implementation patterns for securing enterprise integration infrastructure.' },
  { type: 'Case Study', title: 'Government Agency Modernizes Legacy Infrastructure', desc: 'Deploying Regent to connect 40-year-old COBOL systems with modern cloud services without disruption.' },
  {
    type: 'Whitepaper',
    title: 'Engineering Reliable Data Pipelines for Multi-Tenant Educational Platforms',
    slug: 'educational-data-pipelines',
    desc: 'Architectural patterns for high-availability data synchronization in large-scale academic ecosystems.'
  },
  {
    type: 'Technical Guide',
    title: 'API-First Integration for Real Estate Management Systems',
    slug: 'api-first-real-estate',
    desc: 'A framework for connecting property ERPs with modern digital investment platforms and tokenization layers.'
  }
];

export const team: TeamMember[] = [
  { name: 'Alastair Drummond', role: 'Chief Executive Officer', bio: 'Former CTO at a global financial exchange. Built integration infrastructure for organizations processing trillions in daily volume.' },
  { name: 'Dr. Sarah Chen', role: 'Chief Technology Officer', bio: 'Previously led distributed systems engineering at a major cloud infrastructure provider. PhD in distributed computing from MIT.' },
  { name: 'James Thornton', role: 'Chief Revenue Officer', bio: 'Two decades in enterprise software. Scaled revenue organizations at three enterprise infrastructure companies from Series B through IPO.' },
  { name: 'Elena Vasquez', role: 'VP Engineering', bio: 'Led platform engineering teams at a tier-1 investment bank. Expert in financial systems integration and operational resilience.' },
];

export const detailedCapabilities = [
  {
    icon: 'Database' as IconName, title: 'Data Infrastructure', tag: '01',
    desc: 'We architect and deploy enterprise-grade data infrastructure — from ingestion pipelines to warehousing and real-time delivery.',
    points: [
      'Custom data pipeline engineering with guaranteed delivery',
      'Real-time streaming architectures for event-driven operations',
      'Data quality monitoring and anomaly detection frameworks',
      'Schema governance and data lineage tooling',
      'Integration with major data platforms and warehouses'
    ],
  },
  {
    icon: 'Integration' as IconName, title: 'Systems Integration', tag: '02',
    desc: 'We connect any system — regardless of age, protocol, or vendor — into a unified integration layer tailored to your organization.',
    points: [
      'Custom connector engineering for any enterprise system',
      'Full protocol support: REST, GraphQL, gRPC, SOAP, event-driven',
      'Real-time and batch synchronization architectures',
      'Data transformation and mapping designed for your data model',
      'Ongoing connector maintenance and evolution'
    ],
  },
  {
    icon: 'Application' as IconName, title: 'Application Systems', tag: '03',
    desc: 'We engineer mission-critical applications that power operations on top of your integrated systems.',
    points: [
      'Custom operational platforms for internal teams and clients',
      'Enterprise dashboards and control interfaces for integrated systems',
      'Full-stack application architecture and deployment',
      'Secure authentication, authorization, and role management',
      'Scalable SaaS-style platforms built for long-term evolution'
    ],
  },
  {
    icon: 'Workflow' as IconName, title: 'Workflow Automation', tag: '04',
    desc: 'We design and build complex multi-system workflows with institutional-grade reliability and governance.',
    points: [
      'Custom workflow design for cross-system processes',
      'Conditional logic, branching, and sophisticated error handling',
      'Human-in-the-loop approval and escalation workflows',
      'Complete audit trails for compliance and governance',
      'SLA monitoring and proactive alerting'
    ],
  },
  {
    icon: 'Intelligence' as IconName, title: 'Intelligence Systems', tag: '05',
    desc: 'We embed analytical and predictive capabilities into operational systems — turning data into decision intelligence.',
    points: [
      'Operational AI integration for real-time decision support',
      'Anomaly detection across integrated data streams',
      'Predictive analytics tailored to your operational context',
      'Natural language interfaces for querying operational data',
      'Model deployment and lifecycle management'
    ],
  },
  {
    icon: 'Monitor' as IconName, title: 'Risk Monitoring', tag: '06',
    desc: 'We build real-time observability and risk monitoring across integrated systems and workflows.',
    points: [
      'Full-stack observability with distributed tracing',
      'Custom alerting and incident escalation workflows',
      'Operational health dashboards and executive reporting',
      'SLA tracking with predictive breach detection',
      'Integration health scoring and diagnostics'
    ],
  }
];

export const industriesDetailed = industries;

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

export const companyValues = [
  {
    icon: Cog,
    title: "Engineering Excellence",
    desc: "We build systems that work at institutional scale. Every architectural decision is deliberate, tested, and designed for reliability.",
  },
  {
    icon: Microscope,
    title: "First Principles Thinking",
    desc: "We start from fundamentals, not trends. Complex problems deserve rigorous analysis and creative solutions.",
  },
  {
    icon: Handshake,
    title: "Collective Intelligence",
    desc: "The best infrastructure is built by diverse teams working in concert. We value every perspective and expertise.",
  },
  {
    icon: DraftingCompass,
    title: "Precision in Craft",
    desc: "Details matter at scale. We hold ourselves to the highest standards in code quality, documentation, and communication.",
  },
  {
    icon: Rocket,
    title: "Outcome Orientation",
    desc: "We measure success by outcomes, not activity. Every project ships with a clear understanding of the problem it solves.",
  },
  {
    icon: Globe,
    title: "Long-term Thinking",
    desc: "We build for decades, not quarters. Our infrastructure decisions consider the organizations that will depend on them for years.",
  },
];

export const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    desc: "Top-of-market salary, equity, and annual performance bonuses.",
  },
  {
    icon: HeartPulse,
    title: "Premium Healthcare",
    desc: "Full medical, dental, and vision coverage for you and your family.",
  },
  {
    icon: Home,
    title: "Flexible Work",
    desc: "Remote-first culture with optional offices in SF and NYC.",
  },
  {
    icon: BookOpen,
    title: "Learning Budget",
    desc: "$5,000 annual budget for conferences, courses, and books.",
  },
  {
    icon: Palmtree,
    title: "Unlimited PTO",
    desc: "Take the time you need. We trust you to manage your schedule.",
  },
  {
    icon: Baby,
    title: "Parental Leave",
    desc: "16 weeks paid leave for all new parents, regardless of gender.",
  },
];