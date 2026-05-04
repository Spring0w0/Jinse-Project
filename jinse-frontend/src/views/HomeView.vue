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
        从上到下按李商隐人生阶段展开。左侧标注阶段，右侧展示该时期的代表诗歌。点击卡片即可切换当前学习诗歌。
      </p>

      <div class="relative mx-auto mt-14 max-w-6xl">
        <div class="space-y-16">
          <div v-for="group in timelineGroups" :key="group.stageKey" class="relative grid gap-8 lg:grid-cols-[200px_1fr]">
            <!-- Left: Stage label -->
            <div class="flex flex-col items-center justify-start pt-4 lg:items-end lg:pr-10">
              <div class="sticky top-24 flex flex-col items-center gap-3 lg:items-end">
                <span class="rounded-full bg-primary/10 px-3 py-1 text-xs tracking-[0.2em] text-primary">{{ group.stageOrder }}</span>
                <h3 class="font-serif text-2xl font-bold text-primary lg:text-3xl">{{ group.stageLabel }}</h3>
                <p class="hidden text-sm text-dark/50 lg:block">{{ group.description }}</p>
              </div>
            </div>

            <!-- Right: Poem cards -->
            <div class="space-y-6">
              <article
                v-for="poem in group.poems"
                :key="poem.id"
                class="group cursor-pointer rounded-[28px] border border-primary/10 bg-white/88 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
                @click="handleSelectPoem(poem.id)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-sm text-dark/50">{{ poem.yearRange || poem.dynasty }}</div>
                    <h3 class="mt-2 font-serif text-3xl font-bold text-primary">{{ poem.title }}</h3>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-3 py-1 text-xs"
                    :class="poem.id === currentPoemId ? 'bg-primary text-white' : 'bg-primary/10 text-primary'"
                  >
                    {{ poem.id === currentPoemId ? '当前学习中' : '点击学习' }}
                  </span>
                </div>
                <p class="mt-4 whitespace-pre-line text-base leading-8 text-dark/75">{{ poem.fullText }}</p>
                <p class="mt-4 text-sm leading-7 text-dark/60">{{ poem.summary }}</p>
              </article>
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

const STAGE_ORDER = Object.freeze([
  { key: 'young', order: '第一阶段', label: '早期', desc: '年少游历，初入文坛，崭露诗才' },
  { key: 'middle', order: '第二阶段', label: '壮年', desc: '宦海浮沉，辗转幕府，诗艺大成' },
  { key: 'late', order: '第三阶段', label: '晚期', desc: '阅尽沧桑，诗境愈深，绝唱传世' },
])

const timelineGroups = computed(() => {
  const catalog = getPoemTimeline()
  const groups = []
  for (const stage of STAGE_ORDER) {
    const poems = catalog.filter(p => p.stageKey === stage.key)
    if (poems.length) {
      groups.push({
        stageKey: stage.key,
        stageOrder: stage.order,
        stageLabel: stage.label,
        description: stage.desc,
        poems,
      })
    }
  }
  return groups
})

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
