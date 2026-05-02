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
