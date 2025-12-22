import { YStack, H1, Paragraph, Text, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus } from '@tamagui/lucide-icons'

export default function BusinessLoyaltyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <YStack marginBottom="$lg">
          <H1 color="$primary" fontSize={28} fontWeight="700">
            Loyalty Cards
          </H1>
          <Paragraph color="$textMuted">
            Create stamp cards to reward your regulars.
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
              💳
            </Text>
            <Text
              color="$primary"
              fontSize={18}
              fontWeight="600"
              textAlign="center"
              marginBottom="$sm"
            >
              No loyalty cards yet
            </Text>
            <Paragraph color="$textMuted" textAlign="center" fontSize={14} marginBottom="$lg">
              Create a loyalty card to start building customer relationships. Free for up to 50 active holders!
            </Paragraph>
            <Button
              backgroundColor="$accent"
              borderRadius="$sm"
              icon={<Plus size={20} color="#1A3A35" />}
            >
              <Text color="$primary" fontWeight="600">
                Create Card
              </Text>
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
