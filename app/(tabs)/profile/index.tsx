import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Save, User, Calendar, Trophy, Sparkles, Users, Lock, Shield, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

const sportOptions = ['Soccer', 'Basketball', 'Baseball', 'Swimming', 'Tennis', 'Track & Field', 'Gymnastics', 'Football', 'Volleyball', 'Hockey', 'Martial Arts', 'Dance', 'Multi-Sport', 'Other'];
const emojiOptions = ['⚡', '🏆', '🌟', '🔥', '💪', '🎯', '🦁', '🐺', '🦅', '🏅'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, streak, todayCompletedCount, hasProfile, appMode, switchMode, parentPin, setPin, recentLogs, childLogs } = useApp();
  const [name, setName] = useState<string>(profile.name);
  const [age, setAge] = useState<string>(profile.age.toString());
  const [sport, setSport] = useState<string>(profile.sport);
  const [avatarEmoji, setAvatarEmoji] = useState<string>(profile.avatarEmoji);
  const [saved, setSaved] = useState<boolean>(false);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  const handleSwitchToChild = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    switchMode('child');
  }, [switchMode]);

  const handleSavePin = useCallback(() => {
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs don\'t match. Try again.');
      setConfirmPin('');
      return;
    }
    setPin(newPin);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('PIN Set', 'Your parent PIN has been set. This will be required to switch back from child mode.');
  }, [newPin, confirmPin, setPin]);

  const handleRemovePin = useCallback(() => {
    Alert.alert('Remove PIN?', 'Child mode will no longer require a PIN to exit.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPin('') },
    ]);
  }, [setPin]);

  const MOOD_EMOJIS: Record<string, string> = {
    great: '🤩', good: '😊', okay: '😐', tired: '😴', rough: '😓',
  };

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your child\'s name.');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 18) {
      Alert.alert('Invalid Age', 'Please enter an age between 3 and 18.');
      return;
    }

    updateProfile({
      name: name.trim(),
      age: parsedAge,
      sport,
      avatarEmoji,
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [name, age, sport, avatarEmoji, updateProfile]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Set up your young athlete's profile</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
            <View style={styles.emojiRow}>
              {emojiOptions.map(emoji => (
                <Pressable
                  key={emoji}
                  onPress={() => setAvatarEmoji(emoji)}
                  style={[styles.emojiOption, avatarEmoji === emoji && styles.emojiOptionActive]}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={14} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Child's Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Age</Text>
            </View>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="10"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Trophy size={14} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Primary Sport</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sportRow}>
                {sportOptions.map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setSport(s)}
                    style={[styles.sportChip, sport === s && styles.sportChipActive]}
                  >
                    <Text style={[styles.sportLabel, sport === s && styles.sportLabelActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <Pressable onPress={handleSave} style={[styles.saveButton, saved && styles.saveButtonSaved]}>
          {saved ? (
            <Sparkles size={18} color="#fff" />
          ) : (
            <Save size={18} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>{saved ? 'Saved!' : 'Save Profile'}</Text>
        </Pressable>

        <View style={styles.modeSection}>
          <Text style={styles.modeSectionTitle}>Child Mode</Text>
          <Text style={styles.modeSectionSubtitle}>
            Let your child check in with how they're feeling, log mood & energy, and track their habits in a fun interface.
          </Text>

          <Pressable style={styles.modeCard} onPress={handleSwitchToChild} testID="switch-child-mode">
            <View style={styles.modeCardLeft}>
              <View style={styles.modeIconWrap}>
                <Users size={22} color="#6C5CE7" />
              </View>
              <View>
                <Text style={styles.modeCardTitle}>Switch to Child Mode</Text>
                <Text style={styles.modeCardSub}>
                  {appMode === 'child' ? 'Currently active' : 'Hand the phone to your child'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Pressable>

          <Pressable
            style={styles.pinCard}
            onPress={parentPin ? handleRemovePin : () => { setShowPinSetup(true); setNewPin(''); setConfirmPin(''); }}
          >
            <View style={styles.modeCardLeft}>
              <View style={[styles.modeIconWrap, { backgroundColor: parentPin ? '#E8F5E9' : '#FFF3E0' }]}>
                {parentPin ? <Shield size={22} color={Colors.success} /> : <Lock size={22} color={Colors.warning} />}
              </View>
              <View>
                <Text style={styles.modeCardTitle}>{parentPin ? 'Parent PIN Active' : 'Set Parent PIN'}</Text>
                <Text style={styles.modeCardSub}>
                  {parentPin ? 'Tap to remove PIN lock' : 'Require PIN to exit child mode'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {recentLogs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.statsSectionTitle}>Recent Child Check-Ins</Text>
            {recentLogs.slice(0, 5).map(log => (
              <View key={log.id} style={styles.logCard}>
                <Text style={styles.logEmoji}>{MOOD_EMOJIS[log.mood] || '😊'}</Text>
                <View style={styles.logInfo}>
                  <Text style={styles.logDate}>
                    {new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.logDetail}>
                    Mood: {log.mood} · Energy: {log.energy}/5 · Sleep: {log.sleepQuality}
                  </Text>
                  {log.soreness.length > 0 && (
                    <Text style={styles.logSoreness}>Sore: {log.soreness.join(', ')}</Text>
                  )}
                  {log.notes ? <Text style={styles.logNotes} numberOfLines={2}>"{log.notes}"</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {hasProfile && (
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{streak.current}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayCompletedCount}</Text>
                <Text style={styles.statLabel}>Completed Today</Text>
              </View>
            </View>
          </View>
        )}

        <Modal visible={showPinSetup} animationType="slide" transparent>
          <View style={styles.pinOverlay}>
            <View style={styles.pinContent}>
              <Text style={styles.pinTitle}>Set Parent PIN</Text>
              <Text style={styles.pinSubtitle}>Create a 4-digit PIN to lock child mode</Text>

              <View style={styles.pinInputGroup}>
                <Text style={styles.pinFieldLabel}>New PIN</Text>
                <View style={styles.pinInputRow}>
                  <TextInput
                    style={styles.pinInput}
                    value={newPin}
                    onChangeText={setNewPin}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showPin}
                    placeholder="\u2022\u2022\u2022\u2022"
                    placeholderTextColor={Colors.textMuted}
                    autoFocus
                  />
                  <Pressable onPress={() => setShowPin(!showPin)} hitSlop={10}>
                    {showPin ? <EyeOff size={20} color={Colors.textMuted} /> : <Eye size={20} color={Colors.textMuted} />}
                  </Pressable>
                </View>
              </View>

              <View style={styles.pinInputGroup}>
                <Text style={styles.pinFieldLabel}>Confirm PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  placeholder="\u2022\u2022\u2022\u2022"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <Pressable style={styles.pinSaveBtn} onPress={handleSavePin}>
                <Text style={styles.pinSaveBtnText}>Save PIN</Text>
              </Pressable>
              <Pressable style={styles.pinCancelBtn} onPress={() => setShowPinSetup(false)}>
                <Text style={styles.pinCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Peak Jr.</Text>
          <Text style={styles.aboutText}>
            Peak Jr. helps parents optimize their child's athletic development through science-backed daily habits. Every recommendation is grounded in peer-reviewed research from leading institutions.
          </Text>
          <Text style={styles.disclaimer}>
            This app provides general wellness information and is not a substitute for professional medical advice.
          </Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  emojiScroll: {
    maxHeight: 44,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emojiOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  emojiText: {
    fontSize: 18,
  },
  formSection: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sportRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sportChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  sportLabelActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  saveButtonSaved: {
    backgroundColor: Colors.success,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  aboutSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  modeSection: {
    marginBottom: 28,
  },
  modeSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  modeSectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4FF',
    marginBottom: 10,
  },
  modeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modeCardSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logsSection: {
    marginBottom: 28,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  logEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  logInfo: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  logDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  logSoreness: {
    fontSize: 12,
    color: Colors.warning,
    marginBottom: 2,
  },
  logNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
    marginTop: 2,
  },
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pinContent: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
  },
  pinTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  pinSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  pinInputGroup: {
    marginBottom: 16,
  },
  pinFieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingRight: 14,
  },
  pinInput: {
    flex: 1,
    padding: 14,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 8,
    textAlign: 'center',
  },
  pinSaveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  pinSaveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  pinCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pinCancelText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 17,
    fontStyle: 'italic' as const,
  },
});
