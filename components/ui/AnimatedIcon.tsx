import { useRef, useEffect } from 'react'
import LottieView from 'lottie-react-native'
import { ViewStyle } from 'react-native'

// Icon name to source mapping
const iconSources = {
  accounting: require('../../assets/icons/accounting.json'),
  avatar: require('../../assets/icons/avatar.json'),
  bell: require('../../assets/icons/bell.json'),
  checkbox: require('../../assets/icons/checkbox.json'),
  'credit-card': require('../../assets/icons/credit-card.json'),
  customers: require('../../assets/icons/customers.json'),
  dashboard: require('../../assets/icons/dashboard.json'),
  download: require('../../assets/icons/download.json'),
  'gift-card': require('../../assets/icons/gift-card.json'),
  heart: require('../../assets/icons/heart.json'),
  hourglass: require('../../assets/icons/hourglass.json'),
  marketing: require('../../assets/icons/marketing.json'),
  'price-tag': require('../../assets/icons/price-tag.json'),
  'qr-code': require('../../assets/icons/qr-code.json'),
  settings: require('../../assets/icons/settings.json'),
  shop: require('../../assets/icons/shop.json'),
  support: require('../../assets/icons/support.json'),
  team: require('../../assets/icons/team.json'),
} as const

export type AnimatedIconName = keyof typeof iconSources

interface AnimatedIconProps {
  name: AnimatedIconName
  size?: number
  autoPlay?: boolean
  loop?: boolean
  speed?: number
  style?: ViewStyle
  onAnimationFinish?: () => void
}

export function AnimatedIcon({
  name,
  size = 32,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}: AnimatedIconProps) {
  const animationRef = useRef<LottieView>(null)

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play()
    }
  }, [autoPlay])

  return (
    <LottieView
      ref={animationRef}
      source={iconSources[name]}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={[{ width: size, height: size }, style]}
      onAnimationFinish={onAnimationFinish}
    />
  )
}

// Export for programmatic control
export { LottieView }
