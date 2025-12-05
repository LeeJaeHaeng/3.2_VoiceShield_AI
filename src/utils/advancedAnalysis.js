// src/utils/advancedAnalysis.js - 고급 분석 Mock 데이터 생성
export const generateAdvancedAnalysis = (seed = Date.now()) => {
  // Seed 기반 랜덤 생성
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };

  return {
    // MFCC (Mel-frequency cepstral coefficients) - 13개 계수, 20개 프레임
    mfcc: Array.from({ length: 13 }, (_, i) =>
      Array.from({ length: 20 }, (_, j) => random(-20, 20))
    ),

    // 스펙트럼 특징
    spectralFeatures: {
      centroid: Array.from({ length: 50 }, () => random(1000, 5000)),
      rolloff: Array.from({ length: 50 }, () => random(3000, 8000)),
      flux: Array.from({ length: 50 }, () => random(0, 100)),
      zeroCrossingRate: Array.from({ length: 50 }, () => random(0, 0.3)),
    },

    // 화자 인식 특징 (Voice Fingerprint)
    voiceFingerprint: {
      pitchMean: random(100, 250), // Hz
      pitchVariance: random(10, 50),
      formantF1: random(400, 700), // 첫 번째 포먼트
      formantF2: random(1200, 2000), // 두 번째 포먼트
      formantF3: random(2200, 3000), // 세 번째 포먼트
      jitter: random(0, 0.02), // 피치 지터 (%)
      shimmer: random(0, 0.1), // 진폭 시머 (%)
      harmonicToNoiseRatio: random(10, 25), // dB
    },

    // 화자 프로필 매칭
    speakerMatch: {
      confidence: random(60, 95),
      matchedSpeakerId: random(0, 1) > 0.5 ? `speaker_${Math.floor(random(1, 100))}` : null,
      characteristics: {
        gender: random(0, 1) > 0.5 ? '남성' : '여성',
        ageRange: ['청년', '중년', '노년'][Math.floor(random(0, 3))],
        accent: ['서울', '경상', '전라', '충청', '강원', '제주'][Math.floor(random(0, 6))],
      },
    },

    // 딥페이크 탐지 세부 지표
    deepfakeIndicators: {
      phaseCoherence: random(50, 100), // 위상 일관성
      temporalConsistency: random(50, 100), // 시간 일관성
      spectralAnomaly: random(50, 100), // 스펙트럼 이상
      artifactDetection: random(50, 100), // 인공물 탐지
      lipSyncConsistency: random(50, 100), // 립싱크 일관성 (영상 있을 경우)
    },

    // 감정 분석 (추가)
    emotionAnalysis: {
      neutral: random(0, 100),
      happy: random(0, 100),
      sad: random(0, 100),
      angry: random(0, 100),
      fear: random(0, 100),
      surprise: random(0, 100),
    },

    // 음성 품질 지표
    audioQuality: {
      snr: random(10, 40), // Signal-to-Noise Ratio (dB)
      bitrate: random(64, 320), // kbps
      sampleRate: random(8000, 48000), // Hz
      dynamicRange: random(30, 90), // dB
    },
  };
};

// 고급 분석 결과 포맷팅
export const formatAdvancedAnalysis = (advancedAnalysis) => {
  const { voiceFingerprint, speakerMatch, deepfakeIndicators } = advancedAnalysis;

  return {
    voiceProfile: `
음성 특성:
- 평균 피치: ${voiceFingerprint.pitchMean.toFixed(0)} Hz
- 포먼트: F1=${voiceFingerprint.formantF1.toFixed(0)}, F2=${voiceFingerprint.formantF2.toFixed(0)}, F3=${voiceFingerprint.formantF3.toFixed(0)}
- Jitter: ${(voiceFingerprint.jitter * 100).toFixed(2)}%
- Shimmer: ${(voiceFingerprint.shimmer * 100).toFixed(2)}%
- HNR: ${voiceFingerprint.harmonicToNoiseRatio.toFixed(1)} dB
    `.trim(),

    speakerInfo: `
화자 정보:
- 성별: ${speakerMatch.characteristics.gender}
- 연령대: ${speakerMatch.characteristics.ageRange}
- 억양: ${speakerMatch.characteristics.accent}권
- 매칭 신뢰도: ${speakerMatch.confidence.toFixed(1)}%
    `.trim(),

    riskAssessment: `
딥페이크 위험 평가:
- 위상 일관성: ${deepfakeIndicators.phaseCoherence.toFixed(0)}%
- 시간 일관성: ${deepfakeIndicators.temporalConsistency.toFixed(0)}%
- 스펙트럼 이상: ${deepfakeIndicators.spectralAnomaly.toFixed(0)}%
- 인공물 탐지: ${deepfakeIndicators.artifactDetection.toFixed(0)}%
    `.trim(),
  };
};