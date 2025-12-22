import { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native'
import { YStack, XStack, H1, H2, Paragraph, Text, Button, Card, Input } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UserPlus, Mail, Clock, CheckCircle, Trash2, X } from '@tamagui/lucide-icons'
import { useBusinessStore, BusinessStaff, StaffRole } from '../../stores/business'

export default function BusinessStaffScreen() {
  const { business, staff, isLoading, fetchStaff, inviteStaff, removeStaff } = useBusinessStore()
  const [refreshing, setRefreshing] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<StaffRole>('staff')
  const [inviteError, setInviteError] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (business) {
      fetchStaff(business.id)
    }
  }, [business])

  const onRefresh = async () => {
    if (!business) return
    setRefreshing(true)
    await fetchStaff(business.id)
    setRefreshing(false)
  }

  const handleInvite = async () => {
    if (!business) return

    setInviteError('')

    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address')
      return
    }

    setIsInviting(true)
    try {
      await inviteStaff(business.id, inviteEmail.trim(), inviteRole)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('staff')
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = (staffMember: BusinessStaff) => {
    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${staffMember.email} from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStaff(staffMember.id)
            } catch (err) {
              Alert.alert('Error', 'Failed to remove staff member')
            }
          },
        },
      ]
    )
  }

  const renderStaffCard = (staffMember: BusinessStaff) => (
    <Card
      key={staffMember.id}
      backgroundColor="$surface"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      marginBottom="$md"
      padding="$md"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$md" flex={1}>
          <XStack
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="$secondary"
            justifyContent="center"
            alignItems="center"
          >
            <Mail size={20} color="#1A3A35" />
          </XStack>
          <YStack flex={1}>
            <Text color="$primary" fontSize={15} fontWeight="600">
              {staffMember.email}
            </Text>
            <XStack alignItems="center" gap="$sm" marginTop="$xs">
              <XStack
                backgroundColor="$secondary"
                paddingHorizontal="$sm"
                paddingVertical={2}
                borderRadius="$sm"
              >
                <Text color="$primary" fontSize={11} fontWeight="500" textTransform="capitalize">
                  {staffMember.role}
                </Text>
              </XStack>
              {staffMember.acceptedAt ? (
                <XStack alignItems="center" gap={4}>
                  <CheckCircle size={12} color="#4CAF50" />
                  <Text color="#4CAF50" fontSize={11}>Accepted</Text>
                </XStack>
              ) : (
                <XStack alignItems="center" gap={4}>
                  <Clock size={12} color="#666" />
                  <Text color="$textMuted" fontSize={11}>Pending</Text>
                </XStack>
              )}
            </XStack>
          </YStack>
        </XStack>
        <Button
          size="$2"
          backgroundColor="transparent"
          borderRadius="$sm"
          padding="$sm"
          onPress={() => handleRemove(staffMember)}
        >
          <Trash2 size={18} color="#E53935" />
        </Button>
      </XStack>
    </Card>
  )

  if (!business) {
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
        <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$lg">
          <YStack flex={1}>
            <H1 color="$primary" fontSize={28} fontWeight="700">
              Staff
            </H1>
            <Paragraph color="$textMuted">
              Manage your team members.
            </Paragraph>
          </YStack>
          <Button
            backgroundColor="$accent"
            borderRadius="$sm"
            height={40}
            paddingHorizontal="$md"
            onPress={() => setShowInviteModal(true)}
          >
            <XStack alignItems="center" gap="$xs">
              <UserPlus size={18} color="#1A3A35" />
              <Text color="$primary" fontSize={14} fontWeight="600">
                Invite
              </Text>
            </XStack>
          </Button>
        </XStack>

        {/* Staff List */}
        {isLoading && staff.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1A3A35" />
          </YStack>
        ) : staff.length === 0 ? (
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
                👥
              </Text>
              <Text
                color="$primary"
                fontSize={18}
                fontWeight="600"
                textAlign="center"
                marginBottom="$sm"
              >
                No staff members yet
              </Text>
              <Paragraph color="$textMuted" textAlign="center" fontSize={14}>
                Invite your team so they can award loyalty stamps and view subscription redemptions.
              </Paragraph>
            </YStack>
          </YStack>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {staff.map(renderStaffCard)}
          </ScrollView>
        )}
      </YStack>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInviteModal(false)}
      >
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <YStack
            backgroundColor="$background"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            padding="$lg"
            paddingBottom="$xl"
          >
            {/* Modal Header */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$lg">
              <H2 color="$primary" fontSize={20} fontWeight="700">
                Invite Staff Member
              </H2>
              <Button
                size="$2"
                backgroundColor="transparent"
                borderRadius="$sm"
                onPress={() => setShowInviteModal(false)}
              >
                <X size={24} color="#666" />
              </Button>
            </XStack>

            {/* Email Input */}
            <YStack gap="$xs" marginBottom="$md">
              <Text color="$text" fontSize={14} fontWeight="500">
                Email address
              </Text>
              <Input
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="staff@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                backgroundColor="$surface"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$sm"
                padding="$md"
                fontSize={16}
              />
            </YStack>

            {/* Role Selection */}
            <YStack gap="$xs" marginBottom="$md">
              <Text color="$text" fontSize={14} fontWeight="500">
                Role
              </Text>
              <XStack gap="$sm">
                <Button
                  flex={1}
                  onPress={() => setInviteRole('staff')}
                  backgroundColor={inviteRole === 'staff' ? '$accent' : '$surface'}
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  height={44}
                >
                  <YStack alignItems="center">
                    <Text
                      color={inviteRole === 'staff' ? '$primary' : '$textMuted'}
                      fontSize={14}
                      fontWeight="600"
                    >
                      Staff
                    </Text>
                    <Text
                      color={inviteRole === 'staff' ? '$primary' : '$textLight'}
                      fontSize={11}
                    >
                      Award stamps
                    </Text>
                  </YStack>
                </Button>
                <Button
                  flex={1}
                  onPress={() => setInviteRole('manager')}
                  backgroundColor={inviteRole === 'manager' ? '$accent' : '$surface'}
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  height={44}
                >
                  <YStack alignItems="center">
                    <Text
                      color={inviteRole === 'manager' ? '$primary' : '$textMuted'}
                      fontSize={14}
                      fontWeight="600"
                    >
                      Manager
                    </Text>
                    <Text
                      color={inviteRole === 'manager' ? '$primary' : '$textLight'}
                      fontSize={11}
                    >
                      Full access
                    </Text>
                  </YStack>
                </Button>
              </XStack>
            </YStack>

            {/* Error */}
            {inviteError ? (
              <YStack
                backgroundColor="rgba(229, 57, 53, 0.1)"
                padding="$md"
                borderRadius="$sm"
                marginBottom="$md"
              >
                <Text color="$error" fontSize={14} textAlign="center">
                  {inviteError}
                </Text>
              </YStack>
            ) : null}

            {/* Info */}
            <YStack
              backgroundColor="$secondary"
              padding="$md"
              borderRadius="$sm"
              marginBottom="$lg"
            >
              <Text color="$textMuted" fontSize={13}>
                They'll receive an email invitation to join your team. Once they create an account or log in, they'll have access to your business.
              </Text>
            </YStack>

            {/* Submit Button */}
            <Button
              backgroundColor="$accent"
              borderRadius="$sm"
              height={50}
              onPress={handleInvite}
              disabled={isInviting}
              opacity={isInviting ? 0.7 : 1}
            >
              <Text color="$primary" fontSize={16} fontWeight="600">
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </Modal>
    </SafeAreaView>
  )
}
