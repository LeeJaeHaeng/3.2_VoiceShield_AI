import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SimulationButtons({ onIncoming, onOutgoing, colors }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onIncoming}
      >
        <Ionicons name="call" size={24} color="#fff" />
        <Text style={styles.buttonText}>수신 통화 시뮬레이션</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: colors.card, 
            borderWidth: 2, 
            borderColor: colors.primary 
          },
        ]}
        onPress={onOutgoing}
      >
        <Ionicons name="call-outline" size={24} color={colors.primary} />
        <Text style={[styles.buttonText, { color: colors.primary }]}>
          발신 통화 시뮬레이션
        </Text>
      </TouchableOpacity>

      <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>
          Expo Snack 환경에서는 실제 통화 연동이 불가능합니다. 위 버튼으로 통화 화면 UI를 테스트할 수 있습니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
