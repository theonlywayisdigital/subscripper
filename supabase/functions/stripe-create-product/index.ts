// Supabase Edge Function: Create Stripe Product and Price
// Deploy with: supabase functions deploy stripe-create-product

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const {
      businessId,
      name,
      description,
      itemType,
      quantityPerPeriod,
      period,
      pricePence,
    } = await req.json()

    // Validate required fields
    if (!businessId || !name || !pricePence || !period) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get business's Stripe account ID
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('stripe_account_id, name')
      .eq('id', businessId)
      .single()

    if (fetchError || !business?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Business not found or Stripe not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map period to Stripe interval
    const intervalMap: Record<string, Stripe.PriceCreateParams.Recurring.Interval> = {
      day: 'day',
      week: 'week',
      month: 'month',
    }
    const interval = intervalMap[period]
    if (!interval) {
      return new Response(
        JSON.stringify({ error: 'Invalid period' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Product on the connected account
    const product = await stripe.products.create(
      {
        name,
        description: description || `${quantityPerPeriod} ${itemType} per ${period}`,
        metadata: {
          business_id: businessId,
          item_type: itemType || '',
          quantity_per_period: String(quantityPerPeriod || 1),
          period,
        },
      },
      {
        stripeAccount: business.stripe_account_id,
      }
    )

    // Create recurring Price on the connected account
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: pricePence,
        currency: 'gbp',
        recurring: {
          interval,
        },
        metadata: {
          business_id: businessId,
        },
      },
      {
        stripeAccount: business.stripe_account_id,
      }
    )

    return new Response(
      JSON.stringify({
        stripeProductId: product.id,
        stripePriceId: price.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Stripe product creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
