import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { HabitCategory } from '@/types';
import { categoryLabels, categoryEmojis, dayFullLabels } from '@/mocks/habits';
import HabitCard from '@/components/HabitCard';
import ScienceNote from '@/components/ScienceNote';

const allCategories: ('all' | HabitCategory)[] = ['all', 'sleep', 'sunlight', 'nutrition', 'hydration', 'movement', 'recovery'];

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const { habits, toggleHabit, todayCompletedCount, totalCount, weeklyCompletedCount, weeklyTotalPossible, weeklyPercentage, todayIndex } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [showScience, setShowScience] = useState<string | null>(null);

  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter(h => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  const handleToggle = useCallback((id: string, dayIndex?: number) => {
    toggleHabit(id, dayIndex);
  }, [toggleHabit]);

  const toggleScienceNote = useCallback((id: string) => {
    setShowScience(prev => prev === id ? null : id);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Habits</Text>
          <Text style={styles.subtitle}>{dayFullLabels[todayIndex]} — {todayCompletedCount}/{totalCount} today</Text>
        </View>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>{weeklyPercentage}%</Text>
          <Text style={styles.weekBadgeLabel}>this week</Text>
        </View>
      </View>

      <View style={styles.weekProgress}>
        <View style={styles.weekProgressTrack}>
          <View style={[styles.weekProgressBar, { width: `${weeklyPercentage}%` }]} />
        </View>
        <Text style={styles.weekProgressText}>{weeklyCompletedCount}/{weeklyTotalPossible} check-ins</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {allCategories.map(cat => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
          >
            <Text style={styles.filterEmoji}>
              {cat === 'all' ? '✨' : categoryEmojis[cat]}
            </Text>
            <Text style={[styles.filterLabel, selectedCategory === cat && styles.filterLabelActive]}>
              {cat === 'all' ? 'All' : categoryLabels[cat]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredHabits.map(habit => (
          <View key={habit.id}>
            <Pressable onLongPress={() => toggleScienceNote(habit.id)}>
              <HabitCard
                habit={habit}
                onToggle={handleToggle}
                showCategory={selectedCategory === 'all'}
                todayIndex={todayIndex}
              />
            </Pressable>
            {showScience === habit.id && (
              <ScienceNote note={habit.scienceNote} />
            )}
          </View>
        ))}

        <View style={styles.scienceHint}>
          <Text style={styles.hintText}>💡 Long press any habit to see the science behind it</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weekBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekBadgeText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  weekBadgeLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.background + 'AA',
    marginTop: 1,
  },
  weekProgress: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  weekProgressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  weekProgressBar: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  weekProgressText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  filterScroll: {
    maxHeight: 52,
    marginTop: 14,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterLabelActive: {
    color: Colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scienceHint: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
