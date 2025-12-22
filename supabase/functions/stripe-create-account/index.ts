// Supabase Edge Function: Create Stripe Connect Account
// Deploy with: supabase functions deploy stripe-create-account
// Set secret: supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client with service role for database updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { businessId, email, businessName, returnUrl, refreshUrl } = await req.json()

    if (!businessId || !email || !businessName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: businessId, email, businessName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if business already has a Stripe account
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch business: ${fetchError.message}`)
    }

    let accountId = business?.stripe_account_id

    // Create new Stripe Connect account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: email,
        business_type: 'company',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: businessName,
          product_description: 'Local subscription services',
        },
      })

      accountId = account.id

      // Save account ID to database
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ stripe_account_id: accountId })
        .eq('id', businessId)

      if (updateError) {
        throw new Error(`Failed to save Stripe account ID: ${updateError.message}`)
      }
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `subscripper://stripe-refresh?businessId=${businessId}`,
      return_url: returnUrl || `subscripper://stripe-return?businessId=${businessId}`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({
        accountId,
        onboardingUrl: accountLink.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Stripe account creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
