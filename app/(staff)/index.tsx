import { useEffect, useState } from 'react'
import { YStack, H1, Paragraph, Text, Button, Input, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { QrCode } from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { useBusinessStore } from '../../stores/business'

export default function StaffStampsScreen() {
  const { user } = useAuthStore()
  const { pendingInvitations, fetchPendingInvitations } = useBusinessStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [checkingInvitations, setCheckingInvitations] = useState(true)

  useEffect(() => {
    const checkInvitations = async () => {
      if (user?.email) {
        await fetchPendingInvitations(user.email)
        setCheckingInvitations(false)
      }
    }
    checkInvitations()
  }, [user?.email])

  // Redirect to invitations if there are pending ones
  useEffect(() => {
    if (!checkingInvitations && pendingInvitations.length > 0) {
      router.replace('/(staff)/invitations')
    }
  }, [checkingInvitations, pendingInvitations.length])

  // Show loading while checking invitations
  if (checkingInvitations) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="#F9FAF9">
        <ActivityIndicator size="large" color="#1A3A35" />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$lg">
          <H1 color="$primary" fontSize={28} fontWeight="700">
            Award Stamps
          </H1>
          <Paragraph color="$textMuted">
            Scan customer QR or search by phone.
          </Paragraph>
        </YStack>

        {/* Search */}
        <YStack space="$md" marginBottom="$lg">
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by phone number..."
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            padding="$md"
            fontSize={16}
          />
          <Button
            backgroundColor="$accent"
            borderRadius="$sm"
            height={56}
            icon={<QrCode size={24} color="#1A3A35" />}
          >
            <Text color="$primary" fontSize={16} fontWeight="600">
              Scan Customer QR Code
            </Text>
          </Button>
        </YStack>

        {/* Empty state */}
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
              ✨
            </Text>
            <Text
              color="$primary"
              fontSize={18}
              fontWeight="600"
              textAlign="center"
              marginBottom="$sm"
            >
              Ready to award stamps
            </Text>
            <Paragraph color="$textMuted" textAlign="center" fontSize={14}>
              Scan a customer's QR code or search by their phone number to award loyalty stamps.
            </Paragraph>
          </YStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
