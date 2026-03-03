import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { MoodLevel, EnergyLevel, SleepQuality, ChildLog } from '@/types';

const MOODS: { value: MoodLevel; emoji: string; label: string; color: string }[] = [
  { value: 'great', emoji: '🤩', label: 'Great', color: '#43A047' },
  { value: 'good', emoji: '😊', label: 'Good', color: '#66BB6A' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#FFA726' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#42A5F5' },
  { value: 'rough', emoji: '😓', label: 'Rough', color: '#EF5350' },
];

const SLEEP_OPTIONS: { value: SleepQuality; emoji: string; label: string }[] = [
  { value: 'amazing', emoji: '😴💤', label: 'Amazing' },
  { value: 'good', emoji: '😌', label: 'Good' },
  { value: 'okay', emoji: '😑', label: 'Okay' },
  { value: 'poor', emoji: '😣', label: 'Poor' },
  { value: 'terrible', emoji: '🥱', label: 'Terrible' },
];

const SORENESS_AREAS = [
  'Legs', 'Arms', 'Back', 'Shoulders', 'Knees', 'Ankles', 'Neck', 'Nothing!',
];

interface ChildCheckInProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ChildCheckIn({ onComplete, onBack }: ChildCheckInProps) {
  const insets = useSafeAreaInsets();
  const { addChildLog, profile } = useApp();

  const [step, setStep] = useState<number>(0);
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [soreness, setSoreness] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const doneScale = useRef(new Animated.Value(0)).current;

  const totalSteps = 5;

  const animateStep = useCallback((forward: boolean) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: forward ? -30 : 30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(forward ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) {
      animateStep(true);
      setStep(s => s + 1);
    }
  }, [step, animateStep]);

  const goBack = useCallback(() => {
    if (step > 0) {
      animateStep(false);
      setStep(s => s - 1);
    } else {
      onBack();
    }
  }, [step, animateStep, onBack]);

  const handleSubmit = useCallback(() => {
    if (!mood || !energy || !sleepQuality) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const log: ChildLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood,
      energy,
      sleepQuality,
      soreness,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log('[ChildCheckIn] Submitting log:', log);
    addChildLog(log);

    Animated.spring(doneScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => onComplete(), 1500);
  }, [mood, energy, sleepQuality, soreness, notes, addChildLog, onComplete, doneScale]);

  const handleSelectMood = useCallback((m: MoodLevel) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMood(m);
    setTimeout(goNext, 300);
  }, [goNext]);

  const handleSelectEnergy = useCallback((e: EnergyLevel) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEnergy(e);
    setTimeout(goNext, 300);
  }, [goNext]);

  const handleSelectSleep = useCallback((s: SleepQuality) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSleepQuality(s);
    setTimeout(goNext, 300);
  }, [goNext]);

  const toggleSoreness = useCallback((area: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (area === 'Nothing!') {
      setSoreness([]);
      return;
    }
    setSoreness(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  }, []);

  const canSubmit = mood && energy && sleepQuality;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>How are you feeling?</Text>
            <Text style={styles.stepSubtitle}>Pick the one that matches your vibe</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(m => (
                <Pressable
                  key={m.value}
                  style={[
                    styles.moodOption,
                    mood === m.value && { borderColor: m.color, backgroundColor: m.color + '20' },
                  ]}
                  onPress={() => handleSelectMood(m.value)}
                  testID={`mood-${m.value}`}
                >
                  <Text style={styles.moodOptionEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodOptionLabel, mood === m.value && { color: m.color }]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>⚡</Text>
            <Text style={styles.stepTitle}>Energy level?</Text>
            <Text style={styles.stepSubtitle}>Rate your energy from 1 to 5</Text>
            <View style={styles.energyGrid}>
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => {
                const labels = ['Low', 'Meh', 'Okay', 'Strong', 'On Fire!'];
                const colors = ['#EF5350', '#FF7043', '#FFA726', '#66BB6A', '#43A047'];
                const emojis = ['😩', '😕', '😐', '💪', '🔥'];
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.energyOption,
                      energy === level && { borderColor: colors[level - 1], backgroundColor: colors[level - 1] + '20' },
                    ]}
                    onPress={() => handleSelectEnergy(level)}
                    testID={`energy-${level}`}
                  >
                    <Text style={styles.energyEmoji}>{emojis[level - 1]}</Text>
                    <Text style={styles.energyNumber}>{level}</Text>
                    <Text style={[styles.energyLabel, energy === level && { color: colors[level - 1] }]}>
                      {labels[level - 1]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🛏️</Text>
            <Text style={styles.stepTitle}>How'd you sleep?</Text>
            <Text style={styles.stepSubtitle}>Last night's sleep quality</Text>
            <View style={styles.sleepGrid}>
              {SLEEP_OPTIONS.map(s => (
                <Pressable
                  key={s.value}
                  style={[
                    styles.sleepOption,
                    sleepQuality === s.value && styles.sleepOptionActive,
                  ]}
                  onPress={() => handleSelectSleep(s.value)}
                  testID={`sleep-${s.value}`}
                >
                  <Text style={styles.sleepEmoji}>{s.emoji}</Text>
                  <Text style={[styles.sleepLabel, sleepQuality === s.value && styles.sleepLabelActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🦵</Text>
            <Text style={styles.stepTitle}>Any soreness?</Text>
            <Text style={styles.stepSubtitle}>Tap areas that feel sore (or Nothing!)</Text>
            <View style={styles.sorenessGrid}>
              {SORENESS_AREAS.map(area => {
                const isSelected = area === 'Nothing!' ? soreness.length === 0 : soreness.includes(area);
                return (
                  <Pressable
                    key={area}
                    style={[styles.sorenessChip, isSelected && styles.sorenessChipActive]}
                    onPress={() => toggleSoreness(area)}
                  >
                    <Text style={[styles.sorenessText, isSelected && styles.sorenessTextActive]}>
                      {area}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Next</Text>
            </Pressable>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📝</Text>
            <Text style={styles.stepTitle}>Anything to share?</Text>
            <Text style={styles.stepSubtitle}>How you feel, what's on your mind (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Legs felt heavy at practice, excited about the game..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              maxLength={300}
              testID="child-notes-input"
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>
            <Pressable
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              testID="submit-checkin"
            >
              <Check size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Check-In</Text>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i <= step && styles.stepDotActive,
                i === step && styles.stepDotCurrent,
              ]}
            />
          ))}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {renderStep()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.childBackground,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
  },
  stepDotActive: {
    backgroundColor: Colors.childAccent + '60',
  },
  stepDotCurrent: {
    backgroundColor: Colors.childPrimary,
    width: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  moodOption: {
    width: '28%',
    backgroundColor: Colors.childSurface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  moodOptionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodOptionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  energyGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  energyOption: {
    flex: 1,
    maxWidth: 68,
    backgroundColor: Colors.childSurface,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  energyEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  energyNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  energyLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sleepGrid: {
    width: '100%',
    gap: 10,
  },
  sleepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.childSurface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  sleepOptionActive: {
    borderColor: Colors.childPrimary,
    backgroundColor: Colors.childPrimary + '15',
  },
  sleepEmoji: {
    fontSize: 24,
  },
  sleepLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sleepLabelActive: {
    color: Colors.childPrimary,
  },
  sorenessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
    width: '100%',
  },
  sorenessChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.childSurface,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  sorenessChipActive: {
    backgroundColor: Colors.childPrimary,
    borderColor: Colors.childPrimary,
  },
  sorenessText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sorenessTextActive: {
    color: '#fff',
  },
  nextBtn: {
    backgroundColor: Colors.childPrimary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  notesInput: {
    width: '100%',
    backgroundColor: Colors.childSurface,
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    minHeight: 120,
    textAlignVertical: 'top' as const,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.childPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
