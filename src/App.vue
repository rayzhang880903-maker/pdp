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