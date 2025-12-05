import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const {
    colors,
    isDarkMode,
    toggleTheme,
    handleEmergencyReport,
    clearHistory,
  } = useAppContext();

  // 🆕 useAuth를 통해 사용자 정보와 로그아웃 함수를 가져옵니다.
  const { currentUser, logout } = useAuth();

  // 🆕 로그아웃 핸들러
  const handleLogout = async () => {
    // 실제 로그아웃 로직 실행
    await logout();
    // AuthContext가 인증 상태를 관리하므로 추가적인 네비게이션은 불필요합니다.
  };

  const userId = currentUser?.uid?.substring(0, 8) || '미인증 사용자';
  const profileLabel = currentUser?.email ? currentUser.email[0].toUpperCase() : 'U';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 🆕 사용자 프로필 섹션 */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          👤 사용자 계정
        </Text>
        
        <View style={styles.profileInfo}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {profileLabel}
            </Text>
          </View>
          
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {currentUser?.name || `사용자 ID: ${userId}`}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
              {currentUser?.email || '익명 모드'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.destructive }]}
        >
          <Text style={[styles.logoutButtonText, { color: colors.destructiveForeground }]}>
            로그아웃
          </Text>
        </TouchableOpacity>
      </View>

      {/* ⚙️ 일반 설정 섹션 (기존 내용) */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          ⚙️ 일반 설정
        </Text>

        {/* --- 다크 모드 --- */}
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.iconContainer}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.foreground} />
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>다크 모드</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor={colors.foreground}
          />
        </View>

        {/* --- 기록 삭제 --- */}
        <TouchableOpacity onPress={clearHistory} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </View>
          <Text style={[styles.label, { color: colors.destructive }]}>분석 기록 전체 삭제</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* --- 긴급 신고 --- */}
        <TouchableOpacity onPress={handleEmergencyReport} style={[styles.settingItem, styles.settingItem_last]}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.destructive} />
          </View>
          <Text style={[styles.label, { color: colors.destructive }]}>긴급 신고 (112)</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // 🆕 섹션 스타일 (기존 card 스타일을 대체)
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },

  // 🆕 프로필 관련 스타일
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1', // Primary color for avatar background
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  logoutButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // 기존 설정 아이템 스타일
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItem_last: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});