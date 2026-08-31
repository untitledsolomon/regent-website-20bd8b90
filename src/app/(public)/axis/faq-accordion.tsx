"use client";

import React from "react";

const FAQ_ITEMS = [
  {
    question: "Do I need an accountant to use Axis?",
    answer:
      "No. Axis is built so a business owner can manage invoicing and a real ledger without accounting training. If you already work with an accountant, they can use the same reports.",
  },
  {
    question: "What happens after my free trial ends?",
    answer:
      "Your 7-day trial doesn't require a card up front. When it ends, you'll be asked to pick a plan to keep going — your data stays exactly as you left it.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes — upgrade or downgrade at any time from your billing settings. Changes apply immediately and your next invoice is prorated.",
  },
  {
    question: "What integrations does Axis support?",
    answer:
      "Custom email domains are available on the Advanced plan today. Payment and messaging integrations are on our roadmap — Advanced customers get access first as they ship.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Yes. Every organization's data is isolated at the database level, and all connections are encrypted in transit.",
  },
];

type FAQ = {
  question: string;
  answer: string;
};

export function FAQAccordion() {
  const [openId, setOpenId] = React.useState<number | null>(0);

  return (
    <div className="space-y-px divide-y divide-border">
      {FAQ_ITEMS.map((item: FAQ, index: number) => (
        <details
          key={index}
          className="group"
          open={openId === index}
          onClick={(e) => {
            e.preventDefault();
            setOpenId(openId === index ? null : index);
          }}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left">
            <span className="font-heading text-base font-medium text-text-primary">
              {item.question}
            </span>
            <span className="flex-none font-mono text-lg text-text-secondary transition-transform duration-200">
              +
            </span>
          </summary>
          {openId === index && (
            <p className="mt-3 max-w-2xl pb-5 text-base leading-relaxed text-text-secondary">
              {item.answer}
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
