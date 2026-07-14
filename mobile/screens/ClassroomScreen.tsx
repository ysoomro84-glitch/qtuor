import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius } from '../lib/theme'
import { API_BASE_URL } from '../lib/api'

/**
 * Virtual Classroom Screen — Secure WebView approach
 *
 * Loads the Qtuor web classroom inside a Secure WebView. This reuses the
 * existing WebRTC video, Quran canvas, and whiteboard without rebuilding
 * them natively. The web classroom is already mobile-responsive.
 *
 * For production, you can optionally replace this with native WebRTC using
 * react-native-webrtc for better performance on older devices.
 */
import { WebView } from 'react-native-webview'

export default function ClassroomScreen({ route }: { route: any }) {
  const bookingId = route?.params?.bookingId || ''
  const classroomUrl = `${API_BASE_URL}/?classroom=${bookingId}`

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="videocam" size={24} color={Colors.white} />
        <Text style={styles.headerTitle}>Virtual Classroom</Text>
      </View>
      <WebView
        source={{ uri: classroomUrl }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mixedContentMode="always"
        userAgent="QtuorMobileApp/1.0"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.navy,
  },
  headerTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  webview: { flex: 1, backgroundColor: Colors.navy },
})
