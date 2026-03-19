<!-- src/renderer/src/views/tabs/AiChat/UserMessage.vue -->
<template>
  <div class="user-message-wrapper">
    <div class="message-content">{{ content }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<style scoped>
.user-message-wrapper {
  display: flex;
  justify-content: flex-end; /* 用户消息靠右 */
  width: 100%;
  margin-bottom: 24px;
}

.message-content {
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
</style>
