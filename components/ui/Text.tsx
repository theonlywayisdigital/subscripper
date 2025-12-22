import { styled, Text as TamaguiText, GetProps } from 'tamagui'

export const Text = styled(TamaguiText, {
  name: 'Text',
  color: '$text',

  variants: {
    variant: {
      h1: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
      },
      h2: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
      },
      h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h4: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
      },
      bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
      },
      label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
      },
    },
    color: {
      primary: {
        color: '$primary',
      },
      secondary: {
        color: '$secondary',
      },
      accent: {
        color: '$accent',
      },
      muted: {
        color: '$textMuted',
      },
      light: {
        color: '$textLight',
      },
      error: {
        color: '$error',
      },
      success: {
        color: '$success',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'body',
  },
})

export type TextProps = GetProps<typeof Text>

// Convenience components - use variant name for color prop
export const Heading1 = styled(Text, {
  variant: 'h1',
  color: 'primary',
})

export const Heading2 = styled(Text, {
  variant: 'h2',
  color: 'primary',
})

export const Heading3 = styled(Text, {
  variant: 'h3',
})

export const Paragraph = styled(Text, {
  variant: 'body',
  color: 'muted',
})

export const Caption = styled(Text, {
  variant: 'caption',
  color: 'light',
})

export const Label = styled(Text, {
  variant: 'label',
})
