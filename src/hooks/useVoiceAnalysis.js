import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useVoiceAnalysis = (isActive = false) => {
  const [riskLevel, setRiskLevel] = useState('safe'); // safe, warning, danger
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const waveAnim = useRef(new Animated.Value(0)).current;
  const riskOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      startWaveAnimation();
      
      // 5초마다 자동 분석
      const analysisInterval = setInterval(() => {
        performAnalysis();
      }, 5000);

      return () => clearInterval(analysisInterval);
    }
  }, [isActive]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
  };

  const performAnalysis = () => {
    setIsAnalyzing(true);

    // 랜덤 분석 결과 생성
    const randomConfidence = Math.random() * 100;
    let newRiskLevel = 'safe';

    if (randomConfidence > 70) {
      newRiskLevel = 'danger';
    } else if (randomConfidence > 40) {
      newRiskLevel = 'warning';
    }

    setTimeout(() => {
      setConfidence(randomConfidence);
      setRiskLevel(newRiskLevel);
      setIsAnalyzing(false);

      // 위험 시 경고 표시
      if (newRiskLevel === 'danger') {
        showRiskAlert();
      }
    }, 1500);
  };

  const showRiskAlert = () => {
    Animated.sequence([
      Animated.timing(riskOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(riskOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getRiskText = () => {
    switch (riskLevel) {
      case 'danger':
        return '위험';
      case 'warning':
        return '주의';
      default:
        return '안전';
    }
  };

  return {
    riskLevel,
    confidence,
    isAnalyzing,
    waveAnim,
    riskOpacity,
    getRiskColor,
    getRiskText,
    performAnalysis,
  };
};
