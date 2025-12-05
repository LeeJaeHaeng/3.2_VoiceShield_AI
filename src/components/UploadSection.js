import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function UploadSection({
  onFileSelect,
  selectedFile,
  isPlaying,
  onTogglePlayback,
  playbackPosition,
  playbackDuration,
  formatDuration,
  onAnalyze,
  isAnalyzing,
  colors,
}) {
  return (
    <View style={[styles.uploadCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>파일 업로드</Text>

      <TouchableOpacity
        style={[styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.input }]}
        onPress={onFileSelect}
      >
        <View style={styles.uploadContent}>
          <View style={[styles.uploadIconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.uploadIconLarge}>📁</Text>
          </View>

          <View style={styles.uploadTextCenter}>
            <Text style={[styles.uploadTitle, { color: colors.foreground }]}>음성 파일 선택</Text>
            <Text style={[styles.uploadSubtitle, { color: colors.mutedForeground }]}>
              탭하여 오디오 파일 선택
            </Text>
            <Text style={[styles.uploadFormats, { color: colors.mutedForeground }]}>
              지원 형식: MP3, WAV, M4A, OGG
            </Text>
          </View>

          {selectedFile && (
            <View style={[styles.selectedFileBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <Text style={[styles.selectedFileName, { color: colors.foreground }]} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={[styles.selectedFileSize, { color: colors.mutedForeground }]}>
                {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : '크기 확인 중...'}
              </Text>

              <View style={styles.playbackControls}>
                <TouchableOpacity onPress={onTogglePlayback} style={styles.playButton}>
                  <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
                </TouchableOpacity>

                {playbackDuration > 0 && (
                  <View style={styles.playbackInfo}>
                    <Text style={[styles.playbackTime, { color: colors.mutedForeground }]}>
                      {formatDuration(playbackPosition)} / {formatDuration(playbackDuration)}
                    </Text>
                    <View style={[styles.playbackBar, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.playbackProgress,
                          {
                            width: `${(playbackPosition / playbackDuration) * 100}%`,
                            backgroundColor: colors.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.analyzeButton,
          { backgroundColor: colors.primary },
          (!selectedFile || isAnalyzing) && styles.analyzeButtonDisabled,
        ]}
        onPress={onAnalyze}
        disabled={!selectedFile || isAnalyzing}
      >
        {isAnalyzing ? (
          <View style={styles.analyzeButtonContent}>
            <View style={[styles.spinner, { borderColor: colors.primaryForeground }]} />
            <Text style={[styles.analyzeButtonText, { color: colors.primaryForeground }]}>분석 중...</Text>
          </View>
        ) : (
          <View style={styles.analyzeButtonContent}>
            <Text style={styles.uploadIconSmall}>🔍</Text>
            <Text style={[styles.analyzeButtonText, { color: colors.primaryForeground }]}>음성 분석 시작</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 32,
  },
  uploadContent: {
    alignItems: 'center',
    gap: 16,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconLarge: {
    fontSize: 32,
  },
  uploadTextCenter: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
  },
  uploadFormats: {
    fontSize: 11,
    marginTop: 8,
  },
  selectedFileBox: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFileSize: {
    fontSize: 12,
    marginTop: 4,
  },
  playbackControls: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    padding: 8,
  },
  playIcon: {
    fontSize: 20,
  },
  playbackInfo: {
    flex: 1,
    gap: 4,
  },
  playbackTime: {
    fontSize: 11,
  },
  playbackBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  playbackProgress: {
    height: '100%',
  },
  analyzeButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRadius: 8,
  },
  uploadIconSmall: {
    fontSize: 16,
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});