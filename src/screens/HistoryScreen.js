import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import HistorySection from '../components/HistorySection';
import { useNavigation } from '@react-navigation/native'; 

export default function HistoryScreen() {
  const {
    colors,
    historyFilter,
    setHistoryFilter,
    getFilteredHistory,
    setAnalysisResult,
    historyType,
    setHistoryType,
  } = useAppContext();

  const navigation = useNavigation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <HistorySection
        historyFilter={historyFilter}
        onSetHistoryFilter={setHistoryFilter}
        historyType={historyType}
        onSetHistoryType={setHistoryType}
        getFilteredHistory={getFilteredHistory}
        onSetAnalysisResult={setAnalysisResult}
        colors={colors}
        navigation={navigation}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});