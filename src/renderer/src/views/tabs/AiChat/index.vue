<template>
  <div class="ai-chat">
    <!-- 聊天记录区域：直接遍历使用 Message 组件 -->
    <div ref="chatHistoryRef" class="chat-history">
      <Message v-for="msg in messages" :key="msg.id" :msg="msg" />
    </div>

    <!-- 底部输入区域 -->
    <div class="chat-input-wrapper">
      <div class="chat-input-box">
        <!-- 输入框 Header -->
        <div class="input-header">
          <BotIcon />
          <span class="header-title">@Builder</span>
          <ToolIcon class="header-tool" />
        </div>

        <!-- 输入框 Body -->
        <div class="input-body">
          <textarea
            ref="textareaRef"
            v-model="input"
            rows="1"
            placeholder="您正在与 Builder 聊天"
            @input="adjustTextareaHeight"
            @keydown.enter="onEnterKey"
          ></textarea>

          <div class="toolbar">
            <div class="toolbar-left">
              <button class="icon-btn text-icon">@</button>
              <button class="icon-btn text-icon">#</button>
            </div>
            <div class="toolbar-right">
              <div class="model-selector">
                <span>GLM-4.7-plan</span>
                <ChevronDownIcon />
              </div>
              <button class="icon-btn">
                <StarIcon />
              </button>
              <button class="icon-btn">
                <MicrophoneIcon />
              </button>
              <button
                class="send-btn"
                :class="{ active: !isWaitingForResponse && input.trim().length > 0 }"
                :disabled="isWaitingForResponse"
                @click="sendMessage"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import Message from './Message.vue'
import { BotIcon, ToolIcon, ChevronDownIcon, StarIcon, MicrophoneIcon, SendIcon } from './Svg'

// 接口命名调整，避免与 Message 组件冲突
interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  thinkContent?: string
}

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const chatHistoryRef = ref<HTMLDivElement | null>(null)
const isWaitingForResponse = ref(false)

// 用于存储聊天记录
const messages = ref<ChatMessage[]>([])

// 自动调整输入框高度
const adjustTextareaHeight = (): void => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

// 滚动条自动到底部
const scrollToBottom = (): void => {
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
  }
}

// 回车：等待中则什么都不做，否则发送（Shift+Enter 换行）
const onEnterKey = (e: KeyboardEvent): void => {
  if (isWaitingForResponse.value) {
    if (!e.shiftKey) {
      e.preventDefault()
      return
    }
    return
  }
  if (!e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const sendMessage = async (): Promise<void> => {
  const text = input.value.trim()
  if (!text || isWaitingForResponse.value) return

  // UI 立即显示用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text
  })

  // 清空输入框并滚动
  input.value = ''
  isWaitingForResponse.value = true
  nextTick(() => {
    adjustTextareaHeight()
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

          // 关键：实时追加字符，Vue 会将变动传递给 Message 组件进行拆分和高亮渲染
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

.chat-history {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0; /* 消息间距由 Message 组件自身 margin-bottom 控制 */
  min-height: 0;
  padding-right: 6px; /* 给滚动条预留空间 */
  overflow-y: auto;
  /* 核心修复 1：强制隐藏横向滚动条，除非真的需要 */
  overflow-x: hidden;
  /* 核心修复 2：防止纵向滚动条挤压内容导致横向抖动 */
  width: 100%;
  box-sizing: border-box;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
}
.chat-history::-webkit-scrollbar-track {
  background: transparent;
}
.chat-history::-webkit-scrollbar-thumb {
  background: var(--color-text-placeholder);
  border-radius: 4px;
}
.chat-history::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* 
 * 底部输入框样式 
 * (原先的消息气泡、代码块、Markdown 样式已全部移至 Message.vue 及其子组件，此处仅保留布局和输入框样式)
 */

.chat-input-wrapper {
  flex-shrink: 0;
  margin-top: 16px;
  padding-bottom: 4px; /* 留出底部稍微一点间隙 */
}

.chat-input-box {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-400);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.input-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 13px;
  background: var(--color-bg-400);
  border-bottom: 1px solid var(--color-border);
}

.header-title {
  margin-right: auto;
}

.header-tool {
  color: var(--color-text-muted);
}

.input-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
}

textarea {
  width: 100%;
  min-height: 24px;
  max-height: 120px;
  padding: 0;
  color: var(--palette-white);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
}

textarea::placeholder {
  color: var(--color-text-placeholder);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 6px;
  align-items: center;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  color: var(--color-text);
  background: var(--color-border);
}

.text-icon {
  font-size: 16px;
  font-family: inherit;
}

.model-selector {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  color: var(--color-text-muted);
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.model-selector:hover {
  color: var(--color-text);
  background: var(--color-border);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 2px;
  color: var(--color-text-placeholder);
  background: var(--color-border);
  border: none;
  border-radius: 6px;
  cursor: not-allowed;
  transition: all 0.2s;
}

.send-btn.active {
  color: var(--palette-white);
  background: var(--color-accent);
  cursor: pointer;
}

.send-btn.active:hover {
  background: var(--color-accent-hover);
}

.send-btn:disabled {
  cursor: not-allowed;
}
</style>
