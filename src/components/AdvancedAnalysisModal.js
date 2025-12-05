// src/components/AdvancedAnalysisModal.js - 고급 분석 상세 모달
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';

const { width: screenWidth } = Dimensions.get('window');

export default function AdvancedAnalysisModal({ visible, onClose, analysisResult }) {
  const { colors } = useAppContext();

  if (!analysisResult) {
    return null;
  }

  const isImage = analysisResult.type === 'image';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {isImage ? '📊 이미지 정밀 분석' : '📊 고급 분석 (MFCC & 음성 지문)'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.mutedForeground }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {isImage ? (
                // --- Image Analysis Details ---
                <>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            🧠 AI 모델 분석
                        </Text>
                        <View style={styles.grid}>
                            <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                                <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>AI 생성 확률</Text>
                                <Text style={[styles.gridValue, { color: colors.destructive }]}>
                                    {analysisResult.details.ai_probability ? analysisResult.details.ai_probability.toFixed(1) : 0}%
                                </Text>
                            </View>
                            <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                                <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>판정 (Verdict)</Text>
                                <Text style={[styles.gridValue, { color: colors.accent }]}>
                                    {analysisResult.details.verdict || 'Unknown'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            🔍 ELA (Error Level Analysis)
                        </Text>
                        <View style={styles.grid}>
                            <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                                <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>ELA 점수</Text>
                                <Text style={[styles.gridValue, { color: colors.secondary }]}>
                                    {analysisResult.details.ela_score ? analysisResult.details.ela_score.toFixed(1) : 0}
                                </Text>
                            </View>
                            <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                                <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>변조 의심 여부</Text>
                                <Text style={[styles.gridValue, { color: analysisResult.details.ela_score > 30 ? colors.destructive : colors.green }]}>
                                    {analysisResult.details.ela_score > 30 ? '의심됨' : '정상'}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.description, { color: colors.mutedForeground, marginTop: 12 }]}>
                            * ELA는 이미지의 압축 레벨 차이를 분석하여 원본과 다른 압축률을 가진 영역(조작된 부분)을 찾아냅니다. 점수가 높을수록 조작 가능성이 높습니다.
                        </Text>
                    </View>
                </>
            ) : (
                // --- Audio Analysis Details ---
                analysisResult.advancedAnalysis && (
                <>
                    {/* 음성 지문 */}
                    <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        🔬 음성 지문 (Voice Fingerprint)
                    </Text>
                    <View style={styles.grid}>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>평균 피치</Text>
                        <Text style={[styles.gridValue, { color: colors.accent }]}>
                            {analysisResult.advancedAnalysis.voiceFingerprint.pitchMean.toFixed(0)} Hz
                        </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>피치 분산</Text>
                        <Text style={[styles.gridValue, { color: colors.accent }]}>
                            {analysisResult.advancedAnalysis.voiceFingerprint.pitchVariance.toFixed(1)}
                        </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Formant F1</Text>
                        <Text style={[styles.gridValue, { color: colors.secondary }]}>
                            {analysisResult.advancedAnalysis.voiceFingerprint.formantF1.toFixed(0)} Hz
                        </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Formant F2</Text>
                        <Text style={[styles.gridValue, { color: colors.secondary }]}>
                            {analysisResult.advancedAnalysis.voiceFingerprint.formantF2.toFixed(0)} Hz
                        </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Jitter</Text>
                        <Text style={[styles.gridValue, { color: '#F59E0B' }]}>
                            {(analysisResult.advancedAnalysis.voiceFingerprint.jitter * 100).toFixed(2)}%
                        </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                        <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Shimmer</Text>
                        <Text style={[styles.gridValue, { color: '#F59E0B' }]}>
                            {(analysisResult.advancedAnalysis.voiceFingerprint.shimmer * 100).toFixed(2)}%
                        </Text>
                        </View>
                    </View>
                    </View>

                    {/* 화자 분리 (Diarization) */}
                    {analysisResult.speaker?.diarization && analysisResult.speaker.diarization.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                🗣️ 화자 분리 분석
                            </Text>
                            {analysisResult.speaker.diarization.map((speaker, index) => (
                                <View key={index} style={[styles.speakerCard, { backgroundColor: colors.input, borderColor: colors.border, marginBottom: 8 }]}>
                                    <View style={styles.speakerRow}>
                                        <Text style={[styles.speakerLabel, { color: colors.primary, fontWeight: 'bold' }]}>
                                            {speaker.id}
                                        </Text>
                                        <Text style={[styles.speakerValue, { color: colors.mutedForeground }]}>
                                            {speaker.duration.toFixed(1)}초 발화
                                        </Text>
                                    </View>
                                    <View style={styles.speakerRow}>
                                        <Text style={[styles.speakerLabel, { color: colors.mutedForeground }]}>성별/연령:</Text>
                                        <Text style={[styles.speakerValue, { color: colors.foreground }]}>
                                            {speaker.demographics?.gender === 'Female' ? '여성' : 
                                             speaker.demographics?.gender === 'Male' ? '남성' : '미상'} 
                                            {' '}({speaker.demographics?.age_group || 'Unknown'})
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 화자 특성 */}
                    <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        👤 화자 특성 분석
                    </Text>
                    <View style={[styles.speakerCard, { backgroundColor: colors.input, borderColor: colors.border }]}>
                        {analysisResult.speaker?.demographics ? (
                            <>
                                <View style={styles.speakerRow}>
                                <Text style={[styles.speakerLabel, { color: colors.mutedForeground }]}>성별:</Text>
                                <Text style={[styles.speakerValue, { color: colors.foreground }]}>
                                    {analysisResult.speaker.demographics.gender === 'Female' ? '여성' : 
                                     analysisResult.speaker.demographics.gender === 'Male' ? '남성' : '미상'}
                                </Text>
                                </View>
                                <View style={styles.speakerRow}>
                                <Text style={[styles.speakerLabel, { color: colors.mutedForeground }]}>연령대:</Text>
                                <Text style={[styles.speakerValue, { color: colors.foreground }]}>
                                    {analysisResult.speaker.demographics.age_group}
                                </Text>
                                </View>
                                <View style={styles.speakerRow}>
                                <Text style={[styles.speakerLabel, { color: colors.mutedForeground }]}>분석 모델:</Text>
                                <Text style={[styles.speakerValue, { color: colors.foreground }]}>
                                    Wav2Vec2 (Age/Gender)
                                </Text>
                                </View>
                            </>
                        ) : (
                            <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
                                화자 특성 정보가 없습니다.
                            </Text>
                        )}
                    </View>
                    </View>

                    {/* 딥페이크 지표 */}
                    <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        🚨 딥페이크 탐지 지표
                    </Text>
                    {Object.entries(analysisResult.advancedAnalysis.deepfakeIndicators).map(([key, value]) => (
                        <View key={key} style={styles.indicatorItem}>
                        <Text style={[styles.indicatorLabel, { color: colors.mutedForeground }]}>
                            {key === 'phaseCoherence'
                            ? '위상 일관성'
                            : key === 'temporalConsistency'
                            ? '시간 일관성'
                            : key === 'spectralAnomaly'
                            ? '스펙트럼 이상'
                            : key === 'artifactDetection'
                            ? '인공물 탐지'
                            : '립싱크 일관성'}
                        </Text>
                        <View style={styles.indicatorBarContainer}>
                            <View style={[styles.indicatorBarBg, { backgroundColor: colors.muted }]}>
                            <View
                                style={[
                                styles.indicatorBarFill,
                                {
                                    width: `${value}%`,
                                    backgroundColor: value > 70 ? colors.destructive : colors.green,
                                },
                                ]}
                            />
                            </View>
                            <Text style={[styles.indicatorPercent, { color: colors.foreground }]}>
                            {value.toFixed(0)}%
                            </Text>
                        </View>
                        </View>
                    ))}
                    </View>

                    {/* 감정 분석 */}
                    {analysisResult.advancedAnalysis.emotionAnalysis && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        😊 감정 분석
                        </Text>
                        <View style={[styles.chartContainer, { backgroundColor: colors.input }]}>
                        <Svg width={screenWidth - 100} height={150}>
                            {Object.entries(analysisResult.advancedAnalysis.emotionAnalysis).map(([emotion, value], index) => {
                            const barWidth = (screenWidth - 100) / Object.keys(analysisResult.advancedAnalysis.emotionAnalysis).length - 8;
                            const x = index * ((screenWidth - 100) / Object.keys(analysisResult.advancedAnalysis.emotionAnalysis).length);
                            const height = (value / 100) * 120;
                            
                            return (
                                <React.Fragment key={emotion}>
                                <Rect
                                    x={x + 4}
                                    y={130 - height}
                                    width={barWidth}
                                    height={height}
                                    fill={colors.accent}
                                    opacity={0.8}
                                />
                                </React.Fragment>
                            );
                            })}
                        </Svg>
                        <View style={styles.emotionLabels}>
                            {Object.entries(analysisResult.advancedAnalysis.emotionAnalysis).map(([emotion, value]) => (
                            <View key={emotion} style={styles.emotionLabelItem}>
                                <Text style={[styles.emotionLabel, { color: colors.mutedForeground }]}>
                                {emotion === 'neutral'
                                    ? '평온'
                                    : emotion === 'happy'
                                    ? '기쁨'
                                    : emotion === 'sad'
                                    ? '슬픔'
                                    : emotion === 'angry'
                                    ? '분노'
                                    : emotion === 'fear'
                                    ? '두려움'
                                    : '놀람'}
                                </Text>
                                <Text style={[styles.emotionValue, { color: colors.foreground }]}>
                                {value.toFixed(0)}%
                                </Text>
                            </View>
                            ))}
                        </View>
                        </View>
                    </View>
                    )}

                    {/* 음성 품질 */}
                    {analysisResult.advancedAnalysis.audioQuality && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        🎵 음성 품질 지표
                        </Text>
                        <View style={styles.grid}>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                            <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>SNR</Text>
                            <Text style={[styles.gridValue, { color: colors.green }]}>
                            {analysisResult.advancedAnalysis.audioQuality.snr.toFixed(1)} dB
                            </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                            <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Bitrate</Text>
                            <Text style={[styles.gridValue, { color: colors.green }]}>
                            {analysisResult.advancedAnalysis.audioQuality.bitrate.toFixed(0)} kbps
                            </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                            <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Sample Rate</Text>
                            <Text style={[styles.gridValue, { color: colors.green }]}>
                            {(analysisResult.advancedAnalysis.audioQuality.sampleRate / 1000).toFixed(1)} kHz
                            </Text>
                        </View>
                        <View style={[styles.gridItem, { backgroundColor: colors.input }]}>
                            <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>Dynamic Range</Text>
                            <Text style={[styles.gridValue, { color: colors.green }]}>
                            {analysisResult.advancedAnalysis.audioQuality.dynamicRange.toFixed(0)} dB
                            </Text>
                        </View>
                        </View>
                    </View>
                    )}
                </>
                )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  gridLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakerCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  speakerLabel: {
    fontSize: 13,
  },
  speakerValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  indicatorItem: {
    marginBottom: 16,
  },
  indicatorLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  indicatorBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicatorBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  indicatorBarFill: {
    height: '100%',
  },
  indicatorPercent: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 8,
  },
  emotionLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  emotionLabelItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  emotionLabel: {
    fontSize: 10,
  },
  emotionValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
      fontSize: 13,
      lineHeight: 18,
  }
});