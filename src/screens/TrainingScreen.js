import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const QUIZ_DATA = [
  {
    id: 1,
    type: 'scenario',
    question: "모르는 번호로 전화가 와서 '서울중앙지검 김민수 검사'라고 합니다. 본인의 계좌가 범죄에 연루되었다며 안전한 계좌로 자금을 이체하라고 합니다. 어떻게 해야 할까요?",
    options: [
      { id: 'a', text: "당황해서 시키는 대로 이체한다.", isCorrect: false },
      { id: 'b', text: "일단 전화를 끊고 해당 검찰청 대표번호로 전화해 사실 여부를 확인한다.", isCorrect: true },
      { id: 'c', text: "범죄 연루 사실이 무서워 비밀번호를 알려준다.", isCorrect: false },
    ],
    explanation: "검찰, 경찰, 금감원 등 공공기관은 절대로 전화로 자금 이체나 비밀번호를 요구하지 않습니다. 일단 끊고 대표번호로 확인하는 것이 가장 안전합니다.",
  },
  {
    id: 2,
    type: 'voice',
    question: "가족의 목소리로 전화가 와서 '핸드폰이 고장나서 수리비가 급하다'며 편의점에서 기프트카드를 사서 번호를 보내달라고 합니다. 목소리가 평소와 약간 다른 것 같습니다.",
    options: [
      { id: 'a', text: "급한 상황이니 바로 사서 보내준다.", isCorrect: false },
      { id: 'b', text: "목소리가 이상해도 가족이니 믿는다.", isCorrect: false },
      { id: 'c', text: "전화를 끊고 원래 알던 가족의 번호로 다시 전화해 확인한다.", isCorrect: true },
    ],
    explanation: "가족 사칭형 보이스피싱의 전형적인 수법입니다. 핸드폰 고장 핑계로 기프트카드나 신분증 사진을 요구하면 100% 사기입니다.",
  },
  {
    id: 3,
    type: 'app',
    question: "저금리 대출을 해준다며 은행 앱을 설치하라고 문자가 왔습니다. 링크를 누르니 앱 설치 파일(.apk)이 다운로드됩니다.",
    options: [
      { id: 'a', text: "설치하지 않고 즉시 삭제한다.", isCorrect: true },
      { id: 'b', text: "은행 앱이니 설치해서 대출을 신청한다.", isCorrect: false },
      { id: 'c', text: "바이러스 검사를 하고 설치한다.", isCorrect: false },
    ],
    explanation: "출처가 불분명한 앱(.apk) 설치 유도는 악성 앱을 심어 개인정보를 탈취하려는 수법입니다. 공식 스토어가 아닌 링크 설치는 절대 금물입니다.",
  },
];

export default function TrainingScreen() {
  const { colors, showToast } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];

  const handleAnswer = (option) => {
    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
    if (option.isCorrect) {
      setScore(score + 1);
      // showToast('정답입니다!', 'success');
    } else {
      // showToast('오답입니다.', 'error');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  if (showResult) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="trophy" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>훈련 완료!</Text>
          <Text style={[styles.resultScore, { color: colors.primary }]}>
            {score} / {QUIZ_DATA.length}
          </Text>
          <Text style={[styles.resultMessage, { color: colors.mutedForeground }]}>
            {score === QUIZ_DATA.length 
              ? "완벽합니다! 보이스피싱 예방 전문가시네요." 
              : "조금 더 주의가 필요합니다. 다시 한 번 복습해보세요."}
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={restartQuiz}>
            <Text style={styles.buttonText}>다시 하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>피싱 예방 훈련</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          실제 사례를 바탕으로 한 퀴즈로 대처 능력을 키우세요.
        </Text>
      </View>

      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary, 
              width: `${((currentQuestionIndex + 1) / QUIZ_DATA.length) * 100}%` 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
        문제 {currentQuestionIndex + 1} / {QUIZ_DATA.length}
      </Text>

      <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.questionHeader}>
          <Ionicons 
            name={currentQuestion.type === 'voice' ? 'mic' : currentQuestion.type === 'app' ? 'phone-portrait' : 'call'} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={[styles.questionType, { color: colors.primary }]}>
            {currentQuestion.type === 'voice' ? '가족 사칭' : currentQuestion.type === 'app' ? '악성 앱' : '기관 사칭'}
          </Text>
        </View>
        <Text style={[styles.questionText, { color: colors.foreground }]}>
          {currentQuestion.question}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedOption?.id === option.id && {
                borderColor: option.isCorrect ? colors.green : colors.destructive,
                backgroundColor: option.isCorrect ? colors.green + '10' : colors.destructive + '10',
              }
            ]}
            onPress={() => !selectedOption && handleAnswer(option)}
            disabled={!!selectedOption}
          >
            <Text style={[
              styles.optionText, 
              { color: colors.foreground },
              selectedOption?.id === option.id && {
                color: option.isCorrect ? colors.green : colors.destructive,
                fontWeight: 'bold',
              }
            ]}>
              {option.text}
            </Text>
            {selectedOption?.id === option.id && (
              <Ionicons 
                name={option.isCorrect ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={option.isCorrect ? colors.green : colors.destructive} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedOption && (
        <View style={[styles.feedbackCard, { backgroundColor: isCorrect ? colors.green + '10' : colors.destructive + '10' }]}>
          <Text style={[styles.feedbackTitle, { color: isCorrect ? colors.green : colors.destructive }]}>
            {isCorrect ? "정답입니다! 👏" : "틀렸습니다. 😢"}
          </Text>
          <Text style={[styles.feedbackText, { color: colors.foreground }]}>
            {currentQuestion.explanation}
          </Text>
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={nextQuestion}>
            <Text style={styles.buttonText}>
              {currentQuestionIndex < QUIZ_DATA.length - 1 ? "다음 문제" : "결과 보기"}
            </Text>
          </TouchableOpacity>
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
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
  },
  questionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  questionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  feedbackCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
});
