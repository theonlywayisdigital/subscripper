import { useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import {
  YStack,
  XStack,
  H1,
  H2,
  Text,
  Input,
  Button,
  Paragraph,
  TextArea,
  View,
} from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Globe,
  Building2,
  Copy,
} from '@tamagui/lucide-icons'
import { useAuthStore } from '../../stores/auth'
import { useBusinessStore, BusinessType } from '../../stores/business'

// Steps for the wizard
const STEPS = ['Setup', 'Details', 'Type', 'Contact', 'Hours', 'Review']

// All business type categories
const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'coffee_shop', label: 'Coffee Shop' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'breakfast_spot', label: 'Breakfast Spot' },
  { value: 'lunch_spot', label: 'Lunch Spot' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pub_bar', label: 'Pub / Bar' },
  { value: 'juice_smoothie_bar', label: 'Juice / Smoothie Bar' },
  { value: 'ice_cream_dessert', label: 'Ice Cream / Dessert' },
  { value: 'hairdresser', label: 'Hairdresser' },
  { value: 'barber', label: 'Barber' },
  { value: 'nail_salon', label: 'Nail Salon' },
  { value: 'eyebrows_lashes', label: 'Eyebrows / Lashes' },
  { value: 'tanning_salon', label: 'Tanning Salon' },
  { value: 'spa_massage', label: 'Spa / Massage' },
  { value: 'gym_fitness', label: 'Gym / Fitness' },
  { value: 'yoga_pilates', label: 'Yoga / Pilates Studio' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'dog_grooming', label: 'Dog Grooming' },
  { value: 'pet_shop', label: 'Pet Shop' },
  { value: 'florist', label: 'Florist' },
  { value: 'dry_cleaner', label: 'Dry Cleaner / Launderette' },
  { value: 'newsagent', label: 'Newsagent' },
  { value: 'butcher', label: 'Butcher' },
  { value: 'deli', label: 'Deli' },
  { value: 'farm_shop', label: 'Farm Shop' },
  { value: 'vape_shop', label: 'Vape Shop' },
  { value: 'tattoo_studio', label: 'Tattoo Studio' },
  { value: 'other', label: 'Other' },
]

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
]

interface FormData {
  setupMethod: 'google' | 'manual' | null
  name: string
  description: string
  addressLookup: string
  manualAddress: boolean
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  types: BusinessType[]
  otherType: string
  email: string
  phone: string
  website: string
  facebook: string
  instagram: string
  openingHours: Record<string, { open: string; close: string; closed: boolean }>
}

export default function BusinessOnboardingScreen() {
  const { user } = useAuthStore()
  const { createBusiness, isLoading } = useBusinessStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<FormData>({
    setupMethod: null,
    name: '',
    description: '',
    addressLookup: '',
    manualAddress: false,
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    types: [],
    otherType: '',
    email: user?.email || '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    openingHours: DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day.key]: { open: '09:00', close: '17:00', closed: day.key === 'sunday' },
      }),
      {}
    ),
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const toggleType = (type: BusinessType) => {
    setFormData((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type]
      return { ...prev, types }
    })
    setError('')
  }

  const copyHoursToAll = (sourceDay: string) => {
    const sourceHours = formData.openingHours[sourceDay]
    const newHours = { ...formData.openingHours }
    DAYS.forEach((day) => {
      newHours[day.key] = { ...sourceHours }
    })
    updateField('openingHours', newHours)
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0: // Setup Method
        if (!formData.setupMethod) {
          setError('Please choose a setup method')
          return false
        }
        break
      case 1: // Details
        if (!formData.name.trim()) {
          setError('Please enter your business name')
          return false
        }
        if (!formData.description.trim()) {
          setError('Please enter a description')
          return false
        }
        if (formData.manualAddress) {
          if (!formData.addressLine1.trim()) {
            setError('Please enter address line 1')
            return false
          }
          if (!formData.city.trim()) {
            setError('Please enter town/city')
            return false
          }
          if (!formData.postcode.trim()) {
            setError('Please enter postcode')
            return false
          }
        }
        break
      case 2: // Type
        if (formData.types.length === 0) {
          setError('Please select at least one business type')
          return false
        }
        if (formData.types.includes('other') && !formData.otherType.trim()) {
          setError('Please specify your business type')
          return false
        }
        break
      case 3: // Contact
        if (!formData.email.trim()) {
          setError('Please enter an email address')
          return false
        }
        if (!formData.phone.trim()) {
          setError('Please enter a phone number')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const getFormattedAddress = () => {
    if (formData.manualAddress) {
      const parts = [
        formData.addressLine1,
        formData.addressLine2,
        formData.city,
        formData.postcode,
      ].filter(Boolean)
      return parts.join(', ')
    }
    return formData.addressLookup
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit')
      return
    }

    setError('')

    try {
      const businessData = {
        ownerId: user.id,
        name: formData.name,
        types: formData.types,
        type: formData.types[0] || 'other',
        description: formData.description,
        address: getFormattedAddress(),
        addressLine1: formData.manualAddress ? formData.addressLine1 : undefined,
        addressLine2: formData.manualAddress ? formData.addressLine2 : undefined,
        city: formData.manualAddress ? formData.city : undefined,
        postcode: formData.manualAddress ? formData.postcode : undefined,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || undefined,
        socialLinks: {
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined,
        },
        openingHours: Object.fromEntries(
          Object.entries(formData.openingHours)
            .filter(([_, hours]) => !hours.closed)
            .map(([day, hours]) => [day, { open: hours.open, close: hours.close }])
        ),
      }

      await createBusiness(businessData)
      router.replace('/(business)/')
    } catch (err) {
      console.error('Error creating business:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const renderStepIndicator = () => (
    <XStack justifyContent="center" gap="$xs" marginBottom="$lg" flexWrap="wrap">
      {STEPS.map((step, index) => (
        <Pressable key={step} onPress={() => goToStep(index)} disabled={index > currentStep}>
          <YStack alignItems="center" opacity={index <= currentStep ? 1 : 0.4} paddingHorizontal="$xs">
            <XStack
              width={28}
              height={28}
              borderRadius={14}
              backgroundColor={
                index < currentStep ? '$accent' : index === currentStep ? '$primary' : '$borderColor'
              }
              justifyContent="center"
              alignItems="center"
              marginBottom={4}
            >
              {index < currentStep ? (
                <Check size={14} color="#1A3A35" />
              ) : (
                <Text
                  color={index === currentStep ? 'white' : '$textMuted'}
                  fontSize={12}
                  fontWeight="600"
                >
                  {index + 1}
                </Text>
              )}
            </XStack>
            <Text
              color={index === currentStep ? '$primary' : '$textMuted'}
              fontSize={9}
              fontWeight={index === currentStep ? '600' : '400'}
            >
              {step}
            </Text>
          </YStack>
        </Pressable>
      ))}
    </XStack>
  )

  // Step 0: Setup Method
  const renderSetupMethod = () => (
    <YStack gap="$lg">
      <Paragraph color="$textMuted" textAlign="center" marginBottom="$md">
        How would you like to set up your business profile?
      </Paragraph>

      <Pressable onPress={() => updateField('setupMethod', 'google')}>
        <XStack
          backgroundColor={formData.setupMethod === 'google' ? '#D4C8E8' : '$surface'}
          borderWidth={2}
          borderColor={formData.setupMethod === 'google' ? '#D4C8E8' : '$borderColor'}
          borderRadius="$md"
          padding="$lg"
          gap="$md"
          alignItems="center"
        >
          <View
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={formData.setupMethod === 'google' ? '$accent' : '$secondary'}
            justifyContent="center"
            alignItems="center"
          >
            <Globe size={24} color="#1A3A35" />
          </View>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$primary">
              Connect Google Business Profile
            </Text>
            <Text fontSize={14} color="$textMuted">
              Import your details automatically
            </Text>
          </YStack>
          {formData.setupMethod === 'google' && (
            <View
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor="$accent"
              justifyContent="center"
              alignItems="center"
            >
              <Check size={16} color="#1A3A35" />
            </View>
          )}
        </XStack>
      </Pressable>

      <Pressable onPress={() => updateField('setupMethod', 'manual')}>
        <XStack
          backgroundColor={formData.setupMethod === 'manual' ? '#D4C8E8' : '$surface'}
          borderWidth={2}
          borderColor={formData.setupMethod === 'manual' ? '#D4C8E8' : '$borderColor'}
          borderRadius="$md"
          padding="$lg"
          gap="$md"
          alignItems="center"
        >
          <View
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={formData.setupMethod === 'manual' ? '$accent' : '$secondary'}
            justifyContent="center"
            alignItems="center"
          >
            <Building2 size={24} color="#1A3A35" />
          </View>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$primary">
              Set up manually
            </Text>
            <Text fontSize={14} color="$textMuted">
              Enter your details step by step
            </Text>
          </YStack>
          {formData.setupMethod === 'manual' && (
            <View
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor="$accent"
              justifyContent="center"
              alignItems="center"
            >
              <Check size={16} color="#1A3A35" />
            </View>
          )}
        </XStack>
      </Pressable>

      {formData.setupMethod === 'google' && (
        <YStack
          backgroundColor="rgba(196, 229, 56, 0.2)"
          padding="$md"
          borderRadius="$sm"
          marginTop="$md"
        >
          <Text color="$primary" fontSize={14} textAlign="center">
            Google Business Profile connection coming soon. Please use manual setup for now.
          </Text>
        </YStack>
      )}
    </YStack>
  )

  // Step 1: Business Details
  const renderDetails = () => (
    <YStack gap="$md">
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Business name *
        </Text>
        <Input
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="e.g. The Daily Grind"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Description *
        </Text>
        <TextArea
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          placeholder="Tell customers about your business..."
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
          numberOfLines={4}
        />
      </YStack>

      <YStack gap="$xs">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$text" fontSize={14} fontWeight="500">
            Address
          </Text>
          <Pressable onPress={() => updateField('manualAddress', !formData.manualAddress)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              {formData.manualAddress ? 'Use address lookup' : 'Enter manually'}
            </Text>
          </Pressable>
        </XStack>

        {!formData.manualAddress ? (
          <XStack
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            paddingHorizontal="$md"
            alignItems="center"
            gap="$sm"
          >
            <Search size={20} color="#666666" />
            <Input
              value={formData.addressLookup}
              onChangeText={(text) => updateField('addressLookup', text)}
              placeholder="Start typing to search..."
              backgroundColor="transparent"
              borderWidth={0}
              padding="$md"
              paddingLeft={0}
              fontSize={16}
              flex={1}
            />
          </XStack>
        ) : (
          <YStack gap="$sm">
            <Input
              value={formData.addressLine1}
              onChangeText={(text) => updateField('addressLine1', text)}
              placeholder="Address line 1 *"
              backgroundColor="$surface"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$sm"
              padding="$md"
              fontSize={16}
            />
            <Input
              value={formData.addressLine2}
              onChangeText={(text) => updateField('addressLine2', text)}
              placeholder="Address line 2"
              backgroundColor="$surface"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$sm"
              padding="$md"
              fontSize={16}
            />
            <XStack gap="$sm">
              <Input
                value={formData.city}
                onChangeText={(text) => updateField('city', text)}
                placeholder="Town/City *"
                backgroundColor="$surface"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$sm"
                padding="$md"
                fontSize={16}
                flex={1}
              />
              <Input
                value={formData.postcode}
                onChangeText={(text) => updateField('postcode', text)}
                placeholder="Postcode *"
                backgroundColor="$surface"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$sm"
                padding="$md"
                fontSize={16}
                width={120}
                autoCapitalize="characters"
              />
            </XStack>
          </YStack>
        )}

        {!formData.manualAddress && (
          <Text color="$textLight" fontSize={12}>
            Address lookup coming soon
          </Text>
        )}
      </YStack>
    </YStack>
  )

  // Step 2: Business Type (Multi-select)
  const renderBusinessType = () => (
    <YStack gap="$md">
      <Paragraph color="$textMuted" marginBottom="$sm">
        What type of business do you run? Select all that apply.
      </Paragraph>
      <XStack flexWrap="wrap" gap="$sm">
        {BUSINESS_TYPES.map(({ value, label }) => {
          const isSelected = formData.types.includes(value)
          return (
            <Pressable key={value} onPress={() => toggleType(value)}>
              <XStack
                backgroundColor={isSelected ? '#D4C8E8' : '$surface'}
                borderColor={isSelected ? '#D4C8E8' : '$borderColor'}
                borderWidth={1}
                borderRadius="$sm"
                paddingHorizontal="$md"
                paddingVertical="$sm"
                alignItems="center"
                gap="$xs"
              >
                {isSelected && <Check size={14} color="#1A3A35" />}
                <Text
                  color={isSelected ? '$primary' : '$textMuted'}
                  fontSize={14}
                  fontWeight={isSelected ? '600' : '400'}
                >
                  {label}
                </Text>
              </XStack>
            </Pressable>
          )
        })}
      </XStack>

      {formData.types.includes('other') && (
        <YStack gap="$xs" marginTop="$sm">
          <Text color="$text" fontSize={14} fontWeight="500">
            Please specify *
          </Text>
          <Input
            value={formData.otherType}
            onChangeText={(text) => updateField('otherType', text)}
            placeholder="Your business type"
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            padding="$md"
            fontSize={16}
          />
        </YStack>
      )}
    </YStack>
  )

  // Step 3: Contact & Socials
  const renderContact = () => (
    <YStack gap="$md">
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Email *
        </Text>
        <Input
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          placeholder="hello@yourbusiness.com"
          keyboardType="email-address"
          autoCapitalize="none"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Phone *
        </Text>
        <Input
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          placeholder="020 1234 5678"
          keyboardType="phone-pad"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Website
        </Text>
        <Input
          value={formData.website}
          onChangeText={(text) => updateField('website', text)}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      <View height={1} backgroundColor="$borderColor" marginVertical="$sm" />

      <Text color="$textMuted" fontSize={14} fontWeight="500" marginBottom="$xs">
        Social Media (optional)
      </Text>

      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Facebook
        </Text>
        <Input
          value={formData.facebook}
          onChangeText={(text) => updateField('facebook', text)}
          placeholder="facebook.com/yourbusiness"
          autoCapitalize="none"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Instagram
        </Text>
        <Input
          value={formData.instagram}
          onChangeText={(text) => updateField('instagram', text)}
          placeholder="@yourbusiness"
          autoCapitalize="none"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>
    </YStack>
  )

  // Step 4: Opening Hours
  const renderHours = () => (
    <YStack gap="$md">
      <Paragraph color="$textMuted" marginBottom="$sm">
        Set your opening hours. Tap a day to mark it as closed.
      </Paragraph>

      {DAYS.map((day, index) => {
        const hours = formData.openingHours[day.key]
        return (
          <YStack key={day.key} gap="$xs">
            <XStack alignItems="center" gap="$md">
              <Pressable
                onPress={() => {
                  const newHours = { ...formData.openingHours }
                  newHours[day.key] = { ...newHours[day.key], closed: !newHours[day.key].closed }
                  updateField('openingHours', newHours)
                }}
              >
                <View
                  backgroundColor={hours.closed ? '$surface' : '$accent'}
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  width={80}
                  paddingVertical="$sm"
                  alignItems="center"
                >
                  <Text
                    color={hours.closed ? '$textMuted' : '$primary'}
                    fontSize={13}
                    fontWeight="500"
                  >
                    {day.short}
                  </Text>
                </View>
              </Pressable>

              {!hours.closed ? (
                <XStack flex={1} gap="$sm" alignItems="center">
                  <Input
                    value={hours.open}
                    onChangeText={(text) => {
                      const newHours = { ...formData.openingHours }
                      newHours[day.key] = { ...newHours[day.key], open: text }
                      updateField('openingHours', newHours)
                    }}
                    placeholder="09:00"
                    backgroundColor="$surface"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$sm"
                    padding="$sm"
                    fontSize={14}
                    flex={1}
                    textAlign="center"
                  />
                  <Text color="$textMuted" fontSize={14}>
                    to
                  </Text>
                  <Input
                    value={hours.close}
                    onChangeText={(text) => {
                      const newHours = { ...formData.openingHours }
                      newHours[day.key] = { ...newHours[day.key], close: text }
                      updateField('openingHours', newHours)
                    }}
                    placeholder="17:00"
                    backgroundColor="$surface"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$sm"
                    padding="$sm"
                    fontSize={14}
                    flex={1}
                    textAlign="center"
                  />
                  {index === 0 && (
                    <Pressable onPress={() => copyHoursToAll(day.key)}>
                      <View
                        backgroundColor="$secondary"
                        borderRadius="$sm"
                        padding="$sm"
                      >
                        <Copy size={16} color="#1A3A35" />
                      </View>
                    </Pressable>
                  )}
                </XStack>
              ) : (
                <Text color="$textMuted" fontSize={14} flex={1}>
                  Closed
                </Text>
              )}
            </XStack>
          </YStack>
        )
      })}

      <Text color="$textLight" fontSize={12} marginTop="$sm">
        Tap the copy icon on Monday to apply those hours to all days.
      </Text>
    </YStack>
  )

  // Step 5: Review
  const renderReview = () => {
    const typeLabels = formData.types
      .map((t) => BUSINESS_TYPES.find((bt) => bt.value === t)?.label)
      .filter(Boolean)
      .join(', ')

    return (
      <YStack gap="$md">
        <XStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$surface"
          padding="$md"
          borderRadius="$sm"
        >
          <YStack flex={1}>
            <Text color="$textMuted" fontSize={12}>
              BUSINESS NAME
            </Text>
            <Text color="$text" fontSize={16} fontWeight="600">
              {formData.name}
            </Text>
          </YStack>
          <Pressable onPress={() => goToStep(1)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              Edit
            </Text>
          </Pressable>
        </XStack>

        <XStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$surface"
          padding="$md"
          borderRadius="$sm"
        >
          <YStack flex={1}>
            <Text color="$textMuted" fontSize={12}>
              DESCRIPTION
            </Text>
            <Text color="$text" fontSize={14} numberOfLines={2}>
              {formData.description}
            </Text>
          </YStack>
          <Pressable onPress={() => goToStep(1)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              Edit
            </Text>
          </Pressable>
        </XStack>

        {(formData.manualAddress
          ? formData.addressLine1
          : formData.addressLookup) && (
          <XStack
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$surface"
            padding="$md"
            borderRadius="$sm"
          >
            <YStack flex={1}>
              <Text color="$textMuted" fontSize={12}>
                ADDRESS
              </Text>
              <Text color="$text" fontSize={14}>
                {getFormattedAddress()}
              </Text>
            </YStack>
            <Pressable onPress={() => goToStep(1)}>
              <Text color="$accent" fontSize={14} fontWeight="500">
                Edit
              </Text>
            </Pressable>
          </XStack>
        )}

        <XStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$surface"
          padding="$md"
          borderRadius="$sm"
        >
          <YStack flex={1}>
            <Text color="$textMuted" fontSize={12}>
              BUSINESS TYPE
            </Text>
            <Text color="$text" fontSize={14}>
              {typeLabels}
              {formData.types.includes('other') && formData.otherType
                ? ` (${formData.otherType})`
                : ''}
            </Text>
          </YStack>
          <Pressable onPress={() => goToStep(2)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              Edit
            </Text>
          </Pressable>
        </XStack>

        <XStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$surface"
          padding="$md"
          borderRadius="$sm"
        >
          <YStack flex={1}>
            <Text color="$textMuted" fontSize={12}>
              CONTACT
            </Text>
            <Text color="$text" fontSize={14}>
              {formData.email}
            </Text>
            <Text color="$text" fontSize={14}>
              {formData.phone}
            </Text>
            {formData.website && (
              <Text color="$text" fontSize={14}>
                {formData.website}
              </Text>
            )}
          </YStack>
          <Pressable onPress={() => goToStep(3)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              Edit
            </Text>
          </Pressable>
        </XStack>

        {(formData.facebook || formData.instagram) && (
          <XStack
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$surface"
            padding="$md"
            borderRadius="$sm"
          >
            <YStack flex={1}>
              <Text color="$textMuted" fontSize={12}>
                SOCIAL MEDIA
              </Text>
              {formData.facebook && (
                <Text color="$text" fontSize={14}>
                  Facebook: {formData.facebook}
                </Text>
              )}
              {formData.instagram && (
                <Text color="$text" fontSize={14}>
                  Instagram: {formData.instagram}
                </Text>
              )}
            </YStack>
            <Pressable onPress={() => goToStep(3)}>
              <Text color="$accent" fontSize={14} fontWeight="500">
                Edit
              </Text>
            </Pressable>
          </XStack>
        )}

        <XStack
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$surface"
          padding="$md"
          borderRadius="$sm"
        >
          <YStack flex={1}>
            <Text color="$textMuted" fontSize={12}>
              OPENING HOURS
            </Text>
            {DAYS.map((day) => {
              const hours = formData.openingHours[day.key]
              return (
                <XStack key={day.key} gap="$sm">
                  <Text color="$text" fontSize={14} width={80}>
                    {day.short}:
                  </Text>
                  <Text color="$text" fontSize={14}>
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </Text>
                </XStack>
              )
            })}
          </YStack>
          <Pressable onPress={() => goToStep(4)}>
            <Text color="$accent" fontSize={14} fontWeight="500">
              Edit
            </Text>
          </Pressable>
        </XStack>

        <YStack backgroundColor="rgba(196, 229, 56, 0.2)" padding="$md" borderRadius="$sm">
          <Text color="$primary" fontSize={14} textAlign="center">
            Your business will be reviewed by our team before going live. This usually takes 1-2
            business days.
          </Text>
        </YStack>
      </YStack>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderSetupMethod()
      case 1:
        return renderDetails()
      case 2:
        return renderBusinessType()
      case 3:
        return renderContact()
      case 4:
        return renderHours()
      case 5:
        return renderReview()
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Get Started'
      case 1:
        return 'Business Details'
      case 2:
        return 'Business Type'
      case 3:
        return 'Contact & Socials'
      case 4:
        return 'Opening Hours'
      case 5:
        return 'Review & Submit'
      default:
        return ''
    }
  }

  // Disable next if Google selected (placeholder)
  const isNextDisabled =
    (currentStep === 0 && formData.setupMethod === 'google') || isLoading

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} padding="$lg">
          {/* Header */}
          <YStack marginBottom="$md">
            <H1 color="$primary" fontSize={24} fontWeight="700" textAlign="center">
              Set up your business
            </H1>
            <Paragraph color="$textMuted" textAlign="center" marginTop="$xs">
              Step {currentStep + 1} of {STEPS.length}
            </Paragraph>
          </YStack>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <H2 color="$primary" fontSize={18} fontWeight="600" marginBottom="$md">
              {getStepTitle()}
            </H2>
            {renderCurrentStep()}

            {error ? (
              <YStack
                backgroundColor="rgba(229, 57, 53, 0.1)"
                padding="$md"
                borderRadius="$sm"
                marginTop="$md"
              >
                <Text color="$error" fontSize={14} textAlign="center">
                  {error}
                </Text>
              </YStack>
            ) : null}
          </ScrollView>

          {/* Navigation Buttons */}
          <XStack gap="$md" marginTop="$md">
            {currentStep > 0 && (
              <Button
                flex={1}
                onPress={handleBack}
                backgroundColor="$surface"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$sm"
                height={50}
              >
                <XStack alignItems="center" gap="$xs">
                  <ChevronLeft size={20} color="#1A3A35" />
                  <Text color="$primary" fontSize={16} fontWeight="600">
                    Back
                  </Text>
                </XStack>
              </Button>
            )}

            <Button
              flex={currentStep > 0 ? 1 : undefined}
              width={currentStep === 0 ? '100%' : undefined}
              onPress={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
              disabled={isNextDisabled}
              backgroundColor="$accent"
              pressStyle={{ backgroundColor: '$accentPress' }}
              borderRadius="$sm"
              height={50}
              opacity={isNextDisabled ? 0.5 : 1}
            >
              <XStack alignItems="center" gap="$xs">
                <Text color="$primary" fontSize={16} fontWeight="600">
                  {currentStep === STEPS.length - 1
                    ? isLoading
                      ? 'Submitting...'
                      : 'Submit for Review'
                    : 'Next'}
                </Text>
                {currentStep < STEPS.length - 1 && <ChevronRight size={20} color="#1A3A35" />}
              </XStack>
            </Button>
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
