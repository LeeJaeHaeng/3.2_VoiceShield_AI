import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAppContext } from '../context/AppContext';

import MonitorToggle from '../components/monitor/MonitorToggle';
import MonitorSettings from '../components/monitor/MonitorSettings';
import MonitorStats from '../components/monitor/MonitorStats';

export default function LiveMonitorScreen({ navigation }) {
  const { colors, showToast, analyzeAudioChunk } = useAppContext();
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false);
  const [isSpeakerMode, setIsSpeakerMode] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState('대기 중');
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  
  const recordingRef = useRef(null);
  const isLoopingRef = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeakerMonitoring(); // Cleanup on unmount
    };
  }, []);

  const handleToggleMonitoring = () => {
    setIsMonitoringEnabled(!isMonitoringEnabled);
    if (isMonitoringEnabled) {
        stopSpeakerMonitoring();
        setIsSpeakerMode(false);
    }
    showToast(
      !isMonitoringEnabled
        ? '실시간 모니터링이 활성화되었습니다.'
        : '실시간 모니터링이 비활성화되었습니다.',
      'success'
    );
  };

  const toggleSpeakerMode = async () => {
    if (isSpeakerMode) {
      stopSpeakerMonitoring();
    } else {
      const success = await startSpeakerMonitoring();
      if (success) setIsSpeakerMode(true);
    }
  };

  const startSpeakerMonitoring = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '마이크 접근 권한이 필요합니다.');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      isLoopingRef.current = true;
      setMonitoringStatus('통화 듣는 중...');
      recordingLoop();
      return true;
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      showToast('모니터링 시작 실패', 'error');
      return false;
    }
  };

  const stopSpeakerMonitoring = async () => {
    isLoopingRef.current = false;
    setIsSpeakerMode(false);
    setMonitoringStatus('대기 중');
    setDetectedKeywords([]);
    
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // Ignore error if already stopped
      }
      recordingRef.current = null;
    }
  };

  const recordingLoop = async () => {
    if (!isLoopingRef.current) return;

    try {
      // 1. Create and prepare new recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;

      // 2. Start recording
      await recording.startAsync();
      setMonitoringStatus('녹음 중...');

      // 3. Record for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 4. Check if still monitoring
      if (!isLoopingRef.current) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          console.log('Stop error (expected):', e);
        }
        recordingRef.current = null;
        return;
      }

      // 5. Stop recording and get URI
      setMonitoringStatus('분석 중...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      // 6. Analyze the recorded audio
      if (analyzeAudioChunk && uri) {
        try {
          const result = await analyzeAudioChunk(uri);

          if (result && result.context) {
            const riskScore = result.context.risk_score || 0;
            const keywords = result.context.detected_keywords || [];

            if (riskScore > 30) {
              setMonitoringStatus(`⚠️ 위험 감지! (점수: ${riskScore})`);
              if (keywords.length > 0) {
                setDetectedKeywords(prev => [...new Set([...prev, ...keywords])]);
              }
              // Alert user
              showToast(`⚠️ 보이스피싱 의심! 키워드: ${keywords.join(', ')}`, 'error');
            } else {
              setMonitoringStatus('안전 - 통화 듣는 중...');
            }
          } else {
            setMonitoringStatus('통화 듣는 중...');
          }
        } catch (analyzeError) {
          console.error('Analysis error:', analyzeError);
          setMonitoringStatus('분석 실패 - 재시도 중...');
        }
      }

      // 7. Continue loop after small delay
      if (isLoopingRef.current) {
        setTimeout(() => recordingLoop(), 500);
      }

    } catch (error) {
      console.error('Recording loop error:', error);

      // Clean up on error
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          // Ignore
        }
        recordingRef.current = null;
      }

      // Retry after delay if still monitoring
      if (isLoopingRef.current) {
        setMonitoringStatus('오류 발생 - 재시도 중...');
        setTimeout(() => recordingLoop(), 2000);
      }
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Ionicons name="radio" size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              실시간 통화 모니터링
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              통화 중 실시간으로 보이스피싱을 탐지합니다
            </Text>
          </View>

          {/* 모니터링 토글 */}
          <MonitorToggle
            isEnabled={isMonitoringEnabled}
            onToggle={handleToggleMonitoring}
            colors={colors}
          />

          {/* 스피커폰 모드 카드 */}
          {isMonitoringEnabled && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: isSpeakerMode ? colors.primary : colors.border }]}>
                <View style={styles.cardHeader}>
                    <Ionicons name="mic" size={24} color={isSpeakerMode ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>스피커폰 감지 모드</Text>
                </View>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                    통화를 스피커폰으로 전환하면 AI가 실시간으로 대화를 듣고 분석합니다.
                </Text>
                
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: isSpeakerMode ? colors.destructive : colors.primary }]}
                    onPress={toggleSpeakerMode}
                >
                    <Text style={styles.actionButtonText}>
                        {isSpeakerMode ? '감지 중지' : '감지 시작'}
                    </Text>
                </TouchableOpacity>

                {isSpeakerMode && (
                    <View style={styles.statusContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.statusText, { color: colors.primary }]}>{monitoringStatus}</Text>
                    </View>
                )}
                
                {detectedKeywords.length > 0 && (
                    <View style={styles.keywordContainer}>
                        <Text style={[styles.keywordLabel, { color: colors.mutedForeground }]}>감지된 키워드:</Text>
                        <View style={styles.keywordList}>
                            {detectedKeywords.map((k, i) => (
                                <View key={i} style={[styles.keywordBadge, { backgroundColor: colors.destructive + '20' }]}>
                                    <Text style={[styles.keywordText, { color: colors.destructive }]}>{k}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
          )}

          {/* 추가 설정 */}
          <MonitorSettings
            autoBlockEnabled={true}
            onAutoBlockToggle={() => {}}
            notificationEnabled={true}
            onNotificationToggle={() => {}}
            colors={colors}
          />

          {/* 통계 */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            통계
          </Text>
          <MonitorStats colors={colors} />

          {/* 사용 안내 */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              통화를 스피커폰으로 전환하고 "감지 시작" 버튼을 누르면{'\n'}
              AI가 실시간으로 대화 내용을 분석하여 보이스피싱을 탐지합니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      gap: 12,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  cardDesc: {
      fontSize: 14,
      lineHeight: 20,
  },
  actionButton: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
  },
  actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      justifyContent: 'center',
  },
  statusText: {
      fontWeight: '600',
  },
  keywordContainer: {
      marginTop: 12,
      gap: 8,
  },
  keywordLabel: {
      fontSize: 14,
  },
  keywordList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  keywordBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
  },
  keywordText: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  infoCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
      marginTop: 8,
  },
  infoText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
  },
});