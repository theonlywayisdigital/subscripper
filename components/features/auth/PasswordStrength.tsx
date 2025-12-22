import { XStack, YStack, View, Text } from 'tamagui'

type PasswordStrengthProps = {
  password: string
}

function calculateStrength(password: string): number {
  if (!password) return 0

  let score = 0

  // Length checks
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety checks
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Normalize to 0-4 scale
  if (score <= 2) return 1
  if (score <= 4) return 2
  if (score <= 5) return 3
  return 4
}

const STRENGTH_CONFIG = [
  { label: 'Very weak', color: '#E53935' },
  { label: 'Weak', color: '#FF9800' },
  { label: 'Fair', color: '#FFC107' },
  { label: 'Good', color: '#8BC34A' },
  { label: 'Strong', color: '#4CAF50' },
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = calculateStrength(password)
  const config = STRENGTH_CONFIG[strength]

  if (!password) return null

  return (
    <YStack gap="$xs" marginTop="$xs">
      <XStack gap="$xs">
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            flex={1}
            height={4}
            borderRadius={2}
            backgroundColor={level <= strength ? config.color : '$secondary'}
            animation="fast"
          />
        ))}
      </XStack>
      <Text fontSize={12} color={config.color}>
        Password strength: {config.label}
      </Text>
    </YStack>
  )
}
