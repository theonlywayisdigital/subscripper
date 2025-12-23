import { YStack, XStack, Text, View } from 'tamagui'
import { AnimatedIcon, type AnimatedIconName } from '../../ui'

interface StatCardProps {
  icon: AnimatedIconName
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconBgColor?: string
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  iconBgColor = '#D4C8E8',
}: StatCardProps) {
  return (
    <YStack
      flex={1}
      minWidth={150}
      backgroundColor="#FFFFFF"
      borderRadius={16}
      padding="$md"
      borderWidth={1}
      borderColor="#E8E8E8"
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$sm">
        <View
          width={44}
          height={44}
          borderRadius={12}
          backgroundColor={iconBgColor}
          justifyContent="center"
          alignItems="center"
        >
          <AnimatedIcon name={icon} size={28} loop={false} />
        </View>
        {trend && (
          <XStack
            backgroundColor={trend.isPositive ? 'rgba(196, 229, 56, 0.2)' : 'rgba(229, 57, 53, 0.1)'}
            paddingHorizontal="$xs"
            paddingVertical={2}
            borderRadius={4}
          >
            <Text
              color={trend.isPositive ? '#1A3A35' : '#E53935'}
              fontSize={12}
              fontWeight="600"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          </XStack>
        )}
      </XStack>
      <Text color="#1A3A35" fontSize={28} fontWeight="700" marginBottom={2}>
        {value}
      </Text>
      <Text color="#666666" fontSize={13}>
        {label}
      </Text>
      {subtitle && (
        <Text color="#999999" fontSize={11} marginTop={2}>
          {subtitle}
        </Text>
      )}
    </YStack>
  )
}
