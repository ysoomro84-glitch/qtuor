import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../lib/theme'
import { getStudentDashboard } from '../lib/api'
import type { User } from '../lib/api'

export default function StudentDashboardScreen({ user }: { user: User }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = async () => {
    try {
      const dash = await getStudentDashboard()
      setData(dash)
    } catch (e) {
      console.error('Failed to load dashboard:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadDashboard() }, [])

  const stats = data?.stats || { completedClasses: 0, upcomingClasses: 0, totalSurahs: 0, progressPct: 0 }
  const subscription = data?.subscription
  const bookings = data?.bookings || []

  return (
    <View style={styles.container}>
      {/* Welcome header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Assalamu Alaikum, {user.name?.split(' ')[0]} 🌙</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={Colors.navy} />
          <Text style={styles.statValue}>{stats.upcomingClasses || 0}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{stats.completedClasses || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color={Colors.gold} />
          <Text style={styles.statValue}>{stats.totalSurahs || 0}</Text>
          <Text style={styles.statLabel}>Surahs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color={Colors.lightBlueAccent} />
          <Text style={styles.statValue}>{stats.progressPct || 0}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      {/* Current plan */}
      {subscription && (
        <View style={styles.planCard}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <Text style={styles.planName}>{subscription.plan?.name || 'Active'}</Text>
          <Text style={styles.planCategory}>{subscription.plan?.category || ''}</Text>
          <Text style={styles.planStatus}>Status: {subscription.status}</Text>
        </View>
      )}

      {/* Upcoming classes */}
      <Text style={styles.sectionTitle}>Upcoming Classes</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.classCard}>
            <View style={styles.classInfo}>
              <Text style={styles.classTopic}>{item.topic || 'Quran Class'}</Text>
              <Text style={styles.classDate}>{new Date(item.scheduledAt).toLocaleDateString()} · {new Date(item.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
              {item.tutor && <Text style={styles.classTutor}>Tutor: {item.tutor.name}</Text>}
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard() }} colors={[Colors.navy]} />}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No upcoming classes. Book a free trial!</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg },
  welcome: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.navy },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center', ...Shadows.sm,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.xs },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  planCard: {
    backgroundColor: Colors.navy, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  planName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  planCategory: { fontSize: FontSize.sm, color: Colors.lightBlue, marginTop: 2 },
  planStatus: { fontSize: FontSize.xs, color: Colors.white + '80', marginTop: Spacing.xs },
  classCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', ...Shadows.sm,
  },
  classInfo: { flex: 1 },
  classTopic: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  classDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  classTutor: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  joinButton: {
    backgroundColor: Colors.navy, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  joinText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xl },
})
