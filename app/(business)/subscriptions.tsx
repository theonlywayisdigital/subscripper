import { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, Alert, ActivityIndicator, Modal, Image, TouchableOpacity } from 'react-native'
import { YStack, XStack, H1, H2, H3, Paragraph, Text, Button, Card, Input, TextArea } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Plus, Edit3, Trash2, X, Coffee, Users, Camera, ChevronRight,
  ChevronLeft, Clock, Calendar, Check, AlertCircle
} from '@tamagui/lucide-icons'
import { useBusinessStore } from '../../stores/business'
import { useSubscriptionStore, SubscriptionProduct, SubscriptionPeriod, BlackoutTime } from '../../stores/subscriptions'
import { pickImage } from '../../lib/supabase/storage'
import { supabase } from '../../lib/supabase/client'

const RESET_PERIODS: { value: SubscriptionPeriod; label: string; description: string }[] = [
  { value: 'day', label: 'Daily', description: 'Resets every day' },
  { value: 'week', label: 'Weekly', description: 'Resets every week' },
  { value: 'month', label: 'Monthly', description: 'Resets every month' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const ITEM_SUGGESTIONS: Record<string, string[]> = {
  coffee_shop: ['Any hot drink', 'Regular coffee', 'Any drink', 'Speciality coffee'],
  bakery: ['Any pastry', 'Croissant', 'Any bread item', 'Sweet treat'],
  restaurant: ['Any lunch', 'Main course', 'Meal deal', 'Any starter'],
  cafe: ['Any drink', 'Coffee & cake', 'Breakfast item', 'Any hot drink'],
  default: ['Any item', 'Regular item', 'Premium item'],
}

interface WizardStep {
  id: number
  title: string
  subtitle: string
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Basic Info', subtitle: 'Name and description' },
  { id: 2, title: "What's Included", subtitle: 'Items and reset cycle' },
  { id: 3, title: 'Pricing', subtitle: 'Monthly cost' },
  { id: 4, title: 'Review', subtitle: 'Check and publish' },
]

export default function BusinessSubscriptionsScreen() {
  const { business } = useBusinessStore()
  const { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useSubscriptionStore()

  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SubscriptionProduct | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [itemType, setItemType] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [resetPeriod, setResetPeriod] = useState<SubscriptionPeriod>('week')
  const [price, setPrice] = useState('')
  const [blackoutEnabled, setBlackoutEnabled] = useState(false)
  const [blackoutTimes, setBlackoutTimes] = useState<BlackoutTime[]>([])

  useEffect(() => {
    if (business) {
      fetchProducts(business.id)
    }
  }, [business])

  const onRefresh = async () => {
    if (!business) return
    setRefreshing(true)
    await fetchProducts(business.id)
    setRefreshing(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setImageUri(null)
    setItemType('')
    setQuantity('1')
    setResetPeriod('week')
    setPrice('')
    setBlackoutEnabled(false)
    setBlackoutTimes([])
    setError('')
    setCurrentStep(1)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (product: SubscriptionProduct) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    setImageUri(product.branding?.imageUrl as string || null)
    setItemType(product.itemType)
    setQuantity(product.quantityPerPeriod.toString())
    setResetPeriod(product.period)
    setPrice((product.pricePence / 100).toFixed(2))
    setBlackoutEnabled(product.blackoutTimes.length > 0)
    setBlackoutTimes(product.blackoutTimes || [])
    setError('')
    setCurrentStep(1)
    setShowModal(true)
  }

  const handlePickImage = async () => {
    try {
      const uri = await pickImage()
      if (uri) {
        setImageUri(uri)
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to pick image')
    }
  }

  const uploadProductImage = async (productId: string): Promise<string | null> => {
    if (!imageUri || imageUri.startsWith('http')) return imageUri

    try {
      const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${business?.id}/${productId}.${ext}`

      const response = await fetch(imageUri)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return `${urlData.publicUrl}?t=${Date.now()}`
    } catch (err) {
      console.error('Image upload error:', err)
      return null
    }
  }

  const validateStep = (step: number): boolean => {
    setError('')

    switch (step) {
      case 1:
        if (!name.trim()) {
          setError('Please enter a subscription name')
          return false
        }
        if (!description.trim()) {
          setError('Please enter a description')
          return false
        }
        return true
      case 2:
        if (!itemType.trim()) {
          setError('Please enter what customers will receive')
          return false
        }
        if (!quantity || parseInt(quantity) < 1) {
          setError('Please enter a valid quantity')
          return false
        }
        return true
      case 3:
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
          setError('Please enter a valid monthly price')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(currentStep - 1)
  }

  const handleSave = async () => {
    if (!business) return
    if (!validateStep(currentStep)) return

    const pricePence = Math.round(parseFloat(price) * 100)
    const quantityNum = parseInt(quantity) || 1

    setIsSaving(true)
    try {
      if (editingProduct) {
        let finalImageUrl = imageUri
        if (imageUri && !imageUri.startsWith('http')) {
          finalImageUrl = await uploadProductImage(editingProduct.id)
        }

        await updateProduct(editingProduct.id, {
          name: name.trim(),
          description: description.trim(),
          itemType: itemType.trim(),
          quantityPerPeriod: quantityNum,
          period: resetPeriod,
          pricePence,
          blackoutTimes: blackoutEnabled ? blackoutTimes : [],
          branding: { imageUrl: finalImageUrl },
        })
      } else {
        const newProduct = await createProduct({
          businessId: business.id,
          name: name.trim(),
          description: description.trim(),
          itemType: itemType.trim(),
          quantityPerPeriod: quantityNum,
          period: resetPeriod,
          pricePence,
          blackoutTimes: blackoutEnabled ? blackoutTimes : [],
          branding: {},
        })

        // Upload image after product is created
        if (imageUri && newProduct) {
          const finalImageUrl = await uploadProductImage(newProduct.id)
          if (finalImageUrl) {
            await updateProduct(newProduct.id, {
              branding: { imageUrl: finalImageUrl },
            })
          }
        }
      }
      setShowModal(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (product: SubscriptionProduct) => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id)
            } catch (err) {
              Alert.alert('Error', 'Failed to delete subscription')
            }
          },
        },
      ]
    )
  }

  const addBlackoutTime = () => {
    setBlackoutTimes([...blackoutTimes, { day: 'Saturday', start: '09:00', end: '11:00' }])
  }

  const removeBlackoutTime = (index: number) => {
    setBlackoutTimes(blackoutTimes.filter((_, i) => i !== index))
  }

  const updateBlackoutTime = (index: number, field: keyof BlackoutTime, value: string) => {
    const updated = [...blackoutTimes]
    updated[index] = { ...updated[index], [field]: value }
    setBlackoutTimes(updated)
  }

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`

  const getPerItemPrice = () => {
    const pricePence = Math.round(parseFloat(price || '0') * 100)
    const quantityNum = parseInt(quantity) || 1

    // Calculate items per month based on reset period
    let itemsPerMonth = quantityNum
    if (resetPeriod === 'day') itemsPerMonth = quantityNum * 30
    else if (resetPeriod === 'week') itemsPerMonth = quantityNum * 4

    if (itemsPerMonth === 0) return '£0.00'
    return formatPrice(Math.round(pricePence / itemsPerMonth))
  }

  const getItemSuggestions = () => {
    const businessType = business?.type || 'default'
    return ITEM_SUGGESTIONS[businessType] || ITEM_SUGGESTIONS.default
  }

  // Preview Card Component
  const PreviewCard = () => {
    const pricePence = Math.round(parseFloat(price || '0') * 100)
    const quantityNum = parseInt(quantity) || 1

    return (
      <Card
        backgroundColor="$surface"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 120 }}
            resizeMode="cover"
          />
        ) : (
          <YStack height={80} backgroundColor="$secondary" justifyContent="center" alignItems="center">
            <Coffee size={32} color="#999" />
          </YStack>
        )}
        <YStack padding="$md">
          <Text color="$primary" fontSize={16} fontWeight="600">
            {name || 'Subscription Name'}
          </Text>
          <Text color="$textMuted" fontSize={12} marginTop="$xs" numberOfLines={2}>
            {description || 'Description will appear here'}
          </Text>
          <XStack justifyContent="space-between" alignItems="center" marginTop="$sm">
            <Text color="$textMuted" fontSize={12}>
              {quantityNum}x {itemType || 'items'} / {resetPeriod}
            </Text>
            <Text color="$accent" fontSize={16} fontWeight="700">
              {formatPrice(pricePence)}/mo
            </Text>
          </XStack>
        </YStack>
      </Card>
    )
  }

  // Step Content Components
  const renderStep1 = () => (
    <YStack gap="$md">
      {/* Image Upload */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Product Image
        </Text>
        <TouchableOpacity onPress={handlePickImage}>
          {imageUri ? (
            <YStack borderRadius={12} overflow="hidden" position="relative">
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 160, borderRadius: 12 }}
                resizeMode="cover"
              />
              <YStack
                position="absolute"
                bottom={8}
                right={8}
                backgroundColor="rgba(0,0,0,0.6)"
                borderRadius={20}
                padding="$sm"
              >
                <Camera size={20} color="white" />
              </YStack>
            </YStack>
          ) : (
            <YStack
              height={120}
              backgroundColor="$secondary"
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderColor="$borderColor"
              borderStyle="dashed"
            >
              <Camera size={32} color="#999" />
              <Text color="$textMuted" fontSize={14} marginTop="$sm">
                Tap to add image
              </Text>
            </YStack>
          )}
        </TouchableOpacity>
      </YStack>

      {/* Name */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Subscription Name *
        </Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g., Daily Brew, Weekend Warrior"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
      </YStack>

      {/* Description */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Description *
        </Text>
        <TextArea
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what's included and why customers will love it"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
          numberOfLines={3}
          minHeight={100}
        />
      </YStack>
    </YStack>
  )

  const renderStep2 = () => (
    <YStack gap="$md">
      {/* Item Type */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          What do customers receive? *
        </Text>
        <Input
          value={itemType}
          onChangeText={setItemType}
          placeholder="e.g., Any hot drink, Regular coffee"
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$sm"
          padding="$md"
          fontSize={16}
        />
        {/* Quick suggestions */}
        <XStack flexWrap="wrap" gap="$xs" marginTop="$xs">
          {getItemSuggestions().map((suggestion) => (
            <Button
              key={suggestion}
              size="$2"
              backgroundColor={itemType === suggestion ? '$accent' : '$secondary'}
              borderRadius="$full"
              onPress={() => setItemType(suggestion)}
            >
              <Text
                color={itemType === suggestion ? '$primary' : '$textMuted'}
                fontSize={12}
              >
                {suggestion}
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>

      {/* Quantity */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Quantity per period *
        </Text>
        <XStack gap="$sm" alignItems="center">
          <Button
            size="$3"
            backgroundColor="$secondary"
            borderRadius="$sm"
            onPress={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
          >
            <Text color="$text" fontSize={20}>-</Text>
          </Button>
          <Input
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            padding="$md"
            fontSize={20}
            fontWeight="600"
            textAlign="center"
            width={80}
          />
          <Button
            size="$3"
            backgroundColor="$secondary"
            borderRadius="$sm"
            onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
          >
            <Text color="$text" fontSize={20}>+</Text>
          </Button>
          <Text color="$textMuted" fontSize={14} flex={1}>
            {itemType || 'items'}
          </Text>
        </XStack>
      </YStack>

      {/* Reset Period */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Allowance resets *
        </Text>
        <YStack gap="$sm">
          {RESET_PERIODS.map(({ value, label, description }) => (
            <TouchableOpacity key={value} onPress={() => setResetPeriod(value)}>
              <XStack
                backgroundColor={resetPeriod === value ? 'rgba(196, 229, 56, 0.2)' : '$surface'}
                borderColor={resetPeriod === value ? '$accent' : '$borderColor'}
                borderWidth={resetPeriod === value ? 2 : 1}
                borderRadius="$sm"
                padding="$md"
                alignItems="center"
              >
                <YStack flex={1}>
                  <Text color="$primary" fontSize={15} fontWeight="500">
                    {label}
                  </Text>
                  <Text color="$textMuted" fontSize={12}>
                    {description}
                  </Text>
                </YStack>
                {resetPeriod === value && (
                  <Check size={20} color="#C4E538" />
                )}
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
      </YStack>

      {/* Summary */}
      <YStack backgroundColor="$secondary" padding="$md" borderRadius="$sm">
        <XStack alignItems="center" gap="$sm">
          <Calendar size={16} color="#666" />
          <Text color="$text" fontSize={13}>
            Customers get <Text fontWeight="600">{quantity}x {itemType || 'items'}</Text> that reset every <Text fontWeight="600">{resetPeriod}</Text>
          </Text>
        </XStack>
      </YStack>
    </YStack>
  )

  const renderStep3 = () => (
    <YStack gap="$md">
      {/* Monthly Price */}
      <YStack gap="$xs">
        <Text color="$text" fontSize={14} fontWeight="500">
          Monthly Price *
        </Text>
        <XStack alignItems="center" gap="$sm">
          <Text color="$primary" fontSize={24} fontWeight="600">£</Text>
          <Input
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            padding="$md"
            fontSize={24}
            fontWeight="600"
            flex={1}
          />
          <Text color="$textMuted" fontSize={16}>/month</Text>
        </XStack>
      </YStack>

      {/* Per-item calculation */}
      {price && parseFloat(price) > 0 && (
        <YStack backgroundColor="rgba(196, 229, 56, 0.15)" padding="$md" borderRadius="$sm">
          <Text color="$primary" fontSize={14}>
            That's <Text fontWeight="700" color="$accent">{getPerItemPrice()}</Text> per {itemType || 'item'}
          </Text>
        </YStack>
      )}

      {/* Billing info */}
      <YStack backgroundColor="$secondary" padding="$md" borderRadius="$sm">
        <XStack alignItems="center" gap="$sm">
          <Clock size={16} color="#666" />
          <Text color="$textMuted" fontSize={13}>
            Customers are billed monthly. Allowance resets {resetPeriod === 'day' ? 'daily' : resetPeriod === 'week' ? 'weekly' : 'monthly'}.
          </Text>
        </XStack>
      </YStack>

      {/* Blackout Times */}
      <YStack gap="$sm">
        <TouchableOpacity onPress={() => setBlackoutEnabled(!blackoutEnabled)}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            padding="$md"
          >
            <YStack flex={1}>
              <Text color="$primary" fontSize={14} fontWeight="500">
                Blackout Times
              </Text>
              <Text color="$textMuted" fontSize={12}>
                Block redemptions during busy periods
              </Text>
            </YStack>
            <XStack
              width={50}
              height={28}
              borderRadius={14}
              backgroundColor={blackoutEnabled ? '$accent' : '$borderColor'}
              justifyContent={blackoutEnabled ? 'flex-end' : 'flex-start'}
              padding={2}
            >
              <YStack
                width={24}
                height={24}
                borderRadius={12}
                backgroundColor="white"
              />
            </XStack>
          </XStack>
        </TouchableOpacity>

        {blackoutEnabled && (
          <YStack gap="$sm" marginTop="$sm">
            {blackoutTimes.map((bt, index) => (
              <XStack key={index} gap="$sm" alignItems="center">
                <YStack flex={1}>
                  <Input
                    value={bt.day}
                    onChangeText={(v) => updateBlackoutTime(index, 'day', v)}
                    placeholder="Day"
                    backgroundColor="$surface"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$sm"
                    padding="$sm"
                    fontSize={14}
                  />
                </YStack>
                <Input
                  value={bt.start}
                  onChangeText={(v) => updateBlackoutTime(index, 'start', v)}
                  placeholder="09:00"
                  backgroundColor="$surface"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  padding="$sm"
                  fontSize={14}
                  width={70}
                />
                <Text color="$textMuted">-</Text>
                <Input
                  value={bt.end}
                  onChangeText={(v) => updateBlackoutTime(index, 'end', v)}
                  placeholder="11:00"
                  backgroundColor="$surface"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  padding="$sm"
                  fontSize={14}
                  width={70}
                />
                <Button
                  size="$2"
                  backgroundColor="transparent"
                  onPress={() => removeBlackoutTime(index)}
                >
                  <X size={18} color="#E53935" />
                </Button>
              </XStack>
            ))}
            <Button
              size="$3"
              backgroundColor="$secondary"
              borderRadius="$sm"
              onPress={addBlackoutTime}
            >
              <XStack alignItems="center" gap="$xs">
                <Plus size={16} color="#666" />
                <Text color="$textMuted" fontSize={13}>Add blackout time</Text>
              </XStack>
            </Button>
          </YStack>
        )}
      </YStack>
    </YStack>
  )

  const renderStep4 = () => (
    <YStack gap="$lg">
      <Text color="$textMuted" fontSize={14} textAlign="center">
        Here's how your subscription will appear to customers:
      </Text>

      <PreviewCard />

      {/* Summary Details */}
      <YStack backgroundColor="$surface" borderRadius="$md" padding="$md" gap="$sm">
        <XStack justifyContent="space-between">
          <Text color="$textMuted" fontSize={13}>Quantity</Text>
          <Text color="$primary" fontSize={13} fontWeight="500">
            {quantity}x {itemType} per {resetPeriod}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text color="$textMuted" fontSize={13}>Price</Text>
          <Text color="$primary" fontSize={13} fontWeight="500">
            {formatPrice(Math.round(parseFloat(price || '0') * 100))}/month
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text color="$textMuted" fontSize={13}>Per item cost</Text>
          <Text color="$accent" fontSize={13} fontWeight="500">
            {getPerItemPrice()}
          </Text>
        </XStack>
        {blackoutEnabled && blackoutTimes.length > 0 && (
          <XStack justifyContent="space-between">
            <Text color="$textMuted" fontSize={13}>Blackout times</Text>
            <Text color="$primary" fontSize={13} fontWeight="500">
              {blackoutTimes.length} configured
            </Text>
          </XStack>
        )}
      </YStack>
    </YStack>
  )

  const renderProductCard = (product: SubscriptionProduct) => (
    <Card
      key={product.id}
      backgroundColor="$surface"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      marginBottom="$md"
      overflow="hidden"
    >
      {product.branding?.imageUrl && (
        <Image
          source={{ uri: product.branding.imageUrl as string }}
          style={{ width: '100%', height: 100 }}
          resizeMode="cover"
        />
      )}
      <YStack padding="$md">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1}>
            <Text color="$primary" fontSize={16} fontWeight="600">
              {product.name}
            </Text>
            {product.description && (
              <Text color="$textMuted" fontSize={13} marginTop="$xs" numberOfLines={2}>
                {product.description}
              </Text>
            )}
            <XStack alignItems="center" gap="$md" marginTop="$sm">
              <XStack alignItems="center" gap="$xs">
                <Coffee size={14} color="#666" />
                <Text color="$textMuted" fontSize={12}>
                  {product.quantityPerPeriod}x {product.itemType} / {product.period}
                </Text>
              </XStack>
            </XStack>
          </YStack>
          <YStack alignItems="flex-end" gap="$sm">
            <Text color="$accent" fontSize={18} fontWeight="700">
              {formatPrice(product.pricePence)}
            </Text>
            <Text color="$textMuted" fontSize={11}>
              per month
            </Text>
          </YStack>
        </XStack>

        <XStack gap="$sm" marginTop="$md">
          <Button
            flex={1}
            size="$3"
            backgroundColor="$surface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$sm"
            onPress={() => openEditModal(product)}
          >
            <XStack alignItems="center" gap="$xs">
              <Edit3 size={14} color="#1A3A35" />
              <Text color="$primary" fontSize={13}>Edit</Text>
            </XStack>
          </Button>
          <Button
            size="$3"
            backgroundColor="$surface"
            borderColor="$error"
            borderWidth={1}
            borderRadius="$sm"
            onPress={() => handleDelete(product)}
          >
            <Trash2 size={14} color="#E53935" />
          </Button>
        </XStack>

        <XStack alignItems="center" gap="$xs" marginTop="$sm">
          <Users size={12} color="#666" />
          <Text color="$textMuted" fontSize={11}>
            0 subscribers
          </Text>
        </XStack>
      </YStack>
    </Card>
  )

  if (!business) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#1A3A35" />
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAF9' }}>
      <YStack flex={1} padding="$lg">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$lg">
          <YStack flex={1}>
            <H1 color="$primary" fontSize={28} fontWeight="700">
              Subscriptions
            </H1>
            <Paragraph color="$textMuted">
              Your subscription products
            </Paragraph>
          </YStack>
          <Button
            backgroundColor="$accent"
            borderRadius="$sm"
            height={40}
            paddingHorizontal={16}
            onPress={openCreateModal}
          >
            <XStack alignItems="center" gap="$xs">
              <Plus size={18} color="#1A3A35" />
              <Text color="$primary" fontSize={14} fontWeight="600">
                New
              </Text>
            </XStack>
          </Button>
        </XStack>

        {/* Products List */}
        {isLoading && products.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1A3A35" />
          </YStack>
        ) : products.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$xl">
            <YStack
              backgroundColor="$secondary"
              padding="$xl"
              borderRadius="$lg"
              alignItems="center"
              maxWidth={300}
            >
              <Text fontSize={48} marginBottom="$md">📦</Text>
              <Text
                color="$primary"
                fontSize={18}
                fontWeight="600"
                textAlign="center"
                marginBottom="$sm"
              >
                No subscriptions yet
              </Text>
              <Paragraph color="$textMuted" textAlign="center" fontSize={14}>
                Create your first subscription to start getting customers.
              </Paragraph>
              <Button
                marginTop="$lg"
                backgroundColor="$accent"
                borderRadius="$sm"
                onPress={openCreateModal}
              >
                <XStack alignItems="center" gap="$xs">
                  <Plus size={16} color="#1A3A35" />
                  <Text color="$primary" fontWeight="600">Create Subscription</Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {products.map(renderProductCard)}
          </ScrollView>
        )}
      </YStack>

      {/* Create/Edit Modal - Multi-step Wizard */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <YStack
            backgroundColor="$background"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            maxHeight="95%"
            flex={1}
          >
            {/* Modal Header */}
            <XStack
              justifyContent="space-between"
              alignItems="center"
              padding="$lg"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <YStack>
                <H2 color="$primary" fontSize={20} fontWeight="700">
                  {editingProduct ? 'Edit Subscription' : 'New Subscription'}
                </H2>
                <Text color="$textMuted" fontSize={13}>
                  Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1].title}
                </Text>
              </YStack>
              <Button
                size="$2"
                backgroundColor="transparent"
                borderRadius="$full"
                onPress={() => setShowModal(false)}
              >
                <X size={24} color="#666" />
              </Button>
            </XStack>

            {/* Progress Bar */}
            <XStack padding="$md" gap="$xs">
              {WIZARD_STEPS.map((step) => (
                <YStack
                  key={step.id}
                  flex={1}
                  height={4}
                  borderRadius={2}
                  backgroundColor={step.id <= currentStep ? '$accent' : '$borderColor'}
                />
              ))}
            </XStack>

            {/* Step Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Error Message */}
              {error ? (
                <YStack
                  backgroundColor="rgba(229, 57, 53, 0.1)"
                  padding="$md"
                  borderRadius="$sm"
                  marginTop="$md"
                >
                  <XStack alignItems="center" gap="$sm">
                    <AlertCircle size={16} color="#E53935" />
                    <Text color="$error" fontSize={14}>
                      {error}
                    </Text>
                  </XStack>
                </YStack>
              ) : null}
            </ScrollView>

            {/* Navigation Buttons */}
            <XStack
              padding="$lg"
              gap="$md"
              borderTopWidth={1}
              borderTopColor="$borderColor"
            >
              {currentStep > 1 && (
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor="$surface"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$sm"
                  onPress={handleBack}
                >
                  <XStack alignItems="center" gap="$xs">
                    <ChevronLeft size={18} color="#1A3A35" />
                    <Text color="$primary" fontWeight="500">Back</Text>
                  </XStack>
                </Button>
              )}

              {currentStep < WIZARD_STEPS.length ? (
                <Button
                  flex={currentStep === 1 ? 1 : 2}
                  size="$4"
                  backgroundColor="$accent"
                  borderRadius="$sm"
                  onPress={handleNext}
                >
                  <XStack alignItems="center" gap="$xs">
                    <Text color="$primary" fontWeight="600">Continue</Text>
                    <ChevronRight size={18} color="#1A3A35" />
                  </XStack>
                </Button>
              ) : (
                <Button
                  flex={2}
                  size="$4"
                  backgroundColor="$accent"
                  borderRadius="$sm"
                  onPress={handleSave}
                  disabled={isSaving}
                  opacity={isSaving ? 0.7 : 1}
                >
                  <Text color="$primary" fontWeight="600">
                    {isSaving ? 'Publishing...' : editingProduct ? 'Save Changes' : 'Publish Subscription'}
                  </Text>
                </Button>
              )}
            </XStack>
          </YStack>
        </YStack>
      </Modal>
    </SafeAreaView>
  )
}
