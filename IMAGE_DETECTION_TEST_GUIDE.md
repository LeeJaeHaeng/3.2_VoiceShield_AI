# 🧪 이미지 분석 기능 테스트 가이드

## ✅ 수정 완료된 사항

### 1. 코드 수정
- ✅ `ImageDetectionScreen.js`: SVG 오버레이 추가
- ✅ `ImageDetectionScreen.js`: 경고 박스 추가
- ✅ `backend/server.py`: `suspicious_regions` 초기화 수정
- ✅ `backend/server.py`: 컨투어 탐지 로깅 추가
- ✅ `backend/server.py`: 탐지 threshold 조정 (45, 면적 300)

### 2. 디버깅 로그 추가
- 프론트엔드: 분석 결과 상세 로그
- 백엔드: 컨투어 탐지 과정 로그

---

## 🚀 테스트 방법

### 1단계: 백엔드 서버 재시작
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 2단계: 앱 완전 재시작
Expo 앱을 **완전히 종료**하고 다시 시작하세요 (hot reload 불충분)

```bash
# 터미널에서
npm start

# 그리고 앱에서 "r" 키를 눌러 reload
```

### 3단계: 테스트 이미지 준비

#### 옵션 A: 조작된 이미지 생성
1. 포토샵/GIMP로 이미지 편집
2. 일부 영역 복사-붙여넣기
3. JPEG로 저장

#### 옵션 B: AI 생성 이미지
1. DALL-E, Midjourney, Stable Diffusion 등으로 생성
2. 핸드폰으로 전송

#### 옵션 C: 테스트용 합성 이미지
인터넷에서 "photoshopped image examples" 검색

### 4단계: 이미지 분석

1. **VoiceShield AI 앱** 실행
2. **AI 이미지 탐지** 탭으로 이동
3. **갤러리에서 선택** 클릭
4. 테스트 이미지 선택
5. **이미지 분석 시작** 클릭

---

## 🔍 확인 사항

### 백엔드 콘솔 확인

분석 중 다음과 같은 로그가 나와야 합니다:

```
[CONTOUR] Found 15 total contours
[CONTOUR] Added suspicious region with area=450.5, points=12
[CONTOUR] Added suspicious region with area=890.2, points=8
[CONTOUR] Total suspicious regions after filtering: 2
[IMAGE ANALYSIS] is_manipulated=True, suspicious_regions_count=2, dimensions=1920x1080
```

**중요 로그**:
- `Found X total contours`: ELA 이미지에서 찾은 총 윤곽선 개수
- `Added suspicious region`: 면적 300 이상인 의심 영역
- `Total suspicious regions after filtering`: 최종 전송되는 의심 영역 개수
- `is_manipulated=True`: 조작 판정 여부

### 프론트엔드 콘솔 확인

React Native 콘솔에서 다음과 같은 로그가 나와야 합니다:

```
=== IMAGE ANALYSIS RESULT ===
is_manipulated: true
suspicious_regions: [Array(12), Array(8)]
suspicious_regions count: 2
image_dimensions: {width: 1920, height: 1080}
============================
```

### UI 확인

#### ✅ 조작된 이미지인 경우:
1. **이미지 위에 빨간색 선**: 의심 영역을 둘러싸는 빨간색 폴리라인
2. **결과 카드**:
   - ⚠️ 조작 의심 (빨간색)
   - 신뢰도: XX.X%
   - AI 생성 확률: XX.X%
   - ELA 점수: XX.X
3. **경고 박스** (빨간색 배경):
   - ⚠️ 아이콘
   - "X개의 의심 영역이 빨간색으로 표시되었습니다." 텍스트
   - 텍스트가 **명확하게 보여야 함** (이전에는 안 보였음)

#### ✅ 진본 이미지인 경우:
1. **빨간색 선 없음**
2. **결과 카드**:
   - ✓ 진본 가능성 높음 (녹색)
   - 경고 박스 없음

---

## 🐛 문제 해결

### Q1. 빨간색 선이 보이지 않음

**확인 1: 백엔드 로그**
```
[CONTOUR] Total suspicious regions after filtering: 0
```
→ 의심 영역이 감지되지 않음

**해결**:
- Threshold를 낮추기 ([server.py#L224](backend/server.py#L224))
```python
_, thresh = cv2.threshold(ela_np, 35, 255, cv2.THRESH_BINARY)  # 45 → 35
```
- 면적 필터를 낮추기 ([server.py#L233](backend/server.py#L233))
```python
if area > 200:  # 300 → 200
```

**확인 2: 프론트엔드 로그**
```
suspicious_regions: []
```
→ 백엔드가 빈 배열 전송

**확인 3: 조건 확인**
```javascript
// ImageDetectionScreen.js Line 155
{result && result.suspicious_regions && result.suspicious_regions.length > 0 && result.is_manipulated && (
```
→ `result.is_manipulated`가 false면 라인이 표시되지 않음

---

### Q2. 경고 텍스트가 보이지 않음

**확인**: Line 253-260
```javascript
{result.is_manipulated && result.suspicious_regions && result.suspicious_regions.length > 0 && (
```

조건이 모두 true여야 경고 박스가 표시됩니다.

**로그 확인**:
```
is_manipulated: false
```
→ 이미지가 조작되지 않은 것으로 판단됨

---

### Q3. 앱에서 변화가 없음

1. **앱 완전 재시작**:
```bash
# Expo 앱 종료 후
npm start
# 앱에서 "r" 키
```

2. **캐시 클리어**:
```bash
npm start -- --clear
```

3. **react-native-svg 재설치**:
```bash
npm install react-native-svg@15.12.1
```

---

### Q4. 서버 오류 발생

```
Contour detection error: ...
```

**확인**: OpenCV 설치
```bash
cd backend
pip install opencv-python
python -c "import cv2; print(cv2.__version__)"
```

---

## 📊 예상 결과 스크린샷

### 조작된 이미지 (예시)

```
┌─────────────────────────────┐
│                             │
│    [이미지]                 │
│     ╱‾‾‾╲  ← 빨간 폴리라인  │
│    │조작│                    │
│     ╲___╱                   │
│                             │
└─────────────────────────────┘

⚠️ 조작 의심
신뢰도: 87.3%
AI 생성 확률: 78.9% (Artificial)
ELA 점수: 68.2

┌───────────────────────────────┐
│ ⚠️  2개의 의심 영역이         │
│     빨간색으로 표시되었습니다. │
└───────────────────────────────┘

이미지에서 비정상적인 압축 흔적이나
조작된 영역이 감지되었습니다.
```

---

## 🎯 성공 기준

- [ ] 백엔드에서 suspicious_regions 생성 확인
- [ ] 프론트엔드에서 suspicious_regions 수신 확인
- [ ] 이미지 위에 빨간색 폴리라인 표시
- [ ] 경고 박스의 텍스트가 명확히 보임
- [ ] 진본 이미지에서는 빨간선/경고박스 없음

---

## 🔄 다음 단계

### 테스트가 성공하면:
1. Threshold와 면적 필터를 원하는 값으로 조정
2. 로그 메시지 제거 (선택)
3. 프로덕션 빌드 테스트

### 테스트가 실패하면:
1. 위의 "문제 해결" 섹션 참조
2. 콘솔 로그를 개발자에게 전달
3. 스크린샷 첨부

---

**개발자**: 이재행 (2023243119 컴퓨터공학부)
**날짜**: 2025-12-04
**버전**: v2.2 - 이미지 분석 UI 개선
