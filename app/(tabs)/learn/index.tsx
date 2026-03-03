import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { HabitCategory } from '@/types';
import { articles } from '@/mocks/articles';
import { categoryLabels, categoryEmojis } from '@/mocks/habits';
import ArticleCard from '@/components/ArticleCard';

const filterCategories: ('all' | HabitCategory)[] = ['all', 'sleep', 'sunlight', 'nutrition', 'hydration', 'movement', 'recovery', 'environmental'];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const handleArticlePress = useCallback((articleId: string) => {
    router.push(`/article/${articleId}` as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>Science-backed insights for peak performance</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filterCategories.map(cat => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
          >
            <Text style={styles.filterEmoji}>
              {cat === 'all' ? '📚' : categoryEmojis[cat]}
            </Text>
            <Text style={[styles.filterLabel, selectedCategory === cat && styles.filterLabelActive]}>
              {cat === 'all' ? 'All' : categoryLabels[cat]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.featuredBanner}>
          <Text style={styles.featuredLabel}>EVIDENCE-BASED</Text>
          <Text style={styles.featuredTitle}>Every recommendation is grounded in peer-reviewed research and expert analysis.</Text>
        </View>

        {filteredArticles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() => handleArticlePress(article.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
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
  filterScroll: {
    maxHeight: 52,
    marginTop: 14,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterLabelActive: {
    color: Colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  featuredBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  featuredLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.info,
    letterSpacing: 2,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
});
