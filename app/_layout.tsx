import { useEffect } from 'react'
import { useColorScheme, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider, Theme, View, Text } from 'tamagui'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { config } from '../tamagui.config'
import { useAuthStore } from '../stores/auth'

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

// Conditionally load StripeProvider - not available in Expo Go
let StripeProvider: any = ({ children }: { children: React.ReactNode }) => <>{children}</>
try {
  const stripe = require('@stripe/stripe-react-native')
  StripeProvider = stripe.StripeProvider
} catch (e) {
  console.log('Stripe native module not available in Expo Go')
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
      >
        <ActivityIndicator size="large" color="#1A3A35" />
        <Text color="$textMuted" marginTop="$md" fontSize={14}>
          Loading...
        </Text>
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'light'}>
        <Theme name={colorScheme ?? 'light'}>
          <SafeAreaProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <AuthInitializer>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: colorScheme === 'dark' ? '#1A3A35' : '#F9FAF9',
                  },
                }}
              />
            </AuthInitializer>
          </SafeAreaProvider>
        </Theme>
      </TamaguiProvider>
    </StripeProvider>
  )
}
