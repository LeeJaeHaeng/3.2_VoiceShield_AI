import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function ProtectionScreen() {
  const { colors } = useAppContext();
  const navigation = useNavigation();

  const features = [
    {
      id: 'Guardian',
      title: '가디언 모드',
      description: '위험 상황 시 보호자에게 긴급 알림을 전송합니다.',
      icon: 'shield-checkmark',
      color: colors.destructive,
      screen: 'GuardianScreen',
    },
    {
      id: 'VoiceID',
      title: '보이스 ID',
      description: '가족의 목소리를 등록하여 사칭 범죄를 예방합니다.',
      icon: 'finger-print',
      color: colors.primary,
      screen: 'VoiceIDScreen',
    },
    {
      id: 'Training',
      title: '피싱 예방 훈련',
      description: '실전 모의 훈련으로 보이스피싱 대처 능력을 키웁니다.',
      icon: 'school',
      color: colors.green,
      screen: 'TrainingScreen',
    },
    {
      id: 'ImageDetection',
      title: 'AI 이미지 탐지',
      description: '딥페이크나 합성된 이미지를 분석하여 조작 여부를 판별합니다.',
      icon: 'image',
      color: colors.secondary,
      screen: 'ImageDetectionScreen',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>보호 도구</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          보이스피싱으로부터 안전을 지키는 강력한 도구들입니다.
        </Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon} size={32} color={feature.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{feature.title}</Text>
              <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
                {feature.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
