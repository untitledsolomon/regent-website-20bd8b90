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

const platformStats = [
  { label: "Active Connectors", value: "184+" },
  { label: "Events / Day", value: "2.4B" },
  { label: "P99 Latency", value: "12ms" },
  { label: "Uptime", value: "99.99%" },
];

const deploymentOptions = [
  { title: "Cloud-Native", desc: "Fully managed on AWS, Azure, or GCP with auto-scaling, zero-downtime deployments, and global edge distribution.", icon: "Globe" as const },
  { title: "On-Premises", desc: "Deploy within your own data center with full control over infrastructure, networking, and data residency.", icon: "Building" as const },
  { title: "Hybrid", desc: "Split workloads between cloud and on-premises environments with unified management and seamless data flow.", icon: "Integration" as const },
];

const performanceMetrics = [
  { metric: "Throughput", value: "2.4B events/day", detail: "Sustained throughput across distributed nodes with automatic load balancing and back-pressure handling." },
  { metric: "Latency", value: "12ms P99", detail: "End-to-end processing latency including transformation, routing, and delivery confirmation." },
  { metric: "Availability", value: "99.997%", detail: "Measured over trailing 12 months across all production deployments globally." },
  { metric: "Recovery", value: "<30s RTO", detail: "Automated failover with recovery time objective under 30 seconds for any single component failure." },
];

const architectureSteps: DemoStep[] = [
  {
    id: "ingestion",
    title: "Ingestion",
    icon: <span>📥</span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">INGESTION LAYER</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Universal Data Ingestion</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">Accepts data from any source — REST APIs, event streams, file drops, database CDC, and legacy protocols.</p>
          <div className="space-y-2">
            {["REST, GraphQL, gRPC, SOAP", "Kafka, RabbitMQ, SQS streams", "CDC from 40+ database types", "Batch file ingestion (S3, SFTP)"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs text-text-secondary leading-7">
          <div className="text-text-muted mb-2"># ingestion metrics</div>
          <div><span className="text-primary">throughput</span>: 2.4B events/day</div>
          <div><span className="text-primary">protocols</span>: 12 supported</div>
          <div><span className="text-primary">latency</span>: &lt;5ms intake</div>
          <div><span className="text-primary">backpressure</span>: automatic</div>
        </div>
      </div>
    ),
  },
  {
    id: "processing",
    title: "Processing",
    icon: <span>⚙️</span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">PROCESSING LAYER</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Real-Time Transformation</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">Transforms, enriches, and routes data in real-time with sub-millisecond latency.</p>
          <div className="space-y-2">
            {["Schema normalization & mapping", "Real-time deduplication", "Business rule engine", "Custom transformation pipelines"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs text-text-secondary leading-7">
          <div className="text-text-muted mb-2"># processing pipeline</div>
          <div><span className="text-primary">normalize</span>: schema_v4</div>
          <div><span className="text-primary">deduplicate</span>: true</div>
          <div><span className="text-primary">enrich</span>: [geo, entity, risk]</div>
          <div><span className="text-primary">latency_p99</span>: 3ms</div>
        </div>
      </div>
    ),
  },
  {
    id: "storage",
    title: "Storage",
    icon: <span>💾</span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">STORAGE LAYER</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Unified Data Fabric</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">Multi-tier storage with hot, warm, and cold layers. Full data residency controls for compliance.</p>
          <div className="space-y-2">
            {["Hot/warm/cold auto-tiering", "Field-level data residency", "Encrypted at rest & in transit", "Point-in-time recovery"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs text-text-secondary leading-7">
          <div className="text-text-muted mb-2"># storage config</div>
          <div><span className="text-primary">hot_tier</span>: NVMe SSD</div>
          <div><span className="text-primary">retention</span>: configurable</div>
          <div><span className="text-primary">encryption</span>: AES-256-GCM</div>
          <div><span className="text-primary">regions</span>: 18 available</div>
        </div>
      </div>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    icon: <span>🚀</span>,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-muted mb-3">DELIVERY LAYER</div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-3">Intelligent Routing & Delivery</h3>
          <p className="text-[15px] text-text-secondary leading-[1.7] mb-5">Exactly-once delivery guarantees with smart routing, retry logic, and confirmation across all systems.</p>
          <div className="space-y-2">
            {["Exactly-once delivery guarantee", "Smart retry with backoff", "Multi-destination fan-out", "Delivery confirmation & audit"].map(p => (
              <div key={p} className="flex items-center gap-2 text-[13px] text-text-primary"><span className="text-primary">→</span> {p}</div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs text-text-secondary leading-7">
          <div className="text-text-muted mb-2"># delivery status</div>
          <div><span className="text-primary">guarantee</span>: exactly-once</div>
          <div><span className="text-primary">destinations</span>: 184 active</div>
          <div><span className="text-primary">success_rate</span>: 99.997%</div>
          <div><span className="text-primary">avg_latency</span>: 12ms e2e</div>
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
              How we architect <GradientText>operational infrastructure</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px] mb-10">
              Regent is not middleware. We architect and deploy complete operational infrastructure that connects systems, enables automation, and delivers intelligence across the organization.
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
              <SectionHeader label="OVERVIEW" title="Platform Overview" />
              <p className="text-base leading-[1.75] text-text-secondary mb-6">
                Every system we build follows a layered integration and intelligence architecture. It connects every system in your organization through a common integration fabric, enabling unified data flows, coordinated automation, and operational intelligence.
              </p>
              <p className="text-base leading-[1.75] text-text-secondary mb-8">
                Unlike point-to-point integration tools or single-purpose middleware, we provide a complete approach to the entire integration and automation lifecycle.
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
              <div className="bg-surface border border-border rounded-2xl p-10 font-mono text-xs text-text-secondary leading-8">
                <div className="text-text-muted mb-4"># platform.config.yml</div>
                <div><span className="text-primary">platform</span>:</div>
                <div className="pl-4"><span className="text-emerald-600">version</span>: 4.2.0</div>
                <div className="pl-4"><span className="text-emerald-600">deployment</span>: hybrid-cloud</div>
                <div className="pl-4"><span className="text-emerald-600">regions</span>: [us-east, eu-west, ap-south]</div>
                <div className="mt-2"><span className="text-primary">integrations</span>:</div>
                <div className="pl-4"><span className="text-emerald-600">active_connectors</span>: 184</div>
                <div className="pl-4"><span className="text-emerald-600">events_per_day</span>: 2.4B</div>
                <div className="pl-4"><span className="text-emerald-600">latency_p99</span>: 12ms</div>
                <div className="mt-2"><span className="text-primary">health</span>:</div>
                <div className="pl-4"><span className="text-emerald-600">status</span>: <span className="text-emerald-600">operational</span></div>
                <div className="pl-4"><span className="text-emerald-600">uptime</span>: 99.997%</div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      {/* Deployment Options */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="DEPLOYMENT" title="Deploy Your Way" subtitle="We adapt to your infrastructure requirements — not the other way around." />
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

      {/* Interactive Architecture Explorer */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <InteractiveDemo
              label="LIVE EXPLORER"
              heading="Architecture Explorer"
              subtitle="Click each layer to explore how data flows through the Regent infrastructure stack."
              steps={architectureSteps}
            />
          </RevealOnScroll>
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

      {/* Performance */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <SectionHeader label="PERFORMANCE" title="Built for Scale" subtitle="Enterprise-grade performance metrics measured across all production deployments." />
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
              { icon: 'Monitor' as const, title: 'SOC 2 Type II Certified', desc: 'Annual third-party audits verify our security, availability, and confidentiality controls.' },
              { icon: 'Database' as const, title: 'Data Residency Controls', desc: 'Configure data residency at the field level. Comply with GDPR, CCPA, and regional data sovereignty requirements.' },
              { icon: 'Zap' as const, title: '99.99% Uptime SLA', desc: 'Contractual uptime commitments backed by distributed architecture and automated failover.' },
              { icon: 'Globe' as const, title: 'Global Deployment', desc: 'Deploy across 18 regions worldwide. Data never leaves your designated geographic boundaries.' },
              { icon: 'FileText' as const, title: 'Audit & Compliance', desc: 'Complete audit trails for all platform activity. Configurable retention policies for regulatory compliance.' },
            ].map((item, i) => (
              <CapabilityCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} delay={Math.min(i + 1, 5)} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
