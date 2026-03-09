import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Icons } from "@/components/Icons";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CTASection } from "@/components/CardComponents";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GradientText } from "@/components/GradientText";
import { InteractiveDemo, type DemoStep } from "@/components/InteractiveDemo";
import { detailedCapabilities } from "@/data/siteData";
import { PageMeta } from "@/components/PageMeta";

const capabilityStats = [
  { label: "Pre-Built Connectors", value: "180+" },
  { label: "Protocols Supported", value: "12" },
  { label: "Avg Deploy Time", value: "4hrs" },
  { label: "Automation Uptime", value: "99.99%" },
];

const integrationComparison = [
  { approach: "Point-to-Point", connections: "N²", maintenance: "High", scalability: "Poor", timeToValue: "Months" },
  { approach: "Traditional iPaaS", connections: "N", maintenance: "Medium", scalability: "Limited", timeToValue: "Weeks" },
  { approach: "Regent Approach", connections: "N", maintenance: "Low", scalability: "Unlimited", timeToValue: "Hours", highlighted: true },
];

const workflowSteps: DemoStep[] = [
  {
    id: "connect",
    title: "Connect",
    icon: <span>🔌</span>,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">01</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Connect Your Systems</h3>
            <p className="text-[13px] text-text-muted">Deploy connectors in minutes, not months</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs leading-7">
          <div className="text-text-muted">$ regent connect --source salesforce --target postgres</div>
          <div className="text-primary mt-1">✓ Connector deployed (salesforce → postgres)</div>
          <div className="text-primary">✓ Schema mapped automatically</div>
          <div className="text-primary">✓ Initial sync: 2.4M records in 47s</div>
          <div className="text-text-muted mt-2">$ regent status</div>
          <div className="text-text-secondary">Active connectors: 184 | Healthy: 184 | Latency: 4ms</div>
        </div>
      </div>
    ),
  },
  {
    id: "unify",
    title: "Unify",
    icon: <span>🔗</span>,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">02</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Unify Data Schemas</h3>
            <p className="text-[13px] text-text-muted">Normalize across all sources automatically</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs leading-7">
          <div className="text-text-muted"># unified schema resolution</div>
          <div><span className="text-primary">sources</span>: [salesforce, sap, oracle, custom_api]</div>
          <div><span className="text-primary">conflicts_resolved</span>: 847</div>
          <div><span className="text-primary">duplicates_merged</span>: 12,403</div>
          <div><span className="text-primary">enrichments_applied</span>: geo, entity, risk</div>
          <div className="text-text-muted mt-2">Schema consistency: <span className="text-primary">99.98%</span></div>
        </div>
      </div>
    ),
  },
  {
    id: "automate",
    title: "Automate",
    icon: <span>⚡</span>,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">03</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Automate Workflows</h3>
            <p className="text-[13px] text-text-muted">Event-driven automation across systems</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs leading-7">
          <div className="text-text-muted"># workflow: order_fulfillment</div>
          <div><span className="text-primary">trigger</span>: order.created</div>
          <div><span className="text-primary">steps</span>:</div>
          <div className="pl-4">- validate_inventory (SAP)</div>
          <div className="pl-4">- reserve_stock (WMS)</div>
          <div className="pl-4">- process_payment (Stripe)</div>
          <div className="pl-4">- notify_customer (SendGrid)</div>
          <div className="text-text-muted mt-2">Avg execution: <span className="text-primary">340ms</span> | Success rate: <span className="text-primary">99.99%</span></div>
        </div>
      </div>
    ),
  },
  {
    id: "analyze",
    title: "Analyze",
    icon: <span>📊</span>,
    content: (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="font-mono text-[40px] font-semibold text-primary/10">04</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-text-primary">Surface Intelligence</h3>
            <p className="text-[13px] text-text-muted">Cross-system insights in real-time</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-xs leading-7">
          <div className="text-text-muted"># intelligence dashboard</div>
          <div><span className="text-primary">anomalies_detected</span>: 3 (last 24h)</div>
          <div><span className="text-primary">predictions</span>: demand_spike in 48h (92% conf)</div>
          <div><span className="text-primary">optimization</span>: route_change saves $47K/mo</div>
          <div><span className="text-primary">health_score</span>: 98.7 / 100</div>
          <div className="text-text-muted mt-2">Data freshness: <span className="text-primary">real-time</span> | Sources: <span className="text-primary">184</span></div>
        </div>
      </div>
    ),
  },
];

export default function CapabilitiesPage() {
  return (
    <div>
      <PageMeta title="Capabilities — Regent | Integration & Intelligence" description="Five core capabilities that address every layer of enterprise integration and intelligence." />
      {/* Hero */}
      <section className="pt-[140px] pb-[100px] bg-surface border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="section-container relative z-10">
          <div className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <span className="text-border-strong">→</span>
            Capabilities
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[720px]"
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">CAPABILITIES</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-heading font-semibold tracking-[-0.04em] leading-[1.0] text-text-primary mb-6">
              Complete integration and <GradientText>intelligence capabilities</GradientText>
            </h1>
            <p className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary leading-[1.65] max-w-[560px]">
              Five core capabilities that address every layer of the enterprise integration and intelligence problem.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10"
          >
            {capabilityStats.map((stat, i) => (
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

      {/* Detailed Capabilities */}
      {detailedCapabilities.map((cap, idx) => {
        const IconComp = Icons[cap.icon] || Icons.Integration;
        return (
          <div key={cap.title}>
            <section className={`py-20 ${idx % 2 === 1 ? 'bg-surface' : 'bg-card'}`}>
              <div className="section-container">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-20 items-center`}>
                  <RevealOnScroll className={idx % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[11px] tracking-[0.06em] px-2.5 py-0.5 rounded-full bg-surface text-text-secondary border border-border">{cap.tag}</span>
                      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary">CAPABILITY</span>
                    </div>
                    <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4">{cap.title}</h2>
                    <p className="text-[17px] text-text-secondary leading-[1.7] mb-8">{cap.desc}</p>
                    <div className="flex flex-col gap-3">
                      {cap.points.map(p => (
                        <div key={p} className="flex items-center gap-2.5">
                          <div className="text-primary flex-shrink-0"><Icons.Check /></div>
                          <span className="text-[15px] text-text-primary">{p}</span>
                        </div>
                      ))}
                    </div>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.2} className={idx % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="bg-accent-light border border-primary/15 rounded-2xl p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06)_0%,transparent_70%)]" />
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="text-primary opacity-40 scale-[4]"
                      >
                        <IconComp />
                      </motion.div>
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>
            {idx < detailedCapabilities.length - 1 && <hr className="border-t border-border" />}
          </div>
        );
      })}

      {/* Interactive Workflow Demo */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <InteractiveDemo
              label="INTERACTIVE DEMO"
              heading="Workflow Builder"
              subtitle="Walk through the four stages from disconnected systems to unified operational intelligence."
              steps={workflowSteps}
            />
          </RevealOnScroll>
        </div>
      </section>

      <hr className="border-t border-border" />

      <section className="py-[100px] bg-surface">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">COMPARISON</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
                Why Regent Is Different
              </h2>
              <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">
                Not all integration approaches are created equal. See how Regent compares.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Approach", "Connections", "Maintenance", "Scalability", "Time to Value"].map(h => (
                      <th key={h} className="font-mono text-[11px] tracking-[0.1em] uppercase text-text-muted text-left p-4 border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {integrationComparison.map((row) => (
                    <tr key={row.approach} className={row.highlighted ? "bg-accent-light" : ""}>
                      <td className={`p-4 border-b border-border font-heading text-[15px] font-semibold ${row.highlighted ? "text-primary" : "text-text-primary"}`}>
                        {row.approach}
                      </td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary font-mono">{row.connections}</td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary">{row.maintenance}</td>
                      <td className="p-4 border-b border-border text-sm text-text-secondary">{row.scalability}</td>
                      <td className={`p-4 border-b border-border text-sm font-medium ${row.highlighted ? "text-primary" : "text-text-secondary"}`}>{row.timeToValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[100px]">
        <div className="section-container">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">WORKFLOW</div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] text-text-primary mb-4">
                From Connection to Intelligence
              </h2>
              <p className="text-[17px] text-text-secondary max-w-[560px] mx-auto leading-[1.65]">
                The path from disconnected systems to unified operational intelligence follows four stages.
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Connect", desc: "Deploy connectors to every system in your landscape. REST, GraphQL, gRPC, SOAP, event streams — all handled." },
              { step: "02", title: "Unify", desc: "Normalize data across all sources into a common schema. Resolve conflicts, deduplicate, and enrich automatically." },
              { step: "03", title: "Automate", desc: "Build workflows that span systems. Trigger on events, apply business logic, handle errors, and maintain audit trails." },
              { step: "04", title: "Analyze", desc: "Surface operational intelligence across all integrated data. Detect anomalies, predict issues, and optimize processes." },
            ].map((s, i) => (
              <RevealOnScroll key={s.step} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative bg-card border border-border rounded-xl p-7 transition-all hover:border-border-strong"
                >
                  <div className="font-mono text-[40px] font-semibold text-primary/10 absolute top-4 right-5">{s.step}</div>
                  <div className="font-heading text-lg font-semibold text-text-primary mb-3 mt-6">{s.title}</div>
                  <p className="text-sm text-text-secondary leading-[1.65]">{s.desc}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
