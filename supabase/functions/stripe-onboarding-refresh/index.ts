// Supabase Edge Function: Refresh Stripe Onboarding Link
// Deploy with: supabase functions deploy stripe-onboarding-refresh
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { businessId, returnUrl, refreshUrl } = await req.json()

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: businessId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get business Stripe account ID
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single()

    if (fetchError || !business?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Business does not have a Stripe account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check account status
    const account = await stripe.accounts.retrieve(business.stripe_account_id)

    // If onboarding is complete, return success status
    if (account.details_submitted && account.charges_enabled) {
      // Update database if not already marked complete
      await supabase
        .from('businesses')
        .update({ stripe_onboarding_complete: true })
        .eq('id', businessId)

      return new Response(
        JSON.stringify({
          complete: true,
          accountId: business.stripe_account_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: business.stripe_account_id,
      refresh_url: refreshUrl || `subscripper://stripe-refresh?businessId=${businessId}`,
      return_url: returnUrl || `subscripper://stripe-return?businessId=${businessId}`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({
        complete: false,
        accountId: business.stripe_account_id,
        onboardingUrl: accountLink.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Stripe refresh error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
