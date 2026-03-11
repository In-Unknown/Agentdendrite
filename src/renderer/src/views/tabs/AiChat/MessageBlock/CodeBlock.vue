<template>
  <div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-block-lang">{{ lang || 'text' }}</span>
      <button class="copy-code-btn" :class="{ copied: copied }" @click="copyCode">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="code-content scrollbar" v-html="highlightedHtml"></div>
  </div>
</template>

<script lang="ts">
import { createHighlighter, type Highlighter } from 'shiki'

// 【添加】这两个变量在所有组件实例间共享
let sharedHighlighter: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null
</script>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { type BundledLanguage, type BundledTheme } from 'shiki'

const props = defineProps<{ code: string; lang: string }>()
const highlightedHtml = ref('')
const copied = ref(false)

const updateHighlight = async (): Promise<void> => {
  // 【修改】改为检查全局共享的实例
  if (!sharedHighlighter) {
    if (!highlighterPromise) {
      // 【修改】确保全局只启动一次初始化过程
      highlighterPromise = createHighlighter({
        themes: ['one-dark-pro'],
        langs: [
          'javascript',
          'typescript',
          'vue',
          'bash',
          'json',
          'markdown',
          'mermaid',
          'html',
          'css'
        ]
      })
    }
    sharedHighlighter = await highlighterPromise
  }

  const targetLang = (props.lang || 'text') as BundledLanguage
  const targetTheme: BundledTheme = 'one-dark-pro'

  try {
    await sharedHighlighter.loadLanguage(targetLang)

    highlightedHtml.value = sharedHighlighter.codeToHtml(props.code, {
      lang: targetLang,
      theme: targetTheme
    })
  } catch {
    // 删除了未使用的 e 变量，消除 ESLint 报错
    const safeCode = props.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    highlightedHtml.value = `<pre><code>${safeCode}</code></pre>`
  }
}

watch(() => props.code, updateHighlight)
onMounted(updateHighlight)

const copyCode = (): void => {
  if (!props.code) return
  navigator.clipboard
    .writeText(props.code)
    .then(() => {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
    })
}
</script>

<style scoped>
.code-block-wrapper {
  margin: 16px 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-bg-600);
  background-color: var(--color-bg-300);
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-bg-200);
  padding: 6px 12px;
  border-bottom: 1px solid var(--color-bg-600);
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 12px;
  color: var(--color-text-muted);
}

.code-block-lang {
  font-weight: 600;
  text-transform: uppercase;
}

.copy-code-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  outline: none;
}

.copy-code-btn:hover {
  background-color: var(--color-bg-400);
  color: var(--color-text);
}

.copy-code-btn.copied {
  color: var(--palette-accent, #42b883);
}

.code-content {
  padding: 16px;
  overflow-x: auto;
}

:deep(pre.shiki),
:deep(pre.shiki span),
:deep(pre.shiki code) {
  background-color: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: 'Fira Code', monospace !important;
  font-variant-ligatures: contextual !important;
  font-feature-settings:
    'liga' 1,
    'calt' 1 !important;
  font-variant-ligatures: contextual;
  font-feature-settings:
    'liga' 1,
    'calt' 1;
  font-size: 14px !important;
  line-height: 1.5 !important;
}
</style>
