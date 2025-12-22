import { ScrollView } from 'react-native'
import { YStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Store,
  CreditCard,
  Bell,
  Gift,
  Download,
  User,
  Users,
  HelpCircle,
  LogOut,
} from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { useBusinessStore } from '../../stores/business'
import { SettingsMenuItem, SettingsProfileCard } from '../../components/features/settings'

export default function BusinessSettingsScreen() {
  const { user, signOut, setActiveRole } = useAuthStore()
  const { business } = useBusinessStore()

  const handleSwitchToCustomerMode = () => {
    setActiveRole('customer')
    router.replace('/(customer)/')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(auth)/welcome')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$lg" gap="$lg">
          {/* Header */}
          <Text color="#1A3A35" fontSize={28} fontWeight="700">
            Settings
          </Text>

          {/* Business Profile Card */}
          <SettingsProfileCard
            name={business?.name || 'Your Business'}
            email={user?.email || 'Not signed in'}
            subtitle={business?.status === 'pending_approval' ? 'Pending approval' : undefined}
            avatarBgColor="#D4C8E8"
            onPress={() => {/* Navigate to business profile edit */}}
            showChevron
          />

          {/* Business Settings */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              BUSINESS
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={Store}
                label="Business Profile"
                description="Edit your business details"
                onPress={() => {/* Navigate to edit business */}}
              />
              <SettingsMenuItem
                icon={Users}
                label="Manage Staff"
                description="Invite and manage your team"
                onPress={() => router.push('/(business)/staff')}
              />
              <SettingsMenuItem
                icon={CreditCard}
                label="Stripe Account"
                description={business?.stripeOnboardingComplete ? 'Manage payments and payouts' : 'Connect to accept payments'}
                onPress={() => router.push('/(business)/stripe-onboarding')}
              />
              <SettingsMenuItem
                icon={Gift}
                label="Referral Programme"
                description="Invite customers, earn rewards"
                onPress={() => {/* Navigate to referrals */}}
              />
              <SettingsMenuItem
                icon={Download}
                label="Export Data"
                description="Download your business data"
                onPress={() => {/* Export data */}}
              />
            </YStack>
          </YStack>

          {/* General Settings */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              GENERAL
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={Bell}
                label="Notifications"
                description="Push and email preferences"
                onPress={() => {/* Navigate to notifications */}}
              />
              <SettingsMenuItem
                icon={HelpCircle}
                label="Help & Support"
                description="FAQs and contact us"
                onPress={() => {/* Navigate to help */}}
              />
            </YStack>
          </YStack>

          {/* Switch to Customer Mode */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              SWITCH MODE
            </Text>
            <SettingsMenuItem
              icon={User}
              label="Switch to Customer Mode"
              description="Browse and subscribe to other businesses"
              onPress={handleSwitchToCustomerMode}
              variant="highlight"
            />
          </YStack>

          {/* Sign Out */}
          <YStack marginTop="$md">
            <SettingsMenuItem
              icon={LogOut}
              label="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              showChevron={false}
              iconBgColor="rgba(229, 57, 53, 0.15)"
              iconColor="#E53935"
            />
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
