import { Habit } from '@/types';

export const defaultHabits: Habit[] = [
  {
    id: 'sleep-1',
    title: 'Sleep 9-11 hours',
    description: 'Ensure age-appropriate sleep duration for optimal growth hormone release.',
    category: 'sleep',
    scienceNote: 'Growth hormone is primarily released during deep sleep. Children aged 6-13 need 9-11 hours per night (National Sleep Foundation).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'sleep-2',
    title: 'Consistent bedtime routine',
    description: 'Same bedtime and wake time within 30 minutes, even on weekends.',
    category: 'sleep',
    scienceNote: 'Circadian rhythm consistency improves sleep quality by 23% and next-day cognitive performance (Walker, 2017).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'sleep-3',
    title: 'No screens 1hr before bed',
    description: 'Eliminate blue light exposure to protect melatonin production.',
    category: 'sleep',
    scienceNote: 'Blue light suppresses melatonin by up to 50%, delaying sleep onset by 30+ minutes (Harvard Medical School).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'sunlight-1',
    title: 'Morning sunlight (10-15 min)',
    description: 'Get direct sunlight exposure within 30 minutes of waking.',
    category: 'sunlight',
    scienceNote: 'Morning light exposure sets the circadian clock, boosting cortisol for alertness and improving nighttime melatonin by 58% (Huberman Lab).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'sunlight-2',
    title: 'Outdoor time (60+ min)',
    description: 'Spend at least 60 minutes outdoors for vitamin D and eye health.',
    category: 'sunlight',
    scienceNote: 'Children who spend 2+ hours outdoors daily have 50% lower myopia risk. Vitamin D supports bone density and immune function (Rose et al., 2008).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'nutrition-1',
    title: 'High-protein breakfast',
    description: 'Include 20-30g protein at breakfast for sustained energy.',
    category: 'nutrition',
    scienceNote: 'Protein at breakfast stabilizes blood glucose, improving focus and reducing mid-morning energy crashes by 40% (Leidy et al., 2015).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'nutrition-2',
    title: 'Eat whole foods at every meal',
    description: 'Prioritize unprocessed foods: vegetables, fruits, lean meats, whole grains.',
    category: 'nutrition',
    scienceNote: 'Ultra-processed foods are linked to 25% higher inflammation markers in youth athletes, impairing recovery (Hall et al., 2019).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'nutrition-3',
    title: 'Post-training nutrition',
    description: 'Protein + carbs within 45 min after training for recovery.',
    category: 'nutrition',
    scienceNote: 'The anabolic window post-exercise optimizes muscle protein synthesis by 50% when protein and carbs are consumed together (Aragon & Schoenfeld, 2013).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'hydration-1',
    title: 'Drink water upon waking',
    description: 'Start the day with 8-16oz of water to rehydrate after sleep.',
    category: 'hydration',
    scienceNote: 'Overnight dehydration reduces cognitive performance by 10-15%. Morning hydration restores blood volume and brain function (Ganio et al., 2011).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'hydration-2',
    title: 'Stay hydrated throughout the day',
    description: 'Drink half bodyweight (lbs) in ounces of water daily.',
    category: 'hydration',
    scienceNote: 'Even 2% dehydration decreases athletic performance by up to 25% and increases injury risk (Casa et al., 2000).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'movement-1',
    title: 'Dynamic warm-up before activity',
    description: 'Complete a proper warm-up with dynamic stretching before training.',
    category: 'movement',
    scienceNote: 'Dynamic warm-ups reduce injury risk by 50% and improve power output by 8% compared to static stretching (Herman et al., 2012).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'movement-2',
    title: 'Deliberate practice (focused training)',
    description: 'Engage in focused, intentional skill work rather than just playing.',
    category: 'movement',
    scienceNote: 'Deliberate practice is 4x more effective for skill acquisition than unstructured play (Ericsson, 1993). Quality over quantity.',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'recovery-1',
    title: 'Active recovery or rest day',
    description: 'Include light movement or full rest days between intense training.',
    category: 'recovery',
    scienceNote: 'Youth athletes who specialize early and overtrain have 70% higher injury rates. Periodization is critical (Jayanthi et al., 2015).',
    completedDays: [false, false, false, false, false, false, false],
  },
  {
    id: 'recovery-2',
    title: 'Mindfulness or breathing practice',
    description: 'Practice 5 minutes of deep breathing or meditation for nervous system regulation.',
    category: 'recovery',
    scienceNote: 'Physiological sighing (double inhale, extended exhale) reduces cortisol within 5 minutes, accelerating recovery (Balban et al., 2023).',
    completedDays: [false, false, false, false, false, false, false],
  },
];

export const categoryLabels: Record<string, string> = {
  sleep: 'Sleep',
  nutrition: 'Nutrition',
  sunlight: 'Sunlight',
  hydration: 'Hydration',
  movement: 'Movement',
  recovery: 'Recovery',
  environmental: 'Environmental',
};

export const categoryEmojis: Record<string, string> = {
  sleep: '🌙',
  nutrition: '🥗',
  sunlight: '☀️',
  hydration: '💧',
  movement: '🏃',
  recovery: '🧘',
  environmental: '🏠',
};

export const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
export const dayFullLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
