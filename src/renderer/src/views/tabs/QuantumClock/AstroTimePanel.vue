<template>
  <div class="astro-time">
    <div class="astro-time__grid">
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ state.qomgc }}</span>
        </div>
        <span class="astro-time__unit">qomgc</span
        ><!-- 虚世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qohc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qohc</span
        ><!-- 玄世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qjc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qjc</span
        ><!-- 极世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qhc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qhc</span
        ><!-- 恒世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qzc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qzc</span
        ><!-- 宙世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qcec, 4) }}</span>
        </div>
        <span class="astro-time__unit">qcec</span
        ><!-- 行星世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qwc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qwc</span
        ><!-- 文明世 -->
      </div>
      <svg class="astro-time__sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="astro-time__col">
        <div class="astro-time__digit-wrap">
          <span class="astro-time__digit">{{ pad(state.qqc, 4) }}</span>
        </div>
        <span class="astro-time__unit">qqc</span
        ><!-- 千世年 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuantumTimeState } from './quantumTimeTypes'
import { pad } from './quantumTime'

defineProps<{
  state: QuantumTimeState
}>()
</script>

<style scoped>
.astro-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--color-text);
  font-family: inherit;
}

.astro-time__grid {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.astro-time__col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.astro-time__digit-wrap {
  display: inline-flex;
  justify-content: center;
}

.astro-time__digit {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 36px;
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  line-height: 1;
  margin-right: -1px;
}

.astro-time__sep {
  height: 36px;
  width: 10px;
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.astro-time__unit {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--color-text-placeholder);
  line-height: 1;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
</style>
