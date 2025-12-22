import { styled, Button as TamaguiButton, Spinner, GetProps } from 'tamagui'

const StyledButton = styled(TamaguiButton, {
  name: 'Button',
  borderRadius: '$sm',
  height: 50,
  pressStyle: {
    opacity: 0.9,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$accent',
        color: '$primary',
        pressStyle: {
          backgroundColor: '$accentPress',
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$primary',
        pressStyle: {
          backgroundColor: '$secondaryPress',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        color: '$text',
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$text',
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      danger: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$error',
        color: '$error',
        pressStyle: {
          backgroundColor: 'rgba(229, 57, 53, 0.1)',
        },
      },
    },
    size: {
      small: {
        height: 36,
        paddingHorizontal: '$md',
        fontSize: 14,
      },
      medium: {
        height: 44,
        paddingHorizontal: '$lg',
        fontSize: 16,
      },
      large: {
        height: 52,
        paddingHorizontal: '$xl',
        fontSize: 18,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
})

type ButtonProps = GetProps<typeof StyledButton> & {
  loading?: boolean
}

export function Button({ loading, disabled, children, ...props }: ButtonProps) {
  return (
    <StyledButton disabled={disabled || loading} {...props}>
      {loading ? <Spinner color="$primary" /> : children}
    </StyledButton>
  )
}
