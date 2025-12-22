import { Redirect } from 'expo-router'
import { View, Text } from 'tamagui'
import { ActivityIndicator } from 'react-native'
import { useAuthStore } from '../stores/auth'

export default function Index() {
  const { user, isLoading, isInitialized, isAuthenticated, getEffectiveRole } = useAuthStore()

  // Show loading while checking auth state
  if (!isInitialized || isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <ActivityIndicator size="large" color="#1A3A35" />
        <Text color="$textMuted" marginTop="$md" fontSize={14}>
          Loading...
        </Text>
      </View>
    )
  }

  // Redirect to welcome screen if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />
  }

  // Redirect based on effective role (supports role switching)
  const effectiveRole = getEffectiveRole()

  switch (effectiveRole) {
    case 'admin':
      return <Redirect href="/(admin)/" />
    case 'business_owner':
      return <Redirect href="/(business)/" />
    case 'staff':
      return <Redirect href="/(staff)/" />
    case 'customer':
    default:
      return <Redirect href="/(customer)/" />
  }
}
