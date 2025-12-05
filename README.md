# 🛡️ VoiceShield AI - Enhanced

음성변조 보이스피싱 탐지 및 예방 솔루션

## ✨ 주요 기능

### 1. 핵심 기능

- 🎙️ **음성 녹음 & 분석** - 실시간 녹음 및 파일 업로드 분석
- 🤖 **AI 딥페이크 탐지** - CNN-LSTM 하이브리드 모델 기반 정밀 분석
- 📊 **상세 분석 리포트** - 위험도, 신뢰도, MFCC, 스펙트로그램 시각화
- 🗣️ **화자 분리 (Speaker Diarization)** - 다중 화자 식별 및 성별/연령대 분석
- 🖼️ **이미지 정밀 분석** - AI 생성 이미지 탐지 및 ELA(Error Level Analysis)

### 2. 실시간 보호 (Enhanced)

- 📞 **통화 모니터링 시뮬레이션** - 실시간 위험도 게이지 및 경고 시스템
- 🔴 **라이브 모니터링 대시보드** - 자동 차단 및 알림 설정 관리
- 🚨 **긴급 경보** - 고위험 상황 감지 시 즉각적인 사용자 경고

## 📁 프로젝트 구조

```
voiceshield_ai_v2/
├── backend/            # Python FastAPI 백엔드
│   ├── server.py      # 메인 서버 로직 (AI 모델 추론)
│   ├── models/        # AI 모델 파일
│   └── ...
├── src/               # React Native (Expo) 프론트엔드
│   ├── components/    # 재사용 가능한 UI 컴포넌트
│   ├── screens/       # 주요 화면 (홈, 분석, 설정 등)
│   ├── hooks/         # 커스텀 훅 (비즈니스 로직)
│   ├── context/       # 전역 상태 관리
│   └── ...
└── ...
```

## 🚀 설치 및 실행 방법

### 1. 백엔드 (Backend) 설정

Python 3.8+ 환경이 필요합니다.

1. **의존성 설치:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   _참고: `ffmpeg`가 시스템에 설치되어 있어야 할 수 있습니다._

2. **모델 파일 준비:**

   - `best_model.h5` 파일을 `backend` 디렉토리에 위치시킵니다.

3. **서버 실행:**
   ```bash
   python server.py
   ```
   또는
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. 프론트엔드 (Frontend) 실행

Node.js 및 Expo 환경이 필요합니다.

1. **의존성 설치:**

   ```bash
   npm install
   ```

2. **앱 실행:**
   ```bash
   npx expo start
   ```
   - Expo Go 앱을 통해 QR 코드를 스캔하여 실행하거나, 에뮬레이터를 사용합니다.

## 📱 주요 화면 구성

1. **홈 화면 (HomeScreen)**: 녹음, 파일 업로드, 최근 분석 기록 확인
2. **분석 결과 (ResultScreen)**: 딥페이크 여부, 신뢰도, 상세 지표 확인
3. **고급 분석 (AdvancedAnalysisModal)**: 화자 분리 정보, 음성 지문, 감정 분석 등 심층 데이터 제공
4. **라이브 모니터링 (LiveMonitorScreen)**: 실시간 보호 설정 및 시뮬레이션

## ⚠️ 기술적 사항

- **백엔드 통신**: 프론트엔드는 기본적으로 `http://10.0.2.2:8000` (Android Emulator 기준)으로 연결됩니다. 실기기 사용 시 `src/config.js`의 `SERVER_URL`을 PC의 IP 주소로 변경해야 합니다.
- **AI 모델**: TensorFlow/Keras 기반의 딥페이크 탐지 모델과 PyTorch/SpeechBrain 기반의 화자 분석 모델을 사용합니다.

## 📝 라이선스

0BSD

## 👨‍💻 개발자

- 2023243119 컴퓨터공학부 이재행
- 과제: 모바일 프로그래밍
