import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Habit, ChildProfile, HabitCategory, GameEvent, Reward, AppMode, ChildLog } from '@/types';
import { defaultHabits } from '@/mocks/habits';
import { getWeekKey, getDayOfWeekIndex } from '@/utils/date';

const HABITS_KEY = 'peakjr_habits_weekly';
const PROFILE_KEY = 'peakjr_profile';
const STREAK_KEY = 'peakjr_streak';
const EVENTS_KEY = 'peakjr_events';
const REWARDS_KEY = 'peakjr_rewards';
const MODE_KEY = 'peakjr_mode';
const PIN_KEY = 'peakjr_parent_pin';
const CHILD_LOGS_KEY = 'peakjr_child_logs';

interface StreakData {
  current: number;
  lastCompletedWeek: string | null;
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [profile, setProfile] = useState<ChildProfile>({
    name: '',
    age: 10,
    sport: '',
    avatarEmoji: '⚡',
  });
  const [streak, setStreak] = useState<StreakData>({ current: 0, lastCompletedWeek: null });
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('parent');
  const [parentPin, setParentPin] = useState<string>('');
  const [childLogs, setChildLogs] = useState<ChildLog[]>([]);

  const weekKey = getWeekKey();
  const todayIndex = getDayOfWeekIndex();

  const habitsQuery = useQuery({
    queryKey: ['habits', weekKey],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(`${HABITS_KEY}_${weekKey}`);
      if (stored) {
        return JSON.parse(stored) as Habit[];
      }
      return defaultHabits;
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored) as ChildProfile;
      return null;
    },
  });

  const streakQuery = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
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
    queryKey: ['childLogs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHILD_LOGS_KEY);
      if (stored) return JSON.parse(stored) as ChildLog[];
      return [] as ChildLog[];
    },
  });

  useEffect(() => {
    if (habitsQuery.data) setHabits(habitsQuery.data);
  }, [habitsQuery.data]);

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
  }, [profileQuery.data]);

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

  const saveHabitsMutation = useMutation({
    mutationFn: async (updated: Habit[]) => {
      await AsyncStorage.setItem(`${HABITS_KEY}_${weekKey}`, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', weekKey] });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (p: ChildProfile) => {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      return p;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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
      await AsyncStorage.setItem(CHILD_LOGS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childLogs'] });
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
  }, [todayIndex]);

  const updateProfile = useCallback((p: ChildProfile) => {
    setProfile(p);
    saveProfileMutation.mutate(p);
  }, []);

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
  }, []);

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

  return {
    habits,
    profile,
    streak,
    events,
    upcomingEvents,
    rewards,
    activeRewards,
    redeemedRewards,
    toggleHabit,
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
    weeklyCompletedCount,
    weeklyTotalPossible,
    weeklyPercentage,
    totalLifetimePoints,
    habitsByCategory,
    categoryProgress,
    todayIndex,
    isLoading: habitsQuery.isLoading || profileQuery.isLoading,
    hasProfile: !!profile.name,
    appMode,
    parentPin,
    childLogs,
    todayLog,
    recentLogs,
    switchMode,
    setPin,
    verifyPin,
    addChildLog,
  };
});

export function useCategoryHabits(category: HabitCategory) {
  const { habitsByCategory } = useApp();
  return useMemo(() => habitsByCategory[category], [habitsByCategory, category]);
}
