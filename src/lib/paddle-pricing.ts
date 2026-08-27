// src/lib/paddle-pricing.ts
//
// Server-side helper for fetching live Axis pricing from Paddle's Pricing
// Preview API. Used by the /pricing page so displayed prices (including
// country overrides for GB/IE/AU) always match what's actually configured
// in Paddle, instead of being hand-typed and drifting out of sync.
//
// This calls Paddle's REST API directly with fetch rather than pulling in
// the full @paddle/paddle-node-sdk dependency, since this is the only
// Paddle call this repo needs (a single read-only preview).

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

export interface AxisPriceInfo {
  priceId: string;
  billingInterval: "month" | "year";
  formattedTotal: string;
  currencyCode: string;
}

export interface AxisPlanPricing {
  planId: "starter" | "pro" | "advanced";
  name: string;
  monthly: AxisPriceInfo | null;
  yearly: AxisPriceInfo | null;
}

const PLAN_PRICE_IDS: Record<AxisPlanPricing["planId"], { month: string; year: string }> = {
  starter: {
    month: "pri_01m11ca5ge1y4wheshg1r4ygxn",
    year: "pri_01m11ca5m7m3sx1ef2fw4bm0ew",
  },
  pro: {
    month: "pri_01m11ca5vqy919vh6xkee3bgzr",
    year: "pri_01m11ca5ymyba7qrky6xty1etq",
  },
  advanced: {
    month: "pri_01m11ca6609gfab3mmhrsdnwap",
    year: "pri_01m11ca6964kgtpj8h1m4twtkr",
  },
};

const PLAN_NAMES: Record<AxisPlanPricing["planId"], string> = {
  starter: "Starter",
  pro: "Pro",
  advanced: "Advanced",
};

interface PricingPreviewLineItem {
  price: { id: string; billing_cycle: { interval: string } | null };
  formatted_totals: { total: string };
  totals: { total: string; currency_code?: string };
}

interface PricingPreviewResponse {
  data: {
    currency_code: string;
    details: { line_items: PricingPreviewLineItem[] };
  };
}

/**
 * Fetches live pricing for all Axis plans, localized by IP address when
 * available (falls back to Paddle's default USD pricing otherwise, e.g.
 * during static generation with no request context).
 */
export async function getAxisPricing(customerIpAddress?: string): Promise<AxisPlanPricing[]> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set");
  }

  const allPriceIds = Object.values(PLAN_PRICE_IDS).flatMap((p) => [p.month, p.year]);

  const body: Record<string, unknown> = {
    items: allPriceIds.map((price_id) => ({ price_id, quantity: 1 })),
  };
  if (customerIpAddress) {
    body.customer_ip_address = customerIpAddress;
  }

  const res = await fetch(`${PADDLE_API_BASE}/pricing-preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // Live pricing shouldn't be cached indefinitely — Paddle prices can
    // change from the dashboard at any time. Revalidate hourly rather than
    // hitting the API on every request.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Paddle pricing preview failed: ${res.status} ${await res.text()}`);
  }

  const json: PricingPreviewResponse = await res.json();
  const lineItems = json.data.details.line_items;

  const findPrice = (priceId: string): AxisPriceInfo | null => {
    const item = lineItems.find((li) => li.price.id === priceId);
    if (!item) return null;
    return {
      priceId,
      billingInterval: (item.price.billing_cycle?.interval as "month" | "year") ?? "month",
      formattedTotal: item.formatted_totals.total,
      currencyCode: json.data.currency_code,
    };
  };

  return (Object.keys(PLAN_PRICE_IDS) as AxisPlanPricing["planId"][]).map((planId) => ({
    planId,
    name: PLAN_NAMES[planId],
    monthly: findPrice(PLAN_PRICE_IDS[planId].month),
    yearly: findPrice(PLAN_PRICE_IDS[planId].year),
  }));
}
