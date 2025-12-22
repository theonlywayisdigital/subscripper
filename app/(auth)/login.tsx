import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Mail, Lock, Coffee } from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { EnhancedInput, ErrorBanner, AuthHeader } from '../../components/features/auth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { signIn, isLoading } = useAuthStore()

  const handleLogin = async () => {
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    try {
      await signIn(email.trim(), password)
      router.replace('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else if (message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account first.')
      } else {
        setError(message)
      }
    }
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
            {/* Header */}
            <AuthHeader
              rightElement={
                <View
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="$secondary"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Coffee size={20} color="#1A3A35" />
                </View>
              }
            />

            {/* Content */}
            <YStack flex={1} justifyContent="center" paddingVertical="$xl">
              <YStack gap="$lg" maxWidth={400} width="100%" alignSelf="center">
                {/* Welcome text */}
                <YStack gap="$xs" marginBottom="$md">
                  <Text fontSize={28} fontWeight="600" color="$primary">
                    Welcome back
                  </Text>
                  <Text fontSize={16} color="$textMuted">
                    Sign in to continue to your subscriptions
                  </Text>
                </YStack>

                {/* Form */}
                <YStack gap="$md">
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

                  <EnhancedInput
                    label="Password"
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    leftIcon={<Lock size={20} color="#666666" />}
                    editable={!isLoading}
                  />

                  {/* Remember me & Forgot password */}
                  <XStack justifyContent="space-between" alignItems="center">
                    <Pressable onPress={() => setRememberMe(!rememberMe)}>
                      <XStack gap="$sm" alignItems="center">
                        <View
                          width={22}
                          height={22}
                          borderRadius={6}
                          borderWidth={2}
                          borderColor={rememberMe ? '$accent' : '$borderColor'}
                          backgroundColor={rememberMe ? '$accent' : 'transparent'}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {rememberMe && (
                            <Text color="$primary" fontSize={14} fontWeight="700">
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text fontSize={14} color="$text">
                          Remember me
                        </Text>
                      </XStack>
                    </Pressable>

                    <Link href="/(auth)/forgot-password" asChild>
                      <Pressable>
                        <Text fontSize={14} color="$accent" fontWeight="500">
                          Forgot password?
                        </Text>
                      </Pressable>
                    </Link>
                  </XStack>

                  {/* Error */}
                  {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

                  {/* Sign in button */}
                  <Pressable onPress={handleLogin} disabled={isLoading}>
                    <View
                      backgroundColor="$accent"
                      borderRadius={8}
                      height={56}
                      justifyContent="center"
                      alignItems="center"
                      opacity={isLoading ? 0.7 : 1}
                      marginTop="$sm"
                    >
                      <Text color="$primary" fontSize={16} fontWeight="600">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Text>
                    </View>
                  </Pressable>
                </YStack>

                {/* Divider */}
                <XStack alignItems="center" marginVertical="$lg">
                  <View flex={1} height={1} backgroundColor="$borderColor" />
                  <Text marginHorizontal="$md" color="$textMuted" fontSize={14}>
                    or continue with
                  </Text>
                  <View flex={1} height={1} backgroundColor="$borderColor" />
                </XStack>

                {/* Social login buttons (placeholder) */}
                <XStack gap="$md">
                  <Pressable style={{ flex: 1 }}>
                    <View
                      flex={1}
                      height={50}
                      borderRadius={8}
                      borderWidth={1}
                      borderColor="$borderColor"
                      backgroundColor="$surface"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="$text" fontSize={14} fontWeight="500">
                        Google
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable style={{ flex: 1 }}>
                    <View
                      flex={1}
                      height={50}
                      borderRadius={8}
                      borderWidth={1}
                      borderColor="$borderColor"
                      backgroundColor="$surface"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="$text" fontSize={14} fontWeight="500">
                        Apple
                      </Text>
                    </View>
                  </Pressable>
                </XStack>
              </YStack>
            </YStack>

            {/* Footer */}
            <YStack alignItems="center" paddingBottom="$lg">
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text color="$textMuted" fontSize={15}>
                    Don't have an account?{' '}
                    <Text color="$accent" fontWeight="600">
                      Sign up
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
