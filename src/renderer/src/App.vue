<script setup lang="ts">
import { ref } from 'vue'
import Tab from '@components/Tab.vue'
import AiChat from './views/tabs/AiChat/index.vue'
const showTab = ref(true)
</script>

<template>
  <div class="container">
    <Tab v-if="showTab" title="聊天页面" width="500px" height="600px" @close="showTab = false">
      <AiChat />
    </Tab>
  </div>
</template>

<style></style>
