import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';

export default function RecordingSection({
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingDuration,
  pulseAnim,
  waveAnim,
  formatTime,
  colors,
}) {
  return (
    <View style={[styles.recordingSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>음성 녹음</Text>

      <View style={styles.recordingControls}>
        {!isRecording ? (
          <TouchableOpacity
            onPress={onStartRecording}
            style={[styles.recordButton, { backgroundColor: colors.destructive }]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.recordIcon}>⏺</Text>
            </Animated.View>
            <Text style={styles.recordButtonText}>녹음 시작</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.recordingActive}>
            <TouchableOpacity
              onPress={onStopRecording}
              style={[styles.stopButton, { backgroundColor: colors.muted }]}
            >
              <Text style={styles.stopIcon}>⏹</Text>
              <Text style={[styles.stopButtonText, { color: colors.foreground }]}>녹음 중지</Text>
            </TouchableOpacity>

            <View style={styles.recordingTimer}>
              <View style={styles.recordingDot} />
              <Text style={[styles.timerText, { color: colors.destructive }]}>
                {formatTime(recordingDuration)}
              </Text>
            </View>

            <View style={styles.waveformContainer}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 40 * Math.random() + 10],
                      }),
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recordingSection: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    gap: 12,
  },
  recordIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  recordingActive: {
    width: '100%',
    gap: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    gap: 12,
  },
  stopIcon: {
    fontSize: 24,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
});