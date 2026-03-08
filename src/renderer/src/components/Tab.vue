<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    closable?: boolean
    width?: number | string
    height?: number | string
  }>(),
  {
    closable: true,
    width: '520px',
    height: '360px'
  }
)

const emit = defineEmits<{
  (event: 'close'): void
}>()

const tabSize = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))
</script>

<template>
  <div class="tab" :style="tabSize">
    <div class="tab__header">
      <div class="tab__title" :title="props.title">
        {{ props.title }}
      </div>
      <button v-if="props.closable" class="tab__close" type="button" @click="emit('close')">
        <svg class="tab__close-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" />
        </svg>
      </button>
    </div>
    <div class="tab__content">
      <div class="tab__content-safety">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab {
  /* ================= 设置中心：在这里改颜色 ================= */
  --tab-header-bg: var(--color-bg-300); /* 标题栏背景 */
  --tab-body-bg: var(--color-bg-200); /* 主体内容背景 */
  --tab-border-color: var(--color-border); /* 边框颜色 */
  --tab-text-color: var(--color-text); /* 文字颜色 */
  --tab-scrollbar-track: var(--color-bg-500); /* 滚动条槽颜色 */
  --tab-scrollbar-thumb: var(--palette-gray-700); /* 滚动条滑块颜色 */
  /* ======================================================= */

  --tab-title-size: 13px;
  --tab-icon-size: calc(var(--tab-title-size) * 1.35);

  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--tab-border-color);
  background: var(--tab-body-bg);
  overflow: hidden;
}

.tab__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 32px;
  padding: 0 10px;
  border-bottom: 1px solid var(--tab-border-color);
  background: var(--tab-header-bg);
  user-select: none;
}

.tab__title {
  flex: 1;
  min-width: 0;
  font-size: var(--tab-title-size);
  font-weight: 500;
  color: var(--tab-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab__content {
  flex: 1;
  min-height: 0;
  background: var(--tab-body-bg);
}

.tab__content-safety {
  display: block;
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow: auto;
  color: var(--tab-text-color);
  /* 滚动条颜色也同步 */
  scrollbar-color: var(--tab-scrollbar-thumb) var(--tab-scrollbar-track);
}

/* 兼容 Webkit 的滚动条颜色同步 */
.tab__content-safety::-webkit-scrollbar-track,
.tab__content-safety::-webkit-scrollbar-button {
  background: var(--tab-scrollbar-track);
}

.tab__content-safety::-webkit-scrollbar-thumb {
  background: var(--tab-scrollbar-thumb);
  border: 4px solid var(--tab-scrollbar-track);
  border-radius: 999px;
}

/* 关闭按钮基础样式 */
.tab__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--tab-icon-size);
  height: var(--tab-icon-size);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
}

.tab__close:hover {
  color: var(--palette-white);
}
.tab__close-icon {
  width: var(--tab-icon-size);
  height: var(--tab-icon-size);
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
}
</style>
