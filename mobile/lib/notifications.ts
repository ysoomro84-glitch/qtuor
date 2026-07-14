/**
 * Qtuor Push Notifications — Firebase Cloud Messaging (FCM)
 *
 * Handles:
 *  - Class reminder (10 min before class)
 *  - Booking confirmation
 *  - Payment receipt
 *  - Tutor approval
 *  - Chat messages
 *
 * Setup:
 *  1. Create a Firebase project at https://console.firebase.google.com
 *  2. Add Android app → download google-services.json → place in mobile/
 *  3. Add iOS app → download GoogleService-Info.plist → place in mobile/
 *  4. Upload your APNs key from Apple Developer to Firebase (for iOS push)
 *  5. Set the FCM server key in your Qtuor web admin panel
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { API_BASE_URL } from './api'

// ===== Configure notification behavior =====
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

/**
 * Request notification permissions and get the FCM push token.
 * Send this token to the Qtuor backend so it can send push notifications
 * to this device via Firebase Cloud Messaging.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted')
      return null
    }

    // Get the Expo push token (works with FCM on Android, APNs on iOS)
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-eas-project-id', // Replace with your EAS project ID
    })).data

    console.log('[Notifications] Push token:', token)

    // Send the token to the Qtuor backend
    await sendTokenToServer(token)

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('qtuor-classes', {
        name: 'Class Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      })
      await Notifications.setNotificationChannelAsync('qtuor-general', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
      })
    }

    return token
  } catch (error) {
    console.error('[Notifications] Registration failed:', error)
    return null
  }
}

/**
 * Send the push token to the Qtuor backend so it can send FCM pushes.
 */
async function sendTokenToServer(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, platform: Platform.OS }),
    })
  } catch (error) {
    console.error('[Notifications] Failed to send token to server:', error)
  }
}

/**
 * Handle incoming notifications when the app is in the foreground.
 */
export function setupNotificationListeners(
  onNotification: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void
) {
  const foregroundSub = Notifications.addNotificationReceivedListener(onNotification)
  const responseSub = Notifications.addNotificationResponseReceivedListener(onResponse)

  return () => {
    foregroundSub.remove()
    responseSub.remove()
  }
}

/**
 * Schedule a local notification (for testing without FCM).
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { source: 'qtuor' },
    },
    trigger: triggerDate,
  })
}
