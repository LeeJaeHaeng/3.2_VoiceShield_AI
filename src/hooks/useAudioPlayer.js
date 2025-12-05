import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export const useAudioPlayer = (showToast) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis);
      if (status.didJustFinish) {
        sound.setPositionAsync(0);
        setIsPlaying(false);
        setPlaybackPosition(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const togglePlayback = async (fileUri) => {
    if (!fileUri) return;
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!sound) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: fileUri },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Playback error:', error);
      showToast('오디오를 재생할 수 없습니다.', 'error');
    }
  };

  const resetPlayer = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlaybackDuration(0);
    }
  };

  return {
    isPlaying,
    playbackPosition,
    playbackDuration,
    togglePlayback,
    resetPlayer
  };
};
