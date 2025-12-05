import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MonitorSettings({ 
  autoBlockEnabled, 
  onAutoBlockToggle,
  notificationEnabled,
  onNotificationToggle,
  colors 
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        추가 설정
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="ban" size={20} color={colors.foreground} />
          <Text style={[styles.label, { color: colors.foreground }]}>
            자동 차단
          </Text>
        </View>
        <Switch
          value={autoBlockEnabled}
          onValueChange={onAutoBlockToggle}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={autoBlockEnabled ? colors.primary : colors.mutedForeground}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={20} color={colors.foreground} />
          <Text style={[styles.label, { color: colors.foreground }]}>
            알림 받기
          </Text>
        </View>
        <Switch
          value={notificationEnabled}
          onValueChange={onNotificationToggle}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={notificationEnabled ? colors.primary : colors.mutedForeground}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
});
