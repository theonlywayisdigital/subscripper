import { useEffect, useState } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import { YStack, XStack, H1, H2, Text, Button, Card, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, CreditCard, Check, Coffee, Calendar, Shield } from '@tamagui/lucide-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/auth'
import { useSubscriptionStore } from '../../stores/subscriptions'
import { supabase } from '../../lib/supabase/client'

// Stripe hooks - may not be available in Expo Go
let useStripe: any = () => ({ initPaymentSheet: null, presentPaymentSheet: null })
try {
  const stripe = require('@stripe/stripe-react-native')
  useStripe = stripe.useStripe
} catch (e) {
  console.log('Stripe native module not available - using test mode')
}

interface ProductDetails {
  id: string
  name: string
  description?: string
  itemType: string
  quantityPerPeriod: number
  period: string
  pricePence: number
  businessName: string
}

export default function CheckoutScreen() {
  const { productId, businessName } = useLocalSearchParams<{
    productId: string
    businessName: string
  }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { fetchSubscriptions } = useSubscriptionStore()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select(`
          *,
          businesses (name)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error

      setProduct({
        id: data.id,
        name: data.name,
        description: data.description,
        itemType: data.item_type,
        quantityPerPeriod: data.quantity_per_period,
        period: data.period,
        pricePence: data.price_pence,
        businessName: data.businesses?.name || businessName || 'Unknown Business',
      })

      // Initialize payment sheet
      await initializePayment(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      Alert.alert('Error', 'Failed to load product details')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const isStripeAvailable = initPaymentSheet !== null

  const initializePayment = async (productData: Record<string, unknown>) => {
    if (!user) return

    // In Expo Go, Stripe native modules aren't available - use test mode
    if (!isStripeAvailable) {
      setPaymentReady(true)
      return
    }

    try {
      // Call Edge Function to create subscription and get client secret
      const { data, error } = await supabase.functions.invoke(
        'stripe-create-subscription',
        {
          body: {
            userId: user.id,
            productId,
          },
        }
      )

      if (error) throw error

      if (!data?.clientSecret) {
        throw new Error('Failed to create subscription')
      }

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: productData.businesses?.name || 'Subscripper',
        style: 'alwaysDark',
        defaultBillingDetails: {
          email: user.email,
        },
      })

      if (initError) {
        console.error('Payment sheet init error:', initError)
        throw new Error(initError.message)
      }

      setPaymentReady(true)
    } catch (error) {
      console.error('Payment initialization error:', error)
      Alert.alert(
        'Payment Setup Failed',
        'We couldn\'t set up the payment. Please try again.',
        [{ text: 'Go Back', onPress: () => router.back() }]
      )
    }
  }

  const handlePayment = async () => {
    if (!paymentReady) return

    setIsProcessing(true)
    try {
      // Test mode for Expo Go (no Stripe native modules)
      if (!isStripeAvailable) {
        // Create subscription directly in database for testing
        if (user && product) {
          const { subscribe } = useSubscriptionStore.getState()
          await subscribe(user.id, product.id)
        }
      } else {
        const { error } = await presentPaymentSheet()

        if (error) {
          if (error.code === 'Canceled') {
            // User cancelled - that's fine
            setIsProcessing(false)
            return
          }
          throw new Error(error.message)
        }
      }

      // Payment successful!
      // Refresh subscriptions to include the new one
      if (user) {
        await fetchSubscriptions(user.id)
      }

      Alert.alert(
        'Subscription Active!',
        `You're now subscribed to ${product?.name}. Enjoy your ${product?.quantityPerPeriod}x ${product?.itemType} per ${product?.period}!`,
        [
          {
            text: 'View My Subscriptions',
            onPress: () => router.replace('/(customer)/subscriptions'),
          },
        ]
      )
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`

  if (isLoading || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#1A3A35" />
          <Text color="$textMuted" marginTop="$md">Setting up payment...</Text>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1}>
        {/* Header */}
        <XStack padding="$md" alignItems="center" gap="$md">
          <Button
            size="$3"
            backgroundColor="transparent"
            onPress={() => router.back()}
            disabled={isProcessing}
          >
            <ArrowLeft size={24} color="#1A3A35" />
          </Button>
          <H1 color="$primary" fontSize={24} fontWeight="700">
            Checkout
          </H1>
        </XStack>

        {/* Content */}
        <YStack flex={1} padding="$lg" gap="$lg">
          {/* Product Summary Card */}
          <Card backgroundColor="$surface" borderRadius="$md" padding="$lg">
            <Text color="$textMuted" fontSize={12} fontWeight="500" marginBottom="$xs">
              SUBSCRIBING TO
            </Text>
            <Text color="$primary" fontSize={20} fontWeight="700">
              {product.name}
            </Text>
            <Text color="$textMuted" fontSize={14} marginTop="$xs">
              {product.businessName}
            </Text>

            <View
              height={1}
              backgroundColor="$borderColor"
              marginVertical="$md"
            />

            {/* What you get */}
            <XStack alignItems="center" gap="$sm" marginBottom="$sm">
              <Coffee size={18} color="#1A3A35" />
              <Text color="$text" fontSize={14}>
                {product.quantityPerPeriod}x {product.itemType} per {product.period}
              </Text>
            </XStack>

            <XStack alignItems="center" gap="$sm">
              <Calendar size={18} color="#1A3A35" />
              <Text color="$text" fontSize={14}>
                Renews every {product.period}
              </Text>
            </XStack>
          </Card>

          {/* Price Summary */}
          <Card backgroundColor="$surface" borderRadius="$md" padding="$lg">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$text" fontSize={16}>
                {product.name}
              </Text>
              <Text color="$text" fontSize={16}>
                {formatPrice(product.pricePence)}/{product.period}
              </Text>
            </XStack>

            <View
              height={1}
              backgroundColor="$borderColor"
              marginVertical="$md"
            />

            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$primary" fontSize={18} fontWeight="700">
                Total today
              </Text>
              <Text color="$accent" fontSize={24} fontWeight="700">
                {formatPrice(product.pricePence)}
              </Text>
            </XStack>
          </Card>

          {/* Security note */}
          <XStack
            alignItems="center"
            justifyContent="center"
            gap="$sm"
            opacity={0.6}
          >
            <Shield size={14} color="#666" />
            <Text color="$textMuted" fontSize={12}>
              Secure payment powered by Stripe
            </Text>
          </XStack>

          {/* Spacer */}
          <View flex={1} />

          {/* Pay Button */}
          <Button
            size="$5"
            backgroundColor={paymentReady ? '$accent' : '$borderColor'}
            borderRadius="$md"
            onPress={handlePayment}
            disabled={!paymentReady || isProcessing}
            opacity={paymentReady && !isProcessing ? 1 : 0.6}
          >
            {isProcessing ? (
              <XStack alignItems="center" gap="$sm">
                <ActivityIndicator size="small" color="#1A3A35" />
                <Text color="$primary" fontWeight="600" fontSize={16}>
                  Processing...
                </Text>
              </XStack>
            ) : (
              <XStack alignItems="center" gap="$sm">
                <CreditCard size={20} color="#1A3A35" />
                <Text color="$primary" fontWeight="600" fontSize={16}>
                  {paymentReady ? `Pay ${formatPrice(product.pricePence)}` : 'Setting up...'}
                </Text>
              </XStack>
            )}
          </Button>

          {/* Terms */}
          <Text color="$textMuted" fontSize={11} textAlign="center">
            By subscribing, you agree to the terms of service.{'\n'}
            Cancel anytime from your subscriptions.
          </Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
