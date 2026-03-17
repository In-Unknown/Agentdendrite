// src/renderer/src/App.vue

<script setup lang="ts">
import TagFolder from './features/layout/views/TagFolder.vue'
// 同时引入底层和顶层数据
import { layoutData, topLayoutData } from './features/layout/stores/useLayout'
</script>

<template>
  <div class="app-container">
    <!-- 套的一层 div，用来建立重叠坐标系 -->
    <div class="stack-wrapper">
      <!-- 底层：渲染常规布局 -->
      <TagFolder :folder-data="layoutData" class="layer-base" />

      <!-- 顶层：完全重叠，渲染浮动窗口 -->
      <TagFolder :folder-data="topLayoutData" class="layer-overlay" />
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  padding: 6px;
  box-sizing: border-box; /* 防止 padding 撑开滚动条 */
}

/* 关键：重叠容器 */
.stack-wrapper {
  position: relative;
  flex: 1; /* 填满 app-container */
  width: 100%;
  height: 100%;
}

/* 关键：两个层共有的定位样式 */
.layer-base,
.layer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 底层层级 */
.layer-base {
  z-index: 1;
}

/* 顶层层级 */
.layer-overlay {
  z-index: 2;
}

/* 1. 顶层容器设为穿透。
   此时，整个 layer-overlay 及其内部所有东西默认都点不到了，
   鼠标会直接作用到底层 layer-base 上。 */
.layer-overlay {
  pointer-events: none;
}

/* 2. 精确恢复：只给“真正需要交互的窗口”恢复交互。
   把 .is-floating 及其内部所有元素设为 auto。 */
.layer-overlay .is-floating {
  pointer-events: auto;
}
</style>
