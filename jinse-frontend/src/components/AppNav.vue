<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-light/90 backdrop-blur-sm shadow-md">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="text-primary text-2xl font-serif font-bold">锦瑟</span>
        <span class="hidden md:inline text-dark/70 text-sm">AI古诗词沉浸式学习平台</span>
      </RouterLink>

      <div class="hidden lg:flex items-center gap-6 text-sm">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="text-dark/80 hover:text-primary transition-colors">
          {{ item.label }}
        </RouterLink>
      </div>

      <button class="lg:hidden text-dark" @click="open = !open" aria-label="切换菜单">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <div v-if="open" class="lg:hidden bg-light border-t border-primary/10">
      <div class="container mx-auto px-4 py-3 grid gap-2">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="py-1 text-dark/80 hover:text-primary" @click="open = false">
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)

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

