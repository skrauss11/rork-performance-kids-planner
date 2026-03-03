export type HabitCategory = 'sleep' | 'nutrition' | 'sunlight' | 'hydration' | 'movement' | 'recovery' | 'environmental';

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  scienceNote: string;
  completedDays: boolean[];
}

export interface WeeklyLog {
  weekKey: string;
  habits: Record<string, boolean[]>;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  sport: string;
  avatarEmoji: string;
  createdAt: string;
}

export interface GameEvent {
  id: string;
  title: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  notifyBefore: number;
  childId?: string;
}

export interface GameDayTip {
  id: string;
  title: string;
  description: string;
  timing: 'night-before' | 'morning-of' | 'pre-game' | 'during' | 'post-game';
  scienceNote: string;
  icon: string;
  category: HabitCategory;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: HabitCategory;
  readTime: string;
  content: string;
  source: string;
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  description: string;
  pointsRequired: number;
  pointsEarned: number;
  isRedeemed: boolean;
  createdAt: string;
  redeemedAt: string | null;
  childId?: string;
}

export type AppMode = 'parent' | 'child';

export type MoodLevel = 'great' | 'good' | 'okay' | 'tired' | 'rough';
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 'amazing' | 'good' | 'okay' | 'poor' | 'terrible';

export interface ChildLog {
  id: string;
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  sleepQuality: SleepQuality;
  soreness: string[];
  notes: string;
  createdAt: string;
  childId?: string;
}

export interface TrendDataPoint {
  label: string;
  value: number;
  date: string;
}

export interface WeeklyTrend {
  weekLabel: string;
  completionRate: number;
  habitCount: number;
}
