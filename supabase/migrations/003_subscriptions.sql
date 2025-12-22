-- Subscripper Subscriptions Schema
-- Run this in Supabase SQL Editor

-- Subscription period types
CREATE TYPE subscription_period AS ENUM (
  'day',
  'week',
  'month'
);

-- Subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'paused',
  'cancelled',
  'expired'
);

-- Subscription products (what businesses offer)
CREATE TABLE IF NOT EXISTS public.subscription_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,

  -- What the subscription includes (e.g., "coffee", "pastry", "lunch")
  item_type text NOT NULL,
  quantity_per_period integer NOT NULL DEFAULT 1,
  period subscription_period NOT NULL DEFAULT 'month',

  -- Pricing in pence (e.g., 2999 = £29.99)
  price_pence integer NOT NULL,

  -- Blackout times (JSON array of time ranges when redemption is blocked)
  -- e.g., [{"day": "monday", "start": "12:00", "end": "14:00"}]
  blackout_times jsonb DEFAULT '[]',

  -- Custom branding
  branding jsonb DEFAULT '{}',

  -- Stripe integration (for later)
  stripe_product_id text,
  stripe_price_id text,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.subscription_products(id) ON DELETE CASCADE NOT NULL,

  -- Stripe integration (for later)
  stripe_subscription_id text,

  status subscription_status NOT NULL DEFAULT 'active',

  -- Current billing period
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,

  -- Redemption tracking for current period
  redemptions_used integer DEFAULT 0,

  -- Cancellation info
  cancelled_at timestamptz,
  cancel_reason text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Redemption records
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,

  -- What was redeemed
  item_type text NOT NULL,

  -- Who processed it (staff member)
  redeemed_by uuid REFERENCES public.profiles(id),
  redeemed_at timestamptz DEFAULT now(),

  -- Undo functionality
  undone_at timestamptz,
  undone_by uuid REFERENCES public.profiles(id)
);

-- Indexes
CREATE INDEX idx_products_business ON public.subscription_products(business_id);
CREATE INDEX idx_products_active ON public.subscription_products(is_active);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_product ON public.subscriptions(product_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_redemptions_subscription ON public.redemptions(subscription_id);
CREATE INDEX idx_redemptions_date ON public.redemptions(redeemed_at);

-- Auto-update triggers
CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.subscription_products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_subscription_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
