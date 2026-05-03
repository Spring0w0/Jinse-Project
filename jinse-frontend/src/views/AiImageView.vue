<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">AI 诗意生图</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-8">
          <h2 class="mb-2 text-center text-3xl font-serif font-bold text-primary">{{ currentPoem.title }}</h2>
          <p class="mx-auto max-w-3xl text-center leading-8 text-dark/65">
            这里先从当前诗歌中适合图像化学习的诗句切入。涉及典故的句子会说明典故来源；没有典故的句子则直接说明它的表达重点，不做臆造。
          </p>
        </div>

        <div class="mb-8">
          <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">选择诗句</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="(line, idx) in lines"
              :key="line.text"
              type="button"
              class="rounded-lg p-4 text-left transition"
              :class="idx === imageIndex ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-dark/80 hover:bg-primary/15'"
              @click="selectLine(idx)"
            >
              <div class="font-serif text-lg">{{ line.text }}</div>
              <div class="mt-2 text-xs text-dark/55">{{ line.pinyin }}</div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">典故 / 语义说明</h3>
            <div class="rounded-lg bg-primary/5 p-6">
              <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ currentLine.text }}</h4>
              <p class="mb-4 text-dark/60">{{ currentLine.pinyin }}</p>
              <div class="leading-8 text-dark/75">{{ currentLine.story }}</div>
            </div>
          </div>

          <div>
            <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">分镜提示词</h3>
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm text-dark/60">共 {{ pages.length }} 页</span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPageIndex === 0"
                  @click="goPrev"
                >
                  上一页
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPageIndex >= pages.length - 1"
                  @click="goNext"
                >
                  下一页
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-primary/15 bg-white p-6 shadow-sm">
              <div class="mb-3 text-sm text-dark/55">第 {{ currentPageIndex + 1 }} 页</div>
              <p class="leading-8 text-dark/75">{{ currentPage.prompt }}</p>
              <div v-if="currentPage.image_url" class="mt-4 overflow-hidden rounded-lg border border-primary/10">
                <img :src="currentPage.image_url" alt="诗意生图结果" class="h-full w-full object-contain" />
              </div>
              <div v-else class="mt-4 rounded-lg bg-primary/5 p-4 text-sm text-dark/60">
                当前阶段未接入真实出图，这里先展示可直接用于 mock 或后续图像生成的分镜提示词。
              </div>
            </div>

            <div class="mt-4 flex justify-center gap-2">
              <button
                v-for="(_, idx) in pages"
                :key="`page-${idx}`"
                type="button"
                class="h-3 rounded-full transition"
                :class="idx === currentPageIndex ? 'w-6 bg-primary' : 'w-3 bg-primary/30 hover:bg-primary/50'"
                @click="currentPageIndex = idx"
              ></button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getPoemAiImage, loadPoemAiImage } from '../services/poemDataService'
import { useCurrentPoemStore } from '../stores/currentPoem'

const currentPoemStore = useCurrentPoemStore()
const imageIndex = ref(0)
const currentPageIndex = ref(0)

const currentPoem = computed(() => currentPoemStore.currentPoem)
const aiImageData = computed(() => getPoemAiImage(currentPoemStore.currentPoemId))
const lines = computed(() => aiImageData.value.lines || [])
const currentLine = computed(() => lines.value[imageIndex.value] || { text: '', pinyin: '', story: '', pages: [] })
const pages = computed(() => currentLine.value.pages || [])
const currentPage = computed(() => pages.value[currentPageIndex.value] || { prompt: '' })

function selectLine(idx) {
  imageIndex.value = idx
  currentPageIndex.value = 0
}

function goPrev() {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value -= 1
  }
}

function goNext() {
  if (currentPageIndex.value < pages.value.length - 1) {
    currentPageIndex.value += 1
  }
}

watch(() => currentPoemStore.currentPoemId, () => {
  imageIndex.value = 0
  currentPageIndex.value = 0
}, { immediate: true })

watch(() => currentPoemStore.currentPoemId, (poemId) => {
  loadPoemAiImage(poemId)
}, { immediate: true })

onMounted(() => {
  currentPoemStore.initialize()
})
</script>
