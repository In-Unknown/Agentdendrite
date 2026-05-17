<template>
  <div class="micro-time">
    <div class="micro-time__body">
      <div class="micro-time__active">
        <div class="micro-time__col">
          <div class="micro-time__digit-wrap">
            <span class="micro-time__digit">{{ pad(state.qms, 3) }}</span>
          </div>
          <span class="micro-time__label">qms</span>
        </div>
        <svg class="micro-time__sep" viewBox="0 0 10 36" fill="currentColor">
          <circle cx="5" cy="13" r="2.5" />
          <circle cx="5" cy="23" r="2.5" />
        </svg>
        <div class="micro-time__col">
          <div class="micro-time__digit-wrap">
            <span class="micro-time__digit">{{ pad(state.qμs, 3) }}</span>
          </div>
          <span class="micro-time__label">qμs</span>
        </div>
      </div>
      <div class="micro-time__divider"></div>
      <div class="micro-time__inactive">
        <template v-for="(item, idx) in inactiveItems" :key="item.label">
          <svg
            v-if="idx > 0"
            class="micro-time__sep micro-time__sep--dim"
            viewBox="0 0 10 36"
            fill="currentColor"
          >
            <circle cx="5" cy="13" r="2.5" />
            <circle cx="5" cy="23" r="2.5" />
          </svg>
          <div class="micro-time__col micro-time__col--dim">
            <div class="micro-time__digit-wrap">
              <span class="micro-time__digit micro-time__digit--dim">--</span>
            </div>
            <span class="micro-time__label micro-time__label--dim">{{ item.label }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuantumTimeState } from './quantumTime'
import { pad } from './quantumTime'

defineProps<{
  state: QuantumTimeState
}>()

const inactiveItems = [
  { label: 'qns' },
  { label: 'qps' },
  { label: 'qfs' },
  { label: 'qas' },
  { label: 'qzres' },
  { label: 'qys' },
  { label: 'qrs' },
  { label: 'qks' },
  { label: 'qats' },
  { label: 'qis' },
  { label: 'qcs' },
  { label: 'qt_P' }
]
</script>

<style scoped>
.micro-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--color-text);
  font-family: inherit;
}

.micro-time__body {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.micro-time__active {
  display: flex;
  align-items: center;
  gap: 8px;
}

.micro-time__inactive {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.3;
}

.micro-time__col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.micro-time__col--dim {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.micro-time__digit-wrap {
  display: inline-flex;
  justify-content: center;
}

.micro-time__digit {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 2px;
  line-height: 1;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  margin-right: -2px;
}

.micro-time__digit--dim {
  font-size: 36px;
  font-weight: 300;
  color: var(--color-text-placeholder);
}

.micro-time__label {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 10px;
  color: var(--color-text-placeholder);
  line-height: 1;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.micro-time__label--dim {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 10px;
  color: var(--color-text-placeholder);
  line-height: 1;
  letter-spacing: 0.5px;
  white-space: nowrap;
  opacity: 0.5;
}

.micro-time__sep {
  height: 36px;
  width: 10px;
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.micro-time__divider {
  width: 1px;
  height: 36px;
  background: var(--color-text-placeholder);
  opacity: 0.4;
  margin-bottom: 3px;
}
</style>
