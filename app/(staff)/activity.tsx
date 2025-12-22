import { YStack, H1, Paragraph, Text } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function StaffActivityScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$lg">
          <H1 color="$primary" fontSize={28} fontWeight="700">
            Activity
          </H1>
          <Paragraph color="$textMuted">
            Recent redemptions and stamp requests.
          </Paragraph>
        </YStack>

        {/* Empty state */}
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$xl"
        >
          <YStack
            backgroundColor="$secondary"
            padding="$xl"
            borderRadius="$lg"
            alignItems="center"
            maxWidth={300}
          >
            <Text fontSize={48} marginBottom="$md">
              🔔
            </Text>
            <Text
              color="$primary"
              fontSize={18}
              fontWeight="600"
              textAlign="center"
              marginBottom="$sm"
            >
              No recent activity
            </Text>
            <Paragraph color="$textMuted" textAlign="center" fontSize={14}>
              When customers redeem subscriptions or request stamps, you'll see them here.
            </Paragraph>
          </YStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
