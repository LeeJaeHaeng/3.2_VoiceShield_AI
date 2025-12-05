import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';

export default function Header({ isDarkMode, onToggleTheme, onEmergencyReport, colors }) {
  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <View>
            <Text style={[styles.logoTitle, { color: colors.foreground }]}>VoiceShield</Text>
            <Text style={[styles.logoSubtitle, { color: colors.mutedForeground }]}>AI 음성 탐지</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onToggleTheme} style={styles.themeButton}>
            <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEmergencyReport}
            style={[styles.emergencyButton, { backgroundColor: colors.destructive }]}
          >
            <Text style={styles.emergencyIcon}>🚨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 24,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtitle: {
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeButton: {
    padding: 8,
  },
  themeIcon: {
    fontSize: 24,
  },
  emergencyButton: {
    padding: 8,
    borderRadius: 8,
  },
  emergencyIcon: {
    fontSize: 20,
  },
});