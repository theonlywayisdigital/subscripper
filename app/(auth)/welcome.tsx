import { YStack, Text, View, styled } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import { Pressable } from 'react-native'

const PrimaryButton = styled(View, {
  name: 'PrimaryButton',
  backgroundColor: '$accent',
  borderRadius: '$sm',
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
})

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View flex={1}>
      {/* Hero section with flat deep green */}
      <View style={{ flex: 0.55, backgroundColor: '#1A3A35' }}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text
              color="rgba(255, 255, 255, 0.8)"
              fontSize={16}
              textAlign="center"
            >
              Support local. Save daily.
            </Text>
          </YStack>
        </SafeAreaView>
      </View>

      {/* Content card */}
      <YStack
        flex={0.45}
        backgroundColor="$background"
        borderTopLeftRadius={32}
        borderTopRightRadius={32}
        marginTop={-32}
        padding="$xl"
        justifyContent="space-between"
      >
        {/* Brand and tagline */}
        <YStack alignItems="center" gap="$sm" paddingTop="$lg">
          <Text
            fontSize={36}
            fontWeight="700"
            color="$primary"
          >
            Subscripper
          </Text>
          <Text
            fontSize={16}
            color="$textMuted"
            textAlign="center"
            paddingHorizontal="$lg"
          >
            Your favourite local spots, on repeat. Subscribe to coffee, bakery, and more.
          </Text>
        </YStack>

        {/* CTAs */}
        <YStack gap="$md" paddingBottom="$lg">
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <PrimaryButton>
              <Text color="$primary" fontSize={16} fontWeight="600">
                Get Started
              </Text>
            </PrimaryButton>
          </Pressable>

          <Link href="/(auth)/login" asChild>
            <Pressable>
              <YStack alignItems="center" padding="$md">
                <Text color="$textMuted" fontSize={15}>
                  Already have an account?{' '}
                  <Text color="$accent" fontWeight="600">
                    Sign in
                  </Text>
                </Text>
              </YStack>
            </Pressable>
          </Link>
        </YStack>
      </YStack>
    </View>
  )
}
