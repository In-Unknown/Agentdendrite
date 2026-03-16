<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-box">
      <div class="input-header">
        <BotIcon />
        <span class="header-title">@Builder</span>
        <ToolIcon class="header-tool" />
      </div>

      <div class="input-body">
        <textarea
          ref="textareaRef"
          v-model="input"
          rows="1"
          class="chat-input-textarea scrollbar"
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
              :class="{ active: !isWaiting && input.trim().length > 0 }"
              :disabled="isWaiting"
              @click="handleSend"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { BotIcon, ToolIcon, ChevronDownIcon, StarIcon, MicrophoneIcon, SendIcon } from './Svg'

const props = defineProps<{
  isWaiting: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustTextareaHeight = (): void => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

const handleSend = (): void => {
  const text = input.value.trim()
  if (!text || props.isWaiting) return

  emit('send', text)

  input.value = ''
  nextTick(() => {
    adjustTextareaHeight()
  })
}

const onEnterKey = (e: KeyboardEvent): void => {
  if (props.isWaiting) {
    if (!e.shiftKey) e.preventDefault()
    return
  }
  if (!e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<style scoped>
.chat-input-wrapper {
  flex-shrink: 0;
  padding: 0 16px 16px;

  /* --- 新增代码 --- */
  /* 基础宽度占满 */
  width: 100%;

  /* 与消息列表一致的最大宽度 */
  max-width: 800px;

  /* 水平居中 */
  margin: 0 auto;

  /* 确保 padding 不撑大宽度 */
  box-sizing: border-box;
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
