import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SMS from 'expo-sms';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export default function GuardianScreen() {
  const { colors, showToast } = useAppContext();
  const [contacts, setContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem('guardian_contacts');
      if (saved) setContacts(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem('guardian_contacts', JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (error) {
      console.error('Failed to save contacts:', error);
    }
  };

  const addContact = () => {
    if (!newName || !newPhone) {
      Alert.alert('오류', '이름과 전화번호를 모두 입력해주세요.');
      return;
    }
    const newContact = { id: Date.now().toString(), name: newName, phone: newPhone };
    const updated = [...contacts, newContact];
    saveContacts(updated);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
    showToast('보호자가 등록되었습니다.', 'success');
  };

  const removeContact = (id) => {
    Alert.alert('삭제 확인', '이 보호자를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updated = contacts.filter((c) => c.id !== id);
          saveContacts(updated);
        },
      },
    ]);
  };

  const sendEmergencyAlert = async () => {
    if (contacts.length === 0) {
      Alert.alert('알림', '등록된 보호자가 없습니다. 먼저 보호자를 등록해주세요.');
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const recipients = contacts.map((c) => c.phone);
      const message = '🚨 [긴급] 보이스피싱이 의심되는 상황입니다! 지금 바로 저에게 연락해주세요. - VoiceShield AI 자동 발송';
      
      const { result } = await SMS.sendSMSAsync(recipients, message);
      if (result === 'sent') {
        showToast('긴급 알림을 보냈습니다.', 'success');
      }
    } else {
      Alert.alert('오류', 'SMS 기능을 사용할 수 없습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.contactItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>{item.phone}</Text>
      </View>
      <TouchableOpacity onPress={() => removeContact(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={colors.destructive} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>가디언 모드</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          위험 상황 시 보호자에게 즉시 알림을 보냅니다.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.emergencyButton, { backgroundColor: colors.destructive }]}
        onPress={sendEmergencyAlert}
      >
        <Ionicons name="warning" size={32} color="white" />
        <Text style={styles.emergencyButtonText}>긴급 알림 전송</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.foreground }]}>보호자 목록</Text>
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
            <Ionicons name={isAdding ? "close" : "add"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {isAdding && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input }]}
              placeholder="이름"
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.input }]}
              placeholder="전화번호"
              placeholderTextColor={colors.mutedForeground}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={addContact}>
              <Text style={styles.addButtonText}>등록</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={contacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              등록된 보호자가 없습니다.
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
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addForm: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactInfo: {
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
});
