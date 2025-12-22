import { useEffect } from 'react'
import { ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  PoundSterling,
  QrCode,
  Heart,
  Plus,
  CreditCard,
  Store,
  Package,
  Megaphone,
} from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { useBusinessStore } from '../../stores/business'
import { StatCard, QuickActionButton, SetupProgress } from '../../components/features/dashboard'

export default function BusinessDashboardScreen() {
  const { user } = useAuthStore()
  const { business, isLoading, fetchBusiness } = useBusinessStore()

  useEffect(() => {
    if (user) {
      fetchBusiness(user.id)
    }
  }, [user])

  const handleRefresh = () => {
    if (user) {
      fetchBusiness(user.id)
    }
  }

  // Loading state
  if (isLoading && !business) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="#F9FAF9">
        <ActivityIndicator size="large" color="#1A3A35" />
      </View>
    )
  }

  // No business yet - redirect to onboarding
  if (!business) {
    return <Redirect href="/(business)/onboarding" />
  }

  // Business pending approval
  if (business.status === 'pending_approval') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} padding="$lg" justifyContent="center" alignItems="center">
          <YStack
            backgroundColor="#FFFFFF"
            padding="$xl"
            borderRadius={20}
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
              <Clock size={40} color="#1A3A35" />
            </View>
            <Text color="#1A3A35" fontSize={24} fontWeight="700" textAlign="center">
              Under Review
            </Text>
            <Text color="#666666" fontSize={15} textAlign="center" marginTop="$sm" lineHeight={22}>
              Your business "{business.name}" is being reviewed by our team.
            </Text>
            <View
              backgroundColor="#F9FAF9"
              borderRadius={12}
              padding="$md"
              marginTop="$lg"
              width="100%"
            >
              <Text color="#999999" fontSize={13} textAlign="center">
                This usually takes 1-2 business days. We'll notify you by email once approved.
              </Text>
            </View>
          </YStack>
        </YStack>
      </SafeAreaView>
    )
  }

  // Business rejected
  if (business.status === 'rejected') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} padding="$lg" justifyContent="center" alignItems="center">
          <YStack
            backgroundColor="#FFFFFF"
            padding="$xl"
            borderRadius={20}
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
              <XCircle size={40} color="#E53935" />
            </View>
            <Text color="#1A3A35" fontSize={24} fontWeight="700" textAlign="center">
              Application Declined
            </Text>
            <Text color="#666666" fontSize={15} textAlign="center" marginTop="$sm" lineHeight={22}>
              Unfortunately, your business application was not approved.
            </Text>
            {business.rejectionReason && (
              <View
                backgroundColor="rgba(229, 57, 53, 0.1)"
                borderRadius={12}
                padding="$md"
                marginTop="$lg"
                width="100%"
              >
                <Text color="#E53935" fontSize={13} textAlign="center">
                  {business.rejectionReason}
                </Text>
              </View>
            )}
            <Text color="#999999" fontSize={13} textAlign="center" marginTop="$md">
              Contact support if you believe this was a mistake.
            </Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    )
  }

  // Calculate setup progress
  const setupSteps = [
    {
      icon: Store,
      label: 'Business profile',
      description: 'Your business details',
      completed: true,
      onPress: () => router.push('/(business)/settings'),
    },
    {
      icon: CreditCard,
      label: 'Connect Stripe',
      description: 'Accept payments',
      completed: business.stripeOnboardingComplete,
      onPress: () => router.push('/(business)/stripe-onboarding'),
    },
    {
      icon: Package,
      label: 'Create a subscription',
      description: 'Your first product',
      completed: false, // TODO: Check if has products
      onPress: () => router.push('/(business)/subscriptions'),
    },
  ]
  const completedSteps = setupSteps.filter((s) => s.completed).length
  const isFullySetUp = completedSteps === setupSteps.length

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#1A3A35" />
        }
      >
        <YStack padding="$lg" gap="$lg">
          {/* Header */}
          <YStack>
            <Text color="#666666" fontSize={15}>
              {greeting}
            </Text>
            <Text color="#1A3A35" fontSize={26} fontWeight="700">
              {business.name}
            </Text>
            <XStack alignItems="center" gap="$xs" marginTop="$xs">
              {business.status === 'active' ? (
                <>
                  <CheckCircle size={14} color="#C4E538" />
                  <Text color="#666666" fontSize={13}>Active</Text>
                </>
              ) : (
                <>
                  <Clock size={14} color="#C4E538" />
                  <Text color="#666666" fontSize={13}>Setup in progress</Text>
                </>
              )}
            </XStack>
          </YStack>

          {/* Setup Progress (if not fully set up) */}
          {!isFullySetUp && (
            <SetupProgress
              title="Complete your setup"
              steps={setupSteps}
              completedCount={completedSteps}
              totalCount={setupSteps.length}
            />
          )}

          {/* Stats Grid */}
          <YStack gap="$sm">
            <Text color="#666666" fontSize={13} fontWeight="500" marginLeft="$xs">
              TODAY'S OVERVIEW
            </Text>
            <XStack gap="$sm">
              <StatCard
                icon={Users}
                label="Subscribers"
                value={0}
                subtitle="Active"
                iconBgColor="#D4C8E8"
              />
              <StatCard
                icon={PoundSterling}
                label="Revenue"
                value="£0"
                subtitle="This month"
                iconBgColor="rgba(196, 229, 56, 0.3)"
              />
            </XStack>
            <XStack gap="$sm">
              <StatCard
                icon={QrCode}
                label="Redemptions"
                value={0}
                subtitle="Today"
                iconBgColor="#F0F0F0"
              />
              <StatCard
                icon={Heart}
                label="Loyalty stamps"
                value={0}
                subtitle="This week"
                iconBgColor="rgba(212, 200, 232, 0.5)"
              />
            </XStack>
          </YStack>

          {/* Quick Actions */}
          <YStack gap="$sm">
            <Text color="#666666" fontSize={13} fontWeight="500" marginLeft="$xs">
              QUICK ACTIONS
            </Text>
            <XStack gap="$sm">
              <QuickActionButton
                icon={Plus}
                label="New Subscription"
                variant="primary"
                onPress={() => router.push('/(business)/subscriptions')}
              />
              <QuickActionButton
                icon={QrCode}
                label="Scan QR"
                onPress={() => {/* TODO: QR Scanner */}}
              />
              <QuickActionButton
                icon={Megaphone}
                label="Promote"
                onPress={() => {/* TODO: Promotions */}}
              />
            </XStack>
          </YStack>

          {/* Recent Activity Placeholder */}
          <YStack gap="$sm">
            <Text color="#666666" fontSize={13} fontWeight="500" marginLeft="$xs">
              RECENT ACTIVITY
            </Text>
            <YStack
              backgroundColor="#FFFFFF"
              borderRadius={16}
              padding="$xl"
              alignItems="center"
              borderWidth={1}
              borderColor="#E8E8E8"
            >
              <Text color="#999999" fontSize={14} textAlign="center">
                No recent activity yet.{'\n'}Activity will appear here once customers start subscribing.
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
