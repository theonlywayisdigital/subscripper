import { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { YStack, XStack, H1, Paragraph, Text, Button, Card, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Coffee, Clock, ChevronRight, X } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/auth'
import { useSubscriptionStore, Subscription } from '../../stores/subscriptions'

export default function SubscriptionsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { subscriptions, isLoading, fetchSubscriptions, cancelSubscription } = useSubscriptionStore()

  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscriptions(user.id)
    }
  }, [user])

  const onRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    await fetchSubscriptions(user.id)
    setRefreshing(false)
  }

  const handleCancel = (subscription: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel your "${subscription.product?.name}" subscription?`,
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(subscription.id, 'User cancelled')
              Alert.alert('Cancelled', 'Your subscription has been cancelled.')
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel subscription')
            }
          },
        },
      ]
    )
  }

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return 'Resets tomorrow'
    return `Resets in ${diffDays} days`
  }

  const getRedemptionsRemaining = (subscription: Subscription) => {
    const total = subscription.product?.quantityPerPeriod || 0
    const used = subscription.redemptionsUsed
    return { remaining: total - used, total }
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const pendingSubscriptions = subscriptions.filter(s => s.status === 'pending')
  const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused')
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled')

  const renderSubscriptionCard = (subscription: Subscription) => {
    const { remaining, total } = getRedemptionsRemaining(subscription)
    const progress = total > 0 ? (total - remaining) / total : 0
    const product = subscription.product

    return (
      <Card
        key={subscription.id}
        backgroundColor="$surface"
        borderRadius="$md"
        marginBottom="$md"
        overflow="hidden"
        pressStyle={{ opacity: 0.95 }}
        onPress={() => {
          // Navigate to subscription detail / redeem screen
          router.push(`/subscription/${subscription.id}`)
        }}
      >
        {/* Colored header */}
        <View
          height={60}
          backgroundColor="$primary"
          paddingHorizontal="$md"
          justifyContent="center"
        >
          <Text color="$surface" fontSize={16} fontWeight="600">
            {product?.business?.name || product?.name || 'Subscription'}
          </Text>
          <Text color="rgba(255,255,255,0.7)" fontSize={12}>
            {product?.name}
          </Text>
        </View>

        {/* Content */}
        <YStack padding="$md">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$sm">
            <XStack alignItems="center" gap="$xs">
              <Coffee size={16} color="#666" />
              <Text color="$text" fontSize={14} fontWeight="500">
                {remaining} of {total} {product?.itemType || 'items'} left
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$xs">
              <Clock size={14} color="#999" />
              <Text color="$textMuted" fontSize={12}>
                {getTimeRemaining(subscription.currentPeriodEnd)}
              </Text>
            </XStack>
          </XStack>

          {/* Progress bar */}
          <View height={8} borderRadius={4} backgroundColor="#E8E8E8" marginBottom="$md">
            <View
              height={8}
              borderRadius={4}
              backgroundColor="$accent"
              width={`${progress * 100}%`}
            />
          </View>

          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$textMuted" fontSize={12}>
              {formatPrice(product?.pricePence || 0)}/{product?.period}
            </Text>
            <XStack alignItems="center" gap="$xs">
              <Text color="$accent" fontSize={14} fontWeight="600">
                Redeem
              </Text>
              <ChevronRight size={16} color="#C4E538" />
            </XStack>
          </XStack>
        </YStack>

        {/* Cancel button - subtle */}
        <XStack
          borderTopWidth={1}
          borderTopColor="$borderColor"
          padding="$sm"
          justifyContent="center"
        >
          <Button
            size="$2"
            backgroundColor="transparent"
            onPress={(e) => {
              e.stopPropagation()
              handleCancel(subscription)
            }}
          >
            <XStack alignItems="center" gap="$xs">
              <X size={12} color="#999" />
              <Text color="$textMuted" fontSize={12}>
                Cancel subscription
              </Text>
            </XStack>
          </Button>
        </XStack>
      </Card>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#1A3A35" />
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$lg">
          <H1 color="$primary" fontSize={28} fontWeight="700">
            My Subscriptions
          </H1>
          <Paragraph color="$textMuted">
            Manage your active subscriptions.
          </Paragraph>
        </YStack>

        {isLoading && subscriptions.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1A3A35" />
          </YStack>
        ) : subscriptions.length === 0 ? (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$xl"
          >
            <YStack
              backgroundColor="$secondary"
              padding="$xl"
              borderRadius="$lg"
              alignItems="center"
              maxWidth={300}
            >
              <Text fontSize={48} marginBottom="$md">
                🎫
              </Text>
              <Text
                color="$primary"
                fontSize={18}
                fontWeight="600"
                textAlign="center"
                marginBottom="$sm"
              >
                No subscriptions yet
              </Text>
              <Paragraph color="$textMuted" textAlign="center" fontSize={14}>
                You haven't subscribed to any businesses yet. Discover local spots and save on your daily favourites!
              </Paragraph>
              <Button
                marginTop="$lg"
                backgroundColor="$accent"
                borderRadius="$sm"
                onPress={() => router.push('/(customer)')}
              >
                <Text color="$primary" fontWeight="600">
                  Discover Businesses
                </Text>
              </Button>
            </YStack>
          </YStack>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {pendingSubscriptions.length > 0 && (
              <YStack marginBottom="$lg">
                <Text color="$textMuted" fontSize={16} fontWeight="600" marginBottom="$md">
                  Pending Payment ({pendingSubscriptions.length})
                </Text>
                {pendingSubscriptions.map((sub) => (
                  <Card
                    key={sub.id}
                    backgroundColor="$surface"
                    borderRadius="$md"
                    marginBottom="$sm"
                    padding="$md"
                    borderWidth={1}
                    borderColor="#FFB300"
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Text color="$primary" fontSize={14} fontWeight="600">
                          {sub.product?.name}
                        </Text>
                        <Text color="$textMuted" fontSize={12}>
                          Payment processing...
                        </Text>
                      </YStack>
                      <View
                        backgroundColor="#FFF3E0"
                        paddingHorizontal="$sm"
                        paddingVertical={4}
                        borderRadius="$sm"
                      >
                        <Text color="#E65100" fontSize={10} fontWeight="600">
                          PENDING
                        </Text>
                      </View>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}

            {activeSubscriptions.length > 0 && (
              <YStack marginBottom="$lg">
                <Text color="$text" fontSize={16} fontWeight="600" marginBottom="$md">
                  Active ({activeSubscriptions.length})
                </Text>
                {activeSubscriptions.map(renderSubscriptionCard)}
              </YStack>
            )}

            {pausedSubscriptions.length > 0 && (
              <YStack marginBottom="$lg">
                <Text color="$textMuted" fontSize={14} fontWeight="500" marginBottom="$md">
                  Payment Issue ({pausedSubscriptions.length})
                </Text>
                {pausedSubscriptions.map((sub) => (
                  <Card
                    key={sub.id}
                    backgroundColor="$surface"
                    borderRadius="$md"
                    marginBottom="$sm"
                    padding="$md"
                    borderWidth={1}
                    borderColor="#E53935"
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Text color="$primary" fontSize={14} fontWeight="600">
                          {sub.product?.name}
                        </Text>
                        <Text color="#E53935" fontSize={12}>
                          Payment failed - please update payment method
                        </Text>
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}

            {cancelledSubscriptions.length > 0 && (
              <YStack>
                <Text color="$textMuted" fontSize={14} fontWeight="500" marginBottom="$md">
                  Cancelled
                </Text>
                {cancelledSubscriptions.map((sub) => (
                  <Card
                    key={sub.id}
                    backgroundColor="$surface"
                    borderRadius="$md"
                    marginBottom="$sm"
                    padding="$md"
                    opacity={0.6}
                  >
                    <Text color="$textMuted" fontSize={14}>
                      {sub.product?.name} - Cancelled
                    </Text>
                  </Card>
                ))}
              </YStack>
            )}
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  )
}
