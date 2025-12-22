import { Tabs } from 'expo-router'
import { View } from 'tamagui'
import { Home, CreditCard, Heart, User } from '@tamagui/lucide-icons'
import { RoleSwitchButton } from '../../components/features/navigation/RoleSwitchButton'

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: typeof Home
  color: string
  focused: boolean
}) {
  return (
    <View alignItems="center">
      {/* Active indicator dot */}
      <View
        width={6}
        height={6}
        borderRadius={3}
        backgroundColor={focused ? '#C4E538' : 'transparent'}
        marginBottom={4}
      />
      <Icon color={focused ? '#1A3A35' : color} size={22} />
    </View>
  )
}

export default function CustomerLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1A3A35',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E8E8E8',
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 25,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            title: 'Subscriptions',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={CreditCard} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="loyalty"
          options={{
            title: 'Loyalty',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Heart} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
        {/* Hidden screens (not shown in tab bar) */}
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null, // Hides from tab bar
          }}
        />
        <Tabs.Screen
          name="business/[id]"
          options={{
            href: null, // Hides from tab bar
          }}
        />
        <Tabs.Screen
          name="subscription/[id]"
          options={{
            href: null, // Hides from tab bar
          }}
        />
        <Tabs.Screen
          name="checkout"
          options={{
            href: null, // Hides from tab bar
          }}
        />
      </Tabs>
      {/* FAB for switching back to Business/Staff mode */}
      <RoleSwitchButton />
    </>
  )
}
