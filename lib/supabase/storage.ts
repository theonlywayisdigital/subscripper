import * as ImagePicker from 'expo-image-picker'
import { supabase } from './client'

/**
 * Request permission and pick an image from the library
 */
export async function pickImage(): Promise<string | null> {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('We need permission to access your photos to upload a profile picture.')
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })

  if (result.canceled || !result.assets[0]) {
    return null
  }

  return result.assets[0].uri
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadProfilePicture(
  userId: string,
  imageUri: string
): Promise<string> {
  // Get file extension from URI
  const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${userId}/avatar.${ext}`
  const filePath = fileName

  // Fetch the image as a blob
  const response = await fetch(imageUri)
  const blob = await response.blob()

  // Convert blob to array buffer for Supabase
  const arrayBuffer = await blob.arrayBuffer()

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload profile picture')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Add cache buster to URL to force refresh
  return `${urlData.publicUrl}?t=${Date.now()}`
}

/**
 * Delete a user's profile picture
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`])

  if (error) {
    console.error('Delete error:', error)
    // Don't throw - best effort deletion
  }
}
