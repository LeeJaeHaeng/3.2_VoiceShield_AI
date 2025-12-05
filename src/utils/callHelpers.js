// 통화 시간 포맷팅
export const formatCallDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 전화번호 포맷팅
export const formatPhoneNumber = (number) => {
  if (!number) return '';
  
  // 하이픈 제거 후 재포맷
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return number;
};

// 위험도 레벨 판정
export const getRiskLevelFromConfidence = (confidence) => {
  if (confidence > 70) return 'danger';
  if (confidence > 40) return 'warning';
  return 'safe';
};

// 통화 상태 텍스트
export const getCallStatusText = (status, isIncoming) => {
  if (status === 'ringing') {
    return isIncoming ? '수신 중...' : '발신 중...';
  }
  return '통화 중';
};
