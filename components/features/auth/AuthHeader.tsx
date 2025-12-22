import { Pressable } from 'react-native'
import { XStack, YStack, View, Text } from 'tamagui'
import { ArrowLeft } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'

type AuthHeaderProps = {
  onBack?: () => void
  showBack?: boolean
  step?: number
  totalSteps?: number
  rightElement?: React.ReactNode
}

export function AuthHeader({
  onBack,
  showBack = true,
  step,
  totalSteps,
  rightElement,
}: AuthHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const showProgress = step !== undefined && totalSteps !== undefined

  return (
    <YStack gap="$md">
      <XStack justifyContent="space-between" alignItems="center" height={44}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={8}>
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="rgba(26, 58, 53, 0.08)"
              justifyContent="center"
              alignItems="center"
            >
              <ArrowLeft size={22} color="#1A3A35" />
            </View>
          </Pressable>
        ) : (
          <View width={40} />
        )}

        {showProgress && (
          <Text fontSize={14} color="$textMuted">
            Step {step} of {totalSteps}
          </Text>
        )}

        {rightElement ? rightElement : <View width={40} />}
      </XStack>

      {/* Progress bar */}
      {showProgress && (
        <View height={4} borderRadius={2} backgroundColor="$secondary">
          <View
            height={4}
            borderRadius={2}
            backgroundColor="$accent"
            width={`${(step / totalSteps) * 100}%`}
            animation="medium"
          />
        </View>
      )}
    </YStack>
  )
}
