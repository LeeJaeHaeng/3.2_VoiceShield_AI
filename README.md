# 🛡️ VoiceShield AI - Enhanced

음성변조 보이스피싱 탐지 앱

## ✨ 주요 기능

### 1. 기존 기능
- 🎙️ **음성 녹음** - 실시간 음성 녹음 및 분석
- 📁 **파일 업로드** - 오디오 파일 선택 및 분석
- 🤖 **AI 분석** - CNN-LSTM 하이브리드 모델 기반 딥페이크 탐지
- 📊 **분석 결과** - 위험도, 신뢰도, 상세 분석 데이터 제공
- 📜 **분석 기록** - 과거 분석 내역 저장 및 관리

### 2. 신규 기능 (Enhanced)
- 📞 **실시간 통화 모니터링 시뮬레이션**
  - 통화 화면 UI 프로토타입
  - 실시간 음성 분석 애니메이션
  - 위험도 게이지 및 경고 시스템
  - 음성 파형 시각화

- 🔴 **라이브 모니터링 대시보드**
  - 모니터링 활성화 토글
  - 자동 차단 및 알림 설정
  - 통계 대시보드
  - 수신/발신 통화 시뮬레이션

## 📁 프로젝트 구조 (모듈화)

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── call/           # 통화 관련 컴포넌트
│   │   ├── CallHeader.js
│   │   ├── CallAvatar.js
│   │   ├── RiskGauge.js
│   │   ├── VoiceWaveform.js
│   │   ├── AnalyzingBadge.js
│   │   ├── CallActions.js
│   │   └── RiskAlert.js
│   ├── monitor/        # 모니터링 관련 컴포넌트
│   │   ├── MonitorToggle.js
│   │   ├── MonitorSettings.js
│   │   ├── MonitorStats.js
│   │   └── SimulationButtons.js
│   └── ... (기존 컴포넌트)
├── screens/            # 화면 컴포넌트
│   ├── HomeScreen.js
│   ├── CallScreen.js          # 신규
│   ├── LiveMonitorScreen.js   # 신규
│   └── ... (기존 화면)
├── hooks/              # 커스텀 훅
│   ├── useCallSimulation.js   # 통화 시뮬레이션 로직
│   └── useVoiceAnalysis.js    # 음성 분석 로직
├── utils/              # 유틸리티 함수
│   ├── callHelpers.js         # 신규
│   └── ... (기존 utils)
└── context/
    └── AppContext.js
```

## 🎯 설계 원칙

### 모듈화 (Modularization)
- **단일 책임 원칙**: 각 컴포넌트는 하나의 명확한 역할
- **재사용성**: 독립적으로 사용 가능한 컴포넌트
- **유지보수성**: 기능별 분리로 코드 관리 용이

### 커스텀 훅 (Custom Hooks)
- **로직 분리**: UI와 비즈니스 로직 분리
- **상태 관리**: 통화 시뮬레이션, 음성 분석 상태 관리
- **재사용성**: 여러 컴포넌트에서 동일한 로직 활용

### 유틸리티 함수 (Utility Functions)
- **순수 함수**: 예측 가능하고 테스트 용이
- **포맷팅**: 시간, 전화번호 등 일관된 포맷
- **헬퍼**: 반복되는 로직 재사용

## 🚀 실행 방법

### Expo Snack에서 실행
1. [Expo Snack](https://snack.expo.dev) 접속
2. 프로젝트 파일 업로드 또는 코드 복사
3. 모바일 기기에서 Expo Go 앱으로 QR 스캔

### 로컬 환경에서 실행
```bash
npm install
npm start
```

## 📱 주요 화면

### 1. 홈 화면 (HomeScreen)
- 음성 녹음 섹션
- 파일 업로드 섹션
- 실시간 모니터링 배너 (신규)

### 2. 통화 화면 (CallScreen) - 신규
- 통화 상태 표시 (수신/발신/통화중)
- 실시간 위험도 게이지
- 음성 파형 시각화
- 위험 경고 오버레이

### 3. 라이브 모니터링 (LiveMonitorScreen) - 신규
- 모니터링 활성화 토글
- 설정 옵션 (자동 차단, 알림)
- 통계 대시보드
- 시뮬레이션 테스트 버튼

## ⚠️ 기술적 제약사항

### Expo Snack 환경
- 실제 통화 연동 불가 (CallKit/Telecom API 미지원)
- 백그라운드 실행 제한
- 네이티브 모듈 제한

### 구현 방식
- **시뮬레이션 기반**: 실제 통화 대신 UI/UX 프로토타입
- **애니메이션 중심**: 실시간 분석 시각화
- **데모 목적**: 프레젠테이션 및 개념 검증용

## 🔄 향후 개선 방향

### 실제 통화 연동 (네이티브 앱 필요)
- react-native-call-detection
- react-native-incall-manager
- react-native-permissions

### 커스텀 Expo 빌드
```bash
# Expo EAS Build 사용
expo install expo-dev-client
eas build --profile development
```

## 📝 라이선스

0BSD

## 👨‍💻 개발자

- 2023243119 컴퓨터공학부 이재행
- 과제: 모바일 프로그래밍
