<template>
  <section class="relative flex-1 min-h-0 w-full py-16 sm:py-20">
    <div class="relative mx-auto flex h-full w-full max-w-5xl flex-col px-4">
      <header class="text-center">
        <h1 class="text-3xl font-serif font-bold text-dark sm:text-4xl">
          <span class="inline-block border-b-2 border-primary pb-2">AI诗人智能对话</span>
        </h1>
      </header>

      <div class="mt-12 flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-xl backdrop-blur-sm">
        <div class="border-b border-primary/20 bg-primary/10 px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span class="text-sm font-serif font-bold text-white">李</span>
            </div>
            <div>
              <p class="text-lg font-serif font-bold text-primary">李商隐</p>
              <p class="text-xs text-dark/60">晚唐诗人 · 正在线</p>
            </div>
          </div>
        </div>

        <div class="flex-1 min-h-0 space-y-6 overflow-y-auto px-6 py-6 scrollbar-hide">
          <div v-for="message in messages" :key="message.id" class="flex">
            <div class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <span class="text-xs font-serif font-bold text-white">{{ message.avatar }}</span>
            </div>
            <div class="max-w-[80%] rounded-lg bg-primary/10 px-4 py-3">
              <p class="text-dark">{{ message.text }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-primary/20 px-6 py-6">
          <div class="mb-4 flex flex-wrap gap-2">
            <button
              v-for="question in quickQuestions"
              :key="question"
              class="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition hover:bg-primary/20"
              type="button"
            >
              {{ question }}
            </button>
          </div>

          <div class="flex">
            <input
              class="flex-1 rounded-l-lg border border-primary/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              type="text"
              placeholder="输入你的问题..."
            />
            <button
              class="inline-flex items-center gap-2 rounded-r-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90"
              type="button"
            >
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2.94 2.94a.75.75 0 0 1 .82-.16l13.5 5.5a.75.75 0 0 1 0 1.38l-13.5 5.5a.75.75 0 0 1-1.01-.9l1.55-4.06a.75.75 0 0 1 .7-.48h5.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 1-.7-.48l-1.55-4.06a.75.75 0 0 1 .2-.8z" />
              </svg>
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const messages = [
  {
    id: 1,
    avatar: '李',
    text: '你好，我是李商隐。很高兴能与你探讨我的诗歌《锦瑟》。你有什么想了解的吗？',
  },
]

const quickQuestions = [
  '《锦瑟》的创作背景是什么？',
  '诗中的“庄生晓梦迷蝴蝶”是什么意思？',
  '你在诗中表达了怎样的情感？',
  '诗中的“锦瑟”有什么象征意义？',
]
</script>
