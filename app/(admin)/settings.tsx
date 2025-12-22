import { useState } from 'react'
import { ScrollView } from 'react-native'
import { YStack, Text } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  User,
  Bell,
  Settings,
  Tags,
  Star,
  Users,
  Shield,
  LogOut,
} from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { SettingsMenuItem, SettingsProfileCard } from '../../components/features/settings'

export default function AdminSettingsScreen() {
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
            Admin Settings
          </Text>

          {/* Profile Card */}
          <SettingsProfileCard
            name={user?.name || 'Admin'}
            email={user?.email || 'admin@subscripper.com'}
            subtitle="Administrator"
            avatarBgColor="#1A3A35"
          />

          {/* Platform Settings */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              PLATFORM
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={Settings}
                label="Platform Fee Settings"
                description="Commission rates and fees"
                onPress={() => {/* Navigate to fee settings */}}
              />
              <SettingsMenuItem
                icon={Tags}
                label="Business Categories"
                description="Manage available categories"
                onPress={() => {/* Navigate to categories */}}
              />
              <SettingsMenuItem
                icon={Star}
                label="Featured Businesses"
                description="Curate homepage features"
                onPress={() => {/* Navigate to featured */}}
              />
            </YStack>
          </YStack>

          {/* User Management */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              USER MANAGEMENT
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={Users}
                label="Admin Users"
                description="Manage admin accounts"
                onPress={() => {/* Navigate to admin users */}}
              />
              <SettingsMenuItem
                icon={Shield}
                label="Permissions"
                description="Role-based access control"
                onPress={() => {/* Navigate to permissions */}}
              />
            </YStack>
          </YStack>

          {/* Account Settings */}
          <YStack gap="$xs">
            <Text color="#666666" fontSize={13} fontWeight="500" marginBottom="$xs" marginLeft="$xs">
              ACCOUNT
            </Text>
            <YStack gap="$sm">
              <SettingsMenuItem
                icon={User}
                label="Edit Profile"
                description="Your admin profile"
                onPress={() => {/* Navigate to edit profile */}}
              />
              <SettingsMenuItem
                icon={Bell}
                label="Notifications"
                description="Alert preferences"
                onPress={() => {/* Navigate to notifications */}}
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
