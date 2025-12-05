import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 80;
const WAVEFORM_HEIGHT = 80;
const SPECTRUM_HEIGHT = 100;

function generateAreaPath(data, width, height) {
  if (!data || data.length === 0) return 'M 0 0';
  const step = width / (data.length - 1);
  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - (val / 100) * height;
    return `${x},${y}`;
  });
  return `M 0,${points[0].split(',')[1]} ${points.map(p => `L ${p}`).join(' ')} L ${width},${height} L 0,${height} Z`;
}
function generateLinePath(data, width, height) {
  if (!data || data.length === 0) return 'M 0 0';
  const step = width / (data.length - 1);
  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - (val / 100) * height;
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  });
  return points.join(' ');
}

export default function ResultSection({
  analysisResult,
  onShare,
  fadeAnim,
  colors,
}) {
  const [imageLayout, setImageLayout] = useState(null);
  
  const waveformAreaPath = analysisResult.waveform ? generateAreaPath(analysisResult.waveform, CHART_WIDTH, WAVEFORM_HEIGHT) : 'M 0 0';
  const waveformLinePath = analysisResult.waveform ? generateLinePath(analysisResult.waveform, CHART_WIDTH, WAVEFORM_HEIGHT) : 'M 0 0';
  const spectrumAreaPath = analysisResult.spectrum ? generateAreaPath(analysisResult.spectrum, CHART_WIDTH, SPECTRUM_HEIGHT) : 'M 0 0';
  const spectrumLinePath = analysisResult.spectrum ? generateLinePath(analysisResult.spectrum, CHART_WIDTH, SPECTRUM_HEIGHT) : 'M 0 0';

  const renderSuspiciousRegions = () => {
      if (!imageLayout || !analysisResult.details?.suspicious_regions || !analysisResult.details?.image_dimensions) return null;

      const { width: imgWidth, height: imgHeight } = analysisResult.details.image_dimensions;
      const { width: viewWidth, height: viewHeight } = imageLayout;

      // Calculate scale to fit 'contain' mode
      const scale = Math.min(viewWidth / imgWidth, viewHeight / imgHeight);
      
      // Calculate displayed dimensions
      const displayWidth = imgWidth * scale;
      const displayHeight = imgHeight * scale;

      // Calculate offsets (centering)
      const offsetX = (viewWidth - displayWidth) / 2;
      const offsetY = (viewHeight - displayHeight) / 2;

      return (
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              {analysisResult.details.suspicious_regions.map((region, index) => {
                  // region is a list of [x, y] points
                  const points = region.map(p => {
                      const x = p[0] * scale + offsetX;
                      const y = p[1] * scale + offsetY;
                      return `${x},${y}`;
                  }).join(' ');

                  return (
                      <Polyline
                          key={index}
                          points={points}
                          fill="none"
                          stroke="red"
                          strokeWidth="2"
                      />
                  );
              })}
          </Svg>
      );
  };

  return (
    <Animated.View
      style={[
        styles.resultCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim },
      ]}
    >
      {/* Header */}
      <View style={styles.resultHeader}>
        <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>분석 결과</Text>
            <Text style={[styles.resultFilename, { color: colors.mutedForeground }]} numberOfLines={1}>
                {analysisResult.filename}
            </Text>
            <Text style={[styles.resultTimestamp, { color: colors.mutedForeground }]}>
                {new Date(analysisResult.timestamp).toLocaleString('ko-KR')}
            </Text>
            </View>
            {/* Badge */}
            <View
            style={[
                styles.badge,
                { backgroundColor: analysisResult.isDeepfake ? colors.destructive : colors.green + '10' },
            ]}
            >
            <Text style={styles.badgeIcon}>{analysisResult.isDeepfake ? '⚠️' : '✅'}</Text>
            <Text style={[styles.badgeText, { color: analysisResult.isDeepfake ? '#fff' : colors.green }]}>
                {analysisResult.isDeepfake ? '조작 의심' : '정상 가능성'}
            </Text>
            </View>
        </View>
        
        {/* Confidence Progress Bar - Colored Box */}
        <View style={[
          styles.confidenceContainer,
          { backgroundColor: analysisResult.isDeepfake ? colors.destructive : colors.green }
        ]}>
          <View style={styles.confidenceLabelRow}>
            <Text style={[styles.confidenceLabel, { color: '#fff' }]}>신뢰도</Text>
            <Text style={[styles.confidenceValueBox, { color: analysisResult.isDeepfake ? '#FFEB3B' : '#fff' }]}>
              {analysisResult.confidence ? analysisResult.confidence.toFixed(1) : '0.0'}%
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${analysisResult.confidence || 0}%`,
                  backgroundColor: analysisResult.isDeepfake ? '#FFEB3B' : '#fff',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Image Visualization */}
      {analysisResult.type === 'image' && analysisResult.details?.originalUri && (
        <View style={styles.imageSection}>
             <View 
                style={styles.imageContainer}
                onLayout={(event) => setImageLayout(event.nativeEvent.layout)}
             >
                <Image 
                    source={{ uri: analysisResult.details.originalUri }} 
                    style={styles.resultImage} 
                    resizeMode="contain" 
                />
                {renderSuspiciousRegions()}
             </View>
             
             {analysisResult.isDeepfake && (
                 <Text style={[styles.elaDescription, { color: colors.destructive }]}>
                     * 붉은색 라인으로 표시된 영역이 조작 의심 부분입니다.
                 </Text>
             )}
        </View>
      )}

      {/* Analysis Breakdown */}
      {analysisResult.type === 'image' ? (
        <View style={styles.breakdownGrid}>
          <View style={[styles.breakdownItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>AI 생성 확률</Text>
            <Text style={[styles.breakdownValue, { color: colors.accent }]}>
              {analysisResult.details.ai_probability ? analysisResult.details.ai_probability.toFixed(1) : '0.0'}%
            </Text>
          </View>
          <View style={[styles.breakdownItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>ELA 점수</Text>
            <Text style={[styles.breakdownValue, { color: colors.accent }]}>
              {analysisResult.details.ela_score ? analysisResult.details.ela_score.toFixed(1) : '0.0'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.breakdownGrid}>
          <View style={[styles.breakdownItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>주파수 분석</Text>
            <Text style={[styles.breakdownValue, { color: colors.accent }]}>
              {analysisResult.details?.frequencyAnalysis ? analysisResult.details.frequencyAnalysis.toFixed(0) : '0'}%
            </Text>
          </View>
          <View style={[styles.breakdownItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>시간 패턴</Text>
            <Text style={[styles.breakdownValue, { color: colors.accent }]}>
              {analysisResult.details?.temporalPattern ? analysisResult.details.temporalPattern.toFixed(0) : '0'}%
            </Text>
          </View>
          <View style={[styles.breakdownItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>음향 특성</Text>
            <Text style={[styles.breakdownValue, { color: colors.accent }]}>
              {analysisResult.details?.acousticFeature ? analysisResult.details.acousticFeature.toFixed(0) : '0'}%
            </Text>
          </View>
        </View>
      )}

      {/* Advanced Analysis Info */}
      {analysisResult.type !== 'image' && (
        <View style={styles.advancedInfoContainer}>
            {/* Speaker Info */}
            {analysisResult.speaker?.demographics && (
                <View style={[styles.infoItem, { backgroundColor: colors.input, borderColor: colors.border }]}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>화자 정보</Text>
                    <Text style={[styles.infoValue, { color: colors.foreground }]}>
                        {analysisResult.speaker.demographics.gender === 'Female' ? '여성' : '남성'} / {analysisResult.speaker.demographics.age_group}
                    </Text>
                </View>
            )}
            
            {/* Context Summary */}
            {analysisResult.context?.summary && (
                <View style={[styles.infoItem, { backgroundColor: colors.input, borderColor: colors.border, marginTop: 8 }]}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>대화 요약</Text>
                    <Text style={[styles.infoText, { color: colors.foreground }]}>
                        {analysisResult.context.summary}
                    </Text>
                </View>
            )}
        </View>
      )}

      {/* Waveform Visualization (Audio Only) */}
      {analysisResult.type !== 'image' && (
        <>
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>음성 파형</Text>
            <View style={[styles.waveformChart, { backgroundColor: colors.input }]}>
              <Svg width={CHART_WIDTH} height={WAVEFORM_HEIGHT}>
                <Defs>
                  <LinearGradient id="waveGradient" x1="0" y1="0" x2="0" y2={WAVEFORM_HEIGHT}>
                    <Stop offset="0" stopColor={colors.accent} stopOpacity="0.4" />
                    <Stop offset="1" stopColor={colors.accent} stopOpacity="0.1" />
                  </LinearGradient>
                </Defs>
                <Path d={waveformAreaPath} fill="url(#waveGradient)" />
                <Path
                  d={waveformLinePath}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth="2"
                />
              </Svg>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>주파수 스펙트럼</Text>
            <View style={[styles.spectrumChart, { backgroundColor: colors.input }]}>
              <Svg width={CHART_WIDTH} height={SPECTRUM_HEIGHT}>
                <Defs>
                  <LinearGradient id="specGradient" x1="0" y1="0" x2="0" y2={SPECTRUM_HEIGHT}>
                    <Stop offset="0" stopColor={colors.secondary} stopOpacity="0.4" />
                    <Stop offset="1" stopColor={colors.secondary} stopOpacity="0.1" />
                  </LinearGradient>
                </Defs>
                <Path d={spectrumAreaPath} fill="url(#specGradient)" />
                <Path
                  d={spectrumLinePath}
                  fill="none"
                  stroke={colors.secondary}
                  strokeWidth="2"
                />
              </Svg>
            </View>
          </View>
        </>
      )}

      {/* Action Buttons - Removed for cleaner UI */}
      {analysisResult.type !== 'image' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={onShare}
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={[styles.actionButtonText, { color: colors.primaryForeground }]}>결과 공유</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recommendation */}
      <View
        style={[
          styles.recommendation,
          {
            backgroundColor: analysisResult.isDeepfake ? colors.destructive + '10' : colors.green + '10',
            borderColor: analysisResult.isDeepfake ? colors.destructive + '30' : colors.green + '30',
          },
        ]}
      >
        <Text style={[styles.recommendationTitle, { color: colors.foreground }]}>권장사항</Text>
        <Text style={[styles.recommendationText, { color: colors.mutedForeground }]}>
          {analysisResult.isDeepfake
            ? '⚠️ 이 음성은 AI로 합성된 것으로 의심됩니다. 발신자를 확인하고, 금전 요구나 개인정보 제공은 절대 하지 마세요. 의심스러운 경우 112 또는 경찰청 사이버안전국(182)으로 즉시 신고하세요.'
            : '✅ 현재 분석 결과 정상 음성으로 판단됩니다. 하지만 100% 확실한 것은 아니므로, 중요한 내용은 반드시 여러 경로로 확인하세요.'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  resultCard: { borderWidth: 1, borderRadius: 10, padding: 16, gap: 16, },
  resultHeader: { gap: 12 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, },
  resultFilename: { fontSize: 13, },
  resultTimestamp: { fontSize: 11, marginTop: 2, },
  badge: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, },
  badgeIcon: { fontSize: 14, },
  badgeText: { fontSize: 12, fontWeight: '600', },
  confidenceSection: { gap: 8, },
  confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  confidenceLabel: { fontSize: 14, fontWeight: '600', },
  confidenceValue: { fontSize: 20, fontWeight: 'bold', },
  confidenceValueBox: { fontSize: 18, fontWeight: 'bold', },
  confidenceBar: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  confidenceBarFill: { height: '100%', },
  confidenceContainer: { marginBottom: 12, padding: 12, borderRadius: 8, },
  confidenceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, },
  progressBarBackground: { height: 12, borderRadius: 6, overflow: 'hidden', },
  progressBarFill: { height: '100%', borderRadius: 6, },
  breakdownGrid: { flexDirection: 'row', gap: 8, },
  breakdownItem: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, },
  breakdownLabel: { fontSize: 11, marginBottom: 4, },
  breakdownValue: { fontSize: 18, fontWeight: 'bold', },
  chartContainer: { gap: 8, },
  chartTitle: { fontSize: 13, fontWeight: '600', },
  waveformChart: { borderRadius: 8, overflow: 'hidden', height: WAVEFORM_HEIGHT, justifyContent: 'center', alignItems: 'center', },
  spectrumChart: { borderRadius: 8, overflow: 'hidden', height: SPECTRUM_HEIGHT, justifyContent: 'center', alignItems: 'center', },
  actionButtons: { flexDirection: 'row', gap: 8, },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, gap: 6, },
  actionButtonIcon: { fontSize: 14, },
  actionButtonText: { fontSize: 13, fontWeight: '600', },
  recommendation: { padding: 12, borderRadius: 8, borderWidth: 1, },
  recommendationTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4, },
  recommendationText: { fontSize: 12, lineHeight: 18, },
  imageSection: { gap: 8, marginBottom: 8 },
  imageContainer: { height: 220, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  resultImage: { width: '100%', height: '100%' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  toggleLabel: { fontSize: 13, fontWeight: '600' },
  elaDescription: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  advancedInfoContainer: { marginTop: 8 },
  infoItem: { padding: 12, borderRadius: 8, borderWidth: 1 },
  infoLabel: { fontSize: 11, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold' },
  infoText: { fontSize: 13, lineHeight: 18 }
});