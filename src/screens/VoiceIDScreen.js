import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// 🖥️ 백엔드 서버 URL (AppContext와 동일하게 맞춤)
import { SERVER_URL } from '../config';

export default function VoiceIDScreen() {
  const { colors, showToast, pulseAnim, waveAnim } = useAppContext();
  const { isRecording, recordingDuration, startRecording, stopRecording, recordedFile, setRecordedFile } = useAudioRecorder(showToast);
  
  const [voices, setVoices] = useState([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/list_voices`);
      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      // showToast('목소리 목록을 불러오지 못했습니다.', 'error');
    }
  };

  const handleStopAndRegister = async () => {
    const file = await stopRecording();
    if (file) {
      // 녹음이 끝나면 바로 등록 절차 진행 (또는 UI에서 별도 버튼으로 분리 가능)
      // 여기서는 파일이 세팅된 후 등록 버튼을 누르게 유도
    }
  };

  const registerVoice = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '등록할 이름을 입력해주세요.');
      return;
    }
    if (!recordedFile) {
      Alert.alert('오류', '먼저 목소리를 녹음해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', {
        uri: recordedFile.uri,
        name: 'voice_register.m4a',
        type: 'audio/m4a'
      });

      const response = await fetch(`${SERVER_URL}/register_voice`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        showToast(`'${name}'님의 목소리가 등록되었습니다.`, 'success');
        setName('');
        setRecordedFile(null);
        setIsRegistering(false);
        fetchVoices();
      } else {
        throw new Error('Server returned error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('목소리 등록에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.voiceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.voiceIcon}>
        <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.voiceName, { color: colors.foreground }]}>{item}</Text>
      <View style={[styles.verifiedBadge, { backgroundColor: colors.green + '20' }]}>
        <Text style={[styles.verifiedText, { color: colors.green }]}>등록됨</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>보이스 ID</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          가족과 지인의 목소리를 등록하여 사칭 범죄를 예방하세요.
        </Text>
      </View>

      {/* 등록 폼 */}
      <View style={[styles.registerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>새 목소리 등록</Text>
        
        {!isRegistering ? (
           <TouchableOpacity 
             style={[styles.startButton, { backgroundColor: colors.primary }]}
             onPress={() => setIsRegistering(true)}
           >
             <Ionicons name="add" size={20} color="white" />
             <Text style={styles.startButtonText}>등록 시작하기</Text>
           </TouchableOpacity>
        ) : (
          <View style={styles.formContent}>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input }]}
              placeholder="이름 (예: 엄마, 아빠)"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.recordingArea}>
              {!isRecording ? (
                !recordedFile ? (
                  <TouchableOpacity onPress={startRecording} style={styles.recordBtn}>
                    <Ionicons name="mic-circle" size={64} color={colors.destructive} />
                    <Text style={[styles.recordText, { color: colors.mutedForeground }]}>녹음 버튼을 눌러 10초간 말해주세요</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.recordedPreview}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.green} />
                    <Text style={[styles.recordedText, { color: colors.foreground }]}>녹음 완료</Text>
                    <TouchableOpacity onPress={() => setRecordedFile(null)} style={styles.reRecordBtn}>
                      <Text style={[styles.reRecordText, { color: colors.destructive }]}>다시 녹음</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                <TouchableOpacity onPress={handleStopAndRegister} style={styles.recordingBtn}>
                  <View style={styles.recordingIndicator}>
                    <View style={[styles.recordingDot, { backgroundColor: colors.destructive }]} />
                    <Text style={[styles.timerText, { color: colors.destructive }]}>{recordingDuration}s</Text>
                  </View>
                  <Text style={[styles.stopText, { color: colors.foreground }]}>녹음 중지</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setIsRegistering(false);
                  setRecordedFile(null);
                  setName('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: colors.primary },
                  (!recordedFile || !name) && { opacity: 0.5 }
                ]}
                onPress={registerVoice}
                disabled={!recordedFile || !name || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>등록 완료</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 목록 */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: colors.foreground }]}>등록된 목소리 ({voices.length})</Text>
        <FlatList
          data={voices}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              등록된 목소리가 없습니다.
            </Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  registerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formContent: {
    gap: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  recordingArea: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  recordBtn: {
    alignItems: 'center',
    gap: 8,
  },
  recordText: {
    fontSize: 14,
  },
  recordingBtn: {
    alignItems: 'center',
    gap: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopText: {
    fontSize: 14,
  },
  recordedPreview: {
    alignItems: 'center',
    gap: 8,
  },
  recordedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reRecordBtn: {
    padding: 8,
  },
  reRecordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  voiceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
});
