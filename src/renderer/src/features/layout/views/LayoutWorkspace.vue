<!-- src/renderer/src/features/layout/views/LayoutWorkspace.vue -->
<script setup lang="ts">
import LayerRoot from './LayerRoot.vue'
import { layoutLayers } from '../stores/useLayout'
</script>

<template>
  <div class="stack-wrapper">
    <!-- 父组件直接向下发号施令，通过 class 决定它是底座还是浮层 -->
    <LayerRoot
      v-for="layer in layoutLayers"
      :key="layer.id"
      :layer="layer"
      :class="layer.isDragLayer ? 'layer-overlay' : 'layer-base'"
    />
  </div>
</template>

<style scoped>
/* 工作区作为坐标系基准 */
.stack-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 所有的层都绝对定位并撑满，实现完美重叠 */
.layer-base,
.layer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.layer-base {
  z-index: 1;
}

.layer-overlay {
  z-index: 2;
  pointer-events: none; /* 让顶层透明，鼠标直接点到底层 */
}

/* 只让悬浮窗恢复交互响应 */
.layer-overlay :deep(.is-floating) {
  pointer-events: auto;
}
</style>
