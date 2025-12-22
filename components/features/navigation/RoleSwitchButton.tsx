import { Pressable } from 'react-native'
import { XStack, Text, View } from 'tamagui'
import { Store } from '@tamagui/lucide-icons'
import { router } from 'expo-router'
import { useAuthStore } from '../../../stores/auth'

/**
 * Floating action button that appears when a business owner or staff member
 * is in Customer Mode. Pressing it switches back to their native role.
 */
export function RoleSwitchButton() {
  const { user, activeRole, setActiveRole } = useAuthStore()

  // Only show when user is in a switched role
  const isInSwitchedRole = activeRole !== null && activeRole !== user?.userType
  const canSwitchBack = user?.userType === 'business_owner' || user?.userType === 'staff'

  if (!isInSwitchedRole || !canSwitchBack) {
    return null
  }

  const handleSwitchBack = () => {
    setActiveRole(null)
    // Navigate to the appropriate section based on actual user type
    if (user?.userType === 'business_owner') {
      router.replace('/(business)/')
    } else if (user?.userType === 'staff') {
      router.replace('/(staff)/')
    }
  }

  const label = user?.userType === 'business_owner' ? 'Business Mode' : 'Staff Mode'

  return (
    <Pressable
      onPress={handleSwitchBack}
      style={{
        position: 'absolute',
        bottom: 100, // Above tab bar (85px) + some spacing
        right: 16,
        zIndex: 1000,
      }}
    >
      <XStack
        backgroundColor="$primary"
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderRadius={24}
        alignItems="center"
        gap="$xs"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={4}
        elevation={5}
      >
        <View
          width={28}
          height={28}
          borderRadius={14}
          backgroundColor="$accent"
          justifyContent="center"
          alignItems="center"
        >
          <Store size={16} color="#1A3A35" />
        </View>
        <Text color="white" fontSize={14} fontWeight="600">
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
