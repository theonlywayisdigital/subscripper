import { styled, Input as TamaguiInput, YStack, Text, GetProps } from 'tamagui'
import { forwardRef } from 'react'
import type { TextInput } from 'react-native'

const StyledInput = styled(TamaguiInput, {
  name: 'Input',
  backgroundColor: '$surface',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$sm',
  padding: '$md',
  fontSize: 16,
  color: '$text',
  placeholderTextColor: '$placeholderColor',

  focusStyle: {
    borderColor: '$accent',
    borderWidth: 2,
  },

  variants: {
    variant: {
      default: {},
      error: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
        },
      },
    },
    size: {
      small: {
        height: 40,
        padding: '$sm',
        fontSize: 14,
      },
      medium: {
        height: 48,
        padding: '$md',
        fontSize: 16,
      },
      large: {
        height: 56,
        paddingHorizontal: '$lg',
        paddingVertical: '$md',
        fontSize: 18,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
})

type InputProps = GetProps<typeof StyledInput> & {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, variant, ...props }, ref) => {
    return (
      <YStack space="$xs">
        {label && (
          <Text color="$text" fontSize={14} fontWeight="500">
            {label}
          </Text>
        )}
        <StyledInput
          ref={ref}
          variant={error ? 'error' : variant}
          {...props}
        />
        {error ? (
          <Text color="$error" fontSize={12}>
            {error}
          </Text>
        ) : helperText ? (
          <Text color="$textMuted" fontSize={12}>
            {helperText}
          </Text>
        ) : null}
      </YStack>
    )
  }
)

Input.displayName = 'Input'
