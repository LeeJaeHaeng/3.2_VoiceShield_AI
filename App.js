// App.js 수정 버전 - 인증 기능 통합
import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useAppContext } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import ResultDetailScreen from './src/screens/ResultDetailScreen';
import CallScreen from './src/screens/CallScreen';
import LiveMonitorScreen from './src/screens/LiveMonitorScreen';
import ProtectionScreen from './src/screens/ProtectionScreen';
import GuardianScreen from './src/screens/GuardianScreen';
import VoiceIDScreen from './src/screens/VoiceIDScreen';

import TrainingScreen from './src/screens/TrainingScreen';
import ImageDetectionScreen from './src/screens/ImageDetectionScreen';
import Toast from './src/components/Toast';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card, borderBottomColor: colors.border },
        headerTitleStyle: { color: colors.foreground, fontWeight: 'bold' },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: 'VoiceShield AI'}}
      />
      <Stack.Screen 
        name="ResultDetail" 
        component={ResultDetailScreen} 
        options={{ title: 'Analysis Result' }}
      />
      <Stack.Screen 
        name="Call" 
        component={CallScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LiveMonitor" 
        component={LiveMonitorScreen} 
        options={{ title: 'Live Monitoring' }}
      />
      <Stack.Screen 
        name="ImageDetectionScreen" 
        component={ImageDetectionScreen} 
        options={{ title: 'AI 이미지 탐지' }} 
      />
    </Stack.Navigator>
  );
}

function HistoryStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card, borderBottomColor: colors.border },
        headerTitleStyle: { color: colors.foreground, fontWeight: 'bold' },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen 
        name="HistoryScreen" 
        component={HistoryScreen} 
        options={{ title: '분석 기록' }} 
      />
    </Stack.Navigator>
  );
}

function ProtectionStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card, borderBottomColor: colors.border },
        headerTitleStyle: { color: colors.foreground, fontWeight: 'bold' },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen 
        name="ProtectionScreen" 
        component={ProtectionScreen} 
        options={{ title: '보호 도구' }} 
      />
      <Stack.Screen 
        name="GuardianScreen" 
        component={GuardianScreen} 
        options={{ title: '가디언 모드' }} 
      />
      <Stack.Screen 
        name="VoiceIDScreen" 
        component={VoiceIDScreen} 
        options={{ title: '보이스 ID' }} 
      />
      <Stack.Screen 
        name="TrainingScreen" 
        component={TrainingScreen} 
        options={{ title: '피싱 예방 훈련' }} 
      />
      <Stack.Screen 
        name="ImageDetectionScreen" 
        component={ImageDetectionScreen} 
        options={{ title: 'AI 이미지 탐지' }} 
      />
    </Stack.Navigator>
  );
}

function SettingsStack({ colors }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card, borderBottomColor: colors.border },
        headerTitleStyle: { color: colors.foreground, fontWeight: 'bold' },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ title: '설정' }}
      />
      <Stack.Screen 
        name="LiveMonitor" 
        component={LiveMonitorScreen} 
        options={{ 
          title: 'Live Monitoring',
        }}
      />
      <Stack.Screen 
        name="Call" 
        component={CallScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isDarkMode, colors, isLoading, isOnboardingCompleted } = useAppContext();
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (isLoading || authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <Toast />
      </>
    );
  }

  if (!isOnboardingCompleted) {
    return (
      <>
        <OnboardingScreen />
        <Toast />
      </>
    );
  }

  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const customizedTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
    },
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={customizedTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Protection') {
                iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false, 
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.mutedForeground,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          })}
        >
          <Tab.Screen name="Home">
            {() => <HomeStack colors={colors} />}
          </Tab.Screen>
          <Tab.Screen name="Protection">
            {() => <ProtectionStack colors={colors} />}
          </Tab.Screen>
          <Tab.Screen name="History">
            {() => <HistoryStack colors={colors} />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => <SettingsStack colors={colors} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});