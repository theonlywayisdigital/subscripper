import { useEffect, useState } from 'react'
import { Alert, Linking, ActivityIndicator, Pressable } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import {
  CreditCard,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
} from '@tamagui/lucide-icons'
import { useBusinessStore } from '../../stores/business'

type OnboardingStatus = 'loading' | 'ready' | 'opening' | 'complete' | 'error'

export default function StripeOnboardingScreen() {
  const params = useLocalSearchParams<{ status?: string }>()
  const { business, isLoading, startStripeOnboarding, completeStripeOnboarding } = useBusinessStore()
  const [status, setStatus] = useState<OnboardingStatus>('loading')
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check if returning from Stripe
    if (params.status === 'return') {
      handleStripeReturn()
    } else {
      initializeOnboarding()
    }
  }, [params.status])

  const initializeOnboarding = async () => {
    if (!business) {
      setStatus('error')
      setErrorMessage('No business found')
      return
    }

    // Already complete
    if (business.stripeOnboardingComplete) {
      setStatus('complete')
      return
    }

    setStatus('loading')
    try {
      const url = await startStripeOnboarding()
      setOnboardingUrl(url)
      setStatus('ready')
    } catch (error) {
      if (error instanceof Error && error.message === 'Stripe onboarding already complete') {
        setStatus('complete')
      } else {
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize Stripe')
      }
    }
  }

  const handleStripeReturn = async () => {
    setStatus('loading')
    try {
      await completeStripeOnboarding()
      setStatus('complete')
    } catch (error) {
      // Onboarding might not be complete yet
      setStatus('ready')
      try {
        const url = await startStripeOnboarding()
        setOnboardingUrl(url)
      } catch (err) {
        if (err instanceof Error && err.message === 'Stripe onboarding already complete') {
          setStatus('complete')
        } else {
          setStatus('error')
          setErrorMessage('Please try again to complete your Stripe setup.')
        }
      }
    }
  }

  const openStripeOnboarding = async () => {
    if (!onboardingUrl) return

    setStatus('opening')
    try {
      const supported = await Linking.canOpenURL(onboardingUrl)
      if (supported) {
        await Linking.openURL(onboardingUrl)
      } else {
        Alert.alert('Error', 'Unable to open Stripe. Please try again.')
        setStatus('ready')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open Stripe onboarding.')
      setStatus('ready')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleDone = () => {
    router.replace('/(business)/')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <XStack alignItems="center" marginBottom="$lg">
          <Pressable onPress={handleBack} style={{ padding: 8, marginLeft: -8 }}>
            <ArrowLeft size={24} color="#1A3A35" />
          </Pressable>
          <Text color="#1A3A35" fontSize={20} fontWeight="600" marginLeft="$sm">
            Connect Stripe
          </Text>
        </XStack>

        {/* Content */}
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$lg">
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#1A3A35" />
              <Text color="#666666" fontSize={15} marginTop="$lg" textAlign="center">
                Preparing your Stripe setup...
              </Text>
            </>
          )}

          {status === 'ready' && (
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius={20}
              padding="$xl"
              alignItems="center"
              maxWidth={340}
              borderWidth={1}
              borderColor="#E8E8E8"
            >
              <View
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="rgba(196, 229, 56, 0.2)"
                justifyContent="center"
                alignItems="center"
                marginBottom="$lg"
              >
                <CreditCard size={40} color="#1A3A35" />
              </View>
              <Text color="#1A3A35" fontSize={22} fontWeight="700" textAlign="center">
                Accept Payments
              </Text>
              <Text color="#666666" fontSize={15} textAlign="center" marginTop="$sm" lineHeight={22}>
                Connect your Stripe account to accept payments from customers and receive payouts.
              </Text>

              <YStack
                backgroundColor="#F9FAF9"
                borderRadius={12}
                padding="$md"
                marginTop="$lg"
                width="100%"
                gap="$sm"
              >
                <XStack alignItems="center" gap="$sm">
                  <CheckCircle size={16} color="#2E7D32" />
                  <Text color="#666666" fontSize={13}>Secure payment processing</Text>
                </XStack>
                <XStack alignItems="center" gap="$sm">
                  <CheckCircle size={16} color="#2E7D32" />
                  <Text color="#666666" fontSize={13}>Automatic payouts to your bank</Text>
                </XStack>
                <XStack alignItems="center" gap="$sm">
                  <CheckCircle size={16} color="#2E7D32" />
                  <Text color="#666666" fontSize={13}>PCI compliant card handling</Text>
                </XStack>
              </YStack>

              <Pressable onPress={openStripeOnboarding} style={{ width: '100%', marginTop: 24 }}>
                <XStack
                  backgroundColor="#C4E538"
                  borderRadius={12}
                  padding="$md"
                  justifyContent="center"
                  alignItems="center"
                  gap="$sm"
                >
                  <ExternalLink size={20} color="#1A3A35" />
                  <Text color="#1A3A35" fontSize={16} fontWeight="600">
                    Connect with Stripe
                  </Text>
                </XStack>
              </Pressable>

              <Text color="#999999" fontSize={12} textAlign="center" marginTop="$md">
                You'll be redirected to Stripe to complete setup
              </Text>
            </YStack>
          )}

          {status === 'opening' && (
            <>
              <ActivityIndicator size="large" color="#1A3A35" />
              <Text color="#666666" fontSize={15} marginTop="$lg" textAlign="center">
                Opening Stripe...
              </Text>
              <Text color="#999999" fontSize={13} marginTop="$sm" textAlign="center">
                Complete your setup and return to the app
              </Text>
            </>
          )}

          {status === 'complete' && (
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius={20}
              padding="$xl"
              alignItems="center"
              maxWidth={340}
              borderWidth={1}
              borderColor="#E8E8E8"
            >
              <View
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="rgba(76, 175, 80, 0.2)"
                justifyContent="center"
                alignItems="center"
                marginBottom="$lg"
              >
                <CheckCircle size={40} color="#2E7D32" />
              </View>
              <Text color="#1A3A35" fontSize={22} fontWeight="700" textAlign="center">
                Stripe Connected
              </Text>
              <Text color="#666666" fontSize={15} textAlign="center" marginTop="$sm" lineHeight={22}>
                Your payment setup is complete. You can now accept subscriptions from customers.
              </Text>

              <Pressable onPress={handleDone} style={{ width: '100%', marginTop: 24 }}>
                <View
                  backgroundColor="#1A3A35"
                  borderRadius={12}
                  padding="$md"
                  alignItems="center"
                >
                  <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                    Go to Dashboard
                  </Text>
                </View>
              </Pressable>
            </YStack>
          )}

          {status === 'error' && (
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius={20}
              padding="$xl"
              alignItems="center"
              maxWidth={340}
              borderWidth={1}
              borderColor="#E8E8E8"
            >
              <View
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="rgba(229, 57, 53, 0.1)"
                justifyContent="center"
                alignItems="center"
                marginBottom="$lg"
              >
                <CreditCard size={40} color="#E53935" />
              </View>
              <Text color="#1A3A35" fontSize={22} fontWeight="700" textAlign="center">
                Something went wrong
              </Text>
              <Text color="#666666" fontSize={15} textAlign="center" marginTop="$sm" lineHeight={22}>
                {errorMessage || 'We couldn\'t set up your Stripe account. Please try again.'}
              </Text>

              <Pressable onPress={initializeOnboarding} style={{ width: '100%', marginTop: 24 }}>
                <XStack
                  backgroundColor="#C4E538"
                  borderRadius={12}
                  padding="$md"
                  justifyContent="center"
                  alignItems="center"
                  gap="$sm"
                >
                  <RefreshCw size={20} color="#1A3A35" />
                  <Text color="#1A3A35" fontSize={16} fontWeight="600">
                    Try Again
                  </Text>
                </XStack>
              </Pressable>
            </YStack>
          )}
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
