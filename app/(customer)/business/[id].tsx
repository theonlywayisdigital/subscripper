import { useEffect, useState } from 'react'
import { ScrollView, Alert, ActivityIndicator } from 'react-native'
import { YStack, XStack, H1, H2, Text, Button, Card, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, MapPin, Clock, Star, Coffee, Check } from '@tamagui/lucide-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../stores/auth'
import { useSubscriptionStore, SubscriptionProduct } from '../../../stores/subscriptions'
import { supabase } from '../../../lib/supabase/client'

interface Business {
  id: string
  name: string
  type: string
  description?: string
  address?: string
  logoUrl?: string
  googleRating?: number
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { subscriptions } = useSubscriptionStore()

  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<SubscriptionProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchBusinessAndProducts()
    }
  }, [id])

  const fetchBusinessAndProducts = async () => {
    setIsLoading(true)
    try {
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (businessError) throw businessError

      setBusiness({
        id: businessData.id,
        name: businessData.name,
        type: businessData.type,
        description: businessData.description,
        address: businessData.address,
        logoUrl: businessData.logo_url,
        googleRating: businessData.google_rating,
      })

      // Fetch active products for this business
      const { data: productsData, error: productsError } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .order('price_pence', { ascending: true })

      if (productsError) throw productsError

      setProducts(productsData.map(p => ({
        id: p.id,
        businessId: p.business_id,
        name: p.name,
        description: p.description,
        itemType: p.item_type,
        quantityPerPeriod: p.quantity_per_period,
        period: p.period,
        pricePence: p.price_pence,
        blackoutTimes: p.blackout_times || [],
        branding: p.branding || {},
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })))
    } catch (error) {
      console.error('Error fetching business:', error)
      Alert.alert('Error', 'Failed to load business details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = (product: SubscriptionProduct) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to subscribe.')
      return
    }

    // Check if already subscribed to this product
    const existingSubscription = subscriptions.find(
      s => s.productId === product.id && s.status === 'active'
    )

    if (existingSubscription) {
      Alert.alert('Already subscribed', 'You already have an active subscription to this product.')
      return
    }

    // Navigate to checkout with product details
    router.push({
      pathname: '/(customer)/checkout',
      params: {
        productId: product.id,
        businessName: business?.name,
      },
    })
  }

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`

  const isSubscribed = (productId: string) => {
    return subscriptions.some(s => s.productId === productId && s.status === 'active')
  }

  const formatBusinessType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#1A3A35" />
        </YStack>
      </SafeAreaView>
    )
  }

  if (!business) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} padding="$lg">
          <Button
            size="$3"
            backgroundColor="transparent"
            alignSelf="flex-start"
            onPress={() => router.back()}
          >
            <XStack alignItems="center" gap="$xs">
              <ArrowLeft size={20} color="#1A3A35" />
              <Text color="$primary">Back</Text>
            </XStack>
          </Button>
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color="$textMuted">Business not found</Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header with business image/logo */}
      <View height={200} backgroundColor="$primary">
        <SafeAreaView edges={['top']}>
          <XStack padding="$md">
            <Button
              size="$3"
              backgroundColor="rgba(255,255,255,0.2)"
              borderRadius="$full"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="white" />
            </Button>
          </XStack>
        </SafeAreaView>
        <YStack flex={1} justifyContent="flex-end" padding="$lg">
          <H1 color="$surface" fontSize={28} fontWeight="700">
            {business.name}
          </H1>
          <XStack alignItems="center" gap="$md" marginTop="$xs">
            <Text color="rgba(255,255,255,0.8)" fontSize={14}>
              {formatBusinessType(business.type)}
            </Text>
            {business.googleRating && (
              <XStack alignItems="center" gap="$xs">
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text color="rgba(255,255,255,0.8)" fontSize={14}>
                  {business.googleRating}
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack padding="$lg">
          {/* Address if available */}
          {business.address && (
            <XStack alignItems="center" gap="$sm" marginBottom="$md">
              <MapPin size={16} color="#666" />
              <Text color="$textMuted" fontSize={14}>
                {business.address}
              </Text>
            </XStack>
          )}

          {/* Description */}
          {business.description && (
            <Text color="$text" fontSize={14} marginBottom="$lg" lineHeight={22}>
              {business.description}
            </Text>
          )}

          {/* Subscription Products */}
          <H2 color="$primary" fontSize={20} fontWeight="600" marginBottom="$md">
            Subscription Plans
          </H2>

          {products.length === 0 ? (
            <Card
              backgroundColor="$secondary"
              borderRadius="$md"
              padding="$lg"
              alignItems="center"
            >
              <Text fontSize={32} marginBottom="$sm">☕</Text>
              <Text color="$textMuted" textAlign="center">
                No subscription plans available yet.
              </Text>
            </Card>
          ) : (
            products.map((product) => {
              const subscribed = isSubscribed(product.id)

              return (
                <Card
                  key={product.id}
                  backgroundColor="$surface"
                  borderRadius="$md"
                  marginBottom="$md"
                  borderWidth={subscribed ? 2 : 1}
                  borderColor={subscribed ? '$accent' : '$borderColor'}
                  overflow="hidden"
                >
                  <YStack padding="$md">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1}>
                        <XStack alignItems="center" gap="$sm">
                          <Text color="$primary" fontSize={18} fontWeight="600">
                            {product.name}
                          </Text>
                          {subscribed && (
                            <View
                              backgroundColor="$accent"
                              paddingHorizontal="$sm"
                              paddingVertical={2}
                              borderRadius="$full"
                            >
                              <Text color="$primary" fontSize={10} fontWeight="600">
                                SUBSCRIBED
                              </Text>
                            </View>
                          )}
                        </XStack>
                        {product.description && (
                          <Text color="$textMuted" fontSize={13} marginTop="$xs">
                            {product.description}
                          </Text>
                        )}
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Text color="$accent" fontSize={22} fontWeight="700">
                          {formatPrice(product.pricePence)}
                        </Text>
                        <Text color="$textMuted" fontSize={12}>
                          per {product.period}
                        </Text>
                      </YStack>
                    </XStack>

                    <XStack
                      alignItems="center"
                      gap="$sm"
                      marginTop="$md"
                      backgroundColor="$background"
                      padding="$sm"
                      borderRadius="$sm"
                    >
                      <Coffee size={16} color="#666" />
                      <Text color="$text" fontSize={14}>
                        {product.quantityPerPeriod}x {product.itemType} per {product.period}
                      </Text>
                    </XStack>

                    {subscribed ? (
                      <Button
                        marginTop="$md"
                        backgroundColor="$accent"
                        borderRadius="$sm"
                        onPress={() => router.push('/(customer)/subscriptions')}
                      >
                        <XStack alignItems="center" gap="$xs">
                          <Check size={18} color="#1A3A35" />
                          <Text color="$primary" fontWeight="600">
                            View Subscription
                          </Text>
                        </XStack>
                      </Button>
                    ) : (
                      <Button
                        marginTop="$md"
                        backgroundColor="$accent"
                        borderRadius="$sm"
                        onPress={() => handleSubscribe(product)}
                      >
                        <Text color="$primary" fontWeight="600">
                          Subscribe Now
                        </Text>
                      </Button>
                    )}
                  </YStack>
                </Card>
              )
            })
          )}
        </YStack>

        {/* Bottom spacing */}
        <View height={100} />
      </ScrollView>
    </View>
  )
}
