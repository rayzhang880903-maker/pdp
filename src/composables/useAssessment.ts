import { ref, computed } from 'vue';
import type { AnimalType, ScoreMap, ResultData, AssessmentState } from '../types';
import { questions } from '../data/questions';
import { submitResultToFeishu, getAnonymousId } from '../services/feishuApi';

// 计分规则映射：questionId -> 动物类型
const SCORING_MAP: Record<number, AnimalType> = {
  5: 'tiger', 10: 'tiger', 14: 'tiger', 18: 'tiger', 24: 'tiger', 30: 'tiger',
  3: 'peacock', 6: 'peacock', 13: 'peacock', 20: 'peacock', 22: 'peacock', 29: 'peacock',
  2: 'koala', 8: 'koala', 15: 'koala', 17: 'koala', 25: 'koala', 28: 'koala',
  1: 'owl', 7: 'owl', 11: 'owl', 16: 'owl', 21: 'owl', 26: 'owl',
  4: 'chameleon', 9: 'chameleon', 12: 'chameleon', 19: 'chameleon', 23: 'chameleon', 27: 'chameleon',
};

const ANIMAL_ORDER: AnimalType[] = ['tiger', 'peacock', 'koala', 'owl', 'chameleon'];

const STORAGE_KEY_ANSWERS = 'pdp_answers';
const STORAGE_KEY_STATE = 'pdp_state';
const STORAGE_KEY_INDEX = 'pdp_current_index';

// Module-level singleton — created once, shared across all callers
const loadSavedAnswers = (): Record<number, number> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ANSWERS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const answers = ref<Record<number, number>>(loadSavedAnswers());
const currentIndex = ref<number>(parseInt(localStorage.getItem(STORAGE_KEY_INDEX) || '0', 10));
const state = ref<AssessmentState>('idle');

const saveAnswers = () => {
  localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers.value));
  localStorage.setItem(STORAGE_KEY_INDEX, String(currentIndex.value));
};

export function useAssessment() {
  const currentQuestion = computed(() => questions[currentIndex.value]);

  const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: questions.length,
    answered: Object.keys(answers.value).length,
  }));

  const selectAnswer = (score: number) => {
    const qId = currentQuestion.value.id;
    answers.value[qId] = score;
    saveAnswers();

    if (currentIndex.value < questions.length - 1) {
      currentIndex.value++;
      saveAnswers();
    } else {
      // 最后一题，直接进入结果
      state.value = 'completed';
    }
  };

  const prevQuestion = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      saveAnswers();
    }
  };

  const startAssessment = () => {
    state.value = 'in_progress';
  };

  const calculateResult = (): ResultData => {
    const scores: ScoreMap = { tiger: 0, peacock: 0, koala: 0, owl: 0, chameleon: 0 };

    for (const [qIdStr, score] of Object.entries(answers.value)) {
      const qId = parseInt(qIdStr, 10);
      const animal = SCORING_MAP[qId];
      if (animal && score) {
        scores[animal] += score;
      }
    }

    let maxScore = 0;
    let primaryType: AnimalType = 'tiger';
    for (const animal of ANIMAL_ORDER) {
      if (scores[animal] > maxScore) {
        maxScore = scores[animal];
        primaryType = animal;
      }
    }

    state.value = 'completed';
    localStorage.setItem(STORAGE_KEY_STATE, 'completed');

    // 静默写入飞书（失败不影响用户体验）
    const anonId = getAnonymousId();
    submitResultToFeishu(anonId, primaryType, scores).catch(console.error);

    return { primaryType, scores, totalCompleted: Object.keys(answers.value).length };
  };

  const reset = () => {
    answers.value = {};
    currentIndex.value = 0;
    state.value = 'idle';
    localStorage.removeItem(STORAGE_KEY_ANSWERS);
    localStorage.removeItem(STORAGE_KEY_INDEX);
    localStorage.removeItem(STORAGE_KEY_STATE);
  };

  return {
    answers,
    currentIndex,
    state,
    currentQuestion,
    progress,
    selectAnswer,
    prevQuestion,
    startAssessment,
    calculateResult,
    reset,
  };
}