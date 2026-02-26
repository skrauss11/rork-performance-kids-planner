import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Clock, FlaskConical } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { articles } from '@/mocks/articles';
import { categoryLabels, categoryEmojis } from '@/mocks/habits';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Article' }} />
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoryLabels[article.category], headerTintColor: Colors.primary }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{categoryEmojis[article.category]}</Text>
          <Text style={styles.categoryLabel}>{categoryLabels[article.category]}</Text>
        </View>

        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Clock size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{article.readTime} read</Text>
          </View>
          <View style={styles.metaItem}>
            <FlaskConical size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{article.source}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>KEY TAKEAWAY</Text>
          <Text style={styles.summaryText}>{article.summary}</Text>
        </View>

        {article.content.split('\n\n').map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>{paragraph}</Text>
        ))}

        <View style={styles.sourceCard}>
          <FlaskConical size={16} color={Colors.primaryMuted} />
          <View style={styles.sourceContent}>
            <Text style={styles.sourceLabel}>Research Source</Text>
            <Text style={styles.sourceText}>{article.source}</Text>
          </View>
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 32,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  meta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.accentLight,
    letterSpacing: 2,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#D4E8DB',
    lineHeight: 23,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 25,
    marginBottom: 18,
  },
  sourceCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
    alignItems: 'center',
  },
  sourceContent: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primaryMuted,
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
});
