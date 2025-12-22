import { useEffect } from 'react'
import { ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Store, Check, X, Clock, Briefcase } from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { useBusinessStore, PendingInvitation } from '../../stores/business'

export default function StaffInvitationsScreen() {
  const { user } = useAuthStore()
  const { pendingInvitations, isLoading, fetchPendingInvitations, acceptInvitation, declineInvitation } =
    useBusinessStore()

  useEffect(() => {
    if (user?.email) {
      fetchPendingInvitations(user.email)
    }
  }, [user?.email])

  const handleAccept = async (invitation: PendingInvitation) => {
    if (!user) return

    Alert.alert(
      'Accept Invitation',
      `Join ${invitation.businessName} as ${invitation.role === 'manager' ? 'a Manager' : 'Staff'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await acceptInvitation(invitation.id, user.id)
              // If no more pending invitations, go to staff dashboard
              if (pendingInvitations.length <= 1) {
                router.replace('/(staff)/')
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to accept invitation. Please try again.')
            }
          },
        },
      ]
    )
  }

  const handleDecline = (invitation: PendingInvitation) => {
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation from ${invitation.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineInvitation(invitation.id)
            } catch (err) {
              Alert.alert('Error', 'Failed to decline invitation. Please try again.')
            }
          },
        },
      ]
    )
  }

  const handleSkip = () => {
    router.replace('/(staff)/')
  }

  if (isLoading && pendingInvitations.length === 0) {
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
          <Text color="#1A3A35" fontSize={26} fontWeight="700">
            Pending Invitations
          </Text>
          <Text color="#666666" fontSize={14} marginTop="$xs">
            You've been invited to join the following businesses
          </Text>
        </YStack>

        {pendingInvitations.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$xl">
            <View
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor="#D4C8E8"
              justifyContent="center"
              alignItems="center"
              marginBottom="$lg"
            >
              <Briefcase size={40} color="#1A3A35" />
            </View>
            <Text color="#1A3A35" fontSize={18} fontWeight="600" textAlign="center" marginBottom="$sm">
              No pending invitations
            </Text>
            <Text color="#666666" fontSize={14} textAlign="center" marginBottom="$lg">
              When a business invites you to join as staff, it will appear here.
            </Text>
            <Pressable onPress={() => router.replace('/(staff)/')}>
              <View
                backgroundColor="#1A3A35"
                paddingHorizontal="$xl"
                paddingVertical="$md"
                borderRadius={12}
              >
                <Text color="#FFFFFF" fontSize={15} fontWeight="600">
                  Go to Dashboard
                </Text>
              </View>
            </Pressable>
          </YStack>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <YStack gap="$md">
                {pendingInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={() => handleAccept(invitation)}
                    onDecline={() => handleDecline(invitation)}
                  />
                ))}
              </YStack>
            </ScrollView>

            {/* Skip button */}
            <Pressable onPress={handleSkip}>
              <XStack
                justifyContent="center"
                alignItems="center"
                paddingVertical="$md"
                marginTop="$md"
              >
                <Text color="#666666" fontSize={14}>
                  Skip for now
                </Text>
              </XStack>
            </Pressable>
          </>
        )}
      </YStack>
    </SafeAreaView>
  )
}

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
}: {
  invitation: PendingInvitation
  onAccept: () => void
  onDecline: () => void
}) {
  const formatBusinessType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <YStack
      backgroundColor="#FFFFFF"
      borderRadius={16}
      padding="$lg"
      borderWidth={1}
      borderColor="#E8E8E8"
    >
      {/* Business Info */}
      <XStack gap="$md" alignItems="center" marginBottom="$md">
        <View
          width={56}
          height={56}
          borderRadius={14}
          backgroundColor="#D4C8E8"
          justifyContent="center"
          alignItems="center"
        >
          <Store size={28} color="#1A3A35" />
        </View>
        <YStack flex={1}>
          <Text color="#1A3A35" fontSize={18} fontWeight="600">
            {invitation.businessName}
          </Text>
          <Text color="#666666" fontSize={13}>
            {formatBusinessType(invitation.businessType)}
          </Text>
        </YStack>
      </XStack>

      {/* Role Badge */}
      <XStack
        backgroundColor={invitation.role === 'manager' ? 'rgba(196, 229, 56, 0.2)' : '#F0F0F0'}
        borderRadius={8}
        padding="$sm"
        alignItems="center"
        gap="$xs"
        marginBottom="$md"
        alignSelf="flex-start"
      >
        <Briefcase size={14} color={invitation.role === 'manager' ? '#1A3A35' : '#666666'} />
        <Text
          color={invitation.role === 'manager' ? '#1A3A35' : '#666666'}
          fontSize={13}
          fontWeight="500"
          textTransform="capitalize"
        >
          {invitation.role}
        </Text>
      </XStack>

      {/* Invited date */}
      <XStack alignItems="center" gap="$xs" marginBottom="$lg">
        <Clock size={14} color="#999999" />
        <Text color="#999999" fontSize={12}>
          Invited {new Date(invitation.invitedAt).toLocaleDateString('en-GB')}
        </Text>
      </XStack>

      {/* Action Buttons */}
      <XStack gap="$sm">
        <Pressable onPress={onAccept} style={{ flex: 1 }}>
          <XStack
            backgroundColor="#C4E538"
            borderRadius={10}
            padding="$md"
            justifyContent="center"
            alignItems="center"
            gap="$xs"
          >
            <Check size={18} color="#1A3A35" />
            <Text color="#1A3A35" fontSize={15} fontWeight="600">
              Accept
            </Text>
          </XStack>
        </Pressable>
        <Pressable onPress={onDecline} style={{ flex: 1 }}>
          <XStack
            backgroundColor="#FFFFFF"
            borderRadius={10}
            padding="$md"
            justifyContent="center"
            alignItems="center"
            gap="$xs"
            borderWidth={1}
            borderColor="#E8E8E8"
          >
            <X size={18} color="#666666" />
            <Text color="#666666" fontSize={15} fontWeight="600">
              Decline
            </Text>
          </XStack>
        </Pressable>
      </XStack>
    </YStack>
  )
}
