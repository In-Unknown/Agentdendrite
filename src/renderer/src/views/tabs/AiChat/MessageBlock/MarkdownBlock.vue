<!-- src/renderer/src/views/tabs/AiChat/MessageBlock/MarkdownBlock.vue -->
<template>
  <!-- 重新加上 markdown-body 类名 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown-body custom-md" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps<{ content: string }>()
const renderedHtml = ref<string>('')

const updateContent = async (text: string): Promise<void> => {
  if (!text) {
    renderedHtml.value = ''
    return
  }
  const result = marked.parse(text)
  renderedHtml.value = result instanceof Promise ? await result : result
}

watch(() => props.content, updateContent, { immediate: true })
</script>

<style scoped>
/* 1. 容器基础样式 */
.custom-md {
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
  word-wrap: break-word;
}

/* 2. 块级排版元素 (标题、段落、引用、分割线) */
:deep(h1),
:deep(h2),
:deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

:deep(p) {
  margin-bottom: 12px;
}
:deep(p:last-child) {
  margin-bottom: 0;
}

:deep(blockquote) {
  margin: 0 0 12px 0;
  padding: 0 1em;
  color: var(--color-text-muted);
  border-left: 0.25em solid var(--color-border);
}

:deep(hr) {
  height: 1px;
  margin: 24px 0;
  background-color: var(--color-border);
  border: none;
  opacity: 0.6;
}

:deep(hr.fancy) {
  height: 1px;
  margin: 32px 0;
  background: linear-gradient(to right, transparent, var(--color-border), transparent);
  border: none;
}

/* 3. 列表样式 (合并了重复的选择器) */
:deep(ul),
:deep(ol) {
  padding-left: 2em;
  margin-bottom: 12px;
}

:deep(ul) {
  list-style-type: disc;
}

:deep(ol) {
  list-style-type: decimal;
}

:deep(li li) {
  margin-top: 0.25em;
}

/* 4. 表格样式 */
:deep(table) {
  width: 100%;
  margin-bottom: 16px;
  border-collapse: collapse;
}

:deep(th),
:deep(td) {
  padding: 6px 13px;
  border: 1px solid var(--color-border);
}

:deep(tr:nth-child(2n)) {
  background-color: var(--color-bg-200);
}

/* 5. 行内元素样式 (链接、加粗、代码) */
:deep(a) {
  color: #58a6ff;
  text-decoration: none;
}
:deep(a:hover) {
  text-decoration: underline;
}

:deep(strong),
:deep(b) {
  font-weight: bold !important;
  color: var(--color-text-bold, inherit);
}

:deep(em),
:deep(i) {
  font-style: italic;
}

:deep(code:not(pre code)) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  color: var(--color-text-accent);
  background-color: var(--color-bg-400);
  border-radius: 6px;
}
</style>
