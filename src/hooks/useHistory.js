import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useHistory = (showToast, setAnalysisResult) => {
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'deepfake', 'safe'
  const [historyType, setHistoryType] = useState('all'); // 'all', 'audio', 'image'
  const [historySortOrder, setHistorySortOrder] = useState('desc'); // 'desc', 'asc'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('analysis_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      setHistory(newHistory); // Update local state immediately
      await AsyncStorage.setItem('analysis_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert( "기록 삭제", "정말로 모든 분석 기록을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: async () => {
            setHistory([]);
            if (setAnalysisResult) setAnalysisResult(null);
            await saveHistory([]);
            showToast('모든 기록을 삭제했습니다.', 'success');
          },
        },
      ]
    );
  };

  const getFilteredHistory = () => {
    let filtered = [...history];
    
    // Filter by Type
    if (historyType !== 'all') {
      filtered = filtered.filter((item) => item.type === historyType);
    }

    // Filter by Status
    if (historyFilter === 'deepfake') {
      filtered = filtered.filter((item) => item.isDeepfake);
    } else if (historyFilter === 'safe') {
      filtered = filtered.filter((item) => !item.isDeepfake);
    }

    if (historySortOrder === 'asc') {
      filtered = filtered.reverse();
    }
    return filtered;
  };

  return {
    history,
    setHistory,
    historyFilter,
    setHistoryFilter,
    historyType,
    setHistoryType,
    historySortOrder,
    setHistorySortOrder,
    loadHistory,
    saveHistory,
    clearHistory,
    getFilteredHistory
  };
};
