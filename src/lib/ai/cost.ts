// WS5: pure cost math shared by the server-action settings module and routes.
// Per-MTok billing; cached input is charged at the cached rate. Rounded 8dp.

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  total_tokens: number;
}

export interface CostPrices {
  price_input_per_mtok: number;
  price_output_per_mtok: number;
  price_input_cached_per_mtok: number;
}

export interface CostBreakdown {
  cost_input: number;
  cost_input_cached: number;
  cost_output: number;
  cost_total: number;
}

export function computeCost(usage: TokenUsage, prices: CostPrices): CostBreakdown {
  const input = (usage.prompt_tokens - usage.cached_tokens) * (prices.price_input_per_mtok / 1_000_000);
  const cached = usage.cached_tokens * (prices.price_input_cached_per_mtok / 1_000_000);
  const output = usage.completion_tokens * (prices.price_output_per_mtok / 1_000_000);
  const round = (v: number) => Math.round(v * 1e8) / 1e8;
  const total = round(input + cached + output);
  return {
    cost_input: round(input),
    cost_input_cached: round(cached),
    cost_output: round(output),
    cost_total: total,
  };
}
