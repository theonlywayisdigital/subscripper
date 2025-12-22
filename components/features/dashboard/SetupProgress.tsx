import { Pressable } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { Check, ChevronRight } from '@tamagui/lucide-icons'
import type { LucideIcon } from '@tamagui/lucide-icons'

interface SetupStep {
  icon: LucideIcon
  label: string
  description: string
  completed: boolean
  onPress?: () => void
}

interface SetupProgressProps {
  title: string
  steps: SetupStep[]
  completedCount: number
  totalCount: number
}

export function SetupProgress({ title, steps, completedCount, totalCount }: SetupProgressProps) {
  const progressPercent = (completedCount / totalCount) * 100

  return (
    <YStack backgroundColor="#FFFFFF" borderRadius={16} padding="$lg" borderWidth={1} borderColor="#E8E8E8">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$md">
        <Text color="#1A3A35" fontSize={18} fontWeight="600">
          {title}
        </Text>
        <Text color="#666666" fontSize={14}>
          {completedCount}/{totalCount}
        </Text>
      </XStack>

      {/* Progress Bar */}
      <View
        height={6}
        backgroundColor="#F0F0F0"
        borderRadius={3}
        marginBottom="$lg"
        overflow="hidden"
      >
        <View
          height={6}
          backgroundColor="#C4E538"
          borderRadius={3}
          width={`${progressPercent}%`}
        />
      </View>

      {/* Steps */}
      <YStack gap="$sm">
        {steps.map((step, index) => (
          <Pressable key={index} onPress={step.onPress} disabled={step.completed}>
            <XStack
              backgroundColor={step.completed ? 'rgba(196, 229, 56, 0.1)' : '#F9FAF9'}
              borderRadius={12}
              padding="$md"
              alignItems="center"
              gap="$md"
              opacity={step.completed ? 0.8 : 1}
            >
              <View
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={step.completed ? '#C4E538' : '#E8E8E8'}
                justifyContent="center"
                alignItems="center"
              >
                {step.completed ? (
                  <Check size={18} color="#1A3A35" />
                ) : (
                  <step.icon size={18} color="#666666" />
                )}
              </View>
              <YStack flex={1}>
                <Text
                  color={step.completed ? '#666666' : '#1A3A35'}
                  fontSize={15}
                  fontWeight="500"
                  textDecorationLine={step.completed ? 'line-through' : 'none'}
                >
                  {step.label}
                </Text>
                <Text color="#999999" fontSize={12}>
                  {step.description}
                </Text>
              </YStack>
              {!step.completed && <ChevronRight size={18} color="#999999" />}
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </YStack>
  )
}
