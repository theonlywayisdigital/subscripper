import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native'
import { YStack, XStack, Text, View } from 'tamagui'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Coffee, Store, User, Mail, Lock } from '@tamagui/lucide-icons'
import { useAuthStore, UserType } from '../../stores/auth'
import {
  EnhancedInput,
  ErrorBanner,
  AuthHeader,
  PasswordStrength,
  UserTypeCard,
} from '../../components/features/auth'

export default function RegisterScreen() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>('customer')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { signUp, isLoading } = useAuthStore()

  const handleNext = () => {
    setError('')
    setStep(2)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else {
      router.back()
    }
  }

  const handleRegister = async () => {
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password) {
      setError('Please create a password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await signUp(email.trim(), password, name.trim(), userType)
      router.replace('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.includes('User already registered')) {
        setError('This email is already registered. Try signing in instead.')
      } else if (message.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else if (message.includes('Password')) {
        setError('Password must be at least 6 characters.')
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
            {/* Header with progress */}
            <AuthHeader
              onBack={handleBack}
              step={step}
              totalSteps={2}
            />

            {/* Content */}
            <YStack flex={1} justifyContent="center" paddingVertical="$xl">
              <YStack gap="$lg" maxWidth={400} width="100%" alignSelf="center">
                {step === 1 ? (
                  <>
                    {/* Step 1: User Type Selection */}
                    <YStack gap="$xs" marginBottom="$md">
                      <Text fontSize={28} fontWeight="600" color="$primary">
                        Join Subscripper
                      </Text>
                      <Text fontSize={16} color="$textMuted">
                        What brings you here today?
                      </Text>
                    </YStack>

                    <YStack gap="$md">
                      <UserTypeCard
                        icon={<Coffee size={24} color={userType === 'customer' ? '#1A3A35' : '#666666'} />}
                        title="Discover & Subscribe"
                        description="Find local subscriptions and save on your daily favourites"
                        selected={userType === 'customer'}
                        onPress={() => setUserType('customer')}
                      />

                      <UserTypeCard
                        icon={<Store size={24} color={userType === 'business_owner' ? '#1A3A35' : '#666666'} />}
                        title="Offer Subscriptions"
                        description="Grow your business with recurring customers"
                        selected={userType === 'business_owner'}
                        onPress={() => setUserType('business_owner')}
                      />
                    </YStack>

                    <Pressable onPress={handleNext}>
                      <View
                        backgroundColor="$accent"
                        borderRadius={8}
                        height={56}
                        justifyContent="center"
                        alignItems="center"
                        marginTop="$lg"
                      >
                        <Text color="$primary" fontSize={16} fontWeight="600">
                          Continue
                        </Text>
                      </View>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {/* Step 2: Account Details */}
                    <YStack gap="$xs" marginBottom="$md">
                      <Text fontSize={28} fontWeight="600" color="$primary">
                        Almost there!
                      </Text>
                      <Text fontSize={16} color="$textMuted">
                        Just a few details to set up your account
                      </Text>
                    </YStack>

                    {/* Social login buttons */}
                    <XStack gap="$md" marginBottom="$md">
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
                            Sign up with Google
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
                            Sign up with Apple
                          </Text>
                        </View>
                      </Pressable>
                    </XStack>

                    {/* Divider */}
                    <XStack alignItems="center" marginBottom="$md">
                      <View flex={1} height={1} backgroundColor="$borderColor" />
                      <Text marginHorizontal="$md" color="$textMuted" fontSize={14}>
                        or
                      </Text>
                      <View flex={1} height={1} backgroundColor="$borderColor" />
                    </XStack>

                    <YStack gap="$md">
                      <EnhancedInput
                        label={userType === 'business_owner' ? 'Your name' : 'Full name'}
                        placeholder={userType === 'business_owner' ? 'John Smith' : 'Your name'}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoComplete="name"
                        leftIcon={<User size={20} color="#666666" />}
                        editable={!isLoading}
                      />

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

                      <YStack>
                        <EnhancedInput
                          label="Password"
                          placeholder="Create a password"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                          autoComplete="off"
                          leftIcon={<Lock size={20} color="#666666" />}
                          editable={!isLoading}
                        />
                        <PasswordStrength password={password} />
                      </YStack>

                      <EnhancedInput
                        label="Confirm password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoComplete="off"
                        leftIcon={<Lock size={20} color="#666666" />}
                        editable={!isLoading}
                        error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                      />

                      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

                      <Pressable onPress={handleRegister} disabled={isLoading}>
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
                            {isLoading ? 'Creating account...' : 'Create Account'}
                          </Text>
                        </View>
                      </Pressable>

                      {/* Terms notice */}
                      <Text
                        color="$textLight"
                        fontSize={12}
                        textAlign="center"
                        marginTop="$md"
                      >
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </Text>
                    </YStack>
                  </>
                )}
              </YStack>
            </YStack>

            {/* Footer */}
            <YStack alignItems="center" paddingBottom="$lg">
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text color="$textMuted" fontSize={15}>
                    Already have an account?{' '}
                    <Text color="$accent" fontWeight="600">
                      Sign in
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
