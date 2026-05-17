<template>
  <div class="quantum-clock">
    <div class="quantum-clock__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="quantum-clock__tab"
        :class="{ 'quantum-clock__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="quantum-clock__panel">
      <MicroTimePanel v-if="activeTab === 'micro'" :state="timeState" />
      <DailyTimePanel v-else-if="activeTab === 'daily'" :state="timeState" />
      <AstroTimePanel v-else-if="activeTab === 'astro'" :state="timeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import MicroTimePanel from './MicroTimePanel.vue'
import DailyTimePanel from './DailyTimePanel.vue'
import AstroTimePanel from './AstroTimePanel.vue'
import { getInitialState, getTickTime } from './quantumTime'
import type { QuantumTimeState } from './quantumTimeTypes'

const tabs = [
  { key: 'micro' as const, label: '原子时间' },
  { key: 'daily' as const, label: '日常时间' },
  { key: 'astro' as const, label: '天文时间' }
]

type TabKey = 'micro' | 'daily' | 'astro'
const activeTab = ref<TabKey>('daily')

// 初始化 timeState 为包含全部27个字段硬编码初始值的响应式对象
const timeState = reactive<QuantumTimeState>(getInitialState())

// 声明帧循环ID，类型为 number 或 null，初始值为 null
let rafId: number | null = null

// 定义每帧回调函数，调用 getTickTime 更新 timeState
function tick(): void {
  getTickTime(timeState)
  rafId = requestAnimationFrame(tick)
}

// 组件挂载时开始帧循环
onMounted(() => {
  rafId = requestAnimationFrame(tick)
})

// 组件销毁时取消帧循环
onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})
</script>

<style scoped>
.quantum-clock {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--color-text);
  background: var(--color-bg-200);
}

.quantum-clock__tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  padding: 0 12px;
  background: var(--color-bg-300);
}

.quantum-clock__tab {
  padding: 10px 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
  font-family: inherit;
  letter-spacing: 0.5px;
}

.quantum-clock__tab:hover {
  color: var(--color-text);
}

.quantum-clock__tab--active {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

.quantum-clock__panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
