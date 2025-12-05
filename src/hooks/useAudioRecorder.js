import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export const useAudioRecorder = (showToast, startWaveAnimation) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedFile, setRecordedFile] = useState(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  };

  const startRecording = async () => {
    try {
      if (!(await requestAudioPermission())) {
        Alert.alert('권한 필요', '마이크 권한이 필요합니다.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (startWaveAnimation) startWaveAnimation();
    } catch (error) {
      showToast('녹음을 시작할 수 없습니다.', 'error');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      const filename = `recording_${Date.now()}.m4a`;
      const file = { type: 'success', uri, name: filename, size: undefined };
      setRecordedFile(file);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(`${recordingDuration}초 녹음되었습니다.`, 'success');
      return file;
    } catch (error) {
      showToast('녹음을 저장할 수 없습니다.', 'error');
      return null;
    }
  };

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    recordedFile,
    setRecordedFile
  };
};
