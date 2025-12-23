import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { AnimatedIcon, type AnimatedIconName } from '../../components/ui'

function TabIcon({ name, focused }: { name: AnimatedIconName; focused: boolean }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }}>
      <AnimatedIcon
        name={name}
        size={28}
        autoPlay={focused}
        loop={focused}
        speed={0.8}
      />
    </View>
  )
}

export default function BusinessLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C4E538',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#D4C8E8',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ focused }) => <TabIcon name="credit-card" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: 'Loyalty',
          tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
      {/* Hidden screens - accessed via Settings */}
      <Tabs.Screen
        name="staff"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="stripe-onboarding"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
