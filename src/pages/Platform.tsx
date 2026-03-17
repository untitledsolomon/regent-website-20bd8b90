import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Icons } from "@/components/Icons";
import { SectionHeader } from "@/components/SectionHeader";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CapabilityCard, ArchitectureLayer, ModuleCard, CTASection } from "@/components/CardComponents";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { InteractiveDemo, type DemoStep } from "@/components/InteractiveDemo";
import { archLayers, modules } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";
import { ChartArea, Cog, Ruler, Search } from "lucide-react";

const platformStats = [
  { label: "Protocols Supported", value: "12+" },
  { label: "Integration Patterns", value: "25+" },
  { label: "Deployment Time", value: "8–16 Weeks" },
  { label: "Uptime SLA", value: "99.99%" },
];

const deploymentOptions = [
  { title: "Cloud-Native", desc: "Fully managed deployments on AWS, Azure, or GCP with auto-scaling, zero-downtime releases, and global edge distribution.", icon: "Globe" as const },
  { title: "On-Premises", desc: "We deploy within your data center with full control over infrastructure, networking, and data residency.", icon: "Building" as const },
  { title: "Hybrid", desc: "We architect split workloads between cloud and on-premises environments with unified management and seamless data flow.", icon: "Integration" as const },
];

const performanceMetrics = [
  { metric: "Throughput", value: "2.4B events/day", detail: "Sustained throughput we've achieved across client deployments with automatic load balancing and back-pressure handling." },
  { metric: "Latency", value: "12ms P99", detail: "End-to-end processing latency including transformation, routing, and delivery confirmation across production systems." },
  { metric: "Availability", value: "99.997%", detail: "Measured over trailing 12 months across all client production environments globally." },
  { metric: "Recovery", value: "<30s RTO", detail: "Automated failover with recovery time objective under 30 seconds for any single component failure." },
];

const methodologySteps: DemoStep[] = [
  {
    id: "assessment",
    title: "Assessment",
    icon: <span><Search/></span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">PHASE 1</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Systems & Data Audit</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">We audit your existing systems, data flows, and integration points to understand the full picture before writing a single line of code.</p>
          <div className="space-y-2">
            {["Map all existing systems and dependencies", "Identify data flow bottlenecks and gaps", "Evaluate security posture and compliance needs", "Define success metrics and KPIs"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center">
          <div className="space-y-4">
            {[
              { label: "Systems Mapped", value: "Every endpoint, database, and service" },
              { label: "Data Flows", value: "Complete lineage documentation" },
              { label: "Risk Assessment", value: "Security and compliance audit" },
              { label: "Deliverable", value: "Architecture recommendation report" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-primary tracking-wider uppercase min-w-[120px]">{item.label}</span>
                <span className="text-[13px] text-text-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: <span><Ruler/></span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">PHASE 2</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Target-State Design</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">We design the target-state infrastructure with security, scale, and your team's operational model in mind.</p>
          <div className="space-y-2">
            {["Design integration topology and data models", "Plan for security, compliance, and data residency", "Define scalability and failover strategies", "Create detailed implementation roadmap"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center">
          <div className="space-y-4">
            {[
              { label: "Topology", value: "System interconnection blueprint" },
              { label: "Data Model", value: "Normalized schemas and mappings" },
              { label: "Security", value: "Zero-trust architecture design" },
              { label: "Deliverable", value: "Technical architecture document" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-primary tracking-wider uppercase min-w-[120px]">{item.label}</span>
                <span className="text-[13px] text-text-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "implementation",
    title: "Implementation",
    icon: <span><Cog/></span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">PHASE 3</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Build & Deploy</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">We build and deploy using proven patterns — APIs, event streams, data pipelines — with rigorous testing at every stage.</p>
          <div className="space-y-2">
            {["API integrations and event stream setup", "Data pipeline construction and testing", "Automated CI/CD and infrastructure as code", "Staged rollout with zero-downtime migration"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center">
          <div className="space-y-4">
            {[
              { label: "Approach", value: "Agile sprints with weekly demos" },
              { label: "Testing", value: "Automated integration + load testing" },
              { label: "Migration", value: "Zero-downtime cutover strategy" },
              { label: "Deliverable", value: "Production-ready infrastructure" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-primary tracking-wider uppercase min-w-[120px]">{item.label}</span>
                <span className="text-[13px] text-text-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "optimization",
    title: "Optimization",
    icon: <span><ChartArea/></span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">PHASE 4</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Monitor & Evolve</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">We monitor, tune, and evolve the system as your needs change — ensuring long-term performance and reliability.</p>
          <div className="space-y-2">
            {["24/7 monitoring and alerting", "Performance tuning and cost optimization", "Capacity planning and scaling", "Ongoing feature development and iteration"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center">
          <div className="space-y-4">
            {[
              { label: "Monitoring", value: "Real-time dashboards and alerts" },
              { label: "SLA", value: "99.99% uptime guarantee" },
              { label: "Evolution", value: "Quarterly architecture reviews" },
              { label: "Deliverable", value: "Continuous improvement program" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-primary tracking-wider uppercase min-w-[120px]">{item.label}</span>
                <span className="text-[13px] text-text-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export default function PlatformPage() {
  return (
    <div>
      <PageMeta title="How We Build — Regent | Enterprise Infrastructure" description="How Regent architects and deploys operational infrastructure that connects systems, enables automation, and delivers intelligence across organizations." />
      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <span className="text-border-strong">→</span>
            Solutions
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">HOW WE BUILD</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Engineering Operational <GradientText>Infrastructure</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px] mb-10">
              We architect and deploy complete operational infrastructure that connects systems, enables automation, and delivers intelligence across your organization.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4"
          >
            {platformStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="font-heading text-[clamp(28px,3vw,36px)] font-semibold tracking-[-0.03em] text-text-primary">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="font-mono text-[11px] tracking-[0.06em] uppercase text-text-muted mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-[100px]">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <RevealOnScroll>
              <SectionHeader label="OVERVIEW" title="Our Approach" />
              <p className="text-base leading-[1.75] text-text-secondary mb-6">
                Every system we build follows a layered integration and intelligence architecture. We connect every system in your organization through a common integration fabric, enabling unified data flows, coordinated automation, and operational intelligence.
              </p>
              <p className="text-base leading-[1.75] text-text-secondary mb-8">
                Unlike point-to-point integration tools or single-purpose middleware, we provide a complete approach to the entire integration and automation lifecycle — from assessment through ongoing optimization.
              </p>
              <div className="flex flex-col gap-3">
                {['Enterprise-grade security and compliance', 'Deploy on-premises, cloud, or hybrid', '99.99% uptime SLA with 24/7 support', 'Scales from 10 to 10,000+ systems'].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="text-primary flex-shrink-0"><Icons.Check /></div>
                    <span className="text-[15px] text-text-primary">{item}</span>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <div className="bg-surface border border-border rounded-2xl p-10">
                <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-6">SYSTEM MODEL</div>
                <div className="space-y-4">
                  {[
                    "Data Infrastructure",
                    "Systems Integration",
                    "Application Systems",
                    "Workflow Automation",
                    "Intelligence Systems",
                    "Risk Monitoring",
                  ].map(layer => (
                    <div key={layer} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[14px] text-text-primary">{layer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Architecture */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="ARCHITECTURE" title="System Architecture Layers" subtitle="Six integrated layers we use in every system we build." />
          </RevealOnScroll>
          <div className="max-w-[680px] mx-auto">
            {archLayers.map((layer, i) => (
              <ArchitectureLayer key={layer.name} layer={layer} index={i} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Deployment Options */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="DEPLOYMENT" title="We Deploy Your Way" subtitle="We adapt to your infrastructure requirements — not the other way around." />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deploymentOptions.map((opt, i) => {
              const IconComp = Icons[opt.icon];
              return (
                <RevealOnScroll key={opt.title} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
                    className="bg-card border border-border rounded-xl p-8 transition-colors hover:border-border-strong h-full"
                  >
                    <div className="w-12 h-12 bg-accent-light rounded-[10px] flex items-center justify-center mb-6 text-primary">
                      <IconComp />
                    </div>
                    <h3 className="font-heading text-lg font-semibold tracking-[-0.02em] text-text-primary mb-3">{opt.title}</h3>
                    <p className="text-sm text-text-secondary leading-[1.7]">{opt.desc}</p>
                  </motion.div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Interactive Methodology Explorer */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <InteractiveDemo
              label="OUR PROCESS"
              heading="How We Build"
              subtitle="Click each phase to explore how we take projects from assessment through to ongoing optimization."
              steps={methodologySteps}
            />
          </RevealOnScroll>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Performance — What We Deliver */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="WHAT WE DELIVER" title="System Performance Benchmarks" subtitle="Enterprise-grade performance outcomes measured across our client deployments." />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {performanceMetrics.map((pm, i) => (
              <RevealOnScroll key={pm.metric} delay={i * 0.1}>
                <motion.div
                  whileHover={{ borderColor: "hsl(232 85% 74%)" }}
                  className="border border-border rounded-xl p-7 bg-card transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-text-muted">{pm.metric}</span>
                    <span className="font-heading text-lg font-semibold text-primary">{pm.value}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-[1.65]">{pm.detail}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Modules */}
      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="MODULES" title="Solution Modules" subtitle="Each module addresses a distinct layer of the integration and intelligence stack." />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <ModuleCard key={m.name} mod={m} delay={Math.min(i + 1, 5)} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Security */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="SECURITY" title="Security and Reliability" subtitle="Built from the ground up for organizations where security and uptime are non-negotiable." />
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'Shield' as const, title: 'Zero-Trust Architecture', desc: 'Every component operates on zero-trust principles. All traffic is authenticated, encrypted, and logged.' },
              { icon: 'Monitor' as const, title: 'Compliance-Ready', desc: 'We build systems that meet SOC 2, ISO 27001, and industry-specific compliance requirements from day one.' },
              { icon: 'Database' as const, title: 'Data Residency Controls', desc: 'Configure data residency at the field level. Comply with GDPR, CCPA, and regional data sovereignty requirements.' },
              { icon: 'Zap' as const, title: '99.99% Uptime SLA', desc: 'Contractual uptime commitments backed by distributed architecture and automated failover.' },
              { icon: 'Globe' as const, title: 'Global Deployment', desc: 'Deploy across 18 regions worldwide. Data never leaves your designated geographic boundaries.' },
              { icon: 'FileText' as const, title: 'Audit & Compliance', desc: 'Complete audit trails for all system activity. Configurable retention policies for regulatory compliance.' },
            ].map((item, i) => (
              <CapabilityCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} delay={Math.min(i + 1, 5)} />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      <section className="py-[80px] bg-surface">
        <div className="section-container">
          <SectionHeader
            label="OUTCOMES"
            title="What Organizations Achieve"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Unified visibility across previously siloed systems",
              "40–70% reduction in manual operational processes",
              "Real-time operational intelligence for decision making",
              "Automated compliance and audit reporting",
            ].map(item => (
              <div className="flex items-center gap-3">
                <Icons.Check />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      <CTASection />
    </div>
  );
}
