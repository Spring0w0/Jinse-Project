<template>
  <nav class="fixed left-0 right-0 top-0 z-50 bg-light/90 shadow-md backdrop-blur-sm">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-3">
        <span class="text-2xl font-serif font-bold text-primary">义山诗境</span>
        <div class="hidden items-center gap-2 text-sm text-dark/70 md:flex">
          <span>AI古诗词沉浸式学习平台</span>
          <span class="text-dark/30">|</span>
          <span>当前学习诗歌：</span>
          <span class="font-semibold text-primary">{{ currentPoem?.title || '锦瑟' }}</span>
        </div>
      </RouterLink>

      <div class="hidden items-center gap-6 text-sm lg:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="text-dark/80 transition-colors hover:text-primary"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <button class="text-dark lg:hidden" aria-label="切换菜单" @click="open = !open">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <div v-if="open" class="border-t border-primary/10 bg-light lg:hidden">
      <div class="container mx-auto grid gap-2 px-4 py-3">
        <div class="mb-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-dark/70">
          当前学习诗歌：<span class="font-semibold text-primary">{{ currentPoem?.title || '锦瑟' }}</span>
        </div>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="py-1 text-dark/80 hover:text-primary"
          @click="open = false"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCurrentPoemStore } from '../stores/currentPoem'

const open = ref(false)
const currentPoemStore = useCurrentPoemStore()
const currentPoem = computed(() => currentPoemStore.currentPoem)

onMounted(() => {
  currentPoemStore.initialize()
})

const navItems = [
  { to: '/', label: '首页' },
  { to: '/poem-appreciation', label: '诗句赏析' },
  { to: '/tone-analysis', label: '平仄分析' },
  { to: '/ai-image', label: '诗意生图' },
  { to: '/knowledge-graph', label: '知识图谱' },
  { to: '/quiz', label: '课堂小测' },
  { to: '/similar-poems', label: '相似诗歌' },
]
</script>
