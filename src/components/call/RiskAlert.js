import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RiskAlert({ riskOpacity, getRiskColor }) {
  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: getRiskColor(),
          opacity: riskOpacity,
        },
      ]}
    >
      <Ionicons name="warning" size={60} color="#fff" />
      <Text style={styles.title}>보이스피싱 의심!</Text>
      <Text style={styles.subtitle}>즉시 통화를 종료하세요</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
});
