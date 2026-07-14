import React, { useEffect } from 'react'
import { View, StyleSheet, Animated, Text } from 'react-native'
import { Colors, FontSize } from '../lib/theme'

/**
 * Qtuor Splash Screen
 *
 * Animated entrance: Geometric "Q" logo fades in + scales on Deep Navy Blue background.
 */
export default function SplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(onAnimationComplete, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Geometric Q Logo */}
        <View style={styles.qCircle}>
          <Text style={styles.qLetter}>Q</Text>
        </View>
        <Text style={styles.brandName}>Qtuor</Text>
        <Text style={styles.slogan}>LEARN · RECITE · EXCEL</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  qCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  qLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.gold,
  },
  brandName: {
    fontSize: FontSize.title,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  slogan: {
    fontSize: FontSize.xs,
    color: Colors.lightBlue,
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
})
