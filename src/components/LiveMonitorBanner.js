import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LiveMonitorBanner({ onPress, colors }) {
  return (
    <TouchableOpacity 
      style={[styles.banner, { backgroundColor: colors.primary + '10' }]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="radio" size={32} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          실시간 통화 모니터링
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          통화 중 자동으로 보이스피싱을 탐지합니다
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
});
