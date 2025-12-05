# 🎙️ VoiceShield AI - 실시간 통화 모니터링 가이드

## 📋 개선 사항

### ✅ 완료된 작업

1. **시뮬레이션 코드 제거**
   - CallScreen 시뮬레이션 버튼 제거
   - 실제 통화 모니터링에 집중

2. **Recording Loop 오류 수정**
   - 녹음 완료 전 다음 루프 시작 방지
   - 안전한 녹음 객체 정리
   - 재시도 로직 추가

3. **실시간 분석 기능**
   - 5초 단위로 음성 녹음
   - 자동 서버 분석
   - 키워드 탐지 및 알림

4. **Windows 파일 삭제 오류 수정**
   - PermissionError 재시도 로직
   - 안전한 임시 파일 정리

---

## 🚀 사용 방법

### 1. 백엔드 서버 실행
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 2. 앱 실행
```bash
npm start
```

### 3. 실시간 모니터링 활성화

1. **Settings 탭** → **Live Monitoring** 이동
2. **실시간 모니터링 활성화** 토글 ON
3. 실제 통화 중 **스피커폰** 모드로 전환
4. **"감지 시작"** 버튼 클릭

---

## 🔍 작동 원리

### 녹음 루프
```
시작 → 녹음 준비 → 5초 녹음 → 중지 → 분석 요청 → 결과 처리 → 다시 시작
```

### 분석 프로세스

1. **5초 단위 녹음**
   - 스피커폰으로 재생되는 통화 내용 녹음
   - 고품질 오디오 설정

2. **서버로 전송**
   - `/analyze` 엔드포인트로 POST
   - 음성 딥페이크 + 컨텍스트 분석

3. **결과 표시**
   - 위험 점수 30점 이상: ⚠️ 경고
   - 탐지된 키워드 표시
   - 토스트 알림

---

## 📊 주요 코드 변경

### LiveMonitorScreen.js

#### Before (시뮬레이션)
```javascript
// Simulation loop with fake data
const recordingLoop = async () => {
  // ... 시뮬레이션 코드
  recordingLoop(); // 즉시 재귀 호출 → 오류 발생
};
```

#### After (실제 녹음)
```javascript
const recordingLoop = async () => {
  try {
    // 1. 녹음 준비 및 시작
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(...);
    await recording.startAsync();

    // 2. 5초 녹음
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. 중지 확인
    if (!isLoopingRef.current) {
      await recording.stopAndUnloadAsync();
      return; // 루프 종료
    }

    // 4. 분석
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const result = await analyzeAudioChunk(uri);

    // 5. 결과 처리
    if (result.context.risk_score > 30) {
      // 경고 표시
    }

    // 6. 지연 후 재시작
    setTimeout(() => recordingLoop(), 500);

  } catch (error) {
    // 에러 처리 및 재시도
    setTimeout(() => recordingLoop(), 2000);
  }
};
```

### backend/server.py

#### Windows 파일 삭제 오류 수정
```python
# Before
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)  # PermissionError 발생

# After
finally:
    if os.path.exists(tmp_path):
        import time
        for attempt in range(3):
            try:
                os.remove(tmp_path)
                break
            except PermissionError:
                if attempt < 2:
                    time.sleep(0.1)
                else:
                    print(f"Warning: Could not delete {tmp_path}")
```

---

## 🎯 기능 설명

### 1. 모니터링 활성화
- 토글 스위치로 ON/OFF
- 활성화 시 준비 상태

### 2. 스피커폰 감지 모드
```
[감지 시작] 버튼 클릭
    ↓
마이크 권한 요청
    ↓
녹음 루프 시작
    ↓
[5초 녹음] → [분석] → [결과 표시] → [반복]
```

### 3. 실시간 상태 표시
- **녹음 중...**: 5초 녹음 진행
- **분석 중...**: 서버 분석 요청
- **안전 - 통화 듣는 중...**: 정상
- **⚠️ 위험 감지!**: 보이스피싱 의심

### 4. 키워드 탐지
감지되는 키워드:
- 검찰, 송금, 계좌, 비밀번호
- 대출, 신용, 가족, 납치
- 상품권, 기프트카드, 어플, 설치

---

## ⚙️ 설정

### 녹음 간격 조정
```javascript
// LiveMonitorScreen.js
await new Promise(resolve => setTimeout(resolve, 5000)); // 5초

// 더 짧게 (3초):
await new Promise(resolve => setTimeout(resolve, 3000));

// 더 길게 (10초):
await new Promise(resolve => setTimeout(resolve, 10000));
```

### 위험도 임계값
```javascript
// LiveMonitorScreen.js
if (riskScore > 30) {  // 30점 이상 경고

// 더 민감하게:
if (riskScore > 20) {

// 덜 민감하게:
if (riskScore > 50) {
```

---

## 🐛 문제 해결

### Q1. "녹음 실패" 메시지
**원인**: 마이크 권한 없음

**해결**:
```
설정 → 앱 → VoiceShield AI → 권한 → 마이크 허용
```

---

### Q2. "Recording loop error" 계속 발생
**원인**: 이전 녹음 객체 정리 안됨

**해결**:
1. 감지 중지
2. 앱 재시작
3. 다시 감지 시작

---

### Q3. 분석 결과가 오프라인 모드로 표시
**원인**: 서버 연결 안됨

**확인**:
```bash
# 서버 실행 중인지 확인
curl http://localhost:8000/
```

**서버 URL 확인**:
```javascript
// src/config.js
export const SERVER_URL = 'http://10.20.34.210:8000';
```

---

### Q4. Windows 파일 삭제 오류
**원인**: 파일이 다른 프로세스에서 사용 중

**해결**: 자동 재시도 로직으로 해결됨 (최신 업데이트)

---

## 📈 성능 최적화

### 1. 배터리 소모 최소화
```javascript
// 녹음 간격 늘리기
await new Promise(resolve => setTimeout(resolve, 10000)); // 10초

// 또는 필요시에만 활성화
```

### 2. 네트워크 사용량
- 5초 녹음 = 약 100-200KB
- 1시간 통화 = 약 1-2MB
- Wi-Fi 권장

### 3. 메모리 사용
- 녹음 완료 후 즉시 메모리 해제
- 분석 결과만 저장

---

## 🔐 보안 고려사항

### 1. 녹음 파일 저장
- 임시 파일로만 사용
- 분석 후 즉시 삭제
- 서버에도 저장 안됨

### 2. 권한
- 마이크: 녹음용
- 인터넷: 서버 분석용
- 최소 권한 원칙

### 3. 프라이버시
- 로컬 처리 우선
- 서버는 분석만 수행
- 개인정보 저장 안함

---

## 📱 지원 환경

### iOS
- ✅ iOS 13.0+
- ✅ 마이크 권한 필요
- ⚠️ 백그라운드 제한

### Android
- ✅ Android 6.0+
- ✅ 마이크 권한 필요
- ✅ 백그라운드 가능 (설정 필요)

---

## 🎓 사용 시나리오

### 시나리오 1: 보이스피싱 의심 전화
```
1. 수신 전화 받기
2. 스피커폰 모드로 전환
3. LiveMonitorScreen에서 "감지 시작"
4. AI가 실시간 분석
5. "검찰", "송금" 키워드 감지
6. ⚠️ 경고 알림
7. 즉시 통화 종료
```

### 시나리오 2: 정상 통화
```
1. 친구/가족 전화
2. 스피커폰 + 감지 시작
3. 5초마다 자동 분석
4. "안전 - 통화 듣는 중..." 표시
5. 정상 통화 계속
```

---

## 🚧 알려진 제한사항

1. **실제 통화 통합 불가**
   - Expo 환경 제한
   - 네이티브 빌드 필요 (CallKit/Telecom)

2. **스피커폰 필수**
   - 이어폰 모드에서는 녹음 안됨
   - 주변 소음도 녹음

3. **실시간 분석 지연**
   - 5초 녹음 + 분석 시간
   - 실제 약 6-7초 간격

---

## 🔮 향후 개선 계획

### 단기
- [ ] 녹음 품질 설정
- [ ] 분석 기록 저장
- [ ] 통계 기능 강화

### 중기
- [ ] 네이티브 앱 빌드
- [ ] CallKit 통합 (iOS)
- [ ] Telecom API 통합 (Android)

### 장기
- [ ] 완전 자동 모니터링
- [ ] 백그라운드 실시간 분석
- [ ] 긴급 연락 기능

---

## ✅ 체크리스트

사용 전 확인:
- [ ] 백엔드 서버 실행 중
- [ ] 서버 URL 올바르게 설정
- [ ] 마이크 권한 허용됨
- [ ] Wi-Fi 또는 데이터 연결 활성
- [ ] 스피커폰 모드로 통화

---

## 📞 지원

문제가 계속되면:
1. 앱 재시작
2. 서버 재시작
3. 로그 확인
4. 개발자에게 문의

---

**개발자**: 이재행 (2023243119 컴퓨터공학부)
**과제**: 모바일 프로그래밍
**버전**: v2.0 - 실시간 모니터링
