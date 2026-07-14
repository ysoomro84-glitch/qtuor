import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../lib/theme'
import { getPlans } from '../lib/api'
import type { Plan } from '../lib/api'

export default function PlansScreen() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPlans = async () => {
    try {
      const data = await getPlans()
      setPlans(data.plans || [])
    } catch (e) {
      console.error('Failed to load plans:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadPlans() }, [])

  const renderPlan = ({ item }: { item: Plan }) => (
    <View style={[styles.planCard, item.popular && styles.planCardPopular]}>
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      <Text style={styles.planCategory}>{item.category}</Text>
      <Text style={styles.planName}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.monthlyPrice}</Text>
        <Text style={styles.pricePeriod}>/month</Text>
      </View>
      <Text style={styles.classesPerMonth}>{item.classesPerMonth} classes per month</Text>
      {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
      <View style={styles.features}>
        {item.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.subscribeButton}>
        <Text style={styles.subscribeText}>Subscribe Now</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Subscription Plans</Text>
      <Text style={styles.pageSubtitle}>Monthly plans for Quran learning. No hourly rates.</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlan}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPlans() }} colors={[Colors.navy]} />}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No plans available.</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.navy, textAlign: 'center', marginTop: Spacing.xl },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
  planCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    ...Shadows.lg, position: 'relative',
  },
  planCardPopular: { borderWidth: 2, borderColor: Colors.gold },
  popularBadge: {
    position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: 12,
  },
  popularText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.navy },
  planCategory: { fontSize: FontSize.xs, color: Colors.lightBlue, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  planName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.sm },
  price: { fontSize: FontSize.title, fontWeight: '800', color: Colors.navy },
  pricePeriod: { fontSize: FontSize.sm, color: Colors.textMuted },
  classesPerMonth: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  description: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.sm, lineHeight: 20 },
  features: { marginTop: Spacing.md, gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  subscribeButton: {
    backgroundColor: Colors.navy, borderRadius: BorderRadius.md, padding: Spacing.md,
    alignItems: 'center', marginTop: Spacing.lg,
  },
  subscribeText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xxl },
})
