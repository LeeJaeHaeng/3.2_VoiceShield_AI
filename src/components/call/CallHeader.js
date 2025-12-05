import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCallDuration, getCallStatusText } from '../../utils/callHelpers';

export default function CallHeader({ callStatus, isIncoming, callDuration, colors }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
        {getCallStatusText(callStatus, isIncoming)}
      </Text>
      {callStatus === 'active' && (
        <Text style={[styles.durationText, { color: colors.foreground }]}>
          {formatCallDuration(callDuration)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  durationText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
