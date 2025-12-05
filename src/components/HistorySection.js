import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/formatters';

export default function HistorySection({
  historyFilter,
  onSetHistoryFilter,
  historyType,
  onSetHistoryType,
  getFilteredHistory,
  colors,
  navigation, 
}) {
  const filteredHistory = getFilteredHistory();

  const handleItemPress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to 'Home' tab -> 'ResultDetail' screen
    navigation.navigate('Home', {
      screen: 'ResultDetail',
      params: { result: item },
    });
  };

  return (
    <View style={[styles.historySection, { backgroundColor: colors.card, borderColor: colors.border, margin: 16 }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.historyTitle, { color: colors.foreground }]}>분석 기록</Text>
        
        {/* Type Tabs */}
        <View style={styles.typeTabs}>
          <TouchableOpacity onPress={() => onSetHistoryType('all')} style={[styles.typeTab, historyType === 'all' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
             <Text style={[styles.typeTabText, { color: historyType === 'all' ? colors.primary : colors.mutedForeground }]}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSetHistoryType('audio')} style={[styles.typeTab, historyType === 'audio' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
             <Text style={[styles.typeTabText, { color: historyType === 'audio' ? colors.primary : colors.mutedForeground }]}>음성</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSetHistoryType('image')} style={[styles.typeTab, historyType === 'image' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
             <Text style={[styles.typeTabText, { color: historyType === 'image' ? colors.primary : colors.mutedForeground }]}>이미지</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            onPress={() => onSetHistoryFilter('all')}
            style={[ styles.filterButton, { backgroundColor: historyFilter === 'all' ? colors.primary : colors.muted }, ]}
          >
            <Text style={[styles.filterButtonText, { color: historyFilter === 'all' ? colors.primaryForeground : colors.foreground }]}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetHistoryFilter('deepfake')}
            style={[ styles.filterButton, { backgroundColor: historyFilter === 'deepfake' ? colors.destructive : colors.muted }, ]}
          >
            <Text style={[styles.filterButtonText, { color: historyFilter === 'deepfake' ? colors.destructiveForeground : colors.foreground }]}>딥페이크</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetHistoryFilter('safe')}
            style={[ styles.filterButton, { backgroundColor: historyFilter === 'safe' ? colors.green : colors.muted }, ]}
          >
            <Text style={[styles.filterButtonText, { color: historyFilter === 'safe' ? colors.primaryForeground : colors.foreground }]}>정상</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.historyEmpty}>
          <Ionicons name="document-text-outline" size={48} color={colors.muted} style={{ marginBottom: 8 }} />
          <Text style={[styles.historyEmptyText, { color: colors.mutedForeground }]}>
            분석 기록이 없습니다.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {filteredHistory.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={[styles.historyItem, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.historyItemHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons 
                    name={item.type === 'image' ? 'image' : 'mic'} 
                    size={16} 
                    color={colors.mutedForeground} 
                  />
                  <Text style={[styles.historyItemFilename, { color: colors.foreground }]} numberOfLines={1}>
                    {item.filename}
                  </Text>
                </View>
                <Text style={styles.historyItemIcon}>
                  {item.isDeepfake ? '⚠️' : '✅'}
                </Text>
              </View>

              <View style={styles.historyItemFooter}>
                <Text style={[styles.historyItemDate, { color: colors.mutedForeground }]}>
                  {formatDate(item.timestamp)}
                </Text>
                <View
                  style={[
                    styles.historyItemBadge,
                    { backgroundColor: item.isDeepfake ? colors.destructive + '90' : colors.green + '90' },
                  ]}
                >
                  <Text style={[styles.historyItemBadgeText, { color: colors.primaryForeground }]}>
                    {item.isDeepfake ? '딥페이크' : '정상'}
                  </Text>
                </View>
              </View>

              <View style={[styles.historyProgressBar, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.historyProgressFill,
                    {
                      width: `${item.confidence}%`,
                      backgroundColor: item.isDeepfake ? colors.destructive : colors.green,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.historyItemConfidence, { color: colors.mutedForeground, marginTop: 8 }]}>
                신뢰도: {item.confidence.toFixed(0)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historySection: { borderWidth: 1, borderRadius: 10, padding: 20, margin: 16, },
  headerContainer: { marginBottom: 16 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  typeTabs: { flexDirection: 'row', gap: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 0 },
  typeTab: { paddingVertical: 8, paddingHorizontal: 4 },
  typeTabText: { fontSize: 14, fontWeight: '600' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  filterButtons: { flexDirection: 'row', gap: 8, },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, },
  filterButtonText: { fontSize: 11, fontWeight: '500', },
  historyEmpty: { alignItems: 'center', paddingVertical: 32, },
  historyEmptyText: { fontSize: 13, },
  historyList: { gap: 12, },
  historyItem: { padding: 16, borderRadius: 8, borderWidth: 1, },
  historyItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8, },
  historyItemFilename: { flex: 1, fontSize: 13, fontWeight: '500', },
  historyItemIcon: { fontSize: 16, },
  historyItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, },
  historyItemDate: { fontSize: 11, },
  historyItemConfidence: { fontSize: 12, },
  historyItemBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, },
  historyItemBadgeText: { fontSize: 10, fontWeight: '600', },
  historyProgressBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', },
  historyProgressFill: { height: '100%', },
});