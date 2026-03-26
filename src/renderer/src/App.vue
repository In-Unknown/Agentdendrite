<!-- src/renderer/src/App.vue -->
<script setup lang="ts">
import LayoutWorkspace from './features/layout/views/LayoutWorkspace.vue'
</script>

<template>
  <div class="app-container">
    <LayoutWorkspace />
  </div>
</template>

<style>
/* 1. 基础重置：整个窗口的环境 */
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #1e1e1e; /* 窗口背景色 */
}

/* 2. 外层容器：只管边距和基础弹性布局 */
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  padding: 6px; /* 窗口四周的留白 */
  box-sizing: border-box;
}
</style>
