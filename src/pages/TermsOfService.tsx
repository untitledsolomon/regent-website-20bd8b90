import { PageMeta } from "@/components/PageMeta";

export default function TermsOfService() {
  return (
    <>
      <PageMeta
        title="Terms of Service — Regent Systems"
        description="Regent Systems terms of service. Read our terms and conditions for using our website and services."
      />
      <div className="section-container py-20 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Regent Systems website ("Site"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Site.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">2. Use of the Site</h2>
            <p>You agree to use this Site only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the Site. You may not use this Site to distribute harmful or offensive content, or to engage in unauthorized data collection.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">3. Intellectual Property</h2>
            <p>All content on this Site — including text, graphics, logos, images, and software — is the property of Regent Systems, Inc. or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">4. Consultation Requests</h2>
            <p>Information submitted through our consultation request form is used solely for the purpose of evaluating potential business engagements. We make no guarantees regarding response times or the availability of our services.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">5. Disclaimer of Warranties</h2>
            <p>This Site is provided "as is" without warranties of any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Regent Systems, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">7. Governing Law</h2>
            <p>These terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of the Site constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p>For questions about these terms, please contact us at <a href="mailto:legal@regent.systems" className="text-primary hover:underline">legal@regent.systems</a>.</p>
          </section>
        </div>
      </div>
    </>
  );
}
