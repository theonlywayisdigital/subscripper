import { useEffect } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Store,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  PoundSterling,
} from '@tamagui/lucide-icons'
import { useAdminStore } from '../../stores/admin'
import { StatCard, QuickActionButton } from '../../components/features/dashboard'
import { Pressable } from 'react-native'

export default function AdminDashboardScreen() {
  const { stats, isLoading, fetchStats } = useAdminStore()

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
  }

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
              Admin Panel
            </Text>
            <Text color="#1A3A35" fontSize={26} fontWeight="700">
              Dashboard
            </Text>
          </YStack>

          {/* Pending Approvals Alert */}
          {stats.pendingApprovals > 0 && (
            <Pressable onPress={() => router.push('/(admin)/businesses')}>
              <XStack
                backgroundColor="#C4E538"
                borderRadius={16}
                padding="$md"
                alignItems="center"
                gap="$md"
              >
                <View
                  width={44}
                  height={44}
                  borderRadius={22}
                  backgroundColor="rgba(26, 58, 53, 0.15)"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AlertCircle size={22} color="#1A3A35" />
                </View>
                <YStack flex={1}>
                  <Text color="#1A3A35" fontSize={16} fontWeight="600">
                    {stats.pendingApprovals} pending approval{stats.pendingApprovals !== 1 ? 's' : ''}
                  </Text>
                  <Text color="#1A3A35" fontSize={13} opacity={0.7}>
                    Review new business applications
                  </Text>
                </YStack>
                <ChevronRight size={20} color="#1A3A35" />
              </XStack>
            </Pressable>
          )}

          {/* Stats Grid */}
          <YStack gap="$sm">
            <Text color="#666666" fontSize={13} fontWeight="500" marginLeft="$xs">
              PLATFORM OVERVIEW
            </Text>
            <XStack gap="$sm">
              <StatCard
                icon={Store}
                label="Total Businesses"
                value={stats.totalBusinesses}
                iconBgColor="#D4C8E8"
              />
              <StatCard
                icon={Users}
                label="Total Customers"
                value={stats.totalCustomers}
                iconBgColor="rgba(196, 229, 56, 0.3)"
              />
            </XStack>
            <XStack gap="$sm">
              <StatCard
                icon={CheckCircle}
                label="Active Businesses"
                value={stats.activeBusinesses}
                iconBgColor="rgba(76, 175, 80, 0.2)"
                iconColor="#2E7D32"
              />
              <StatCard
                icon={PoundSterling}
                label="Platform Revenue"
                value="£0"
                subtitle="This month"
                iconBgColor="#F0F0F0"
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
                icon={Store}
                label="Businesses"
                variant="primary"
                onPress={() => router.push('/(admin)/businesses')}
              />
              <QuickActionButton
                icon={Users}
                label="Customers"
                onPress={() => router.push('/(admin)/customers')}
              />
              <QuickActionButton
                icon={TrendingUp}
                label="Analytics"
                onPress={() => {/* TODO */}}
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
              <View
                width={48}
                height={48}
                borderRadius={24}
                backgroundColor="#F0F0F0"
                justifyContent="center"
                alignItems="center"
                marginBottom="$md"
              >
                <Clock size={24} color="#999999" />
              </View>
              <Text color="#999999" fontSize={14} textAlign="center">
                Activity feed coming soon
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
