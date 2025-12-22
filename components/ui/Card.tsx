import { styled, YStack, GetProps } from 'tamagui'

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$surface',
  borderRadius: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: '$lg',

  variants: {
    variant: {
      default: {},
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
      outlined: {
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      filled: {
        backgroundColor: '$secondary',
        borderWidth: 0,
      },
    },
    size: {
      small: {
        padding: '$sm',
      },
      medium: {
        padding: '$md',
      },
      large: {
        padding: '$lg',
      },
    },
    pressable: {
      true: {
        pressStyle: {
          opacity: 0.95,
          scale: 0.99,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
})

export type CardProps = GetProps<typeof Card>
