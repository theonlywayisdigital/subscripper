// Supabase Edge Function: Create Stripe Subscription
// Deploy with: supabase functions deploy stripe-create-subscription

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

    const { userId, productId } = await req.json()

    // Validate required fields
    if (!userId || !productId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get subscription product with business info
    const { data: product, error: productError } = await supabase
      .from('subscription_products')
      .select(`
        *,
        businesses (
          id,
          name,
          stripe_account_id
        )
      `)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!product.businesses?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Business has not connected Stripe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!product.stripe_price_id) {
      return new Response(
        JSON.stringify({ error: 'Product does not have Stripe pricing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const connectedAccountId = product.businesses.stripe_account_id

    // Get or create Stripe customer on the connected account
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      // Create customer on the platform
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name,
        metadata: {
          user_id: userId,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Platform commission rate (10%)
    const applicationFeePercent = 10

    // Create the subscription on the connected account
    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: product.stripe_price_id }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        application_fee_percent: applicationFeePercent,
        metadata: {
          user_id: userId,
          product_id: productId,
          business_id: product.businesses.id,
        },
        transfer_data: {
          destination: connectedAccountId,
        },
      }
    )

    // Get the client secret for payment confirmation
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    if (!paymentIntent?.client_secret) {
      throw new Error('Failed to create payment intent')
    }

    // Create subscription record in our database (pending status)
    const now = new Date()
    const periodEnd = new Date(now)

    switch (product.period) {
      case 'day':
        periodEnd.setDate(periodEnd.getDate() + 1)
        break
      case 'week':
        periodEnd.setDate(periodEnd.getDate() + 7)
        break
      case 'month':
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        break
    }

    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        product_id: productId,
        stripe_subscription_id: subscription.id,
        status: 'pending', // Will be activated by webhook when payment succeeds
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to create subscription record:', dbError)
      // Don't fail - the webhook will create it if needed
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        dbSubscriptionId: dbSubscription?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Stripe subscription creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
