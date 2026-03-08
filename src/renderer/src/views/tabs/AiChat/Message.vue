<template>
  <div class="message-wrapper" :class="msg.role">
    <!-- 用户消息 -->
    <div v-if="msg.role === 'user'" class="user-message">
      <div class="message-content">{{ msg.content }}</div>
    </div>

    <!-- AI 消息 -->
    <div v-else class="ai-message">
      <div class="ai-header">
        <div class="ai-icon-bg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="14"
            height="14"
          >
            <rect x="3" y="4" width="18" height="12" rx="2"></rect>
            <path d="M8 20h8M12 16v4"></path>
          </svg>
        </div>
        <span class="ai-name">Agent name</span>
      </div>

      <!-- 思考过程折叠面板 -->
      <details v-if="msg.thinkContent" class="think-details" open>
        <summary class="think-summary">
          <svg
            class="chevron"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          思考过程
        </summary>
        <div class="think-content">
          <template v-for="(block, index) in thinkBlocks" :key="'think-' + index">
            <CodeBlock v-if="block.type === 'code'" :code="block.content" :lang="block.lang" />
            <MarkdownBlock v-else :content="block.content" />
          </template>
        </div>
      </details>

      <!-- AI 正文分块渲染 -->
      <div class="ai-content">
        <template v-if="!msg.content && !msg.thinkContent">
          <span class="loading-dots">正在思考</span>
        </template>
        <template v-else>
          <template v-for="(block, index) in contentBlocks" :key="'content-' + index">
            <CodeBlock v-if="block.type === 'code'" :code="block.content" :lang="block.lang" />
            <MarkdownBlock v-else :content="block.content" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import CodeBlock from './MessageBlock/CodeBlock.vue'
import MarkdownBlock from './MessageBlock/MarkdownBlock.vue'

const props = defineProps<{
  msg: {
    role: string
    content: string
    thinkContent?: string
  }
}>()

// 定义严谨的联合类型，告诉 TS：只要是 code，lang 必定是 string
type ContentBlock =
  | { type: 'code'; content: string; lang: string }
  | { type: 'markdown'; content: string }

const splitToBlocks = (text: string | undefined): ContentBlock[] => {
  if (!text) return []

  const tokens = marked.lexer(text)
  const blocks: ContentBlock[] = []
  let mdBuffer = ''

  tokens.forEach((token) => {
    if (token.type === 'code') {
      if (mdBuffer) {
        blocks.push({ type: 'markdown', content: mdBuffer })
        mdBuffer = ''
      }
      // 强制赋予默认值 'text'，确保 lang 是 string
      blocks.push({ type: 'code', content: token.text, lang: token.lang || 'text' })
    } else {
      mdBuffer += token.raw
    }
  })

  if (mdBuffer) {
    blocks.push({ type: 'markdown', content: mdBuffer })
  }

  return blocks
}

const contentBlocks = computed(() => splitToBlocks(props.msg.content))
const thinkBlocks = computed(() => splitToBlocks(props.msg.thinkContent))
</script>

<style scoped>
.message-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 24px;
}

.user-message {
  align-self: flex-end;
  max-width: 85%;
  padding: 10px 14px;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  background: var(--color-bg-400);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.ai-message {
  align-self: flex-start;
  width: 100%;
  font-size: 14px;
  line-height: 1.6;
}

.ai-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  color: var(--palette-white);
  font-weight: 600;
  font-size: 14px;
}

.ai-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--palette-gray-100);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.think-details {
  margin-bottom: 12px;
}

.think-summary {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  color: var(--color-text-muted);
  font-size: 13px;
  list-style: none;
  background: var(--color-bg-400);
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.think-summary:hover {
  background: var(--palette-gray-500);
}

.think-summary::-webkit-details-marker {
  display: none;
}

.chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.think-details[open] .chevron {
  transform: rotate(90deg);
}

.think-content {
  margin-top: 8px;
  padding-left: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
  border-left: 2px solid var(--color-bg-600);
  opacity: 0.7;
}

.ai-content {
  color: var(--color-text);
}

.loading-dots {
  display: inline-block;
}
.loading-dots::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}
@keyframes dots {
  0%,
  20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%,
  100% {
    content: '...';
  }
}
</style>
