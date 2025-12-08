import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LiveMonitorBanner from '../components/LiveMonitorBanner';
import RecordingSection from '../components/RecordingSection';
import UploadSection from '../components/UploadSection';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    colors,
    isRecording,
    startRecording,
    stopRecording,
    recordingDuration,
    pulseAnim,
    waveAnim,
    formatTime,
    handleFileSelect,
    selectedFile,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    formatDuration,
    handleAnalyze,
    isAnalyzing,
  } = useAppContext();
  
  const navigation = useNavigation();

  const onAnalyzeAndNavigate = () => {
    handleAnalyze((result) => {
      if (result) {
        navigation.navigate('ResultDetail', { result });
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status Bar Section */}
      <View style={[styles.statusContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={[styles.statusText, { color: "#10B981" }]}>안전 상태: 양호</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>
          실시간 보이스피싱 보호가 활성화되어 있습니다.
        </Text>
      </View>

      <LiveMonitorBanner 
        onPress={() => navigation.navigate('LiveMonitor')}
        colors={colors}
      />



      {/* Voice Detection Section */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="mic" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>보이스피싱 탐지</Text>
        </View>
        
        <RecordingSection
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          recordingDuration={recordingDuration}
          pulseAnim={pulseAnim}
          waveAnim={waveAnim}
          formatTime={formatTime}
          colors={colors}
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <UploadSection
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          isPlaying={isPlaying}
          onTogglePlayback={togglePlayback}
          playbackPosition={playbackPosition}
          playbackDuration={playbackDuration}
          formatDuration={formatDuration}
          onAnalyze={onAnalyzeAndNavigate}
          isAnalyzing={isAnalyzing}
          colors={colors}
        />
      </View>

      {/* Image Detection Section */}
      <View style={[styles.sectionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="image" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>이미지 탐지</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
          onPress={() => navigation.navigate('ImageDetectionScreen')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="scan-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>이미지 분석 시작</Text>
            <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>
              딥페이크가 의심되는 사물/인물 사진을 분석합니다.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusDesc: {
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
  },
  sectionContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionDesc: {
    fontSize: 13,
  },
});