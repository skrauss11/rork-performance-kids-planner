import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Colors from '@/constants/colors';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: Colors.surfaceAlt }]} />
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <View
          style={[
            styles.progressArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: percentage > 0 ? Colors.primary : 'transparent',
              borderRightColor: percentage > 25 ? Colors.primary : 'transparent',
              borderBottomColor: percentage > 50 ? Colors.primary : 'transparent',
              borderLeftColor: percentage > 75 ? Colors.primary : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.labelText}>complete</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: -1,
  },
  labelText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: -2,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
});
