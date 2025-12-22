import { useEffect, useState } from 'react'
import { Alert, ActivityIndicator, Animated, PanResponder, Dimensions } from 'react-native'
import { YStack, XStack, H1, Text, Button, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Coffee, Clock, Check, ChevronRight } from '@tamagui/lucide-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../stores/auth'
import { useSubscriptionStore, Subscription } from '../../../stores/subscriptions'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SLIDER_WIDTH = SCREEN_WIDTH - 80
const THUMB_SIZE = 60
const SLIDE_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 20

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { subscriptions, fetchSubscriptions, redeem, fetchRedemptions, redemptions } = useSubscriptionStore()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Slider animation
  const [slideX] = useState(new Animated.Value(0))
  const [sliderProgress] = useState(new Animated.Value(0))

  useEffect(() => {
    if (id && user) {
      loadSubscription()
    }
  }, [id, user])

  const loadSubscription = async () => {
    setIsLoading(true)
    try {
      if (user) {
        await fetchSubscriptions(user.id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Find the subscription from the store
  useEffect(() => {
    const found = subscriptions.find(s => s.id === id)
    if (found) {
      setSubscription(found)
      // Fetch redemptions for this subscription
      fetchRedemptions(found.id)
    }
  }, [subscriptions, id])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const newX = Math.max(0, Math.min(gesture.dx, SLIDE_THRESHOLD))
      slideX.setValue(newX)
      sliderProgress.setValue(newX / SLIDE_THRESHOLD)
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx >= SLIDE_THRESHOLD) {
        // Threshold reached - redeem!
        handleRedeem()
      } else {
        // Snap back
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }).start()
        Animated.spring(sliderProgress, {
          toValue: 0,
          useNativeDriver: false,
        }).start()
      }
    },
  })

  const handleRedeem = async () => {
    if (!subscription || !subscription.product || isRedeeming) return

    const remaining = getRemainingRedemptions()
    if (remaining <= 0) {
      Alert.alert('No redemptions left', 'You have used all your redemptions for this period.')
      resetSlider()
      return
    }

    setIsRedeeming(true)
    try {
      await redeem(subscription.id, subscription.product.itemType)
      setShowSuccess(true)

      // Show success for 2 seconds then reset
      setTimeout(() => {
        setShowSuccess(false)
        resetSlider()
        // Reload subscription to get updated count
        if (user) {
          fetchSubscriptions(user.id)
        }
      }, 2000)
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem. Please try again.')
      resetSlider()
    } finally {
      setIsRedeeming(false)
    }
  }

  const resetSlider = () => {
    Animated.spring(slideX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start()
    Animated.spring(sliderProgress, {
      toValue: 0,
      useNativeDriver: false,
    }).start()
  }

  const getRemainingRedemptions = () => {
    if (!subscription || !subscription.product) return 0
    return subscription.product.quantityPerPeriod - subscription.redemptionsUsed
  }

  const getTimeRemaining = () => {
    if (!subscription) return ''
    const end = new Date(subscription.currentPeriodEnd)
    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Period expired'
    if (diffDays === 1) return 'Resets tomorrow'
    return `Resets in ${diffDays} days`
  }

  if (isLoading || !subscription) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#1A3A35" />
        </YStack>
      </SafeAreaView>
    )
  }

  const product = subscription.product
  const remaining = getRemainingRedemptions()
  const total = product?.quantityPerPeriod || 0

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1A3A35' }}>
        <YStack backgroundColor="$primary" paddingHorizontal="$lg" paddingBottom="$xl" paddingTop="$sm">
          <XStack alignItems="center" marginBottom="$lg">
            <Button
              size="$3"
              backgroundColor="rgba(255,255,255,0.15)"
              borderRadius="$full"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="white" />
            </Button>
          </XStack>

          <YStack alignItems="center">
            <Text color="rgba(255,255,255,0.7)" fontSize={14} marginBottom="$xs">
              {product?.business?.name || 'Subscription'}
            </Text>
            <H1 color="$surface" fontSize={24} fontWeight="700" textAlign="center">
              {product?.name}
            </H1>
          </YStack>
        </YStack>
      </SafeAreaView>

      <YStack flex={1} padding="$lg" justifyContent="space-between">
        {/* Redemption count display */}
        <YStack alignItems="center" paddingTop="$xl">
          <YStack
            backgroundColor="$surface"
            borderRadius={100}
            width={180}
            height={180}
            justifyContent="center"
            alignItems="center"
            shadowColor="rgba(0,0,0,0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={12}
            elevation={5}
          >
            <Text color="$primary" fontSize={64} fontWeight="700">
              {remaining}
            </Text>
            <Text color="$textMuted" fontSize={14}>
              of {total} left
            </Text>
          </YStack>

          <XStack alignItems="center" gap="$xs" marginTop="$lg">
            <Coffee size={18} color="#666" />
            <Text color="$textMuted" fontSize={16}>
              {product?.itemType}
            </Text>
          </XStack>

          <XStack alignItems="center" gap="$xs" marginTop="$sm">
            <Clock size={16} color="#999" />
            <Text color="$textLight" fontSize={14}>
              {getTimeRemaining()}
            </Text>
          </XStack>
        </YStack>

        {/* Redemption history */}
        {redemptions.length > 0 && (
          <YStack marginTop="$xl">
            <Text color="$textMuted" fontSize={12} fontWeight="500" marginBottom="$sm">
              Recent Redemptions
            </Text>
            {redemptions.slice(0, 3).map((r) => (
              <XStack
                key={r.id}
                backgroundColor="$surface"
                padding="$sm"
                borderRadius="$sm"
                marginBottom="$xs"
                alignItems="center"
              >
                <Check size={14} color="#4CAF50" />
                <Text color="$textMuted" fontSize={12} marginLeft="$sm">
                  {new Date(r.redeemedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        {/* Swipe to Redeem Slider */}
        <YStack alignItems="center" paddingBottom="$xl">
          {showSuccess ? (
            <YStack
              backgroundColor="#4CAF50"
              borderRadius={40}
              height={70}
              width={SLIDER_WIDTH}
              justifyContent="center"
              alignItems="center"
            >
              <XStack alignItems="center" gap="$sm">
                <Check size={28} color="white" />
                <Text color="white" fontSize={18} fontWeight="600">
                  Redeemed!
                </Text>
              </XStack>
            </YStack>
          ) : remaining > 0 ? (
            <View
              backgroundColor="#E0E0E0"
              borderRadius={40}
              height={70}
              width={SLIDER_WIDTH}
              justifyContent="center"
              overflow="hidden"
            >
              {/* Progress fill */}
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: '#C4E538',
                  borderRadius: 40,
                  width: slideX.interpolate({
                    inputRange: [0, SLIDE_THRESHOLD],
                    outputRange: [THUMB_SIZE, SLIDER_WIDTH],
                  }),
                }}
              />

              {/* Slider text */}
              <XStack
                position="absolute"
                left={0}
                right={0}
                top={0}
                bottom={0}
                justifyContent="center"
                alignItems="center"
              >
                <Text color="#666" fontSize={14} fontWeight="500">
                  Slide to redeem
                </Text>
                <ChevronRight size={18} color="#666" />
              </XStack>

              {/* Thumb */}
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 5,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: THUMB_SIZE / 2,
                  backgroundColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                  transform: [{ translateX: slideX }],
                }}
              >
                <Coffee size={24} color="#1A3A35" />
              </Animated.View>
            </View>
          ) : (
            <View
              backgroundColor="#E0E0E0"
              borderRadius={40}
              height={70}
              width={SLIDER_WIDTH}
              justifyContent="center"
              alignItems="center"
            >
              <Text color="#999" fontSize={14}>
                No redemptions left this {product?.period}
              </Text>
            </View>
          )}

          <Text color="$textLight" fontSize={12} marginTop="$md" textAlign="center">
            Show your phone to staff when redeeming
          </Text>
        </YStack>
      </YStack>
    </View>
  )
}
