import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Animated, View, Text, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import ResultSection from '../components/ResultSection';
import { useRoute, useNavigation } from '@react-navigation/native';
import AdvancedAnalysisModal from '../components/AdvancedAnalysisModal';

export default function ResultDetailScreen() {
  const { colors, handleShare, handleEmergencyReport } = useAppContext();
  const route = useRoute();
  const navigation = useNavigation();
  
  const { result: item } = route.params;

  const [showAdvancedModal, setShowAdvancedModal] = useState(false); 

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: item?.filename || '분석 결과',
    });
  }, [navigation, item]);

  const immediateFadeAnim = useRef(new Animated.Value(1)).current; 

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>

        <ResultSection
          analysisResult={item}
          fadeAnim={immediateFadeAnim} 
          colors={colors}
        />
        
        {/* Context Analysis Card */}
        {item.context && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>💬 대화 맥락 분석</Text>

            {/* Risk Score Progress Bar */}
            <View style={[
              styles.riskScoreContainer,
              { backgroundColor: item.context.risk_score > 50 ? colors.destructive : colors.green }
            ]}>
              <View style={styles.riskScoreLabelRow}>
                <Text style={[styles.riskScoreLabel, { color: '#fff' }]}>위험도</Text>
                <Text style={[styles.riskScoreValue, { color: item.context.risk_score > 50 ? '#FFEB3B' : '#fff' }]}>
                  {item.context.risk_score.toFixed(0)}점
                </Text>
              </View>
              <View style={[styles.progressBarBackground, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.context.risk_score}%`,
                      backgroundColor: item.context.risk_score > 50 ? colors.destructive : colors.green,
                    },
                  ]}
                />
              </View>
            </View>

            {item.context.detected_keywords && item.context.detected_keywords.length > 0 && (
              <View style={styles.keywordContainer}>
                {item.context.detected_keywords.map((kw, idx) => (
                  <View key={idx} style={[styles.keywordBadge, { backgroundColor: colors.destructive + '20' }]}>
                    <Text style={[styles.keywordText, { color: colors.destructive }]}>{kw}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.transcription, { color: colors.mutedForeground }]}>
              "{item.context.text}"
            </Text>
          </View>
        )}

        {/* Speaker Match Card */}
        {item.speaker && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>👤 화자 식별 (Voice ID)</Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>식별된 화자:</Text>
              <Text style={[styles.value, { color: item.speaker.id !== 'Unknown' ? colors.green : colors.mutedForeground }]}>
                {item.speaker.id !== 'Unknown' ? item.speaker.id : '등록되지 않은 사용자'}
              </Text>
            </View>
            {item.speaker.id !== 'Unknown' && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>일치율:</Text>
                <Text style={[styles.value, { color: colors.foreground }]}>
                  {item.speaker.similarity.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => setShowAdvancedModal(true)}
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={[styles.actionButtonText, { color: colors.primaryForeground }]}>
              고급 분석 보기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShare(item)}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={[styles.actionButtonText, { color: colors.primaryForeground }]}>
              결과 공유
            </Text>
          </TouchableOpacity>

          {item.isDeepfake && (
            <TouchableOpacity
              onPress={handleEmergencyReport}
              style={[styles.actionButton, { backgroundColor: colors.destructive }]}
            >
              <Text style={styles.actionButtonIcon}>🚨</Text>
              <Text style={[styles.actionButtonText, { color: colors.destructiveForeground }]}>
                긴급 신고
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
      
      <AdvancedAnalysisModal
        visible={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        analysisResult={item}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  keywordContainer: {
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
    fontWeight: '600',
  },
  transcription: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  riskScoreContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  riskScoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  riskScoreStatus: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});