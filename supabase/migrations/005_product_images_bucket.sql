-- Migration: Create product-images storage bucket and add image column
-- Run this in your Supabase SQL Editor

-- Add image_url column to subscription_products
alter table public.subscription_products
add column if not exists image_url text;

-- Add reset_period column (daily/weekly/monthly - separate from billing period)
alter table public.subscription_products
add column if not exists reset_period text default 'month';

-- Create the product-images bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Policy: Allow authenticated users to upload images
create policy "Authenticated users can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

-- Policy: Allow users to update their own uploads
create policy "Users can update own product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow users to delete their own uploads
create policy "Users can delete own product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Anyone can view product images (public bucket)
create policy "Anyone can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');
