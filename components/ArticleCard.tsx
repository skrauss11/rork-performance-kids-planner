import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Article, HabitCategory } from '@/types';
import { categoryEmojis } from '@/mocks/habits';

const categoryColors: Record<HabitCategory, string> = {
  sleep: Colors.habitSleep,
  nutrition: Colors.habitNutrition,
  sunlight: Colors.habitSunlight,
  hydration: Colors.habitHydration,
  movement: Colors.habitMovement,
  recovery: Colors.habitRecovery,
  environmental: Colors.habitEnvironmental,
};

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

export default React.memo(function ArticleCard({ article, onPress }: ArticleCardProps) {
  const color = categoryColors[article.category];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.categoryEmoji}>{categoryEmojis[article.category]}</Text>
          <View style={styles.readTimeContainer}>
            <Clock size={11} color={Colors.textMuted} />
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.source}>{article.source}</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  summary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
});
