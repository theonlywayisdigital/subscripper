import { supabase } from '../supabase/client'

interface CreateAccountParams {
  businessId: string
  email: string
  businessName: string
  returnUrl?: string
  refreshUrl?: string
}

interface CreateAccountResponse {
  accountId: string
  onboardingUrl: string
}

interface RefreshOnboardingParams {
  businessId: string
  returnUrl?: string
  refreshUrl?: string
}

interface RefreshOnboardingResponse {
  complete: boolean
  accountId: string
  onboardingUrl?: string
}

/**
 * Create a Stripe Connect account and get onboarding link
 */
export async function createStripeAccount(params: CreateAccountParams): Promise<CreateAccountResponse> {
  const { data, error } = await supabase.functions.invoke('stripe-create-account', {
    body: params,
  })

  if (error) {
    throw new Error(error.message || 'Failed to create Stripe account')
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data as CreateAccountResponse
}

/**
 * Refresh Stripe onboarding link or check completion status
 */
export async function refreshStripeOnboarding(params: RefreshOnboardingParams): Promise<RefreshOnboardingResponse> {
  const { data, error } = await supabase.functions.invoke('stripe-onboarding-refresh', {
    body: params,
  })

  if (error) {
    throw new Error(error.message || 'Failed to refresh onboarding')
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data as RefreshOnboardingResponse
}

/**
 * Check if a business has completed Stripe onboarding
 */
export async function checkStripeOnboardingStatus(businessId: string): Promise<{
  hasAccount: boolean
  isComplete: boolean
  accountId?: string
}> {
  const { data, error } = await supabase
    .from('businesses')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', businessId)
    .single()

  if (error) {
    throw new Error('Failed to check Stripe status')
  }

  return {
    hasAccount: !!data.stripe_account_id,
    isComplete: data.stripe_onboarding_complete || false,
    accountId: data.stripe_account_id,
  }
}
