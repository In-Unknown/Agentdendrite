<!-- src/renderer/src/features/layout/views/LayerRoot.vue -->
<script setup lang="ts">
import { provide } from 'vue'
import TabFolder from './TabFolder.vue'
import FreeFolder from './FreeFolder.vue'
import type {
  LayoutLayer,
  CanvasTabFolderData,
  FullCanvasFreeFolderData
} from '../models/PageLayout'

const props = defineProps<{
  layer: LayoutLayer
}>()

// 向该层下的所有子孙组件注入生命之源：层 ID
provide('LAYER_ID', props.layer.id)
</script>

<template>
  <!-- 必须有这唯一的一个外层 div，用来接收父组件传来的 class (透传属性) -->
  <div class="layer-wrapper">
    <!-- 类型分流，解决 TS 报错 -->
    <template v-if="layer.root.type === 'canvas'">
      <TabFolder :folder-data="layer.root as CanvasTabFolderData" />
    </template>

    <template v-else-if="layer.root.type === 'full-free-canvas'">
      <FreeFolder :folder-data="layer.root as FullCanvasFreeFolderData" />
    </template>
  </div>
</template>

<style scoped>
/* 确保这个接收透传的 wrapper 能撑满父级的 absolute 空间 */
.layer-wrapper {
  width: 100%;
  height: 100%;
}
</style>
