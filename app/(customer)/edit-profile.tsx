import { useState } from 'react'
import { ScrollView, Alert, ActivityIndicator } from 'react-native'
import { YStack, XStack, Text, Input, Button, Avatar, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft, Camera } from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { pickImage, uploadProfilePicture } from '../../lib/supabase/storage'

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePickImage = async () => {
    try {
      setError('')
      const uri = await pickImage()
      if (!uri) return

      setUploading(true)
      const publicUrl = await uploadProfilePicture(user!.id, uri)
      setProfilePicture(publicUrl)
      setUploading(false)
    } catch (err) {
      setUploading(false)
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      setError(message)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setError('')
    setSaving(true)

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        profilePictureUrl: profilePicture,
      })
      router.back()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes'
      setError(message)
      setSaving(false)
    }
  }

  const hasChanges =
    name !== user?.name ||
    phone !== (user?.phone || '') ||
    profilePicture !== user?.profilePictureUrl

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1A3A35' }}>
        <XStack
          backgroundColor="#1A3A35"
          paddingVertical="$md"
          paddingHorizontal="$md"
          alignItems="center"
          justifyContent="space-between"
        >
          <Button
            size="$3"
            chromeless
            onPress={() => router.back()}
            icon={<ChevronLeft size={24} color="white" />}
          />
          <Text fontSize={18} fontWeight="600" color="$surface">
            Edit Profile
          </Text>
          <View width={40} />
        </XStack>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Picture */}
        <YStack alignItems="center" marginBottom="$xl">
          <View position="relative">
            <Avatar circular size="$10" backgroundColor="$secondary">
              {uploading ? (
                <View
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba(0,0,0,0.5)"
                  borderRadius={999}
                >
                  <ActivityIndicator color="white" />
                </View>
              ) : profilePicture ? (
                <Avatar.Image source={{ uri: profilePicture }} />
              ) : (
                <Avatar.Fallback>
                  <Text color="$primary" fontSize={36} fontWeight="600">
                    {name.charAt(0) || user?.name?.charAt(0) || '?'}
                  </Text>
                </Avatar.Fallback>
              )}
            </Avatar>
            <Button
              circular
              size="$3"
              backgroundColor="$accent"
              position="absolute"
              bottom={0}
              right={0}
              onPress={handlePickImage}
              disabled={uploading}
              icon={<Camera size={16} color="#1A3A35" />}
            />
          </View>
          <Text color="$textMuted" fontSize={14} marginTop="$md">
            Tap the camera icon to change your photo
          </Text>
        </YStack>

        {/* Form */}
        <YStack space="$md">
          <YStack space="$xs">
            <Text color="$text" fontSize={14} fontWeight="500">
              Name
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              backgroundColor="$surface"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$sm"
              padding="$md"
              fontSize={16}
              editable={!saving}
            />
          </YStack>

          <YStack space="$xs">
            <Text color="$text" fontSize={14} fontWeight="500">
              Phone (optional)
            </Text>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="07700 900000"
              keyboardType="phone-pad"
              backgroundColor="$surface"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$sm"
              padding="$md"
              fontSize={16}
              editable={!saving}
            />
          </YStack>

          <YStack space="$xs">
            <Text color="$text" fontSize={14} fontWeight="500">
              Email
            </Text>
            <Input
              value={user?.email || ''}
              editable={false}
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$sm"
              padding="$md"
              fontSize={16}
              color="$textMuted"
            />
            <Text color="$textLight" fontSize={12}>
              Email cannot be changed
            </Text>
          </YStack>

          {error ? (
            <YStack
              backgroundColor="rgba(229, 57, 53, 0.1)"
              padding="$md"
              borderRadius="$sm"
            >
              <Text color="$error" fontSize={14} textAlign="center">
                {error}
              </Text>
            </YStack>
          ) : null}

          <Button
            onPress={handleSave}
            disabled={saving || !hasChanges || uploading}
            backgroundColor={hasChanges ? '$accent' : '$backgroundHover'}
            pressStyle={{ backgroundColor: '$accentPress' }}
            borderRadius="$sm"
            height={50}
            marginTop="$lg"
            opacity={saving ? 0.7 : 1}
          >
            <Text
              color={hasChanges ? '$primary' : '$textMuted'}
              fontSize={16}
              fontWeight="600"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </View>
  )
}
