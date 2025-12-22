-- Migration: Add Stripe customer ID to profiles
-- Run this in your Supabase SQL Editor

-- Add stripe_customer_id column to profiles table
alter table public.profiles
add column if not exists stripe_customer_id text;

-- Create index for faster lookups
create index if not exists idx_profiles_stripe_customer_id
on public.profiles(stripe_customer_id);

-- Add pending status to subscriptions if not exists
alter table public.subscriptions
alter column status type text;

-- Ensure status constraint includes pending
alter table public.subscriptions
drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
add constraint subscriptions_status_check
check (status in ('active', 'paused', 'cancelled', 'expired', 'pending'));
