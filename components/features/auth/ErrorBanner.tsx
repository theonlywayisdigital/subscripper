import { Pressable } from 'react-native'
import { XStack, Text, styled } from 'tamagui'
import { AlertCircle, X } from '@tamagui/lucide-icons'

const BannerContainer = styled(XStack, {
  name: 'ErrorBanner',
  backgroundColor: 'rgba(229, 57, 53, 0.1)',
  borderWidth: 1,
  borderColor: '$error',
  borderRadius: '$sm',
  padding: '$md',
  gap: '$sm',
  alignItems: 'center',
})

type ErrorBannerProps = {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null

  return (
    <BannerContainer>
      <AlertCircle size={20} color="#E53935" />
      <Text flex={1} color="$error" fontSize={14}>
        {message}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <X size={16} color="#E53935" />
        </Pressable>
      )}
    </BannerContainer>
  )
}
