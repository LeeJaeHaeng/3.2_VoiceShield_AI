import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPhoneNumber } from '../../utils/callHelpers';

export default function CallAvatar({ phoneNumber, pulseAnim, colors }) {
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="person" size={60} color={colors.primary} />
        </View>
      </Animated.View>

      <Text style={[styles.phoneNumber, { color: colors.foreground }]}>
        {formatPhoneNumber(phoneNumber)}
      </Text>
      <Text style={[styles.location, { color: colors.mutedForeground }]}>
        대한민국
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
  },
});
