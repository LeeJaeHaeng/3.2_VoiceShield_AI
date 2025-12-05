import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function VoiceWaveform({ waveAnim, colors }) {
  return (
    <View style={styles.container}>
      {[...Array(20)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              backgroundColor: colors.primary,
              height: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  Math.sin(i * 0.5) * 20 + 30,
                  Math.sin(i * 0.5 + Math.PI) * 20 + 30,
                ],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 8,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
});
