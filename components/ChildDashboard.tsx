import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Zap, Heart, Trophy, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { categoryEmojis, dayLabels } from '@/mocks/habits';
import { getFormattedDate } from '@/utils/date';

const MOOD_EMOJIS: Record<string, string> = {
  great: '🤩',
  good: '😊',
  okay: '😐',
  tired: '😴',
  rough: '😓',
};

const ENERGY_LABELS = ['', 'Low', 'Meh', 'Okay', 'Strong', 'On Fire!'];
const ENERGY_COLORS = ['', '#EF5350', '#FF7043', '#FFA726', '#66BB6A', '#43A047'];

interface ChildDashboardProps {
  onCheckIn: () => void;
  onSwitchToParent: () => void;
}

export default function ChildDashboard({ onCheckIn, onSwitchToParent }: ChildDashboardProps) {
  const insets = useSafeAreaInsets();
  const {
    profile, habits, toggleHabit, todayIndex, todayCompletedCount,
    totalCount, todayPercentage, activeRewards, todayLog, weeklyPercentage,
  } = useApp();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: todayPercentage / 100,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [todayPercentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleHabitToggle = useCallback((habitId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleHabit(habitId, todayIndex);
  }, [toggleHabit, todayIndex]);

  const displayName = profile.name ? profile.name.split(' ')[0] : 'Champ';
  const topReward = activeRewards.length > 0 ? activeRewards[0] : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: bounceAnim }] }}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.heyText}>Hey {displayName}!</Text>
              <Text style={styles.dateText}>{getFormattedDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatarBubble}>
                <Text style={styles.avatarEmoji}>{profile.avatarEmoji || '⚡'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {todayLog ? (
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Text style={styles.moodTitle}>Today's Vibe</Text>
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[todayLog.mood] || '😊'}</Text>
            </View>
            <View style={styles.moodStats}>
              <View style={styles.moodStat}>
                <Text style={styles.moodStatLabel}>Mood</Text>
                <Text style={styles.moodStatValue}>{todayLog.mood}</Text>
              </View>
              <View style={styles.moodDivider} />
              <View style={styles.moodStat}>
                <Text style={styles.moodStatLabel}>Energy</Text>
                <View style={styles.energyRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.energyDot,
                        i <= todayLog.energy && { backgroundColor: ENERGY_COLORS[todayLog.energy] },
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.moodDivider} />
              <View style={styles.moodStat}>
                <Text style={styles.moodStatLabel}>Sleep</Text>
                <Text style={styles.moodStatValue}>{todayLog.sleepQuality}</Text>
              </View>
            </View>
            {todayLog.notes ? (
              <Text style={styles.moodNote}>"{todayLog.notes}"</Text>
            ) : null}
          </View>
        ) : (
          <Pressable style={styles.checkInCard} onPress={onCheckIn}>
            <View style={styles.checkInLeft}>
              <Heart size={22} color="#fff" />
              <View>
                <Text style={styles.checkInTitle}>How are you feeling?</Text>
                <Text style={styles.checkInSub}>Tap to log your day</Text>
              </View>
            </View>
            <View style={styles.checkInArrow}>
              <Zap size={20} color={Colors.accent} />
            </View>
          </Pressable>
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Today's Missions</Text>
            <View style={styles.progressBadge}>
              <Star size={14} color="#fff" />
              <Text style={styles.progressBadgeText}>{todayCompletedCount}/{totalCount}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          {todayPercentage === 100 ? (
            <View style={styles.allDoneBanner}>
              <Text style={styles.allDoneText}>🎉 All done today! You're crushing it!</Text>
            </View>
          ) : (
            <Text style={styles.progressHint}>
              {totalCount - todayCompletedCount} more to go — you got this!
            </Text>
          )}
        </View>

        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          {habits.map(habit => {
            const isDone = habit.completedDays[todayIndex];
            const weekDone = habit.completedDays.filter(Boolean).length;
            return (
              <Pressable
                key={habit.id}
                style={[styles.habitRow, isDone && styles.habitRowDone]}
                onPress={() => handleHabitToggle(habit.id)}
                testID={`child-habit-${habit.id}`}
              >
                <View style={[styles.habitCheck, isDone && styles.habitCheckDone]}>
                  {isDone ? (
                    <Text style={styles.habitCheckEmoji}>✓</Text>
                  ) : null}
                </View>
                <View style={styles.habitInfo}>
                  <View style={styles.habitTitleRow}>
                    <Text style={styles.habitEmoji}>{categoryEmojis[habit.category]}</Text>
                    <Text style={[styles.habitTitle, isDone && styles.habitTitleDone]}>
                      {habit.title}
                    </Text>
                  </View>
                  <View style={styles.habitWeekDots}>
                    {dayLabels.map((label, i) => (
                      <View
                        key={i}
                        style={[
                          styles.habitDayDot,
                          habit.completedDays[i] && styles.habitDayDotDone,
                          i === todayIndex && styles.habitDayDotToday,
                        ]}
                      />
                    ))}
                    <Text style={styles.habitWeekCount}>{weekDone}/7</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {topReward && (
          <View style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <Text style={styles.rewardEmoji}>{topReward.emoji}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{topReward.title}</Text>
                <Text style={styles.rewardProgress}>
                  {topReward.pointsEarned}/{topReward.pointsRequired} pts
                </Text>
              </View>
              <Trophy size={20} color={Colors.reward} />
            </View>
            <View style={styles.rewardTrack}>
              <View
                style={[
                  styles.rewardBar,
                  { width: `${Math.min((topReward.pointsEarned / topReward.pointsRequired) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.weekSummary}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekBarRow}>
            {dayLabels.map((label, i) => {
              const dayDone = habits.filter(h => h.completedDays[i]).length;
              const pct = habits.length > 0 ? dayDone / habits.length : 0;
              return (
                <View key={i} style={styles.weekBarItem}>
                  <View style={styles.weekBarTrack}>
                    <View
                      style={[
                        styles.weekBarFill,
                        { height: `${Math.max(pct * 100, 6)}%` },
                        i === todayIndex && styles.weekBarToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.weekBarLabel, i === todayIndex && styles.weekBarLabelToday]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.weekPct}>{weeklyPercentage}% completed this week</Text>
        </View>

        <Pressable style={styles.parentSwitch} onPress={onSwitchToParent}>
          <Lock size={14} color={Colors.textMuted} />
          <Text style={styles.parentSwitchText}>Switch to Parent Mode</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {},
  heyText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#2D2B55',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: '#8B87B3',
    marginTop: 4,
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8E4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C5BFFF',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  checkInCard: {
    backgroundColor: '#6C5CE7',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkInTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  checkInSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  checkInArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2D2B55',
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodStat: {
    flex: 1,
    alignItems: 'center',
  },
  moodStatLabel: {
    fontSize: 11,
    color: '#8B87B3',
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  moodStatValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D2B55',
    textTransform: 'capitalize' as const,
  },
  moodDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E8E4FF',
  },
  energyRow: {
    flexDirection: 'row',
    gap: 3,
  },
  energyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8E4FF',
  },
  moodNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#8B87B3',
    fontStyle: 'italic' as const,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#2D2B55',
  },
  progressBadge: {
    flexDirection: 'row',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    gap: 5,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#fff',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#F0EDFF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#6C5CE7',
    borderRadius: 6,
  },
  progressHint: {
    fontSize: 13,
    color: '#8B87B3',
    textAlign: 'center',
  },
  allDoneBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  allDoneText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#2D6A4F',
  },
  habitsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2D2B55',
    marginBottom: 12,
  },
  habitRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  habitRowDone: {
    backgroundColor: '#F0FFF4',
    borderColor: '#C8E6D0',
  },
  habitCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#D4D0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  habitCheckDone: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  habitCheckEmoji: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700' as const,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  habitEmoji: {
    fontSize: 16,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#2D2B55',
    flex: 1,
  },
  habitTitleDone: {
    color: '#8B87B3',
    textDecorationLine: 'line-through',
  },
  habitWeekDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E4FF',
  },
  habitDayDotDone: {
    backgroundColor: '#6C5CE7',
  },
  habitDayDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  habitWeekCount: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#8B87B3',
    marginLeft: 4,
  },
  rewardCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rewardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rewardEmoji: {
    fontSize: 32,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  rewardProgress: {
    fontSize: 13,
    color: '#B45309',
    marginTop: 2,
  },
  rewardTrack: {
    height: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 5,
    overflow: 'hidden',
  },
  rewardBar: {
    height: 10,
    backgroundColor: '#D4A017',
    borderRadius: 5,
  },
  weekSummary: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  weekBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 10,
  },
  weekBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  weekBarTrack: {
    width: 18,
    height: 44,
    backgroundColor: '#F0EDFF',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  weekBarFill: {
    width: 18,
    backgroundColor: '#C5BFFF',
    borderRadius: 6,
  },
  weekBarToday: {
    backgroundColor: '#6C5CE7',
  },
  weekBarLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#8B87B3',
  },
  weekBarLabelToday: {
    color: '#6C5CE7',
    fontWeight: '800' as const,
  },
  weekPct: {
    fontSize: 13,
    color: '#8B87B3',
    textAlign: 'center',
  },
  parentSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginBottom: 10,
  },
  parentSwitchText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
});
