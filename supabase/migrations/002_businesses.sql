-- Subscripper Businesses Schema
-- Run this in Supabase SQL Editor

-- Business status enum type
CREATE TYPE business_status AS ENUM (
  'pending_approval',
  'approved',
  'active',
  'suspended',
  'rejected'
);

-- Business types (categories)
CREATE TYPE business_type AS ENUM (
  'coffee_shop',
  'bakery',
  'restaurant',
  'cafe',
  'juice_bar',
  'pub',
  'takeaway',
  'other'
);

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type business_type NOT NULL DEFAULT 'other',
  description text,
  address text,
  lat double precision,
  lng double precision,
  email text,
  phone text,
  website text,
  logo_url text,
  cover_photos text[] DEFAULT '{}',
  branding jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  opening_hours jsonb DEFAULT '{}',
  google_place_id text,
  google_rating decimal(2,1),
  status business_status NOT NULL DEFAULT 'pending_approval',
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id),
  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  commission_rate decimal(4,2) DEFAULT 12.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business staff table
CREATE TABLE IF NOT EXISTS public.business_staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'manager')),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(business_id, email)
);

-- Indexes
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_type ON public.businesses(type);
CREATE INDEX idx_business_staff_business ON public.business_staff(business_id);
CREATE INDEX idx_business_staff_user ON public.business_staff(user_id);

-- Auto-update trigger
CREATE TRIGGER on_business_updated
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;
