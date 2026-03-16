<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'
import type { TagLeafData } from './PageLayout'

const props = withDefaults(
  defineProps<{
    leafData: TagLeafData
    closable?: boolean
    width?: number | string
    height?: number | string
  }>(),
  {
    closable: true,
    width: '100%',
    height: '100%'
  }
)

const emit = defineEmits<{
  (event: 'close'): void
  (e: 'update:activeTabName', tabName: string): void
}>()

const tabSize = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const isSingleton = computed(() => props.leafData.type === 'singleton')

// 1. 批量映射 tabs 文件夹下所有的组件
const tabModules = import.meta.glob('../views/tabs/*/index.vue')

// 2. 查找当前高亮的 Tag 对象
const activeTag = computed(() => {
  return (
    props.leafData.data.find((t) => t.tabName === props.leafData.activeTabName) ||
    props.leafData.data[0]
  )
})

// 3. 动态计算要渲染的组件
const currentComponent = computed((): Component | null => {
  if (!activeTag.value) return null
  const path = `../views/tabs/${activeTag.value.tabName}/index.vue`
  if (tabModules[path]) {
    return defineAsyncComponent(tabModules[path] as () => Promise<Component>)
  }
  return null
})

const layoutClass = computed(() => {
  const pos = props.leafData.tabHeaderPosition || 'top'
  const classes = [`tab--pos-${pos}`]
  if (isSingleton.value) {
    classes.push('tab--singleton')
  }
  return classes
})

// 5. 切换标签页
const switchTab = (tabName: string): void => {
  emit('update:activeTabName', tabName)
}
</script>

<template>
  <div class="tab" :class="layoutClass" :style="tabSize">
    <div v-if="!isSingleton" class="tab__header">
      <div class="tab__list scrollbar--ghost">
        <div
          v-for="tag in leafData.data"
          :key="tag.tabName"
          class="tab__item"
          :class="{ 'is-active': tag.tabName === leafData.activeTabName }"
          :title="tag.title"
          @click="switchTab(tag.tabName)"
        >
          {{ tag.title }}
        </div>
      </div>
      <button v-if="props.closable" class="tab__close" type="button" @click="emit('close')">
        <svg class="tab__close-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" />
        </svg>
      </button>
    </div>
    <div class="tab__content">
      <div class="tab__content-safety">
        <component :is="currentComponent" v-if="currentComponent" />
        <div v-else class="tab__empty">未找到对应组件: {{ activeTag?.tabName }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab {
  /* ================= 设置中心：颜色变量 ================= */
  --tab-header-bg: var(--color-bg-300);
  --tab-body-bg: var(--color-bg-200);
  --tab-border-color: var(--color-border);
  --tab-border-color-black: var(--color-border-black);
  --tab-text-color: var(--color-text);

  /* ======================================================= */
  --tab-title-size: 13px;
  --tab-icon-size: calc(var(--tab-title-size) * 1.35);

  display: flex;
  min-width: 0;
  background: var(--tab-body-bg);
  overflow: hidden;

  /* ========================= 元素间距与描边 ========================= */
  --m-val: 0;
  margin: calc(var(--m-val) * 1px);
  border: clamp(0.5px, var(--m-val) * 1000px, 1px) solid var(--tab-border-color);

  /* 覆盖行内宽高的限制，让 flex 自己去计算尺寸 */
  width: auto !important;
  height: auto !important;
  flex: 1;
}

/* --- 1. 布局方向控制 --- */
.tab--pos-top {
  flex-direction: column;
}
.tab--pos-bottom {
  flex-direction: column-reverse;
}
.tab--pos-left {
  flex-direction: row;
}
.tab--pos-right {
  flex-direction: row-reverse;
}

/* --- 2. Header & List 基础尺寸与滚动位置 --- */
.tab__header {
  position: relative;
  display: flex;
  justify-content: space-between;
  background: var(--tab-header-bg);
  user-select: none;
  padding: 0;
}
.tab--pos-top .tab__header,
.tab--pos-bottom .tab__header {
  align-items: center;
  height: 32px;
}
.tab--pos-left .tab__header,
.tab--pos-right .tab__header {
  flex-direction: column;
  width: 32px;
}

.tab__list {
  display: flex;
  flex: 1;
  height: 100%;
  box-sizing: border-box;
}

/* 顶部与底部模式滚动 */
.tab--pos-top .tab__list,
.tab--pos-bottom .tab__list {
  overflow-x: auto;
  overflow-x: overlay;
  overflow-y: hidden;
}
/* 顶部模式专属翻转 */
.tab--pos-top .tab__list {
  transform: scaleY(-1);
}
.tab--pos-top .tab__item {
  transform: scaleY(-1);
}

/* 左侧与右侧模式滚动 */
.tab--pos-left .tab__list,
.tab--pos-right .tab__list {
  flex-direction: column;
  overflow-y: auto;
  overflow-y: overlay;
  overflow-x: hidden;
}
/* 左侧模式专属排版方向 */
.tab--pos-left .tab__list {
  direction: rtl;
}
.tab--pos-left .tab__item {
  direction: ltr;
}

/* --- 3. 分割线内阴影 --- */
.tab--pos-top .tab__header {
  box-shadow: inset 0 -1px 0 0 var(--tab-border-color);
}
.tab--pos-bottom .tab__header {
  box-shadow: inset 0 1px 0 0 var(--tab-border-color);
}
.tab--pos-left .tab__header {
  box-shadow: inset -1px 0 0 0 var(--tab-border-color);
}
.tab--pos-right .tab__header {
  box-shadow: inset 1px 0 0 0 var(--tab-border-color);
}

/* --- 4. 标签项 (tab__item) 样式逻辑 --- */
.tab__item {
  position: relative;
  font-size: var(--tab-title-size);
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 12px;
  transition:
    color 0.2s,
    background 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent; /* 完美保留原版：预留边框占位，防止抖动 */
}

/* 侧边模式文字旋转 */
.tab--pos-left .tab__item,
.tab--pos-right .tab__item {
  writing-mode: vertical-rl;
  padding: 12px 4px;
}
.tab__item:hover {
  color: var(--palette-white);
}

/* A. 激活状态标签 */
.tab__item.is-active {
  color: var(--tab-text-color);
  background: var(--tab-body-bg);
  border-color: var(--tab-border-color);
  z-index: 5;
}

/* B. 非激活状态标签：深色边框*/
.tab__item:not(.is-active) {
  border-color: var(--tab-border-color-black);
  z-index: 1;
}

/* C. 去除不必要的边框 (保留黑线只在需要的边缘显示) */
.tab--pos-top .tab__item,
.tab--pos-bottom .tab__item {
  border-top: none;
  border-bottom: none;
}
.tab--pos-left .tab__item,
.tab--pos-right .tab__item {
  border-left: none;
  border-right: none;
}

/* D. 邻居与边缘逻辑：去除多余线条 */
/* --- 上/下 布局模式 (水平排列) --- */
.tab--pos-top .tab__item + .tab__item,
.tab--pos-bottom .tab__item + .tab__item {
  margin-left: -1px;
}
.tab--pos-top .tab__item:first-child,
.tab--pos-bottom .tab__item:first-child {
  border-left-color: transparent !important;
}
.tab--pos-top .tab__item:not(.is-active):has(+ .is-active),
.tab--pos-bottom .tab__item:not(.is-active):has(+ .is-active) {
  border-right-color: transparent;
}
.tab--pos-top .is-active + .tab__item:not(.is-active),
.tab--pos-bottom .is-active + .tab__item:not(.is-active) {
  border-left-color: transparent;
}

/* --- 左/右 布局模式 (垂直排列) --- */
.tab--pos-left .tab__item + .tab__item,
.tab--pos-right .tab__item + .tab__item {
  margin-top: -1px;
}
.tab--pos-left .tab__item:first-child,
.tab--pos-right .tab__item:first-child {
  border-top-color: transparent !important;
}
.tab--pos-left .tab__item:not(.is-active):has(+ .is-active),
.tab--pos-right .tab__item:not(.is-active):has(+ .is-active) {
  border-bottom-color: transparent;
}
.tab--pos-left .is-active + .tab__item:not(.is-active),
.tab--pos-right .is-active + .tab__item:not(.is-active) {
  border-top-color: transparent;
}

/* --- 5. 其他组件样式 --- */
.tab__content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  background: var(--tab-body-bg);
}

.tab__content-safety {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--tab-text-color);
}

.tab__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  pointer-events: none;
}
.tab--pos-top .tab__close,
.tab--pos-bottom .tab__close {
  width: 32px;
  height: 100%;
}
.tab--pos-left .tab__close,
.tab--pos-right .tab__close {
  width: 100%;
  height: 32px;
}
.tab__close:hover {
  color: var(--palette-white);
}

.tab__close-icon {
  width: var(--tab-icon-size);
  height: var(--tab-icon-size);
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  pointer-events: auto;
  cursor: pointer; /* 确保鼠标悬停时依然显示小手 */
}

.tab__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-muted);
  text-align: center;
  padding: 0 10px;
}

/* ================= 滚动条缝隙修补 (轨道画线法) ================= */
/* 巧妙利用局部重写：只在滚动条出现时，让透明轨道自带一根封边线 */

/* 1. 水平排列 (Top / Bottom) */
/* 无论是在顶部还是底部，横向滚动条的物理位置都在内容下方。
   所以给轨道的“上方 (top)”加一条 1px 的内阴影线，刚好和上方的标签相连。*/
.tab--pos-top .tab__list::-webkit-scrollbar-track,
.tab--pos-bottom .tab__list::-webkit-scrollbar-track {
  /* 使用 inset 内阴影画线，绝对不会影响 4px 的轨道厚度 */
  box-shadow: inset 0 1px 0 0 var(--tab-border-color-black) !important;
}

/* 2. 垂直排列：左侧模式 (Left) */
/* 左侧使用了 direction: rtl，纵向滚动条在左侧，它接触标签的面是“右边缘” */
.tab--pos-left .tab__list::-webkit-scrollbar-track {
  box-shadow: inset -1px 0 0 0 var(--tab-border-color-black) !important;
}

/* 3. 垂直排列：右侧模式 (Right) */
/* 正常 ltr，纵向滚动条在右侧，它接触标签的面是“左边缘” */
.tab--pos-right .tab__list::-webkit-scrollbar-track {
  box-shadow: inset 1px 0 0 0 var(--tab-border-color-black) !important;
}
</style>
