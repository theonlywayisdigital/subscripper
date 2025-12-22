import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Pressable, Linking } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Lock, Mail, ArrowLeft, Check } from '@tamagui/lucide-icons'
import { supabase } from '../../lib/supabase/client'
import { EnhancedInput, ErrorBanner, AuthHeader } from '../../components/features/auth'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendReset = async () => {
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'subscripper://reset-password',
      })

      if (error) throw error

      setIsSent(true)
      startCountdown()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = () => {
    if (countdown === 0) {
      handleSendReset()
    }
  }

  const handleOpenEmail = () => {
    Linking.openURL('mailto:')
  }

  if (isSent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }} edges={['top']}>
        <YStack flex={1} padding="$lg">
          <AuthHeader showBack={false} />

          <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$lg">
            {/* Success icon */}
            <View
              width={100}
              height={100}
              borderRadius={50}
              backgroundColor="$secondary"
              justifyContent="center"
              alignItems="center"
              marginBottom="$xl"
            >
              <Mail size={48} color="#C4E538" />
            </View>

            {/* Text */}
            <YStack gap="$sm" alignItems="center" marginBottom="$xl">
              <Text fontSize={28} fontWeight="600" color="$primary">
                Check your inbox
              </Text>
              <Text fontSize={16} color="$textMuted" textAlign="center">
                We've sent a password reset link to
              </Text>
              <Text fontSize={16} fontWeight="500" color="$text">
                {email}
              </Text>
            </YStack>

            {/* Actions */}
            <YStack gap="$md" width="100%" maxWidth={300}>
              <Pressable onPress={handleOpenEmail}>
                <View
                  backgroundColor="$accent"
                  borderRadius={8}
                  height={56}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="$primary" fontSize={16} fontWeight="600">
                    Open Email App
                  </Text>
                </View>
              </Pressable>

              <Pressable onPress={handleResend} disabled={countdown > 0}>
                <View
                  height={44}
                  justifyContent="center"
                  alignItems="center"
                >
                  {countdown > 0 ? (
                    <Text color="$textMuted" fontSize={14}>
                      Resend in {countdown}s
                    </Text>
                  ) : (
                    <Text color="$accent" fontSize={14} fontWeight="500">
                      Resend email
                    </Text>
                  )}
                </View>
              </Pressable>
            </YStack>

            {/* Back to sign in */}
            <Link href="/(auth)/login" asChild>
              <Pressable style={{ marginTop: 32 }}>
                <XStack alignItems="center" gap="$xs">
                  <ArrowLeft size={16} color="#666666" />
                  <Text color="$textMuted" fontSize={14}>
                    Back to Sign In
                  </Text>
                </XStack>
              </Pressable>
            </Link>
          </YStack>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} padding="$lg">
            <AuthHeader />

            {/* Content */}
            <YStack flex={1} justifyContent="center">
              <YStack gap="$lg" maxWidth={400} width="100%" alignSelf="center">
                {/* Icon */}
                <View alignSelf="center" marginBottom="$md">
                  <View
                    width={80}
                    height={80}
                    borderRadius={40}
                    backgroundColor="$secondary"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Lock size={36} color="#1A3A35" />
                  </View>
                </View>

                {/* Text */}
                <YStack gap="$sm" alignItems="center">
                  <Text fontSize={28} fontWeight="600" color="$primary">
                    Forgot password?
                  </Text>
                  <Text
                    fontSize={16}
                    color="$textMuted"
                    textAlign="center"
                    paddingHorizontal="$lg"
                  >
                    No worries! Enter your email and we'll send you a reset link.
                  </Text>
                </YStack>

                {/* Form */}
                <YStack gap="$md" marginTop="$lg">
                  <EnhancedInput
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon={<Mail size={20} color="#666666" />}
                    showClearButton
                    editable={!isLoading}
                  />

                  {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

                  <Pressable onPress={handleSendReset} disabled={isLoading}>
                    <View
                      backgroundColor="$accent"
                      borderRadius={8}
                      height={56}
                      justifyContent="center"
                      alignItems="center"
                      opacity={isLoading ? 0.7 : 1}
                    >
                      <Text color="$primary" fontSize={16} fontWeight="600">
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Text>
                    </View>
                  </Pressable>
                </YStack>
              </YStack>
            </YStack>

            {/* Footer */}
            <YStack alignItems="center" paddingBottom="$lg">
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text color="$textMuted" fontSize={15}>
                    Remembered it?{' '}
                    <Text color="$accent" fontWeight="600">
                      Back to sign in
                    </Text>
                  </Text>
                </Pressable>
              </Link>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
