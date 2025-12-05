import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Animated, Alert, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../utils/theme';
import { formatTime, formatDuration, formatDate } from '../utils/formatters';
import { SERVER_URL } from '../config';

// Custom Hooks
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useDeepfakeAnalysis } from '../hooks/useDeepfakeAnalysis';
import { useHistory } from '../hooks/useHistory';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- Global State ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // --- Animations ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // --- Toast State ---
  const [toastConfig, setToastConfig] = useState({ visible: false, message: '', type: 'info' });

  const colors = getColors(isDarkMode);

  // --- Helper Functions ---
  const showToast = (message, type = 'info') => {
    setToastConfig({ visible: true, message, type });
    // setTimeout removed to prevent race condition with Toast component's internal timer
  };
  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };
  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, { toValue: 1, duration: 1500, useNativeDriver: false })
    ).start();
  };

  // --- Hooks Integration ---
  const { 
    isRecording, 
    recordingDuration, 
    startRecording, 
    stopRecording: stopRecordingHook, 
    recordedFile 
  } = useAudioRecorder(showToast, startWaveAnimation);

  const { 
    isPlaying, 
    playbackPosition, 
    playbackDuration, 
    togglePlayback: togglePlaybackHook, 
    resetPlayer 
  } = useAudioPlayer(showToast);

  const { 
    history, 
    setHistory, 
    historyFilter, 
    setHistoryFilter, 
    historyType,
    setHistoryType,
    historySortOrder, 
    setHistorySortOrder, 
    loadHistory, 
    saveHistory, 
    clearHistory, 
    getFilteredHistory 
  } = useHistory(showToast);

  const { 
    isAnalyzing, 
    analysisResult, 
    setAnalysisResult, 
    handleAnalyze: handleAnalyzeHook 
  } = useDeepfakeAnalysis(showToast, startWaveAnimation, fadeAnim, history, setHistory, saveHistory);

  // --- Effects ---
  useEffect(() => {
    loadSettings();
  }, []);

  // Update selected file when recording finishes
  useEffect(() => {
    if (recordedFile) {
      setSelectedFile(recordedFile);
    }
  }, [recordedFile]);

  // --- Settings Logic ---
  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      if (theme !== null) setIsDarkMode(theme === 'dark');
      
      const onboarding = await AsyncStorage.getItem('onboarding_completed');
      if (onboarding === 'true') setIsOnboardingCompleted(true);
      
      setIsLoading(false);
    } catch (e) {
      console.warn("Failed to load settings:", e);
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setIsOnboardingCompleted(true); 
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.warn("Failed to save onboarding status:", e);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // --- File & Action Handlers ---
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && !result.canceled) {
        const file = result.assets[0];
        setSelectedFile({
          type: 'success',
          uri: file.uri,
          name: file.name,
          size: file.size,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showToast(`${file.name} 파일이 선택되었습니다.`, 'success');
        
        // Reset player when new file is selected
        resetPlayer();
      }
    } catch (error) {
      console.error('File selection error:', error);
      showToast('파일을 선택하는 중 오류가 발생했습니다.', 'error');
    }
  };

  const stopRecording = async () => {
    const file = await stopRecordingHook();
    if (file) {
      setSelectedFile(file);
    }
  };

  const togglePlayback = () => {
    if (selectedFile) {
      togglePlaybackHook(selectedFile.uri);
    }
  };

  const handleAnalyze = (navigationCallback) => {
    handleAnalyzeHook(selectedFile, navigationCallback);
  };

  const handleEmergencyReport = () => {
    Alert.alert( '긴급 신고', '보이스피싱이 의심되는 경우 112 또는 경찰청 사이버안전국으로 신고하시겠습니까?',
      [ { text: '취소', style: 'cancel' }, { text: '112 전화', onPress: () => Linking.openURL('tel:112') }, { text: '경찰청 사이버신고', onPress: () => Linking.openURL('https://ecrm.police.go.kr/minwon/main') }, ]
    );
  };
  
  const handleShare = async (item) => {
    if (!item) {
      showToast('공유할 분석 결과가 없습니다.', 'error');
      return;
    }
    try {
      // Construct Share Text
      const verdictIcon = item.isDeepfake ? '⚠️' : '✅';
      const verdictText = item.isDeepfake ? '조작 의심' : '정상'; 
      const verdictFull = `${verdictIcon} ${verdictText}${item.type === 'image' ? ' 이미지' : ' 음성'}`;

      const shareText = `🛡️ VoiceShield AI 분석 결과\n파일: ${item.filename}\n신뢰도: ${item.confidence.toFixed(1)}%\n판정: ${verdictFull}`;

      if (item.type === 'image') {
          // Share Image File
          let fileUri = item.details?.originalUri;

          // If visualized image (with red lines) is available from backend, use it
          if (item.details?.visualized_image) {
              try {
                  const filename = 'visualized_result.jpg';
                  const filePath = `${FileSystem.cacheDirectory}${filename}`;
                  await FileSystem.writeAsStringAsync(filePath, item.details.visualized_image, {
                      encoding: FileSystem.EncodingType.Base64,
                  });
                  fileUri = filePath;
              } catch (e) {
                  console.warn("Failed to save visualized image, falling back to original:", e);
              }
          }

          if (fileUri && await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri, {
                  dialogTitle: 'VoiceShield 이미지 분석 결과 공유',
                  mimeType: 'image/jpeg',
                  UTI: 'public.jpeg'
              });
          } else {
              // Fallback to text
              await Share.share({
                message: shareText,
                title: 'VoiceShield 분석 결과',
              });
          }
      } else {
          // Share Audio/Text
          await Share.share({
            message: shareText,
            title: 'VoiceShield 분석 결과',
          });
      }
    } catch (error) {
      console.error('Share error:', error);
      showToast('공유에 실패했습니다.', 'error');
    }
  };

  const analyzeAudioChunk = async (uri, retryCount = 0) => {
    try {
      // React Native requires specific file object format
      const fileName = uri.split('/').pop();
      const fileType = 'audio/m4a';

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName || 'recording.m4a',
        type: fileType,
      });

      console.log('Analyzing audio chunk:', uri);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let browser/RN set it with boundary
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Analysis result:', result);

        let risk_score = 0;
        if (result.context && result.context.risk_score) {
            risk_score = result.context.risk_score;
        }
        if (result.isDeepfake && result.confidence > 80) {
            risk_score = Math.max(risk_score, 90);
        }

        return {
            risk_score: risk_score,
            detected_keywords: result.context ? result.context.detected_keywords : [],
            isDeepfake: result.isDeepfake,
            context: result.context
        };
      } else {
        console.error('Server error:', response.status, await response.text());
      }
      return null;
    } catch (error) {
      console.error('Chunk analysis error:', error);

      // Retry logic for network errors
      if ((error.name === 'AbortError' || error.message.includes('Network request failed')) && retryCount < 2) {
        console.log(`Retrying... (attempt ${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return analyzeAudioChunk(uri, retryCount + 1);
      }

      return null;
    }
  };

  // --- Context Value ---
  const value = {
    isLoading,
    isOnboardingCompleted,
    completeOnboarding,
    isDarkMode,
    colors,
    isAnalyzing,
    analysisResult,
    history,
    selectedFile,
    isRecording,
    recordingDuration,
    isPlaying,
    playbackPosition,
    playbackDuration,
    historyFilter,
    pulseAnim,
    fadeAnim,
    waveAnim,
    toastConfig,
    showToast,
    hideToast,
    toggleTheme,
    loadHistory,
    saveHistory,
    clearHistory,
    startRecording,
    stopRecording,
    handleFileSelect,
    togglePlayback,
    handleAnalyze,
    handleEmergencyReport,
    handleShare,
    analyzeAudioChunk,
    getFilteredHistory,
    setHistoryFilter,
    historyType,
    setHistoryType,
    setAnalysisResult,
    formatTime,
    formatDuration,
    formatDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};