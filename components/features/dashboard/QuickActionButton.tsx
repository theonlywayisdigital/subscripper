import { Pressable } from 'react-native'
import { YStack, Text, View } from 'tamagui'
import type { LucideIcon } from '@tamagui/lucide-icons'

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  onPress?: () => void
  variant?: 'default' | 'primary' | 'accent'
}

export function QuickActionButton({
  icon: Icon,
  label,
  onPress,
  variant = 'default',
}: QuickActionButtonProps) {
  const bgColor = variant === 'primary' ? '#1A3A35' : variant === 'accent' ? '#C4E538' : '#FFFFFF'
  const iconBgColor = variant === 'primary' ? 'rgba(255,255,255,0.15)' : variant === 'accent' ? 'rgba(26,58,53,0.1)' : '#F0F0F0'
  const iconColor = variant === 'primary' ? '#FFFFFF' : '#1A3A35'
  const textColor = variant === 'primary' ? '#FFFFFF' : '#1A3A35'

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <YStack
        backgroundColor={bgColor}
        borderRadius={16}
        padding="$md"
        alignItems="center"
        justifyContent="center"
        minHeight={100}
        borderWidth={variant === 'default' ? 1 : 0}
        borderColor="#E8E8E8"
      >
        <View
          width={44}
          height={44}
          borderRadius={22}
          backgroundColor={iconBgColor}
          justifyContent="center"
          alignItems="center"
          marginBottom="$sm"
        >
          <Icon size={22} color={iconColor} />
        </View>
        <Text color={textColor} fontSize={13} fontWeight="500" textAlign="center">
          {label}
        </Text>
      </YStack>
    </Pressable>
  )
}
