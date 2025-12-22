import { createAnimations } from '@tamagui/animations-css'
import { createTamagui, createTokens } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes as defaultThemes, tokens as defaultTokens } from '@tamagui/config/v3'

// Subscripper Brand Colours
const subscripperColors = {
  // Primary palette
  deepGreen: '#1A3A35',
  lilac: '#D4C8E8',
  lime: '#C4E538',
  white: '#FFFFFF',
  offWhite: '#F9FAF9',
  darkGreen: '#1A2E28',

  // Semantic colours
  textMuted: '#666666',
  textLight: '#999999',
  error: '#E53935',
  success: '#C4E538', // Same as lime

  // Transparent variants
  deepGreenLight: 'rgba(26, 58, 53, 0.1)',
  lilacLight: 'rgba(212, 200, 232, 0.5)',
  limeLight: 'rgba(196, 229, 56, 0.3)',
}

// CSS-based animations (work without native modules)
const animations = createAnimations({
  fast: 'ease-in 150ms',
  medium: 'ease-in 250ms',
  slow: 'ease-in 450ms',
  bouncy: 'cubic-bezier(0.175, 0.885, 0.32, 1.275) 300ms',
})

// Custom tokens with Subscripper spacing and radii
const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    ...subscripperColors,
  },
  space: {
    ...defaultTokens.space,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  size: {
    ...defaultTokens.size,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    ...defaultTokens.radius,
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
})

// Custom themes
const lightTheme = {
  background: subscripperColors.offWhite,
  backgroundHover: subscripperColors.white,
  backgroundPress: subscripperColors.lilacLight,
  backgroundFocus: subscripperColors.white,
  backgroundStrong: subscripperColors.white,
  backgroundTransparent: 'transparent',

  color: subscripperColors.darkGreen,
  colorHover: subscripperColors.deepGreen,
  colorPress: subscripperColors.deepGreen,
  colorFocus: subscripperColors.deepGreen,
  colorTransparent: 'transparent',

  // Primary (Deep Green)
  primary: subscripperColors.deepGreen,
  primaryHover: '#2A4A45',
  primaryPress: '#0A2A25',

  // Secondary (Lilac)
  secondary: subscripperColors.lilac,
  secondaryHover: '#E4D8F8',
  secondaryPress: '#C4B8D8',

  // Accent (Lime)
  accent: subscripperColors.lime,
  accentHover: '#D4F548',
  accentPress: '#B4D528',

  // Surface
  surface: subscripperColors.white,
  surfaceHover: subscripperColors.offWhite,
  surfacePress: subscripperColors.lilacLight,

  // Text
  text: subscripperColors.darkGreen,
  textMuted: subscripperColors.textMuted,
  textLight: subscripperColors.textLight,

  // Semantic
  error: subscripperColors.error,
  success: subscripperColors.success,

  // Border
  borderColor: subscripperColors.lilac,
  borderColorHover: subscripperColors.deepGreen,
  borderColorFocus: subscripperColors.lime,
  borderColorPress: subscripperColors.deepGreen,

  // Shadows
  shadowColor: 'rgba(26, 58, 53, 0.1)',
  shadowColorHover: 'rgba(26, 58, 53, 0.15)',

  // Placeholders
  placeholderColor: subscripperColors.textLight,
}

const darkTheme = {
  ...lightTheme,
  background: subscripperColors.deepGreen,
  backgroundHover: '#2A4A45',
  backgroundPress: '#0A2A25',
  backgroundFocus: '#2A4A45',
  backgroundStrong: subscripperColors.darkGreen,

  color: subscripperColors.offWhite,
  colorHover: subscripperColors.white,
  colorPress: subscripperColors.white,

  surface: '#2A4A45',
  surfaceHover: '#3A5A55',

  text: subscripperColors.offWhite,
  textMuted: '#AAAAAA',
  textLight: '#888888',

  borderColor: '#3A5A55',

  placeholderColor: '#888888',
}

export const config = createTamagui({
  animations,
  tokens,
  themes: {
    ...defaultThemes,
    light: lightTheme,
    dark: darkTheme,
  },
  shorthands,
  defaultFont: 'body',
  fonts: {
    body: {
      family: 'System',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 40,
        10: 48,
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 24,
        4: 26,
        5: 28,
        6: 32,
        7: 36,
        8: 40,
        9: 48,
        10: 56,
      },
      weight: {
        1: '400',
        2: '500',
        3: '600',
        4: '700',
      },
      letterSpacing: {
        1: 0,
        2: -0.5,
        3: -1,
      },
    },
    heading: {
      family: 'System',
      size: {
        1: 18,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
        6: 40,
      },
      lineHeight: {
        1: 24,
        2: 28,
        3: 32,
        4: 36,
        5: 40,
        6: 48,
      },
      weight: {
        1: '600',
        2: '700',
      },
      letterSpacing: {
        1: -0.5,
        2: -1,
      },
    },
  },
})

// Type exports
export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
