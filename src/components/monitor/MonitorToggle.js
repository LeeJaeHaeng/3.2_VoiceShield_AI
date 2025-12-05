import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MonitorToggle({ isEnabled, onToggle, colors }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={isEnabled ? 'radio' : 'radio-outline'}
            size={24}
            color={isEnabled ? colors.primary : colors.mutedForeground}
          />
          <Text style={[styles.title, { color: colors.foreground }]}>
            실시간 모니터링
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={isEnabled ? colors.primary : colors.mutedForeground}
        />
      </View>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        전화 통화 시 자동으로 음성을 분석하여 보이스피싱을 탐지합니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
