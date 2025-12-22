import { create } from 'zustand'
import { supabase } from '../lib/supabase/client'
import { Business, BusinessStatus, mapBusinessFromDb } from './business'

// Re-export for convenience
export type { Business, BusinessStatus }

// Customer type for admin view
export interface Customer {
  id: string
  email: string
  name: string
  phone: string | null
  profilePictureUrl: string | null
  createdAt: string
  updatedAt: string
}

// Map function needs to be accessible
function mapFromDb(data: Record<string, unknown>): Business {
  return {
    id: data.id as string,
    ownerId: data.owner_id as string,
    name: data.name as string,
    type: data.type as Business['type'],
    description: data.description as string | undefined,
    address: data.address as string | undefined,
    lat: data.lat as number | undefined,
    lng: data.lng as number | undefined,
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    website: data.website as string | undefined,
    logoUrl: data.logo_url as string | undefined,
    coverPhotos: (data.cover_photos as string[]) || [],
    branding: (data.branding as Record<string, unknown>) || {},
    socialLinks: (data.social_links as Business['socialLinks']) || {},
    openingHours: (data.opening_hours as Business['openingHours']) || {},
    googlePlaceId: data.google_place_id as string | undefined,
    googleRating: data.google_rating as number | undefined,
    status: data.status as BusinessStatus,
    rejectionReason: data.rejection_reason as string | undefined,
    approvedAt: data.approved_at as string | undefined,
    stripeAccountId: data.stripe_account_id as string | undefined,
    stripeOnboardingComplete: data.stripe_onboarding_complete as boolean,
    commissionRate: data.commission_rate as number,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

interface AdminStats {
  totalBusinesses: number
  totalCustomers: number
  pendingApprovals: number
  activeBusinesses: number
}

interface AdminState {
  businesses: Business[]
  pendingBusinesses: Business[]
  customers: Customer[]
  stats: AdminStats
  isLoading: boolean
  error: string | null

  // Actions
  fetchStats: () => Promise<void>
  fetchBusinesses: (status?: BusinessStatus) => Promise<void>
  fetchPendingBusinesses: () => Promise<void>
  fetchCustomers: () => Promise<void>
  approveBusiness: (businessId: string, adminId: string) => Promise<void>
  rejectBusiness: (businessId: string, reason: string) => Promise<void>
  suspendBusiness: (businessId: string) => Promise<void>
  activateBusiness: (businessId: string) => Promise<void>
  clearError: () => void
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  businesses: [],
  pendingBusinesses: [],
  customers: [],
  stats: {
    totalBusinesses: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    activeBusinesses: 0,
  },
  isLoading: false,
  error: null,

  fetchStats: async () => {
    try {
      // Fetch business counts
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })

      const { count: pendingApprovals } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval')

      const { count: activeBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch customer count
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'customer')

      set({
        stats: {
          totalBusinesses: totalBusinesses || 0,
          totalCustomers: totalCustomers || 0,
          pendingApprovals: pendingApprovals || 0,
          activeBusinesses: activeBusinesses || 0,
        },
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  },

  fetchBusinesses: async (status?: BusinessStatus) => {
    set({ isLoading: true, error: null })
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      set({
        businesses: data.map(mapFromDb),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch businesses'
      set({ error: message, isLoading: false })
    }
  },

  fetchPendingBusinesses: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true }) // Oldest first

      if (error) throw error

      set({
        pendingBusinesses: data.map(mapFromDb),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending businesses'
      set({ error: message, isLoading: false })
    }
  },

  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'customer')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({
        customers: data.map((d) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          phone: d.phone,
          profilePictureUrl: d.profile_picture_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        })),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customers'
      set({ error: message, isLoading: false })
    }
  },

  approveBusiness: async (businessId: string, adminId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminId,
        })
        .eq('id', businessId)

      if (error) throw error

      // Remove from pending list
      set((state) => ({
        pendingBusinesses: state.pendingBusinesses.filter((b) => b.id !== businessId),
        isLoading: false,
      }))

      // Refresh stats
      get().fetchStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  rejectBusiness: async (businessId: string, reason: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', businessId)

      if (error) throw error

      // Remove from pending list
      set((state) => ({
        pendingBusinesses: state.pendingBusinesses.filter((b) => b.id !== businessId),
        isLoading: false,
      }))

      // Refresh stats
      get().fetchStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  suspendBusiness: async (businessId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'suspended' })
        .eq('id', businessId)

      if (error) throw error

      set((state) => ({
        businesses: state.businesses.map((b) =>
          b.id === businessId ? { ...b, status: 'suspended' as BusinessStatus } : b
        ),
        isLoading: false,
      }))

      get().fetchStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to suspend business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  activateBusiness: async (businessId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'active' })
        .eq('id', businessId)

      if (error) throw error

      set((state) => ({
        businesses: state.businesses.map((b) =>
          b.id === businessId ? { ...b, status: 'active' as BusinessStatus } : b
        ),
        isLoading: false,
      }))

      get().fetchStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
