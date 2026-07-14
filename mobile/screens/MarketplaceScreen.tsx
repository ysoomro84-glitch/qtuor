import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../lib/theme'
import { getTutors } from '../lib/api'
import type { Tutor } from '../lib/api'

const CATEGORIES = ['All', 'Noorani Qaida', 'Quran Recitation With Tajweed', 'Hifz', 'Arabic Language']

export default function MarketplaceScreen() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const loadTutors = useCallback(async () => {
    try {
      const data = await getTutors({
        category: category === 'All' ? undefined : category,
        search: search || undefined,
        sort: 'rating',
      })
      setTutors(data.tutors || [])
    } catch (e) {
      console.error('Failed to load tutors:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [category, search])

  React.useEffect(() => { loadTutors() }, [loadTutors])

  const onRefresh = () => { setRefreshing(true); loadTutors() }

  const renderTutor = ({ item }: { item: Tutor }) => (
    <View style={styles.tutorCard}>
      <View style={styles.tutorHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.tutorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.tutorName}>{item.name}</Text>
            {item.profile?.verified && <Ionicons name="shield-checkmark" size={16} color={Colors.lightBlueAccent} />}
          </View>
          <Text style={styles.tutorCountry}>{item.country || '—'}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.gold} />
            <Text style={styles.rating}>{item.profile?.rating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.reviewCount}>({item.profile?.reviewCount || 0})</Text>
          </View>
        </View>
        <Text style={styles.price}>${item.profile?.perClassRate || 0}<Text style={styles.priceUnit}>/class</Text></Text>
      </View>
      {item.profile?.bio && <Text style={styles.bio} numberOfLines={2}>{item.profile.bio}</Text>}
      <View style={styles.specialties}>
        {(item.profile?.specialties || []).slice(0, 3).map((s, i) => (
          <View key={i} style={styles.specialtyPill}><Text style={styles.specialtyText}>{s}</Text></View>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tutors..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadTutors}
        />
      </View>

      {/* Category pills */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryPill, category === item && styles.categoryPillActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.categoryList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Tutor list */}
      <FlatList
        data={tutors}
        keyExtractor={(item) => item.id}
        renderItem={renderTutor}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.navy]} />}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No tutors found. Try a different search.</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    margin: Spacing.lg, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.sm,
  },
  searchInput: { flex: 1, padding: Spacing.md, fontSize: FontSize.base, color: Colors.text },
  categoryList: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  categoryPill: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  categoryPillActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  categoryText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  categoryTextActive: { color: Colors.white },
  tutorCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    ...Shadows.md,
  },
  tutorHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  tutorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  tutorName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  tutorCountry: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.md, fontWeight: '700', color: Colors.navy },
  priceUnit: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '400' },
  bio: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.sm, lineHeight: 20 },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  specialtyPill: {
    backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  specialtyText: { fontSize: FontSize.xs, color: '#1E40AF', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xxl },
})
