import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Use legacy import as suggested by the error message
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import Svg, { Polyline } from 'react-native-svg';

import { SERVER_URL } from '../config';

export default function ImageDetectionScreen() {
  const { colors, showToast, history, saveHistory } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      const filename = selectedImage.split('/').pop() || 'image.jpg';
      formData.append('file', {
        uri: selectedImage,
        name: filename,
        type: 'image/jpeg',
      });

      const response = await fetch(`${SERVER_URL}/analyze_image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('=== IMAGE ANALYSIS RESULT ===');
        console.log('is_manipulated:', data.is_manipulated);
        console.log('suspicious_regions:', data.suspicious_regions);
        console.log('suspicious_regions count:', data.suspicious_regions ? data.suspicious_regions.length : 0);
        console.log('image_dimensions:', data.image_dimensions);
        console.log('============================');
        setResult(data);
        
        // 1. Save Original Image to permanent storage
        const fileName = selectedImage.split('/').pop();
        const newPath = FileSystem.documentDirectory + fileName;
        try {
            await FileSystem.copyAsync({
                from: selectedImage,
                to: newPath
            });
        } catch (e) {
            console.error("Failed to copy image", e);
        }

        // 2. Save ELA Image (Base64) to file to save AsyncStorage space
        let elaImagePath = null;
        if (data.ela_image) {
            const elaFileName = `ela_${Date.now()}.jpg`;
            elaImagePath = FileSystem.documentDirectory + elaFileName;
            try {
                await FileSystem.writeAsStringAsync(elaImagePath, data.ela_image, {
                    encoding: FileSystem.EncodingType.Base64
                });
            } catch (e) {
                console.error("Failed to save ELA image", e);
            }
        }

        // Save to History
        const newHistoryItem = {
          id: Date.now().toString(),
          filename: filename,
          timestamp: new Date().toISOString(),
          isDeepfake: data.is_manipulated,
          confidence: data.confidence,
          type: 'image',
          details: {
              ...data,
              originalUri: newPath, // Permanent path for original
              elaImageUri: elaImagePath, // Path to saved ELA image (not base64 string)
              // Remove large base64 string from details to prevent SQLITE_FULL
              ela_image: undefined 
          }
        };
        const updatedHistory = [newHistoryItem, ...history];
        saveHistory(updatedHistory);

        showToast('이미지 분석이 완료되었습니다.', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Server error');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      showToast('이미지 분석에 실패했습니다.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>AI 이미지 탐지</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          딥페이크나 합성된 이미지를 AI로 분석합니다.
        </Text>
      </View>

      <View style={[styles.imageContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {selectedImage ? (
          <View style={{ width: '100%', height: '100%' }}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="contain"
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setImageLayout({ width, height });
              }}
            />
            {result && result.suspicious_regions && result.suspicious_regions.length > 0 && result.is_manipulated && (
              <Svg
                style={styles.svgOverlay}
                width={imageLayout.width}
                height={imageLayout.height}
              >
                {result.suspicious_regions.map((region, idx) => {
                  if (!result.image_dimensions || !region || region.length === 0) return null;

                  // Scale contour points from original image to displayed size
                  const scaleX = imageLayout.width / result.image_dimensions.width;
                  const scaleY = imageLayout.height / result.image_dimensions.height;

                  const points = region.map(([x, y]) =>
                    `${x * scaleX},${y * scaleY}`
                  ).join(' ');

                  return (
                    <Polyline
                      key={idx}
                      points={points}
                      fill="none"
                      stroke="#ff0000"
                      strokeWidth="2"
                      opacity={0.7}
                    />
                  );
                })}
              </Svg>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={64} color={colors.muted} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
              이미지를 선택하거나 촬영하세요
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]} onPress={pickImage}>
          <Ionicons name="images" size={20} color={colors.primaryForeground} />
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>갤러리에서 선택</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]} onPress={takePhoto}>
          <Ionicons name="camera" size={20} color={colors.primaryForeground} />
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>카메라 촬영</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && !result && (
        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
          onPress={analyzeImage}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="scan-circle" size={24} color="white" />
              <Text style={styles.analyzeButtonText}>이미지 분석 시작</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: result.is_manipulated ? colors.destructive : colors.green }]}>
          <View style={styles.resultHeader}>
            <Ionicons
              name={result.is_manipulated ? "warning" : "checkmark-circle"}
              size={32}
              color={result.is_manipulated ? colors.destructive : colors.green}
            />
            <Text style={[styles.resultTitle, { color: result.is_manipulated ? colors.destructive : colors.green }]}>
              {result.is_manipulated ? "조작 의심" : "진본 가능성 높음"}
            </Text>
          </View>

          {/* Confidence Progress Bar */}
          <View style={[
            styles.confidenceContainer,
            { backgroundColor: result.is_manipulated ? colors.destructive : colors.green }
          ]}>
            <View style={styles.confidenceLabelRow}>
              <Text style={[styles.confidenceLabel, { color: '#fff' }]}>신뢰도</Text>
              <Text style={[styles.confidenceValue, { color: result.is_manipulated ? '#FFEB3B' : '#fff' }]}>
                {result.confidence.toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.progressBarBackground, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${result.confidence}%`,
                    backgroundColor: result.is_manipulated ? colors.destructive : colors.green,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>AI 생성 확률:</Text>
            <Text style={[styles.detailValue, { color: result.ai_probability > 50 ? colors.destructive : colors.foreground }]}>
              {result.ai_probability ? result.ai_probability.toFixed(1) : 0}% ({result.verdict || 'Unknown'})
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>ELA 점수 (변조 흔적):</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{result.ela_score.toFixed(1)}</Text>
          </View>

          {result.is_manipulated && result.suspicious_regions && result.suspicious_regions.length > 0 && (
            <View style={[styles.warningBox, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive }]}>
              <Ionicons name="alert-circle" size={20} color={colors.destructive} />
              <Text style={[styles.warningText, { color: colors.destructive }]}>
                {result.suspicious_regions.length}개의 의심 영역이 빨간색으로 표시되었습니다.
              </Text>
            </View>
          )}

          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {result.is_manipulated
              ? "이미지에서 비정상적인 압축 흔적이나 조작된 영역이 감지되었습니다."
              : "이미지 분석 결과, 특이한 조작 흔적이 발견되지 않았습니다."}
          </Text>
        </View>
      )}
    </ScrollView>
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
  imageContainer: {
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 40,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    marginBottom: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
