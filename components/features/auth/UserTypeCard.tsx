import { Pressable } from 'react-native'
import { XStack, YStack, View, Text, styled } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'

const CardContainer = styled(XStack, {
  name: 'UserTypeCard',
  backgroundColor: '$surface',
  borderWidth: 2,
  borderColor: '$borderColor',
  borderRadius: '$md',
  padding: '$lg',
  gap: '$md',
  alignItems: 'center',

  variants: {
    selected: {
      true: {
        backgroundColor: '#D4C8E8',
        borderColor: '#D4C8E8',
      },
    },
  } as const,
})

type UserTypeCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onPress: () => void
}

export function UserTypeCard({
  icon,
  title,
  description,
  selected,
  onPress,
}: UserTypeCardProps) {
  return (
    <Pressable onPress={onPress}>
      <CardContainer selected={selected}>
        <View
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={selected ? '$accent' : '$secondary'}
          justifyContent="center"
          alignItems="center"
        >
          {icon}
        </View>

        <YStack flex={1}>
          <Text fontSize={16} fontWeight="600" color="#1A2E28">
            {title}
          </Text>
          <Text fontSize={14} color={selected ? '#1A2E28' : '$textMuted'}>
            {description}
          </Text>
        </YStack>

        {selected && (
          <View
            width={24}
            height={24}
            borderRadius={12}
            backgroundColor="$accent"
            justifyContent="center"
            alignItems="center"
          >
            <Check size={16} color="#1A3A35" />
          </View>
        )}
      </CardContainer>
    </Pressable>
  )
}
