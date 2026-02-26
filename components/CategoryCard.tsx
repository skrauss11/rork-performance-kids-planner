import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import { HabitCategory } from '@/types';
import { categoryLabels, categoryEmojis } from '@/mocks/habits';

const categoryColors: Record<HabitCategory, string> = {
  sleep: Colors.habitSleep,
  nutrition: Colors.habitNutrition,
  sunlight: Colors.habitSunlight,
  hydration: Colors.habitHydration,
  movement: Colors.habitMovement,
  recovery: Colors.habitRecovery,
  environmental: Colors.habitEnvironmental,
};

interface CategoryCardProps {
  category: HabitCategory;
  completed: number;
  total: number;
  onPress?: () => void;
}

export default React.memo(function CategoryCard({ category, completed, total, onPress }: CategoryCardProps) {
  const progress = total > 0 ? completed / total : 0;
  const color = categoryColors[category];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{categoryEmojis[category]}</Text>
        <Text style={[styles.badge, { backgroundColor: color + '20', color }]}>
          {completed}/{total}
        </Text>
      </View>
      <Text style={styles.label}>{categoryLabels[category]}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 24,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
  },
});
