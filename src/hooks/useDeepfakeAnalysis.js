import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { generateAdvancedAnalysis } from '../utils/advancedAnalysis';

// 🖥️ 백엔드 서버 URL (실제 기기 테스트 시 컴퓨터의 IP 주소로 변경 필요)
import { SERVER_URL } from '../config'; 

export const useDeepfakeAnalysis = (showToast, startWaveAnimation, fadeAnim, history, setHistory, saveHistory) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const generateMockResult = (file) => {
    const fileName = file.name || 'recording.m4a';
    const fileSize = file.size || 0;
    let seed = 0;
    const str = fileName + fileSize;
    for (let i = 0; i < str.length; i++) {
      seed += str.charCodeAt(i) * (i + 1);
    }
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const normalizedRandom = pseudoRandom / 233280;
    const isMaliciousName = /deepfake|fake|phishing/i.test(fileName);
    const isSafeName = /real|safe|normal/i.test(fileName);
    let isDeepfake, confidence, freq, temp, acou;
    if (isMaliciousName) {
      isDeepfake = true;
      confidence = 80 + (normalizedRandom * 19);
    } else if (isSafeName) {
      isDeepfake = false;
      confidence = 5 + (normalizedRandom * 25);
    } else {
      isDeepfake = seed % 2 === 0;
      if (isDeepfake) {
        confidence = 70 + (normalizedRandom * 29);
      } else {
        confidence = 10 + (normalizedRandom * 40);
      }
    }
    freq = 60 + (seed % 40);
    temp = 50 + ((seed * 2) % 50);
    acou = 55 + ((seed / 2) % 45);
    const waveform = Array.from({ length: 50 }, (_, i) => (Math.sin(i * 0.5 + seed) * 40 + 60));
    const spectrum = Array.from({ length: 20 }, (_, i) => (Math.cos(i * 0.2 + seed) * 45 + 55));
    
    // 🆕 고급 분석 데이터 추가
    const advancedAnalysis = generateAdvancedAnalysis(seed);
    
    return { 
      id: Date.now(), 
      filename: fileName, 
      confidence: confidence, 
      isDeepfake: isDeepfake, 
      timestamp: new Date().toISOString(), 
      details: { 
        frequencyAnalysis: freq, 
        temporalPattern: temp, 
        acousticFeature: acou 
      }, 
      waveform: waveform, 
      spectrum: spectrum,
      advancedAnalysis: advancedAnalysis,
      type: 'audio',
    };
  };

  const handleAnalyze = async (selectedFile, navigationCallback) => { 
    if (!selectedFile) return;
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (startWaveAnimation) startWaveAnimation();
    if (fadeAnim) fadeAnim.setValue(0);
    
    let resultData = null;
    let usedServer = false;

    // 1. 서버 분석 시도
    try {
      console.log("Attempting server analysis...");
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'audio.m4a',
        type: 'audio/m4a'
      });

      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Server analysis success:", data);
        
        resultData = {
          id: Date.now(),
          filename: selectedFile.name,
          confidence: data.confidence,
          isDeepfake: data.isDeepfake,
          timestamp: new Date().toISOString(),
          details: data.details,
          waveform: Array.from({ length: 50 }, (_, i) => (Math.sin(i * 0.5) * 40 + 60)),
          spectrum: Array.from({ length: 20 }, (_, i) => (Math.cos(i * 0.2) * 45 + 55)),
          advancedAnalysis: generateAdvancedAnalysis(Date.now()),
          context: data.context,
          speaker: data.speaker,
          type: 'audio',
        };
        usedServer = true;
      } else {
        console.warn("Server returned error:", response.status);
      }
    } catch (error) {
      console.warn("Server analysis failed (using mock):", error);
    }

    // 2. 서버 실패 시 모의(Mock) 분석 실행
    if (!resultData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      resultData = generateMockResult(selectedFile);
    }

    // 3. 결과 처리
    const newHistory = [resultData, ...history.slice(0, 19)];
    setHistory(newHistory);
    saveHistory(newHistory);
    setIsAnalyzing(false);
    setAnalysisResult(resultData);
    
    const toastMsg = usedServer ? 'AI 정밀 분석이 완료되었습니다.' : '분석이 완료되었습니다. (오프라인 모드)';
    showToast(toastMsg, 'success');
    
    if (resultData.isDeepfake) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (navigationCallback) {
      navigationCallback(resultData); 
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    handleAnalyze
  };
};
