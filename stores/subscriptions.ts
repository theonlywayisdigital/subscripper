import { create } from 'zustand'
import { supabase } from '../lib/supabase/client'

export type SubscriptionPeriod = 'day' | 'week' | 'month'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'

export interface BlackoutTime {
  day: string
  start: string
  end: string
}

export interface SubscriptionProduct {
  id: string
  businessId: string
  name: string
  description?: string
  imageUrl?: string
  itemType: string
  quantityPerPeriod: number
  period: SubscriptionPeriod
  resetPeriod: SubscriptionPeriod
  pricePence: number
  blackoutTimes: BlackoutTime[]
  branding: Record<string, unknown>
  stripeProductId?: string
  stripePriceId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Joined data
  business?: {
    id: string
    name: string
    logoUrl?: string
  }
}

export interface Subscription {
  id: string
  userId: string
  productId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  redemptionsUsed: number
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  // Joined data
  product?: SubscriptionProduct
}

export interface Redemption {
  id: string
  subscriptionId: string
  itemType: string
  redeemedBy?: string
  redeemedAt: string
  undoneAt?: string
  undoneBy?: string
}

interface SubscriptionState {
  // Business owner's products
  products: SubscriptionProduct[]
  // Customer's subscriptions
  subscriptions: Subscription[]
  // Current subscription's redemptions
  redemptions: Redemption[]
  isLoading: boolean
  error: string | null

  // Business owner actions
  fetchProducts: (businessId: string) => Promise<void>
  createProduct: (product: Partial<SubscriptionProduct>) => Promise<SubscriptionProduct>
  updateProduct: (id: string, updates: Partial<SubscriptionProduct>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Customer actions
  fetchSubscriptions: (userId: string) => Promise<void>
  subscribe: (userId: string, productId: string) => Promise<Subscription>
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>

  // Redemption actions
  fetchRedemptions: (subscriptionId: string) => Promise<void>
  redeem: (subscriptionId: string, itemType: string, staffId?: string) => Promise<void>
  undoRedemption: (redemptionId: string, staffId: string) => Promise<void>

  clearError: () => void
}

function mapProductFromDb(data: Record<string, unknown>): SubscriptionProduct {
  return {
    id: data.id as string,
    businessId: data.business_id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    imageUrl: data.image_url as string | undefined,
    itemType: data.item_type as string,
    quantityPerPeriod: data.quantity_per_period as number,
    period: data.period as SubscriptionPeriod,
    resetPeriod: (data.reset_period as SubscriptionPeriod) || (data.period as SubscriptionPeriod),
    pricePence: data.price_pence as number,
    blackoutTimes: (data.blackout_times as BlackoutTime[]) || [],
    branding: (data.branding as Record<string, unknown>) || {},
    stripeProductId: data.stripe_product_id as string | undefined,
    stripePriceId: data.stripe_price_id as string | undefined,
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    business: data.businesses ? {
      id: (data.businesses as Record<string, unknown>).id as string,
      name: (data.businesses as Record<string, unknown>).name as string,
      logoUrl: (data.businesses as Record<string, unknown>).logo_url as string | undefined,
    } : undefined,
  }
}

function mapSubscriptionFromDb(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    productId: data.product_id as string,
    status: data.status as SubscriptionStatus,
    currentPeriodStart: data.current_period_start as string,
    currentPeriodEnd: data.current_period_end as string,
    redemptionsUsed: data.redemptions_used as number,
    cancelledAt: data.cancelled_at as string | undefined,
    cancelReason: data.cancel_reason as string | undefined,
    createdAt: data.created_at as string,
    product: data.subscription_products
      ? mapProductFromDb(data.subscription_products as Record<string, unknown>)
      : undefined,
  }
}

function calculatePeriodEnd(start: Date, period: SubscriptionPeriod): Date {
  const end = new Date(start)
  switch (period) {
    case 'day':
      end.setDate(end.getDate() + 1)
      break
    case 'week':
      end.setDate(end.getDate() + 7)
      break
    case 'month':
      end.setMonth(end.getMonth() + 1)
      break
  }
  return end
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  products: [],
  subscriptions: [],
  redemptions: [],
  isLoading: false,
  error: null,

  fetchProducts: async (businessId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({
        products: data.map(mapProductFromDb),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch products'
      set({ error: message, isLoading: false })
    }
  },

  createProduct: async (product: Partial<SubscriptionProduct>) => {
    set({ isLoading: true, error: null })
    try {
      // First create the product in our database
      const { data, error } = await supabase
        .from('subscription_products')
        .insert({
          business_id: product.businessId,
          name: product.name,
          description: product.description,
          image_url: product.imageUrl,
          item_type: product.itemType,
          quantity_per_period: product.quantityPerPeriod || 1,
          period: product.period || 'month',
          reset_period: product.resetPeriod || product.period || 'month',
          price_pence: product.pricePence,
          blackout_times: product.blackoutTimes || [],
          branding: product.branding || {},
        })
        .select()
        .single()

      if (error) throw error

      // Try to create Stripe product/price (non-blocking if fails)
      try {
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke(
          'stripe-create-product',
          {
            body: {
              businessId: product.businessId,
              name: product.name,
              description: product.description,
              itemType: product.itemType,
              quantityPerPeriod: product.quantityPerPeriod || 1,
              period: product.period || 'month',
              pricePence: product.pricePence,
            },
          }
        )

        if (!stripeError && stripeData?.stripeProductId) {
          // Update product with Stripe IDs
          await supabase
            .from('subscription_products')
            .update({
              stripe_product_id: stripeData.stripeProductId,
              stripe_price_id: stripeData.stripePriceId,
            })
            .eq('id', data.id)

          data.stripe_product_id = stripeData.stripeProductId
          data.stripe_price_id = stripeData.stripePriceId
        }
      } catch (stripeErr) {
        // Log but don't fail - Stripe can be set up later
        console.warn('Failed to create Stripe product:', stripeErr)
      }

      const newProduct = mapProductFromDb(data)
      set((state) => ({
        products: [newProduct, ...state.products],
        isLoading: false,
      }))
      return newProduct
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  updateProduct: async (id: string, updates: Partial<SubscriptionProduct>) => {
    set({ isLoading: true, error: null })
    try {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
      if (updates.itemType !== undefined) dbUpdates.item_type = updates.itemType
      if (updates.quantityPerPeriod !== undefined) dbUpdates.quantity_per_period = updates.quantityPerPeriod
      if (updates.period !== undefined) dbUpdates.period = updates.period
      if (updates.resetPeriod !== undefined) dbUpdates.reset_period = updates.resetPeriod
      if (updates.pricePence !== undefined) dbUpdates.price_pence = updates.pricePence
      if (updates.blackoutTimes !== undefined) dbUpdates.blackout_times = updates.blackoutTimes
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

      const { data, error } = await supabase
        .from('subscription_products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? mapProductFromDb(data) : p)),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('subscription_products')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  fetchSubscriptions: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_products (
            *,
            businesses (id, name, logo_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({
        subscriptions: data.map(mapSubscriptionFromDb),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions'
      set({ error: message, isLoading: false })
    }
  },

  subscribe: async (userId: string, productId: string) => {
    set({ isLoading: true, error: null })
    try {
      // First get the product to know the period
      const { data: product, error: productError } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      const now = new Date()
      const periodEnd = calculatePeriodEnd(now, product.period)

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          product_id: productId,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select(`
          *,
          subscription_products (
            *,
            businesses (id, name, logo_url)
          )
        `)
        .single()

      if (error) throw error

      const newSubscription = mapSubscriptionFromDb(data)
      set((state) => ({
        subscriptions: [newSubscription, ...state.subscriptions],
        isLoading: false,
      }))
      return newSubscription
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason,
        })
        .eq('id', subscriptionId)

      if (error) throw error

      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscriptionId
            ? { ...s, status: 'cancelled' as SubscriptionStatus, cancelledAt: new Date().toISOString(), cancelReason: reason }
            : s
        ),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  fetchRedemptions: async (subscriptionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .is('undone_at', null)
        .order('redeemed_at', { ascending: false })

      if (error) throw error

      set({
        redemptions: data.map((r) => ({
          id: r.id,
          subscriptionId: r.subscription_id,
          itemType: r.item_type,
          redeemedBy: r.redeemed_by,
          redeemedAt: r.redeemed_at,
          undoneAt: r.undone_at,
          undoneBy: r.undone_by,
        })),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch redemptions'
      set({ error: message, isLoading: false })
    }
  },

  redeem: async (subscriptionId: string, itemType: string, staffId?: string) => {
    set({ isLoading: true, error: null })
    try {
      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          subscription_id: subscriptionId,
          item_type: itemType,
          redeemed_by: staffId,
        })

      if (redemptionError) throw redemptionError

      // Update subscription's redemption count
      const { error: updateError } = await supabase.rpc('increment_redemptions', {
        sub_id: subscriptionId,
      })

      // If RPC doesn't exist, do it manually
      if (updateError) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('redemptions_used')
          .eq('id', subscriptionId)
          .single()

        if (sub) {
          await supabase
            .from('subscriptions')
            .update({ redemptions_used: (sub.redemptions_used || 0) + 1 })
            .eq('id', subscriptionId)
        }
      }

      // Update local state
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscriptionId
            ? { ...s, redemptionsUsed: s.redemptionsUsed + 1 }
            : s
        ),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to redeem'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  undoRedemption: async (redemptionId: string, staffId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: redemption, error: fetchError } = await supabase
        .from('redemptions')
        .select('subscription_id')
        .eq('id', redemptionId)
        .single()

      if (fetchError) throw fetchError

      // Mark redemption as undone
      const { error: updateError } = await supabase
        .from('redemptions')
        .update({
          undone_at: new Date().toISOString(),
          undone_by: staffId,
        })
        .eq('id', redemptionId)

      if (updateError) throw updateError

      // Decrement subscription's redemption count
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('redemptions_used')
        .eq('id', redemption.subscription_id)
        .single()

      if (sub && sub.redemptions_used > 0) {
        await supabase
          .from('subscriptions')
          .update({ redemptions_used: sub.redemptions_used - 1 })
          .eq('id', redemption.subscription_id)
      }

      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === redemption.subscription_id
            ? { ...s, redemptionsUsed: Math.max(0, s.redemptionsUsed - 1) }
            : s
        ),
        redemptions: state.redemptions.filter((r) => r.id !== redemptionId),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to undo redemption'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
