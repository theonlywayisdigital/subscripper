import { useState, useEffect } from 'react'
import { ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Input, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, Coffee, MapPin, Star } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/auth'
import { useSubscriptionStore } from '../../stores/subscriptions'
import { supabase } from '../../lib/supabase/client'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface BusinessWithProducts {
  id: string
  name: string
  type: string
  description?: string
  address?: string
  logoUrl?: string
  googleRating?: number
  priceFrom?: number
  productCount: number
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'coffee_shop', label: 'Coffee' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'restaurant', label: 'Lunch' },
  { id: 'cafe', label: 'Cafe' },
]

const TYPE_EMOJIS: Record<string, string> = {
  coffee_shop: '☕',
  bakery: '🥐',
  restaurant: '🍽️',
  cafe: '☕',
  juice_bar: '🥤',
  pub: '🍺',
  takeaway: '🥡',
  other: '🏪',
}

const TYPE_COLORS: Record<string, string> = {
  coffee_shop: '#D4C8E8',
  bakery: '#E8F5E0',
  restaurant: '#FFF3E0',
  cafe: '#E3F2FD',
  juice_bar: '#F3E5F5',
  pub: '#FFECB3',
  takeaway: '#E0F7FA',
  other: '#F5F5F5',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function SubscriptionCard({ subscription }: { subscription: any }) {
  const progress = (subscription.total - subscription.remaining) / subscription.total

  return (
    <View
      width={200}
      height={120}
      borderRadius={16}
      backgroundColor="$surface"
      marginRight="$md"
      overflow="hidden"
      shadowColor="rgba(0,0,0,0.1)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={1}
      shadowRadius={8}
      elevation={3}
    >
      {/* Colored header */}
      <View
        height={50}
        backgroundColor={subscription.headerColor || '#1A3A35'}
        paddingHorizontal="$md"
        justifyContent="center"
      >
        <Text
          color={subscription.textOnHeader || '#FFFFFF'}
          fontSize={14}
          fontWeight="600"
        >
          {subscription.businessName}
        </Text>
      </View>

      {/* Content */}
      <YStack padding="$md" flex={1} justifyContent="space-between">
        <YStack>
          <Text color="$textMuted" fontSize={12}>
            {subscription.remaining} of {subscription.total} {subscription.itemType} left
          </Text>
          <Text color="$textLight" fontSize={11}>
            {subscription.resetsIn}
          </Text>
        </YStack>

        {/* Progress bar */}
        <View height={6} borderRadius={3} backgroundColor="#E8E8E8">
          <View
            height={6}
            borderRadius={3}
            backgroundColor="#C4E538"
            width={`${progress * 100}%`}
          />
        </View>
      </YStack>
    </View>
  )
}

function CategoryPill({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <View
      paddingHorizontal="$md"
      paddingVertical="$sm"
      borderRadius={16}
      backgroundColor={active ? '$primary' : '#F0F0F0'}
      marginRight="$sm"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <Text
        color={active ? '$surface' : '$text'}
        fontSize={12}
        fontWeight={active ? '600' : '400'}
      >
        {label}
      </Text>
    </View>
  )
}

function BusinessCard({
  business,
  onPress,
}: {
  business: BusinessWithProducts
  onPress: () => void
}) {
  const formatBusinessType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <XStack
      backgroundColor="$surface"
      borderRadius={16}
      marginBottom="$md"
      overflow="hidden"
      shadowColor="rgba(0,0,0,0.05)"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={1}
      shadowRadius={4}
      elevation={2}
      pressStyle={{ opacity: 0.95, scale: 0.99 }}
      onPress={onPress}
    >
      {/* Image placeholder */}
      <View
        width={100}
        height={100}
        backgroundColor={TYPE_COLORS[business.type] || '#F5F5F5'}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={32}>{TYPE_EMOJIS[business.type] || '🏪'}</Text>
      </View>

      {/* Content */}
      <YStack flex={1} padding="$md" justifyContent="center">
        <Text color="$text" fontSize={16} fontWeight="600">
          {business.name}
        </Text>
        <Text color="$textMuted" fontSize={12} marginTop={2}>
          {formatBusinessType(business.type)}
        </Text>
        {business.priceFrom && (
          <Text color="$textLight" fontSize={12} marginTop={2}>
            From £{(business.priceFrom / 100).toFixed(0)}/month
          </Text>
        )}
        <XStack alignItems="center" marginTop={4} gap="$sm">
          {business.googleRating && (
            <XStack alignItems="center">
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text color="$primary" fontSize={11} marginLeft={2}>
                {business.googleRating}
              </Text>
            </XStack>
          )}
          <Text color="$accent" fontSize={11} fontWeight="500">
            {business.productCount} plan{business.productCount !== 1 ? 's' : ''}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { subscriptions, fetchSubscriptions } = useSubscriptionStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [businesses, setBusinesses] = useState<BusinessWithProducts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchBusinesses()
    if (user) {
      fetchSubscriptions(user.id)
    }
  }, [user])

  const fetchBusinesses = async () => {
    try {
      // Fetch active businesses with their products
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          type,
          description,
          address,
          logo_url,
          google_rating,
          subscription_products!inner (
            id,
            price_pence,
            is_active
          )
        `)
        .eq('status', 'active')
        .eq('subscription_products.is_active', true)

      if (error) throw error

      const businessesWithProducts = data.map((b: any) => {
        const activeProducts = b.subscription_products.filter((p: any) => p.is_active)
        const lowestPrice = activeProducts.length > 0
          ? Math.min(...activeProducts.map((p: any) => p.price_pence))
          : null

        return {
          id: b.id,
          name: b.name,
          type: b.type,
          description: b.description,
          address: b.address,
          logoUrl: b.logo_url,
          googleRating: b.google_rating,
          priceFrom: lowestPrice,
          productCount: activeProducts.length,
        }
      })

      setBusinesses(businessesWithProducts)
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchBusinesses()
    if (user) {
      await fetchSubscriptions(user.id)
    }
    setRefreshing(false)
  }

  // Get active subscriptions with display data
  const activeSubscriptions = subscriptions
    .filter(s => s.status === 'active')
    .map(s => {
      const product = s.product
      const total = product?.quantityPerPeriod || 0
      const remaining = total - s.redemptionsUsed

      const endDate = new Date(s.currentPeriodEnd)
      const now = new Date()
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const resetsIn = diffDays <= 0 ? 'Expired' : diffDays === 1 ? 'Resets tomorrow' : `Resets in ${diffDays} days`

      return {
        id: s.id,
        businessName: product?.business?.name || product?.name || 'Subscription',
        remaining,
        total,
        itemType: product?.itemType || 'items',
        resetsIn,
        headerColor: '#1A3A35',
        textOnHeader: '#FFFFFF',
      }
    })

  // Filter businesses by category and search
  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = activeCategory === 'all' || b.type === activeCategory
    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1A3A35' }}>
        <YStack backgroundColor="#1A3A35" paddingHorizontal="$lg" paddingBottom="$lg">
          {/* Greeting */}
          <YStack marginBottom="$md">
            <Text color="$surface" fontSize={24} fontWeight="600">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </Text>
            <Text color="rgba(255,255,255,0.7)" fontSize={14}>
              Find your next subscription
            </Text>
          </YStack>

          {/* Search bar */}
          <XStack
            backgroundColor="rgba(255,255,255,0.15)"
            borderRadius={22}
            height={44}
            alignItems="center"
            paddingHorizontal="$md"
          >
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <Input
              flex={1}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search coffee, bakery, lunch..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              backgroundColor="transparent"
              borderWidth={0}
              color="$surface"
              fontSize={14}
              marginLeft="$sm"
            />
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Your Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <>
            <YStack paddingTop="$lg" paddingHorizontal="$lg">
              <XStack justifyContent="space-between" alignItems="center" marginBottom="$md">
                <Text color="$text" fontSize={18} fontWeight="600">
                  Your Subscriptions
                </Text>
                <Text
                  color="$primary"
                  fontSize={14}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => router.push('/(customer)/subscriptions')}
                >
                  See all
                </Text>
              </XStack>
            </YStack>

            {/* Horizontal scroll for subscriptions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {activeSubscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Discover Nearby */}
        <YStack paddingHorizontal="$lg" marginTop="$xl">
          <Text color="$text" fontSize={18} fontWeight="600" marginBottom="$md">
            Discover Nearby
          </Text>

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.label}
                active={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>

          {/* Business cards */}
          {isLoading ? (
            <YStack padding="$xl" alignItems="center">
              <ActivityIndicator size="large" color="#1A3A35" />
            </YStack>
          ) : filteredBusinesses.length === 0 ? (
            <YStack
              backgroundColor="$secondary"
              padding="$xl"
              borderRadius="$md"
              alignItems="center"
            >
              <Text fontSize={32} marginBottom="$sm">🔍</Text>
              <Text color="$textMuted" textAlign="center">
                {businesses.length === 0
                  ? 'No businesses with subscriptions yet. Check back soon!'
                  : 'No businesses match your search.'}
              </Text>
            </YStack>
          ) : (
            filteredBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onPress={() => router.push(`/business/${business.id}`)}
              />
            ))
          )}
        </YStack>
      </ScrollView>
    </View>
  )
}
