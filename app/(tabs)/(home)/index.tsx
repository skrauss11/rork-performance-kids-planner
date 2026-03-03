import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, TrendingUp, BookOpen, Zap, Calendar, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { getGreeting, getFormattedDate, formatEventDate, getDaysUntil } from '@/utils/date';
import CategoryCard from '@/components/CategoryCard';
import ChildDashboard from '@/components/ChildDashboard';
import ChildCheckIn from '@/components/ChildCheckIn';
import TrendGraph from '@/components/TrendGraph';
import ProgressRing from '@/components/ProgressRing';
import { HabitCategory } from '@/types';
import { dayLabels } from '@/mocks/habits';

const categories: HabitCategory[] = ['sleep', 'sunlight', 'nutrition', 'hydration', 'movement', 'recovery'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    profile, todayCompletedCount, totalCount, todayPercentage,
    weeklyPercentage, categoryProgress, streak, hasProfile,
    upcomingEvents, todayIndex, habits, children, activeChild,
    switchActiveChild, dailyCompletionData, moodTrendData, energyTrendData,
    appMode, switchMode, parentPin, verifyPin,
  } = useApp();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinAttempt, setPinAttempt] = useState<string>('');
  const [showChildPicker, setShowChildPicker] = useState<boolean>(false);

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
                placeholderTextColor={Colors.textMuted}
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
              <Text style={styles.nameText}>{displayName}&apos;s Week</Text>
              <Text style={styles.dateText}>{getFormattedDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              {children.length > 1 && (
                <Pressable style={styles.childPicker} onPress={() => setShowChildPicker(true)}>
                  <Text style={styles.childPickerEmoji}>{activeChild?.avatarEmoji || '⚡'}</Text>
                  <ChevronDown size={14} color={Colors.textSecondary} />
                </Pressable>
              )}
              <View style={styles.streakBadge}>
                <Flame size={16} color={Colors.accent} />
                <Text style={styles.streakNumber}>{streak.current}</Text>
              </View>
            </View>
          </View>

          {nextEvent && (
            <Pressable
              style={styles.nextEventCard}
              onPress={() => router.push('/gameday' as any)}
            >
              <View style={styles.nextEventGlow} />
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
                <Calendar size={12} color={Colors.textSecondary} />
                <Text style={styles.nextEventDate}>
                  {formatEventDate(nextEvent.date)}
                  {nextEvent.time ? ` at ${nextEvent.time}` : ''}
                </Text>
              </View>
            </Pressable>
          )}

          <View style={styles.ringSection}>
            <ProgressRing percentage={todayPercentage} size={140} strokeWidth={10} color={Colors.primary} />
            <View style={styles.ringStats}>
              <View style={styles.ringStat}>
                <Text style={styles.ringStatValue}>{todayCompletedCount}</Text>
                <Text style={styles.ringStatLabel}>Done Today</Text>
              </View>
              <View style={styles.ringDivider} />
              <View style={styles.ringStat}>
                <Text style={styles.ringStatValue}>{totalCount}</Text>
                <Text style={styles.ringStatLabel}>Total Habits</Text>
              </View>
              <View style={styles.ringDivider} />
              <View style={styles.ringStat}>
                <Text style={[styles.ringStatValue, { color: Colors.accent }]}>{weeklyPercentage}%</Text>
                <Text style={styles.ringStatLabel}>This Week</Text>
              </View>
            </View>
          </View>

          <View style={styles.trendCard}>
            <TrendGraph
              data={dailyCompletionData}
              title="Weekly Progress"
              subtitle="Daily completion rate"
              height={140}
              color={Colors.primary}
              showBars
              maxValue={100}
            />
          </View>

          {moodTrendData.length > 1 && (
            <View style={styles.trendCard}>
              <TrendGraph
                data={moodTrendData}
                title="Mood Trend"
                subtitle="Recent check-in mood scores"
                height={120}
                color={Colors.info}
                maxValue={5}
                unit=""
              />
            </View>
          )}

          {energyTrendData.length > 1 && (
            <View style={styles.trendCard}>
              <TrendGraph
                data={energyTrendData}
                title="Energy Trend"
                subtitle="Recent energy levels"
                height={120}
                color={Colors.accent}
                maxValue={5}
                unit=""
              />
            </View>
          )}

          <View style={styles.quickActions}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/habits' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: Colors.primaryMuted }]}>
                <TrendingUp size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Track Habits</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/gameday' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: Colors.accentMuted }]}>
                <Zap size={20} color={Colors.accent} />
              </View>
              <Text style={styles.actionLabel}>Game Day</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/learn' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(91, 141, 239, 0.15)' }]}>
                <BookOpen size={20} color={Colors.info} />
              </View>
              <Text style={styles.actionLabel}>Learn</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Categories</Text>
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

          <View style={styles.weekCard}>
            <Text style={styles.weekCardTitle}>Week at a Glance</Text>
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

          <View style={styles.scienceTip}>
            <Text style={styles.tipLabel}>💡 Weekly Insight</Text>
            <Text style={styles.tipText}>
              Consistency beats perfection. Research shows that completing habits 5 out of 7 days per week leads to 85% habit retention after 6 months — compared to only 35% for all-or-nothing approaches.
            </Text>
            <Text style={styles.tipSource}>— European Journal of Social Psychology</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal visible={showChildPicker} animationType="fade" transparent>
        <Pressable style={styles.pickerOverlay} onPress={() => setShowChildPicker(false)}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Switch Athlete</Text>
            {children.map(child => (
              <Pressable
                key={child.id}
                style={[styles.pickerItem, child.id === activeChild?.id && styles.pickerItemActive]}
                onPress={() => {
                  switchActiveChild(child.id);
                  setShowChildPicker(false);
                }}
              >
                <Text style={styles.pickerEmoji}>{child.avatarEmoji}</Text>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{child.name}</Text>
                  <Text style={styles.pickerMeta}>Age {child.age} · {child.sport}</Text>
                </View>
                {child.id === activeChild?.id && (
                  <View style={styles.pickerCheck}>
                    <Text style={styles.pickerCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const pinStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textMuted,
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  childPickerEmoji: {
    fontSize: 18,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 5,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  nextEventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    overflow: 'hidden',
  },
  nextEventGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.accent,
  },
  nextEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  nextEventLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    flex: 1,
  },
  nextEventCountdown: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextEventCountdownText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  nextEventTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  nextEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextEventDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  ringStats: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  ringStat: {
    alignItems: 'flex-start',
  },
  ringStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  ringStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  ringDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  trendCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
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
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  weekCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  weekCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
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
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  weekDayBar: {
    width: 16,
    backgroundColor: Colors.primaryDim,
    borderRadius: 4,
  },
  weekDayBarToday: {
    backgroundColor: Colors.primary,
  },
  weekDayLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  weekDayLabelToday: {
    color: Colors.primary,
    fontWeight: '800' as const,
  },
  completedBanner: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  scienceTip: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.info,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  tipSource: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pickerContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: Colors.surfaceLight,
    gap: 12,
  },
  pickerItemActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  pickerEmoji: {
    fontSize: 28,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pickerMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pickerCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCheckText: {
    color: Colors.background,
    fontWeight: '700' as const,
    fontSize: 14,
  },
});
