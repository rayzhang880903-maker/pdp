<script setup lang="ts">
import RadarChart from './RadarChart.vue';
import { useAssessment } from '../composables/useAssessment';
import { resultData } from '../data/results';

const { calculateResult, reset } = useAssessment();
const result = calculateResult();
const info = resultData[result.primaryType];

// Map animal type to Chinese name
const animalNames: Record<string, string> = {
  tiger: '老虎',
  peacock: '孔雀',
  koala: '考拉',
  owl: '猫头鹰',
  chameleon: '变色龙',
};
</script>

<template>
  <div class="result">
    <!-- 主类型展示 -->
    <div class="result-hero">
      <div class="emoji">{{ info.emoji }}</div>
      <h1 class="type-title">你是「{{ info.title }}」{{ animalNames[info.type] }}！</h1>
      <p class="total-score">总分：{{ result.scores[result.primaryType] }}分</p>
    </div>

    <!-- 雷达图 -->
    <div class="section">
      <h2 class="section-title">五维得分分布</h2>
      <RadarChart :scores="result.scores" />
    </div>

    <!-- 详细解读 -->
    <div class="section">
      <h2 class="section-title">详细解读</h2>
      <p class="description">{{ info.description }}</p>
    </div>

    <!-- 匹配职业 -->
    <div class="section">
      <h2 class="section-title">匹配职业</h2>
      <div class="career-list">
        <span v-for="career in info.careers" :key="career" class="career-tag">
          {{ career }}
        </span>
      </div>
    </div>

    <!-- 发展建议 -->
    <div class="section">
      <h2 class="section-title">发展建议</h2>
      <ul class="suggestions">
        <li v-for="(s, i) in info.suggestions" :key="i">{{ s }}</li>
      </ul>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn-secondary" @click="reset">重新测试</button>
    </div>
  </div>
</template>

<style scoped>
.result {
  max-width: 640px;
  margin: 0 auto;
  padding-top: 24px;
}

.result-hero {
  text-align: center;
  margin-bottom: 32px;
}

.emoji {
  font-size: 80px;
  margin-bottom: 16px;
}

.type-title {
  font-size: 24px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.total-score {
  font-family: var(--font-number);
  color: var(--color-secondary);
}

.section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.description {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text);
}

.career-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.career-tag {
  padding: 6px 14px;
  background: var(--color-bg);
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  font-size: 14px;
}

.suggestions {
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
