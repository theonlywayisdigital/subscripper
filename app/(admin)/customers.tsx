import { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native'
import { YStack, XStack, Text, Input, View, Image } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
} from '@tamagui/lucide-icons'
import { useAdminStore, Customer } from '../../stores/admin'

export default function AdminCustomersScreen() {
  const { customers, isLoading, fetchCustomers } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchCustomers()
    setRefreshing(false)
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$md">
          <Text color="#1A3A35" fontSize={26} fontWeight="700">
            Customers
          </Text>
          <Text color="#666666" fontSize={14}>
            View and manage customer accounts
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

        {/* Stats bar */}
        <XStack
          backgroundColor="#FFFFFF"
          borderRadius={12}
          padding="$md"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="#E8E8E8"
          marginBottom="$md"
          gap="$xs"
        >
          <Users size={16} color="#666666" />
          <Text color="#666666" fontSize={14}>
            {customers.length} total customer{customers.length !== 1 ? 's' : ''}
          </Text>
        </XStack>

        {/* Customer List */}
        {isLoading && !refreshing ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1A3A35" />
          </YStack>
        ) : filteredCustomers.length === 0 ? (
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
              <Users size={40} color="#1A3A35" />
            </View>
            <Text color="#1A3A35" fontSize={18} fontWeight="600" textAlign="center" marginBottom="$sm">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            <Text color="#666666" fontSize={14} textAlign="center">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'When customers sign up, they will appear here.'}
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
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  )
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Pressable>
      <XStack
        backgroundColor="#FFFFFF"
        borderRadius={16}
        padding="$md"
        borderWidth={1}
        borderColor="#E8E8E8"
        alignItems="center"
        gap="$md"
      >
        {/* Avatar */}
        {customer.profilePictureUrl ? (
          <Image
            source={{ uri: customer.profilePictureUrl }}
            width={52}
            height={52}
            borderRadius={26}
          />
        ) : (
          <View
            width={52}
            height={52}
            borderRadius={26}
            backgroundColor="#D4C8E8"
            justifyContent="center"
            alignItems="center"
          >
            <Text color="#1A3A35" fontSize={20} fontWeight="600">
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Info */}
        <YStack flex={1} gap={2}>
          <Text color="#1A3A35" fontSize={16} fontWeight="600">
            {customer.name}
          </Text>
          <XStack alignItems="center" gap="$xs">
            <Mail size={12} color="#999999" />
            <Text color="#666666" fontSize={13} numberOfLines={1}>
              {customer.email}
            </Text>
          </XStack>
          {customer.phone && (
            <XStack alignItems="center" gap="$xs">
              <Phone size={12} color="#999999" />
              <Text color="#666666" fontSize={13}>
                {customer.phone}
              </Text>
            </XStack>
          )}
          <XStack alignItems="center" gap="$xs">
            <Calendar size={12} color="#999999" />
            <Text color="#999999" fontSize={11}>
              Joined {new Date(customer.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </XStack>
        </YStack>

        {/* Chevron */}
        <ChevronRight size={18} color="#999999" />
      </XStack>
    </Pressable>
  )
}
