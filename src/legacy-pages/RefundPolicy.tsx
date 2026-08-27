import { PageMeta } from "@/components/PageMeta";

export default function RefundPolicy() {
  return (
    <>
      <PageMeta
        title="Refund Policy — Regent Systems"
        description="Refund policy for Axis subscriptions billed by Regent Systems, including free trials, cancellations, and how to request a refund."
      />
      <div className="section-container py-20 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: August 27, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">1. Scope</h2>
            <p>
              This policy covers paid subscriptions to Axis, Regent Systems&rsquo; business
              operations platform, purchased directly through our checkout. Subscriptions are
              billed and processed by our payment provider and merchant of record, Paddle.com
              Market Limited, on our behalf.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">2. Free Trial</h2>
            <p>
              Every Axis plan (Starter, Pro, and Advanced) includes a 7-day free trial. A
              payment method is required to start a trial, but you will not be charged until
              the trial period ends. You can cancel at any time during the trial, from your
              account&rsquo;s billing settings, at no cost.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">3. Refund Eligibility</h2>
            <p>We evaluate refund requests case by case. We will generally issue a full refund if:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You were charged unexpectedly after a trial you intended to cancel, and you contact us within 7 days of the charge.</li>
              <li>You experienced a technical issue that prevented meaningful use of Axis during your billing period, and you reported it to us.</li>
              <li>You were charged in error (e.g. duplicate charge, incorrect plan or amount).</li>
            </ul>
            <p className="mt-3">
              Outside of these cases, subscription charges are generally non-refundable once a
              billing period has started, including partial months or years already in progress.
              You can cancel at any time to prevent future renewals.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">4. Annual Plans</h2>
            <p>
              For annual subscriptions, refund requests made within 14 days of the initial
              annual charge (or renewal) will generally be granted in full. After 14 days,
              annual charges are non-refundable, but you may cancel to prevent the next
              renewal.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">5. How to Cancel</h2>
            <p>
              You can cancel your subscription at any time from within Axis, under
              Settings &rarr; Billing. Cancelling stops future renewals; you&rsquo;ll retain
              access for the remainder of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">6. How to Request a Refund</h2>
            <p>
              To request a refund, email us at{" "}
              <a href="mailto:billing@regent.systems" className="text-primary hover:underline">
                billing@regent.systems
              </a>{" "}
              with your account email and the reason for your request. We aim to respond
              within 2 business days. Approved refunds are issued to your original payment
              method and processed by Paddle; timing to appear on your statement depends on
              your bank or card issuer, typically 5&ndash;10 business days.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">7. Chargebacks</h2>
            <p>
              If you believe you were charged in error, please contact us first &mdash; we
              resolve the great majority of billing issues directly and quickly. Initiating a
              chargeback with your bank before reaching out may delay resolution and can result
              in suspension of your account while the dispute is reviewed.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this refund policy from time to time. Changes take effect
              immediately upon posting to this page.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href="mailto:billing@regent.systems" className="text-primary hover:underline">
                billing@regent.systems
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
