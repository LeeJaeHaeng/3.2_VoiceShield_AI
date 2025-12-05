import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../context/AppContext';
import { useCallSimulation } from '../hooks/useCallSimulation';
import { useVoiceAnalysis } from '../hooks/useVoiceAnalysis';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ route, navigation }) {
  const { colors, showToast } = useAppContext();
  const { phoneNumber = '010-1234-5678', isIncoming = true } = route?.params || {};

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const { callStatus, callDuration, pulseAnim, slideAnim, endCall } = useCallSimulation();
  
  const {
    confidence,
    isAnalyzing,
    waveAnim,
    riskOpacity,
    getRiskColor,
    getRiskText,
  } = useVoiceAnalysis(callStatus === 'active');

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast(isMuted ? 'Mute Off' : 'Mute On', 'info');
  };

  const handleSpeakerToggle = () => {
    setIsSpeaker(!isSpeaker);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast(isSpeaker ? 'Speaker Off' : 'Speaker On', 'info');
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Home');
  };

  const handleEndCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endCall(() => {
      navigation.goBack();
      showToast('Call ended', 'success');
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.background}
        translucent={false}
      />
      
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Risk Alert Overlay */}
        <Animated.View
          style={[
            styles.riskOverlay,
            {
              backgroundColor: getRiskColor(),
              opacity: riskOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="warning" size={60} color="#fff" />
          <Text style={styles.riskTitle}>Voice Phishing Detected!</Text>
          <Text style={styles.riskSubtitle}>End call immediately</Text>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
              {callStatus === 'ringing'
                ? isIncoming ? 'Incoming...' : 'Calling...'
                : 'On Call'}
            </Text>
            {callStatus === 'active' && (
              <Text style={[styles.durationText, { color: colors.foreground }]}>
                {formatDuration(callDuration)}
              </Text>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
            </Animated.View>

            <Text style={[styles.phoneNumber, { color: colors.foreground }]}>
              {phoneNumber}
            </Text>
            <Text style={[styles.location, { color: colors.mutedForeground }]}>
              South Korea
            </Text>
          </View>

          {/* Analysis Section */}
          {callStatus === 'active' && (
            <View style={[styles.analysisCard, { backgroundColor: colors.card }]}>
              {/* Risk Gauge */}
              <View style={styles.gaugeContainer}>
                <View style={[styles.gaugeBackground, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.gaugeFill,
                      {
                        width: `${confidence}%`,
                        backgroundColor: getRiskColor(),
                      },
                    ]}
                  />
                </View>
                <View style={styles.gaugeInfo}>
                  <Ionicons name="shield-checkmark" size={18} color={getRiskColor()} />
                  <Text style={[styles.riskLabel, { color: getRiskColor() }]}>
                    {getRiskText()} {confidence.toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Analyzing Badge */}
              {isAnalyzing && (
                <View style={[styles.analyzingBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="analytics" size={14} color={colors.primary} />
                  <Text style={[styles.analyzingText, { color: colors.primary }]}>
                    Analyzing...
                  </Text>
                </View>
              )}

              {/* Waveform */}
              <View style={styles.waveformContainer}>
                {[...Array(18)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.primary,
                        height: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            Math.sin(i * 0.5) * 15 + 25,
                            Math.sin(i * 0.5 + Math.PI) * 15 + 25,
                          ],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { paddingBottom: Platform.OS === 'ios' ? 20 : 30 }]}>
          <View style={styles.actionRow}>
            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { backgroundColor: isMuted ? colors.primary : colors.card }
              ]}
              onPress={handleMuteToggle}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={24} 
                color={isMuted ? '#fff' : colors.foreground} 
              />
              <Text style={[
                styles.actionLabel, 
                { color: isMuted ? '#fff' : colors.foreground }
              ]}>
                {isMuted ? 'Muted' : 'Mute'}
              </Text>
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { backgroundColor: isSpeaker ? colors.primary : colors.card }
              ]}
              onPress={handleSpeakerToggle}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isSpeaker ? "volume-high" : "volume-medium"} 
                size={24} 
                color={isSpeaker ? '#fff' : colors.foreground} 
              />
              <Text style={[
                styles.actionLabel, 
                { color: isSpeaker ? '#fff' : colors.foreground }
              ]}>
                {isSpeaker ? 'Speaker' : 'Audio'}
              </Text>
            </TouchableOpacity>

            {/* Home Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={handleGoHome}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={24} color={colors.foreground} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                Home
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Call Button */}
          <TouchableOpacity 
            style={styles.endCallButton} 
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={28} color="#fff" />
          </TouchableOpacity>
          
          <Text style={[styles.endCallText, { color: colors.mutedForeground }]}>
            End Call
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  riskOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  riskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  riskSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 10,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 6,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
  },
  analysisCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gaugeContainer: {
    marginBottom: 12,
  },
  gaugeBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  gaugeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  riskLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  analyzingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 12,
  },
  analyzingText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 8,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  endCallText: {
    fontSize: 12,
  },
});