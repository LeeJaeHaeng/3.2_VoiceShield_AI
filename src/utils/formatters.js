// 포맷팅 헬퍼
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (millis) => {
  if (!millis) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  return formatTime(totalSeconds);
};

// --- ❗️ 신규 추가된 함수 ❗️ ---
// ISO 날짜 문자열을 'YYYY.MM.DD HH:mm' 형식으로 변환
export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // toLocaleString을 사용해 현지화된 시간으로 표시
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};