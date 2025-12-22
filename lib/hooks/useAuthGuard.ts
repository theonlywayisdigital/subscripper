import { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuthStore, UserType } from '../../stores/auth'

interface UseAuthGuardOptions {
  /** Required user types to access this route */
  allowedTypes?: UserType[]
  /** Where to redirect if not authenticated */
  loginRedirect?: string
  /** Where to redirect if authenticated but wrong user type */
  unauthorizedRedirect?: string
}

/**
 * Hook to protect routes based on authentication and user type.
 *
 * @example
 * // In a layout or screen component:
 * useAuthGuard({ allowedTypes: ['customer'] })
 *
 * @example
 * // Allow multiple types:
 * useAuthGuard({ allowedTypes: ['business_owner', 'admin'] })
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    allowedTypes,
    loginRedirect = '/(auth)/login',
    unauthorizedRedirect = '/',
  } = options

  const { user, isAuthenticated, isInitialized, isLoading, getEffectiveRole } = useAuthStore()
  const effectiveRole = getEffectiveRole()

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || isLoading) return

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.replace(loginRedirect)
      return
    }

    // Check effective role if allowedTypes is specified (respects role switching)
    if (allowedTypes && effectiveRole && !allowedTypes.includes(effectiveRole)) {
      console.warn(
        `Effective role '${effectiveRole}' not allowed. Expected one of: ${allowedTypes.join(', ')}`
      )
      router.replace(unauthorizedRedirect)
      return
    }
  }, [isAuthenticated, isInitialized, isLoading, user, effectiveRole, allowedTypes, loginRedirect, unauthorizedRedirect])

  return {
    user,
    isLoading: !isInitialized || isLoading,
    isAuthenticated,
    isAuthorized: isAuthenticated && user && (!allowedTypes || (effectiveRole && allowedTypes.includes(effectiveRole))),
    effectiveRole,
    actualUserType: user?.userType,
  }
}

/**
 * Convenience hook for customer-only routes
 */
export function useCustomerGuard() {
  return useAuthGuard({ allowedTypes: ['customer'] })
}

/**
 * Convenience hook for business owner routes
 */
export function useBusinessGuard() {
  return useAuthGuard({ allowedTypes: ['business_owner'] })
}

/**
 * Convenience hook for staff routes (staff or business owner)
 */
export function useStaffGuard() {
  return useAuthGuard({ allowedTypes: ['staff', 'business_owner'] })
}

/**
 * Convenience hook for admin routes
 */
export function useAdminGuard() {
  return useAuthGuard({ allowedTypes: ['admin'] })
}
