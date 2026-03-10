<!-- src/renderer/src/App.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import TagPanel from '@components/TagPanel.vue'
import type { TagLeafData } from '@components/PageLayout'

const showTab = ref(true)

// 构建专门给 TagPanel 测试用的结构化数据
const mockLeafData = reactive<TagLeafData>({
  id: 'test-leaf-01',
  activeTabName: 'AiChat', // 默认激活的标签
  tabHeaderPosition: 'left', // 【测试点】：你可以把它改成 'left' | 'right' | 'bottom' 看看排版效果
  data: [
    {
      title: '聊天页面',
      tabName: 'AiChat' // 这里严格对应 views/tabs/AiChat 文件夹名称
    },
    {
      title: '系统设置',
      tabName: 'Settiq9qwngs' // 因为你没有 Settings 文件夹，点击它会显示“未找到对应组件”
    },
    {
      title: '系统设置',
      tabName: 'Sqwetku7kutings' // 因为你没有 Settings 文件夹，点击它会显示“未找到对应组件”
    }
  ]
})

// 监听子组件发出的标签页切换事件，并修改高亮状态
const handleTabChange = (newTitle: string): void => {
  mockLeafData.activeTabName = newTitle
}
</script>

<template>
  <div class="container">
    <TagPanel
      v-if="showTab"
      :leaf-data="mockLeafData"
      @close="showTab = false"
      @update:active-tab-name="handleTabChange"
    />
  </div>
</template>

<style>
/* 1. 必须要让最外层的 html 和 body 占满整个屏幕高度，否则垂直居中没有参照物 */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 2. 让 #app (也就是容器的父级) 变成 flex，来居中 .container */
#app {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
/* 稍微给外层加个居中效果，方便你观察 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;
  height: 480px;
  background-color: var(--color-bg-100, #141414);
}
</style>
