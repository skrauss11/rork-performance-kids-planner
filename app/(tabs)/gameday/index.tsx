import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, MapPin, Clock, Trash2, ChevronRight, Zap, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { GameEvent } from '@/types';
import { formatEventDate, getDaysUntil, isToday, isTomorrow } from '@/utils/date';
import { gameDayTips, timingLabels, timingOrder } from '@/mocks/gameday';
import { useRouter } from 'expo-router';

export default function GameDayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { upcomingEvents, addEvent, removeEvent, profile } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [showTips, setShowTips] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSport, setNewSport] = useState(profile.sport || '');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddEvent = useCallback(() => {
    if (!newTitle.trim() || !newDate.trim()) return;

    const event: GameEvent = {
      id: `event-${Date.now()}`,
      title: newTitle.trim(),
      sport: newSport.trim() || profile.sport,
      date: newDate.trim(),
      time: newTime.trim(),
      location: newLocation.trim(),
      notes: newNotes.trim(),
      notifyBefore: 24,
    };

    addEvent(event);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setNewTitle('');
    setNewSport(profile.sport || '');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewNotes('');
    setShowAddModal(false);
  }, [newTitle, newSport, newDate, newTime, newLocation, newNotes, profile.sport, addEvent]);

  const handleRemoveEvent = useCallback((eventId: string) => {
    removeEvent(eventId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedEvent(null);
    setShowTips(false);
  }, [removeEvent]);

  const handleEventPress = useCallback((event: GameEvent) => {
    setSelectedEvent(event);
    setShowTips(true);
  }, []);

  const getCountdownLabel = useCallback((dateStr: string) => {
    if (isToday(dateStr)) return 'Today';
    if (isTomorrow(dateStr)) return 'Tomorrow';
    const days = getDaysUntil(dateStr);
    if (days < 0) return 'Past';
    return `${days} days`;
  }, []);

  const getCountdownColor = useCallback((dateStr: string) => {
    const days = getDaysUntil(dateStr);
    if (days <= 0) return Colors.accent;
    if (days <= 1) return Colors.error;
    if (days <= 3) return Colors.warning;
    return Colors.primary;
  }, []);

  const relevantTips = useMemo(() => {
    if (!selectedEvent) return [];
    const days = getDaysUntil(selectedEvent.date);
    if (days <= 0) {
      return gameDayTips.filter(t => t.timing === 'post-game' || t.timing === 'during');
    }
    if (days === 1) {
      return gameDayTips.filter(t => t.timing === 'night-before' || t.timing === 'morning-of' || t.timing === 'pre-game');
    }
    return gameDayTips;
  }, [selectedEvent]);

  const groupedTips = useMemo(() => {
    const groups: Record<string, typeof gameDayTips> = {};
    relevantTips.forEach(tip => {
      if (!groups[tip.timing]) groups[tip.timing] = [];
      groups[tip.timing].push(tip);
    });
    return groups;
  }, [relevantTips]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showTips && selectedEvent ? (
        <View style={styles.tipsView}>
          <View style={styles.tipsHeader}>
            <Pressable onPress={() => setShowTips(false)} style={styles.backButton}>
              <ChevronRight size={20} color={Colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Pressable onPress={() => handleRemoveEvent(selectedEvent.id)} style={styles.deleteButton}>
              <Trash2 size={18} color={Colors.error} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tipsScrollContent}>
            <View style={styles.eventDetailCard}>
              <View style={styles.eventDetailTop}>
                <View style={[styles.countdownPill, { backgroundColor: getCountdownColor(selectedEvent.date) + '18' }]}>
                  <Text style={[styles.countdownPillText, { color: getCountdownColor(selectedEvent.date) }]}>
                    {getCountdownLabel(selectedEvent.date)}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
              <View style={styles.eventDetailMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{formatEventDate(selectedEvent.date)}</Text>
                </View>
                {selectedEvent.time ? (
                  <View style={styles.metaItem}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{selectedEvent.time}</Text>
                  </View>
                ) : null}
                {selectedEvent.location ? (
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{selectedEvent.location}</Text>
                  </View>
                ) : null}
              </View>
              {selectedEvent.notes ? (
                <Text style={styles.eventNotes}>{selectedEvent.notes}</Text>
              ) : null}
            </View>

            <View style={styles.tipsSection}>
              <View style={styles.tipsSectionHeader}>
                <Zap size={18} color={Colors.accent} />
                <Text style={styles.tipsSectionTitle}>Peak Performance Plan</Text>
              </View>
              <Text style={styles.tipsSectionSubtitle}>
                Science-backed tips to maximize performance
              </Text>
            </View>

            {timingOrder.map(timing => {
              const tips = groupedTips[timing];
              if (!tips || tips.length === 0) return null;
              return (
                <View key={timing} style={styles.timingGroup}>
                  <View style={styles.timingHeader}>
                    <View style={styles.timingDot} />
                    <Text style={styles.timingLabel}>{timingLabels[timing]}</Text>
                  </View>
                  {tips.map(tip => (
                    <TipCard key={tip.id} tip={tip} />
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <Animated.View style={[styles.mainView, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Game Day</Text>
              <Text style={styles.subtitle}>Prepare for peak performance</Text>
            </View>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={styles.addButton}
            >
              <Plus size={20} color="#fff" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {upcomingEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyTitle}>No upcoming events</Text>
                <Text style={styles.emptySubtitle}>
                  Add a game or event to get personalized performance tips and a preparation timeline.
                </Text>
                <Pressable onPress={() => setShowAddModal(true)} style={styles.emptyButton}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.emptyButtonText}>Schedule Event</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {upcomingEvents.map(event => (
                  <Pressable
                    key={event.id}
                    onPress={() => handleEventPress(event)}
                    style={styles.eventCard}
                  >
                    <View style={styles.eventCardLeft}>
                      <View style={[styles.countdownBadge, { backgroundColor: getCountdownColor(event.date) }]}>
                        <Text style={styles.countdownText}>{getCountdownLabel(event.date)}</Text>
                      </View>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventMeta}>
                        <Calendar size={12} color={Colors.textMuted} />
                        <Text style={styles.eventMetaText}>{formatEventDate(event.date)}</Text>
                        {event.time ? (
                          <>
                            <Clock size={12} color={Colors.textMuted} />
                            <Text style={styles.eventMetaText}>{event.time}</Text>
                          </>
                        ) : null}
                      </View>
                      {event.location ? (
                        <View style={styles.eventMeta}>
                          <MapPin size={12} color={Colors.textMuted} />
                          <Text style={styles.eventMetaText}>{event.location}</Text>
                        </View>
                      ) : null}
                    </View>
                    <ChevronRight size={20} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </>
            )}

            <View style={styles.quickTipCard}>
              <Text style={styles.quickTipLabel}>⚡ Quick Tip</Text>
              <Text style={styles.quickTipText}>
                The 48-hour window before competition is critical. Sleep, hydration, and nutrition choices during this window account for up to 30% of game-day performance.
              </Text>
              <Text style={styles.quickTipSource}>— Journal of Sports Sciences</Text>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Event</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <X size={22} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Event Name *</Text>
              <TextInput
                style={styles.input}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Championship Game"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Sport</Text>
              <TextInput
                style={styles.input}
                value={newSport}
                onChangeText={setNewSport}
                placeholder="e.g. Soccer, Basketball"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="2026-03-15"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={newTime}
                onChangeText={setNewTime}
                placeholder="e.g. 3:00 PM"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="e.g. Central Park Field"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="Any details or reminders..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />

              <Pressable
                onPress={handleAddEvent}
                style={[styles.saveButton, (!newTitle.trim() || !newDate.trim()) && styles.saveButtonDisabled]}
                disabled={!newTitle.trim() || !newDate.trim()}
              >
                <Text style={styles.saveButtonText}>Add Event</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TipCard({ tip }: { tip: typeof gameDayTips[0] }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = useCallback(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(prev => !prev);
  }, [expanded]);

  return (
    <Pressable onPress={toggleExpand} style={styles.tipCard}>
      <View style={styles.tipCardHeader}>
        <Text style={styles.tipIcon}>{tip.icon}</Text>
        <View style={styles.tipCardContent}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
      </View>
      {expanded && (
        <View style={styles.tipScienceBox}>
          <Text style={styles.tipScienceLabel}>🔬 The Science</Text>
          <Text style={styles.tipScienceText}>{tip.scienceNote}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainView: {
    flex: 1,
  },
  tipsView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventCardLeft: {
    flex: 1,
  },
  countdownBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 10,
  },
  quickTipCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
  },
  quickTipLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accentLight,
    marginBottom: 10,
  },
  quickTipText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
    marginBottom: 10,
  },
  quickTipSource: {
    fontSize: 11,
    color: '#8FAF9E',
    fontStyle: 'italic' as const,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  tipsScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  eventDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  eventDetailTop: {
    marginBottom: 10,
  },
  countdownPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  countdownPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  eventDetailTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  eventDetailMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventNotes: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 14,
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipsSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  tipsSectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timingGroup: {
    marginBottom: 20,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timingLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primaryLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tipCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  tipCardContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  tipScienceBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  tipScienceLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primaryLight,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tipScienceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  modalClose: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
