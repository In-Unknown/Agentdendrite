<template>
  <div class="daily-time">
    <div class="daily-time__date-row">
      <div class="daily-time__date-field">
        <span class="daily-time__date-val">{{ pad(state.qy, 4) }}</span>
        <span class="daily-time__date-unit">纪年</span>
      </div>
      <div class="daily-time__date-field">
        <span class="daily-time__date-val">{{ pad(state.qq, 2) }}</span>
        <span class="daily-time__date-unit">季度</span>
      </div>
    </div>

    <div class="daily-time__clock">
      <div class="daily-time__clock-col">
        <div class="daily-time__digit-wrap">
          <span class="daily-time__clock-digit">{{ state.qh }}</span>
        </div>
        <span class="daily-time__clock-label">qh</span>
      </div>
      <svg class="daily-time__clock-sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="daily-time__clock-col daily-time__clock-col--wide">
        <div class="daily-time__digit-wrap">
          <span class="daily-time__clock-digit">{{ pad(state.qmin, 3) }}</span>
        </div>
        <span class="daily-time__clock-label">qmin</span>
      </div>
      <svg class="daily-time__clock-sep" viewBox="0 0 10 36" fill="currentColor">
        <circle cx="5" cy="13" r="2.5" />
        <circle cx="5" cy="23" r="2.5" />
      </svg>
      <div class="daily-time__clock-col">
        <div class="daily-time__digit-wrap">
          <span class="daily-time__clock-digit">{{ pad(state.qs, 2) }}</span>
        </div>
        <span class="daily-time__clock-label">qs</span>
      </div>
    </div>

    <div class="daily-time__week-row">
      <span class="daily-time__week-val">{{ pad(state.qg, 2) }}</span>
      <span class="daily-time__week-unit">工作周</span>
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
.daily-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: var(--color-text);
  font-family: inherit;
}

.daily-time__date-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.daily-time__date-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.daily-time__date-val {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.daily-time__date-unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.daily-time__clock {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 14px;
}

.daily-time__clock-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.daily-time__digit-wrap {
  display: inline-flex;
  justify-content: center;
}

.daily-time__clock-digit {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  line-height: 1;
  text-align: center;
  margin-right: -2px;
}

.daily-time__clock-sep {
  height: 36px;
  width: 10px;
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.daily-time__clock-label {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 10px;
  color: var(--color-text-placeholder);
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
}

.daily-time__week-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.daily-time__week-val {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.daily-time__week-unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
}
</style>
