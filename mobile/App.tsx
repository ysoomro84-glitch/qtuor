import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from './lib/theme'
import { getMe, logout, type User } from './lib/api'
import { registerForPushNotifications, setupNotificationListeners } from './lib/notifications'

import SplashScreen from './screens/SplashScreen'
import LoginScreen from './screens/LoginScreen'
import MarketplaceScreen from './screens/MarketplaceScreen'
import PlansScreen from './screens/PlansScreen'
import StudentDashboardScreen from './screens/StudentDashboardScreen'
import ClassroomScreen from './screens/ClassroomScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// ===== Student Tab Navigator =====
function StudentTabs({ user }: { user: User }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Tutors: focused ? 'search' : 'search-outline',
            Plans: focused ? 'card' : 'card-outline',
            Blog: focused ? 'newspaper' : 'newspaper-outline',
          }
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />
        },
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: true,
        headerStyle: { backgroundColor: Colors.navy },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Dashboard" options={{ title: 'Dashboard' }}>
        {(props) => <StudentDashboardScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Tutors" component={MarketplaceScreen} options={{ title: 'Find Tutors' }} />
      <Tab.Screen name="Plans" component={PlansScreen} options={{ title: 'Plans' }} />
    </Tab.Navigator>
  )
}

// ===== Main App =====
export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  // Check existing session on app launch
  useEffect(() => {
    if (showSplash) return

    (async () => {
      const me = await getMe()
      if (me) {
        setUser(me)
        // Register for push notifications
        await registerForPushNotifications()
      }
      setChecking(false)
    })()

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => console.log('[Notification received]', notification.request.content.title),
      (response) => console.log('[Notification tapped]', response.notification.request.content.title)
    )
    return cleanup
  }, [showSplash])

  // Splash screen
  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
  }

  // Loading
  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {(props) => <StudentTabs {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Classroom"
                component={ClassroomScreen}
                options={{
                  headerStyle: { backgroundColor: Colors.navy },
                  headerTintColor: Colors.white,
                  title: 'Virtual Classroom',
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLoginSuccess={(u) => setUser(u)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
})
