import { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, Alert, ActivityIndicator, Pressable } from 'react-native'
import { YStack, XStack, Text, Input, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Check,
  X,
  Clock,
  Store,
  MapPin,
  Mail,
  Phone,
  Search,
  ChevronRight,
} from '@tamagui/lucide-icons'
import { useAdminStore, Business, BusinessStatus } from '../../stores/admin'
import { useAuthStore } from '../../stores/auth'

const STATUS_FILTERS: { value: BusinessStatus | 'all'; label: string }[] = [
  { value: 'pending_approval', label: 'Pending' },
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminBusinessesScreen() {
  const { user } = useAuthStore()
  const {
    businesses,
    pendingBusinesses,
    isLoading,
    fetchBusinesses,
    fetchPendingBusinesses,
    approveBusiness,
    rejectBusiness,
  } = useAdminStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | 'all'>('pending_approval')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    if (statusFilter === 'pending_approval') {
      await fetchPendingBusinesses()
    } else if (statusFilter === 'all') {
      await fetchBusinesses()
    } else {
      await fetchBusinesses(statusFilter)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleApprove = (business: Business) => {
    Alert.alert(
      'Approve Business',
      `Are you sure you want to approve "${business.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            if (user) {
              try {
                await approveBusiness(business.id, user.id)
              } catch (err) {
                Alert.alert('Error', 'Failed to approve business')
              }
            }
          },
        },
      ]
    )
  }

  const handleReject = (business: Business) => {
    Alert.prompt(
      'Reject Business',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (reason) {
              try {
                await rejectBusiness(business.id, reason)
              } catch (err) {
                Alert.alert('Error', 'Failed to reject business')
              }
            }
          },
        },
      ],
      'plain-text'
    )
  }

  const displayBusinesses = statusFilter === 'pending_approval' ? pendingBusinesses : businesses
  const filteredBusinesses = displayBusinesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$md">
          <Text color="#1A3A35" fontSize={26} fontWeight="700">
            Businesses
          </Text>
          <Text color="#666666" fontSize={14}>
            Review and manage business applications
          </Text>
        </YStack>

        {/* Search */}
        <XStack
          backgroundColor="#FFFFFF"
          borderRadius={12}
          paddingHorizontal="$md"
          alignItems="center"
          borderWidth={1}
          borderColor="#E8E8E8"
          marginBottom="$md"
        >
          <Search size={20} color="#999999" />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email..."
            backgroundColor="transparent"
            borderWidth={0}
            padding="$md"
            paddingLeft="$sm"
            fontSize={15}
            flex={1}
            placeholderTextColor="#999999"
          />
        </XStack>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16, flexGrow: 0 }}
        >
          <XStack gap="$xs">
            {STATUS_FILTERS.map(({ value, label }) => (
              <Pressable key={value} onPress={() => setStatusFilter(value)}>
                <View
                  backgroundColor={statusFilter === value ? '#1A3A35' : '#FFFFFF'}
                  borderRadius={20}
                  paddingHorizontal="$md"
                  paddingVertical="$sm"
                  borderWidth={1}
                  borderColor={statusFilter === value ? '#1A3A35' : '#E8E8E8'}
                >
                  <Text
                    color={statusFilter === value ? '#FFFFFF' : '#666666'}
                    fontSize={13}
                    fontWeight="500"
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </XStack>
        </ScrollView>

        {/* Business List */}
        {isLoading && !refreshing ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1A3A35" />
          </YStack>
        ) : filteredBusinesses.length === 0 ? (
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
              <Clock size={40} color="#1A3A35" />
            </View>
            <Text color="#1A3A35" fontSize={18} fontWeight="600" textAlign="center" marginBottom="$sm">
              {statusFilter === 'pending_approval' ? 'No pending applications' : 'No businesses found'}
            </Text>
            <Text color="#666666" fontSize={14} textAlign="center">
              {statusFilter === 'pending_approval'
                ? "You're all caught up! New applications will appear here."
                : 'Try adjusting your filters or search.'}
            </Text>
          </YStack>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A3A35" />
            }
          >
            <YStack gap="$sm">
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onApprove={() => handleApprove(business)}
                  onReject={() => handleReject(business)}
                />
              ))}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  )
}

function BusinessCard({
  business,
  onApprove,
  onReject,
}: {
  business: Business
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <YStack
      backgroundColor="#FFFFFF"
      borderRadius={16}
      padding="$md"
      borderWidth={1}
      borderColor="#E8E8E8"
    >
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$sm">
        <XStack gap="$md" flex={1} alignItems="center">
          <View
            width={48}
            height={48}
            borderRadius={12}
            backgroundColor="#D4C8E8"
            justifyContent="center"
            alignItems="center"
          >
            <Store size={24} color="#1A3A35" />
          </View>
          <YStack flex={1}>
            <Text color="#1A3A35" fontSize={16} fontWeight="600">
              {business.name}
            </Text>
            <Text color="#666666" fontSize={13} textTransform="capitalize">
              {business.type.replace(/_/g, ' ')}
            </Text>
          </YStack>
        </XStack>
        <StatusBadge status={business.status} />
      </XStack>

      {/* Details */}
      <YStack gap="$xs" marginBottom="$sm">
        {business.address && (
          <XStack alignItems="center" gap="$xs">
            <MapPin size={14} color="#999999" />
            <Text color="#666666" fontSize={13} flex={1} numberOfLines={1}>
              {business.address}
            </Text>
          </XStack>
        )}
        {business.email && (
          <XStack alignItems="center" gap="$xs">
            <Mail size={14} color="#999999" />
            <Text color="#666666" fontSize={13}>
              {business.email}
            </Text>
          </XStack>
        )}
        {business.phone && (
          <XStack alignItems="center" gap="$xs">
            <Phone size={14} color="#999999" />
            <Text color="#666666" fontSize={13}>
              {business.phone}
            </Text>
          </XStack>
        )}
      </YStack>

      {business.description && (
        <Text color="#666666" fontSize={13} numberOfLines={2} marginBottom="$sm">
          {business.description}
        </Text>
      )}

      {/* Actions for pending */}
      {business.status === 'pending_approval' && (
        <XStack gap="$sm" marginTop="$xs">
          <Pressable onPress={onApprove} style={{ flex: 1 }}>
            <XStack
              backgroundColor="#C4E538"
              borderRadius={10}
              padding="$sm"
              justifyContent="center"
              alignItems="center"
              gap="$xs"
            >
              <Check size={18} color="#1A3A35" />
              <Text color="#1A3A35" fontSize={14} fontWeight="600">
                Approve
              </Text>
            </XStack>
          </Pressable>
          <Pressable onPress={onReject} style={{ flex: 1 }}>
            <XStack
              backgroundColor="#FFFFFF"
              borderRadius={10}
              padding="$sm"
              justifyContent="center"
              alignItems="center"
              gap="$xs"
              borderWidth={1}
              borderColor="#E53935"
            >
              <X size={18} color="#E53935" />
              <Text color="#E53935" fontSize={14} fontWeight="600">
                Reject
              </Text>
            </XStack>
          </Pressable>
        </XStack>
      )}

      {/* Footer */}
      <XStack justifyContent="space-between" alignItems="center" marginTop="$sm">
        <Text color="#999999" fontSize={11}>
          Submitted {new Date(business.createdAt).toLocaleDateString('en-GB')}
        </Text>
        {business.status !== 'pending_approval' && (
          <XStack alignItems="center" gap="$xs">
            <Text color="#999999" fontSize={11}>
              View details
            </Text>
            <ChevronRight size={14} color="#999999" />
          </XStack>
        )}
      </XStack>
    </YStack>
  )
}

function StatusBadge({ status }: { status: BusinessStatus }) {
  const config: Record<BusinessStatus, { bg: string; color: string; label: string }> = {
    pending_approval: { bg: 'rgba(196, 229, 56, 0.2)', color: '#1A3A35', label: 'Pending' },
    approved: { bg: 'rgba(196, 229, 56, 0.3)', color: '#1A3A35', label: 'Approved' },
    active: { bg: 'rgba(76, 175, 80, 0.2)', color: '#2E7D32', label: 'Active' },
    suspended: { bg: 'rgba(255, 152, 0, 0.2)', color: '#E65100', label: 'Suspended' },
    rejected: { bg: 'rgba(229, 57, 53, 0.2)', color: '#C62828', label: 'Rejected' },
  }

  const { bg, color, label } = config[status]

  return (
    <View backgroundColor={bg} paddingHorizontal="$sm" paddingVertical={4} borderRadius={6}>
      <Text color={color} fontSize={11} fontWeight="600">
        {label}
      </Text>
    </View>
  )
}
