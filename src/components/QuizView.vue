<script setup lang="ts">
import { computed } from 'vue';
import { useAssessment } from '../composables/useAssessment';

const { currentQuestion, currentIndex, progress, answers, selectAnswer, prevQuestion } = useAssessment();

const currentAnswer = computed(() => answers[currentQuestion.id] ?? null);

// 进度条百分比
const progressPercent = computed(() =>
  `${Math.round((progress.value.answered / progress.value.total) * 100)}%`
);

// 上一题按钮是否可用
const canGoPrev = computed(() => currentIndex.value > 0);
</script>

<template>
  <div class="quiz">
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent }"></div>
    </div>
    <div class="progress-text">
      进度 {{ progress.current }}/{{ progress.total }}
    </div>

    <!-- 题目 -->
    <div class="question-card">
      <div class="question-number">第 {{ currentIndex + 1 }} 题</div>
      <div class="question-text">{{ currentQuestion.text }}</div>

      <div class="options">
        <button
          v-for="option in currentQuestion.options"
          :key="option.score"
          class="option-btn"
          :class="{ selected: currentAnswer === option.score }"
          @click="selectAnswer(option.score)"
        >
          {{ option.content }}
        </button>
      </div>
    </div>

    <!-- 上一题按钮 -->
    <div class="nav-bottom">
      <button class="btn-secondary" :disabled="!canGoPrev" @click="prevQuestion">
        ← 上一题
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  max-width: 640px;
  margin: 0 auto;
  padding-top: 24px;
}

.progress-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  font-size: 14px;
  color: var(--color-secondary);
  margin: 8px 0 24px;
  font-family: var(--font-number);
}

.question-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.question-number {
  font-size: 14px;
  color: var(--color-secondary);
  margin-bottom: 12px;
  font-family: var(--font-number);
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 32px;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  padding: 14px 20px;
  border: 1.5px solid #E5E7EB;
  border-radius: var(--radius-md);
  background: white;
  text-align: left;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
}

.option-btn:hover {
  border-color: var(--color-primary);
  background: #F0F7EE;
}

.option-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.nav-bottom {
  margin-top: 24px;
}

.btn-secondary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
