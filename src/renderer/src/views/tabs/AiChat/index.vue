<!-- src/renderer/src/views/tabs/AiChat/index.vue -->
<template>
  <div class="ai-chat">
    <MessageList ref="messageListRef" :messages="messages" />
    <ChatInput :is-waiting="isWaitingForResponse" @send="sendMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'

// 接口命名调整，避免与 Message 组件冲突
interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  thinkContent?: string
}

const messageListRef = ref<InstanceType<typeof MessageList> | null>(null)
const isWaitingForResponse = ref(false)

// 用于存储聊天记录
const messages = ref<ChatMessage[]>([])

// 滚动条自动到底部
const scrollToBottom = (): void => {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom()
  }
}

const sendMessage = async (text: string): Promise<void> => {
  if (isWaitingForResponse.value) return

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text
  })

  isWaitingForResponse.value = true
  nextTick(() => {
    scrollToBottom()
  })

  // 将新消息推入数组，并获取它的引用，触发内部组件的更新
  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    thinkContent: ''
  })
  const currentMsg = messages.value[messages.value.length - 1]

  try {
    const response = await fetch('http://localhost:5068/api/Llm/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ role: 'user', content: text }])
    })

    if (!response.body) throw new Error('ReadableStream not supported')

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const data = JSON.parse(line)

          if (data.reasoning_content) {
            currentMsg.thinkContent = (currentMsg.thinkContent || '') + data.reasoning_content
          }

          if (data.content) {
            currentMsg.content += data.content
          }

          nextTick(() => scrollToBottom())
        } catch (e) {
          console.warn('JSON 解析错误', e)
        }
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
    currentMsg.content += `\n[系统提示]: 连接出错 - ${error}`
  } finally {
    isWaitingForResponse.value = false
    nextTick(() => scrollToBottom())
  }
}

interface BackendMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_content?: string
}

const loadHistory = async (): Promise<void> => {
  try {
    const response = await fetch('http://localhost:5068/api/Llm/clone')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const historyData: BackendMessage[] = await response.json()

    // 转换后端数据格式为前端 Message 格式
    // 后端格式: { role: string, content: string, reasoning_content?: string }
    messages.value = historyData.map((item, index) => ({
      id: Date.now() + index,
      role: item.role,
      content: item.content || '',
      thinkContent: item.reasoning_content || ''
    }))

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--color-text);
}
</style>
