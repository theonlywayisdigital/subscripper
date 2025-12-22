// Subscripper Brand Colours
// Use these constants for any non-Tamagui styling

export const colors = {
  // Primary palette
  primary: '#1A3A35', // Deep green
  secondary: '#D4C8E8', // Lilac
  accent: '#C4E538', // Lime
  surface: '#FFFFFF', // White
  background: '#F9FAF9', // Off-white

  // Text colours
  text: '#1A2E28', // Dark green
  textMuted: '#666666',
  textLight: '#999999',

  // Semantic colours
  error: '#E53935',
  success: '#C4E538', // Same as accent/lime

  // Transparent variants
  primaryLight: 'rgba(26, 58, 53, 0.1)',
  secondaryLight: 'rgba(212, 200, 232, 0.5)',
  accentLight: 'rgba(196, 229, 56, 0.3)',

  // Hover/press states
  primaryHover: '#2A4A45',
  primaryPress: '#0A2A25',
  accentHover: '#D4F548',
  accentPress: '#B4D528',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const
