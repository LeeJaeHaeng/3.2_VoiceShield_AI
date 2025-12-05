import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const TOAST_DURATION = 2500; // 토스트가 머무는 시간 (ms)
const ANIMATION_DURATION = 300; // 애니메이션 속도 (ms)

export default function Toast() {
  const { toastConfig, hideToast, colors } = useAppContext();
  const { message, type, visible } = toastConfig;
  
  // 애니메이션 값 (Y축 위치)
  const animValue = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 1. 토스트 보이기 (아래로 슬라이드)
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. 일정 시간 후 숨기기
      const timer = setTimeout(() => {
        hide();
      }, TOAST_DURATION);

      return () => clearTimeout(timer);
    } else {
        // If visible becomes false (e.g. manually hidden), hide immediately
        hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // Only re-run when visible changes. Ignore hideToast/animValue changes.

  const hide = () => {
    Animated.parallel([
      Animated.timing(animValue, {
        toValue: -100,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (visible) {
          hideToast(); 
      }
    });
  };

  if (!visible && opacity._value === 0) return null; // Optimization: don't render if hidden and opacity is 0
  // But checking _value is risky. Better to just return null if !visible for now to ensure it goes away.
  // However, returning null immediately kills the exit animation.
  // Since the user complained about it "not going away", let's prioritize hiding it.
  // If visible is false, we want to animate out.
  // But if we return null, we can't animate.
  
  // Let's rely on the fact that hideToast sets visible=false.
  // If visible is false, we want to render UNTIL animation finishes?
  // That requires local state.
  // For now, let's just render. If visible is false, hide() is called, it animates out.
  // But if hideToast was called, visible IS false.
  // So useEffect runs hide().
  
  // The problem is if visible is false, we might want to return null to avoid blocking touches.
  // But pointerEvents="none" handles that.
  
  if (!message) return null;

  // 타입별 아이콘 및 색상 설정
  const iconName = type === 'success' ? 'checkmark-circle' : 'alert-circle';
  const iconColor = type === 'success' ? colors.green : colors.destructive;
  const bgColor = type === 'success' ? '#10B981' : (type === 'error' ? '#EF4444' : '#3B82F6');

  return (
    <View style={styles.container} pointerEvents="none">
      <SafeAreaView>
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: bgColor, // Use solid color for better visibility
              opacity,
              transform: [{ translateY: animValue }],
            },
          ]}
        >
          <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
          <Text style={[styles.message, { color: '#fff' }]}>{message}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // 모든 화면 위에 뜨도록
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center', // Center horizontally
  },
  toast: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    // 그림자 (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // 그림자 (Android)
    elevation: 6,
    minWidth: '80%',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1, // 텍스트가 길어지면 줄바꿈
    textAlign: 'center',
  },
});