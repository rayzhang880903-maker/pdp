# PDP行为特质测试 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个单页Vue 3应用，用户完成30道Likert量表题后获得五种动物类型（老虎/孔雀/考拉/猫头鹰/变色龙）的主导人格分析报告，包含雷达图和职业推荐。

**Architecture:**
- 纯前端单页应用，数据全部内嵌在代码中，无后端依赖
- 三个视图：引导页 → 作答页 → 结果页，通过状态驱动切换
- 进度和答案存储在 localStorage，支持刷新恢复
- 雷达图使用 Chart.js 渲染，动物图标使用 emoji

**Tech Stack:** Vue 3 + Vite + TypeScript + Chart.js

---

## 1. 文件结构

```
src/
├── main.ts                 # Vue 应用入口
├── App.vue                 # 根组件，状态机驱动视图切换
├── data/
│   ├── questions.ts       # 30道题目数据（内嵌）
│   └── results.ts         # 五种类型的结果解读
├── composables/
│   └── useAssessment.ts   # 答题状态管理（进度/答案/结果计算）
├── components/
│   ├── WelcomeView.vue    # 引导页
│   ├── QuizView.vue       # 作答页
│   ├── ResultView.vue     # 结果页
│   └── RadarChart.vue     # 五维雷达图组件
├── types/
│   └── index.ts           # 类型定义
└── styles/
    └── main.css           # 全局样式（颜色/字体/间距系统）
```

---

## 2. 类型定义

**`src/types/index.ts`** — Create this file first:

```typescript
export type AnimalType = 'tiger' | 'peacock' | 'koala' | 'owl' | 'chameleon';

export interface Question {
  id: number;          // 排序序号 1-30
  text: string;        // 题干
  options: Option[];   // 5个选项
}

export interface Option {
  score: number;       // 1-5
  content: string;     // "完全不同意" 等
}

export interface ScoreMap {
  tiger: number;
  peacock: number;
  koala: number;
  owl: number;
  chameleon: number;
}

export interface ResultData {
  primaryType: AnimalType;
  scores: ScoreMap;
  totalCompleted: number;
}

export type AssessmentState = 'idle' | 'in_progress' | 'submitted' | 'completed';
```

---

## 3. 题目数据

**`src/data/questions.ts`** — Create this file:

```typescript
import type { Question } from '../types';

export const questions: Question[] = [
  { id: 1, text: "你做事是一个值得信赖的人吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 2, text: "你个性温和吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 3, text: "你有活力吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 4, text: "你善解人意吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 5, text: "你独立吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 6, text: "你受人爱戴吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 7, text: "做事认真且正直吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 8, text: "你富有同情心吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 9, text: "你有说服力吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 10, text: "你大胆吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 11, text: "你精确吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 12, text: "你适应能力强吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 13, text: "你组织能力好吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 14, text: "你是否积极主动?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 15, text: "你害羞吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 16, text: "你强势吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 17, text: "你镇定吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 18, text: "你勇于学习吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 19, text: "你反应快吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 20, text: "你外向吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 21, text: "你注意细节吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 22, text: "你爱说话吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 23, text: "你的协调能力好吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 24, text: "你勤劳吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 25, text: "你慷慨吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 26, text: "你小心翼翼吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 27, text: "你令人愉快吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 28, text: "你传统吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 29, text: "你亲切吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
  { id: 30, text: "你工作足够有效率吗?", options: [{score:1,content:"完全不同意"},{score:2,content:"不同意"},{score:3,content:"中立"},{score:4,content:"同意"},{score:5,content:"完全同意"}] },
];
```

---

## 4. 结果数据

**`src/data/results.ts`** — Create this file:

```typescript
import type { AnimalType } from '../types';

export interface ResultInfo {
  type: AnimalType;
  title: string;        // "支配型"
  emoji: string;      // "🐯"
  description: string;
  suggestions: string[];
  careers: string[];
  color: string;       // 对应CSS颜色变量
}

export const resultData: Record<AnimalType, ResultInfo> = {
  tiger: {
    type: 'tiger',
    title: '支配型',
    emoji: '🐯',
    description: '目标明确，行动迅速，喜欢挑战和权力，做决策快，喜欢主导。适合担任领导者、开拓者、危机解决者角色。',
    suggestions: ['建议从事需要快速决策、掌控全局的工作，如企业管理层、创业者、销售团队负责人等。', '注意避免过于强势，学团队协作。'],
    careers: ['创业者', '销售总监', '项目经理', '企业管理层'],
    color: '#F97316',
  },
  peacock: {
    type: 'peacock',
    title: '表达型',
    emoji: '🦚',
    description: '热情、善于社交、乐观，喜欢与人交往，能活跃气氛，善于激励和说服，注重表面和体验。',
    suggestions: ['建议从事销售、公关、团队凝聚者、发言人等需要人际交往的工作。', '注意扬长避短，在擅长的领域发挥优势。'],
    careers: ['销售', '公关', '市场推广', '团队管理者'],
    color: '#EC4899',
  },
  koala: {
    type: 'koala',
    title: '耐心型',
    emoji: '🐨',
    description: '平和、沉稳、有耐心，喜欢稳定的工作环境，善于倾听和支持他人。',
    suggestions: ['建议从事协调者、后勤支持、客户服务、团队稳定器等工作。', '注意在稳定中寻求突破，避免安于现状。'],
    careers: ['客服', 'HR', '行政', '协调者'],
    color: '#92400E',
  },
  owl: {
    type: 'owl',
    title: '精确型',
    emoji: '🦉',
    description: '注重逻辑、数据和流程，遵守规则，做事有条理，追求完美和准确。',
    suggestions: ['建议从事质量控制、财务、数据分析、流程管理者等工作。', '注意避免过度追求完美而影响效率。'],
    careers: ['财务', '数据分析', '质量控制', '流程管理者'],
    color: '#1E40AF',
  },
  chameleon: {
    type: 'chameleon',
    title: '整合型',
    emoji: '🦎',
    description: '能根据环境和需要调整自己的行为，善于处理复杂局面和协调不同意见。',
    suggestions: ['建议从事谈判者、项目经理、组织变革推动者等工作。', '发挥灵活适应的优势，在复杂环境中游刃有余。'],
    careers: ['项目经理', '谈判者', '变革管理', '咨询顾问'],
    color: '#7C3AED',
  },
};
```

---

## 5. 样式文件

**`src/styles/main.css`** — Create this file:

```css
:root {
  --color-primary: #2D5A27;
  --color-secondary: #6B7280;
  --color-bg: #FAFAF5;
  --color-text: #1F2937;
  --color-tiger: #F97316;
  --color-peacock: #EC4899;
  --color-koala: #92400E;
  --color-owl: #1E40AF;
  --color-chameleon: #7C3AED;

  --font-heading: 'Noto Sans SC', 'Source Han Sans', sans-serif;
  --font-body: 'Noto Sans SC', 'Source Han Sans', sans-serif;
  --font-number: 'DM Sans', sans-serif;

  --space-unit: 4px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --page-margin-mobile: 24px;
  --page-margin-desktop: 48px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-md);
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-xl) var(--page-margin-desktop);
  }
}

h1 {
  font-family: var(--font-heading);
  font-weight: 700;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background-color: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-secondary:hover {
  border-color: var(--color-text);
}
```

---

## 6. 答题状态管理 Composable

**`src/composables/useAssessment.ts`** — Create this file:

```typescript
import { ref, computed } from 'vue';
import type { AnimalType, ScoreMap, ResultData, AssessmentState } from '../types';
import { questions } from '../data/questions';

// 计分规则映射：questionId -> 动物类型
// questionId 就是排序序号 1-30
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

export function useAssessment() {
  // 从 localStorage 恢复已保存的答案
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

  // 持久化
  const saveAnswers = () => {
    localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers.value));
    localStorage.setItem(STORAGE_KEY_INDEX, String(currentIndex.value));
  };

  const currentQuestion = computed(() => questions[currentIndex.value]);

  const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: questions.length,
    answered: Object.keys(answers.value).length,
  }));

  // 选中某个选项
  const selectAnswer = (score: number) => {
    const qId = currentQuestion.value.id;
    answers.value[qId] = score;
    saveAnswers();

    // 自动跳转到下一题
    if (currentIndex.value < questions.length - 1) {
      currentIndex.value++;
      saveAnswers();
    } else {
      // 最后一题，标记为已提交
      state.value = 'submitted';
    }
  };

  // 上一题
  const prevQuestion = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      saveAnswers();
    }
  };

  // 开始测试
  const startAssessment = () => {
    state.value = 'in_progress';
    // 如果没有保存的进度，从0开始
    if (currentIndex.value === 0 && Object.keys(answers.value).length === 0) {
      // fresh start
    }
  };

  // 计算结果
  const calculateResult = (): ResultData => {
    const scores: ScoreMap = { tiger: 0, peacock: 0, koala: 0, owl: 0, chameleon: 0 };

    for (const [qIdStr, score] of Object.entries(answers.value)) {
      const qId = parseInt(qIdStr, 10);
      const animal = SCORING_MAP[qId];
      if (animal && score) {
        scores[animal] += score;
      }
    }

    // 找最高分
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

    return { primaryType, scores, totalCompleted: Object.keys(answers.value).length };
  };

  // 重置
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
```

---

## 7. 雷达图组件

**`src/components/RadarChart.vue`** — Create this file:

```vue
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Chart, RadialLinearScale, RadarController, RadarElement, Tooltip, Legend } from 'chart.js';
import type { ScoreMap } from '../types';

Chart.register(RadarController, RadialLinearScale, RadarElement, Tooltip, Legend);

const props = defineProps<{
  scores: ScoreMap;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const ANIMAL_LABELS = ['老虎', '孔雀', '考拉', '猫头鹰', '变色龙'];
const ANIMAL_COLORS = ['#F97316', '#EC4899', '#92400E', '#1E40AF', '#7C3AED'];

const buildChartData = () => ({
  labels: ANIMAL_LABELS,
  datasets: [{
    label: '维度得分',
    data: [props.scores.tiger, props.scores.peacock, props.scores.koala, props.scores.owl, props.scores.chameleon],
    backgroundColor: 'rgba(45, 90, 39, 0.15)',
    borderColor: '#2D5A27',
    borderWidth: 2,
    pointBackgroundColor: ANIMAL_COLORS,
    pointRadius: 5,
  }],
});

const renderChart = () => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvasRef.value, {
    type: 'radar',
    data: buildChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 30,
          ticks: { stepSize: 6, font: { family: 'DM Sans' } },
          pointLabels: { font: { family: 'Noto Sans SC', size: 13 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
};

onMounted(renderChart);
watch(() => props.scores, renderChart, { deep: true });
</script>

<template>
  <div class="radar-chart">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.radar-chart {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
</style>
```

---

## 8. 引导页组件

**`src/components/WelcomeView.vue`** — Create this file:

```vue
<script setup lang="ts">
import { useAssessment } from '../composables/useAssessment';

const { startAssessment } = useAssessment();
</script>

<template>
  <div class="welcome">
    <div class="hero">
      <div class="animal-icons">🐯 🦚 🐨 🦉 🦎</div>
      <h1 class="title">PDP 行为特质测试</h1>
      <p class="subtitle">30道题 · 约5分钟 · 了解你的职场特质</p>
      <button class="btn-primary" @click="startAssessment">开始测试</button>
      <p class="social-proof">已有 12,847 人完成测试</p>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.hero {
  text-align: center;
}

.animal-icons {
  font-size: 48px;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: var(--color-secondary);
  margin-bottom: 32px;
}

.social-proof {
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-secondary);
}
</style>
```

---

## 9. 作答页组件

**`src/components/QuizView.vue`** — Create this file:

```vue
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
```

---

## 10. 结果页组件

**`src/components/ResultView.vue`** — Create this file:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import RadarChart from './RadarChart.vue';
import { useAssessment } from '../composables/useAssessment';
import { resultData } from '../data/results';

const { calculateResult, reset } = useAssessment();
const result = calculateResult();
const info = resultData[result.primaryType];
</script>

<template>
  <div class="result">
    <!-- 主类型展示 -->
    <div class="result-hero">
      <div class="emoji">{{ info.emoji }}</div>
      <h1 class="type-title">你是「{{ info.title }}」{{ info.type === 'tiger' ? '老虎' : info.type === 'peacock' ? '孔雀' : info.type === 'koala' ? '考拉' : info.type === 'owl' ? '猫头鹰' : '变色龙' }}！</h1>
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
```

---

## 11. App.vue 根组件

**`src/App.vue`** — Create this file:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useAssessment } from './composables/useAssessment';
import WelcomeView from './components/WelcomeView.vue';
import QuizView from './components/QuizView.vue';
import ResultView from './components/ResultView.vue';

const { state } = useAssessment();

const currentView = computed(() => {
  if (state.value === 'idle') return 'welcome';
  if (state.value === 'in_progress') return 'quiz';
  if (state.value === 'completed') return 'result';
  return 'welcome';
});
</script>

<template>
  <div class="app">
    <WelcomeView v-if="currentView === 'welcome'" />
    <QuizView v-else-if="currentView === 'quiz'" />
    <ResultView v-else-if="currentView === 'result'" />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}
</style>
```

---

## 12. 入口文件

**`src/main.ts`** — Create this file:

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';

createApp(App).mount('#app');
```

---

## 13. Vite + TypeScript 配置

**`package.json`** — Create this file:

```json
{
  "name": "pdp-assessment",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "chart.js": "^4.4.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

**`vite.config.ts`** — Create this file:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

**`tsconfig.json`** — Create this file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`** — Create this file:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**`index.html`** — Create this file:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PDP 行为特质测试</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## 验收标准检查

- [ ] 引导页正确展示（动物图标、标题、开始按钮）
- [ ] 30道题目可正常作答，5选项Likert量表
- [ ] 进度条准确显示（百分比 + 数量）
- [ ] 上一题切换正常
- [ ] 点击答案后自动跳转下一题（最后一题跳转结果）
- [ ] 刷新页面后答题进度保留（localStorage恢复）
- [ ] 结果计算正确（5维度各6题求和，SCORING_MAP验证无误）
- [ ] 结果页正确显示主类型（emoji+标题+得分）
- [ ] 雷达图正确展示5维度分布（Chart.js）
- [ ] 配色符合规范（CSS变量）
- [ ] 响应式布局正常（移动端24px/桌面端48px边距）
- [ ] 无样式错乱

---

## 执行选择

Plan complete and saved. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?