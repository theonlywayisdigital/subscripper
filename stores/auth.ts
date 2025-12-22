import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase, isSupabaseConfigured } from '../lib/supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export type UserType = 'customer' | 'staff' | 'business_owner' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
  userType: UserType
  createdAt: string
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  activeRole: UserType | null  // null = use user's actual userType

  // Actions
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, userType: UserType) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshProfile: () => Promise<void>

  // Role switching
  setActiveRole: (role: UserType | null) => void
  getEffectiveRole: () => UserType | undefined
  canSwitchToCustomer: () => boolean
}

// DEV ONLY - Set to true to bypass auth for UI development
// Set via environment variable or hardcode for testing
const DEV_BYPASS_AUTH = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true'

const DEV_MOCK_USER: User = {
  id: 'dev-user-123',
  email: 'dev@test.com',
  name: 'Alex Johnson',
  phone: '07700900000',
  profilePictureUrl: undefined,
  userType: 'customer', // Change to 'staff', 'business_owner', or 'admin' for testing
  createdAt: new Date().toISOString(),
}

// Helper to fetch profile from Supabase
async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('Error fetching profile:', error)
    return null
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone || undefined,
    profilePictureUrl: data.profile_picture_url || undefined,
    userType: data.user_type as UserType,
    createdAt: data.created_at,
  }
}

// Helper to create profile in Supabase
async function createProfile(
  userId: string,
  email: string,
  name: string,
  userType: UserType
): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      name,
      user_type: userType,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    throw new Error('Failed to create user profile')
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone || undefined,
    profilePictureUrl: data.profile_picture_url || undefined,
    userType: data.user_type as UserType,
    createdAt: data.created_at,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEV_BYPASS_AUTH ? DEV_MOCK_USER : null,
      session: null,
      isLoading: !DEV_BYPASS_AUTH,
      isAuthenticated: DEV_BYPASS_AUTH,
      isInitialized: DEV_BYPASS_AUTH,
      activeRole: null,

      initialize: async () => {
        if (DEV_BYPASS_AUTH) {
          set({ isInitialized: true, isLoading: false })
          return
        }

        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured, skipping auth initialization')
          set({ isInitialized: true, isLoading: false })
          return
        }

        try {
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Error getting session:', error)
            set({ isInitialized: true, isLoading: false })
            return
          }

          if (session?.user) {
            const profile = await fetchProfile(session.user.id)

            // If we have a session but no profile, sign out and clear everything
            if (!profile) {
              await supabase.auth.signOut()
              set({
                session: null,
                user: null,
                isAuthenticated: false,
                isInitialized: true,
                isLoading: false,
              })
              return
            }

            set({
              session,
              user: profile,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            })
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            })
          }

          // Set up auth state listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            const currentState = get()

            if (event === 'SIGNED_IN' && session?.user) {
              // Don't override if we already have this user authenticated
              // This prevents race conditions where signUp/signIn already set the state
              if (currentState.user?.id === session.user.id && currentState.isAuthenticated) {
                return
              }

              const profile = await fetchProfile(session.user.id)
              if (profile) {
                set({
                  session,
                  user: profile,
                  isAuthenticated: true,
                  isLoading: false,
                })
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                session: null,
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session })
            }
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ isInitialized: true, isLoading: false })
        }
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setSession: (session) => set({ session }),

      setLoading: (isLoading) => set({ isLoading }),

      signIn: async (email, password) => {
        if (DEV_BYPASS_AUTH) {
          set({ user: DEV_MOCK_USER, isAuthenticated: true })
          return
        }

        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            throw new Error(error.message)
          }

          if (data.user) {
            const profile = await fetchProfile(data.user.id)
            if (!profile) {
              throw new Error('Profile not found. Please contact support.')
            }
            set({
              session: data.session,
              user: profile,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUp: async (email, password, name, userType) => {
        if (DEV_BYPASS_AUTH) {
          set({ user: { ...DEV_MOCK_USER, email, name, userType }, isAuthenticated: true })
          return
        }

        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, user_type: userType },
            },
          })

          if (error) {
            throw new Error(error.message)
          }

          if (data.user) {
            // Wait a moment for the database trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 500))

            // Fetch the profile created by the trigger
            let profile = await fetchProfile(data.user.id)

            // If trigger hasn't created it yet, try creating manually
            if (!profile) {
              try {
                profile = await createProfile(data.user.id, email, name, userType)
              } catch (createError) {
                // Profile might have been created by trigger, try fetching again
                profile = await fetchProfile(data.user.id)
              }
            }

            if (!profile) {
              throw new Error('Failed to create user profile. Please try again.')
            }

            set({
              session: data.session,
              user: profile,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            throw new Error('Signup succeeded but no user data returned. Please try again.')
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        if (DEV_BYPASS_AUTH) {
          set({ user: null, isAuthenticated: false, activeRole: null })
          return
        }

        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw new Error(error.message)

          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            activeRole: null,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateProfile: async (updates) => {
        const { user, session } = get()
        if (!user || !session) {
          throw new Error('Not authenticated')
        }

        if (DEV_BYPASS_AUTH) {
          set({ user: { ...user, ...updates } })
          return
        }

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: updates.name,
              phone: updates.phone,
              profile_picture_url: updates.profilePictureUrl,
            })
            .eq('id', user.id)

          if (error) throw new Error(error.message)

          set({ user: { ...user, ...updates } })
        } catch (error) {
          throw error
        }
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        if (DEV_BYPASS_AUTH) return

        const profile = await fetchProfile(user.id)
        if (profile) {
          set({ user: profile })
        }
      },

      // Role switching
      setActiveRole: (role) => {
        set({ activeRole: role })
      },

      getEffectiveRole: () => {
        const { user, activeRole } = get()
        if (!user) return undefined
        return activeRole ?? user.userType
      },

      canSwitchToCustomer: () => {
        const { user } = get()
        if (!user) return false
        // Business owners and staff can switch to customer mode
        return user.userType === 'business_owner' || user.userType === 'staff'
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist user data, not session (Supabase handles that)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, initialize auth
        if (state && !DEV_BYPASS_AUTH) {
          state.isLoading = true
          // Initialize will be called from _layout.tsx
        }
      },
    }
  )
)
