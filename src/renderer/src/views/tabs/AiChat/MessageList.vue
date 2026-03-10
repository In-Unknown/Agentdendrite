<template>
  <div ref="listRef" class="message-list">
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
.message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}
</style>
