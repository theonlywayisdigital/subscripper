import { ScrollView } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronRight } from '@tamagui/lucide-icons'

// Mock data for UI development
const MOCK_LOYALTY_CARDS = [
  {
    id: '1',
    businessName: 'Bean & Gone',
    reward: 'Buy 9 coffees, get 1 free',
    stampsRequired: 9,
    stampsCollected: 5,
    bgColor: '#D4C8E8',
  },
  {
    id: '2',
    businessName: 'Rise & Knead',
    reward: 'Buy 6 pastries, get 1 free',
    stampsRequired: 6,
    stampsCollected: 2,
    bgColor: '#E8F5E0',
  },
]

function StampCircle({
  filled,
  number,
  isFree
}: {
  filled: boolean
  number: number
  isFree: boolean
}) {
  if (isFree) {
    return (
      <View
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor="#C4E538"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={9} fontWeight="600" color="#1A3A35">
          FREE
        </Text>
      </View>
    )
  }

  return (
    <View
      width={36}
      height={36}
      borderRadius={18}
      backgroundColor={filled ? '#1A3A35' : 'rgba(26,58,53,0.3)'}
      justifyContent="center"
      alignItems="center"
    >
      {filled ? (
        <Text fontSize={14} color="#C4E538">
          ✓
        </Text>
      ) : (
        <Text fontSize={12} color="#1A3A35">
          {number}
        </Text>
      )}
    </View>
  )
}

function LoyaltyCard({ card }: { card: typeof MOCK_LOYALTY_CARDS[0] }) {
  // Generate stamp grid
  const totalSlots = card.stampsRequired + 1 // +1 for the FREE slot
  const stampsPerRow = 6

  const renderStamps = () => {
    const stamps = []
    for (let i = 1; i <= card.stampsRequired; i++) {
      stamps.push(
        <StampCircle
          key={i}
          filled={i <= card.stampsCollected}
          number={i}
          isFree={false}
        />
      )
    }
    // Add the FREE stamp
    stamps.push(
      <StampCircle
        key="free"
        filled={false}
        number={0}
        isFree={true}
      />
    )
    return stamps
  }

  return (
    <View
      backgroundColor={card.bgColor}
      borderRadius={20}
      padding="$lg"
      marginBottom="$lg"
    >
      {/* Header */}
      <YStack marginBottom="$lg">
        <Text fontSize={18} fontWeight="600" color="#1A3A35">
          {card.businessName}
        </Text>
        <Text fontSize={13} color="#1A3A35" marginTop={4}>
          {card.reward}
        </Text>
      </YStack>

      {/* Stamp grid */}
      <XStack flexWrap="wrap" gap="$sm" marginBottom="$md">
        {renderStamps()}
      </XStack>

      {/* Progress */}
      <Text fontSize={12} color="#1A3A35">
        {card.stampsCollected}/{card.stampsRequired}
      </Text>
    </View>
  )
}

function UpsellCard() {
  return (
    <View
      backgroundColor="#1A3A35"
      borderRadius={16}
      padding="$lg"
      marginBottom="$lg"
    >
      <Text fontSize={16} fontWeight="600" color="$surface" marginBottom="$xs">
        Save more with a subscription!
      </Text>
      <Text fontSize={13} color="rgba(255,255,255,0.7)" marginBottom="$xs">
        You've bought 18 coffees this month.
      </Text>
      <XStack alignItems="center">
        <Text fontSize={13} color="#C4E538">
          A subscription would save you £12
        </Text>
        <ChevronRight size={16} color="#C4E538" />
      </XStack>
    </View>
  )
}

export default function LoyaltyScreen() {
  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1A3A35' }}>
        <YStack
          backgroundColor="#1A3A35"
          paddingVertical="$lg"
          alignItems="center"
        >
          <Text fontSize={20} fontWeight="600" color="$surface">
            Loyalty Cards
          </Text>
        </YStack>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loyalty Cards */}
        {MOCK_LOYALTY_CARDS.map((card) => (
          <LoyaltyCard key={card.id} card={card} />
        ))}

        {/* Upsell */}
        <UpsellCard />
      </ScrollView>
    </View>
  )
}
