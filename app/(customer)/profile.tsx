import { useState } from 'react'
import { ScrollView } from 'react-native'
import { YStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  User,
  Bell,
  CreditCard,
  HelpCircle,
  FileText,
  LogOut,
} from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { SettingsMenuItem, SettingsProfileCard } from '../../components/features/settings'

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.replace('/(auth)/welcome')
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$lg" gap="$lg">
          {/* Header */}
          <Text color="#1A3A35" fontSize={28} fontWeight="700">
            Profile
          </Text>

          {/* Profile Card */}
          <SettingsProfileCard
            name={user?.name || 'Guest User'}
            email={user?.email || 'Not signed in'}
            avatarUrl={user?.profilePictureUrl}
            avatarBgColor="#D4C8E8"
            onPress={() => router.push('/(customer)/edit-profile')}
            showChevron
          />

          {/* Account Settings */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              ACCOUNT
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={User}
                label="Edit Profile"
                description="Name, phone, profile picture"
                onPress={() => router.push('/(customer)/edit-profile')}
              />
              <SettingsMenuItem
                icon={CreditCard}
                label="Payment Methods"
                description="Manage your saved cards"
                onPress={() => {/* Navigate to payment methods */}}
              />
              <SettingsMenuItem
                icon={Bell}
                label="Notifications"
                description="Push and email preferences"
                onPress={() => {/* Navigate to notifications */}}
              />
            </YStack>
          </YStack>

          {/* Support */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              SUPPORT
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={HelpCircle}
                label="Help & Support"
                description="FAQs and contact us"
                onPress={() => {/* Navigate to help */}}
              />
              <SettingsMenuItem
                icon={FileText}
                label="Terms & Privacy"
                description="Legal information"
                onPress={() => {/* Navigate to legal */}}
              />
            </YStack>
          </YStack>

          {/* Sign Out */}
          <YStack marginTop="$md">
            <SettingsMenuItem
              icon={LogOut}
              label={signingOut ? 'Signing out...' : 'Sign Out'}
              onPress={signingOut ? undefined : handleSignOut}
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
