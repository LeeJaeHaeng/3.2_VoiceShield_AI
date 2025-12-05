import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATS_DATA = [
  {
    icon: 'shield-checkmark',
    label: '차단된 피싱 전화',
    value: '127',
    color: '#10b981',
  },
  {
    icon: 'call',
    label: '분석된 통화',
    value: '1,234',
    color: '#3b82f6',
  },
  {
    icon: 'warning',
    label: '의심 통화',
    value: '43',
    color: '#f59e0b',
  },
  {
    icon: 'time',
    label: '평균 분석 시간',
    value: '1.2초',
    color: '#8b5cf6',
  },
];

export default function MonitorStats({ colors }) {
  return (
    <View style={styles.grid}>
      {STATS_DATA.map((stat, index) => (
        <View
          key={index}
          style={[styles.statCard, { backgroundColor: colors.card }]}
        >
          <Ionicons name={stat.icon} size={28} color={stat.color} />
          <Text style={[styles.value, { color: colors.foreground }]}>
            {stat.value}
          </Text>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
