import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Save, User, Calendar, Trophy, Sparkles, Users, Lock, Shield, ChevronRight, Eye, EyeOff, Plus, Trash2, UserPlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { ChildProfile } from '@/types';

const sportOptions = ['Soccer', 'Basketball', 'Baseball', 'Swimming', 'Tennis', 'Track & Field', 'Gymnastics', 'Football', 'Volleyball', 'Hockey', 'Martial Arts', 'Dance', 'Multi-Sport', 'Other'];
const emojiOptions = ['⚡', '🏆', '🌟', '🔥', '💪', '🎯', '🦁', '🐺', '🦅', '🏅'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, updateProfile, streak, todayCompletedCount, hasProfile,
    switchMode, parentPin, setPin, recentLogs, children,
    addChild, removeChild, switchActiveChild, activeChild,
  } = useApp();
  const [name, setName] = useState<string>(profile.name);
  const [age, setAge] = useState<string>(profile.age.toString());
  const [sport, setSport] = useState<string>(profile.sport);
  const [avatarEmoji, setAvatarEmoji] = useState<string>(profile.avatarEmoji);
  const [saved, setSaved] = useState<boolean>(false);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showAddChild, setShowAddChild] = useState<boolean>(false);
  const [newChildName, setNewChildName] = useState<string>('');
  const [newChildAge, setNewChildAge] = useState<string>('10');
  const [newChildSport, setNewChildSport] = useState<string>('');
  const [newChildEmoji, setNewChildEmoji] = useState<string>('⚡');

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
    Alert.alert('PIN Set', 'Your parent PIN has been set.');
  }, [newPin, confirmPin, setPin]);

  const handleRemovePin = useCallback(() => {
    Alert.alert('Remove PIN?', 'Child mode will no longer require a PIN to exit.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPin('') },
    ]);
  }, [setPin]);

  const handleAddNewChild = useCallback(() => {
    if (!newChildName.trim()) {
      Alert.alert('Name Required', 'Please enter the child\'s name.');
      return;
    }
    const parsedAge = parseInt(newChildAge, 10);
    if (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 18) {
      Alert.alert('Invalid Age', 'Please enter an age between 3 and 18.');
      return;
    }
    const child: ChildProfile = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      age: parsedAge,
      sport: newChildSport,
      avatarEmoji: newChildEmoji,
      createdAt: new Date().toISOString(),
    };
    addChild(child);
    setShowAddChild(false);
    setNewChildName('');
    setNewChildAge('10');
    setNewChildSport('');
    setNewChildEmoji('⚡');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [newChildName, newChildAge, newChildSport, newChildEmoji, addChild]);

  const handleRemoveChild = useCallback((childId: string, childName: string) => {
    Alert.alert('Remove Athlete?', `Remove "${childName}" and all their data?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeChild(childId) },
    ]);
  }, [removeChild]);

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
    updateProfile({ name: name.trim(), age: parsedAge, sport, avatarEmoji });
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
          <Text style={styles.subtitle}>Manage your athletes</Text>
        </View>

        {children.length > 0 && (
          <View style={styles.childrenSection}>
            <View style={styles.childrenHeader}>
              <Text style={styles.sectionTitle}>Athletes</Text>
              <Pressable style={styles.addChildBtn} onPress={() => setShowAddChild(true)}>
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.addChildText}>Add</Text>
              </Pressable>
            </View>
            {children.map(child => (
              <Pressable
                key={child.id}
                style={[styles.childCard, child.id === activeChild?.id && styles.childCardActive]}
                onPress={() => switchActiveChild(child.id)}
              >
                <Text style={styles.childEmoji}>{child.avatarEmoji}</Text>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>Age {child.age} · {child.sport || 'No sport set'}</Text>
                </View>
                {child.id === activeChild?.id && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                )}
                {children.length > 1 && (
                  <Pressable
                    style={styles.removeChildBtn}
                    onPress={() => handleRemoveChild(child.id, child.name)}
                    hitSlop={10}
                  >
                    <Trash2 size={16} color={Colors.textMuted} />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        )}

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
            <View style={styles.inputLabelRow}>
              <User size={14} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Athlete&apos;s Name</Text>
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
            <View style={styles.inputLabelRow}>
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
            <View style={styles.inputLabelRow}>
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
          {saved ? <Sparkles size={18} color={Colors.background} /> : <Save size={18} color={Colors.background} />}
          <Text style={styles.saveButtonText}>{saved ? 'Saved!' : 'Save Profile'}</Text>
        </Pressable>

        {children.length === 0 && (
          <Pressable style={styles.firstChildCard} onPress={() => setShowAddChild(true)}>
            <UserPlus size={24} color={Colors.primary} />
            <Text style={styles.firstChildTitle}>Add Your First Athlete</Text>
            <Text style={styles.firstChildSub}>Set up a profile to start tracking habits and performance</Text>
          </Pressable>
        )}

        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>Child Mode</Text>
          <Text style={styles.modeSectionSubtitle}>
            Let your child see their own version of the app with check-ins and habit tracking.
          </Text>

          <Pressable style={styles.modeCard} onPress={handleSwitchToChild} testID="switch-child-mode">
            <View style={styles.modeCardLeft}>
              <View style={styles.modeIconWrap}>
                <Users size={22} color={Colors.childPrimary} />
              </View>
              <View>
                <Text style={styles.modeCardTitle}>Switch to Child Mode</Text>
                <Text style={styles.modeCardSub}>Hand the phone to your child</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Pressable>

          <Pressable
            style={styles.pinCard}
            onPress={parentPin ? handleRemovePin : () => { setShowPinSetup(true); setNewPin(''); setConfirmPin(''); }}
          >
            <View style={styles.modeCardLeft}>
              <View style={[styles.modeIconWrap, { backgroundColor: parentPin ? Colors.primaryMuted : Colors.accentMuted }]}>
                {parentPin ? <Shield size={22} color={Colors.primary} /> : <Lock size={22} color={Colors.accent} />}
              </View>
              <View>
                <Text style={styles.modeCardTitle}>{parentPin ? 'Parent PIN Active' : 'Set Parent PIN'}</Text>
                <Text style={styles.modeCardSub}>{parentPin ? 'Tap to remove PIN lock' : 'Require PIN to exit child mode'}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {recentLogs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.sectionTitle}>Recent Check-Ins</Text>
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
                  {log.notes ? <Text style={styles.logNotes} numberOfLines={2}>&ldquo;{log.notes}&rdquo;</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {hasProfile && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Stats</Text>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Parent PIN</Text>
              <Text style={styles.modalSubtitle}>Create a 4-digit PIN to lock child mode</Text>
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
                    placeholder="••••"
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
                  placeholder="••••"
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

        <Modal visible={showAddChild} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Athlete</Text>
              <Text style={styles.modalSubtitle}>Set up a new athlete profile</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newChildEmojiScroll}>
                <View style={styles.emojiRow}>
                  {emojiOptions.map(emoji => (
                    <Pressable
                      key={emoji}
                      onPress={() => setNewChildEmoji(emoji)}
                      style={[styles.emojiOption, newChildEmoji === emoji && styles.emojiOptionActive]}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.pinFieldLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={newChildName}
                onChangeText={setNewChildName}
                placeholder="Athlete's name"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.pinFieldLabel}>Age</Text>
              <TextInput
                style={styles.modalInput}
                value={newChildAge}
                onChangeText={setNewChildAge}
                placeholder="10"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />

              <Text style={styles.pinFieldLabel}>Sport</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newChildSportScroll}>
                <View style={styles.sportRow}>
                  {sportOptions.slice(0, 8).map(s => (
                    <Pressable
                      key={s}
                      onPress={() => setNewChildSport(s)}
                      style={[styles.sportChip, newChildSport === s && styles.sportChipActive]}
                    >
                      <Text style={[styles.sportLabel, newChildSport === s && styles.sportLabelActive]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Pressable style={styles.pinSaveBtn} onPress={handleAddNewChild}>
                <Text style={styles.pinSaveBtnText}>Add Athlete</Text>
              </Pressable>
              <Pressable style={styles.pinCancelBtn} onPress={() => setShowAddChild(false)}>
                <Text style={styles.pinCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Peak Jr.</Text>
          <Text style={styles.aboutText}>
            Peak Jr. helps parents optimize their child&apos;s athletic development through science-backed daily habits.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  childrenSection: {
    marginBottom: 28,
  },
  childrenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addChildText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  childCardActive: {
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primaryGlow,
  },
  childEmoji: {
    fontSize: 28,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  childMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeIndicator: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  removeChildBtn: {
    padding: 6,
  },
  firstChildCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
    gap: 12,
  },
  firstChildTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  firstChildSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
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
    borderColor: Colors.surfaceBorder,
  },
  emojiOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
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
  inputLabelRow: {
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
    borderColor: Colors.surfaceBorder,
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
    borderColor: Colors.surfaceBorder,
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
    color: Colors.background,
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
    color: Colors.background,
  },
  modeSection: {
    marginBottom: 28,
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
    borderColor: Colors.surfaceBorder,
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
    backgroundColor: Colors.childPrimary + '20',
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
    borderColor: Colors.surfaceBorder,
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
    borderColor: Colors.surfaceBorder,
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
  statsSection: {
    marginBottom: 32,
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
    borderColor: Colors.surfaceBorder,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  newChildEmojiScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  newChildSportScroll: {
    maxHeight: 44,
    marginBottom: 16,
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
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
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
    color: Colors.background,
  },
  pinCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pinCancelText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  aboutSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
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
