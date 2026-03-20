import { PageMeta } from "@/components/PageMeta";

export default function PrivacyPolicy() {
  return (
    <>
      <PageMeta
        title="Privacy Policy — Regent Systems"
        description="Regent Systems privacy policy. Learn how we collect, use, and protect your personal information."
      />
      <div className="section-container py-20 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, company name, and any messages you submit through our consultation request or newsletter forms. We also automatically collect certain technical data such as your IP address, browser type, and pages visited.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Respond to consultation requests and inquiries</li>
              <li>Send newsletter updates you have subscribed to</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">3. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. We may share data with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including encryption in transit and at rest, access controls, and regular security assessments.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights, contact us at <a href="mailto:privacy@regent.systems" className="text-primary hover:underline">privacy@regent.systems</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>We use essential cookies to ensure our website functions correctly. We may also use analytics cookies with your consent to understand how visitors interact with our site. You can manage cookie preferences through the cookie consent banner.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated effective date.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>If you have questions about this privacy policy, please contact us at <a href="mailto:privacy@regent.systems" className="text-primary hover:underline">privacy@regent.systems</a>.</p>
          </section>
        </div>
      </div>
    </>
  );
}
