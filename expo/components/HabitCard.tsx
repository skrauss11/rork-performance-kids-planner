import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Habit } from '@/types';
import { categoryEmojis, dayLabels } from '@/mocks/habits';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, dayIndex?: number) => void;
  showCategory?: boolean;
  todayIndex: number;
}

export default React.memo(function HabitCard({ habit, onToggle, showCategory = false, todayIndex }: HabitCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const completedThisWeek = habit.completedDays.filter(Boolean).length;
  const isTodayDone = habit.completedDays[todayIndex];

  const handleTodayToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle(habit.id, todayIndex);
  }, [habit.id, todayIndex, onToggle]);

  const handleDayToggle = useCallback((dayIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(habit.id, dayIndex);
  }, [habit.id, onToggle]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable onPress={handleTodayToggle} style={[styles.card, isTodayDone && styles.cardCompleted]}>
        <View style={styles.row}>
          <View style={[styles.checkbox, isTodayDone && styles.checkboxCompleted]}>
            {isTodayDone && <Check size={14} color={Colors.background} strokeWidth={3} />}
          </View>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              {showCategory && (
                <Text style={styles.emoji}>{categoryEmojis[habit.category]}</Text>
              )}
              <Text style={[styles.title, isTodayDone && styles.titleCompleted]}>
                {habit.title}
              </Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {habit.description}
            </Text>
            <View style={styles.weekRow}>
              {dayLabels.map((label, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleDayToggle(i)}
                  style={[
                    styles.dayDot,
                    habit.completedDays[i] && styles.dayDotCompleted,
                    i === todayIndex && !habit.completedDays[i] && styles.dayDotToday,
                  ]}
                >
                  <Text style={[
                    styles.dayLabel,
                    habit.completedDays[i] && styles.dayLabelCompleted,
                    i === todayIndex && !habit.completedDays[i] && styles.dayLabelToday,
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.weekCount}>
                <Text style={styles.weekCountText}>{completedThisWeek}/7</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardCompleted: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryDim + '40',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 1,
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  titleCompleted: {
    color: Colors.primary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotCompleted: {
    backgroundColor: Colors.primary,
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  dayLabelCompleted: {
    color: Colors.background,
  },
  dayLabelToday: {
    color: Colors.accent,
  },
  weekCount: {
    marginLeft: 'auto',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekCountText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
});
