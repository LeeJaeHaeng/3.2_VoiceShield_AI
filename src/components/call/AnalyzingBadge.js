import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyzingBadge({ isAnalyzing, colors }) {
  if (!isAnalyzing) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '10' }]}>
      <Ionicons name="analytics" size={16} color={colors.primary} />
      <Text style={[styles.text, { color: colors.primary }]}>분석 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
