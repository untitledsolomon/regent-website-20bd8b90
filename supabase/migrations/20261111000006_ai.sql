-- -----------------------------------------------------------------------------
-- 20261111000006_ai.sql
-- WS5: AI provider settings (single row, per-administrator via RLS) and the
-- per-call usage/cost ledger. The API key itself lives in Supabase Vault under
-- vault_key_name; settings only ever store its last-4. Cost is computed at
-- write time from the price snapshot columns (cached tokens at the cached
-- rate). Prices seeded from the DeepSeek docs on 2026-11-11 (off-peak, USD).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id smallint PRIMARY KEY,
  provider text NOT NULL DEFAULT 'deepseek',
  base_url text NOT NULL DEFAULT 'https://api.deepseek.com',
  model text NOT NULL DEFAULT 'deepseek-flash',
  temperature numeric(3,2) NOT NULL DEFAULT 0.30,
  max_tokens integer NOT NULL DEFAULT 2048,
  enabled boolean NOT NULL DEFAULT true,
  price_input_per_mtok numeric(10,6) NOT NULL DEFAULT 0.15,
  price_output_per_mtok numeric(10,6) NOT NULL DEFAULT 0.60,
  price_input_cached_per_mtok numeric(10,6) NOT NULL DEFAULT 0.003,
  currency text NOT NULL DEFAULT 'USD',
  api_key_last4 text,
  vault_key_name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.ai_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read ai_settings" ON public.ai_settings;
CREATE POLICY "Admins can read ai_settings"
  ON public.ai_settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update ai_settings" ON public.ai_settings;
CREATE POLICY "Admins can update ai_settings"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature text NOT NULL CHECK (feature IN ('analytics_assistant', 'general_chat', 'test_connection')),
  provider text,
  model text,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  cached_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cost numeric(14,8) NOT NULL DEFAULT 0,
  price_input_per_mtok numeric(10,6),
  price_output_per_mtok numeric(10,6),
  price_input_cached_per_mtok numeric(10,6),
  currency text DEFAULT 'USD',
  latency_ms integer,
  success boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON public.ai_usage (feature);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read ai_usage" ON public.ai_usage;
CREATE POLICY "Admins can read ai_usage"
  ON public.ai_usage FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Per-admin assistant conversations + messages. RLS scopes rows to their owner;
-- admins may read across all conversations (support/audit).
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled conversation',
  feature text NOT NULL CHECK (feature IN ('analytics_assistant', 'general_chat')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content text,
  tool_calls jsonb,
  tool_name text,
  tool_call_id text,
  tool_events jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages (conversation_id, created_at);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read ai_conversations" ON public.ai_conversations;
CREATE POLICY "Owners can read ai_conversations"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Owners can insert ai_conversations" ON public.ai_conversations;
CREATE POLICY "Owners can insert ai_conversations"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update ai_conversations" ON public.ai_conversations;
CREATE POLICY "Owners can update ai_conversations"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Owners can read ai_messages" ON public.ai_messages;
CREATE POLICY "Owners can read ai_messages"
  ON public.ai_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin())
  ));

DROP POLICY IF EXISTS "Owners can insert ai_messages" ON public.ai_messages;
CREATE POLICY "Owners can insert ai_messages"
  ON public.ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));
