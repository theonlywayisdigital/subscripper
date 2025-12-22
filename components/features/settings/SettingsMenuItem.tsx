import { Pressable } from 'react-native'
import { XStack, YStack, Text, View } from 'tamagui'
import { ChevronRight } from '@tamagui/lucide-icons'
import type { LucideIcon } from '@tamagui/lucide-icons'

interface SettingsMenuItemProps {
  icon: LucideIcon
  label: string
  description?: string
  onPress?: () => void
  showChevron?: boolean
  iconColor?: string
  iconBgColor?: string
  variant?: 'default' | 'highlight' | 'danger'
}

export function SettingsMenuItem({
  icon: Icon,
  label,
  description,
  onPress,
  showChevron = true,
  iconColor = '#1A3A35',
  iconBgColor = '#F0F0F0',
  variant = 'default',
}: SettingsMenuItemProps) {
  const bgColor = variant === 'highlight' ? '#D4C8E8' : variant === 'danger' ? 'rgba(229, 57, 53, 0.1)' : '#FFFFFF'
  const textColor = variant === 'danger' ? '#E53935' : '#1A2E28'
  const finalIconBgColor = variant === 'highlight' ? '#C4E538' : iconBgColor

  return (
    <Pressable onPress={onPress}>
      <XStack
        backgroundColor={bgColor}
        borderRadius={12}
        padding="$md"
        alignItems="center"
        gap="$md"
        borderWidth={variant === 'default' ? 1 : 0}
        borderColor="#E8E8E8"
      >
        <View
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor={finalIconBgColor}
          justifyContent="center"
          alignItems="center"
        >
          <Icon size={20} color={iconColor} />
        </View>
        <YStack flex={1}>
          <Text color={textColor} fontSize={16} fontWeight="500">
            {label}
          </Text>
          {description && (
            <Text color="#666666" fontSize={13} marginTop={2}>
              {description}
            </Text>
          )}
        </YStack>
        {showChevron && <ChevronRight size={20} color="#999999" />}
      </XStack>
    </Pressable>
  )
}
