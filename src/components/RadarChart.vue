<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ScoreMap } from '../types';

const props = defineProps<{
  scores: ScoreMap;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const LABELS = ['老虎', '孔雀', '考拉', '猫头鹰', '变色龙'];
const COLORS = ['#F97316', '#EC4899', '#92400E', '#1E40AF', '#7C3AED'];
const CENTER_COLOR = '#2D5A27';

function drawRadar() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(cx, cy) - 40;
  const values = [props.scores.tiger, props.scores.peacock, props.scores.koala, props.scores.owl, props.scores.chameleon];

  ctx.clearRect(0, 0, W, H);

  // Draw concentric pentagons (grid)
  const levels = 5;
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  for (let l = 1; l <= levels; l++) {
    const r = (l / levels) * maxR;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
    ctx.stroke();
  }

  // Draw data polygon
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    const r = (values[i] / 30) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(45, 90, 39, 0.15)';
  ctx.fill();
  ctx.strokeStyle = CENTER_COLOR;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw data points
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    const r = (values[i] / 30) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS[i];
    ctx.fill();
  }

  // Draw labels
  ctx.fillStyle = '#1F2937';
  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    const lx = cx + (maxR + 22) * Math.cos(angle);
    const ly = cy + (maxR + 22) * Math.sin(angle);
    ctx.fillText(LABELS[i], lx, ly);
  }
}

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(drawRadar);
  });
});
</script>

<template>
  <div style="width:100%;max-width:320px;margin:0 auto;height:280px;display:flex;align-items:center;justify-content:center;">
    <canvas ref="canvasRef" width="320" height="280" style="display:block;"></canvas>
  </div>
</template>