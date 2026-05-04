<template>
  <div class="px-4 pb-12 pt-24">
    <section class="relative overflow-hidden rounded-[36px] border border-primary/10 bg-white/80 px-6 py-12 shadow-xl md:px-10 lg:px-14">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,180,140,0.22),_transparent_48%)]"></div>
      <div class="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div class="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-1 text-xs tracking-[0.25em] text-primary">
            LI SHANGYIN TIMELINE
          </div>
          <h1 class="mt-6 max-w-4xl font-serif text-4xl leading-tight text-primary md:text-5xl lg:text-6xl">
            走进李商隐的人生时间线
          </h1>
          <p class="mt-6 max-w-3xl text-lg leading-9 text-dark/75 md:text-xl">
            首页不再只围绕《锦瑟》。这里会用一条时间线，把李商隐在不同人生阶段写下的代表诗作串联起来。点击任意诗歌卡片，即可切换当前学习诗歌并进入对应赏析页面。
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              class="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary/90"
              @click="goToCurrentPoem"
            >
              <i class="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
              继续学习当前诗歌
            </button>
            <button
              type="button"
              class="rounded-lg border-2 border-primary px-6 py-3 font-medium text-primary transition hover:bg-primary/10"
              @click="openChat"
            >
              <i class="fa fa-commenting mr-2" aria-hidden="true"></i>
              与诗人对话
            </button>
          </div>
        </div>

        <div class="rounded-[28px] border border-primary/10 bg-light/70 p-6 shadow-inner">
          <div class="text-sm text-dark/55">当前学习诗歌</div>
          <div class="mt-3 font-serif text-3xl font-bold text-primary">{{ currentPoem.title }}</div>
          <div class="mt-2 text-sm text-dark/55">{{ currentPoem.stageLabel }} · {{ currentPoem.yearRange }}</div>
          <p class="mt-4 whitespace-pre-line text-base leading-8 text-dark/75">{{ currentPoem.fullText }}</p>
        </div>
      </div>
    </section>

    <section class="mt-20">
      <h2 class="text-center font-serif text-3xl font-bold text-dark md:text-4xl">
        <span class="inline-flex items-center gap-2 border-b-2 border-primary pb-2">
          <i class="fa fa-history text-primary" aria-hidden="true"></i>
          李商隐生平与代表诗作
        </span>
      </h2>
      <p class="mx-auto mt-5 max-w-3xl text-center leading-8 text-dark/65">
        时间线如瀑布般展开。中轴代表人生阶段，两侧卡片展示这一时期的代表诗歌全文。点击卡片即可把它设为当前学习诗歌。
      </p>

      <div class="relative mx-auto mt-14 max-w-6xl">
        <div class="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 lg:block"></div>

        <div class="space-y-8 lg:space-y-10">
          <div
            v-for="item in timelinePoems"
            :key="item.id"
            class="relative grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
          >
            <div
              class="order-2 lg:order-none"
              :class="item.side === 'left' ? 'lg:pr-12' : 'lg:col-start-2 lg:pl-12'"
            >
              <article
                class="group cursor-pointer rounded-[28px] border border-primary/10 bg-white/88 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
                @click="handleSelectPoem(item.id)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-sm text-dark/50">{{ item.stageLabel }} · {{ item.yearRange }}</div>
                    <h3 class="mt-2 font-serif text-3xl font-bold text-primary">{{ item.title }}</h3>
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-xs"
                    :class="item.id === currentPoemId ? 'bg-primary text-white' : 'bg-primary/10 text-primary'"
                  >
                    {{ item.id === currentPoemId ? '当前学习中' : '点击学习' }}
                  </span>
                </div>
                <p class="mt-4 whitespace-pre-line text-base leading-8 text-dark/75">{{ item.fullText }}</p>
                <p class="mt-4 text-sm leading-7 text-dark/60">{{ item.summary }}</p>
              </article>
            </div>

            <div class="order-1 flex justify-center lg:order-none">
              <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/15 bg-light shadow-md">
                <div class="text-center">
                  <div class="text-[11px] tracking-[0.22em] text-dark/45">阶段</div>
                  <div class="mt-1 text-sm font-semibold text-primary">{{ item.stageLabel }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-20">
      <h2 class="mb-12 text-center font-serif text-3xl font-bold text-dark">
        <span class="inline-flex items-center gap-2 border-b-2 border-primary pb-2">
          <i class="fa fa-map-signs text-primary" aria-hidden="true"></i>
          功能导航
        </span>
      </h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <component
          v-for="item in featureCards"
          :key="item.title"
          :is="item.to ? 'RouterLink' : 'button'"
          :to="item.to"
          :type="item.to ? undefined : 'button'"
          class="group rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="item.action ? item.action() : undefined"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary transition group-hover:bg-primary/30">
              <i :class="['fa text-xl', item.iconClass]" aria-hidden="true"></i>
            </div>
            <div>
              <h3 class="mb-2 font-serif text-2xl font-bold text-primary">{{ item.title }}</h3>
              <p class="text-lg leading-8 text-dark/70">{{ item.desc }}</p>
            </div>
          </div>
        </component>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useCurrentPoemStore } from '../stores/currentPoem'
import { getPoemTimeline } from '../services/poemDataService'

const router = useRouter()
const chatStore = useChatStore()
const currentPoemStore = useCurrentPoemStore()

const currentPoem = computed(() => currentPoemStore.currentPoem)
const currentPoemId = computed(() => currentPoemStore.currentPoemId)
const timelinePoems = computed(() => getPoemTimeline())

onMounted(() => {
  currentPoemStore.initialize()
})

function openChat() {
  chatStore.openPanel()
}

function goToCurrentPoem() {
  router.push('/poem-appreciation')
}

function handleSelectPoem(poemId) {
  currentPoemStore.setCurrentPoem(poemId)
  router.push('/poem-appreciation')
}

const featureCards = [
  { iconClass: 'fa-commenting', title: 'AI诗人智能对话', desc: '围绕当前学习诗歌与李商隐对话追问。', action: openChat },
  { to: '/poem-appreciation', iconClass: 'fa-book', title: '诗句深度赏析', desc: '进入当前诗歌的逐句赏析页面。' },
  { to: '/tone-analysis', iconClass: 'fa-music', title: '声律分析', desc: '查看当前诗歌的平仄、停顿与朗读建议。' },
  { to: '/ai-image', iconClass: 'fa-paint-brush', title: 'AI诗意生图', desc: '结合当前诗歌典故与意象进行图像化学习。' },
  { to: '/knowledge-graph', iconClass: 'fa-share-alt', title: '诗词知识图谱', desc: '梳理当前诗歌中的典故、意象与情感结构。' },
  { to: '/quiz', iconClass: 'fa-graduation-cap', title: 'AI课堂小测', desc: '完成与当前诗歌相匹配的知识测验。' },
]
</script>
