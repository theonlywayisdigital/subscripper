import { create } from 'zustand'
import { supabase } from '../lib/supabase/client'
import { createStripeAccount, refreshStripeOnboarding } from '../lib/stripe/connect'

export type BusinessStatus = 'pending_approval' | 'approved' | 'active' | 'suspended' | 'rejected'
export type BusinessType =
  | 'coffee_shop'
  | 'bakery'
  | 'breakfast_spot'
  | 'lunch_spot'
  | 'restaurant'
  | 'pub_bar'
  | 'juice_smoothie_bar'
  | 'ice_cream_dessert'
  | 'hairdresser'
  | 'barber'
  | 'nail_salon'
  | 'eyebrows_lashes'
  | 'tanning_salon'
  | 'spa_massage'
  | 'gym_fitness'
  | 'yoga_pilates'
  | 'car_wash'
  | 'dog_grooming'
  | 'pet_shop'
  | 'florist'
  | 'dry_cleaner'
  | 'newsagent'
  | 'butcher'
  | 'deli'
  | 'farm_shop'
  | 'vape_shop'
  | 'tattoo_studio'
  | 'other'
export type StaffRole = 'staff' | 'manager'

export interface OpeningHours {
  [day: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
}

export interface Business {
  id: string
  ownerId: string
  name: string
  type: BusinessType
  types?: BusinessType[]
  description?: string
  address?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postcode?: string
  lat?: number
  lng?: number
  email?: string
  phone?: string
  website?: string
  logoUrl?: string
  coverPhotos: string[]
  branding: Record<string, unknown>
  socialLinks: SocialLinks
  openingHours: OpeningHours
  googlePlaceId?: string
  googleRating?: number
  status: BusinessStatus
  rejectionReason?: string
  approvedAt?: string
  stripeAccountId?: string
  stripeOnboardingComplete: boolean
  commissionRate: number
  createdAt: string
  updatedAt: string
}

export interface BusinessStaff {
  id: string
  businessId: string
  userId?: string
  email: string
  role: StaffRole
  invitedAt: string
  acceptedAt?: string
}

// Extended interface for pending invitations (includes business details)
export interface PendingInvitation extends BusinessStaff {
  businessName: string
  businessType: BusinessType
}

interface BusinessState {
  business: Business | null
  staff: BusinessStaff[]
  pendingInvitations: PendingInvitation[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchBusiness: (ownerId: string) => Promise<void>
  createBusiness: (data: Partial<Business>) => Promise<Business>
  updateBusiness: (id: string, updates: Partial<Business>) => Promise<void>
  fetchStaff: (businessId: string) => Promise<void>
  inviteStaff: (businessId: string, email: string, role: StaffRole) => Promise<void>
  removeStaff: (staffId: string) => Promise<void>
  // Staff invitation acceptance
  fetchPendingInvitations: (email: string) => Promise<void>
  acceptInvitation: (staffId: string, userId: string) => Promise<void>
  declineInvitation: (staffId: string) => Promise<void>
  // Stripe Connect
  startStripeOnboarding: () => Promise<string>
  completeStripeOnboarding: () => Promise<void>
  clearError: () => void
}

// Helper to convert snake_case to camelCase
function mapBusinessFromDb(data: Record<string, unknown>): Business {
  return {
    id: data.id as string,
    ownerId: data.owner_id as string,
    name: data.name as string,
    type: data.type as BusinessType,
    types: data.types as BusinessType[] | undefined,
    description: data.description as string | undefined,
    address: data.address as string | undefined,
    addressLine1: data.address_line1 as string | undefined,
    addressLine2: data.address_line2 as string | undefined,
    city: data.city as string | undefined,
    postcode: data.postcode as string | undefined,
    lat: data.lat as number | undefined,
    lng: data.lng as number | undefined,
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    website: data.website as string | undefined,
    logoUrl: data.logo_url as string | undefined,
    coverPhotos: (data.cover_photos as string[]) || [],
    branding: (data.branding as Record<string, unknown>) || {},
    socialLinks: (data.social_links as SocialLinks) || {},
    openingHours: (data.opening_hours as OpeningHours) || {},
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

function mapStaffFromDb(data: Record<string, unknown>): BusinessStaff {
  return {
    id: data.id as string,
    businessId: data.business_id as string,
    userId: data.user_id as string | undefined,
    email: data.email as string,
    role: data.role as StaffRole,
    invitedAt: data.invited_at as string,
    acceptedAt: data.accepted_at as string | undefined,
  }
}

export const useBusinessStore = create<BusinessState>()((set, get) => ({
  business: null,
  staff: [],
  pendingInvitations: [],
  isLoading: false,
  error: null,

  fetchBusiness: async (ownerId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', ownerId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (which is fine for new users)
        throw error
      }

      set({
        business: data ? mapBusinessFromDb(data) : null,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch business'
      set({ error: message, isLoading: false })
    }
  },

  createBusiness: async (data: Partial<Business>) => {
    set({ isLoading: true, error: null })
    try {
      // Map new business types to existing enum values
      const mapTypeToEnum = (type: BusinessType): string => {
        const mapping: Record<string, string> = {
          coffee_shop: 'coffee_shop',
          bakery: 'bakery',
          breakfast_spot: 'cafe',
          lunch_spot: 'cafe',
          restaurant: 'restaurant',
          pub_bar: 'pub',
          juice_smoothie_bar: 'juice_bar',
          ice_cream_dessert: 'cafe',
          hairdresser: 'other',
          barber: 'other',
          nail_salon: 'other',
          eyebrows_lashes: 'other',
          tanning_salon: 'other',
          spa_massage: 'other',
          gym_fitness: 'other',
          yoga_pilates: 'other',
          car_wash: 'other',
          dog_grooming: 'other',
          pet_shop: 'other',
          florist: 'other',
          dry_cleaner: 'other',
          newsagent: 'other',
          butcher: 'other',
          deli: 'other',
          farm_shop: 'other',
          vape_shop: 'other',
          tattoo_studio: 'other',
          other: 'other',
        }
        return mapping[type] || 'other'
      }

      const primaryType = data.types?.[0] || data.type || 'other'
      const dbType = mapTypeToEnum(primaryType)

      const { data: created, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: data.ownerId,
          name: data.name,
          type: dbType,
          description: data.description,
          address: data.address,
          email: data.email,
          phone: data.phone,
          website: data.website,
          social_links: data.socialLinks || {},
          opening_hours: data.openingHours || {},
          // Store extended data in branding for now
          branding: {
            types: data.types || [],
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            postcode: data.postcode,
          },
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message || error.code || 'Failed to create business')
      }

      if (!created) {
        throw new Error('No data returned from database')
      }
      const business = mapBusinessFromDb(created)
      set({ business, isLoading: false })
      return business
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  updateBusiness: async (id: string, updates: Partial<Business>) => {
    set({ isLoading: true, error: null })
    try {
      const dbUpdates: Record<string, unknown> = {}

      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.type !== undefined) dbUpdates.type = updates.type
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.address !== undefined) dbUpdates.address = updates.address
      if (updates.lat !== undefined) dbUpdates.lat = updates.lat
      if (updates.lng !== undefined) dbUpdates.lng = updates.lng
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.website !== undefined) dbUpdates.website = updates.website
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl
      if (updates.coverPhotos !== undefined) dbUpdates.cover_photos = updates.coverPhotos
      if (updates.branding !== undefined) dbUpdates.branding = updates.branding
      if (updates.socialLinks !== undefined) dbUpdates.social_links = updates.socialLinks
      if (updates.openingHours !== undefined) dbUpdates.opening_hours = updates.openingHours

      const { data, error } = await supabase
        .from('businesses')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({ business: mapBusinessFromDb(data), isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update business'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  fetchStaff: async (businessId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('business_staff')
        .select('*')
        .eq('business_id', businessId)
        .order('invited_at', { ascending: false })

      if (error) throw error

      set({
        staff: data.map(mapStaffFromDb),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch staff'
      set({ error: message, isLoading: false })
    }
  },

  inviteStaff: async (businessId: string, email: string, role: StaffRole) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('business_staff')
        .insert({
          business_id: businessId,
          email: email.toLowerCase(),
          role,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email has already been invited')
        }
        throw error
      }

      const newStaff = mapStaffFromDb(data)
      set((state) => ({
        staff: [newStaff, ...state.staff],
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to invite staff'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  removeStaff: async (staffId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('business_staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      set((state) => ({
        staff: state.staff.filter((s) => s.id !== staffId),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove staff'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  fetchPendingInvitations: async (email: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('business_staff')
        .select(`
          *,
          businesses:business_id (
            name,
            type
          )
        `)
        .eq('email', email.toLowerCase())
        .is('accepted_at', null)
        .order('invited_at', { ascending: false })

      if (error) throw error

      const invitations: PendingInvitation[] = data.map((item) => ({
        id: item.id,
        businessId: item.business_id,
        userId: item.user_id,
        email: item.email,
        role: item.role as StaffRole,
        invitedAt: item.invited_at,
        acceptedAt: item.accepted_at,
        businessName: (item.businesses as { name: string; type: string })?.name || 'Unknown Business',
        businessType: ((item.businesses as { name: string; type: string })?.type || 'other') as BusinessType,
      }))

      set({ pendingInvitations: invitations, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch invitations'
      set({ error: message, isLoading: false })
    }
  },

  acceptInvitation: async (staffId: string, userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('business_staff')
        .update({
          user_id: userId,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', staffId)

      if (error) throw error

      // Remove from pending invitations
      set((state) => ({
        pendingInvitations: state.pendingInvitations.filter((i) => i.id !== staffId),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept invitation'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  declineInvitation: async (staffId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('business_staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      // Remove from pending invitations
      set((state) => ({
        pendingInvitations: state.pendingInvitations.filter((i) => i.id !== staffId),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline invitation'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  startStripeOnboarding: async () => {
    const business = get().business
    if (!business) {
      throw new Error('No business found')
    }

    set({ isLoading: true, error: null })
    try {
      // Check if business already has a Stripe account
      if (business.stripeAccountId) {
        // Refresh the onboarding link
        const result = await refreshStripeOnboarding({ businessId: business.id })
        set({ isLoading: false })

        if (result.complete) {
          // Update local state
          set((state) => ({
            business: state.business ? { ...state.business, stripeOnboardingComplete: true } : null,
          }))
          throw new Error('Stripe onboarding already complete')
        }

        return result.onboardingUrl!
      }

      // Create new Stripe account
      const result = await createStripeAccount({
        businessId: business.id,
        email: business.email || '',
        businessName: business.name,
      })

      // Update local state with new account ID
      set((state) => ({
        business: state.business ? { ...state.business, stripeAccountId: result.accountId } : null,
        isLoading: false,
      }))

      return result.onboardingUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start Stripe onboarding'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  completeStripeOnboarding: async () => {
    const business = get().business
    if (!business) {
      throw new Error('No business found')
    }

    set({ isLoading: true, error: null })
    try {
      // Verify completion status with Stripe
      const result = await refreshStripeOnboarding({ businessId: business.id })

      if (!result.complete) {
        throw new Error('Stripe onboarding is not complete')
      }

      // Update database
      const { error } = await supabase
        .from('businesses')
        .update({ stripe_onboarding_complete: true })
        .eq('id', business.id)

      if (error) throw error

      // Update local state
      set((state) => ({
        business: state.business ? { ...state.business, stripeOnboardingComplete: true } : null,
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete Stripe onboarding'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
