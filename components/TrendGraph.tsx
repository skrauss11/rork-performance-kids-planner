import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Colors from '@/constants/colors';
import { TrendDataPoint } from '@/types';

interface TrendGraphProps {
  data: TrendDataPoint[];
  height?: number;
  color?: string;
  maxValue?: number;
  showDots?: boolean;
  showLabels?: boolean;
  showBars?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
}

export default React.memo(function TrendGraph({
  data,
  height = 120,
  color = Colors.primary,
  maxValue: propMaxValue,
  showDots = true,
  showLabels = true,
  showBars = false,
  title,
  subtitle,
  unit = '%',
}: TrendGraphProps) {
  const chartPadding = { top: 12, bottom: showLabels ? 24 : 8, left: 8, right: 8 };
  const chartHeight = height - chartPadding.top - chartPadding.bottom;

  const maxValue = useMemo(() => {
    if (propMaxValue) return propMaxValue;
    const max = Math.max(...data.map(d => d.value), 1);
    return Math.ceil(max / 10) * 10 || 100;
  }, [data, propMaxValue]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const width = 300 - chartPadding.left - chartPadding.right;
    return data.map((d, i) => ({
      x: chartPadding.left + (data.length > 1 ? (i / (data.length - 1)) * width : width / 2),
      y: chartPadding.top + chartHeight - (d.value / maxValue) * chartHeight,
      value: d.value,
      label: d.label,
    }));
  }, [data, maxValue, chartHeight]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx1 = prevPoint.x + (currPoint.x - prevPoint.x) * 0.4;
      const cpx2 = prevPoint.x + (currPoint.x - prevPoint.x) * 0.6;
      path += ` C ${cpx1} ${prevPoint.y}, ${cpx2} ${currPoint.y}, ${currPoint.x} ${currPoint.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const bottom = chartPadding.top + chartHeight;
    return `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }, [linePath, points, chartHeight]);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={[styles.emptyState, { height }]}>
          <Text style={styles.emptyText}>No data yet</Text>
        </View>
      </View>
    );
  }

  const barWidth = Math.min(24, (300 - chartPadding.left - chartPadding.right) / data.length - 6);

  return (
    <View style={styles.container}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <Svg width="100%" height={height} viewBox={`0 0 300 ${height}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {showBars ? (
          data.map((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = chartPadding.left + (i * ((300 - chartPadding.left - chartPadding.right) / data.length)) + ((300 - chartPadding.left - chartPadding.right) / data.length - barWidth) / 2;
            const y = chartPadding.top + chartHeight - barHeight;
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={chartPadding.top}
                  width={barWidth}
                  height={chartHeight}
                  rx={barWidth / 2}
                  fill={Colors.surfaceLight}
                />
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={barWidth / 2}
                  fill={color}
                  opacity={0.9}
                />
              </React.Fragment>
            );
          })
        ) : (
          <>
            {areaPath ? (
              <Path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
            ) : null}
            {linePath ? (
              <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
            {showDots && points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke={Colors.surface} strokeWidth={1.5} />
            ))}
          </>
        )}
      </Svg>
      {showLabels && (
        <View style={styles.labelRow}>
          {data.map((d, i) => (
            <View key={i} style={[styles.labelItem, { width: `${100 / data.length}%` }]}>
              <Text style={styles.labelValue}>{d.value}{unit}</Text>
              <Text style={styles.labelText}>{d.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: -4,
  },
  labelItem: {
    alignItems: 'center',
  },
  labelValue: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  labelText: {
    fontSize: 9,
    color: Colors.textMuted,
  },
});
