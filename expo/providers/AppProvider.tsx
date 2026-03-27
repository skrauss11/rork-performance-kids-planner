import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Habit, ChildProfile, HabitCategory, GameEvent, Reward, AppMode, ChildLog, TrendDataPoint } from '@/types';
import { defaultHabits } from '@/mocks/habits';
import { getWeekKey, getDayOfWeekIndex, getDaysUntil } from '@/utils/date';

const HABITS_KEY = 'peakjr_habits_weekly';
const CHILDREN_KEY = 'peakjr_children';
const ACTIVE_CHILD_KEY = 'peakjr_active_child';
const STREAK_KEY = 'peakjr_streak';
const EVENTS_KEY = 'peakjr_events';
const REWARDS_KEY = 'peakjr_rewards';
const MODE_KEY = 'peakjr_mode';
const PIN_KEY = 'peakjr_parent_pin';
const CHILD_LOGS_KEY = 'peakjr_child_logs';
const TREND_KEY = 'peakjr_trend_history';

interface StreakData {
  current: number;
  lastCompletedWeek: string | null;
}

interface TrendHistory {
  weeklyRates: TrendDataPoint[];
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [streak, setStreak] = useState<StreakData>({ current: 0, lastCompletedWeek: null });
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('parent');
  const [parentPin, setParentPin] = useState<string>('');
  const [childLogs, setChildLogs] = useState<ChildLog[]>([]);
  const [trendHistory, setTrendHistory] = useState<TrendHistory>({ weeklyRates: [] });

  const weekKey = getWeekKey();
  const todayIndex = getDayOfWeekIndex();

  const activeChild = useMemo(() => {
    if (!activeChildId) return children[0] ?? null;
    return children.find(c => c.id === activeChildId) ?? children[0] ?? null;
  }, [children, activeChildId]);

  const childStorageKey = useMemo(() => {
    return activeChild?.id ?? 'default';
  }, [activeChild]);

  const habitsQuery = useQuery({
    queryKey: ['habits', weekKey, childStorageKey],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(`${HABITS_KEY}_${childStorageKey}_${weekKey}`);
      if (stored) return JSON.parse(stored) as Habit[];
      return defaultHabits;
    },
  });

  const childrenQuery = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHILDREN_KEY);
      if (stored) return JSON.parse(stored) as ChildProfile[];
      return [] as ChildProfile[];
    },
  });

  const activeChildQuery = useQuery({
    queryKey: ['activeChild'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
      return stored;
    },
  });

  const streakQuery = useQuery({
    queryKey: ['streak', childStorageKey],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(`${STREAK_KEY}_${childStorageKey}`);
      if (stored) return JSON.parse(stored) as StreakData;
      return { current: 0, lastCompletedWeek: null } as StreakData;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      if (stored) return JSON.parse(stored) as GameEvent[];
      return [] as GameEvent[];
    },
  });

  const rewardsQuery = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(REWARDS_KEY);
      if (stored) return JSON.parse(stored) as Reward[];
      return [] as Reward[];
    },
  });

  const modeQuery = useQuery({
    queryKey: ['appMode'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MODE_KEY);
      return (stored as AppMode) || 'parent';
    },
  });

  const pinQuery = useQuery({
    queryKey: ['parentPin'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PIN_KEY);
      return stored || '';
    },
  });

  const childLogsQuery = useQuery({
    queryKey: ['childLogs', childStorageKey],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(`${CHILD_LOGS_KEY}_${childStorageKey}`);
      if (stored) return JSON.parse(stored) as ChildLog[];
      return [] as ChildLog[];
    },
  });

  const trendQuery = useQuery({
    queryKey: ['trendHistory', childStorageKey],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(`${TREND_KEY}_${childStorageKey}`);
      if (stored) return JSON.parse(stored) as TrendHistory;
      return { weeklyRates: [] } as TrendHistory;
    },
  });

  useEffect(() => {
    if (habitsQuery.data) setHabits(habitsQuery.data);
  }, [habitsQuery.data]);

  useEffect(() => {
    if (childrenQuery.data) setChildren(childrenQuery.data);
  }, [childrenQuery.data]);

  useEffect(() => {
    if (activeChildQuery.data !== undefined) setActiveChildId(activeChildQuery.data);
  }, [activeChildQuery.data]);

  useEffect(() => {
    if (streakQuery.data) setStreak(streakQuery.data);
  }, [streakQuery.data]);

  useEffect(() => {
    if (eventsQuery.data) setEvents(eventsQuery.data);
  }, [eventsQuery.data]);

  useEffect(() => {
    if (rewardsQuery.data) setRewards(rewardsQuery.data);
  }, [rewardsQuery.data]);

  useEffect(() => {
    if (modeQuery.data) setAppMode(modeQuery.data);
  }, [modeQuery.data]);

  useEffect(() => {
    if (pinQuery.data !== undefined) setParentPin(pinQuery.data);
  }, [pinQuery.data]);

  useEffect(() => {
    if (childLogsQuery.data) setChildLogs(childLogsQuery.data);
  }, [childLogsQuery.data]);

  useEffect(() => {
    if (trendQuery.data) setTrendHistory(trendQuery.data);
  }, [trendQuery.data]);

  const saveHabitsMutation = useMutation({
    mutationFn: async (updated: Habit[]) => {
      await AsyncStorage.setItem(`${HABITS_KEY}_${childStorageKey}_${weekKey}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', weekKey, childStorageKey] });
    },
  });

  const saveChildrenMutation = useMutation({
    mutationFn: async (updated: ChildProfile[]) => {
      await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  const saveActiveChildMutation = useMutation({
    mutationFn: async (childId: string | null) => {
      if (childId) {
        await AsyncStorage.setItem(ACTIVE_CHILD_KEY, childId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
      }
      return childId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeChild'] });
    },
  });

  const saveEventsMutation = useMutation({
    mutationFn: async (updated: GameEvent[]) => {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const saveRewardsMutation = useMutation({
    mutationFn: async (updated: Reward[]) => {
      await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const saveModeMutation = useMutation({
    mutationFn: async (mode: AppMode) => {
      await AsyncStorage.setItem(MODE_KEY, mode);
      return mode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appMode'] });
    },
  });

  const savePinMutation = useMutation({
    mutationFn: async (pin: string) => {
      await AsyncStorage.setItem(PIN_KEY, pin);
      return pin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentPin'] });
    },
  });

  const saveChildLogsMutation = useMutation({
    mutationFn: async (updated: ChildLog[]) => {
      await AsyncStorage.setItem(`${CHILD_LOGS_KEY}_${childStorageKey}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childLogs', childStorageKey] });
    },
  });

  const saveTrendMutation = useMutation({
    mutationFn: async (updated: TrendHistory) => {
      await AsyncStorage.setItem(`${TREND_KEY}_${childStorageKey}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trendHistory', childStorageKey] });
    },
  });

  const toggleHabit = useCallback((habitId: string, dayIndex?: number) => {
    const targetDay = dayIndex !== undefined ? dayIndex : todayIndex;
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== habitId) return h;
        const newDays = [...h.completedDays];
        newDays[targetDay] = !newDays[targetDay];
        return { ...h, completedDays: newDays };
      });
      saveHabitsMutation.mutate(updated);
      return updated;
    });
  }, [todayIndex, childStorageKey, weekKey]);

  const addChild = useCallback((child: ChildProfile) => {
    console.log('[AppProvider] Adding child:', child.name);
    setChildren(prev => {
      const updated = [...prev, child];
      saveChildrenMutation.mutate(updated);
      return updated;
    });
    if (children.length === 0) {
      setActiveChildId(child.id);
      saveActiveChildMutation.mutate(child.id);
    }
  }, [children.length]);

  const updateChild = useCallback((child: ChildProfile) => {
    console.log('[AppProvider] Updating child:', child.name);
    setChildren(prev => {
      const updated = prev.map(c => c.id === child.id ? child : c);
      saveChildrenMutation.mutate(updated);
      return updated;
    });
  }, []);

  const removeChild = useCallback((childId: string) => {
    console.log('[AppProvider] Removing child:', childId);
    setChildren(prev => {
      const updated = prev.filter(c => c.id !== childId);
      saveChildrenMutation.mutate(updated);
      if (activeChildId === childId) {
        const newActive = updated[0]?.id ?? null;
        setActiveChildId(newActive);
        saveActiveChildMutation.mutate(newActive);
      }
      return updated;
    });
  }, [activeChildId]);

  const switchActiveChild = useCallback((childId: string) => {
    console.log('[AppProvider] Switching to child:', childId);
    setActiveChildId(childId);
    saveActiveChildMutation.mutate(childId);
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['childLogs'] });
    queryClient.invalidateQueries({ queryKey: ['streak'] });
    queryClient.invalidateQueries({ queryKey: ['trendHistory'] });
  }, []);

  const updateProfile = useCallback((p: Omit<ChildProfile, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => {
    if (activeChild) {
      const updated: ChildProfile = {
        ...activeChild,
        name: p.name,
        age: p.age,
        sport: p.sport,
        avatarEmoji: p.avatarEmoji,
      };
      updateChild(updated);
    } else {
      const newChild: ChildProfile = {
        id: `child-${Date.now()}`,
        name: p.name,
        age: p.age,
        sport: p.sport,
        avatarEmoji: p.avatarEmoji,
        createdAt: new Date().toISOString(),
      };
      addChild(newChild);
    }
  }, [activeChild, updateChild, addChild]);

  const addEvent = useCallback((event: GameEvent) => {
    setEvents(prev => {
      const updated = [...prev, event].sort((a, b) => a.date.localeCompare(b.date));
      saveEventsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      saveEventsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const addReward = useCallback((reward: Reward) => {
    setRewards(prev => {
      const updated = [...prev, reward];
      saveRewardsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const updateRewardPoints = useCallback((rewardId: string, points: number) => {
    setRewards(prev => {
      const updated = prev.map(r => {
        if (r.id !== rewardId) return r;
        const newEarned = Math.min(r.pointsEarned + points, r.pointsRequired);
        return { ...r, pointsEarned: newEarned };
      });
      saveRewardsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const redeemReward = useCallback((rewardId: string) => {
    setRewards(prev => {
      const updated = prev.map(r => {
        if (r.id !== rewardId) return r;
        if (r.pointsEarned < r.pointsRequired) return r;
        return { ...r, isRedeemed: true, redeemedAt: new Date().toISOString() };
      });
      saveRewardsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const removeReward = useCallback((rewardId: string) => {
    setRewards(prev => {
      const updated = prev.filter(r => r.id !== rewardId);
      saveRewardsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const switchMode = useCallback((mode: AppMode) => {
    console.log('[AppProvider] Switching mode to:', mode);
    setAppMode(mode);
    saveModeMutation.mutate(mode);
  }, []);

  const setPin = useCallback((pin: string) => {
    console.log('[AppProvider] Setting parent PIN');
    setParentPin(pin);
    savePinMutation.mutate(pin);
  }, []);

  const verifyPin = useCallback((attempt: string): boolean => {
    return parentPin === attempt;
  }, [parentPin]);

  const addChildLog = useCallback((log: ChildLog) => {
    console.log('[AppProvider] Adding child log:', log.id);
    setChildLogs(prev => {
      const updated = [log, ...prev].slice(0, 90);
      saveChildLogsMutation.mutate(updated);
      return updated;
    });
  }, [childStorageKey]);

  const todayLog = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return childLogs.find(l => l.date === today) ?? null;
  }, [childLogs]);

  const recentLogs = useMemo(() => childLogs.slice(0, 7), [childLogs]);

  const todayCompletedCount = useMemo(
    () => habits.filter(h => h.completedDays[todayIndex]).length,
    [habits, todayIndex]
  );

  const totalCount = habits.length;

  const weeklyCompletedCount = useMemo(() => {
    let count = 0;
    habits.forEach(h => {
      h.completedDays.forEach(d => { if (d) count++; });
    });
    return count;
  }, [habits]);

  const weeklyTotalPossible = totalCount * 7;

  const weeklyPercentage = useMemo(
    () => (weeklyTotalPossible > 0 ? Math.round((weeklyCompletedCount / weeklyTotalPossible) * 100) : 0),
    [weeklyCompletedCount, weeklyTotalPossible]
  );

  const todayPercentage = useMemo(
    () => (totalCount > 0 ? Math.round((todayCompletedCount / totalCount) * 100) : 0),
    [todayCompletedCount, totalCount]
  );

  const habitsByCategory = useMemo(() => {
    const grouped: Record<HabitCategory, Habit[]> = {
      sleep: [], nutrition: [], sunlight: [], hydration: [], movement: [], recovery: [], environmental: [],
    };
    habits.forEach(h => { grouped[h.category].push(h); });
    return grouped;
  }, [habits]);

  const categoryProgress = useMemo(() => {
    const progress: Record<HabitCategory, { completed: number; total: number }> = {
      sleep: { completed: 0, total: 0 },
      nutrition: { completed: 0, total: 0 },
      sunlight: { completed: 0, total: 0 },
      hydration: { completed: 0, total: 0 },
      movement: { completed: 0, total: 0 },
      recovery: { completed: 0, total: 0 },
      environmental: { completed: 0, total: 0 },
    };
    habits.forEach(h => {
      progress[h.category].total += 1;
      if (h.completedDays[todayIndex]) progress[h.category].completed += 1;
    });
    return progress;
  }, [habits, todayIndex]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter(e => {
      const eventDate = new Date(e.date + 'T00:00:00');
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }).slice(0, 10);
  }, [events]);

  const getReadinessScore = useCallback((eventDate: string): { score: number; completed: number; total: number; daysTracked: number; categoryScores: Record<HabitCategory, { completed: number; total: number }> } => {
    const daysUntil = getDaysUntil(eventDate);
    const daysToCount = Math.min(todayIndex + 1, 7);
    const lookbackDays = daysUntil <= 0 ? daysToCount : Math.min(daysToCount, daysToCount);

    let totalChecks = 0;
    let completedChecks = 0;
    const catScores: Record<HabitCategory, { completed: number; total: number }> = {
      sleep: { completed: 0, total: 0 },
      nutrition: { completed: 0, total: 0 },
      sunlight: { completed: 0, total: 0 },
      hydration: { completed: 0, total: 0 },
      movement: { completed: 0, total: 0 },
      recovery: { completed: 0, total: 0 },
      environmental: { completed: 0, total: 0 },
    };

    habits.forEach(h => {
      for (let d = 0; d < lookbackDays; d++) {
        totalChecks++;
        catScores[h.category].total++;
        if (h.completedDays[d]) {
          completedChecks++;
          catScores[h.category].completed++;
        }
      }
    });

    const score = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
    return { score, completed: completedChecks, total: totalChecks, daysTracked: lookbackDays, categoryScores: catScores };
  }, [habits, todayIndex]);

  const totalLifetimePoints = useMemo(() => {
    return weeklyCompletedCount;
  }, [weeklyCompletedCount]);

  const activeRewards = useMemo(
    () => rewards.filter(r => !r.isRedeemed),
    [rewards]
  );

  const redeemedRewards = useMemo(
    () => rewards.filter(r => r.isRedeemed),
    [rewards]
  );

  const dailyCompletionData = useMemo((): TrendDataPoint[] => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, i) => {
      const dayCompleted = habits.filter(h => h.completedDays[i]).length;
      const pct = totalCount > 0 ? Math.round((dayCompleted / totalCount) * 100) : 0;
      return { label, value: pct, date: '' };
    });
  }, [habits, totalCount]);

  const moodTrendData = useMemo((): TrendDataPoint[] => {
    const moodValues: Record<string, number> = {
      great: 5, good: 4, okay: 3, tired: 2, rough: 1,
    };
    return recentLogs.slice().reverse().map(log => ({
      label: new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
      value: moodValues[log.mood] ?? 3,
      date: log.date,
    }));
  }, [recentLogs]);

  const energyTrendData = useMemo((): TrendDataPoint[] => {
    return recentLogs.slice().reverse().map(log => ({
      label: new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
      value: log.energy,
      date: log.date,
    }));
  }, [recentLogs]);

  const profile = useMemo((): ChildProfile => {
    if (activeChild) return activeChild;
    return {
      id: 'default',
      name: '',
      age: 10,
      sport: '',
      avatarEmoji: '⚡',
      createdAt: new Date().toISOString(),
    };
  }, [activeChild]);

  const hasProfile = useMemo(() => children.length > 0 && !!activeChild?.name, [children, activeChild]);

  return {
    habits,
    profile,
    children,
    activeChild,
    activeChildId,
    streak,
    events,
    upcomingEvents,
    rewards,
    activeRewards,
    redeemedRewards,
    toggleHabit,
    addChild,
    updateChild,
    removeChild,
    switchActiveChild,
    updateProfile,
    addEvent,
    removeEvent,
    addReward,
    updateRewardPoints,
    redeemReward,
    removeReward,
    todayCompletedCount,
    totalCount,
    todayPercentage,
    getReadinessScore,
    weeklyCompletedCount,
    weeklyTotalPossible,
    weeklyPercentage,
    totalLifetimePoints,
    habitsByCategory,
    categoryProgress,
    todayIndex,
    isLoading: habitsQuery.isLoading || childrenQuery.isLoading,
    hasProfile,
    appMode,
    parentPin,
    childLogs,
    todayLog,
    recentLogs,
    switchMode,
    setPin,
    verifyPin,
    addChildLog,
    dailyCompletionData,
    moodTrendData,
    energyTrendData,
    trendHistory,
  };
});

export function useCategoryHabits(category: HabitCategory) {
  const { habitsByCategory } = useApp();
  return useMemo(() => habitsByCategory[category], [habitsByCategory, category]);
}
