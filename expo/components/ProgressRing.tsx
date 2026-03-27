import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Colors from '@/constants/colors';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: string;
}

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  color = Colors.primary,
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
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
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
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700' as const,
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
