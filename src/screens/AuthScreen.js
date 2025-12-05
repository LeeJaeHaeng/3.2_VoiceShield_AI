// src/screens/AuthScreen.js - 인증 화면
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { colors } = useAppContext();
  const { login, signup } = useAuth();
  
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (authMode === 'login') {
      await login(email, password);
    } else {
      await signup(email, password, name);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🛡️</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            VoiceShield AI
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            AI 기반 딥페이크 음성 탐지로{'\n'}보이스피싱으로부터 안전하게 보호하세요
          </Text>
        </View>

        {/* Auth Card */}
        <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => setAuthMode('login')}
              style={[
                styles.tab,
                authMode === 'login' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: authMode === 'login' ? colors.primary : colors.mutedForeground },
                ]}
              >
                로그인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAuthMode('signup')}
              style={[
                styles.tab,
                authMode === 'signup' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: authMode === 'signup' ? colors.primary : colors.mutedForeground },
                ]}
              >
                회원가입
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>이름</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
                  placeholder="홍길동"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>이메일</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
                placeholder="email@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>비밀번호</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
                placeholder="6자 이상"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.submitButtonText, { color: colors.primaryForeground }]}>
                {authMode === 'login' ? '로그인' : '회원가입'}
              </Text>
            </TouchableOpacity>

            {authMode === 'login' && (
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                  테스트 계정: test@example.com / test123
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>실시간 분석</Text>
            <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>
              AI 기반 딥페이크 탐지
            </Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.featureIcon}>👤</Text>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>화자 인식</Text>
            <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>
              음성 지문 분석
            </Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>고급 분석</Text>
            <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>
              MFCC, 주파수 스펙트럼
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  authCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 10,
    textAlign: 'center',
  },
});