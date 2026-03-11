<template>
  <div class="message-container">
    <div ref="listRef" class="message-list scrollbar--rail">
      <div class="message-inner">
        <template v-for="msg in messages" :key="msg.id">
          <!-- 用户消息 -->
          <UserMessage v-if="msg.role === 'user'" :content="msg.content" />

          <!-- AI 消息 -->
          <AiMessage
            v-else-if="msg.role === 'assistant'"
            :content="msg.content"
            :think-content="msg.thinkContent"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserMessage from './UserMessage.vue'
import AiMessage from './AiMessage.vue'

// 定义消息类型
interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  thinkContent?: string
}

defineProps<{
  messages: ChatMessage[]
}>()

const listRef = ref<HTMLDivElement | null>(null)

// 专门负责滚动的逻辑，暴露给主页面调用
const scrollToBottom = (): void => {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

// 暴露出 scrollToBottom 方法
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
/* 1. 新增的外层容器：负责整体与窗口边缘的隔离 */
.message-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;

  min-height: 0;
  min-width: 0;

  /* 这里控制“滚动条距离窗口”的距离 */
  /* 假设你希望左右各留 8px 的缝隙 */
  padding: 0 8px;
  box-sizing: border-box;
}

.message-list {
  flex: 1;
  width: 100%;
  /* 必须是 auto 或 scroll */
  overflow-y: auto;
  overflow-x: hidden;

  min-height: 0;
  min-width: 0;

  /* Electron (Chromium) 环境下的满分方案 */
  /* stable: 始终保留轨道位置，防止内容闪烁 */
  /* both-edges: 左右对称留白，确保 message-inner 绝对居中 */
  scrollbar-gutter: stable both-edges;
}

.message-inner {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;

  min-height: 0;
  min-width: 0;
}
</style>
