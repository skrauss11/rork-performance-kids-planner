import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, TrendingUp, BookOpen, Zap, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { getGreeting, getFormattedDate, formatEventDate, getDaysUntil } from '@/utils/date';
import CategoryCard from '@/components/CategoryCard';
import ChildDashboard from '@/components/ChildDashboard';
import ChildCheckIn from '@/components/ChildCheckIn';
import { HabitCategory } from '@/types';
import { dayLabels } from '@/mocks/habits';

const categories: HabitCategory[] = ['sleep', 'sunlight', 'nutrition', 'hydration', 'movement', 'recovery'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    profile, todayCompletedCount, totalCount, todayPercentage,
    weeklyPercentage, categoryProgress, streak, hasProfile,
    upcomingEvents, todayIndex, habits,
    appMode, switchMode, parentPin, verifyPin,
  } = useApp();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinAttempt, setPinAttempt] = useState<string>('');

  const handleSwitchToParent = useCallback(() => {
    if (parentPin) {
      setShowPinModal(true);
      setPinAttempt('');
    } else {
      switchMode('parent');
    }
  }, [parentPin, switchMode]);

  const handlePinSubmit = useCallback(() => {
    if (verifyPin(pinAttempt)) {
      setShowPinModal(false);
      setPinAttempt('');
      switchMode('parent');
    } else {
      Alert.alert('Wrong PIN', 'That PIN doesn\'t match. Try again.');
      setPinAttempt('');
    }
  }, [pinAttempt, verifyPin, switchMode]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: weeklyPercentage / 100,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [weeklyPercentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const displayName = hasProfile ? profile.name.split(' ')[0] : 'Champion';
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  if (appMode === 'child' && showCheckIn) {
    return (
      <ChildCheckIn
        onComplete={() => setShowCheckIn(false)}
        onBack={() => setShowCheckIn(false)}
      />
    );
  }

  if (appMode === 'child') {
    return (
      <>
        <ChildDashboard
          onCheckIn={() => setShowCheckIn(true)}
          onSwitchToParent={handleSwitchToParent}
        />
        <Modal visible={showPinModal} animationType="fade" transparent>
          <View style={pinStyles.overlay}>
            <View style={pinStyles.content}>
              <Text style={pinStyles.title}>Parent PIN</Text>
              <Text style={pinStyles.subtitle}>Enter your 4-digit PIN to switch</Text>
              <TextInput
                style={pinStyles.input}
                value={pinAttempt}
                onChangeText={setPinAttempt}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor="#B0ADC8"
                autoFocus
              />
              <Pressable style={pinStyles.submitBtn} onPress={handlePinSubmit}>
                <Text style={pinStyles.submitText}>Unlock</Text>
              </Pressable>
              <Pressable style={pinStyles.cancelBtn} onPress={() => setShowPinModal(false)}>
                <Text style={pinStyles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.nameText}>{displayName}'s Week</Text>
              <Text style={styles.dateText}>{getFormattedDate()}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={18} color={Colors.accent} />
              <Text style={styles.streakNumber}>{streak.current}</Text>
            </View>
          </View>

          {nextEvent && (
            <Pressable
              style={styles.nextEventCard}
              onPress={() => router.push('/gameday' as any)}
            >
              <View style={styles.nextEventHeader}>
                <Zap size={16} color={Colors.accent} />
                <Text style={styles.nextEventLabel}>Next Event</Text>
                <View style={styles.nextEventCountdown}>
                  <Text style={styles.nextEventCountdownText}>
                    {getDaysUntil(nextEvent.date) === 0
                      ? 'Today!'
                      : getDaysUntil(nextEvent.date) === 1
                        ? 'Tomorrow'
                        : `${getDaysUntil(nextEvent.date)} days`}
                  </Text>
                </View>
              </View>
              <Text style={styles.nextEventTitle}>{nextEvent.title}</Text>
              <View style={styles.nextEventMeta}>
                <Calendar size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.nextEventDate}>
                  {formatEventDate(nextEvent.date)}
                  {nextEvent.time ? ` at ${nextEvent.time}` : ''}
                </Text>
              </View>
            </Pressable>
          )}

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>This Week</Text>
                <Text style={styles.progressSubtitle}>{todayCompletedCount}/{totalCount} completed today</Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{weeklyPercentage}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            <View style={styles.weekDaysRow}>
              {dayLabels.map((label, i) => {
                const dayCompleted = habits.filter(h => h.completedDays[i]).length;
                const dayTotal = habits.length;
                const dayPct = dayTotal > 0 ? dayCompleted / dayTotal : 0;
                return (
                  <View key={i} style={styles.weekDayItem}>
                    <View style={styles.weekDayBarTrack}>
                      <View style={[
                        styles.weekDayBar,
                        { height: `${Math.max(dayPct * 100, 4)}%` },
                        i === todayIndex && styles.weekDayBarToday,
                      ]} />
                    </View>
                    <Text style={[
                      styles.weekDayLabel,
                      i === todayIndex && styles.weekDayLabelToday,
                    ]}>{label}</Text>
                  </View>
                );
              })}
            </View>

            {todayPercentage === 100 && (
              <View style={styles.completedBanner}>
                <Text style={styles.completedText}>🎉 All habits completed today!</Text>
              </View>
            )}
          </View>

          <View style={styles.quickActions}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/habits' as any)}>
              <TrendingUp size={20} color={Colors.primary} />
              <Text style={styles.actionLabel}>Track Habits</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/gameday' as any)}>
              <Zap size={20} color={Colors.accent} />
              <Text style={styles.actionLabel}>Game Day</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/learn' as any)}>
              <BookOpen size={20} color={Colors.primaryMuted} />
              <Text style={styles.actionLabel}>Learn</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Categories</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  completed={categoryProgress[cat].completed}
                  total={categoryProgress[cat].total}
                  onPress={() => router.push('/habits' as any)}
                />
              ))}
            </View>
          </View>

          <View style={styles.scienceTip}>
            <Text style={styles.tipLabel}>💡 Weekly Insight</Text>
            <Text style={styles.tipText}>
              Consistency beats perfection. Research shows that completing habits 5 out of 7 days per week leads to 85% habit retention after 6 months — compared to only 35% for all-or-nothing approaches.
            </Text>
            <Text style={styles.tipSource}>— European Journal of Social Psychology</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const pinStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#2D2B55',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B87B3',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2D2B55',
    textAlign: 'center',
    letterSpacing: 12,
    borderWidth: 2,
    borderColor: '#E8E4FF',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: '#8B87B3',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  nextEventCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  nextEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  nextEventLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accentLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    flex: 1,
  },
  nextEventCountdown: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextEventCountdownText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  nextEventTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 6,
  },
  nextEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextEventDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  progressSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 52,
  },
  weekDayItem: {
    alignItems: 'center',
    flex: 1,
  },
  weekDayBarTrack: {
    width: 16,
    height: 36,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  weekDayBar: {
    width: 16,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 4,
  },
  weekDayBarToday: {
    backgroundColor: Colors.accent,
  },
  weekDayLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  weekDayLabelToday: {
    color: Colors.accent,
    fontWeight: '800' as const,
  },
  completedBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scienceTip: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accentLight,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
    marginBottom: 10,
  },
  tipSource: {
    fontSize: 11,
    color: '#8FAF9E',
    fontStyle: 'italic' as const,
  },
});
