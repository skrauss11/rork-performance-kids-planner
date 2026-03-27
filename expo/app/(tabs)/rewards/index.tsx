import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gift, Plus, Trophy, Star, Trash2, Check, X, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { Reward } from '@/types';

const REWARD_EMOJIS = ['🎮', '🍕', '🎬', '⚽', '🛍️', '🎵', '🏖️', '🎂', '📱', '🎯', '🚲', '🧸', '🎪', '🏆', '⭐', '🎁'];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeRewards,
    redeemedRewards,
    addReward,
    updateRewardPoints,
    redeemReward,
    removeReward,
    weeklyCompletedCount,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎮');
  const [showHistory, setShowHistory] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleAddReward = useCallback(() => {
    if (!newTitle.trim() || !newPoints.trim()) {
      Alert.alert('Missing Info', 'Please add a reward name and points goal.');
      return;
    }
    const points = parseInt(newPoints, 10);
    if (isNaN(points) || points < 1) {
      Alert.alert('Invalid Points', 'Please enter a valid number of points.');
      return;
    }

    const reward: Reward = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      emoji: selectedEmoji,
      description: newDescription.trim(),
      pointsRequired: points,
      pointsEarned: 0,
      isRedeemed: false,
      createdAt: new Date().toISOString(),
      redeemedAt: null,
    };

    addReward(reward);
    setNewTitle('');
    setNewDescription('');
    setNewPoints('');
    setSelectedEmoji('🎮');
    setShowAddModal(false);
  }, [newTitle, newDescription, newPoints, selectedEmoji, addReward]);

  const handleAddPoints = useCallback((rewardId: string, points: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    updateRewardPoints(rewardId, points);
  }, [updateRewardPoints, scaleAnim]);

  const handleRedeem = useCallback((rewardId: string) => {
    redeemReward(rewardId);
    setShowRedeemModal(null);
  }, [redeemReward]);

  const handleRemove = useCallback((rewardId: string, title: string) => {
    Alert.alert('Remove Reward', `Remove "${title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeReward(rewardId) },
    ]);
  }, [removeReward]);

  const redeemTarget = activeRewards.find(r => r.id === showRedeemModal);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rewards</Text>
            <Text style={styles.subtitle}>Earn points by completing habits</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            testID="add-reward-btn"
          >
            <Plus size={20} color={Colors.background} />
          </Pressable>
        </View>

        <View style={styles.pointsSummary}>
          <View style={styles.pointsCard}>
            <View style={styles.pointsIconWrap}>
              <Star size={22} color={Colors.reward} />
            </View>
            <View>
              <Text style={styles.pointsValue}>{weeklyCompletedCount}</Text>
              <Text style={styles.pointsLabel}>Points this week</Text>
            </View>
          </View>
          <View style={styles.pointsDivider} />
          <View style={styles.pointsCard}>
            <View style={[styles.pointsIconWrap, { backgroundColor: Colors.primaryMuted }]}>
              <Trophy size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.pointsValue}>{redeemedRewards.length}</Text>
              <Text style={styles.pointsLabel}>Rewards earned</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Gift size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Each habit check-in earns 1 point. Parents set rewards and point goals — complete habits consistently to unlock them!
          </Text>
        </View>

        {activeRewards.length === 0 && redeemedRewards.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Gift size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create a reward your child can work toward
            </Text>
            <Pressable style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
              <Plus size={18} color={Colors.background} />
              <Text style={styles.emptyAddText}>Add First Reward</Text>
            </Pressable>
          </View>
        )}

        {activeRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Rewards</Text>
            {activeRewards.map(reward => {
              const progress = reward.pointsRequired > 0
                ? Math.min(reward.pointsEarned / reward.pointsRequired, 1)
                : 0;
              const isReady = reward.pointsEarned >= reward.pointsRequired;

              return (
                <Animated.View
                  key={reward.id}
                  style={[styles.rewardCard, isReady && styles.rewardCardReady]}
                >
                  <View style={styles.rewardTop}>
                    <View style={styles.rewardEmojiWrap}>
                      <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      {reward.description ? (
                        <Text style={styles.rewardDescription} numberOfLines={2}>
                          {reward.description}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => handleRemove(reward.id, reward.title)}
                      hitSlop={12}
                    >
                      <Trash2 size={16} color={Colors.textMuted} />
                    </Pressable>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${progress * 100}%` },
                          isReady && styles.progressBarReady,
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {reward.pointsEarned} / {reward.pointsRequired} pts
                    </Text>
                  </View>

                  <View style={styles.rewardActions}>
                    <View style={styles.pointButtons}>
                      <Pressable style={styles.pointBtn} onPress={() => handleAddPoints(reward.id, 1)}>
                        <Text style={styles.pointBtnText}>+1</Text>
                      </Pressable>
                      <Pressable style={styles.pointBtn} onPress={() => handleAddPoints(reward.id, 5)}>
                        <Text style={styles.pointBtnText}>+5</Text>
                      </Pressable>
                      <Pressable style={styles.pointBtn} onPress={() => handleAddPoints(reward.id, 10)}>
                        <Text style={styles.pointBtnText}>+10</Text>
                      </Pressable>
                    </View>
                    {isReady && (
                      <Pressable style={styles.redeemBtn} onPress={() => setShowRedeemModal(reward.id)}>
                        <Trophy size={16} color={Colors.background} />
                        <Text style={styles.redeemBtnText}>Redeem!</Text>
                      </Pressable>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {redeemedRewards.length > 0 && (
          <View style={styles.section}>
            <Pressable style={styles.historySectionHeader} onPress={() => setShowHistory(!showHistory)}>
              <Text style={styles.sectionTitle}>Earned Rewards</Text>
              <View style={styles.historyToggle}>
                <Text style={styles.historyCount}>{redeemedRewards.length}</Text>
                <ChevronRight
                  size={16}
                  color={Colors.textMuted}
                  style={{ transform: [{ rotate: showHistory ? '90deg' : '0deg' }] }}
                />
              </View>
            </Pressable>
            {showHistory && redeemedRewards.map(reward => (
              <View key={reward.id} style={styles.historyCard}>
                <Text style={styles.historyEmoji}>{reward.emoji}</Text>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{reward.title}</Text>
                  <Text style={styles.historyDate}>
                    {reward.redeemedAt ? new Date(reward.redeemedAt).toLocaleDateString() : 'Completed'}
                  </Text>
                </View>
                <View style={styles.historyBadge}>
                  <Check size={14} color={Colors.primary} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>💡 Parent Tip</Text>
          <Text style={styles.tipText}>
            Research shows that intrinsic motivation grows when rewards are experience-based (trips, activities, quality time) rather than purely material.
          </Text>
          <Text style={styles.tipSource}>— Self-Determination Theory, Deci & Ryan</Text>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Reward</Text>
              <Pressable onPress={() => setShowAddModal(false)} hitSlop={12}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Choose an emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll} contentContainerStyle={styles.emojiRow}>
              {REWARD_EMOJIS.map(emoji => (
                <Pressable
                  key={emoji}
                  style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiOptionSelected]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Reward name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Movie night, New cleats, Pizza party"
              placeholderTextColor={Colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              testID="reward-title-input"
            />

            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Add details about this reward..."
              placeholderTextColor={Colors.textMuted}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.fieldLabel}>Points to earn</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              placeholderTextColor={Colors.textMuted}
              value={newPoints}
              onChangeText={setNewPoints}
              keyboardType="number-pad"
              testID="reward-points-input"
            />

            <View style={styles.pointsHint}>
              <Star size={14} color={Colors.reward} />
              <Text style={styles.pointsHintText}>
                1 point = 1 habit check-in. A full week of all habits = {14 * 7} points.
              </Text>
            </View>

            <Pressable
              style={[styles.createBtn, (!newTitle.trim() || !newPoints.trim()) && styles.createBtnDisabled]}
              onPress={handleAddReward}
              testID="create-reward-btn"
            >
              <Gift size={18} color={Colors.background} />
              <Text style={styles.createBtnText}>Create Reward</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showRedeemModal} animationType="fade" transparent>
        <View style={styles.redeemOverlay}>
          <View style={styles.redeemContent}>
            {redeemTarget && (
              <>
                <Text style={styles.redeemEmoji}>{redeemTarget.emoji}</Text>
                <Text style={styles.redeemTitle}>Reward Unlocked!</Text>
                <Text style={styles.redeemName}>{redeemTarget.title}</Text>
                <Text style={styles.redeemDesc}>
                  Amazing work! All {redeemTarget.pointsRequired} points earned through consistent effort.
                </Text>
                <Pressable style={styles.redeemConfirmBtn} onPress={() => handleRedeem(redeemTarget.id)}>
                  <Trophy size={18} color={Colors.background} />
                  <Text style={styles.redeemConfirmText}>Claim Reward</Text>
                </Pressable>
                <Pressable style={styles.redeemCancelBtn} onPress={() => setShowRedeemModal(null)}>
                  <Text style={styles.redeemCancelText}>Not yet</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  pointsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.rewardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  pointsLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  pointsDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryGlow,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 260,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  emptyAddText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.background,
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
  rewardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  rewardCardReady: {
    borderColor: Colors.reward,
    borderWidth: 2,
  },
  rewardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  rewardEmojiWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.rewardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardEmoji: {
    fontSize: 26,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  rewardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  removeBtn: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.reward,
    borderRadius: 5,
  },
  progressBarReady: {
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pointBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pointBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  redeemBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  redeemBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  historyEmoji: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  emojiScroll: {
    marginBottom: 16,
    maxHeight: 52,
  },
  emojiRow: {
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: Colors.reward,
    backgroundColor: Colors.rewardLight,
  },
  emojiOptionText: {
    fontSize: 22,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 14,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  pointsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  pointsHintText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  redeemOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  redeemContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  redeemEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  redeemTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  redeemName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  redeemDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  redeemConfirmBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  redeemConfirmText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  redeemCancelBtn: {
    paddingVertical: 10,
  },
  redeemCancelText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
