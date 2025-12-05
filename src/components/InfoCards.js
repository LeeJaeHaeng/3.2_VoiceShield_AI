import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoCards({ colors }) {
  return (
    <View style={styles.infoCardsGrid}>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardIcon}>🎤</Text>
          <View style={styles.infoCardText}>
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>실시간 탐지</Text>
            <Text style={[styles.infoCardDescription, { color: colors.mutedForeground }]}>
              AI 기반 음성 탐지로 파일을 즉시 분석하세요
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardIcon}>🛡️</Text>
          <View style={styles.infoCardText}>
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>안전하고 비공개</Text>
            <Text style={[styles.infoCardDescription, { color: colors.mutedForeground }]}>
              음성 파일은 저장되거나 공유되지 않습니다
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCardIcon: {
    fontSize: 20,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
});