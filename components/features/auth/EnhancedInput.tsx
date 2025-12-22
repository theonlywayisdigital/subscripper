import { useState, forwardRef } from 'react'
import { TextInput, Pressable } from 'react-native'
import { styled, XStack, YStack, Text, GetProps } from 'tamagui'
import { Eye, EyeOff, X } from '@tamagui/lucide-icons'

const InputContainer = styled(XStack, {
  name: 'InputContainer',
  backgroundColor: '$surface',
  borderWidth: 2,
  borderColor: '$secondary',
  borderRadius: '$md',
  height: 56,
  alignItems: 'center',
  paddingHorizontal: '$md',
  gap: '$sm',

  variants: {
    focused: {
      true: {
        borderColor: '$accent',
      },
    },
    error: {
      true: {
        borderColor: '$error',
      },
    },
  } as const,
})

const StyledTextInput = styled(TextInput, {
  flex: 1,
  fontSize: 16,
  color: '$text',
  height: '100%',
})

type EnhancedInputProps = {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showClearButton?: boolean
  value?: string
  onChangeText?: (text: string) => void
  secureTextEntry?: boolean
  placeholder?: string
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoComplete?: 'email' | 'password' | 'name' | 'off'
  editable?: boolean
}

export const EnhancedInput = forwardRef<TextInput, EnhancedInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showClearButton = false,
      value = '',
      onChangeText,
      secureTextEntry = false,
      placeholder,
      keyboardType = 'default',
      autoCapitalize = 'none',
      autoComplete = 'off',
      editable = true,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = secureTextEntry
    const hasValue = value.length > 0

    const handleClear = () => {
      onChangeText?.('')
    }

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <YStack gap="$xs">
        {label && (
          <Text color="$text" fontSize={14} fontWeight="500">
            {label}
          </Text>
        )}

        <InputContainer focused={isFocused} error={!!error}>
          {leftIcon && (
            <YStack opacity={isFocused || hasValue ? 1 : 0.5}>
              {leftIcon}
            </YStack>
          )}

          <StyledTextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            secureTextEntry={isPassword && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            editable={editable}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Clear button */}
          {showClearButton && hasValue && !isPassword && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <X size={18} color="#999999" />
            </Pressable>
          )}

          {/* Password toggle */}
          {isPassword && (
            <Pressable onPress={togglePassword} hitSlop={8}>
              {showPassword ? (
                <EyeOff size={20} color="#666666" />
              ) : (
                <Eye size={20} color="#666666" />
              )}
            </Pressable>
          )}

          {/* Custom right icon */}
          {rightIcon && !isPassword && !showClearButton && rightIcon}
        </InputContainer>

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

EnhancedInput.displayName = 'EnhancedInput'
