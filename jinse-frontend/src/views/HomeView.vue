<template>
  <div class="pt-24 pb-12 px-4">

    <section class="min-h-[68vh] flex items-center">
      <div class="grid w-full items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 class="font-serif text-4xl font-bold leading-tight text-primary md:text-5xl lg:text-6xl">
            <span class="block">锦瑟无端五十弦</span>
            <span class="block">一弦一柱思华年</span>
          </h1>
          <p class="mt-6 max-w-xl text-lg leading-9 text-dark/80 md:text-2xl md:leading-10">
            欢迎来到AI赋能的沉浸式古诗词深度学习平台，让我们一起探索李商隐《锦瑟》的无穷韵味，感受千年文化的魅力。
          </p>
          <div class="mt-10 flex flex-wrap gap-4">
            <RouterLink
              to="/poem-appreciation"
              class="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <i class="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
              开始学习
            </RouterLink>
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

        <div class="flex justify-center lg:justify-end">
          <img
            src="https://p9-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/0e26c01fc4b944e1b02613ddc5428928~tplv-a9rns2rl98-image.image?lk3s=8e244e95&rcl=20260319162001BE28526EE20576683C6E&rrcfp=f06b921b&x-expires=1776500433&x-signature=yGKPHOWZVnIKPB4sPYE0dIW%2BSXc%3D"
            alt="锦瑟诗意图"
            class="w-full max-w-md rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-12 text-center font-serif text-3xl font-bold text-dark">
        <span class="inline-flex items-center gap-2 border-b-2 border-primary pb-2">
          <i class="fa fa-compass text-primary" aria-hidden="true"></i>
          学习路径
        </span>
      </h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <article
          v-for="item in learningPaths"
          :key="item.title"
          class="rounded-xl bg-white/80 p-6 text-center shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <i :class="['fa text-2xl', item.iconClass]" aria-hidden="true"></i>
          </div>
          <h3 class="mb-2 font-serif text-2xl font-bold text-dark">{{ item.title }}</h3>
          <p class="text-lg leading-8 text-dark/70">{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="mt-16 md:mt-20">
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
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

function openChat() {
  chatStore.openPanel()
}

const learningPaths = [
  { iconClass: 'fa-history', title: '背景导入', desc: '了解李商隐生平与创作背景，理解时代语境' },
  { iconClass: 'fa-pencil-square-o', title: '诗句赏析', desc: '逐句解读《锦瑟》，深入理解诗歌内涵' },
  { iconClass: 'fa-picture-o', title: '意象理解', desc: '通过AI生图直观感受诗歌意象与意境' },
  { iconClass: 'fa-sitemap', title: '知识结构化', desc: '通过知识图谱掌握诗歌内在联系与文化脉络' },
  { iconClass: 'fa-check-square-o', title: '测验巩固', desc: '完成课堂小测，检验学习成果' },
]

const featureCards = [
  { iconClass: 'fa-commenting', title: 'AI诗人智能对话', desc: '与李商隐进行跨时空对话，解答诗歌疑问', action: openChat },
  { to: '/poem-appreciation', iconClass: 'fa-book', title: '诗句深度赏析', desc: '逐句解析《锦瑟》，理解诗歌内涵与情感' },
  { to: '/tone-analysis', iconClass: 'fa-music', title: '声律分析', desc: '分析诗歌平仄规律，感受声律之美' },
  { to: '/ai-image', iconClass: 'fa-paint-brush', title: 'AI诗意生图', desc: '将诗句转化为视觉图像，直观感受诗歌意境' },
  { to: '/knowledge-graph', iconClass: 'fa-share-alt', title: '诗词知识图谱', desc: '可视化展示诗歌中的人物、意象、典故等关系' },
  { to: '/quiz', iconClass: 'fa-graduation-cap', title: 'AI课堂小测', desc: '完成互动测验，巩固诗歌知识' },
]
</script>
