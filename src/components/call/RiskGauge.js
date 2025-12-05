import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RiskGauge({ confidence, riskLevel, getRiskColor, getRiskText, colors }) {
  return (
    <View style={styles.container}>
      <View style={styles.gaugeBackground}>
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${confidence}%`,
              backgroundColor: getRiskColor(),
            },
          ]}
        />
      </View>
      
      <View style={styles.gaugeInfo}>
        <Ionicons name="shield-checkmark" size={20} color={getRiskColor()} />
        <Text style={[styles.riskLabel, { color: getRiskColor() }]}>
          {getRiskText()} {confidence.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
