import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Shield, TrendingUp, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { HabitCategory } from '@/types';

interface CategoryScore {
  completed: number;
  total: number;
}

interface ReadinessData {
  score: number;
  completed: number;
  total: number;
  daysTracked: number;
  categoryScores: Record<HabitCategory, CategoryScore>;
}

interface ReadinessScoreProps {
  data: ReadinessData;
  eventTitle: string;
  daysUntil: number;
  compact?: boolean;
}

const categoryColors: Record<HabitCategory, string> = {
  sleep: Colors.habitSleep,
  nutrition: Colors.habitNutrition,
  sunlight: Colors.habitSunlight,
  hydration: Colors.habitHydration,
  movement: Colors.habitMovement,
  recovery: Colors.habitRecovery,
  environmental: Colors.habitEnvironmental,
};

const categoryLabels: Record<HabitCategory, string> = {
  sleep: 'Sleep',
  nutrition: 'Nutrition',
  sunlight: 'Sunlight',
  hydration: 'Hydration',
  movement: 'Movement',
  recovery: 'Recovery',
  environmental: 'Environment',
};

function getScoreLevel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: 'Peak Ready', color: Colors.primary, emoji: '🟢' };
  if (score >= 70) return { label: 'Well Prepared', color: Colors.info, emoji: '🔵' };
  if (score >= 50) return { label: 'Getting There', color: Colors.warning, emoji: '🟡' };
  if (score >= 25) return { label: 'Needs Work', color: Colors.accent, emoji: '🟠' };
  return { label: 'Not Ready', color: Colors.error, emoji: '🔴' };
}

export default function ReadinessScore({ data, eventTitle, daysUntil, compact = false }: ReadinessScoreProps) {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnims = useRef<Record<string, Animated.Value>>({}).current;

  const level = useMemo(() => getScoreLevel(data.score), [data.score]);

  const activeCategories = useMemo(() => {
    return (Object.keys(data.categoryScores) as HabitCategory[])
      .filter(cat => data.categoryScores[cat].total > 0)
      .sort((a, b) => {
        const aRate = data.categoryScores[a].total > 0
          ? data.categoryScores[a].completed / data.categoryScores[a].total
          : 0;
        const bRate = data.categoryScores[b].total > 0
          ? data.categoryScores[b].completed / data.categoryScores[b].total
          : 0;
        return bRate - aRate;
      });
  }, [data.categoryScores]);

  const weakestCategory = useMemo(() => {
    let worst: HabitCategory | null = null;
    let worstRate = 1;
    activeCategories.forEach(cat => {
      const s = data.categoryScores[cat];
      const rate = s.total > 0 ? s.completed / s.total : 1;
      if (rate < worstRate) {
        worstRate = rate;
        worst = cat;
      }
    });
    return worst;
  }, [activeCategories, data.categoryScores]);

  useEffect(() => {
    activeCategories.forEach(cat => {
      if (!barAnims[cat]) {
        barAnims[cat] = new Animated.Value(0);
      }
    });
  }, [activeCategories]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scoreAnim, {
        toValue: data.score,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      ...activeCategories.map((cat, i) => {
        const s = data.categoryScores[cat];
        const pct = s.total > 0 ? s.completed / s.total : 0;
        if (!barAnims[cat]) barAnims[cat] = new Animated.Value(0);
        return Animated.timing(barAnims[cat], {
          toValue: pct,
          duration: 800,
          delay: 200 + i * 80,
          useNativeDriver: false,
        });
      }),
    ]).start();
  }, [data.score, activeCategories]);

  const displayScore = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const arcProgress = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const arcWidth = arcProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <Animated.View style={[compactStyles.container, { opacity: fadeAnim }]}>
        <View style={compactStyles.scoreRing}>
          <View style={[compactStyles.scoreRingBg, { borderColor: level.color + '30' }]}>
            <Animated.View
              style={[compactStyles.scoreRingFill, {
                borderColor: level.color,
                transform: [{
                  rotate: scoreAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }]}
            />
            <View style={compactStyles.scoreCenter}>
              <AnimatedNumber value={displayScore} style={[compactStyles.scoreValue, { color: level.color }]} />
            </View>
          </View>
        </View>
        <View style={compactStyles.info}>
          <Text style={compactStyles.label}>Readiness</Text>
          <Text style={[compactStyles.levelText, { color: level.color }]}>{level.label}</Text>
          <Text style={compactStyles.detail}>
            {data.completed}/{data.total} habits · {data.daysTracked}d tracked
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={18} color={level.color} />
          <Text style={styles.headerTitle}>Readiness Score</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: level.color + '20' }]}>
          <Text style={[styles.levelBadgeText, { color: level.color }]}>{level.label}</Text>
        </View>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreGauge}>
          <View style={styles.gaugeTrack}>
            <Animated.View style={[styles.gaugeFill, { width: arcWidth, backgroundColor: level.color }]} />
          </View>
          <View style={styles.scoreDisplay}>
            <AnimatedNumber value={displayScore} style={[styles.scoreNumber, { color: level.color }]} />
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.daysTracked}d</Text>
            <Text style={styles.statLabel}>Tracked</Text>
          </View>
        </View>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categorySectionTitle}>Category Breakdown</Text>
        {activeCategories.map(cat => {
          const s = data.categoryScores[cat];
          const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
          const isWeakest = cat === weakestCategory && pct < 70;
          const anim = barAnims[cat] || new Animated.Value(0);
          const barWidth = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          });

          return (
            <View key={cat} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColors[cat] }]} />
                <Text style={styles.categoryName}>{categoryLabels[cat]}</Text>
                {isWeakest && <AlertTriangle size={12} color={Colors.warning} style={styles.weakIcon} />}
              </View>
              <View style={styles.categoryBarWrap}>
                <View style={styles.categoryBarTrack}>
                  <Animated.View
                    style={[styles.categoryBarFill, {
                      width: barWidth,
                      backgroundColor: categoryColors[cat],
                    }]}
                  />
                </View>
                <Text style={[styles.categoryPct, { color: pct >= 70 ? Colors.textSecondary : Colors.warning }]}>
                  {pct}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {weakestCategory != null && data.categoryScores[weakestCategory as HabitCategory].completed / Math.max(data.categoryScores[weakestCategory as HabitCategory].total, 1) < 0.5 && (
        <View style={styles.insightBox}>
          <TrendingUp size={14} color={Colors.warning} />
          <Text style={styles.insightText}>
            Focus on <Text style={styles.insightBold}>{categoryLabels[weakestCategory]}</Text> habits before the event to boost your score
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

function AnimatedNumber({ value, style }: { value: Animated.AnimatedInterpolation<number>; style: any }) {
  const textRef = useRef<Text>(null);
  const currentValue = useRef(0);

  useEffect(() => {
    const listener = value.addListener(({ value: v }) => {
      currentValue.current = Math.round(v);
      if (textRef.current) {
        (textRef.current as any).setNativeProps?.({ text: `${Math.round(v)}` });
      }
    });
    return () => value.removeListener(listener);
  }, [value]);

  return <Animated.Text ref={textRef} style={style}>{Math.round(currentValue.current)}</Animated.Text>;
}

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  scoreRing: {
    width: 56,
    height: 56,
  },
  scoreRingBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scoreRingFill: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    fontWeight: '600' as const,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  detail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  scoreSection: {
    marginBottom: 20,
  },
  scoreGauge: {
    marginBottom: 16,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gaugeFill: {
    height: 8,
    borderRadius: 4,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800' as const,
    letterSpacing: -2,
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
  },
  categorySection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 16,
  },
  categorySectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  weakIcon: {
    marginLeft: 2,
  },
  categoryBarWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 6,
    borderRadius: 3,
  },
  categoryPct: {
    fontSize: 12,
    fontWeight: '600' as const,
    width: 34,
    textAlign: 'right',
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warning + '10',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  insightBold: {
    fontWeight: '700' as const,
    color: Colors.warning,
  },
});
