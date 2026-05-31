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
      <p class="description">
        你是否曾好奇，为什么有些人天生善于沟通，而有些人更擅长深度分析？为什么你在某个团队里如鱼得水，在另一个环境里却感觉处处碰壁？<br>
        PDP行为特质测试——被誉为"企业识人的读心术"，能帮你揭开这些谜底。
      </p>
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
  margin-bottom: 24px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text);
  max-width: 480px;
  margin: 0 auto 32px;
  text-align: left;
}

.social-proof {
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-secondary);
}
</style>
