import React, { useState } from 'react'
import { View, StyleSheet, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../lib/theme'
import { login } from '../lib/api'
import type { User } from '../lib/api'

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const user = await login(email, password)
      onLoginSuccess(user)
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.qCircle}>
            <Text style={styles.qLetter}>Q</Text>
          </View>
          <Text style={styles.title}>Welcome to Qtuor</Text>
          <Text style={styles.subtitle}>Connect with certified Quran tutors globally</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts:</Text>
            <Text style={styles.demoText}>Admin: admin@qtuor.com / admin123</Text>
            <Text style={styles.demoText}>Student: qaida.student@qtuor.com / qaida123</Text>
            <Text style={styles.demoText}>Tutor: abdullah@qtuor.com / tutor123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, padding: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.xxl },
  qCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  qLetter: { fontSize: 40, fontWeight: '900', color: Colors.gold },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.navy },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs, textAlign: 'center' },
  form: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.navy, borderRadius: BorderRadius.md, padding: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.sm, ...Shadows.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  errorText: { color: Colors.error, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  demoBox: {
    backgroundColor: '#F0F9FF', borderRadius: BorderRadius.md, padding: Spacing.md,
    marginTop: Spacing.xl, borderWidth: 1, borderColor: '#BAE6FD',
  },
  demoTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.navy, marginBottom: Spacing.xs },
  demoText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
})
