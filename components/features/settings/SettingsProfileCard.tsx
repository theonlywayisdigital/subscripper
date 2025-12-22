import { Pressable } from 'react-native'
import { XStack, YStack, Text, Avatar, View } from 'tamagui'
import { ChevronRight } from '@tamagui/lucide-icons'

interface SettingsProfileCardProps {
  name: string
  email: string
  avatarUrl?: string
  subtitle?: string
  onPress?: () => void
  showChevron?: boolean
  avatarBgColor?: string
}

export function SettingsProfileCard({
  name,
  email,
  avatarUrl,
  subtitle,
  onPress,
  showChevron = false,
  avatarBgColor = '#D4C8E8',
}: SettingsProfileCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const content = (
    <XStack
      backgroundColor="#FFFFFF"
      borderRadius={16}
      padding="$lg"
      alignItems="center"
      gap="$md"
      borderWidth={1}
      borderColor="#E8E8E8"
    >
      <Avatar circular size="$5" backgroundColor={avatarBgColor}>
        {avatarUrl ? (
          <Avatar.Image source={{ uri: avatarUrl }} />
        ) : (
          <Avatar.Fallback>
            <Text color="#1A3A35" fontSize={18} fontWeight="600">
              {initials || '?'}
            </Text>
          </Avatar.Fallback>
        )}
      </Avatar>
      <YStack flex={1}>
        <Text color="#1A2E28" fontSize={18} fontWeight="600">
          {name}
        </Text>
        <Text color="#666666" fontSize={14}>
          {email}
        </Text>
        {subtitle && (
          <Text color="#999999" fontSize={12} marginTop={2}>
            {subtitle}
          </Text>
        )}
      </YStack>
      {showChevron && <ChevronRight size={20} color="#999999" />}
    </XStack>
  )

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>
  }

  return content
}
