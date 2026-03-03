import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlaskConical, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ScienceNoteProps {
  note: string;
}

export default React.memo(function ScienceNote({ note }: ScienceNoteProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggle = useCallback(() => setExpanded(prev => !prev), []);

  return (
    <Pressable onPress={toggle} style={styles.container}>
      <View style={styles.header}>
        <FlaskConical size={14} color={Colors.primary} />
        <Text style={styles.label}>Science</Text>
        {expanded ? (
          <ChevronUp size={14} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={14} color={Colors.textMuted} />
        )}
      </View>
      {expanded && <Text style={styles.note}>{note}</Text>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 4,
    marginLeft: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    flex: 1,
  },
  note: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
});
