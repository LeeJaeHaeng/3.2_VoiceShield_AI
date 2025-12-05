// src/context/AuthContext.js - 사용자 인증 관리
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const AuthContext = createContext();

// Mock 사용자 데이터베이스
const MOCK_USERS = [
  { id: '1', email: 'test@example.com', password: 'test123', name: '테스트 유저' },
  { id: '2', email: 'demo@voiceshield.ai', password: 'demo123', name: '데모 사용자' },
];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력하세요.');
      return false;
    }

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      await AsyncStorage.setItem('current_user', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('로그인 성공', `환영합니다, ${user.name}님!`);
      return true;
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
      return false;
    }
  };

  const signup = async (email, password, name) => {
    if (!email || !password || !name) {
      Alert.alert('오류', '모든 항목을 입력하세요.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    await AsyncStorage.setItem('current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('회원가입 성공', `환영합니다, ${newUser.name}님!`);
    return true;
  };

  const logout = async () => {
    return new Promise((resolve) => {
      Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('current_user');
            setCurrentUser(null);
            setIsAuthenticated(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resolve(true);
          },
        },
      ]);
    });
  };

  const value = {
    isAuthenticated,
    currentUser,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};