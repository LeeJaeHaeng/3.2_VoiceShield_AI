import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: '보이스피싱 실시간 탐지',
    description: '통화 중 보이스피싱 의심 단어와 패턴을\n실시간으로 분석하여 경고합니다.',
    icon: 'shield-checkmark',
    color: '#10B981',
  },
  {
    id: '2',
    title: 'AI 딥페이크 탐지',
    description: '최신 AI 기술로 합성된 목소리와\n가짜 이미지를 정밀하게 판별합니다.',
    icon: 'scan-circle',
    color: '#3B82F6',
  },
  {
    id: '3',
    title: '안전한 금융 생활',
    description: 'VoiceShield와 함께\n당신의 소중한 자산을 지키세요.',
    icon: 'lock-closed',
    color: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding, colors } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <Ionicons name={item.icon} size={100} color={item.color} style={styles.icon} />
              <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {item.description}
              </Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        {/* Paginator */}
        <View style={styles.paginator}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: colors.primary }]}
                key={i.toString()}
              />
            );
          })}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={scrollTo}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 64,
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
    width: '100%',
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});