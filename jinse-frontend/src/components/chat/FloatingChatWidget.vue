<template>
  <div class="pointer-events-none fixed inset-0 z-[65]">
    <ChatPanel :route-context="routeContext" />

    <div class="pointer-events-auto fixed bottom-5 right-4 md:bottom-6 md:right-6">
      <button
        type="button"
        class="group flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_50px_rgba(139,69,19,0.35)] transition hover:-translate-y-1 hover:bg-primary/90"
        @click="togglePanel"
      >
        <i class="fa text-2xl" :class="isOpen ? 'fa-times' : 'fa-commenting'" aria-hidden="true"></i>
      </button>
      <div class="pointer-events-none absolute -top-11 right-0 whitespace-nowrap rounded-full bg-dark px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {{ isOpen ? '收起对话框' : '打开学习助手' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../../stores/chat'
import { useCurrentPoemStore } from '../../stores/currentPoem'
import ChatPanel from './ChatPanel.vue'

const route = useRoute()
const chatStore = useChatStore()
const currentPoemStore = useCurrentPoemStore()

const routeNameLabelMap = {
  home: '首页',
  'poem-appreciation': '诗句赏析',
  'tone-analysis': '平仄分析',
  'ai-image': '诗意生图',
  'knowledge-graph': '知识图谱',
  quiz: '课堂小测',
  'similar-poems': '相似诗歌',
}

const routeContext = computed(() => ({
  name: route.name,
  path: route.path,
  label: routeNameLabelMap[route.name] || route.meta?.title || route.path,
  poemId: currentPoemStore.currentPoemId,
  poemTitle: currentPoemStore.currentPoem?.title || '当前诗歌',
}))

const isOpen = computed(() => chatStore.isOpen)

function togglePanel() {
  chatStore.togglePanel()
}

onMounted(() => {
  chatStore.initialize()
  currentPoemStore.initialize()
})
</script>
