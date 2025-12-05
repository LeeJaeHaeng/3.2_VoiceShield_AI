import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CallActions({ onMute, onSpeaker, onHome, onEndCall, colors }) {
  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={onMute}
        >
          <Ionicons name="mic-off" size={28} color={colors.foreground} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>
            음소거
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={onSpeaker}
        >
          <Ionicons name="volume-high" size={28} color={colors.foreground} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>
            스피커
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={onHome}
        >
          <Ionicons name="home" size={28} color={colors.foreground} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>
            홈으로
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
        <Ionicons name="call" size={32} color="#fff" />
      </TouchableOpacity>

      <Text style={[styles.endCallText, { color: colors.mutedForeground }]}>
        통화 종료
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  endCallText: {
    fontSize: 14,
  },
});
