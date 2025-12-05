import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useCallSimulation = (initialStatus = 'ringing') => {
  const [callStatus, setCallStatus] = useState(initialStatus);
  const [callDuration, setCallDuration] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    // 화면 슬라이드 업 애니메이션
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // 통화 자동 연결
    if (callStatus === 'ringing') {
      const timer = setTimeout(() => {
        setCallStatus('active');
        startCallAnimations();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [callStatus]);

  useEffect(() => {
    // 통화 시간 카운터
    if (callStatus === 'active') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const startCallAnimations = () => {
    // 맥박 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const endCall = (onComplete) => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(onComplete);
  };

  return {
    callStatus,
    setCallStatus,
    callDuration,
    pulseAnim,
    slideAnim,
    endCall,
  };
};
